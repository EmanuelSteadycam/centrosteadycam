"use client";
import { useRef, useEffect, useLayoutEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function SiteSwitcherPill({
  active,
  collapsed = false,
  indicatorColor = "#1d1d1f",
  textColor = "#1d1d1f",
  activeTextColor = "#1d1d1f",
  pillBg = "rgba(232,232,237,0.7)",
}: {
  active: 0 | 1;
  collapsed?: boolean;
  indicatorColor?: string;
  textColor?: string;
  activeTextColor?: string;
  pillBg?: string;
}) {
  const pillRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([null, null]);
  const [ind, setInd] = useState({ left: 0, width: 0 });
  const [current, setCurrent] = useState<0 | 1>(active);
  const [hoveredIdx, setHoveredIdx] = useState<0 | 1 | null>(null);
  const router = useRouter();

  const measure = useCallback((idx: number) => {
    const pill = pillRef.current;
    const btn = btnRefs.current[idx];
    if (!pill || !btn) return;
    const pr = pill.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setInd({ left: br.left - pr.left, width: br.width });
  }, []);

  useLayoutEffect(() => { measure(current); }, [current, measure]);

  useEffect(() => {
    const onResize = () => measure(current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [current, measure]);

  // Rimisura dopo che l'animazione expand/collapse è completata
  useEffect(() => {
    const t = setTimeout(() => measure(current), 750);
    return () => clearTimeout(t);
  }, [collapsed, current, measure]);

  const handleClick = (i: 0 | 1) => {
    setCurrent(i);
    if (i === 0 && (active !== 0 || collapsed)) setTimeout(() => router.push("/"), 300);
    if (i === 1 && active !== 1) setTimeout(() => router.push("/display"), 300);
  };

  const handleHover = (i: 0 | 1) => { measure(i); setHoveredIdx(i); };
  const handleLeave = () => { measure(current); setHoveredIdx(null); };

  const activeForBtn = (i: 0 | 1) => hoveredIdx !== null ? hoveredIdx === i : current === i;

  return (
    <div
      ref={pillRef}
      className="relative flex items-center rounded-full"
      style={{ background: pillBg, padding: 2 }}
    >
      {ind.width > 0 && (
        <div
          className="absolute rounded-full transition-all duration-300 ease-in-out"
          style={{ background: indicatorColor, top: 2, bottom: 2, left: ind.left, width: ind.width }}
        />
      )}
      {/* Centro Steadycam — sempre visibile */}
      <button
        ref={el => { btnRefs.current[0] = el; }}
        onClick={() => handleClick(0)}
        onMouseEnter={() => handleHover(0)}
        onMouseLeave={handleLeave}
        className="relative z-10 whitespace-nowrap px-4 py-3 rounded-full text-[13px] font-medium transition-colors duration-200 select-none"
        style={{ color: activeForBtn(0) ? activeTextColor : textColor }}
      >
        Centro Steadycam
      </button>

      {/* Centro Display — si espande/contrae con transizione */}
      <div
        className="overflow-hidden"
        style={{
          maxWidth: collapsed ? 0 : 200,
          opacity: collapsed ? 0 : 1,
          paddingLeft: collapsed ? 0 : 4,
          transition: "max-width 0.7s ease-in-out, opacity 0.5s ease-in-out, padding-left 0.7s ease-in-out",
        }}
      >
        <button
          ref={el => { btnRefs.current[1] = el; }}
          onClick={() => handleClick(1)}
          onMouseEnter={() => handleHover(1)}
          onMouseLeave={handleLeave}
          className="relative z-10 whitespace-nowrap px-4 py-3 rounded-full text-[13px] font-medium transition-colors duration-200 select-none"
          style={{ color: activeForBtn(1) ? activeTextColor : textColor }}
        >
          Centro Display
        </button>
      </div>
    </div>
  );
}
