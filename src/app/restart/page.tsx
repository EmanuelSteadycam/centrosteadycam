import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Restart — Sensibilizzazione al gioco d'azzardo",
  description: "RESTART è un progetto del Centro Steadycam dell'ASL CN2 su iniziativa della Regione Piemonte che si propone di sensibilizzare al Gioco d'azzardo.",
};

const WP_UPLOADS = "https://centrosteadycam.it/wp-content/uploads";

const steps = [
  {
    number: "01",
    title: "Digital Live Talk #1",
    subtitle: "La prima puntata",
    description:
      'Una performance digitale dal vivo realizzata dalla Società Taxi 1729 dedicata alla matematica e alla psicologia del gioco d\'azzardo. Rivolta alle classi delle scuole superiori del Piemonte.',
    icon: `${WP_UPLOADS}/AC01_traspbottone2.svg`,
    mobileIcon: `${WP_UPLOADS}/RESTART_MOBILE_DLT1_4.svg`,
    cta: { label: "Scarica la presentazione", href: `${WP_UPLOADS}/Presentazione_Contest_Restart.pdf` },
    color: "from-emerald-600 to-teal-700",
  },
  {
    number: "02",
    title: "Contest",
    subtitle: "Crea il tuo video",
    description:
      "Produci e invia un video di prevenzione (max 3 min, formato .mp4). Un'occasione per i ragazzi di esprimersi creativamente su temi legati al gioco d'azzardo e alle dipendenze.",
    icon: `${WP_UPLOADS}/AC02_traspbottone2.svg`,
    mobileIcon: `${WP_UPLOADS}/RESTART_MOBILE_CONTEST_2.svg`,
    cta: null,
    color: "from-blue-600 to-indigo-700",
  },
  {
    number: "03",
    title: "Digital Live Talk #2",
    subtitle: "Il gran finale",
    description:
      "Proiezione dei migliori video del contest, interviste e confronto finale. Un momento di condivisione e riflessione comune tra classi, educatori ed esperti.",
    icon: `${WP_UPLOADS}/AC03_traspbottone2.svg`,
    mobileIcon: `${WP_UPLOADS}/RESTART_MOBILE_DLT2_1.svg`,
    cta: null,
    color: "from-purple-600 to-violet-700",
  },
];

export default function RestartPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center bg-gradient-to-br from-gray-900 via-emerald-950 to-teal-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: "30px 30px",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block px-4 py-1.5 bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase rounded-full mb-6 border border-white/20">
              Centro Steadycam × Regione Piemonte
            </span>
            <div className="mb-6">
              <Image
                src={`${WP_UPLOADS}/BENVENUTI_02.svg`}
                alt="Restart"
                width={300}
                height={80}
                className="mx-auto md:mx-0"
                unoptimized
              />
            </div>
            <p className="text-white/70 text-lg leading-relaxed max-w-xl mb-8">
              Un progetto di sensibilizzazione al gioco d&apos;azzardo per le scuole superiori del Piemonte.
              Tre fasi interattive per riflettere, creare e condividere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a
                href={`${WP_UPLOADS}/Presentazione_Contest_Restart.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-white"
              >
                Scarica la presentazione
              </a>
              <Link href="/contatti" className="btn-primary">
                + Info e iscrizione
              </Link>
            </div>
          </div>

          {/* Logo loghi */}
          <div className="flex-shrink-0">
            <Image
              src={`${WP_UPLOADS}/LOGHI_4.svg`}
              alt="Partner Restart"
              width={200}
              height={160}
              className="opacity-70"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* 3 steps */}
      <section className="py-20 bg-brand-lightGray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Come funziona</h2>
            <p className="section-subtitle mx-auto">
              Tre fasi per un percorso completo di educazione e prevenzione
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="card overflow-hidden">
                {/* Colored top */}
                <div className={`bg-gradient-to-r ${step.color} p-8 flex items-center justify-between`}>
                  <div>
                    <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-1">
                      Fase {step.number}
                    </p>
                    <h3 className="text-white text-2xl font-bold">{step.title}</h3>
                    <p className="text-white/80 text-sm mt-1">{step.subtitle}</p>
                  </div>
                  <div className="opacity-30 flex-shrink-0">
                    <span className="text-6xl font-black text-white">{step.number}</span>
                  </div>
                </div>

                {/* Mobile icon */}
                <div className="p-6 border-b border-gray-100 hidden sm:flex justify-center bg-white">
                  <Image
                    src={step.mobileIcon}
                    alt={step.title}
                    width={200}
                    height={120}
                    className="h-28 w-auto object-contain"
                    unoptimized
                  />
                </div>

                {/* Description */}
                <div className="p-8">
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{step.description}</p>
                  {step.cta ? (
                    <a
                      href={step.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm"
                    >
                      {step.cta.label}
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Disponibile dopo iscrizione
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info + contact */}
      <section className="py-20 bg-brand-navy text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Partecipa gratuitamente</h2>
          <p className="text-white/70 text-lg mb-8">
            Il progetto Restart è gratuito per le classi delle scuole superiori del Piemonte.
            Per iscrizioni e informazioni contattaci.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:info@progettosteadycam.it" className="btn-outline-white">
              info@progettosteadycam.it
            </a>
            <a href="tel:+390173316210" className="btn-primary">
              0173 316210
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
