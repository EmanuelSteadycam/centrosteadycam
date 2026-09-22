import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import MailRow from "./MailRow";

export const dynamic = "force-dynamic";

export default async function AdminMailPage() {
  const supabase = createSupabaseAdminClient();
  const { data: mails } = await supabase
    .from("posts")
    .select("id, slug, title, date, modified, featured_image_url, newsletter_sent_at")
    .eq("type", "newsletter")
    .order("modified", { ascending: false, nullsFirst: false })
    .limit(200);

  const sent = (mails ?? []).filter((m) => m.newsletter_sent_at).length;
  const drafts = (mails ?? []).length - sent;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Mail inviate</h1>
          <p className="text-xs text-gray-400 mt-1">
            Articoli inviati via email agli iscritti, senza pubblicazione sul sito.
          </p>
        </div>
        <Link
          href="/admin/mail-inviate/nuovo"
          className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors"
        >
          + Nuova mail
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Totale", value: (mails ?? []).length },
          { label: "Inviate", value: sent },
          { label: "Bozze", value: drafts },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg shadow-sm px-4 py-3">
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700">Articoli email</h2>
          <span className="text-xs text-gray-400">{(mails ?? []).length} articoli</span>
        </div>
        <div className="divide-y divide-gray-50 max-h-[600px] overflow-auto">
          {(!mails || mails.length === 0) && (
            <p className="px-5 py-4 text-sm text-gray-400">Nessuna mail ancora.</p>
          )}
          {(mails ?? []).map((mail) => (
            <MailRow key={mail.id} mail={mail} />
          ))}
        </div>
      </div>
    </div>
  );
}
