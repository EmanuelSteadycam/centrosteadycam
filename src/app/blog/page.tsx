import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogPosts, getFeaturedImageUrl, formatDate, stripHtml } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notizie, riflessioni e aggiornamenti dal Centro Steadycam sull'educazione digitale e promozione della salute.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const { data: posts, total, totalPages } = await getBlogPosts(page, 12);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-brand-navy pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="tag mb-4 inline-block">Centro Steadycam</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
          <p className="text-white/60 text-lg max-w-2xl">
            {total} articoli su media education, salute digitale e aggiornamenti dal Centro
          </p>
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => {
            const imgUrl = getFeaturedImageUrl(post);
            const excerpt = stripHtml(post.excerpt.rendered).slice(0, 140);
            const isFeatured = i === 0 && page === 1;

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`card group ${isFeatured ? "md:col-span-2 lg:col-span-2" : ""}`}
              >
                {imgUrl && (
                  <div className={`relative overflow-hidden ${isFeatured ? "aspect-[21/9]" : "aspect-[16/9]"}`}>
                    <Image
                      src={imgUrl}
                      alt={post.title.rendered}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-6 md:p-8">
                  <p className="text-brand-teal text-xs font-semibold uppercase tracking-wider mb-3">
                    {formatDate(post.date)}
                  </p>
                  <h2
                    className={`font-bold text-brand-navy group-hover:text-brand-teal transition-colors mb-3 line-clamp-2 ${
                      isFeatured ? "text-2xl md:text-3xl" : "text-xl"
                    }`}
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                  {excerpt && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{excerpt}…</p>
                  )}
                  <div className="mt-4 flex items-center gap-2 text-brand-teal text-sm font-medium">
                    Leggi
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={`/blog?page=${page - 1}`}
                className="px-4 py-2 text-sm font-medium text-brand-teal border border-brand-teal rounded-lg hover:bg-brand-teal hover:text-white transition-colors"
              >
                ← Precedente
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-gray-500">
              Pagina {page} di {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/blog?page=${page + 1}`}
                className="px-4 py-2 text-sm font-medium text-brand-teal border border-brand-teal rounded-lg hover:bg-brand-teal hover:text-white transition-colors"
              >
                Successiva →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
