import Image from "next/image";
import Link from "next/link";
import { getBlogPosts, getFeaturedImageUrl, formatDate, stripHtml } from "@/lib/wordpress";

const heroSections = [
  {
    href: "/display",
    title: "Display",
    desc: "Laboratorio multimediale permanente per scuole",
    bg: "from-blue-900 to-slate-900",
    img: "https://centrosteadycam.it/wp-content/uploads/2017/09/Steadycam-Dispaly-Isole_02.jpg",
  },
  {
    href: "/restart",
    title: "Restart",
    desc: "Sensibilizzazione al gioco d'azzardo",
    bg: "from-emerald-900 to-teal-900",
    img: "https://centrosteadycam.it/wp-content/uploads/BENVENUTI_02.svg",
  },
  {
    href: "/adam",
    title: "ADAM",
    desc: "Archivio digitale azzardo e media",
    bg: "from-purple-900 to-indigo-900",
    img: "",
  },
  {
    href: "/archivio",
    title: "Archivio",
    desc: "Audiovisivi e risorse educative",
    bg: "from-orange-900 to-red-900",
    img: "",
  },
];

export default async function HomePage() {
  const { data: posts } = await getBlogPosts(1, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-navy">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy to-brand-teal/30" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-32">
          <span className="inline-block px-4 py-1.5 bg-brand-teal/20 text-brand-tealLight text-xs font-semibold tracking-widest uppercase rounded-full mb-6 border border-brand-teal/30">
            ASL CN2 — Alba (CN)
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Dove la tecnologia
            <span className="block text-brand-tealLight">promuove salute</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Centro Steadycam dell&apos;ASL CN2 — educazione ai media, promozione della salute digitale,
            laboratori per scuole, famiglie e territorio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/display" className="btn-primary text-base px-8 py-4">
              Visita Display
            </Link>
            <Link href="/blog" className="btn-outline-white text-base px-8 py-4">
              Leggi il Blog
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Projects grid */}
      <section className="py-20 bg-brand-lightGray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">I Nostri Progetti</h2>
            <p className="section-subtitle mx-auto">
              Programmi di educazione digitale e promozione della salute per scuole e famiglie del territorio
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {heroSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${section.bg}`}>
                  {section.img && (
                    <Image
                      src={section.img}
                      alt={section.title}
                      fill
                      className="object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                      unoptimized
                    />
                  )}
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-white text-2xl font-bold mb-2 group-hover:translate-y-0 translate-y-1 transition-transform">
                    {section.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {section.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-white/60 text-xs font-medium uppercase tracking-wider">
                    <span>Scopri</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-brand-teal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "2000", label: "Anno di fondazione" },
              { n: "93+", label: "Articoli pubblicati" },
              { n: "208", label: "Risorse nell'archivio ADAM" },
              { n: "5", label: "Stanze tematiche al Display" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-5xl font-bold mb-2">{stat.n}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest blog posts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-title">Dal Blog</h2>
              <p className="section-subtitle">Notizie, riflessioni e aggiornamenti dal Centro</p>
            </div>
            <Link href="/blog" className="hidden sm:flex items-center gap-2 text-brand-teal font-medium hover:gap-3 transition-all">
              Tutti gli articoli
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const imgUrl = getFeaturedImageUrl(post);
              const excerpt = stripHtml(post.excerpt.rendered).slice(0, 120);
              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="card group">
                  {imgUrl && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={imgUrl}
                        alt={post.title.rendered}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-brand-teal text-xs font-semibold uppercase tracking-wider mb-2">
                      {formatDate(post.date)}
                    </p>
                    <h3
                      className="font-bold text-brand-navy text-lg mb-3 group-hover:text-brand-teal transition-colors line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                    {excerpt && <p className="text-gray-500 text-sm line-clamp-3">{excerpt}</p>}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Link href="/blog" className="btn-primary">
              Tutti gli articoli
            </Link>
          </div>
        </div>
      </section>

      {/* Mission strip */}
      <section className="py-20 bg-brand-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Il nostro metodo</h2>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Dal 2000 il Centro Steadycam promuove riflessioni e interventi su promozione della salute
            e media education, a livello locale, regionale e nazionale, con approcci ludici,
            esperienziali e partecipativi.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-12">
            {[
              {
                icon: "🎮",
                title: "Esperienza",
                desc: "Percorsi didattico-esperienziali attraverso stanze tematiche interattive",
              },
              {
                icon: "🔍",
                title: "Riflessione",
                desc: "Spazio di confronto su emozioni, comportamenti e relazioni digitali",
              },
              {
                icon: "🌐",
                title: "Rete",
                desc: "Collaborazione con scuole, famiglie, ASL e istituzioni del territorio",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-brand-lightGray">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="section-title mb-4">Porta la tua classe al Display</h2>
          <p className="section-subtitle mx-auto mb-8">
            Prenota una visita al laboratorio multimediale permanente per scuole e centri estivi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/display" className="btn-primary">
              Prenota una visita
            </Link>
            <Link href="/contatti" className="btn-secondary">
              Contattaci
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
