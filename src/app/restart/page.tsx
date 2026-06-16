"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const WP   = "https://centrosteadycam.it/wp-content/uploads";
const RED  = "#e63329";
const GRN  = "#3dbb4e";
const ral  = { fontFamily: "var(--font-raleway)" };

/* ── dati fasi ─────────────────────────────────────────────── */
const phases = [
  {
    key: "dlt1",
    label: "Digital\nLive\nTalk",
    num: "#1",
    sub: "Iscrivi la tua classe al Digital Live Talk (DLT)",
    body: [
      `"…una performance live, più pop di una conferenza, più seria di uno show, più divertente di quanto credi".`,
      `Il DLT è realizzato dalla Società di Informazione Scientifica Taxi 1729, che da anni si occupa del tema dell'azzardo attraverso il progetto Fate il nostro gioco ed è rivolto a studenti delle scuole superiori della Regione Piemonte.`,
      `Scarica qui la scheda tecnica della proposta.`,
    ],
    btn: "+ INFO e ISCRIZIONE",
    formUrl: "https://form.jotform.com/70393978018365",
    pdfBtn: null,
  },
  {
    key: "contest",
    label: "Contest",
    num: "Video",
    sub: "Realizza e invia il tuo video",
    body: [
      `Entro il 30 aprile la classe può inviare uno o più video di prevenzione al gioco d'azzardo, ogni video (max 3 minuti, 500 MB, formato .mp4) deve essere stato autoprodotto e realizzato non prima del 2019.`,
    ],
    btn: "+ INFO e ISCRIZIONE",
    formUrl: "https://form.jotform.com/70393925467365",
    pdfBtn: null,
  },
  {
    key: "dlt2",
    label: "Digital\nLive\nTalk",
    num: "#2",
    locked: true,
    sub: "Partecipa al DLT Finale con visione e interviste",
    body: [
      `"Conviene giocare d'azzardo? E se, come dicono tutti, non conviene allora perché giochiamo? Durante questo secondo DLT riprendiamo le fila del discorso iniziato nell'appuntamento precedente e cerchiamo una risposta a queste domande in modo scientifico. Sperimentiamo senza alcun pregiudizio e analizziamo i risultati degli esperimenti con una continua interazione con gli spettatori, cercando di capire perché e in che modo il destino di ogni giocatore è uno solo — ed è già scritto."`,
      `Le classi che si iscriveranno al Contest ed invieranno il video potranno partecipare ad un secondo Digital Live Talk che si terrà il 17 maggio 2022.`,
    ],
    btn: "SBLOCCA",
    formUrl: "https://form.jotform.com/70393925467365",
    pdfBtn: null,
  },
];

/* ── componente fase compatta (colonna laterale) ────────────── */
function PhaseCompact({ phase }: { phase: typeof phases[0] }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4 text-center">
      <div className="font-title font-black text-white uppercase leading-none text-xl tracking-tight whitespace-pre-line">
        {phase.label}
        <br />
        <span style={{ color: RED }}>{phase.num}</span>
        {phase.locked && <span className="inline-block ml-1 text-base">🔒</span>}
      </div>
      <button className="text-[10px] font-black uppercase tracking-widest text-black px-3 py-1.5 whitespace-nowrap"
        style={{ background: GRN }}>
        {phase.btn}
      </button>
    </div>
  );
}

/* ── componente fase attiva (colonna principale) ─────────────── */
function PhaseActive({ phase }: { phase: typeof phases[0] }) {
  return (
    <div className="flex flex-col justify-center h-full px-10 md:px-16 max-w-xl">
      <p className="text-white/40 text-sm mb-2" style={ral}>{phase.label.replace(/\n/g, " ")} {phase.num}</p>
      <h3 className="font-title font-black text-2xl md:text-3xl mb-6 leading-snug"
        style={{ color: RED }}>
        {phase.sub}
      </h3>
      {phase.body.map((p, i) => (
        <p key={i} className="text-white/75 text-sm leading-relaxed mb-4" style={ral}>{p}</p>
      ))}
      <div className="mt-2">
        <button className="text-xs font-black uppercase tracking-widest text-black px-5 py-2.5"
          style={{ background: GRN }}>
          {phase.btn}
        </button>
      </div>
    </div>
  );
}

/* ── linea verticale animata ─────────────────────────────────── */
function GrowLine({ className = "" }: { className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  return (
    <div ref={ref} className={`w-[3px] bg-transparent overflow-hidden ${className}`}>
      <motion.div
        className="w-full bg-white"
        initial={{ height: 0 }}
        animate={inView ? { height: "100%" } : { height: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{ height: "100%" }}
      />
    </div>
  );
}

/* ── accordion interattivo ───────────────────────────────── */
function PhasesAccordion() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <section className="relative" style={{ minHeight: "80vh" }}>
      <div className="flex" style={{ minHeight: "80vh" }}>
        {phases.map((p, i) => {
          const isActive = activeIdx === i;
          const hasActive = activeIdx !== null;

          return (
            <div
              key={p.key}
              className="relative overflow-hidden"
              style={{
                flex: isActive ? "3 1 0%" : "1 1 0%",
                transition: "flex 0.5s cubic-bezier(0.4,0,0.2,1)",
                borderLeft: i > 0 ? "3px solid #fff" : "none",
                cursor: isActive ? "default" : "pointer",
              }}
              onClick={() => { if (!isActive) { setActiveIdx(i); setFormOpen(false); } }}
            >
              {/* ── X chiusura in alto a destra vicino alla linea ── */}
              {isActive && (
                <button
                  className="absolute top-5 z-10 text-white hover:text-white/50 transition-colors text-xl leading-none font-black" style={{ right: 33 }}
                  onClick={(e) => { e.stopPropagation(); setActiveIdx(null); setFormOpen(false); }}
                  aria-label="Chiudi"
                >
                  ✕
                </button>
              )}

              {/* ── pallino timeline in cima ── */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center justify-center"
                style={{
                  width: i === 2 ? 36 : 18,
                  height: i === 2 ? 36 : 18,
                  borderRadius: "50%",
                  background: i === 2 ? "transparent" : "#fff",
                  border: i === 2 ? "2.5px solid #fff" : "none",
                  fontSize: 16,
                }}>
                {i === 2 && "🔒"}
              </div>

              {isActive ? (
                /* ── pannello espanso ── */
                <div className="flex flex-col justify-center h-full px-10 md:px-16 py-16">
                  <p className="font-title font-black text-white uppercase leading-none whitespace-pre-line mb-4"
                    style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}>
                    {p.label}
                    {" "}<span style={{ color: RED }}>{p.num}</span>
                    {p.locked && <span className="ml-1">🔒</span>}
                  </p>
                  <h3 className="font-title font-black mb-6 leading-snug"
                    style={{ color: RED, fontSize: "clamp(1.2rem, 2vw, 1.7rem)" }}>
                    {p.sub}
                  </h3>
                  {p.body.map((para, j) => (
                    <p key={j} className="text-white/75 leading-relaxed mb-4" style={{ ...ral, fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)" }}>{para}</p>
                  ))}
                  {!formOpen ? (
                    <div className="mt-4">
                      <button
                        className="text-xs font-black uppercase tracking-widest text-black px-5 py-2.5"
                        style={{ background: GRN }}
                        onClick={(e) => { e.stopPropagation(); setFormOpen(true); }}
                      >
                        {p.btn}
                      </button>
                    </div>
                  ) : (
                    <div
                      className="mt-6 jotform-scroll"
                      style={{ height: 520, overflowY: "scroll", overflowX: "hidden" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <iframe
                        src={p.formUrl}
                        title={p.sub}
                        className="w-full"
                        style={{ height: 1400, border: "none", display: "block" }}
                        scrolling="no"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              ) : !hasActive ? (
                /* ── stato default: tutti uguali, titolo grande centrato ── */
                <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
                  <h3 className="font-title font-black uppercase leading-none whitespace-pre-line"
                    style={{ fontSize: "clamp(1.8rem, 3.5vw, 3.2rem)" }}>
                    {p.label}
                    <br />
                    <span style={{ color: RED }}>{p.num}</span>
                    {p.locked && <span className="ml-2">🔒</span>}
                  </h3>
                  <button
                    className="text-xs font-black uppercase tracking-widest text-black px-6 py-2.5"
                    style={{ background: GRN }}
                    onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
                  >
                    {p.btn}
                  </button>
                </div>
              ) : (
                /* ── pannello compatto (quando un altro è attivo) ── */
                <div className="flex flex-col items-center justify-center h-full gap-4 px-3 text-center">
                  <div className="font-title font-black text-white uppercase leading-none text-lg tracking-tight whitespace-pre-line">
                    {p.label}
                    <br />
                    <span style={{ color: RED }}>{p.num}</span>
                    {p.locked && <span className="inline-block ml-1 text-base">🔒</span>}
                  </div>
                  <button
                    className="text-[10px] font-black uppercase tracking-widest text-black px-3 py-1.5 whitespace-nowrap"
                    style={{ background: GRN }}
                    onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
                  >
                    {p.btn}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── video autoplay/pause on scroll ─────────────────────── */
function VideoSection() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const cmd = entry.isIntersecting ? "playVideo" : "pauseVideo";
        iframe.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: cmd, args: [] }),
          "*"
        );
      },
      { threshold: 0.3 }
    );

    observer.observe(iframe);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="flex items-center justify-center" style={{ marginTop: 160, paddingBottom: 60 }}>
      <div style={{ width: "75%", maxWidth: 860 }}>
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            ref={iframeRef}
            src="https://www.youtube.com/embed/mSQl-0a64WA?autoplay=0&mute=1&enablejsapi=1"
            title="Restart — Digital Live Talk"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: "none" }}
          />
        </div>
      </div>
    </section>
  );
}

export default function RestartPage() {
  const heroRef  = useRef(null);
  const introRef = useRef(null);
  const introInView = useInView(introRef, { once: true, margin: "-10% 0px" });

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#fff" }}>

      {/* ── 1. HERO ─────────────────────────────────────────── */}
      <section ref={heroRef}
        className="relative flex flex-col items-center justify-center text-center"
        style={{ minHeight: "100vh" }}>

        {/* Logo RESTART */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <Image
            src={`${WP}/RESTART_trasp_newsletter.svg`}
            alt="RESTART"
            width={700}
            height={423}
            className="mx-auto w-[62vw] max-w-[750px] min-w-[320px]"
            unoptimized
            priority
          />
        </motion.div>


        {/* Linea progresso orizzontale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="w-full px-10"
          style={{ maxWidth: "min(90vw, 1100px)" }}
        >
          {/* Label sopra */}
          <div className="flex justify-between mb-10 px-2">
            {/* DLT #1 */}
            <div className="text-left">
              <p className="font-title font-black uppercase leading-tight" style={{ fontSize: "clamp(1rem, 2vw, 1.6rem)" }}>
                Digital<br />Live Talk <span style={{ color: RED }}>#1</span>
              </p>
            </div>
            {/* Contest Video */}
            <div className="text-center">
              <p className="font-title font-black uppercase leading-tight" style={{ fontSize: "clamp(1rem, 2vw, 1.6rem)" }}>
                Contest<br /><span style={{ color: RED }}>Video</span>
              </p>
            </div>
            {/* DLT #2 */}
            <div className="text-right">
              <p className="font-title font-black uppercase leading-tight" style={{ fontSize: "clamp(1rem, 2vw, 1.6rem)" }}>
                Digital<br />Live Talk <span style={{ color: RED }}>#2</span>
              </p>
            </div>
          </div>

          {/* Linea con nodi */}
          <div className="relative flex items-center">
            <span className="font-title font-black text-white/40 mr-5" style={{ fontSize: "clamp(1rem, 2vw, 1.4rem)" }}>{">>"}</span>
            <div className="flex-1 relative" style={{ paddingTop: 14, paddingBottom: 14 }}>
              <div className="h-[3px] bg-white w-full" />
              {/* Nodi */}
              {[0, 50, 100].map((pct, i) => (
                <div key={i}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    left: `${pct}%`,
                    width: i === 2 ? 52 : 20,
                    height: i === 2 ? 52 : 20,
                    background: i === 2 ? "transparent" : "#fff",
                    border: i === 2 ? "2.5px solid #fff" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22,
                  }}>
                  {i === 2 && "🔒"}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── 2. BENVENUTI + INTRO ────────────────────────────── */}
      <section className="relative flex items-stretch" style={{ minHeight: "80vh" }}>
        <GrowLine className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 h-full" />

        {/* Sinistra — testo intro */}
        <motion.div
          ref={introRef}
          initial={{ opacity: 0, x: -40 }}
          animate={introInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col justify-center py-24 pr-8 max-w-xl" style={{ paddingLeft: "max(30px, 6vw)" }}
        >
          <p className="text-xl leading-relaxed mb-5 text-white/80" style={ral}>
            <span style={{ color: RED }}>RE</span>START è un progetto del Centro Steadycam dell&apos;ASL CN2 su iniziativa della Regione Piemonte che si propone di sensibilizzare al Gioco d&apos;azzardo.
          </p>
          <p className="text-xl leading-relaxed mb-5 text-white/80" style={ral}>
            Puoi far partecipare gratuitamente la tua classe alla{" "}
            <span style={{ color: RED }}>prima puntata (#1)</span> del Digital Live Talk: una conferenza spettacolo on-line dinamica ed interattiva sui segreti della matematica e della psicologia del gioco d&apos;azzardo, realizzata dalla Società di Informazione Scientifica{" "}
            <a href="https://www.taxi1729.it" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: RED }}>Taxi 1729.</a>
          </p>
          <p className="text-xl leading-relaxed mb-5 text-white/80" style={ral}>
            In seguito, potrai con la classe produrre un video sul gioco d&apos;azzardo che abbia come obiettivo quello di sensibilizzare i ragazzi tra i 13 e i 16 anni rispetto a questo problema.
          </p>
          <p className="text-xl leading-relaxed mb-8 text-white/80" style={ral}>
            Le classi che invieranno il video potranno partecipare, sempre gratuitamente, alla{" "}
            <span style={{ color: RED }}>seconda puntata (#2)</span> del Digital Live Talk.
          </p>
          <div>
            <a
              href="/Presentazione_Contest_Restart.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-black uppercase tracking-widest text-black px-6 py-3"
              style={{ background: GRN }}
            >
              Scarica la presentazione
            </a>
          </div>
        </motion.div>

        {/* Destra — BENVENUTI */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.7 }}
          className="flex-1 flex items-center justify-center pr-16 pl-8 py-24"
        >
          <Image
            src={`${WP}/BENVENUTI_02.svg`}
            alt="Benvenuti a Restart"
            width={900}
            height={192}
            className="w-full max-w-[860px]"
            unoptimized
          />
        </motion.div>
      </section>

      {/* ── 4. ACCORDION FASI ───────────────────────────────── */}
      <div style={{ marginTop: 120 }}>
        <PhasesAccordion />
      </div>

      {/* ── 8. IMMAGINE ─────────────────────────────────────── */}
      <VideoSection />

      {/* ── 9. LOGHI ────────────────────────────────────────── */}
      <section className="py-20 text-center">
        <Image
          src={`${WP}/LOGHI_4.svg`}
          alt="Partner"
          width={500}
          height={90}
          className="mx-auto mb-16 opacity-90"
          unoptimized
        />
        <div className="text-white/50 text-sm leading-relaxed" style={ral}>
          <p className="font-semibold text-white/80 mb-1">INFO:</p>
          <p>Centro Steadycam — SERD Alba</p>
          <p>0173 316210</p>
          <a href="mailto:info@progettosteadycam.it" className="underline" style={{ color: RED }}>
            info@progettosteadycam.it
          </a>
        </div>
      </section>

      {/* Back */}
      <div className="text-center pb-10">
        <Link href="/i-progetti"
          className="text-xs font-title uppercase tracking-[0.14em] text-white/20 hover:text-white/60 transition-colors">
          ← I progetti
        </Link>
      </div>

    </div>
  );
}
