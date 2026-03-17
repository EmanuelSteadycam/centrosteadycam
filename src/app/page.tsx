import Image from "next/image";
import Link from "next/link";
import { getBlogPosts, getFeaturedImageUrl, formatDate, stripHtml } from "@/lib/wordpress";
import NavGrid from "@/components/NavGrid";

const WP = "https://centrosteadycam.it/wp-content/uploads";

export default async function HomePage() {
  let posts: Awaited<ReturnType<typeof getBlogPosts>>["data"] = [];
  try {
    const res = await getBlogPosts(1, 6);
    posts = res.data;
  } catch {
    // WP API unavailable at build time — show empty grid
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: 500 }}>
        <Image
          src={`${WP}/2017/09/Steadycam-Dispaly-Storie-03.jpg`}
          alt="Centro Steadycam"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <Image
            src={`${WP}/Logo-steadycam.png`}
            alt="Centro Steadycam"
            width={260}
            height={80}
            className="h-16 w-auto object-contain mb-8 brightness-0 invert"
            unoptimized
          />
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-title font-light text-white uppercase tracking-[0.08em] mb-4">
            Costruiamo progetti e laboratori educativi
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-light max-w-2xl mb-8">
            dove la tecnologia promuove salute
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/display" className="btn-orange">Visita Display</Link>
            <Link href="/blog" className="btn-ghost-white">Blog</Link>
          </div>
        </div>
      </section>

      {/* ── Mission strip ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-title font-light text-cs-charcoal uppercase tracking-[0.06em] mb-6">
            Dal 2000 educhiamo ai media e alla salute digitale
          </h2>
          <p className="text-cs-text text-base leading-relaxed max-w-2xl mx-auto">
            Il Centro Steadycam dell&apos;ASL CN2 di Alba sviluppa percorsi educativi che intrecciano
            media education e promozione della salute, rivolti a scuole, famiglie e operatori
            socio-sanitari del territorio piemontese e nazionale.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm" style={{ color: "#999" }}>
            <span>C.so Michele Coppino 46/A — 12051 Alba (CN)</span>
            <span className="hidden sm:block">·</span>
            <a href="tel:+390173316210" className="hover:text-cs-orange transition-colors">0173 316210</a>
            <span className="hidden sm:block">·</span>
            <a href="mailto:info@progettosteadycam.it" className="hover:text-cs-orange transition-colors">
              info@progettosteadycam.it
            </a>
          </div>
        </div>
      </section>

      {/* ── Latest blog posts ── */}
      <section className="py-16" style={{ background: "#f5f5f5" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-title font-light text-cs-charcoal uppercase tracking-[0.06em]">
              Dal Blog
            </h2>
            <Link href="/blog" className="text-cs-orange text-sm font-title font-semibold uppercase tracking-wider hover:text-cs-orangeHov transition-colors">
              Tutti →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const img    = getFeaturedImageUrl(post);
              const excerpt = stripHtml(post.excerpt.rendered).slice(0, 110);
              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card group bg-white shadow-sm hover:shadow-md transition-shadow">
                  {img && (
                    <div className="overflow-hidden" style={{ aspectRatio: "16/9" }}>
                      <img src={img} alt={post.title.rendered} className="w-full h-full object-cover transition-all duration-300 group-hover:grayscale" />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs font-title font-semibold uppercase tracking-widest mb-2" style={{ color: "#999" }}>
                      {formatDate(post.date)}
                    </p>
                    <h3
                      className="font-title font-semibold text-cs-charcoal text-base leading-snug mb-2 line-clamp-2 group-hover:text-cs-orange transition-colors"
                      dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                    {excerpt && (
                      <p className="text-sm text-cs-text leading-relaxed line-clamp-3">{excerpt}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Nav grid ── */}
      <NavGrid />
    </>
  );
}
