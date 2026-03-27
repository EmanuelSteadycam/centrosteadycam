import { createSupabaseServerClient } from "@/lib/supabase-server";
import SlotManager from "@/components/admin/SlotManager";
import BookingsList from "@/components/admin/BookingsList";

export default async function PrenotazioniPage() {
  const supabase = createSupabaseServerClient();

  const [{ data: slots }, { data: bookings }] = await Promise.all([
    supabase
      .from("display_slots")
      .select("*")
      .gte("date", new Date().toISOString().slice(0, 10))
      .order("date", { ascending: true }),
    supabase
      .from("display_bookings")
      .select("*, display_slots(date, time_slot)")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Prenotazioni Display</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Gestione slot */}
        <SlotManager slots={slots ?? []} />

        {/* Lista iscrizioni */}
        <BookingsList bookings={bookings ?? []} />
      </div>
    </div>
  );
}
