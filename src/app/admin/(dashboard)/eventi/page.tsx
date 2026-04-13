export const dynamic = "force-dynamic";

import Link from "next/link";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase-server";
import CreateEventForm from "./CreateEventForm";

export default async function EventiPage() {
  const supabase = createSupabaseServerClient();
  const supabaseAdmin = createSupabaseAdminClient();

  const today = new Date().toISOString().slice(0, 10);

  const { data: events } = await supabase
    .from("events")
    .select("id, name, slug, is_active, created_at")
    .order("created_at", { ascending: false });

  const eventIds = (events ?? []).map((e) => e.id);

  const [{ data: slotCounts }, { data: bookingCounts }] = await Promise.all([
    eventIds.length
      ? supabase.from("event_slots").select("event_id").in("event_id", eventIds).eq("is_open", true).gte("date", today)
      : Promise.resolve({ data: [] }),
    eventIds.length
      ? supabaseAdmin.from("event_bookings").select("event_id").in("event_id", eventIds)
      : Promise.resolve({ data: [] }),
  ]);

  const slotsByEvent: Record<string, number> = {};
  const bookingsByEvent: Record<string, number> = {};
  for (const s of slotCounts ?? []) slotsByEvent[s.event_id] = (slotsByEvent[s.event_id] ?? 0) + 1;
  for (const b of bookingCounts ?? []) bookingsByEvent[b.event_id] = (bookingsByEvent[b.event_id] ?? 0) + 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Eventi</h1>
      </div>

      {/* Riepilogo eventi */}
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-400 mb-6">
        <div className="divide-y divide-gray-50">
          {(events ?? []).length === 0 && (
            <p className="px-5 py-4 text-sm text-gray-400">Nessun evento configurato.</p>
          )}
          {(events ?? []).map((ev) => (
            <Link
              key={ev.id}
              href={`/admin/eventi/${ev.slug}`}
              className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{ev.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${ev.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                  {ev.is_active ? "attivo" : "inattivo"}
                </span>
              </div>
              <div className="flex items-center gap-6 shrink-0 ml-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800 leading-none">{slotsByEvent[ev.id] ?? 0}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">slot aperti</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800 leading-none">{bookingsByEvent[ev.id] ?? 0}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">iscrizioni</p>
                </div>
                <span className="text-gray-300 text-sm">›</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Nuovo evento</h2>
        </div>
        <div className="px-5 py-4">
          <CreateEventForm />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700">Tutti gli eventi</h2>
          <span className="text-xs text-gray-400">{events?.length ?? 0} eventi</span>
        </div>
        <div className="divide-y divide-gray-50">
          {(!events || events.length === 0) && (
            <p className="px-5 py-4 text-sm text-gray-400">Nessun evento configurato.</p>
          )}
          {(events ?? []).map((ev) => (
            <Link
              key={ev.id}
              href={`/admin/eventi/${ev.slug}`}
              className="flex items-center px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{ev.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">/{ev.slug}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">{slotsByEvent[ev.id] ?? 0} slot aperti</p>
                  <p className="text-xs text-yellow-600 mt-0.5">{bookingsByEvent[ev.id] ?? 0} in attesa</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ev.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                  {ev.is_active ? "Attivo" : "Inattivo"}
                </span>
                <span className="text-gray-300 text-sm">›</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
