import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/blog";
import BlogGrid from "@/components/BlogGrid";
import NewsletterStrip from "@/components/NewsletterStrip";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notizie, riflessioni e aggiornamenti dal Centro Steadycam sull'educazione digitale e promozione della salute.",
};

const WP = "/media";

export default async function BlogPage() {
  const { data: posts, total } = await getBlogPosts(1, 100);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-[1000px] mx-auto px-4 pt-[120px] pb-8">
        <div className="flex items-baseline justify-between border-b border-[#1e1e1e]/10 pb-6">
          <div className="flex items-baseline gap-4">
            <h1 className="font-title font-semibold text-[#1e1e1e] uppercase tracking-[0.12em]"
              style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.2rem)" }}>
              Blog
            </h1>
            <span className="text-sm font-title text-[#1e1e1e]/40 uppercase tracking-widest">
              {total} articoli
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1000px] mx-auto px-4 pb-10">
        <BlogGrid posts={posts} />
      </div>

      {/* Newsletter */}
      <NewsletterStrip />
    </div>
  );
}
