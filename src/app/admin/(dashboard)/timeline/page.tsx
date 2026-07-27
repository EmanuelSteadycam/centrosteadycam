import { createSupabaseAdminClient } from "@/lib/supabase-server";
import TimelineEntryRow from "./TimelineEntryRow";
import NewEntryForm from "./NewEntryForm";

export const dynamic = "force-dynamic";

export default async function AdminTimelinePage() {
  const supabase = createSupabaseAdminClient();
  const { data: entries, error } = await supabase
    .from("timeline_entries")
    .select("id, year, description, image_url")
    .order("year", { ascending: true });

  const currentYear = new Date().getFullYear();
  const maxYear = entries?.length ? Math.max(...entries.map((e) => e.year)) : currentYear - 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Timeline "La nostra Storia"</h1>
        <span className="text-xs text-gray-400">{(entries ?? []).length} anni</span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
          Errore: {error.message}. La tabella "timeline_entries" esiste su Supabase?
        </div>
      )}

      <NewEntryForm nextYear={maxYear + 1} />

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Anni</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {(!entries || entries.length === 0) && (
            <p className="px-5 py-4 text-sm text-gray-400">Nessun anno inserito.</p>
          )}
          {(entries ?? []).map((entry) => (
            <TimelineEntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
