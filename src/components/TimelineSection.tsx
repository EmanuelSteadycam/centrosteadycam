"use client";

import React, { useRef, CSSProperties } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const LINE        = "#cfc4ff";
const BG          = "#3a1d7e";
const TITLE_H     = 340;
const H           = 400;   // drawn units per orizzontale
const LW          = 10;    // spessore linea
const LINE_LENGTH = 4000;  // altezza sezione → aumenta per rallentare
const LABEL_H     = 54;
const TEXT_H      = 90;

const SV_PATTERN     = [100, 200, 200, 100, 100, 500]; // V1…V6
const svFor          = (i: number) => SV_PATTERN[i % 6];

// pesi scroll separati per parte V e parte H di ogni segmento
// >1 = più lento, <1 = più veloce
const SCROLL_WEIGHT_V = [5.0, 5.0, 5.0, 5.0, 1.0, 6.0]; // V6 fork: lento
const SCROLL_WEIGHT_H = [5.0, 5.0, 5.0, 5.0, 1.0, 1.0]; // H6: normale
const weightVFor = (i: number) => SCROLL_WEIGHT_V[i % 6];
const weightHFor = (i: number) => SCROLL_WEIGHT_H[i % 6];

/* ── dati timeline ──────────────────────────────────────────────────────── */
const LOREM = "Lorem ipsum dolor sit amet. Consectetur adipiscing elit. Sed do eiusmod.";

const YEARS_DATA: { year: number; text: string }[] = [
  { year: 2000, text: LOREM },
  { year: 2001, text: LOREM },
  { year: 2002, text: LOREM },
  { year: 2003, text: LOREM },
  { year: 2004, text: LOREM },
  { year: 2005, text: LOREM },
  { year: 2006, text: LOREM },
  { year: 2007, text: LOREM },
  { year: 2008, text: LOREM },
  { year: 2009, text: LOREM },
  { year: 2010, text: LOREM },
  { year: 2011, text: LOREM },
  { year: 2012, text: LOREM },
  { year: 2013, text: LOREM },
  { year: 2014, text: LOREM },
  { year: 2015, text: LOREM },
  { year: 2016, text: LOREM },
  { year: 2017, text: LOREM },
  { year: 2018, text: LOREM },
  { year: 2019, text: LOREM },
  { year: 2020, text: LOREM },
  { year: 2021, text: LOREM },
  { year: 2022, text: LOREM },
  { year: 2023, text: LOREM },
  { year: 2024, text: LOREM },
  { year: 2025, text: LOREM },
  { year: 2026, text: LOREM },
];

/* ── geometria derivata ─────────────────────────────────────────────────── */
type Seg = {
  year: number; text: string; i: number;
  sv: number;
  goRight: boolean;
  oV: number; oH: number;   // offsets in "drawn" units
  yV: number; yH: number;   // posizioni Y visive in px
};

const segments: Seg[] = YEARS_DATA.map((y, i) => {
  const sv = svFor(i);
  let oV = 0, yV = 0;
  for (let j = 0; j < i; j++) {
    oV += svFor(j) + H;
    yV += svFor(j) + LW;
  }
  return {
    ...y, i, sv,
    goRight: i % 2 === 0,
    oV,
    oH: oV + sv,
    yV,
    yH: yV + sv,
  };
});

const LAST_DRAWN = segments[segments.length - 1].oH + H;

// mappatura piecewise scroll→drawn per velocità per-segmento
function buildScrollMap() {
  let totalW = 0;
  for (const s of segments) totalW += s.sv * weightVFor(s.i) + H * weightHFor(s.i);
  const sp: number[] = [0], dp: number[] = [0];
  let cumW = 0;
  for (const s of segments) {
    cumW += s.sv * weightVFor(s.i);
    sp.push(cumW / totalW);
    dp.push(s.oH);        // fine parte V = inizio H
    cumW += H * weightHFor(s.i);
    sp.push(cumW / totalW);
    dp.push(s.oH + H);    // fine parte H
  }
  return { sp, dp };
}
const { sp: SCROLL_SP, dp: SCROLL_DP } = buildScrollMap();

/* ── stili testo ─────────────────────────────────────────────────────────── */
const lblBase: CSSProperties = {
  fontFamily: "var(--font-dm-serif)",
  fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
  fontWeight: 400,
  letterSpacing: "0.02em",
  lineHeight: 1,
  color: "#cfc4ff",
  margin: 0,
  textTransform: "uppercase",
};
const txtBase: CSSProperties = {
  fontFamily: "var(--font-open-sans)",
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "rgba(207,196,255,0.75)",
  lineHeight: 1.5,
  margin: 0,
  maxWidth: 180,
};

/* ── sotto-componenti (useTransform nei propri hook) ────────────────────── */
function VSeg({ drawn, seg }: { drawn: MotionValue<number>; seg: Seg }) {
  const isFork    = seg.i % 6 === 5;
  const isV5      = seg.i % 6 === 4;
  const h = useTransform(drawn, d => Math.max(0, Math.min(d - seg.oV, seg.sv)));
  return (
    <div style={{
      position: "absolute",
      top: seg.yV,
      ...(isFork
        ? { left: 0 }
        : isV5
        ? { left: "50%" }
        : { [seg.goRight ? "left" : "right"]: 0 }),
      width: isFork ? "100%" : LW,
      height: seg.sv,
      overflow: "hidden",
    }}>
      {isFork ? (
        <>
          <motion.div style={{ width: LW, height: h, backgroundColor: LINE, position: "absolute", top: 0, left: 0 }} />
          <motion.div style={{ width: LW, height: h, backgroundColor: LINE, position: "absolute", top: 0, right: 0 }} />
        </>
      ) : (
        <motion.div style={{ width: LW, height: h, backgroundColor: LINE }} />
      )}
    </div>
  );
}

function HSeg({ drawn, seg }: { drawn: MotionValue<number>; seg: Seg }) {
  const isH4    = seg.i % 6 === 3;
  const isHFork = seg.i % 6 === 4; // H5: si allarga dal centro
  const scaleX = useTransform(drawn, d => Math.max(0, Math.min((d - seg.oH) / H, isH4 ? 0.5 : 1)));
  const labelY = useTransform(drawn, [seg.oH + H / 2, seg.oH + H / 2 + 250], [LABEL_H, 0], { clamp: true });
  const textY  = useTransform(drawn, [seg.oH + H / 2, seg.oH + H / 2 + 250], [-TEXT_H, 0], { clamp: true });

  const side      = seg.goRight ? "left"  : "right";
  const textAlign = seg.goRight ? "left" as const : "right" as const;

  const transformOrigin = isHFork ? "50% 50%" : seg.goRight ? "0% 50%" : "100% 50%";

  return (
    <>
      {/* linea orizzontale */}
      <div style={{ position: "absolute", top: seg.yH, left: 0, height: LW, width: "100%", overflow: "hidden" }}>
        <motion.div style={{
          height: LW, width: "100%", backgroundColor: LINE,
          scaleX,
          transformOrigin,
        }} />
      </div>

      {/* anno */}
      <div style={{ position: "absolute", top: seg.yH - LABEL_H, [side]: LW + 20, height: LABEL_H, overflow: "hidden" }}>
        <motion.div style={{ y: labelY }}>
          <h3 style={{ ...lblBase, textAlign }}>{seg.year}</h3>
        </motion.div>
      </div>

      {/* descrizione (solo se presente) */}
      {seg.text && (
        <div style={{ position: "absolute", top: seg.yH + LW, [side]: LW + 20, height: TEXT_H, overflow: "hidden" }}>
          <motion.div style={{ y: textY }}>
            <p style={{ ...txtBase, textAlign }}>{seg.text}</p>
          </motion.div>
        </div>
      )}
    </>
  );
}

/* ── componente principale ───────────────────────────────────────────────── */
export default function TimelineSection() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const drawn = useTransform(scrollYProgress, SCROLL_SP, SCROLL_DP);

  return (
    <section ref={ref} style={{
      backgroundColor: BG,
      backgroundImage: "url('/timeline-bg.png')",
      backgroundSize: "auto",
      backgroundPosition: "top left",
      backgroundRepeat: "repeat",
      backgroundAttachment: "fixed",
      height: TITLE_H + LINE_LENGTH,
      position: "relative",
    }}>

      {/* titolo */}
      <div style={{ height: TITLE_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "2.5rem" }}>
        <p style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1rem,2vw,1.5rem)", color: "rgba(207,196,255,0.45)", margin: "0 0 .1em", letterSpacing: "-0.01em" }}>La nostra</p>
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(5rem,18vw,14rem)", fontWeight: 900, color: "#cfc4ff", margin: 0, lineHeight: 0.82, letterSpacing: "-0.08em" }}>storia</h2>
      </div>

      {/* linee */}
      <div style={{ position: "absolute", top: TITLE_H + 200, left: "33.333%", width: "33.333%" }}>
        {segments.map(seg => (
          <div key={seg.year}>
            <VSeg drawn={drawn} seg={seg} />
            <HSeg drawn={drawn} seg={seg} />
          </div>
        ))}
      </div>

    </section>
  );
}
