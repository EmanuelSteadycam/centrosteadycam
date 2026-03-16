import type { Metadata } from "next";
import Link from "next/link";
import { getAdamArchivio, formatDate, stripHtml } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "ADAM — Archivio Digitale Azzardo e Media",
  description: "Archivio di analisi e riflessioni su pubblicità, film, contenuti media legati al gioco d'azzardo. Risorsa educativa del Centro Steadycam.",
};

export default async function AdamPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const { data: items, total, totalPages } = await getAdamArchivio({
    page,
    perPage: 20,
    search,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-brand-navy pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="tag mb-4 inline-block">Centro Steadycam</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ADAM
          </h1>
          <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-3">
            Archivio Digitale Azzardo e Media
          </p>
          <p className="text-white/70 text-lg max-w-2xl mb-8">
            {total} risorse nell&apos;archivio: analisi di pubblicità, film e contenuti media
            legati al gioco d&apos;azzardo. Una risorsa educativa per scuole e operatori.
          </p>

          {/* Search */}
          <form className="flex gap-3 max-w-lg">
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Cerca nell'archivio..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-brand-navy font-medium text-sm rounded-xl hover:bg-white/90 transition-colors"
            >
              Cerca
            </button>
          </form>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Nessun risultato trovato{search ? ` per "${search}"` : ""}.</p>
            <Link href="/adam" className="mt-4 inline-block text-brand-teal hover:underline">
              Vedi tutto l&apos;archivio
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const content = stripHtml(item.content.rendered).slice(0, 300);
              return (
                <article
                  key={item.id}
                  className="group border border-gray-100 rounded-2xl p-6 md:p-8 hover:border-brand-teal/30 hover:shadow-md transition-all duration-300 bg-white"
                >
                  <div className="flex items-start gap-4">
                    {/* Type indicator */}
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2
                          className="font-bold text-brand-navy text-lg group-hover:text-brand-teal transition-colors"
                          dangerouslySetInnerHTML={{ __html: item.title.rendered }}
                        />
                        <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Azzardo & Media
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-3">{formatDate(item.date)}</p>
                      {content && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {content}
                          {item.content.rendered.length > 300 ? "…" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={`/adam?page=${page - 1}${search ? `&search=${search}` : ""}`}
                className="px-4 py-2 text-sm font-medium text-brand-teal border border-brand-teal rounded-lg hover:bg-brand-teal hover:text-white transition-colors"
              >
                ← Precedente
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-gray-500">
              {page} di {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/adam?page=${page + 1}${search ? `&search=${search}` : ""}`}
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
