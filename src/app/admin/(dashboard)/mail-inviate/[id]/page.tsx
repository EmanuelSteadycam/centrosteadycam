export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import MailForm from "./MailForm";

export default async function MailEditPage({ params }: { params: { id: string } }) {
  const isNew = params.id === "nuovo";

  let mail = null;
  if (!isNew) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("id", Number(params.id))
      .eq("type", "newsletter")
      .single();
    if (!data) notFound();
    mail = data;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/mail-inviate" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
          ← Mail inviate
        </Link>
        <h1 className="text-xl font-semibold text-gray-800">
          {isNew ? "Nuova mail" : "Modifica mail"}
        </h1>
      </div>
      <MailForm mail={mail} />
    </div>
  );
}
