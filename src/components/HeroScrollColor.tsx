"use client";
import { useEffect, useRef, useState } from "react";


const WORDS = ["Salute", "Prevenzione", "Digitale"];
const SHOW_MS = 2200;
const GLITCH_MS = 350;

export function GlitchTitle() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"show" | "out" | "in">("in");

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "show") {
      t = setTimeout(() => setPhase("out"), SHOW_MS);
    } else if (phase === "out") {
      t = setTimeout(() => {
        setIndex(i => (i + 1) % WORDS.length);
        setPhase("in");
      }, GLITCH_MS);
    } else {
      t = setTimeout(() => setPhase("show"), GLITCH_MS);
    }
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <span
      className={phase === "out" ? "glitch-out" : phase === "in" ? "glitch-in" : ""}
      data-text={WORDS[index]}
    >
      {WORDS[index]}
    </span>
  );
}

const IMG = "https://centrosteadycam.it/wp-content/uploads/signalhome2.jpg";
const SCROLL_PX = 600;

export default function HeroScrollColor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const scrolled = -el.getBoundingClientRect().top;
      setProgress(Math.max(0, Math.min(1, scrolled / SCROLL_PX)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const gray = Math.round(100 - progress * 100);

  return (
    <div ref={containerRef} style={{ height: `calc(100vh + ${SCROLL_PX}px)` }}>
      <div className="sticky top-0 w-full overflow-hidden" style={{ height: "100vh" }}>
        <img
          src={IMG}
          alt="Centro Steadycam"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: `grayscale(${gray}%)` }}
        />

        {/* Overlay gradiente — appare con lo scroll */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
            opacity: progress,
          }}
        />

        {/* Titolo che appare con lo scroll */}
        <div
          className="absolute bottom-12 left-0 right-0 flex justify-center z-10 pointer-events-none"
          style={{
            opacity: progress,
            transform: `translateY(${(1 - progress) * 24}px)`,
          }}
        >
          <h1
            className="font-title font-bold tracking-[0.04em] select-none text-white text-center"
            style={{
              fontSize: "clamp(3rem, 7vw, 7.5rem)",
              textShadow: "0 2px 24px rgba(0,0,0,0.5)",
            }}
          >
            Centro Steadycam
          </h1>
        </div>


      </div>
    </div>
  );
}
