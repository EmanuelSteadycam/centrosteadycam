"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const WP = "https://centrosteadycam.it/wp-content/uploads";

const nav = [
  { label: "Home",     href: "/" },
  { label: "Blog",     href: "/blog" },
  { label: "Il centro",href: "/il-centro" },
  { label: "Metodo",   href: "/il-metodo" },
  { label: "Servizi",  href: "/i-servizi" },
  {
    label: "Progetti", href: "/i-progetti",
    children: [
      { label: "Comunicare Salute", href: "/comunicare-salute" },
      { label: "ADAM",              href: "/adam" },
      { label: "RESTART",           href: "/restart" },
    ],
  },
  { label: "Archivio", href: "/l-archivio" },
  { label: "Staff",    href: "/staff" },
  { label: "Contatti", href: "/contatti" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown]   = useState(false);

  if (pathname === "/display") return null;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-cs-charcoal shadow-lg" : "bg-cs-charcoal/90 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-14">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 mr-6">
          <Image
            src={`${WP}/Logo-steadycam.png`}
            alt="Centro Steadycam"
            width={140}
            height={40}
            className="h-8 w-auto object-contain"
            unoptimized
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          {nav.map((item) =>
            item.children ? (
              <div key={item.label} className="relative">
                <button
                  onMouseEnter={() => setDropdown(true)}
                  onMouseLeave={() => setDropdown(false)}
                  className="px-3 py-4 text-xs text-white/80 hover:text-white font-title font-medium uppercase tracking-wider transition-colors flex items-center gap-1"
                >
                  {item.label}
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdown && (
                  <div
                    className="absolute top-full left-0 bg-cs-charcoal shadow-xl min-w-48 py-1 z-50"
                    onMouseEnter={() => setDropdown(true)}
                    onMouseLeave={() => setDropdown(false)}
                  >
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block px-4 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/10 font-title uppercase tracking-wider transition-colors"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-4 text-xs font-title font-medium uppercase tracking-wider transition-colors ${
                  pathname === item.href
                    ? "text-cs-orange border-b-2 border-cs-orange"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden ml-auto p-2 text-white/80 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-cs-charcoal border-t border-white/10 py-2">
          {nav.map((item) =>
            item.children ? (
              <div key={item.label}>
                <div className="px-6 py-2 text-xs text-white/40 font-title uppercase tracking-widest">
                  {item.label}
                </div>
                {item.children.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-10 py-2 text-xs text-white/70 hover:text-white font-title uppercase tracking-wider"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-6 py-2.5 text-xs font-title uppercase tracking-wider transition-colors ${
                  pathname === item.href ? "text-cs-orange" : "text-white/80 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
