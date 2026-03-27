import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient();

  const [{ count: totalePrenotazioni }, { count: slotAperti }, { data: prossime }] =
    await Promise.all([
      supabase.from("display_bookings").select("*", { count: "exact", head: true }),
      supabase.from("display_slots").select("*", { count: "exact", head: true }).eq("is_open", true),
      supabase
        .from("display_slots")
        .select("date, time_slot, bookings_count, max_capacity")
        .gte("date", new Date().toISOString().slice(0, 10))
        .order("date", { ascending: true })
        .limit(3),
    ]);

  const sections = [
    {
      href: "/admin/prenotazioni",
      label: "Prenotazioni",
      description: "Gestisci slot disponibili e visualizza le iscrizioni al Display.",
      color: "border-blue-400",
      stats: [
        { label: "Iscrizioni totali", value: totalePrenotazioni ?? 0 },
        { label: "Slot aperti", value: slotAperti ?? 0 },
      ],
      built: true,
    },
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
              {s.stats && (
                <div className="flex gap-4 mt-3">
                  {s.stats.map((st) => (
                    <div key={st.label}>
                      <p className="text-2xl font-bold text-gray-800 leading-none">{st.value}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">{st.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-gray-300 text-lg ml-4">→</span>
          </Link>
        ))}
      </div>

      {/* Prossime date */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700">Prossime date Display</h2>
          <Link href="/admin/prenotazioni" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
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
