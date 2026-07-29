import { createSupabaseAdminClient } from "@/lib/supabase-server";
import StaffRow from "./StaffRow";
import NewEntryForm from "./NewEntryForm";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const supabase = createSupabaseAdminClient();
  const { data: members, error } = await supabase
    .from("staff")
    .select("id, name, role, bio, photo_url, sort_order")
    .order("sort_order", { ascending: true });

  const nextSortOrder = members?.length ? Math.max(...members.map((m) => m.sort_order)) + 1 : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Staff</h1>
        <span className="text-xs text-gray-400">{(members ?? []).length} persone</span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
          Errore: {error.message}. La tabella &ldquo;staff&rdquo; esiste su Supabase?
        </div>
      )}

      <NewEntryForm nextSortOrder={nextSortOrder} />

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Persone</h2>
          <p className="text-xs text-gray-400 mt-0.5">Il numero decide la posizione: 1 = in alto a sinistra, poi a scalare (4 per riga)</p>
        </div>
        <div className="divide-y divide-gray-50">
          {(!members || members.length === 0) && (
            <p className="px-5 py-4 text-sm text-gray-400">Nessuna persona inserita.</p>
          )}
          {(members ?? []).map((m) => (
            <StaffRow key={m.id} member={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
