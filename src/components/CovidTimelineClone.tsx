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

function GridTick({ p, kf, axis, w = 50, h = 40, style }: {
  p: MotionValue<number>; kf: KF; axis: "h" | "v"; w?: number; h?: number; style?: CSSProperties;
}) {
  const scale = useTransform(p, [kf[0] / 100, kf[1] / 100], [0, 1]);
  return axis === "h" ? (
    <motion.div style={{ position: "absolute", width: w, height: SEGMENT_THICKNESS, backgroundColor: LINE, scaleX: scale, transformOrigin: "0% 50%", ...style }} />
  ) : (
    <motion.div style={{ position: "absolute", width: SEGMENT_THICKNESS, height: h, backgroundColor: LINE, scaleY: scale, transformOrigin: "50% 0%", ...style }} />
  );
}

/* griglia decorativa: forma la scritta "2026" con cifre a 7 segmenti
   (stessa lettera del display a segmenti: a=alto, b=alto-dx, c=basso-dx,
   d=basso, e=basso-sx, f=alto-sx, g=centro) */
const DIGIT_W = 50;
const DIGIT_H = 100;
const SEGMENT_THICKNESS = 8;
function makeSegmentLayout(w: number, h: number, t: number): Record<string, { axis: "h" | "v"; top: number; left: number; w?: number; h?: number }> {
  return {
    a: { axis: "h", top: 0, left: 0, w },
    b: { axis: "v", top: 0, left: w - t, h: h / 2 },
    c: { axis: "v", top: h / 2, left: w - t, h: h / 2 },
    d: { axis: "h", top: h - t, left: 0, w },
    e: { axis: "v", top: h / 2, left: 0, h: h / 2 },
    f: { axis: "v", top: 0, left: 0, h: h / 2 },
    g: { axis: "h", top: h / 2 - t / 2, left: 0, w },
  };
}
const SEGMENT_LAYOUT = makeSegmentLayout(DIGIT_W, DIGIT_H, SEGMENT_THICKNESS);
const DIGIT_SEGMENTS: Record<string, string[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "g", "b", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "c", "d", "e", "f", "g"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
};

/* etichette anno (2000-2011 al posto dei mesi): stessa tecnica a 7 segmenti di
   "2026" ma in scala ridotta e senza disegno progressivo — l'intera cifra è
   sempre "accesa", solo il gruppo (y/opacity) segue lo scroll come le vecchie
   etichette testuali dei mesi. */
const YEAR_DIGIT_W = 16;
const YEAR_DIGIT_H = 30;
const YEAR_SEGMENT_THICKNESS = 4;
const YEAR_DIGIT_GAP = 4;
const YEAR_SEGMENT_LAYOUT = makeSegmentLayout(YEAR_DIGIT_W, YEAR_DIGIT_H, YEAR_SEGMENT_THICKNESS);

/* il box della cifra "1" resta largo come tutte le altre (come se al suo posto
   ci fosse uno "0"), ma i suoi segmenti (solo b e c) sono centrati orizzontalmente
   nel box invece di stare a destra come nelle altre cifre. */
const ONE_SEGMENT_LEFT = (YEAR_DIGIT_W - YEAR_SEGMENT_THICKNESS) / 2;

function StaticDigit({ digit, style }: { digit: string; style?: CSSProperties }) {
  return (
    <div style={{ position: "relative", width: YEAR_DIGIT_W, height: YEAR_DIGIT_H, ...style }}>
      {DIGIT_SEGMENTS[digit].map((seg) => {
        const l = YEAR_SEGMENT_LAYOUT[seg];
        const left = digit === "1" ? ONE_SEGMENT_LEFT : l.left;
        return (
          <div
            key={seg}
            style={{
              position: "absolute", top: l.top, left,
              width: l.axis === "h" ? l.w : YEAR_SEGMENT_THICKNESS,
              height: l.axis === "v" ? l.h : YEAR_SEGMENT_THICKNESS,
              backgroundColor: LINE,
            }}
          />
        );
      })}
    </div>
  );
}

function YearLabel({ p, kf, year, align = "left" }: {
  p: MotionValue<number>; kf: KF; year: string; align?: "left" | "right";
}) {
  const y = useTransform(p, [kf[0] / 100, kf[1] / 100], [120, 0]);
  const opacity = useTransform(p, [kf[0] / 100, kf[1] / 100], [0, 1]);
  const margin: CSSProperties = align === "left" ? { marginLeft: 20 } : { marginRight: 20 };
  const digits = year.split("");
  return (
    <div style={{ overflow: "hidden", ...margin }}>
      <motion.div
        data-kf={`L:${blockTag(p)}:${kf[0]}-${kf[1]}`}
        style={{ display: "inline-flex", y, opacity }}
      >
        {digits.map((d, i) => (
          <StaticDigit key={i} digit={d} style={{ marginLeft: i === 0 ? 0 : YEAR_DIGIT_GAP }} />
        ))}
      </motion.div>
    </div>
  );
}
const GRID_KF_START = 20;
const GRID_KF_END = 29;
const YEAR_GRID: { seg: string; axis: "h" | "v"; top: number; left: number; w?: number; h?: number; kf: KF }[][] = (() => {
  const digits = "2026".split("");
  const total = digits.reduce((sum, d) => sum + DIGIT_SEGMENTS[d].length, 0);
  const step = (GRID_KF_END - GRID_KF_START) / total;
  let idx = 0;
  return digits.map((d) =>
    DIGIT_SEGMENTS[d].map((seg) => {
      const layout = SEGMENT_LAYOUT[seg];
      const kf: KF = [GRID_KF_START + idx * step, GRID_KF_START + (idx + 1) * step];
      idx++;
      return { seg, kf, ...layout };
    })
  );
})();

/* ── hero ─────────────────────────────────────────────────────────────── */

/* V0 (linea sopra "SCROLL"): dopo l'ingresso, parte un loop infinito in cui si
   allunga oltre la fine del testo e torna alla lunghezza attuale. Il testo si
   muove insieme al bordo basso della linea (stessa distanza costante da lei),
   ed esce dalla finestra di maschera (overflow:hidden, fissa, il cui bordo
   superiore sta pochi px sotto alla S di riposo) quando scende, ricomparendo
   quando risale. */
const V0_REST_HEIGHT = 191;
const V0_EXTEND_DELTA = 95;
const V0_LOOP_DURATION = 2.4;
const SCROLL_TEXT_REST_Y = -54.56;

function Hero({ block1Ref }: { block1Ref: React.RefObject<HTMLDivElement> }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  /* il gruppo V0+testo deve sparire (opacità 0, compresso) esattamente quando
     parte H1 (kf=12 del blocco1) — calcolato a runtime dalle altezze reali,
     non un valore fisso, perché dipende dall'altezza di blocco1 e della finestra. */
  const [fadeEnd, setFadeEnd] = useState(0.6);
  useLayoutEffect(() => {
    function recompute() {
      if (!heroRef.current || !block1Ref.current) return;
      const vh = window.innerHeight;
      const heroHeight = heroRef.current.getBoundingClientRect().height;
      const block1Height = block1Ref.current.getBoundingClientRect().height;
      const H1_KF = 0.12;
      const scrollYAtH1Start = H1_KF * (block1Height + vh);
      setFadeEnd(Math.min(1, Math.max(0, scrollYAtH1Start / heroHeight)));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [block1Ref]);

  const scrollHintOpacity = useTransform(scrollYProgress, [0, fadeEnd], [1, 0]);
  const scrollHintScale = useTransform(scrollYProgress, [0, fadeEnd], [1, 0]);
  const scrollHintY = useTransform(scrollYProgress, [0, fadeEnd], [0, 20]);
  const [scrollLoop, setScrollLoop] = useState(false);

  return (
    <div
      ref={heroRef}
      style={{
        position: "relative", height: "100vh", overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: "0 10px 70px",
      }}
    >
      {/* copia "ghost" dietro il testo principale: stesso page-load reveal ma
          partenza più larga/ruotata e dissolvenza a opacity 0.4 (effetto eco) */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 1.8, rotate: -12 }}
        animate={{ opacity: 0.4, scale: 1, rotate: -10 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "absolute", left: "50%", x: "-50%", zIndex: 1, textAlign: "center", filter: "blur(2px)" }}
      >
        <div style={{ display: "inline-block", padding: "8px 16px 8px 24px", backgroundColor: LINE, marginBottom: 8 }}>
          <h3 style={{ ...h3Style, color: PILL_TEXT, fontSize: "clamp(1rem,2.2vw,1.7rem)", letterSpacing: "0.18em" }}>
            La nostra
          </h3>
        </div>
        <h1 style={h1Style}>Storia</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 1.5, rotate: -10, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, rotate: -10, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", zIndex: 2, textAlign: "center" }}
      >
        <div style={{ display: "inline-block", padding: "8px 16px 8px 24px", backgroundColor: LINE, marginBottom: 8 }}>
          <h3 style={{ ...h3Style, color: PILL_TEXT, fontSize: "clamp(1rem,2.2vw,1.7rem)", letterSpacing: "0.18em" }}>
            La nostra
          </h3>
        </div>
        <h1 style={h1Style}>Storia</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        style={{
          position: "absolute", bottom: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 40,
          transformOrigin: "50% 0%",
          opacity: scrollHintOpacity, y: scrollHintY, scaleY: scrollHintScale,
        }}
      >
        <motion.div
          initial={{ scaleY: 0 }}
          animate={scrollLoop
            ? { scaleY: [1, (V0_REST_HEIGHT + V0_EXTEND_DELTA) / V0_REST_HEIGHT, 1] }
            : { scaleY: 1 }}
          transition={scrollLoop
            ? { duration: V0_LOOP_DURATION, repeat: Infinity, ease: "easeInOut" }
            : { delay: 1, duration: 0.7, ease: "easeOut" }}
          onAnimationComplete={() => setScrollLoop(true)}
          style={{ width: 10, height: V0_REST_HEIGHT, backgroundColor: LINE, transformOrigin: "50% 0%", y: -35 }}
        />
        <div style={{ overflow: "hidden", height: 60, transform: `translateY(${SCROLL_TEXT_REST_Y}px)` }}>
          <motion.div
            animate={scrollLoop
              ? { y: [0, V0_EXTEND_DELTA, 0] }
              : { y: 0 }}
            transition={scrollLoop
              ? { duration: V0_LOOP_DURATION, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0 }}
          >
            <p
              style={{
                ...pStyle, color: LINE, letterSpacing: "2px", fontSize: 15, fontWeight: 400, margin: 0,
                writingMode: "vertical-rl", transform: "rotate(180deg)",
              }}
            >
              SCROLL
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── televisore anni '90 a sinistra della timeline ────────────────────────
   Idee scartate prima di questa (per riferimento, non più in uso): un
   "occhio di bue" con maschera radiale ovale, poi una variante a forma di
   buco da proiettile (bordo irregolare + crepe via SVG). L'utente ha cambiato
   idea: ora le immagini scorrono dentro lo schermo di un vecchio televisore
   CRT, "appoggiato" sullo sfondo (piccola ombra sotto per non farlo sembrare
   fluttuante). Colonna fissa (non scrolla con la pagina, non legge/modifica
   nulla del layout della timeline). Ogni immagine compare/scompare e trasla
   da sinistra verso destra agganciata allo stesso scroll (stessi p1/p2,
   stesse finestre kf) in cui compare il suo anno di riferimento — nessun
   loop autonomo. Per ora un piccolo set di foto placeholder alternate. */
const SIDE_CAROUSEL_CSS = `
  .side-spotlight { display: none; }
  @media (min-width: 1400px) { .side-spotlight { display: block; } }
  @keyframes tv-static-shift {
    0% { background-position: 0 0; }
    100% { background-position: 120px 87px; }
  }
  .tv-static { animation: tv-static-shift 0.15s steps(2) infinite; }
`;
/* "sabbia grigia" delle vecchie TV: rumore generato via SVG feTurbulence
   (nessuna immagine esterna), sempre in loop ma visibile solo durante la
   transizione fra un'immagine e l'altra (opacity agganciata allo scroll,
   esattamente l'inverso dell'opacity dell'immagine stessa). */
const TV_STATIC_NOISE = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>" +
    "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix type='matrix' values='0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 1 0'/></filter>" +
    "<rect width='100%' height='100%' filter='url(#n)'/></svg>"
)}")`;
/* servite da Vercel Blob via il rewrite /media/:path* (next.config.js), NON da
   public/wp-content/uploads/ direttamente: in produzione le richieste dirette a
   /wp-content/* vengono bloccate (403) da una regola di sicurezza lato Vercel
   che non esiste in `next dev` — da qui funzionavano in locale ma non online. */
const CAROUSEL_IMAGES = [
  "/media/01Steadycam_archivio1-100-1.jpg",
  "/media/Steadycam_ilCentro3-scaled.jpg",
  "/media/Contatti_2-scaled.jpg",
  "/media/Steadycam_servizi-scaled.jpg",
  "/media/ProgettiSteadycamNew-scaled.jpg",
];

/* finestra [start,end] di ogni slot = stesso kf[0] con cui appare la
   YearLabel di quell'anno, fino al kf[0] della YearLabel successiva (o 100
   per l'ultimo anno di ciascun blocco p1/p2). Quando due anni compaiono
   insieme (2003+2004, 2005+2006: stesso kf nel layout a due colonne) condividono
   uno slot. */
const YEAR_IMAGE_SLOTS: { p: "p1" | "p2"; start: number; end: number }[] = [
  { p: "p1", start: 12, end: 24 }, // 2000
  { p: "p1", start: 24, end: 36 }, // 2001
  { p: "p1", start: 36, end: 60 }, // 2002
  { p: "p1", start: 60, end: 70 }, // 2003 + 2004
  { p: "p1", start: 70, end: 100 }, // 2005 + 2006
  { p: "p2", start: 6, end: 18 }, // 2007
  { p: "p2", start: 18, end: 28 }, // 2008
  { p: "p2", start: 28, end: 42 }, // 2009
  { p: "p2", start: 42, end: 53.8 }, // 2010
  { p: "p2", start: 53.8, end: 100 }, // 2011
];

/* cornice CSS disegnata a mano (scartata su richiesta dell'utente, che ha
   fornito un'illustrazione reale del televisore da usare al suo posto — vedi
   TV_IMAGE_SRC sotto). Codice precedente non conservato qui per esteso:
   corpo con linear-gradient, schermo con borderRadius+boxShadow inset,
   pannello comandi con grill+due manopole disegnati a div. */
const TV_IMAGE_SRC = "/tv-90s-2.png"; // v2: gambe del tavolo modificate dall'utente
const TV_W = 420;
const TV_H = 420; // l'illustrazione è su canvas quadrato (2500x2500): stesso W/H, niente distorsione
/* rettangolo dello schermo dentro TV.png: è già trasparente in origine (misurato
   via script sul PNG, alpha=0 in quell'area) — ci basta allineare il contenuto
   scrollabile dietro l'immagine, nessuna maschera CSS necessaria. Percentuali
   della bbox trasparente rispetto al canvas 2500x2500. */
const TV_SCREEN_RECT = { leftPct: 29.4, topPct: 32.0, widthPct: 39.7, heightPct: 28.7 };
const TV_IMAGE_TRAVEL = 30; // px percorsi verticalmente (alto/basso) durante l'ingresso/uscita
const TV_TILT = "rotateY(28deg) rotateX(4deg)"; // TV vista di scorcio, direzione invertita su richiesta
const TV_SCANLINES = "repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 2px, transparent 4px)";

function TVImage({ p, start, end, src }: { p: MotionValue<number>; start: number; end: number; src: string }) {
  const fadeInStart = Math.max(0, start - 4);
  const fadeOutStart = Math.max(start, end - 4);
  const inputRange = [fadeInStart / 100, start / 100, fadeOutStart / 100, end / 100];
  const opacity = useTransform(p, inputRange, [0, 1, 1, 0]);
  const y = useTransform(p, inputRange, [-TV_IMAGE_TRAVEL, 0, 0, TV_IMAGE_TRAVEL]);
  return (
    <motion.div style={{ position: "absolute", inset: 0, opacity, y }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </motion.div>
  );
}

/* prima immagine (2000): l'ingresso è agganciato al pixel assoluto di scroll
   (500px), non alla percentuale kf del blocco — su richiesta esplicita, "in
   concomitanza col primo anno". L'uscita resta invece agganciata al normale
   meccanismo p1 (stesso fadeOutStart/end della vecchia TVImage), così il
   passaggio alla seconda immagine (2001, ancora su base p1) resta senza buchi
   né sovrapposizioni. */
const TV_FIRST_IMAGE_PX = 500;

function FirstTVImage({ scrollY, p, end, src }: { scrollY: MotionValue<number>; p: MotionValue<number>; end: number; src: string }) {
  const fadeOutStart = Math.max(0, end - 4) / 100;
  const fadeOutEnd = end / 100;
  const opacity = useTransform([scrollY, p], (values) => {
    const [sy, pv] = values as number[];
    const inFactor = Math.min(1, Math.max(0, (sy - (TV_FIRST_IMAGE_PX - 60)) / 60));
    const outFactor = 1 - Math.min(1, Math.max(0, (pv - fadeOutStart) / (fadeOutEnd - fadeOutStart)));
    return Math.min(inFactor, outFactor);
  });
  const y = useTransform([scrollY, p], (values) => {
    const [sy, pv] = values as number[];
    const outT = Math.min(1, Math.max(0, (pv - fadeOutStart) / (fadeOutEnd - fadeOutStart)));
    if (outT > 0) return outT * TV_IMAGE_TRAVEL;
    const inT = Math.min(1, Math.max(0, (sy - (TV_FIRST_IMAGE_PX - 60)) / 60));
    return (1 - inT) * -TV_IMAGE_TRAVEL;
  });
  return (
    <motion.div style={{ position: "absolute", inset: 0, opacity, y }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </motion.div>
  );
}

/* "accensione" della TV a scrollY=100px (pixel assoluti di pagina, non
   percentuale di un blocco): un lampo sottile che si allarga in orizzontale
   dal centro verso i bordi, poi la sabbia (stesso rumore delle transizioni)
   resta accesa come stato di base finché non arriva la prima immagine. */
const TV_POWER_ON_PX = 100;

function RetroTV({ p1, p2 }: { p1: MotionValue<number>; p2: MotionValue<number> }) {
  const { scrollY } = useScroll();
  const flashScaleX = useTransform(scrollY, [TV_POWER_ON_PX - 15, TV_POWER_ON_PX], [0, 1]);
  const flashOpacity = useTransform(scrollY, [TV_POWER_ON_PX - 15, TV_POWER_ON_PX - 5, TV_POWER_ON_PX + 25, TV_POWER_ON_PX + 55], [0, 1, 1, 0]);
  const staticBaseOpacity = useTransform(scrollY, [TV_POWER_ON_PX - 10, TV_POWER_ON_PX + 5], [0, 1]);
  return (
    <div
      className="side-spotlight"
      style={{ position: "fixed", left: 40, top: "50%", transform: "translateY(-50%)", zIndex: 1, pointerEvents: "none", width: TV_W, height: TV_H, perspective: 1200 }}
    >
      {/* ombra: rappresenta il "piano" — la posizione resta ferma, ma si
         ingrandisce/scurisce quando la TV è vicina (in basso) e si rimpicciolisce/
         schiarisce quando è più in alto, in fase con lo stesso bob (stessa durata) */}
      <motion.div
        animate={{ scaleX: [1, 0.7, 1], opacity: [0.9, 0.5, 0.9] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", left: "12%", right: "12%", bottom: -6, height: 30,
          borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 72%)",
          filter: "blur(3px)",
        }}
      />

      {/* wrapper separato solo per il bob su/giù: parte da y=0 (posizione attuale,
         a contatto col piano/ombra) e sale, poi torna — mai sotto zero, quindi il
         "piano" resta esattamente dove sta ora l'ombra */}
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        {/* cornice + schermo ruotati insieme (stesso transform) così il contenuto
            resta sempre allineato al buco trasparente del PNG anche in 3D */}
        <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: TV_TILT, filter: "drop-shadow(0 26px 30px rgba(0,0,0,0.55))" }}>
          <div style={{
            position: "absolute",
            left: `${TV_SCREEN_RECT.leftPct}%`, top: `${TV_SCREEN_RECT.topPct}%`,
            width: `${TV_SCREEN_RECT.widthPct}%`, height: `${TV_SCREEN_RECT.heightPct}%`,
            overflow: "hidden", background: "#000",
          }}>
            {/* sabbia di base: la TV, una volta accesa, resta "sabbiosa" finché
               non arriva la prima immagine (le singole TVImage la coprono
               quando sono opache) */}
            <motion.div
              className="tv-static"
              style={{ position: "absolute", inset: 0, backgroundImage: TV_STATIC_NOISE, mixBlendMode: "screen", opacity: staticBaseOpacity }}
            />
            {YEAR_IMAGE_SLOTS.map((slot, i) =>
              i === 0 ? (
                <FirstTVImage
                  key={i}
                  scrollY={scrollY}
                  p={p1}
                  end={slot.end}
                  src={CAROUSEL_IMAGES[i % CAROUSEL_IMAGES.length]}
                />
              ) : (
                <TVImage
                  key={i}
                  p={slot.p === "p1" ? p1 : p2}
                  start={slot.start}
                  end={slot.end}
                  src={CAROUSEL_IMAGES[i % CAROUSEL_IMAGES.length]}
                />
              )
            )}
            {/* vignetta CRT rimossa su richiesta (creava un ovale più chiaro visibile al centro):
               <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} /> */}
            {/* scanline */}
            <div style={{ position: "absolute", inset: 0, background: TV_SCANLINES, mixBlendMode: "overlay" }} />
            {/* lampo di accensione a scrollY=100px: si espande in orizzontale dal centro */}
            <motion.div style={{
              position: "absolute", left: 0, right: 0, top: "50%", height: 2, marginTop: -1,
              background: "#fff", boxShadow: "0 0 14px 4px rgba(255,255,255,0.85)",
              transformOrigin: "50% 50%", scaleX: flashScaleX, opacity: flashOpacity,
            }} />
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={TV_IMAGE_SRC} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        </div>
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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setOn(new URLSearchParams(window.location.search).get("debug") === "1");
  }, []);

  useEffect(() => {
    if (!on) return;
    const update = () => {
      setScrollY(Math.round(window.scrollY));
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
        DEBUG · scrollY: {scrollY}px
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

const DEFAULT_DESCRIPTION = "Testo segnaposto per l'evento del mese: una breve descrizione generica.";
const HARDCODED_MAX_YEAR = 2011; // ultimo anno con layout scritto a mano (2000-2011); oltre, catena dinamica

export default function CovidTimelineClone({ entries = [] }: { entries?: { year: number; description: string }[] }) {
  const descByYear = new Map(entries.map((e) => [e.year, e.description]));
  const desc = (year: number) => descByYear.get(year) || DEFAULT_DESCRIPTION;
  const newEntries = entries
    .filter((e) => e.year > HARDCODED_MAX_YEAR)
    .sort((a, b) => a.year - b.year);

  const block1Ref = useRef<HTMLDivElement>(null);
  const block2Ref = useRef<HTMLDivElement>(null);
  const block3Ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress: p1 } = useScroll({ target: block1Ref, offset: ["start end", "end start"] });
  const { scrollYProgress: p2Raw } = useScroll({ target: block2Ref, offset: ["start end", "end start"] });
  const { scrollYProgress: p3Raw } = useScroll({ target: block3Ref, offset: ["start end", "end start"] });

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

  /* stesso principio del gate di block2: il blocco 3 (H14 in poi) non deve
     partire finché il blocco 2 non ha finito di disegnarsi (V14 = kf[.,76],
     ultimo elemento animato del blocco 2). A differenza del gate block1→block2,
     qui block2 stesso è già gated (p2GateStart) — la formula deve tenerne conto,
     altrimenti il punto di apertura non corrisponde al reale scrollY in cui P2
     (non p2Raw) raggiunge il kf di fine contenuto, lasciando un vuoto di scroll. */
  const [p3GateStart, setP3GateStart] = useState(0);
  useLayoutEffect(() => {
    function recompute() {
      if (!block2Ref.current || !block3Ref.current) return;
      const h2 = block2Ref.current.getBoundingClientRect().height;
      const h3 = block3Ref.current.getBoundingClientRect().height;
      const vh = window.innerHeight;
      const BLOCK2_CONTENT_MAX_KF = 0.76; // V14 = kf [.,76], ultimo elemento animato del blocco 2
      const p2RawAtContentEnd = BLOCK2_CONTENT_MAX_KF * (1 - p2GateStart) + p2GateStart;
      const frac = (p2RawAtContentEnd * (h2 + vh) - h2) / (h3 + vh);
      setP3GateStart(Math.min(1, Math.max(0, frac)));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [p2GateStart]);

  /* V16 (ultimo elemento, kf=50) deve aver finito esattamente a scrollY=3480px:
     invece di tarare a mano ogni singolo kf, si rimappa l'intero range [gate,3480px]
     su [0,0.5] — ridistribuisce automaticamente e in proporzione tutte le linee/testi
     del blocco3 sullo spazio di scroll realmente disponibile fino a quel punto. */
  const [p3RawAtTarget, setP3RawAtTarget] = useState(1);
  useLayoutEffect(() => {
    function recompute() {
      if (!block3Ref.current) return;
      const vh = window.innerHeight;
      const block3Top = block3Ref.current.getBoundingClientRect().top + window.scrollY;
      const h3 = block3Ref.current.getBoundingClientRect().height;
      const p3RawStart = block3Top - vh;
      const TARGET_SCROLL_Y = 3480;
      setP3RawAtTarget((TARGET_SCROLL_Y - p3RawStart) / (h3 + vh));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);
  const p3 = useTransform(p3Raw, [p3GateStart, p3RawAtTarget], [0, 0.5]);

  const whatsNextY = useTransform(p3, [0.29, 0.44], [120, 0]);
  const whatsNextOpacity = useTransform(p3, [0.29, 0.44], [0, 1]);

  /* garantisce che scrollY=3480px sia fisicamente raggiungibile (pagina abbastanza
     lunga) qualunque sia l'altezza della finestra — spacer invisibile a fondo
     pagina, ricalcolato a runtime, mai negativo. */
  const spacerRef = useRef<HTMLDivElement>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);
  useLayoutEffect(() => {
    function recompute() {
      const vh = window.innerHeight;
      const TARGET_SCROLL_Y = 3480;
      const requiredDocHeight = TARGET_SCROLL_Y + vh;
      const prevSpacer = spacerRef.current?.getBoundingClientRect().height ?? 0;
      const docHeightWithoutSpacer = document.documentElement.scrollHeight - prevSpacer;
      const needed = Math.max(0, requiredDocHeight - docHeightWithoutSpacer);
      setSpacerHeight(needed);
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

  return (
    <div style={{ position: "relative", backgroundColor: "#121212" }}>
      <DebugOverlay />
      <style>{TL_BLOCK_CSS}</style>
      <style>{SIDE_CAROUSEL_CSS}</style>
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(${BG_OVERLAY}, ${BG_OVERLAY}), url('/timeline2020/bg-art.png')`,
          backgroundRepeat: "repeat", backgroundPosition: "0 0", backgroundSize: "auto",
        }}
      />
      <RetroTV p1={p1} p2={p2} />

      <div style={{ position: "relative", zIndex: 1 }}>

      <Hero block1Ref={block1Ref} />

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 24px" }}>
        {/* ── blocco 1: GEN → LUG ─────────────────────────────────────── */}
        <div ref={block1Ref} className="tl-block">
          <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 0 }}>
            <VTick p={p1} kf={[6, 12]} h={100} marginTop={-10} />
            <YearLabel p={p1} kf={[12, 18]} align="left" year="2000" />
          </div>

          <HConn p={p1} kf={[12, 18]} origin="left" />

          <div style={ROW}>
            <Para p={p1} kf={[12, 18]} align="left">
              {desc(2000)}
            </Para>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <YearLabel p={p1} kf={[24, 30]} align="right" year="2001" />
              <VTick p={p1} kf={[18, 24]} h={200} />
            </div>
          </div>

          <HConn p={p1} kf={[24, 30]} origin="right" />

          <div style={ROW}>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <VTick p={p1} kf={[30, 36]} h={200} />
              <YearLabel p={p1} kf={[36, 42]} align="left" year="2002" />
            </div>
            <Para p={p1} kf={[24, 30]} align="right">
              {desc(2001)}
            </Para>
          </div>

          <HConn p={p1} kf={[36, 42]} origin="left" />

          <div style={ROW}>
            <Para p={p1} kf={[36, 42]} align="left">
              {desc(2002)}
            </Para>
            <VTick p={p1} kf={[42, 48]} h={100} marginBottom={-10} style={{ alignSelf: "flex-end" }} />
          </div>

          <HConn p={p1} kf={[48, 54]} origin="right" style={{ width: "50%", marginLeft: "auto" }} />

          <div style={ROW}>
            <YearLabel p={p1} kf={[60, 68]} align="left" year="2003" />
            <VTick p={p1} kf={[54, 60]} h={100} marginTop={-10} />
            <div style={{ transform: "translateX(-30px)" }}><YearLabel p={p1} kf={[60, 68]} align="left" year="2004" /></div>
          </div>

          <HConn p={p1} kf={[60, 66]} origin="left" style={{ transformOrigin: "50% 50%" }} />

          <div style={ROW_STRETCH}>
            <VTick p={p1} kf={[66, 70]} h={400} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Para p={p1} kf={[60, 68]} align="left" width="100%">{desc(2003)}</Para>
              <YearLabel p={p1} kf={[70, 76]} align="left" year="2005" />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" }}>
              <Para p={p1} kf={[60, 68]} align="right" width="100%">{desc(2004)}</Para>
              <YearLabel p={p1} kf={[70, 76]} align="right" year="2006" />
            </div>
            <VTick p={p1} kf={[66, 70]} h={400} />
          </div>

          <div style={{ display: "flex", marginBottom: 0 }}>
            <div style={{ width: "50%" }}><HConn p={p1} kf={[70, 76]} origin="left" style={{ marginBottom: 0 }} /></div>
            <div style={{ width: "50%" }}><HConn p={p1} kf={[70, 76]} origin="right" style={{ marginBottom: 0 }} /></div>
          </div>

          <div style={{ ...ROW, alignItems: "flex-start" }}>
            <Para p={p1} kf={[70, 76]} align="left">
              {desc(2005)}
            </Para>
            <VTick p={p1} kf={[76, 78]} h={100} marginBottom={-10} />
            <Para p={p1} kf={[70, 76]} align="right">
              {desc(2006)}
            </Para>
          </div>

          <HConn p={p1} kf={[78, 80]} origin="right" style={{ width: "50%", marginRight: "auto" }} />
        </div>

        {/* ── blocco 2: AGO → DIC ─────────────────────────────────────── */}
        <div ref={block2Ref} className="tl-block">
          <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 0 }}>
            <VTick p={p2} kf={[0, 6]} h={100} marginTop={-10} />
            <YearLabel p={p2} kf={[6, 12]} align="left" year="2007" />
          </div>

          <HConn p={p2} kf={[6, 12]} origin="left" />

          <div style={ROW}>
            <Para p={p2} kf={[6, 12]} align="left">
              {desc(2007)}
            </Para>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <YearLabel p={p2} kf={[18, 24]} align="right" year="2008" />
              <VTick p={p2} kf={[12, 18]} h={200} />
            </div>
          </div>

          <HConn p={p2} kf={[18, 24]} origin="right" />

          <div style={ROW}>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <VTick p={p2} kf={[24, 28]} h={200} />
              <YearLabel p={p2} kf={[28, 34]} align="left" year="2009" />
            </div>
            <Para p={p2} kf={[18, 24]} align="right">{desc(2008)}</Para>
          </div>

          <HConn p={p2} kf={[28, 34]} origin="left" />

          <div style={ROW}>
            <Para p={p2} kf={[28, 34]} align="left">
              {desc(2009)}
            </Para>
            <VTick p={p2} kf={[34, 36]} h={100} marginBottom={-10} style={{ alignSelf: "flex-end" }} />
          </div>

          <HConn p={p2} kf={[36, 38]} origin="right" style={{ width: "50%", marginLeft: "auto" }} />

          <div style={ROW}>
            <YearLabel p={p2} kf={[42, 54]} align="left" year="2010" />
            <VTick p={p2} kf={[38, 41.2]} h={100} marginTop={-10} style={{ position: "relative", left: "-50%" }} />
          </div>

          <HConn p={p2} kf={[41.2, 45.9]} origin="left" style={{ transformOrigin: "50% 50%" }} />

          <div style={{ ...ROW_STRETCH, position: "relative" }}>
            <VTick p={p2} kf={[45.9, 53.8]} h={400} />
            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
              <YearLabel p={p2} kf={[53.8, 58.5]} align="right" year="2011" />
            </div>
            <VTick p={p2} kf={[45.9, 53.8]} h={400} />
            <div style={{ position: "absolute", top: 0, left: 0 }}>
              <Para p={p2} kf={[42, 54]} align="left">
                {desc(2010)}
              </Para>
            </div>
          </div>

          <div style={{ display: "flex", marginBottom: 0 }}>
            <div style={{ width: "50%" }}><HConn p={p2} kf={[53.8, 58.5]} origin="left" style={{ marginBottom: 0 }} /></div>
            <div style={{ width: "50%" }}><HConn p={p2} kf={[53.8, 58.5]} origin="right" style={{ marginBottom: 0 }} /></div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Para p={p2} kf={[53.8, 58.5]} align="right" width="40%">
              {desc(2011)}
            </Para>
          </div>

          <VTick p={p2} kf={[58.5, 76]} h={282} marginTop={-102} style={{ marginLeft: "auto", marginRight: "auto" }} />
        </div>

        {/* ── blocco 3: griglia decorativa + "What's next?" ────────────── */}
        <div ref={block3Ref} className="tl-block">
          <HConn p={p3} kf={[0, 6]} origin="right" style={{ width: "calc(50% + 5px)" }} />

          <VTick p={p3} kf={[6, 20]} h={196} marginBottom={-196} />

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, padding: "48px 0" }}>
            {YEAR_GRID.map((segments, di) => (
              <div key={di} style={{ position: "relative", width: DIGIT_W, height: DIGIT_H }}>
                {segments.map((s) => (
                  <GridTick key={s.seg} p={p3} kf={s.kf} axis={s.axis} w={s.w} h={s.h} style={{ top: s.top, left: s.left }} />
                ))}
              </div>
            ))}
          </div>

          <HConn p={p3} kf={[20, 29]} origin="left" />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 250 }}>
            <VTick p={p3} kf={[44, 50]} h={250} style={{ transformOrigin: "50% 100%" }} />
            <div style={{ overflow: "hidden", textAlign: "center", padding: "0 24px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <motion.div style={{ y: whatsNextY, opacity: whatsNextOpacity }}>
                <div style={{ display: "inline-block", padding: "8px 16px 8px 24px", backgroundColor: LINE, marginBottom: 8 }}>
                  <h3 style={{ ...h3Style, color: PILL_TEXT, fontSize: "clamp(1rem,2.2vw,1.7rem)", letterSpacing: "0.18em" }}>
                    What&apos;s
                  </h3>
                </div>
                <h1 style={{ ...h1Style, fontSize: "clamp(2.2rem, 7vw, 90px)" }}>next?</h1>
              </motion.div>
            </div>
            <VTick p={p3} kf={[29, 34]} h={250} />
          </div>

          <HConn p={p3} kf={[38, 44]} origin="right" />
        </div>
      </div>

      <div ref={spacerRef} style={{ height: spacerHeight }} />
      </div>
    </div>
  );
}
