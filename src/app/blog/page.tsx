import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/blog";
import BlogGrid from "@/components/BlogGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notizie, riflessioni e aggiornamenti dal Centro Steadycam sull'educazione digitale e promozione della salute.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

export default async function BlogPage() {
  const { data: posts, total } = await getBlogPosts(1, 100);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-[1000px] mx-auto px-4 pt-[120px] pb-8">
        <div className="flex items-baseline justify-between border-b border-[#1e1e1e]/10 pb-6">
          <h1 className="font-title font-semibold text-[#1e1e1e] uppercase tracking-[0.12em]"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.2rem)" }}>
            Blog
          </h1>
          <span className="text-sm font-title text-[#1e1e1e]/40 uppercase tracking-widest">
            {total} articoli
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1000px] mx-auto px-4 pb-10">
        <BlogGrid posts={posts} />
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
