"use client";
import { useEffect, useRef, useState } from "react";

const IMG = "https://centrosteadycam.it/wp-content/uploads/signalhome2.jpg";
const SCROLL_PX = 600;

export default function ProvaPage() {
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
    <div className="bg-black">
      <div ref={containerRef} style={{ height: `calc(100vh + ${SCROLL_PX}px)` }}>
        <div className="sticky top-0 w-full overflow-hidden" style={{ height: "100vh" }}>
          <img
            src={IMG} alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: `grayscale(${gray}%)` }}
          />
        </div>
      </div>
      <div className="h-screen bg-white flex items-center justify-center text-gray-400 text-sm">
        pagina continua normalmente
      </div>
    </div>
  );
}
