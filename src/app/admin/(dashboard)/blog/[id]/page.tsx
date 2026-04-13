export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import PostForm from "./PostForm";

export default async function BlogEditPage({ params }: { params: { id: string } }) {
  const isNew = params.id === "nuovo";

  let post = null;
  if (!isNew) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("id", Number(params.id))
      .single();
    if (!data) notFound();
    post = data;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/blog" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
          ← Blog
        </Link>
        <h1 className="text-xl font-semibold text-gray-800">
          {isNew ? "Nuovo articolo" : "Modifica articolo"}
        </h1>
      </div>
      <PostForm post={post} />
    </div>
  );
}
