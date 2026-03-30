"use server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export async function submitBooking(data: {
  slot_id: string;
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

  const { error } = await supabase.from("display_bookings").insert({
    ...data,
    tipo_scuola: "pubblica",
    status: "pending",
  });

  if (error) return { error: error.message };

  await supabase.rpc("increment_slot_bookings", { p_slot_id: data.slot_id });

  return { error: null };
}
