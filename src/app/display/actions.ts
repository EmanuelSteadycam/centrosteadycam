"use server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { sendConfirmationEmail, addToDisplayGroup } from "@/lib/mailup";

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

  const { data: inserted, error } = await supabase
    .from("display_bookings")
    .insert({ ...data, tipo_scuola: "pubblica", status: "pending" })
    .select("id")
    .single();

  if (error) return { error: error.message };
  const bookingId = inserted?.id;

  if (data.slot_id) {
    await supabase.rpc("increment_slot_bookings", { p_slot_id: data.slot_id });
  }

  // Fetch slot date for the confirmation email (only if slot exists)
  const { data: slot } = data.slot_id
    ? await supabase.from("display_slots").select("date").eq("id", data.slot_id).single()
    : { data: null };

  // Check if confirmation email is enabled
  const { data: setting } = await supabase
    .from("display_settings")
    .select("value")
    .eq("key", "confirmation_email_enabled")
    .single();

  const emailEnabled = setting?.value === "true";

  if (slot && emailEnabled) {
    let mailupId: number | null = null;
    try {
      mailupId = await addToDisplayGroup({
        email: data.email,
        nome: data.nome,
        cognome: data.cognome,
        istituto: data.istituto,
      });
      if (mailupId && bookingId) {
        await supabase
          .from("display_bookings")
          .update({ mailup_id: mailupId })
          .eq("id", bookingId);
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
      const msg = mailErr instanceof Error ? mailErr.message : String(mailErr);
      console.error("MailUp confirmation email failed:", msg);
      return { error: null, emailError: msg };
    }
  }

  return { error: null, emailError: null };
}
