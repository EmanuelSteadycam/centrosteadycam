import type { Metadata } from "next";
import NavGrid from "@/components/NavGrid";

export const metadata: Metadata = {
  title: "Il Centro — Centro Steadycam",
  description: "Il Centro Steadycam dell'ASL CN2 di Alba: storia, missione e approccio alla media education e promozione della salute.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

export default function IlCentroPage() {
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="page-hero" style={{ height: 500 }}>
        <img
          src={`${WP}/Steadycam_ilCentro3-scaled.jpg`}
          alt="Il Centro"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="page-hero-title">il centro</h1>
      </div>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-title font-light text-cs-charcoal text-2xl uppercase tracking-[0.06em] mb-8 text-center">
            Chi siamo
          </h2>
          <div className="prose prose-sm max-w-none text-cs-text leading-relaxed space-y-6">
            <p>
              Il Centro Steadycam è un servizio dell&apos;ASL CN2 di Alba (Cuneo) che si occupa di
              media education e promozione della salute con ragazzi, insegnanti, educatori e genitori.
            </p>
            <p>
              Fondato nel 1999, il Centro ha sviluppato un approccio originale che utilizza i linguaggi
              dei media — cinema, televisione, internet, videogiochi — come strumenti educativi per
              affrontare i temi della prevenzione e della promozione della salute.
            </p>
            <p>
              Nel corso degli anni il Centro ha realizzato progetti su scala regionale e nazionale,
              collaborando con scuole, ASL, università e istituzioni culturali su temi come le dipendenze,
              il gioco d&apos;azzardo, il cyberbullismo, la saggezza digitale e l&apos;educazione ai media.
            </p>
          </div>
        </div>
      </section>

      <NavGrid exclude="/il-centro" />
    </div>
  );
}
