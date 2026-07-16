"use client";

import React, { useRef, CSSProperties } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const LINE        = "#cfc4ff";
const BG          = "#3a1d7e";
const TITLE_H     = 0; // gestito con 100vh inline
const H           = 400;
const LW          = 10;
const LINE_LENGTH = 4000;
const LABEL_H     = 54;
const TEXT_H      = 90;

const SV_PATTERN     = [100, 200, 200, 100, 100, 500];
const svFor          = (i: number) => SV_PATTERN[i % 6];

const SCROLL_WEIGHT_V = [3.0, 3.0, 3.0, 4.0, 4.0, 4.0];
const SCROLL_WEIGHT_H = [3.0, 3.0, 3.0, 3.0, 3.0, 1.0];
const weightVFor = (i: number) => SCROLL_WEIGHT_V[i % 6];
const weightHFor = (i: number) => SCROLL_WEIGHT_H[i % 6];

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

type Seg = {
  year: number; text: string; i: number;
  sv: number;
  goRight: boolean;
  oV: number; oH: number;
  yV: number; yH: number;
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

function buildScrollMap() {
  let totalW = 0;
  for (const s of segments) totalW += s.sv * weightVFor(s.i) + H * weightHFor(s.i);
  const sp: number[] = [0], dp: number[] = [0];
  let cumW = 0;
  for (const s of segments) {
    cumW += s.sv * weightVFor(s.i);
    sp.push(cumW / totalW);
    dp.push(s.oH);
    cumW += H * weightHFor(s.i);
    sp.push(cumW / totalW);
    dp.push(s.oH + H);
  }
  return { sp, dp };
}
const { sp: SCROLL_SP, dp: SCROLL_DP } = buildScrollMap();

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

function VSeg({ drawn, seg }: { drawn: MotionValue<number>; seg: Seg }) {
  const isFork = seg.i % 6 === 5;
  const isV5   = seg.i % 6 === 4;
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
  const isHFork = seg.i % 6 === 4;
  const scaleX = useTransform(drawn, d => Math.max(0, Math.min((d - seg.oH) / H, isH4 ? 0.5 : 1)));
  const labelY = useTransform(drawn, [seg.oH + H / 2, seg.oH + H / 2 + 250], [LABEL_H, 0], { clamp: true });
  const textY  = useTransform(drawn, [seg.oH + H / 2, seg.oH + H / 2 + 250], [-TEXT_H, 0], { clamp: true });

  const side      = seg.goRight ? "left"  : "right";
  const textAlign = seg.goRight ? "left" as const : "right" as const;
  const transformOrigin = isHFork ? "50% 50%" : seg.goRight ? "0% 50%" : "100% 50%";

  return (
    <>
      <div style={{ position: "absolute", top: seg.yH, left: 0, height: LW, width: "100%", overflow: "hidden" }}>
        <motion.div style={{ height: LW, width: "100%", backgroundColor: LINE, scaleX, transformOrigin }} />
      </div>
      <div style={{ position: "absolute", top: seg.yH - LABEL_H, [side]: LW + 20, height: LABEL_H, overflow: "hidden" }}>
        <motion.div style={{ y: labelY }}>
          <h3 style={{ ...lblBase, textAlign }}>{seg.year}</h3>
        </motion.div>
      </div>
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
      height: `calc(100vh + ${LINE_LENGTH}px)`,
      position: "relative",
    }}>

      {/* overlay colore */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(85, 56, 168, 0.55)", zIndex: 0 }} />

      {/* titolo — centrato nel viewport come hero */}
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <p style={{ fontFamily: "var(--font-title)", fontSize: "clamp(0.9rem,1.5vw,1.2rem)", color: "rgba(207,196,255,0.45)", margin: "0 0 0.2em", letterSpacing: "0.08em", textTransform: "uppercase" }}>La nostra</p>
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(4rem,12vw,10rem)", fontWeight: 900, color: "#cfc4ff", margin: 0, lineHeight: 0.85, letterSpacing: "-0.06em" }}>STORIA</h2>

        {/* linea: top 630px su 900px viewport = bottom 170px */}
        <div style={{ position: "absolute", bottom: "170px", left: "50%", transform: "translateX(-50%)", width: 10, height: 100, backgroundColor: "#cfc4ff", opacity: 0.6 }} />

        {/* scroll text: top ~850px sul riferimento = quasi fuori viewport */}
        <p style={{
          position: "absolute",
          bottom: "-10px",
          left: "50%",
          fontFamily: "var(--font-open-sans)",
          fontSize: "0.65rem",
          fontWeight: 700,
          color: "#e0cffe",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          transform: "translateX(-50%) rotate(90deg)",
          margin: 0,
        }}>Scroll</p>
      </div>

      {/* linee */}
      <div style={{ position: "absolute", top: "calc(100vh + 200px)", left: "33.333%", width: "33.333%", zIndex: 1 }}>
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
