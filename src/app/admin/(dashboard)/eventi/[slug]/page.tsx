export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import SlotManager from "@/components/admin/SlotManager";
import BookingsList from "@/components/admin/BookingsList";
import EmailToggle from "@/components/admin/EmailToggle";
import WaitlistToggle from "@/components/admin/WaitlistToggle";
import DeleteEventButton from "./DeleteEventButton";

export default async function EventoPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseAdminClient();
  const { slug } = params;

  // Fetch event
  const { data: event } = await supabase
    .from("events")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  const today = new Date().toISOString().slice(0, 10);

  const [
    { data: slots },
    { data: bookings },
    { data: emailSettings },
    { data: waitlistSettings },
  ] = await Promise.all([
    supabase
      .from("event_slots")
      .select("*")
      .eq("event_id", event.id)
      .gte("date", today)
      .order("date", { ascending: true }),
    supabase
      .from("event_bookings")
      .select("*, event_slots(date, time_slot, time_start, time_end)")
      .eq("event_id", event.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("event_settings")
      .select("value")
      .eq("event_id", event.id)
      .eq("key", "confirmation_email_enabled")
      .single(),
    supabase
      .from("event_settings")
      .select("value")
      .eq("event_id", event.id)
      .eq("key", "waitlist_enabled")
      .single(),
  ]);

  const emailEnabled = emailSettings?.value === "true";
  const waitlistEnabled = waitlistSettings?.value === "true";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">{event.name}</h1>
        <DeleteEventButton eventSlug={slug} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <WaitlistToggle enabled={waitlistEnabled} eventSlug={slug} />
        <EmailToggle enabled={emailEnabled} eventSlug={slug} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SlotManager slots={slots ?? []} eventSlug={slug} />
        <BookingsList bookings={bookings ?? []} eventSlug={slug} />
      </div>
    </div>
  );
}
