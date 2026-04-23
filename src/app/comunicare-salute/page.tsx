"use client";
import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";

/* ── dati colonne ────────────────────────────────────────── */
const columns = [
  { src: "/CS01@2x.png" },
  { src: "/CS02@2x.png" },
  { src: "/CS03@2x.png" },
  { src: "/CS04@2x.png" },
];

/* righe fantasma: opacità e sfocatura crescenti verso il basso */
const ghostRows = [
  { blur: 14, opacity: 0.35 },
  { blur: 9,  opacity: 0.35 },
  { blur: 4,  opacity: 0.35 },
];

const SIZE = 120;

export default function ComunicareSalutePage() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section
        ref={ref}
        className="flex flex-col items-center justify-center pt-12 pb-20 overflow-hidden"
      >
        {/* 3 righe fantasma */}
        <div className="flex flex-col items-center gap-10 mb-4">
          {ghostRows.map((row, ri) => (
            <motion.div
              key={ri}
              className="flex gap-20 md:gap-32 items-end"
              initial={{ y: -320, opacity: 0 }}
              animate={inView ? { y: 0, opacity: row.opacity } : {}}
              transition={{
                duration: 1.3,
                ease: "easeOut",
                delay: ri * 0.1,
              }}
              style={{ filter: `blur(${row.blur}px)` }}
            >
              {columns.map((col, ci) => (
                <motion.div
                  key={ci}
                  initial={{ y: -320 }}
                  animate={inView ? { y: 0 } : {}}
                  transition={{ duration: 1.3, ease: "easeOut", delay: ri * 0.1 + ci * 0.08 }}
                >
                  <Image src={col.src} alt="" width={SIZE} height={SIZE} unoptimized />
                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Titolo */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="font-title font-black uppercase text-center my-10 tracking-[0.06em]"
          style={{ color: "#1B2E6B", fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
        >
          COMUNICARE SALUTE
        </motion.h1>

        {/* Riga finale — nitida */}
        <motion.div
          className="flex gap-20 md:gap-32 items-end"
          initial={{ y: -320, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1.3, ease: "easeOut", delay: 0.75 }}
        >
          {columns.map((col, ci) => (
            <motion.div
              key={ci}
              initial={{ y: -320 }}
              animate={inView ? { y: 0 } : {}}
              transition={{ duration: 1.3, ease: "easeOut", delay: 0.75 + ci * 0.09 }}
            >
              <Image src={col.src} alt="" width={SIZE} height={SIZE} unoptimized />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── SEZIONE 2: IL PROGETTO ────────────────────────── */}
      <ProgettoSection />

      {/* ── SEZIONE 3: I PARTNER ─────────────────────────── */}
      <PartnerSection />

      {/* ── SEZIONE 4: NON STARE FERMO ───────────────────── */}
      <NonStareFermoSection />

    </div>
  );
}

/* ── sezione IL PROGETTO con scroll animation ────────────── */
function ProgettoSection() {
  const ref = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.5, 1.0],
    [
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      "polygon(0% 0%, 45% 0%,  100% 100%, 0% 100%)",
      "polygon(0% 0%, 0%   0%,  45% 100%, 0% 100%)",
    ]
  );

  const textOpacity = useTransform(scrollYProgress, [0.15, 0.35], [0, 1]);
  const textY       = useTransform(scrollYProgress, [0.15, 0.35], [50, 0]);

  return (
    <section ref={ref} style={{ height: "918px", marginTop: "40px" }}>
      <div className="relative overflow-hidden w-full h-full" onClick={() => setDrawerOpen(false)}>
      <motion.div
        className="flex w-full h-full"
        animate={{ x: drawerOpen ? 300 : 0 }}
        transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
      >

      {/* ── Sinistra: testo ── */}
      <motion.div
        className="w-1/2 flex flex-col justify-center px-16 bg-white"
        style={{ opacity: textOpacity, y: textY }}
      >
        <h2
          className="font-title font-black uppercase mb-6"
          style={{ color: "#1B2E6B", fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
        >
          Il Progetto
        </h2>
        <p className="text-[#1e1e1e]/70 leading-relaxed mb-8" style={{ fontFamily: "var(--font-open-sans)", fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)" }}>
          Le tecnologie digitali hanno cambiato il nostro modo di relazionarci con gli altri e con noi stessi.
          Comunicare salute è un progetto, realizzato con il sostegno della Fondazione CRC, nell&apos;ambito del bando
          Prevenzione e promozione della salute, per costruire messaggi sanitari che condividono questo cambiamento:
          veloci, d&apos;impatto, leggeri ma rigorosi. Creati dai ragazzi insieme agli operatori ASL,
          con l&apos;obiettivo di essere condivisi online e commentati ovunque.
        </p>
        <div>
          <button
            onClick={(e) => { e.stopPropagation(); setDrawerOpen(true); }}
            className="w-10 h-10 flex items-center justify-center text-white rounded-sm"
            style={{ background: "#E8706A", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.4rem", letterSpacing: 0 }}
          >
            i
          </button>
        </div>
      </motion.div>

      {/* ── Destra: parallelogramma ── */}
      <div className="w-1/2 relative overflow-hidden bg-white">
        <motion.div
          style={{
            clipPath,
            position: "absolute",
            inset: 0,
            background: "#E8706A",
          }}
        />
      </div>

      </motion.div>{/* fine contenuto animato */}

      {/* ── Drawer: dettagli progetto ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: 300,
          background: "#E8706A",
          zIndex: 20,
          overflowY: "auto",
          transform: drawerOpen ? "translateX(0)" : "translateX(-300px)",
          transition: "transform 0.35s ease-in-out",
        }}
      >

                {/* X chiudi */}
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="absolute top-5 right-5 text-white/60 hover:text-white text-xl font-light leading-none"
                >
                  ✕
                </button>

                <div className="px-8 pt-10 pb-16" style={{ fontFamily: "var(--font-raleway)" }}>
                  <p className="font-title font-black uppercase text-xs tracking-[0.2em] text-white mb-6">
                    COMUNICARE SALUTE
                  </p>

                  <p className="text-base text-white leading-relaxed mb-4">
                    è un progetto dell&apos;<a href="https://www.aslcn2.it" target="_blank" rel="noopener noreferrer" className="text-[#8ac893] underline">ASL CN2</a>.
                  </p>

                  <p className="text-base text-white leading-relaxed mb-4">
                    L&apos;iniziativa è realizzata con il sostegno della{" "}
                    <a href="https://www.fondazionecrc.it" target="_blank" rel="noopener noreferrer" className="text-[#8ac893] underline">Fondazione CRC</a>
                    {" "}nell&apos;ambito del <strong>bando Prevenzione e promozione della salute</strong>.
                  </p>

                  <p className="text-base text-white leading-relaxed mb-4">
                    Il progetto si propone di aumentare la comunicazione e la relazione tra cittadini ed esperti sanitari,
                    rinnovando strumenti e logiche di promozione della salute tra enti e operatori che se ne occupano.
                    Le tecnologie digitali come elemento centrale in grado di creare relazioni, comunicazioni,
                    competenze e cultura rispetto alla salute.
                  </p>

                  <p className="text-base text-white leading-relaxed mb-6">
                    Il progetto si inserisce nel costrutto delle Tecnologie di Comunità (Rivoltella 2017) secondo cui
                    le tecnologie sono un connettore di relazioni e possono diventare, in modo ragionato e strategico,
                    degli ambienti che costruiscono relazioni comunitarie in grado di orientare pensiero e stili di salute.
                  </p>

                  <p className="font-title font-bold text-sm uppercase tracking-[0.15em] text-white mb-3">
                    OBIETTIVI:
                  </p>
                  <ul className="space-y-3 text-base text-white leading-relaxed">
                    <li>
                      <span className="font-semibold underline">Realizzare</span> una fotografia dell&apos;uso delle tecnologie digitali
                      nell&apos;ambito della prevenzione sanitaria che porti alla definizione di protocolli e piani di sviluppo
                      del marketing sociale delle Aziende Sanitarie e degli enti che se ne occupano.
                    </li>
                    <li>
                      <span className="font-semibold underline">Formare</span> operatori sanitari e scolastici nella produzione di
                      contenuti digitali per la promozione della salute.
                    </li>
                    <li>
                      <span className="font-semibold underline">Produrre</span> materiali di comunicazione sulla salute pensati
                      per i canali digitali: veloci, d&apos;impatto, condivisibili.
                    </li>
                  </ul>
                </div>
      </div>

      </div>
    </section>
  );
}

/* ── partner list ────────────────────────────────────────── */
const partners = [
  { label: "ASL CN2",                                          href: "https://www.aslcn2.it" },
  { label: "FONDAZIONE CRC",                                   href: "https://www.fondazionecrc.it" },
  { label: "CONSORZIO ALBA LANGHE ROERO",                      href: "https://www.sesaler.it/" },
  { label: "CITTÀ DI BRA",                                     href: "https://www.comune.bra.cn.it" },
  { label: "RO&RO",                                            href: "https://centrosteadycam.it/comunicare-salute/#" },
  { label: "LILT",                                             href: "https://www.liltitalia.it" },
  { label: "CREMIT",                                           href: "https://www.cremit.it" },
  { label: "LICEO GOVONE ALBA",                                href: "https://www.iisgovonealba.it/" },
  { label: "LICEO DA VINCI ALBA",                              href: "https://www.davincialba.edu.it/" },
  { label: "IPC PIERA CILLARIO ALBA",                          href: "https://cillarioferrero.edu.it/" },
  { label: "UNIONE DEI COMUNI E COLLINE DI LANGA E DEL BAROLO", href: "http://www.langabarolo.it/Default.aspx" },
];

/* ── sezione I PARTNER ───────────────────────────────────── */
function PartnerSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <section
      className="bg-white"
      style={{ height: "918px", zIndex: 2, position: "sticky", top: 0 }}
    >
      <div className="relative flex overflow-hidden w-full h-full" onClick={() => setDrawerOpen(false)}>

        <motion.div
          className="flex w-full h-full"
          animate={{ x: drawerOpen ? -280 : 0 }}
          transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
        >
        {/* Sinistra: semicerchio verde */}
        <div className="w-1/2 relative overflow-hidden">
          <div style={{
            position: "absolute",
            width: 918,
            height: 918,
            borderRadius: "50%",
            background: "#3BB83F",
            right: 0,
            top: "50%",
            transform: "translate(50%, -50%)",
          }} />
        </div>

        {/* Destra: testo */}
        <div className="w-1/2 flex flex-col justify-center px-16">
          <h2
            className="font-title font-black uppercase mb-6"
            style={{ color: "#1B2E6B", fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
          >
            I Partner
          </h2>
          <p
            className="text-[#1e1e1e]/70 leading-relaxed mb-8"
            style={{ fontFamily: "var(--font-open-sans)", fontSize: "clamp(0.9rem, 1.1vw, 1rem)" }}
          >
            Il progetto è realizzato dall&apos;ASL CN2 grazie al contributo della Fondazione Cassa di Risparmio
            di Cuneo ai sensi del Bando Prevenzione e Promozione Salute 2018 e alla partecipazione di:
            Consorzio Alba-langhe-Roero, Città di Bra – Gestione associata Servizi Sociali, Coop. Soc. Ro&amp;Ro,
            Lega Italiana Lotta Tumori, Cremit (Università Cattolica di Milano), Liceo Classico di Alba,
            Liceo delle Scienze Sociali Da Vinci di Alba, IPC Piera Cillario di Alba,
            Unione dei Comuni e Colline dei Langa e del Barolo.
          </p>
          <div className="flex justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); setDrawerOpen(true); }}
              className="w-10 h-10 flex items-center justify-center text-white rounded-sm"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.4rem", letterSpacing: 0 }}
              style={{ background: "#3BB83F" }}
            >
              i
            </button>
          </div>
        </div>

        </motion.div>{/* fine contenuto animato */}

        {/* ── Drawer partner: scivola da destra ── */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              className="absolute top-0 right-0 h-full z-20 overflow-y-auto"
              style={{ width: 280, background: "#3BB83F" }}
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* X chiudi */}
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-5 left-5 text-white/60 hover:text-white text-xl font-light leading-none"
              >
                ✕
              </button>

              {/* Lista partner */}
              <div className="pt-16">
                {partners.map((p) => (
                  <a
                    key={p.label}
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-6 py-4 text-center no-underline group"
                    style={{ transition: "background 0.2s ease" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(128,128,128,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    }}
                  >
                    <span
                      className="font-title font-black uppercase text-white text-xs tracking-[0.12em] inline-block transition-transform duration-200 group-hover:scale-110"
                    >
                      {p.label}
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}

/* ── SEZIONE 4: NON STARE FERMO ─────────────────────────────────────────── */
function NonStareFermoSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // Le 3 righe: arrivano da sinistra, si fermano al centro, poi escono a destra
  const x1 = useTransform(scrollYProgress, [0.0, 0.25, 0.75, 1.0], ["-90vw", "0vw", "0vw", "90vw"]);
  const x2 = useTransform(scrollYProgress, [0.05, 0.30, 0.75, 1.0], ["-90vw", "0vw", "0vw", "90vw"]);
  const x3 = useTransform(scrollYProgress, [0.10, 0.35, 0.75, 1.0], ["-90vw", "0vw", "0vw", "90vw"]);

  const blue = "#3535cc";

  return (
    <section
      ref={ref}
      style={{ height: "918px", background: "#F5E642", zIndex: 3, position: "relative" }}
      className="flex flex-col justify-center overflow-hidden"
    >
      <div className="max-w-[860px] mx-auto px-12 w-full flex flex-col gap-10">

        {/* Riga 1 — solo testo */}
        <motion.div style={{ x: x1 }}>
          <p style={{
            color: blue,
            fontSize: "clamp(1.4rem, 3vw, 2.1rem)",
            fontFamily: "var(--font-open-sans)",
            fontWeight: 400,
            lineHeight: 1.4,
          }}>
            Questo sito non è fatto per stare fermo.
          </p>
        </motion.div>

        {/* Riga 2 — testo bold + icona razzo a destra */}
        <motion.div style={{ x: x2 }} className="flex items-start justify-between gap-8">
          <p style={{
            color: blue,
            fontSize: "clamp(1.1rem, 2.2vw, 1.55rem)",
            fontFamily: "var(--font-open-sans)",
            fontWeight: 700,
            lineHeight: 1.55,
            flex: 1,
          }}>
            Esplora i video e i meme, scegli quelli che ti fanno più ridere, che ti fanno pensare, che potrebbero piacere o far discutere.
          </p>
          {/* Icona razzo */}
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-1">
            <path d="M10 46 C18 36 28 20 46 10 C44 22 38 32 28 38 Z" fill="#E8706A" />
            <circle cx="28" cy="30" r="4" fill="#F5E642" />
            <path d="M14 40 L10 46 L16 44 Z" fill="#E8706A" />
            <path d="M46 10 L50 8 L48 14 Z" fill="#E8706A" />
          </svg>
        </motion.div>

        {/* Riga 3 — testo link sottolineato + icona freccia a destra */}
        <motion.div style={{ x: x3 }} className="flex items-start justify-between gap-8">
          <p style={{
            color: blue,
            fontSize: "clamp(1.1rem, 2.2vw, 1.55rem)",
            fontFamily: "var(--font-open-sans)",
            fontWeight: 400,
            lineHeight: 1.55,
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            flex: 1,
            cursor: "pointer",
          }}>
            Mandali ai tuoi amici, ai tuoi parenti, ai tuoi peggiori nemici e scopri che cosa ne pensano..
          </p>
          {/* Icona freccia curva (condividi) */}
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-1">
            <path d="M36 16 C28 16 20 20 16 30 C16 22 20 12 34 10 L30 6 L44 12 L36 24 Z" fill="#E8706A" />
            <path d="M16 30 C16 36 20 42 28 44" stroke="#E8706A" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
        </motion.div>

      </div>

      {/* ── 3 triangoli "scorri" in basso, dissolvenza 1-2-3 in loop ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: [0.15, 0.9, 0.15] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.35,
              ease: "easeInOut",
            }}
          >
            <svg width="28" height="18" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L14 15L26 2" stroke={blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
