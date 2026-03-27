"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

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
