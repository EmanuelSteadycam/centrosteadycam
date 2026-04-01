"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { sendApprovalEmail, sendRejectionEmail, removeFromDisplayGroup } from "@/lib/mailup";

export async function addSlot(date: string, timeSlot: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("display_slots").insert({
    date,
    time_slot: timeSlot,
    max_capacity: 1,
    bookings_count: 0,
    is_open: true,
  });
  revalidatePath("/admin/prenotazioni");
}

export async function toggleSlot(id: string, isOpen: boolean) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("display_slots").update({ is_open: isOpen }).eq("id", id);
  revalidatePath("/admin/prenotazioni");
  revalidatePath("/admin");
}

export async function deleteSlot(id: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("display_slots").delete().eq("id", id);
  revalidatePath("/admin/prenotazioni");
}

export async function setWaitlistEnabled(enabled: boolean) {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("display_settings")
    .update({ value: enabled ? "true" : "false" })
    .eq("key", "waitlist_enabled");
  revalidatePath("/admin/prenotazioni");
}

export async function setEmailConfirmationEnabled(enabled: boolean) {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("display_settings")
    .update({ value: enabled ? "true" : "false" })
    .eq("key", "confirmation_email_enabled");
  revalidatePath("/admin/prenotazioni");
}

export async function approveBooking(id: number): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();

  // Fetch booking + slot date
  const { data: booking, error: fetchErr } = await supabase
    .from("display_bookings")
    .select("*, display_slots(date)")
    .eq("id", id)
    .single();

  if (fetchErr || !booking) return { error: fetchErr?.message ?? "Prenotazione non trovata" };

  // Update status
  const { error: updateErr } = await supabase
    .from("display_bookings")
    .update({ status: "confirmed" })
    .eq("id", id);

  if (updateErr) return { error: updateErr.message };

  // Send approval email
  const slotDate = booking.display_slots?.date;
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

  revalidatePath("/admin/prenotazioni");
  return { error: null };
}

export async function deleteBooking(id: number): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();

  // Fetch email + slot_id before deleting
  const { data: booking } = await supabase
    .from("display_bookings")
    .select("email, slot_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("display_bookings").delete().eq("id", id);
  if (error) return { error: error.message };

  // Decrementa bookings_count dello slot
  if (booking?.slot_id) {
    await supabase.rpc("decrement_slot_bookings", { p_slot_id: booking.slot_id });
  }

  // Rimuovi dal gruppo MailUp
  if (booking?.email) {
    try {
      await removeFromDisplayGroup(booking.email);
    } catch (err) {
      console.error("MailUp removeFromGroup failed:", err);
    }
  }

  revalidatePath("/admin/prenotazioni");
  return { error: null };
}

export async function rejectBooking(id: number): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();

  const { data: booking, error: fetchErr } = await supabase
    .from("display_bookings")
    .select("*, display_slots(date)")
    .eq("id", id)
    .single();

  if (fetchErr || !booking) return { error: fetchErr?.message ?? "Prenotazione non trovata" };

  const { error: updateErr } = await supabase
    .from("display_bookings")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (updateErr) return { error: updateErr.message };

  const slotDate = booking.display_slots?.date;
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

  revalidatePath("/admin/prenotazioni");
  return { error: null };
}
