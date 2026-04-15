"use client";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const centroLinks = [
  { label: "I Servizi",  href: "/i-servizi" },
  { label: "Il Metodo",  href: "/il-metodo" },
  { label: "L'Archivio", href: "/l-archivio" },
  { label: "Staff",      href: "/staff" },
  { label: "Contatti",   href: "/contatti" },
];

const centroPaths = centroLinks.map((l) => l.href).concat(["/il-centro"]);

const pillBg    = "rgba(160,160,160,0.45)";
const green     = "#a3d39c";
const textOn    = "#1d1d1f";
const textOff   = "rgba(255,255,255,0.6)";

function getActiveIdx(pathname: string) {
  if (centroPaths.some((p) => pathname.startsWith(p))) return 0;
  if (pathname.startsWith("/i-progetti")) return 1;
  if (pathname.startsWith("/blog"))       return 2;
  return -1;
}

export default function Navbar() {
  const pathname    = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [hoveredIdx, setHoveredIdx]     = useState<number | null>(null);
  const [ind, setInd]                   = useState({ left: 0, width: 0 });

  const pillRef  = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([null, null, null]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeIdx    = getActiveIdx(pathname);
  const indicatorIdx = hoveredIdx !== null ? hoveredIdx : activeIdx;

  const measure = useCallback((idx: number) => {
    const pill = pillRef.current;
    const item = itemRefs.current[idx];
    if (!pill || !item) return;
    const pr = pill.getBoundingClientRect();
    const br = item.getBoundingClientRect();
    setInd({ left: br.left - pr.left, width: br.width });
  }, []);

  useLayoutEffect(() => {
    if (indicatorIdx >= 0) measure(indicatorIdx);
    else setInd({ left: 0, width: 0 });
  }, [indicatorIdx, measure]);

  useEffect(() => {
    const onResize = () => { if (indicatorIdx >= 0) measure(indicatorIdx); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [indicatorIdx, measure]);

  // Chiudi dropdown se si clicca fuori
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/display")) return null;

  const itemCls = "relative z-10 whitespace-nowrap py-3 rounded-full text-[13px] font-medium select-none transition-colors duration-200 cursor-pointer text-center";

  return (
    <>
      {/* ── Desktop nav pill ── */}
      <div
        ref={pillRef}
        className="fixed top-[50px] right-6 z-[51] hidden md:flex items-center rounded-full px-1.5 py-1.5"
        style={{ background: pillBg }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Indicatore verde scorrevole */}
        {ind.width > 0 && (
          <div
            className="absolute rounded-full transition-all duration-300 ease-in-out"
            style={{ background: green, top: 6, bottom: 6, left: ind.left, width: ind.width }}
          />
        )}

        {/* Il Centro */}
        <div className="relative" ref={dropdownRef}>
          <button
            ref={(el) => { itemRefs.current[0] = el; }}
            className={itemCls}
            style={{ width: 112, color: (hoveredIdx === 0 || (hoveredIdx === null && activeIdx === 0)) ? textOn : textOff }}
            onMouseEnter={() => setHoveredIdx(0)}
            onClick={() => setDropdownOpen((v) => !v)}
          >
            Il Centro
            <svg
              width="9" height="5" viewBox="0 0 9 5" fill="none"
              className={`inline ml-1.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            >
              <path d="M1 1l3.5 3L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              className="absolute top-full right-0 mt-2 rounded-2xl py-2 min-w-[160px] z-50"
              style={{ background: pillBg, backdropFilter: "blur(8px)" }}
            >
              {centroLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-5 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-200 hover:text-white"
                  style={{ color: pathname === link.href ? textOn : textOff }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>


        {/* I Progetti */}
        <Link
          href="/i-progetti"
          ref={(el) => { itemRefs.current[1] = el; }}
          className={itemCls}
          style={{ width: 112, color: (hoveredIdx === 1 || (hoveredIdx === null && activeIdx === 1)) ? textOn : textOff }}
          onMouseEnter={() => setHoveredIdx(1)}
        >
          I Progetti
        </Link>

        {/* Blog */}
        <Link
          href="/blog"
          ref={(el) => { itemRefs.current[2] = el; }}
          className={itemCls}
          style={{ width: 112, color: (hoveredIdx === 2 || (hoveredIdx === null && activeIdx === 2)) ? textOn : textOff }}
          onMouseEnter={() => setHoveredIdx(2)}
        >
          Blog
        </Link>
      </div>

      {/* ── Mobile hamburger ── */}
      <button
        className="fixed top-[54px] right-6 z-[51] flex flex-col justify-center gap-[5px] p-2 md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Apri menu"
        style={{ color: "#fff" }}
      >
        <span className="block w-5 h-px bg-current" />
        <span className="block w-5 h-px bg-current" />
        <span className="block w-5 h-px bg-current" />
      </button>

      {/* ── Mobile fullscreen overlay ── */}
      <div
        className={`fixed inset-0 z-[100] bg-white flex flex-col transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex justify-end px-6 py-5">
          <button onClick={() => setMobileOpen(false)} className="text-cs-charcoal text-2xl leading-none" aria-label="Chiudi menu">✕</button>
        </div>
        <nav className="flex flex-col px-8 mt-10 gap-2">
          <span className="font-title text-3xl font-light uppercase tracking-[0.1em] text-cs-charcoal mb-2">Il Centro</span>
          <div className="flex flex-col gap-3 pl-5 mb-8 border-l-2" style={{ borderColor: green }}>
            {centroLinks.map((link) => (
              <Link key={link.href} href={link.href} className="font-title text-xl font-light uppercase tracking-[0.08em] text-cs-charcoal hover:text-cs-sage transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <Link href="/i-progetti" className="font-title text-3xl font-light uppercase tracking-[0.1em] text-cs-charcoal hover:text-cs-sage transition-colors mb-2">I Progetti</Link>
          <Link href="/blog"       className="font-title text-3xl font-light uppercase tracking-[0.1em] text-cs-charcoal hover:text-cs-sage transition-colors">Blog</Link>
        </nav>
      </div>
    </>
  );
}
