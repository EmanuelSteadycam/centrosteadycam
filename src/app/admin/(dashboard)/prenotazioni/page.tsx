import { createSupabaseServerClient } from "@/lib/supabase-server";
import SlotManager from "@/components/admin/SlotManager";
import BookingsList from "@/components/admin/BookingsList";
import EmailToggle from "@/components/admin/EmailToggle";
import WaitlistToggle from "@/components/admin/WaitlistToggle";

export default async function PrenotazioniPage() {
  const supabase = createSupabaseServerClient();

  const [
    { data: slots },
    { data: bookings },
    { data: emailSettings },
    { data: waitlistSettings },
  ] = await Promise.all([
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
    supabase.from("display_settings").select("value").eq("key", "confirmation_email_enabled").single(),
    supabase.from("display_settings").select("value").eq("key", "waitlist_enabled").single(),
  ]);

  const emailEnabled = emailSettings?.value === "true";
  const waitlistEnabled = waitlistSettings?.value === "true";

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Prenotazioni Display</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <WaitlistToggle enabled={waitlistEnabled} />
        <EmailToggle enabled={emailEnabled} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SlotManager slots={slots ?? []} />
        <BookingsList bookings={bookings ?? []} />
      </div>
    </div>
  );
}
