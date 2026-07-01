"use client";
import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";

/* ── video playlist sez5 ────────────────────────────────── */
const videosList = [
  { id: "LpxYdtVTRjo", title: "HEITU",                              duration: "0:20" },
  { id: "dwMvOqLnQ3Y", title: "EROI",                               duration: "0:40" },
  { id: "bfkER6z8vg4", title: "NON SEI SAZIO?",                     duration: "0:38" },
  { id: "E3mNSY_zbB8", title: "Different perspective SPOT SERD ASLCN2", duration: "1:09" },
  { id: "a3UTyQC6wvo", title: "TI SENTI LIBERO?",                   duration: "1:15" },
  { id: "GfUFnFUW2Go", title: "NON GETTARE LA MASCHERA",            duration: "0:32" },
  { id: "Gn7FU3RQ5Wo", title: "CHI SEI?",                           duration: "0:37" },
  { id: "5z3O1a3-SbE", title: "NoExcuse Story 00",                  duration: "0:56" },
  { id: "n2fGiNfV3do", title: "NoExcuse Story 01",                  duration: "0:17" },
  { id: "VSOuaIbFHoY", title: "NoExcuse Story 02",                  duration: "0:19" },
  { id: "qSsJ_6WTV6g", title: "NoExcuse Story 03",                  duration: "0:18" },
  { id: "71TTnaMrz18", title: "NoExcuse Story 04",                  duration: "0:21" },
  { id: "ijI5CY4DafQ", title: "NoExcuse Story 05",                  duration: "0:16" },
  { id: "v69TbXU6I4k", title: "NoExcuse Story 06",                  duration: "0:16" },
];

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

      {/* ── SEZIONI 2+3: container condiviso ─────────────── */}
      {/* sez3 (sotto, sticky) + sez2 (sopra, assoluta) */}
      <div style={{ position: "relative", marginTop: "40px" }}>
        <PartnerSection />
        <ProgettoSection />
      </div>

      {/* ── SEZIONE 4: NON STARE FERMO ───────────────────── */}
      <NonStareFermoSection />

      {/* ── SEZIONE 5: VIDEO ─────────────────────────────── */}
      <VideoSection />


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
    <section ref={ref} style={{ height: "918px", position: "absolute", top: 0, left: 0, right: 0, zIndex: 2 }}>
      <div className="relative overflow-hidden w-full h-full" onClick={() => setDrawerOpen(false)}>
      <motion.div
        className="flex w-full h-full"
        animate={{ x: drawerOpen ? 300 : 0 }}
        transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
      >

      {/* ── Sinistra: testo ── */}
      <div className="w-1/2 flex flex-col justify-center px-16 bg-white overflow-hidden">
        <motion.div style={{ opacity: textOpacity, y: textY }}>
          <h2
            className="font-title font-black uppercase mb-6"
            style={{ color: "#1B2E6B", fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
          >
            Il Progetto
          </h2>
          <p className="text-[#1e1e1e]/70 leading-relaxed mb-8" style={{ fontFamily: "var(--font-poppins)", fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)" }}>
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
      </div>

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
    <div style={{ height: "calc(250vh + 958px)", position: "relative" }}>
      <div
        style={{ position: "sticky", top: 0, height: "100vh", display: "flex", background: "white", zIndex: 1 }}
        onClick={() => setDrawerOpen(false)}
      >
        {/* Sinistra: semicerchio verde — fisso, no animazione */}
        <div style={{ width: "50%", position: "relative", overflow: "hidden", flexShrink: 0 }}>
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
        <motion.div
          style={{ width: "50%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 4rem" }}
          animate={{ x: drawerOpen ? -280 : 0 }}
          transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
        >
          <h2
            className="font-title font-black uppercase mb-6"
            style={{ color: "#1B2E6B", fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
          >
            I Partner
          </h2>
          <p
            className="text-[#1e1e1e]/70 leading-relaxed mb-8"
            style={{ fontFamily: "var(--font-poppins)", fontSize: "clamp(0.9rem, 1.1vw, 1rem)" }}
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
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.4rem", letterSpacing: 0, background: "#3BB83F" }}
            >
              i
            </button>
          </div>
        </motion.div>

        {/* Drawer partner */}
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
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-5 left-5 text-white/60 hover:text-white text-xl font-light leading-none"
              >
                ✕
              </button>
              <div className="pt-16">
                {partners.map((p) => (
                  <a
                    key={p.label}
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-6 py-4 text-center no-underline group"
                    style={{ transition: "background 0.2s ease" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(128,128,128,0.5)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                  >
                    <span className="font-title font-black uppercase text-white text-xs tracking-[0.12em] inline-block transition-transform duration-200 group-hover:scale-110">
                      {p.label}
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

/* ── SEZIONE 5: VIDEO ────────────────────────────────────────────────────── */
function VideoSection() {
  const [activeId, setActiveId] = useState(videosList[0].id);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 0.25, 1], ["30vh", "0vh", "0vh"]);
  const violet = "#6565EF";
  const WP = "/wp-content/uploads";
  const allMemes = [
    ...Array.from({ length: 16 }, (_, i) => `${WP}/CS-meme-alcol${i + 1}.jpg`),
    ...Array.from({ length: 17 }, (_, i) => `${WP}/CS-meme-tabacco${i + 1}.jpg`),
    ...Array.from({ length: 8 }, (_, i) => `${WP}/CS-meme-tecnologie${i + 1}.jpg`),
    `${WP}/MS-serd-meme01.jpg`,
    `${WP}/MS-serd-meme02.jpg`,
  ];

  return (
    <div
      ref={sectionRef}
      style={{
        position: "relative",
        zIndex: 4,
        backgroundColor: "white",
        backgroundImage: `url("/CS04@2x.png")`,
        backgroundAttachment: "fixed",
        backgroundSize: "168vh",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        paddingBottom: "80px",
      }}
    >
      <motion.div style={{ y, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "120px" }}>

        {/* Titolo VIEWs */}
        <h2 style={{
          fontFamily: "var(--font-poppins)",
          fontWeight: 700,
          fontSize: "70px",
          color: "#fff",
          letterSpacing: "2px",
          marginBottom: "40px",
          lineHeight: 1,
        }}>
          VIEWs
        </h2>

        {/* Player + Playlist */}
        <div style={{ display: "flex", width: "70%", maxWidth: "1600px", alignItems: "stretch", height: "400px" }}>
          <div style={{ flex: "1 1 65%" }}>
            <iframe
              key={activeId}
              src={`https://www.youtube.com/embed/${activeId}?autoplay=0&rel=0`}
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div style={{ flex: "0 0 35%", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#FFF952", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-poppins)", fontSize: "20px", fontWeight: 700, color: "#E8706A" }}>VIDEO</span>
              <span style={{ fontFamily: "var(--font-poppins)", fontSize: "13px", fontWeight: 600, color: violet }}>{videosList.length} Video</span>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {videosList.map((v) => (
                <div key={v.id} onClick={() => setActiveId(v.id)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 12px", cursor: "pointer", background: activeId === v.id ? "#f4f4f4" : "#fff", borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt={v.title} style={{ width: "88px", height: "50px", objectFit: "cover", display: "block" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="8" height="10" viewBox="0 0 8 10" fill="white"><path d="M0 0L8 5L0 10Z" /></svg>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--font-poppins)", fontSize: "11px", fontWeight: activeId === v.id ? 600 : 400, color: "#222", flex: 1, lineHeight: 1.3 }}>{v.title}</span>
                  <span style={{ fontFamily: "var(--font-poppins)", fontSize: "11px", color: "#999", flexShrink: 0 }}>{v.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Titolo LOL:) */}
        <h2 style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "70px", color: "#fff", letterSpacing: "2px", marginTop: "80px", marginBottom: "40px", lineHeight: 1 }}>
          LOL:)
        </h2>

        {/* Griglia meme */}
        <div style={{ width: "70%", maxWidth: "1600px", padding: "0 24px", columns: 4, columnGap: "6px" }}>
          {allMemes.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt={`meme ${i + 1}`} style={{ width: "100%", display: "block", breakInside: "avoid", marginBottom: "6px", borderRadius: "4px" }} loading="lazy" />
          ))}
        </div>

        {/* Social links */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginTop: "60px", marginBottom: "20px" }}>
          {/* WhatsApp — sopra centrato */}
          <a href="https://wa.me/?text=https://centrosteadycam.it/comunicare-salute/" target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 100, height: 100, background: "#25D366", borderRadius: 16, textDecoration: "none" }}>
            <svg width="56" height="56" viewBox="0 0 448 512" fill="white"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
          </a>
          {/* Facebook + YouTube + Instagram — sotto in riga */}
          <div style={{ display: "flex", gap: "16px" }}>
            <a href="https://www.facebook.com/steadycam.centrodocaudiovisiva" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 100, height: 100, background: "#3b5998", borderRadius: 16, textDecoration: "none" }}>
              <svg width="52" height="52" viewBox="0 0 512 512" fill="white"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/></svg>
            </a>
            <a href="https://www.youtube.com/channel/UCDZjCnp9CtwBr2AoOMotlhg" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 100, height: 100, background: "#FF0000", borderRadius: 16, textDecoration: "none" }}>
              <svg width="52" height="44" viewBox="0 0 576 512" fill="white"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>
            </a>
            <a href="https://www.instagram.com/centrosteadycam/" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 100, height: 100, background: "#1c1c1c", borderRadius: 16, textDecoration: "none" }}>
              <svg width="52" height="52" viewBox="0 0 448 512" fill="white"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
            </a>
          </div>
        </div>

      </motion.div>
    </div>
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

  const blue = "#6565EF";

  return (
    <section
      ref={ref}
      style={{ height: "918px", background: "#FFF952", position: "relative", zIndex: 3 }}
      className="flex flex-col justify-center overflow-hidden"
    >
      <div className="max-w-[1100px] mx-auto px-12 w-full flex flex-col gap-16">

        {/* Riga 1 — solo testo */}
        <motion.div style={{ x: x1 }}>
          <p style={{
            color: blue,
            fontSize: "36px",
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            lineHeight: 1.4,
          }}>
            Questo sito non è fatto per stare fermo.
          </p>
        </motion.div>

        {/* Riga 2 — testo bold + icona razzo a destra */}
        <motion.div style={{ x: x2 }} className="flex items-start justify-between gap-8">
          <p style={{
            color: blue,
            fontSize: "30px",
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            lineHeight: 1.4,
            flex: 1,
          }}>
            Esplora i video e i meme, scegli quelli che ti fanno più ridere, che ti fanno pensare, che potrebbero piacere o far discutere.
          </p>
          {/* Space shuttle — FA shuttle-space */}
          <svg width="60" height="60" viewBox="0 0 640 512" fill="#E8706A" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-1">
            <path d="M130 480c40.6 0 80.4-11 115.2-31.9L352 384l-224 0 0 96 2 0zM352 128L245.2 63.9C210.4 43 170.6 32 130 32l-2 0 0 96 224 0zM96 128l0-96L80 32C53.5 32 32 53.5 32 80l0 48 8 0c-22.1 0-40 17.9-40 40l0 16L0 328l0 16c0 22.1 17.9 40 40 40l-8 0 0 48c0 26.5 21.5 48 48 48l16 0 0-96 8 0c26.2 0 49.4-12.6 64-32l288 0c69.3 0 135-22.7 179.2-81.6c6.4-8.5 6.4-20.3 0-28.8C591 182.7 525.3 160 456 160l-288 0c-14.6-19.4-37.8-32-64-32l-8 0zM512 243.6l0 24.9c0 19.6-15.9 35.6-35.6 35.6c-2.5 0-4.4-2-4.4-4.4l0-87.1c0-2.5 2-4.4 4.4-4.4c19.6 0 35.6 15.9 35.6 35.6z"/>
          </svg>
        </motion.div>

        {/* Riga 3 — testo link sottolineato + icona freccia a destra */}
        <motion.div style={{ x: x3 }} className="flex items-start justify-between gap-8">
          <p style={{
            color: blue,
            fontSize: "30px",
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            lineHeight: 1.4,
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            flex: 1,
            cursor: "pointer",
          }}>
            Mandali ai tuoi amici, ai tuoi parenti, ai tuoi peggiori nemici e scopri che cosa ne pensano..
          </p>
          {/* Freccia share — FA share */}
          <svg width="60" height="60" viewBox="0 0 512 512" fill="#E8706A" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-1">
            <path d="M307 34.8c-11.5 5.1-19 16.6-19 29.2v64H176C78.8 128 0 206.8 0 304C0 417.3 81.5 467.9 100.2 478.1c2.5 1.4 5.3 1.9 8.1 1.9c10.9 0 19.7-8.9 19.7-19.7c0-7.5-4.3-14.4-9.8-19.5C108.8 431.9 96 414.4 96 384c0-53 43-96 96-96h96v64c0 12.6 7.4 24.1 19 29.2s25 3 34.4-5.4l160-144c6.7-6.1 10.6-14.7 10.6-23.8s-3.8-17.7-10.6-23.8l-160-144c-9.4-8.5-22.9-10.6-34.4-5.4z"/>
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

