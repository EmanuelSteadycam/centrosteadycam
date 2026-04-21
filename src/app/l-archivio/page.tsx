import type { Metadata } from "next";
import NavGrid from "@/components/NavGrid";

export const metadata: Metadata = {
  title: "L'Archivio",
  description: "Archivio storico di materiali audiovisivi del Centro Steadycam: oltre 34.119 schede di programmi televisivi dal 2000 al 2013.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

const topics = [
  "Adolescenza", "Scuola", "Droghe", "Azzardo", "Alcol",
  "Comportamenti a rischio", "Informazione", "Prevenzione",
  "Incidente", "Relazioni", "Sessualità", "Musica", "Disturbi alimentari",
];

export default function ArchivioPage() {
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="page-hero" style={{ height: 500 }}>
        <img
          src={`${WP}/01Steadycam_archivio1-100-1.jpg`}
          alt="L'Archivio"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center">
          <h1 className="page-hero-title mb-6">l&apos;archivio</h1>
          <a
            href="http://progettosteadycam.it/pagine/ita/ricerca.lasso"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sage"
          >
            Archivio storico
          </a>
        </div>
      </div>

      {/* Description */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-title font-light text-cs-charcoal text-2xl uppercase tracking-[0.06em] mb-6">
            Il Centro Steadycam mette a disposizione l&apos;archivio storico
          </h2>
          <p className="text-cs-text text-sm leading-relaxed mb-8">
            Centro Steadycam mette a disposizione l&apos;archivio storico di materiali audiovisivi
            raccolti e archiviati tra il 2000 e il 2013: oltre <strong>34.119 schede</strong> di
            programmi televisivi, documentari, spot pubblicitari e materiali didattici su temi
            di promozione della salute e media education.
          </p>
          <a
            href="http://progettosteadycam.it/pagine/ita/ricerca.lasso"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sage"
          >
            Cerca nell&apos;archivio storico →
          </a>
        </div>
      </section>

      {/* Topic cloud */}
      <section className="py-12" style={{ background: "#f5f5f5" }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="font-title font-semibold text-cs-charcoal uppercase tracking-[0.1em] text-sm mb-8">
            Cerca per argomento
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {topics.map((t) => (
              <a
                key={t}
                href={`http://progettosteadycam.it/pagine/ita/ricerca.lasso?q=${encodeURIComponent(t)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-title font-medium uppercase tracking-wider transition-colors border border-cs-sage text-cs-charcoal hover:bg-cs-sage hover:text-white"
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ADAM archive CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="font-title font-light text-cs-charcoal text-xl uppercase tracking-[0.06em] mb-4">
            Archivio ADAM
          </h3>
          <p className="text-cs-text text-sm leading-relaxed mb-6">
            L&apos;archivio digitale Azzardo e Media raccoglie oltre 200 risorse tra spot pubblicitari,
            film e contenuti media analizzati per l&apos;educazione alla prevenzione del gioco d&apos;azzardo.
          </p>
          <a href="/adam" className="btn-orange">Vai all'Archivio ADAM</a>
        </div>
      </section>

      <NavGrid exclude="/l-archivio" />
    </div>
  );
}
