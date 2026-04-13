import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { BLOG_CATEGORY_ID } from "@/lib/blog";
import BlogPostRow from "./BlogPostRow";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const supabase = createSupabaseAdminClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, slug, title, date, status, featured_image_url")
    .eq("type", "post")
    .contains("categories", [BLOG_CATEGORY_ID])
    .order("date", { ascending: false })
    .limit(200);

  const published = (posts ?? []).filter((p) => p.status === "publish").length;
  const drafts = (posts ?? []).length - published;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Blog</h1>
        <Link
          href="/admin/blog/nuovo"
          className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors"
        >
          + Nuovo articolo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Totale", value: (posts ?? []).length },
          { label: "Pubblicati", value: published },
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
          <h2 className="text-sm font-semibold text-gray-700">Articoli</h2>
          <span className="text-xs text-gray-400">{(posts ?? []).length} articoli</span>
        </div>
        <div className="divide-y divide-gray-50 max-h-[600px] overflow-auto">
          {(!posts || posts.length === 0) && (
            <p className="px-5 py-4 text-sm text-gray-400">Nessun articolo.</p>
          )}
          {(posts ?? []).map((post) => (
            <BlogPostRow key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
