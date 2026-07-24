"use client";

/**
 * Ricostruzione 1:1 (palette, font, layout, animazioni scroll-driven) di
 * https://timeline2020.webflow.io/ — usata come riferimento tecnico/estetico
 * per la timeline storica di Centro Steadycam. Contenuti (mesi/eventi 2020)
 * temporanei: da sostituire con la timeline reale del Centro.
 *
 * Le percentuali di keyframe (kf) replicano i trigger IX2 di Webflow estratti
 * da webflow.js: ogni blocco (.line-container originale) ha un proprio scroll
 * locale 0→100, e ogni linea/testo si "disegna" nella sua finestra kf[0]→kf[1].
 */

import React, { useRef, useState, useEffect, useLayoutEffect, CSSProperties } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

/* larghezza del blocco timeline: 42% desktop, allargata sui breakpoint stretti
   (stessi valori del CSS Webflow originale per .line-container) */
const TL_BLOCK_CSS = `
  .tl-block { width: 42%; min-width: 280px; margin: 0 auto; }
  @media (max-width: 991px) { .tl-block { width: 55%; } }
  @media (max-width: 767px) { .tl-block { width: 60%; } }
  @media (max-width: 479px) { .tl-block { width: 98%; } }
`;

const LINE = "#e0cffe";
const PARA = "#9b7ecd";
const PILL_TEXT = "#402e70";
const WHITE = "#fff";
const BG_OVERLAY = "rgba(76, 46, 131, 0.7)";
const FONT = "var(--font-oswald)";

const h3Style: CSSProperties = {
  margin: 0,
  fontSize: "clamp(1.4rem, 3.2vw, 40px)",
  lineHeight: 1.3,
  fontWeight: 700,
  letterSpacing: "0.26em",
  textTransform: "uppercase",
  color: LINE,
  fontFamily: FONT,
};

const pStyle: CSSProperties = {
  margin: "4px 0 0",
  color: PARA,
  fontSize: 15,
  lineHeight: "22px",
  fontFamily: FONT,
  maxWidth: 260,
};

const h1Style: CSSProperties = {
  margin: 0,
  fontSize: "clamp(3.2rem, 11vw, 140px)",
  lineHeight: 0.9,
  fontWeight: 700,
  letterSpacing: "0.01em",
  textTransform: "uppercase",
  color: LINE,
  fontFamily: FONT,
};

const ROW: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 0 };
const ROW_STRETCH: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "stretch", marginBottom: 0 };

type KF = [number, number];

/* ogni blocco (p1/p2/p3) ha il proprio scroll locale 0→100, quindi due kf
   uguali in blocchi diversi NON sono la stessa cosa — l'etichetta di debug
   deve distinguerli, altrimenti si "fondono" per coincidenza numerica */
const blockTags = new WeakMap<MotionValue<number>, string>();
let nextBlockTag = 0;
function blockTag(p: MotionValue<number>): string {
  if (!blockTags.has(p)) blockTags.set(p, String.fromCharCode(97 + nextBlockTag++));
  return blockTags.get(p)!;
}

/* ── primitive di disegno scroll-driven (sub-componenti: mai useTransform in loop) ── */

function VTick({ p, kf, h = 200, marginTop, marginBottom, style }: {
  p: MotionValue<number>; kf: KF; h?: number; marginTop?: number; marginBottom?: number; style?: CSSProperties;
}) {
  const scaleY = useTransform(p, [kf[0] / 100, kf[1] / 100], [0, 1]);
  return (
    <motion.div
      data-kf={`V:${blockTag(p)}:${kf[0]}-${kf[1]}`}
      style={{
        width: 10, height: h, backgroundColor: LINE, flexShrink: 0,
        marginTop, marginBottom, transformOrigin: "50% 0%", scaleY,
        ...style,
      }}
    />
  );
}

function HConn({ p, kf, origin, style }: {
  p: MotionValue<number>; kf: KF; origin: "left" | "right"; style?: CSSProperties;
}) {
  const scaleX = useTransform(p, [kf[0] / 100, kf[1] / 100], [0, 1]);
  return (
    <motion.div
      data-kf={`H:${blockTag(p)}:${kf[0]}-${kf[1]}`}
      style={{
        width: "100%", height: 10, backgroundColor: LINE, marginBottom: 0,
        transformOrigin: origin === "left" ? "0% 50%" : "100% 50%", scaleX,
        ...style,
      }}
    />
  );
}

function Label({ p, kf, children, align = "left" }: {
  p: MotionValue<number>; kf: KF; children: React.ReactNode; align?: "left" | "right";
}) {
  const y = useTransform(p, [kf[0] / 100, kf[1] / 100], [120, 0]);
  const opacity = useTransform(p, [kf[0] / 100, kf[1] / 100], [0, 1]);
  const margin: CSSProperties = align === "left" ? { marginLeft: 20 } : { marginRight: 20 };
  return (
    <div style={{ overflow: "hidden", ...margin }}>
      <motion.h3 data-kf={`L:${blockTag(p)}:${kf[0]}-${kf[1]}`} style={{ ...h3Style, textAlign: align, y, opacity }}>{children}</motion.h3>
    </div>
  );
}

function Para({ p, kf, children, align = "left", width }: {
  p: MotionValue<number>; kf: KF; children: React.ReactNode; align?: "left" | "right"; width?: string;
}) {
  const y = useTransform(p, [kf[0] / 100, kf[1] / 100], [-120, 0]);
  const opacity = useTransform(p, [kf[0] / 100, kf[1] / 100], [0, 1]);
  const margin: CSSProperties = align === "left" ? { marginLeft: 20 } : { marginRight: 20 };
  const finalWidth = width ? `calc(${width} - 20px)` : "48%";
  return (
    <div style={{ overflow: "hidden", width: finalWidth, alignSelf: "flex-start", ...margin }}>
      <motion.p data-kf={`P:${blockTag(p)}:${kf[0]}-${kf[1]}`} style={{ ...pStyle, textAlign: align, y, opacity }}>{children}</motion.p>
    </div>
  );
}

function GridTick({ p, kf, axis, w = 50, h = 40 }: {
  p: MotionValue<number>; kf: KF; axis: "h" | "v"; w?: number; h?: number;
}) {
  const scale = useTransform(p, [kf[0] / 100, kf[1] / 100], [0, 1]);
  return axis === "h" ? (
    <motion.div style={{ width: w, height: 3, backgroundColor: LINE, scaleX: scale, transformOrigin: "0% 50%" }} />
  ) : (
    <motion.div style={{ width: 3, height: h, backgroundColor: LINE, scaleY: scale, transformOrigin: "50% 0%", margin: "0 auto" }} />
  );
}

const GRID_TICKS: { kf: KF; axis: "h" | "v"; w?: number; h?: number }[] = [
  { kf: [26, 26.5], axis: "h", w: 50 },
  { kf: [26.5, 27], axis: "v", h: 40 },
  { kf: [27, 27.5], axis: "h", w: 50 },
  { kf: [27.5, 28.5], axis: "v", h: 40 },
  { kf: [28.5, 29], axis: "h", w: 50 },
  { kf: [29, 29.5], axis: "h", w: 50 },
  { kf: [29.5, 30], axis: "v", h: 100 },
  { kf: [30, 30.5], axis: "h", w: 100 },
  { kf: [30.5, 31], axis: "h", w: 50 },
  { kf: [31, 31.5], axis: "v", h: 40 },
  { kf: [31.5, 32], axis: "h", w: 50 },
  { kf: [32, 32.5], axis: "v", h: 40 },
  { kf: [32.5, 33], axis: "h", w: 50 },
  { kf: [33, 33.5], axis: "h", w: 30 },
  { kf: [33.5, 34], axis: "v", h: 100 },
  { kf: [34, 35], axis: "h", w: 100 },
];

/* ── hero ─────────────────────────────────────────────────────────────── */

function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const scrollHintOpacity = useTransform(scrollYProgress, [0.5, 0.63], [1, 0]);
  const scrollHintY = useTransform(scrollYProgress, [0.5, 0.63], [0, 20]);

  return (
    <div
      ref={heroRef}
      style={{
        position: "relative", height: "100vh", overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center",
        padding: "0 10px 70px",
      }}
    >
      {/* copia "ghost" dietro il testo principale: stesso page-load reveal ma
          partenza più larga/ruotata e dissolvenza a opacity 0.4 (effetto eco) */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 1.8, rotate: -12 }}
        animate={{ opacity: 0.4, scale: 1, rotate: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "absolute", zIndex: 1, textAlign: "center", filter: "blur(2px)" }}
      >
        <div style={{ display: "inline-block", padding: "8px 16px 8px 24px", backgroundColor: LINE, marginBottom: 8 }}>
          <h3 style={{ ...h3Style, color: PILL_TEXT, fontSize: "clamp(1rem,2.2vw,1.7rem)", letterSpacing: "0.18em" }}>
            What a
          </h3>
        </div>
        <h1 style={h1Style}>Year</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 1.5, rotate: -10, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", zIndex: 2, textAlign: "center" }}
      >
        <div style={{ display: "inline-block", padding: "8px 16px 8px 24px", backgroundColor: LINE, marginBottom: 8 }}>
          <h3 style={{ ...h3Style, color: PILL_TEXT, fontSize: "clamp(1rem,2.2vw,1.7rem)", letterSpacing: "0.18em" }}>
            What a
          </h3>
        </div>
        <h1 style={h1Style}>Year</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        style={{
          position: "absolute", bottom: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          opacity: scrollHintOpacity, y: scrollHintY,
        }}
      >
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 1, duration: 0.7, ease: "easeOut" }}
          style={{ width: 2, height: 40, backgroundColor: LINE, transformOrigin: "50% 0%" }}
        />
        <motion.p
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            ...pStyle, color: LINE, letterSpacing: "0.3em", fontSize: 12, fontWeight: 700, margin: 0,
            writingMode: "vertical-rl", transform: "rotate(180deg)",
          }}
        >
          SCROLL
        </motion.p>
      </motion.div>
    </div>
  );
}

/* ── overlay di debug: etichetta ogni segmento con un nome sequenziale
   (V1, V2, H1, H2, ...) invece del kf grezzo — stesso numero per le linee
   parallele che condividono lo stesso kf (?debug=1) ── */

function DebugOverlay() {
  const [on, setOn] = useState(false);
  const [labels, setLabels] = useState<{ label: string; x: number; y: number }[]>([]);

  useEffect(() => {
    setOn(new URLSearchParams(window.location.search).get("debug") === "1");
  }, []);

  useEffect(() => {
    if (!on) return;
    const update = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-kf]"));
      const counters: Record<string, number> = {};
      const seen: Record<string, number> = {};
      // solo V e H (linee) condividono il numero quando sono "parallele" (stesso kf);
      // L e P sono etichette/testi distinti anche se coincidono nel timing, quindi
      // ognuno ha sempre il proprio numero, altrimenti l'etichetta torna ambigua.
      const SHARED_TYPES = new Set(["V", "H"]);
      setLabels(els.map((el) => {
        const raw = el.dataset.kf || ""; // formato: "V:a:6-12" → tipo, blocco, kf
        const [type, block, value] = raw.split(":");
        const key = `${type}:${block}:${value}`;
        if (SHARED_TYPES.has(type)) {
          if (!(key in seen)) {
            counters[type] = (counters[type] || 0) + 1;
            seen[key] = counters[type];
          }
        } else {
          counters[type] = (counters[type] || 0) + 1;
          seen[key] = counters[type];
        }
        const r = el.getBoundingClientRect();
        return { label: `${type}${seen[key]}`, x: r.left, y: r.top - 12 };
      }));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const interval = setInterval(update, 300);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      clearInterval(interval);
    };
  }, [on]);

  if (!on) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, pointerEvents: "none" }}>
      <div style={{ position: "fixed", top: 8, left: 8, fontSize: 10, color: "#fff", background: "#000", padding: "2px 6px" }}>
        DEBUG
      </div>
      {labels.map((l, i) => (
        <div
          key={i}
          style={{
            position: "fixed", left: l.x, top: l.y, fontSize: 9, lineHeight: 1,
            color: "#ff0", background: "#000", padding: "1px 3px", whiteSpace: "nowrap",
          }}
        >
          {l.label}
        </div>
      ))}
    </div>
  );
}

/* ── componente principale ───────────────────────────────────────────── */

export default function CovidTimelineClone() {
  const block1Ref = useRef<HTMLDivElement>(null);
  const block2Ref = useRef<HTMLDivElement>(null);
  const block3Ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress: p1 } = useScroll({ target: block1Ref, offset: ["start end", "end start"] });
  const { scrollYProgress: p2Raw } = useScroll({ target: block2Ref, offset: ["start end", "end start"] });
  const { scrollYProgress: p3 } = useScroll({ target: block3Ref, offset: ["start end", "end start"] });

  /* il contenuto animato del blocco 1 finisce al kf=80 (H7), ma il trigger geometrico
     "fine del blocco 1" (bordo inferiore = cima del viewport) scatta solo al 100% del
     suo percorso — quel 20% di scroll extra, se non compensato, lascia una pausa vuota
     prima che il blocco 2 inizi (verificato sul sito originale: lì non c'è nessuna
     pausa, i due blocchi si toccano). Calcolo a runtime, dalle altezze reali, il punto
     esatto (in frazione del percorso di p2Raw) in cui il blocco 1 ha finito di
     disegnarsi, e uso quello come vero "inizio" del blocco 2 — indipendente
     dall'altezza della finestra o dal contenuto, si ricalcola anche al resize. */
  const [p2GateStart, setP2GateStart] = useState(0);
  useLayoutEffect(() => {
    function recompute() {
      if (!block1Ref.current || !block2Ref.current) return;
      const h1 = block1Ref.current.getBoundingClientRect().height;
      const h2 = block2Ref.current.getBoundingClientRect().height;
      const vh = window.innerHeight;
      const BLOCK1_CONTENT_MAX_KF = 0.8; // H7 = kf [78,80], ultimo elemento animato del blocco 1
      const residualScroll = (1 - BLOCK1_CONTENT_MAX_KF) * (h1 + vh);
      const frac = residualScroll / (h2 + vh);
      setP2GateStart(Math.min(1, Math.max(0, frac)));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);
  const p2 = useTransform(p2Raw, [p2GateStart, 1], [0, 1]);

  const whatsNextY = useTransform(p3, [0.35, 0.5], [120, 0]);
  const whatsNextOpacity = useTransform(p3, [0.35, 0.5], [0, 1]);


  return (
    <div style={{ position: "relative", backgroundColor: "#121212" }}>
      <DebugOverlay />
      <style>{TL_BLOCK_CSS}</style>
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(${BG_OVERLAY}, ${BG_OVERLAY}), url('/timeline2020/bg-art.png')`,
          backgroundRepeat: "repeat", backgroundPosition: "0 0", backgroundSize: "auto",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>

      <Hero />

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 24px" }}>
        {/* ── blocco 1: GEN → LUG ─────────────────────────────────────── */}
        <div ref={block1Ref} className="tl-block">
          <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 0 }}>
            <VTick p={p1} kf={[6, 12]} h={100} marginTop={-10} />
            <Label p={p1} kf={[12, 18]} align="left">JAN</Label>
          </div>

          <HConn p={p1} kf={[12, 18]} origin="left" />

          <div style={ROW}>
            <Para p={p1} kf={[12, 18]} align="left">
              Testo segnaposto per l&apos;evento del mese: una breve descrizione generica.
            </Para>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <Label p={p1} kf={[24, 30]} align="right">FEB</Label>
              <VTick p={p1} kf={[18, 24]} h={200} />
            </div>
          </div>

          <HConn p={p1} kf={[24, 30]} origin="right" />

          <div style={ROW}>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <VTick p={p1} kf={[30, 36]} h={200} />
              <Label p={p1} kf={[36, 42]} align="left">MAR</Label>
            </div>
            <Para p={p1} kf={[24, 30]} align="right">
              Testo segnaposto per l&apos;evento del mese: una breve descrizione generica.
            </Para>
          </div>

          <HConn p={p1} kf={[36, 42]} origin="left" />

          <div style={ROW}>
            <Para p={p1} kf={[36, 42]} align="left">
              Testo segnaposto per l&apos;evento del mese: una breve descrizione generica.
            </Para>
            <VTick p={p1} kf={[42, 48]} h={100} marginBottom={-10} style={{ alignSelf: "flex-end" }} />
          </div>

          <HConn p={p1} kf={[48, 54]} origin="right" style={{ width: "50%", marginLeft: "auto" }} />

          <div style={ROW}>
            <Label p={p1} kf={[60, 68]} align="left">APR</Label>
            <VTick p={p1} kf={[54, 60]} h={100} marginTop={-10} />
            <Label p={p1} kf={[60, 68]} align="left">MAY</Label>
          </div>

          <HConn p={p1} kf={[60, 66]} origin="left" style={{ transformOrigin: "50% 50%" }} />

          <div style={ROW_STRETCH}>
            <VTick p={p1} kf={[66, 70]} h={400} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Para p={p1} kf={[60, 68]} align="left" width="100%">Testo segnaposto per l&apos;evento del mese.</Para>
              <Label p={p1} kf={[70, 76]} align="left">JUN</Label>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" }}>
              <Para p={p1} kf={[60, 68]} align="right" width="100%">Testo segnaposto per l&apos;evento del mese.</Para>
              <Label p={p1} kf={[70, 76]} align="right">JUL</Label>
            </div>
            <VTick p={p1} kf={[66, 70]} h={400} />
          </div>

          <div style={{ display: "flex", marginBottom: 0 }}>
            <div style={{ width: "50%" }}><HConn p={p1} kf={[70, 76]} origin="left" style={{ marginBottom: 0 }} /></div>
            <div style={{ width: "50%" }}><HConn p={p1} kf={[70, 76]} origin="right" style={{ marginBottom: 0 }} /></div>
          </div>

          <div style={{ ...ROW, alignItems: "flex-start" }}>
            <Para p={p1} kf={[70, 76]} align="left">
              Testo segnaposto per l&apos;evento del mese: una breve descrizione generica.
            </Para>
            <VTick p={p1} kf={[76, 78]} h={100} marginBottom={-10} />
            <Para p={p1} kf={[70, 76]} align="right">
              Testo segnaposto per l&apos;evento del mese: una breve descrizione generica.
            </Para>
          </div>

          <HConn p={p1} kf={[78, 80]} origin="right" style={{ width: "50%", marginRight: "auto" }} />
        </div>

        {/* ── blocco 2: AGO → DIC ─────────────────────────────────────── */}
        <div ref={block2Ref} className="tl-block">
          <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 0 }}>
            <VTick p={p2} kf={[0, 6]} h={100} marginTop={-10} />
            <Label p={p2} kf={[6, 12]} align="left">AUG</Label>
          </div>

          <HConn p={p2} kf={[6, 12]} origin="left" />

          <div style={ROW}>
            <Para p={p2} kf={[6, 12]} align="left">
              Testo segnaposto per l&apos;evento del mese: una breve descrizione generica.
            </Para>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <Label p={p2} kf={[18, 24]} align="right">SEP</Label>
              <VTick p={p2} kf={[12, 18]} h={200} />
            </div>
          </div>

          <HConn p={p2} kf={[18, 24]} origin="right" />

          <div style={ROW}>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <VTick p={p2} kf={[24, 28]} h={200} />
              <Label p={p2} kf={[28, 34]} align="left">OCT</Label>
            </div>
            <Para p={p2} kf={[18, 24]} align="right">Testo segnaposto per l&apos;evento del mese.</Para>
          </div>

          <HConn p={p2} kf={[28, 34]} origin="left" />

          <div style={ROW}>
            <Para p={p2} kf={[28, 34]} align="left">
              Testo segnaposto per l&apos;evento del mese: una breve descrizione generica.
            </Para>
            <VTick p={p2} kf={[34, 36]} h={100} marginBottom={-10} style={{ alignSelf: "flex-end" }} />
          </div>

          <HConn p={p2} kf={[36, 38]} origin="right" style={{ width: "50%", marginLeft: "auto" }} />

          <div style={ROW}>
            <Label p={p2} kf={[42, 54]} align="left">NOV</Label>
            <VTick p={p2} kf={[38, 42]} h={100} style={{ position: "relative", left: "calc(-50% + 5px)" }} />
          </div>

          <HConn p={p2} kf={[42, 48]} origin="left" style={{ transformOrigin: "50% 50%" }} />

          <div style={ROW_STRETCH}>
            <VTick p={p2} kf={[48, 58]} h={400} />
            <div style={{ width: "62%", display: "flex", alignItems: "flex-end" }}>
              <div style={{ width: "50%" }}>
                <Para p={p2} kf={[42, 54]} align="left">
                  Testo segnaposto per l&apos;evento del mese: una breve descrizione generica.
                </Para>
              </div>
              <div style={{ width: "50%", display: "flex", justifyContent: "flex-end" }}>
                <Label p={p2} kf={[58, 64]} align="right">DEC</Label>
              </div>
            </div>
            <VTick p={p2} kf={[48, 58]} h={400} />
          </div>

          <div style={{ display: "flex", marginBottom: 0 }}>
            <div style={{ width: "50%" }}><HConn p={p2} kf={[58, 64]} origin="left" style={{ marginBottom: 0 }} /></div>
            <div style={{ width: "50%" }}><HConn p={p2} kf={[58, 64]} origin="right" style={{ marginBottom: 0 }} /></div>
          </div>

          <div style={{ ...ROW, alignItems: "flex-start" }}>
            <div style={{ width: "50%" }} />
            <Para p={p2} kf={[58, 64]} align="right">
              Testo segnaposto per l&apos;evento del mese: una breve descrizione generica.
            </Para>
          </div>

          <VTick p={p2} kf={[64, 76]} h={100} marginTop={-10} style={{ alignSelf: "flex-end" }} />
        </div>

        {/* ── blocco 3: griglia decorativa + "What's next?" ────────────── */}
        <div ref={block3Ref} className="tl-block">
          <VTick p={p3} kf={[0, 6]} h={100} marginBottom={-10} style={{ alignSelf: "center" }} />
          <HConn p={p3} kf={[6, 12]} origin="right" style={{ width: "51%" }} />

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 18, padding: "48px 0", flexWrap: "wrap" }}>
            {GRID_TICKS.map((t, i) => (
              <GridTick key={i} p={p3} kf={t.kf} axis={t.axis} w={t.w} h={t.h} />
            ))}
          </div>

          <HConn p={p3} kf={[26, 35]} origin="left" />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px 0" }}>
            <VTick p={p3} kf={[50, 56]} h={250} style={{ transformOrigin: "50% 100%" }} />
            <div style={{ overflow: "hidden", textAlign: "center" }}>
              <motion.div style={{ y: whatsNextY, opacity: whatsNextOpacity }}>
                <div style={{ display: "inline-block", padding: "8px 16px 8px 24px", backgroundColor: LINE, marginBottom: 8 }}>
                  <h3 style={{ ...h3Style, color: PILL_TEXT, fontSize: "clamp(1rem,2.2vw,1.7rem)", letterSpacing: "0.18em" }}>
                    What&apos;s
                  </h3>
                </div>
                <h1 style={h1Style}>next?</h1>
              </motion.div>
            </div>
            <VTick p={p3} kf={[35, 40]} h={250} />
          </div>

          <HConn p={p3} kf={[44, 50]} origin="right" />
        </div>
      </div>

      {/* ── risorse ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 24px 60px" }}>
        <div style={{ marginTop: 60, textAlign: "left", color: WHITE }}>
          <h4 style={{ ...h3Style, fontSize: 16, color: WHITE, letterSpacing: "0.15em", marginBottom: 8 }}>
            Resources
          </h4>
          <a
            href="https://www.nytimes.com/article/coronavirus-timeline.html"
            target="_blank" rel="noreferrer"
            style={{ display: "block", color: LINE, textDecoration: "underline", marginTop: 6, fontFamily: FONT, fontSize: 14 }}
          >
            The New York Times — A Timeline of the Coronavirus Pandemic
          </a>
          <a
            href="https://www.afro.who.int/news/update-covid-19-30-july-2020"
            target="_blank" rel="noreferrer"
            style={{ display: "block", color: LINE, textDecoration: "underline", marginTop: 6, fontFamily: FONT, fontSize: 14 }}
          >
            World Health Organization
          </a>
        </div>
      </div>

      {/* ── footer ────────────────────────────────────────────────────── */}
      <footer
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "50px 20px 40px", backgroundColor: "#121212", color: WHITE, textAlign: "center",
        }}
      >
        <p style={{ ...pStyle, color: WHITE, fontSize: 12, letterSpacing: "0.1em" }}>Centro Steadycam</p>
      </footer>
      </div>
    </div>
  );
}
