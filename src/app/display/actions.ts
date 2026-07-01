"use server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { sendConfirmationEmail, addToDisplayGroup } from "@/lib/brevo";
import { SupabaseClient } from "@supabase/supabase-js";

async function checkAndEnableWaitlist(supabase: SupabaseClient, eventId: string) {
  const { data: maxSetting } = await supabase
    .from("event_settings")
    .select("value")
    .eq("event_id", eventId)
    .eq("key", "max_bookings")
    .single();

  if (!maxSetting?.value) return;
  const maxBookings = parseInt(maxSetting.value);
  if (isNaN(maxBookings) || maxBookings < 1) return;

  const { count } = await supabase
    .from("event_bookings")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .neq("tipo_visita", "lista_attesa");

  if ((count ?? 0) >= maxBookings) {
    await supabase
      .from("event_settings")
      .upsert({ event_id: eventId, key: "waitlist_enabled", value: "true" });
  }
}

export async function submitBooking(data: {
  slot_id: string | null;
  tipo_visita: string;
  n_alunni: number;
  n_adulti: number;
  disabilita: boolean;
  istituto: string;
  ordine_scuola: string;
  nome: string;
  cognome: string;
  classe: string;
  email: string;
  cellulare: string | null;
  note: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  // Fetch the Display event id
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("slug", "display")
    .single();

  if (!event) return { error: "Evento Display non trovato" };

  const { data: inserted, error } = await supabase
    .from("event_bookings")
    .insert({ ...data, event_id: event.id, status: "pending" })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("cap_reached"))
      return { error: "Le iscrizioni sono esaurite. Iscriviti alla lista d'attesa." };
    return { error: error.message };
  }
  const bookingId = inserted?.id;

  if (data.slot_id) {
    const { data: slotAvailable } = await supabase.rpc("increment_event_slot_bookings", { p_slot_id: data.slot_id });
    if (!slotAvailable) {
      // Slot pieno nel frattempo — annulla la prenotazione appena inserita
      await supabase.from("event_bookings").delete().eq("id", bookingId);
      return { error: "La data selezionata è appena stata prenotata da qualcun altro. Scegli un'altra data." };
    }
  }

  // Controlla se il cap è raggiunto e imposta waitlist automaticamente
  if (data.tipo_visita !== "lista_attesa") {
    await checkAndEnableWaitlist(supabase, event.id);
  }

  // Email e MailUp in background — non bloccano la risposta al client
  void (async () => {
    const { data: slot } = data.slot_id
      ? await supabase.from("event_slots").select("date").eq("id", data.slot_id).single()
      : { data: null };

    const { data: setting } = await supabase
      .from("event_settings")
      .select("value")
      .eq("event_id", event.id)
      .eq("key", "confirmation_email_enabled")
      .single();

    if (!slot || setting?.value !== "true") return;

    try {
      const mailupId = await addToDisplayGroup({
        email: data.email,
        nome: data.nome,
        cognome: data.cognome,
        istituto: data.istituto,
      });
      if (mailupId && bookingId) {
        await supabase.from("event_bookings").update({ mailup_id: mailupId }).eq("id", bookingId);
      }
    } catch (err) {
      console.error("MailUp addToGroup failed:", err);
    }

    try {
      await sendConfirmationEmail({
        nome: data.nome,
        cognome: data.cognome,
        email: data.email,
        istituto: data.istituto,
        classe: data.classe,
        n_alunni: data.n_alunni,
        n_adulti: data.n_adulti,
        date: slot.date,
      });
    } catch (mailErr) {
      console.error("MailUp confirmation email failed:", mailErr);
    }
  })();

  return { error: null, emailError: null };
}
