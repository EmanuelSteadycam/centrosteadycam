import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPosts, getFeaturedImageUrl, formatDate, stripHtml } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Archivio Audiovisivi",
  description: "Archivio dei materiali audiovisivi del Centro Steadycam: video, documentari e risorse multimediali.",
};

export default async function ArchivioPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  // Use blog posts as audiovisual archive (category 19)
  const { data: posts, total, totalPages } = await getPosts({
    page,
    perPage: 16,
    categories: [19],
    embed: true,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-950 to-brand-navy pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="tag mb-4 inline-block">Centro Steadycam</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Archivio</h1>
          <p className="text-white/60 text-lg max-w-2xl">
            {total} risorse: articoli, video e materiali del Centro Steadycam
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => {
            const imgUrl = getFeaturedImageUrl(post);
            const excerpt = stripHtml(post.excerpt.rendered).slice(0, 90);
            return (
              <Link key={post.id} href={`/blog/${post.slug}`} className="card group">
                {imgUrl ? (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={imgUrl}
                      alt={post.title.rendered}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <svg className="w-5 h-5 text-brand-navy ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-orange-900 to-red-900 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-brand-teal text-xs font-semibold uppercase tracking-wider mb-1">
                    {formatDate(post.date)}
                  </p>
                  <h3
                    className="font-bold text-brand-navy text-sm line-clamp-2 group-hover:text-brand-teal transition-colors mb-2"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                  {excerpt && (
                    <p className="text-gray-400 text-xs line-clamp-2">{excerpt}</p>
                  )}
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
                href={`/archivio?page=${page - 1}`}
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
                href={`/archivio?page=${page + 1}`}
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
