export const dynamic = "force-dynamic";

import Link from "next/link";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient();
  const supabaseAdmin = createSupabaseAdminClient();

  const today = new Date().toISOString().slice(0, 10);

  const { data: events } = await supabase
    .from("events")
    .select("id, name, slug, is_active")
    .order("created_at", { ascending: true });

  const eventIds = (events ?? []).map((e) => e.id);

  const [{ data: slotCounts }, { data: bookingCounts }, { data: prossime }] =
    await Promise.all([
      eventIds.length
        ? supabase.from("event_slots").select("event_id").in("event_id", eventIds).eq("is_open", true).gte("date", today)
        : Promise.resolve({ data: [] }),
      eventIds.length
        ? supabaseAdmin.from("event_bookings").select("event_id").in("event_id", eventIds)
        : Promise.resolve({ data: [] }),
      supabase
        .from("event_slots")
        .select("date, time_slot, bookings_count, max_capacity")
        .eq("event_id", (events ?? []).find((e) => e.slug === "display")?.id ?? "")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(3),
    ]);

  const slotsByEvent: Record<string, number> = {};
  const bookingsByEvent: Record<string, number> = {};
  for (const s of slotCounts ?? []) slotsByEvent[s.event_id] = (slotsByEvent[s.event_id] ?? 0) + 1;
  for (const b of bookingCounts ?? []) bookingsByEvent[b.event_id] = (bookingsByEvent[b.event_id] ?? 0) + 1;

  const sections = [
    {
      href: "/admin/blog",
      label: "Blog",
      description: "Scrivi e pubblica articoli sul blog del Centro Steadycam.",
      color: "border-emerald-400",
      stats: null,
      built: false,
    },
    {
      href: "/admin/pagine",
      label: "Pagine",
      description: "Modifica i contenuti delle pagine statiche del sito.",
      color: "border-violet-400",
      stats: null,
      built: false,
    },
    {
      href: "/admin/staff",
      label: "Staff",
      description: "Aggiorna i profili dei membri del team.",
      color: "border-amber-400",
      stats: null,
      built: false,
    },
    {
      href: "/admin/home-grid",
      label: "Home Grid",
      description: "Modifica la griglia di progetti nella homepage.",
      color: "border-rose-400",
      stats: null,
      built: false,
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-400 mb-8">Panoramica dell&apos;area di amministrazione.</p>

      {/* Card Eventi — una riga per evento */}
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-400 mb-4">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <span className="text-sm font-semibold text-gray-800">Eventi</span>
            <p className="text-xs text-gray-400 mt-0.5">Gestisci eventi, slot disponibili e iscrizioni.</p>
          </div>
          <Link href="/admin/eventi" className="text-gray-300 text-lg hover:text-gray-500 transition-colors">→</Link>
        </div>
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

      {/* Section cards */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`bg-white rounded-lg shadow-sm border-l-4 ${s.color} px-5 py-4 flex items-start justify-between hover:shadow-md transition-shadow`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-800">{s.label}</span>
                {!s.built && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 uppercase tracking-wide">
                    in costruzione
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{s.description}</p>
            </div>
            <span className="text-gray-300 text-lg ml-4">→</span>
          </Link>
        ))}
      </div>

      {/* Prossime date */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700">Prossime date Display</h2>
          <Link href="/admin/eventi/display" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Gestisci →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {prossime && prossime.length > 0 ? prossime.map((slot) => (
            <div key={`${slot.date}-${slot.time_slot}`} className="px-5 py-3 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-700">
                  {new Date(slot.date + "T00:00:00").toLocaleDateString("it-IT", {
                    weekday: "long", day: "numeric", month: "long"
                  })}
                </span>
                <span className="ml-2 text-xs text-gray-400 capitalize">{slot.time_slot}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                slot.bookings_count >= slot.max_capacity
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-700"
              }`}>
                {slot.bookings_count >= slot.max_capacity
                  ? "Esaurito"
                  : `${slot.bookings_count}/${slot.max_capacity}`}
              </span>
            </div>
          )) : (
            <p className="px-5 py-4 text-sm text-gray-400">Nessuna data configurata.</p>
          )}
        </div>
      </div>
    </div>
  );
}
