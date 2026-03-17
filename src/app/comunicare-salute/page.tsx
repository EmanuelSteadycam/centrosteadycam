import type { Metadata } from "next";
import NavGrid from "@/components/NavGrid";

export const metadata: Metadata = {
  title: "Comunicare Salute — Centro Steadycam",
  description: "Comunicare Salute: formazione e comunicazione sulla promozione della salute con il Centro Steadycam.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

export default function ComunicareSalutePage() {
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="page-hero" style={{ height: 500 }}>
        <div className="absolute inset-0 bg-cs-charcoal" />
        <div className="relative z-10 text-center px-4">
          <img
            src={`${WP}/Logo-per-home@3x.png`}
            alt="Comunicare Salute"
            className="h-20 mx-auto mb-6 object-contain"
          />
          <h1 className="page-hero-title">comunicare salute</h1>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-title font-light text-cs-charcoal text-2xl uppercase tracking-[0.06em] mb-8">
            Il progetto
          </h2>
          <div className="text-cs-text text-sm leading-relaxed space-y-6 text-left">
            <p>
              &ldquo;Comunicare Salute&rdquo; è un percorso di formazione sulla comunicazione della salute
              rivolto a operatori socio-sanitari, insegnanti e professionisti che lavorano in ambito educativo
              e preventivo.
            </p>
            <p>
              Il progetto esplora le modalità di comunicazione più efficaci per raggiungere adolescenti e
              giovani adulti sui temi della promozione della salute, delle dipendenze e del benessere,
              attraverso i linguaggi audiovisivi e digitali.
            </p>
            <p>
              Per informazioni e iscrizioni contattaci:
            </p>
          </div>
          <div className="mt-8">
            <a href="mailto:info@progettosteadycam.it" className="btn-orange">
              info@progettosteadycam.it
            </a>
          </div>
        </div>
      </section>

      <NavGrid exclude="/comunicare-salute" />
    </div>
  );
}
