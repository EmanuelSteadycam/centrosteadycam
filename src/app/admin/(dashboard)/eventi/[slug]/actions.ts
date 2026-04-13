"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { sendApprovalEmail, sendRejectionEmail, removeFromDisplayGroup } from "@/lib/mailup";

async function getEventId(slug: string): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("events").select("id").eq("slug", slug).single();
  return data?.id ?? null;
}

export async function addSlot(eventSlug: string, date: string, timeSlot: string, timeStart?: string, timeEnd?: string) {
  const supabase = createSupabaseAdminClient();
  const eventId = await getEventId(eventSlug);
  if (!eventId) return;
  await supabase.from("event_slots").insert({
    event_id: eventId,
    date,
    time_slot: timeSlot,
    time_start: timeStart || null,
    time_end: timeEnd || null,
    max_capacity: 1,
    bookings_count: 0,
    is_open: true,
  });
  revalidatePath(`/admin/eventi/${eventSlug}`);
}

export async function toggleSlot(id: string, isOpen: boolean, eventSlug: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("event_slots").update({ is_open: isOpen }).eq("id", id);
  revalidatePath(`/admin/eventi/${eventSlug}`);
  revalidatePath("/admin");
}

export async function deleteSlot(id: string, eventSlug: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("event_slots").delete().eq("id", id);
  revalidatePath(`/admin/eventi/${eventSlug}`);
}

export async function setWaitlistEnabled(eventSlug: string, enabled: boolean) {
  const supabase = createSupabaseAdminClient();
  const eventId = await getEventId(eventSlug);
  if (!eventId) return;
  await supabase
    .from("event_settings")
    .upsert({ event_id: eventId, key: "waitlist_enabled", value: enabled ? "true" : "false" });
  revalidatePath(`/admin/eventi/${eventSlug}`);
}

export async function setEmailConfirmationEnabled(eventSlug: string, enabled: boolean) {
  const supabase = createSupabaseAdminClient();
  const eventId = await getEventId(eventSlug);
  if (!eventId) return;
  await supabase
    .from("event_settings")
    .upsert({ event_id: eventId, key: "confirmation_email_enabled", value: enabled ? "true" : "false" });
  revalidatePath(`/admin/eventi/${eventSlug}`);
}

export async function approveBooking(id: number, eventSlug: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();

  const { data: booking, error: fetchErr } = await supabase
    .from("event_bookings")
    .select("*, event_slots(date)")
    .eq("id", id)
    .single();

  if (fetchErr || !booking) return { error: fetchErr?.message ?? "Prenotazione non trovata" };

  const { error: updateErr } = await supabase
    .from("event_bookings")
    .update({ status: "confirmed" })
    .eq("id", id);

  if (updateErr) return { error: updateErr.message };

  const slotDate = booking.event_slots?.date;
  if (slotDate) {
    try {
      await sendApprovalEmail({
        nome: booking.nome,
        cognome: booking.cognome,
        email: booking.email,
        istituto: booking.istituto,
        classe: booking.classe,
        n_alunni: booking.n_alunni,
        n_adulti: booking.n_adulti,
        date: slotDate,
      });
    } catch (mailErr) {
      console.error("MailUp approval email failed:", mailErr);
    }
  }

  revalidatePath(`/admin/eventi/${eventSlug}`);
  return { error: null };
}

export async function deleteBooking(id: number, eventSlug: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();

  const { data: booking } = await supabase
    .from("event_bookings")
    .select("email, slot_id, mailup_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("event_bookings").delete().eq("id", id);
  if (error) return { error: error.message };

  if (booking?.slot_id) {
    await supabase.rpc("decrement_event_slot_bookings", { p_slot_id: booking.slot_id });
  }

  if (booking?.email) {
    try {
      await removeFromDisplayGroup(booking.email, booking.mailup_id);
    } catch (err) {
      console.error("MailUp removeFromGroup failed:", err);
    }
  }

  revalidatePath(`/admin/eventi/${eventSlug}`);
  return { error: null };
}

export async function rejectBooking(id: number, eventSlug: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();

  const { data: booking, error: fetchErr } = await supabase
    .from("event_bookings")
    .select("*, event_slots(date)")
    .eq("id", id)
    .single();

  if (fetchErr || !booking) return { error: fetchErr?.message ?? "Prenotazione non trovata" };

  const { error: updateErr } = await supabase
    .from("event_bookings")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (updateErr) return { error: updateErr.message };

  const slotDate = booking.event_slots?.date;
  if (slotDate) {
    try {
      await sendRejectionEmail({
        nome: booking.nome,
        cognome: booking.cognome,
        email: booking.email,
        istituto: booking.istituto,
        classe: booking.classe,
        date: slotDate,
      });
    } catch (mailErr) {
      console.error("MailUp rejection email failed:", mailErr);
    }
  }

  revalidatePath(`/admin/eventi/${eventSlug}`);
  return { error: null };
}

export async function deleteEvent(eventSlug: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const eventId = await getEventId(eventSlug);
  if (!eventId) return { error: "Evento non trovato" };
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { error: error.message };
  revalidatePath("/admin/eventi");
  return { error: null };
}

export async function createEvent(name: string): Promise<{ error: string | null; slug?: string }> {
  const supabase = createSupabaseAdminClient();
  const slug = name
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const { error } = await supabase.from("events").insert({ name, slug });
  if (error) return { error: error.message };
  revalidatePath("/admin/eventi");
  return { error: null, slug };
}
