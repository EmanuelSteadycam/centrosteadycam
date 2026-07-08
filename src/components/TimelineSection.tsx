"use client";

import React, { useRef, CSSProperties } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const LINE        = "#cfc4ff";
const BG          = "#3a1d7e";
const TITLE_H     = 340;
const H           = 400;   // drawn units per orizzontale
const SV          = 80;    // px verticale tra un anno e l'altro (= drawn units)
const LW          = 10;    // spessore linea
const LINE_LENGTH = 6000;  // altezza sezione → aumenta per rallentare
const LABEL_H     = 54;
const TEXT_H      = 60;

/* ── dati timeline ──────────────────────────────────────────────────────── */
const YEARS_DATA: { year: number; text: string }[] = [
  { year: 2000, text: "Fondazione del Centro Steadycam ad Alba (CN)" },
  { year: 2001, text: "" },
  { year: 2002, text: "" },
  { year: 2003, text: "Avvio dei laboratori di media education nelle scuole" },
  { year: 2004, text: "" },
  { year: 2005, text: "" },
  { year: 2006, text: "" },
  { year: 2007, text: "Nasce l'archivio: oltre 34.000 schede audiovisive" },
  { year: 2008, text: "" },
  { year: 2009, text: "" },
  { year: 2010, text: "" },
  { year: 2011, text: "" },
  { year: 2012, text: "Avvio del progetto Comunicare Salute" },
  { year: 2013, text: "Nasce il progetto Restart" },
  { year: 2014, text: "" },
  { year: 2015, text: "Inaugurazione del Centro Display" },
  { year: 2016, text: "Adesione al progetto Rete senza Fili" },
  { year: 2017, text: "" },
  { year: 2018, text: "Patentino dello Smartphone" },
  { year: 2019, text: "" },
  { year: 2020, text: "" },
  { year: 2021, text: "Avvio del progetto SteadyGap" },
  { year: 2022, text: "" },
  { year: 2023, text: "" },
  { year: 2024, text: "" },
  { year: 2025, text: "" },
  { year: 2026, text: "In corso" },
];

/* ── geometria derivata ─────────────────────────────────────────────────── */
type Seg = {
  year: number; text: string; i: number;
  goRight: boolean;
  oV: number; oH: number;   // offsets in "drawn" units
  yV: number; yH: number;   // posizioni Y visive in px
};

const segments: Seg[] = YEARS_DATA.map((y, i) => ({
  ...y, i,
  goRight: i % 2 === 0,
  oV: i * (SV + H),
  oH: i * (SV + H) + SV,
  yV: i * (SV + LW),
  yH: i * (SV + LW) + SV,
}));

const LAST_DRAWN = segments[segments.length - 1].oH + H;

/* ── stili testo ─────────────────────────────────────────────────────────── */
const lblBase: CSSProperties = {
  fontFamily: "var(--font-oswald)",
  fontSize: "clamp(1.4rem, 2.4vw, 2.2rem)",
  fontWeight: 900,
  letterSpacing: "0.08em",
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
  const h = useTransform(drawn, d => Math.max(0, Math.min(d - seg.oV, SV)));
  return (
    <div style={{
      position: "absolute",
      top: seg.yV,
      [seg.goRight ? "left" : "right"]: 0,
      width: LW, height: SV, overflow: "hidden",
    }}>
      <motion.div style={{ width: LW, height: h, backgroundColor: LINE }} />
    </div>
  );
}

function HSeg({ drawn, seg }: { drawn: MotionValue<number>; seg: Seg }) {
  const scaleX = useTransform(drawn, d => Math.max(0, Math.min((d - seg.oH) / H, 1)));
  const labelY = useTransform(drawn, [seg.oH + H / 2, seg.oH + H / 2 + 250], [LABEL_H, 0], { clamp: true });
  const textY  = useTransform(drawn, [seg.oH + H / 2, seg.oH + H / 2 + 250], [-TEXT_H, 0], { clamp: true });

  const side      = seg.goRight ? "left"  : "right";
  const textAlign = seg.goRight ? "left" as const : "right" as const;

  return (
    <>
      {/* linea orizzontale */}
      <div style={{ position: "absolute", top: seg.yH, left: 0, height: LW, width: "100%", overflow: "hidden" }}>
        <motion.div style={{
          height: LW, width: "100%", backgroundColor: LINE,
          scaleX,
          transformOrigin: seg.goRight ? "0% 50%" : "100% 50%",
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
  const drawn = useTransform(scrollYProgress, [0, 1], [0, LAST_DRAWN]);

  return (
    <section ref={ref} style={{ backgroundColor: BG, height: TITLE_H + LINE_LENGTH, position: "relative" }}>

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
