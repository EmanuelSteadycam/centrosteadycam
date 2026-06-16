"use client";
import { useState } from "react";
import NewsletterModal from "./NewsletterModal";

export default function NewsletterStrip() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="py-14 bg-cs-charcoal text-white text-center">
        <p
          className="text-xs font-title uppercase tracking-[0.18em] text-white/40 mb-2"
        >
          SteadyNews
        </p>
        <p
          className="font-title font-light text-white uppercase tracking-widest mb-6"
          style={{ fontSize: "clamp(1rem, 2vw, 1.3rem)" }}
        >
          Resta aggiornato
        </p>
        <p
          className="font-light text-white/50 text-sm mb-8 max-w-sm mx-auto px-4 leading-relaxed"
          style={{ fontFamily: "var(--font-raleway)" }}
        >
          Media education, promozione della salute, nuovi progetti dal Centro Steadycam.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="px-8 py-3 border border-white/30 text-white text-xs font-title uppercase tracking-[0.14em] hover:bg-white hover:text-[#1e1e1e] transition-colors duration-200"
        >
          Iscriviti alla newsletter
        </button>
      </section>

      {open && <NewsletterModal onClose={() => setOpen(false)} />}
    </>
  );
}
