import type { Metadata } from "next";
import NavGrid from "@/components/NavGrid";

export const metadata: Metadata = {
  title: "Il Metodo — Centro Steadycam",
  description: "Il metodo di lavoro del Centro Steadycam: media education, promozione della salute e approccio laboratoriale.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

export default function IlMetodoPage() {
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="page-hero" style={{ height: 500 }}>
        <img
          src={`${WP}/Steadycam_metodo-scaled.jpg`}
          alt="Il Metodo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="page-hero-title">il metodo</h1>
      </div>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-title font-light text-cs-charcoal text-2xl uppercase tracking-[0.06em] mb-8 text-center">
            Come lavoriamo
          </h2>
          <div className="prose prose-sm max-w-none text-cs-text leading-relaxed space-y-6">
            <p>
              L&apos;approccio di Steadycam si fonda sull&apos;intreccio tra media education e promozione
              della salute: i media non sono solo oggetto di analisi critica, ma diventano strumenti
              attivi di apprendimento, espressione e cambiamento.
            </p>
            <p>
              I laboratori del Centro utilizzano linguaggi audiovisivi, interattivi e digitali per
              favorire la riflessione, il confronto e lo sviluppo di competenze critiche e creative
              nei ragazzi, negli insegnanti e negli operatori.
            </p>
            <p>
              Ogni intervento viene progettato insieme ai partner educativi, tenendo conto del
              contesto, delle esigenze specifiche e degli obiettivi di prevenzione e promozione
              della salute.
            </p>
          </div>
        </div>
      </section>

      <NavGrid exclude="/il-metodo" />
    </div>
  );
}
