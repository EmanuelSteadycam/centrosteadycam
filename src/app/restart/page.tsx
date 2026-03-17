import type { Metadata } from "next";
import NavGrid from "@/components/NavGrid";

export const metadata: Metadata = {
  title: "Restart — Sensibilizzazione al gioco d'azzardo",
  description: "RESTART è un progetto del Centro Steadycam dell'ASL CN2 su iniziativa della Regione Piemonte che si propone di sensibilizzare al gioco d'azzardo.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

const steps = [
  {
    n: "01",
    title: "Digital Live Talk #1",
    subtitle: "Iscrivi la tua classe",
    desc: "Una performance live, più pop di una conferenza, realizzata dalla Società Taxi 1729 dedicata alla matematica e alla psicologia del gioco d'azzardo. Rivolta alle classi delle scuole superiori del Piemonte.",
    note: "Partecipazione gratuita",
    jotformId: "70393978018365",
    img: `${WP}/RESTART_MOBILE_DLT1_4.svg`,
  },
  {
    n: "02",
    title: "Contest",
    subtitle: "Realizza e invia il tuo video",
    desc: "Produci e invia un video di prevenzione: max 3 minuti, 500MB, formato .mp4, realizzato dopo il 2019, produzione propria. Deadline: 30 aprile.",
    note: "Aperto a classi iscritte al DLT",
    jotformId: "70393925467365",
    img: `${WP}/RESTART_MOBILE_CONTEST_2.svg`,
  },
  {
    n: "03",
    title: "Digital Live Talk #2",
    subtitle: "Il finale",
    desc: "Proiezione dei migliori video del contest, interviste e confronto finale. Accessibile alle classi che hanno inviato il video entro la scadenza.",
    note: "17 maggio 2022",
    jotformId: null,
    img: `${WP}/RESTART_MOBILE_DLT2_1.svg`,
  },
];

export default function RestartPage() {
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <section className="relative overflow-hidden flex items-center justify-center" style={{ minHeight: 500, background: "#1a1a2e" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)", backgroundSize: "30px 30px" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-24 text-center">
          <img
            src={`${WP}/BENVENUTI_02.svg`}
            alt="Restart"
            className="h-16 md:h-20 mx-auto mb-6 object-contain"
          />
          <p className="text-white/70 text-base md:text-lg font-light max-w-2xl mx-auto mb-3 leading-relaxed">
            RESTART è un progetto del Centro Steadycam dell&apos;ASL CN2 su iniziativa della Regione Piemonte
            che si propone di sensibilizzare al Gioco d&apos;azzardo.
          </p>
          <p className="text-white/50 text-sm mb-10">Partecipazione gratuita per le classi del Piemonte</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`${WP}/Presentazione_Contest_Restart.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost-white"
            >
              Scarica la presentazione
            </a>
            <a
              href={`https://www.fateilnostrogioco.it/wp-content/uploads/2021/01/Scheda_DLT-Fing.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-orange"
            >
              Scheda tecnica DLT
            </a>
          </div>
          <div className="mt-10">
            <img
              src={`${WP}/LOGHI_4.svg`}
              alt="Partner Restart"
              className="h-12 mx-auto object-contain opacity-50"
            />
          </div>
        </div>
      </section>

      {/* 3 steps */}
      <section className="py-16" style={{ background: "#f5f5f5" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-title font-light text-cs-charcoal text-2xl uppercase tracking-[0.06em] text-center mb-12">
            Come funziona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.n} className="bg-white shadow-sm overflow-hidden">
                {/* Step header */}
                <div className="p-6 flex items-start gap-4" style={{ background: "#3f424a" }}>
                  <span className="text-5xl font-title font-light text-white/20 leading-none">{step.n}</span>
                  <div>
                    <p className="text-white/50 text-xs font-title uppercase tracking-widest mb-1">Fase {step.n}</p>
                    <h3 className="text-white font-title font-semibold text-lg">{step.title}</h3>
                    <p className="text-white/60 text-xs mt-0.5">{step.subtitle}</p>
                  </div>
                </div>

                {/* SVG icon */}
                <div className="p-6 border-b border-gray-100 flex justify-center" style={{ background: "#fafafa" }}>
                  <img src={step.img} alt={step.title} className="h-24 object-contain" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-cs-text text-sm leading-relaxed mb-4">{step.desc}</p>
                  <p className="text-xs font-title uppercase tracking-wider mb-5" style={{ color: "#a3d39c" }}>
                    {step.note}
                  </p>
                  {step.jotformId ? (
                    <a
                      href={`#form-${step.n}`}
                      className="btn-orange text-xs"
                    >
                      + Info e iscrizione
                    </a>
                  ) : (
                    <span className="text-xs font-title uppercase tracking-wider px-4 py-2 border border-gray-200 text-gray-400 cursor-not-allowed">
                      🔒 Sblocca dopo il contest
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JotForm embeds */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 space-y-16">
          {steps.filter((s) => s.jotformId).map((step) => (
            <div key={step.n} id={`form-${step.n}`}>
              <h3 className="font-title font-light text-cs-charcoal text-xl uppercase tracking-[0.06em] mb-6 text-center">
                {step.title} — Iscrizione
              </h3>
              <iframe
                src={`https://form.jotform.com/${step.jotformId}`}
                title={`Iscrizione ${step.title}`}
                width="100%"
                height="600"
                style={{ border: "none" }}
                scrolling="yes"
              />
            </div>
          ))}
        </div>
      </section>

      <NavGrid />
    </div>
  );
}
