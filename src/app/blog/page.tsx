import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts, getFeaturedImageUrl, formatDate, stripHtml } from "@/lib/wordpress";
import type { WPPost } from "@/types/wordpress";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notizie, riflessioni e aggiornamenti dal Centro Steadycam sull'educazione digitale e promozione della salute.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

// Cobbles pattern: alternating tile sizes to mimic Essential Grid
function BlogGrid({ posts }: { posts: WPPost[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 auto-rows-[200px] md:auto-rows-[220px]">
      {posts.map((post, i) => {
        const img     = getFeaturedImageUrl(post);
        const excerpt = stripHtml(post.excerpt.rendered).slice(0, 100);
        // Every 5 posts: first is 2-wide, third is 2-tall
        const pattern = i % 5;
        const colSpan = pattern === 0 ? "col-span-2 md:col-span-2" : "col-span-1";
        const rowSpan = pattern === 2 ? "row-span-2" : "row-span-1";

        return (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className={`blog-card group relative overflow-hidden ${colSpan} ${rowSpan}`}
          >
            {img ? (
              <img
                src={img}
                alt={post.title.rendered}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-400 group-hover:grayscale"
              />
            ) : (
              <div className="absolute inset-0 bg-cs-charcoal" />
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100">
              <p className="text-white/60 text-xs font-title uppercase tracking-widest mb-1">
                {formatDate(post.date)}
              </p>
              <h3
                className="text-white font-title font-semibold text-sm leading-snug line-clamp-3"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
              {excerpt && pattern === 0 && (
                <p className="text-white/70 text-xs mt-1 line-clamp-2">{excerpt}</p>
              )}
            </div>
            {/* Always-visible title strip at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 group-hover:opacity-0 transition-opacity">
              <h3
                className="text-white font-title font-medium text-xs leading-snug line-clamp-2"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function BlogPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page) || 1;
  const { data: posts, total, totalPages } = await getBlogPosts(page, 20);

  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="page-hero" style={{ height: 300 }}>
        <img
          src={`${WP}/2017/09/Steadycam-Dispaly-Storie-03.jpg`}
          alt="Blog"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="page-hero-title text-5xl md:text-6xl">blog</h1>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-xs font-title text-cs-textLight uppercase tracking-widest mb-6">
          {total} articoli
        </p>
        <BlogGrid posts={posts} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            {page > 1 && (
              <Link href={`/blog?page=${page - 1}`} className="btn-orange text-xs px-4 py-2">
                ← Precedente
              </Link>
            )}
            <span className="text-sm text-cs-textLight font-title">{page} / {totalPages}</span>
            {page < totalPages && (
              <Link href={`/blog?page=${page + 1}`} className="btn-orange text-xs px-4 py-2">
                Successiva →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Newsletter strip */}
      <section className="py-12 bg-cs-charcoal text-white text-center">
        <p className="text-sm font-light mb-2 opacity-70">Brrr.. Inserisci nome e indirizzo mail</p>
        <p className="text-lg font-title font-light uppercase tracking-widest mb-6">
          Iscriviti alla Newsletter
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto px-4">
          <input type="text" placeholder="Nome" required
            className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50" />
          <input type="email" placeholder="Email" required
            className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50" />
          <button type="submit" className="btn-orange whitespace-nowrap">Iscriviti</button>
        </form>
        <p className="text-xs mt-4 opacity-40">psss. se non li trovi controlla anche la spam..!</p>
      </section>
    </div>
  );
}
