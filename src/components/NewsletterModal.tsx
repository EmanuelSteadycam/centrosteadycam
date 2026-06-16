"use client";
import { useState } from "react";
import Image from "next/image";

type Step = "intro" | "form" | "loading" | "success";
const STEPS: Step[] = ["intro", "form", "loading", "success"];
const raleway = { fontFamily: "var(--font-raleway)" };
const slide = (i: number) => ({
  transform: `translateX(-${i * 100}%)`,
  transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
});
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterModal({ onClose }: { onClose: () => void }) {
  const [step, setStep]   = useState<Step>("intro");
  const [nome, setNome]   = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const idx       = STEPS.indexOf(step);
  const emailOk   = emailRe.test(email);
  const canSubmit = nome.trim().length > 0 && emailOk;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setStep("loading");
    const [res] = await Promise.all([
      fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim() }),
      }),
      new Promise(r => setTimeout(r, 4000)), // banchina per 4s
    ]) as [Response, unknown];
    if (!res.ok) {
      setStep("form");
      setError("Qualcosa è andato storto. Riprova.");
    } else {
      setStep("success");
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative bg-white w-full max-w-[400px] shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Chiudi */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center text-black/30 hover:text-black/70 transition-colors"
          aria-label="Chiudi"
        >✕</button>

        {/* ── Carousel immagini ── */}
        <div className="h-[380px] overflow-hidden shrink-0">
          <div className="flex h-full" style={slide(idx)}>
            {[
              { src: "/newsletter-subscribe.png", cls: "object-contain object-bottom", flip: true },
              { src: "/newsletter-confirm.png",   cls: "object-contain object-bottom" },
              { src: "/newsletter-done.png",       cls: "object-contain object-center" },
              { src: "/newsletter-welcome.png",    cls: "object-cover object-right" },
            ].map(({ src, cls, flip }) => (
              <div key={src} className="relative w-full h-full shrink-0 bg-[#eef5ee]">
                <Image src={src} alt="" fill className={cls} style={flip ? { transform: "scaleX(-1)" } : undefined} unoptimized />
              </div>
            ))}
          </div>
        </div>

        {/* ── Carousel contenuti — altezza fissa uguale per tutti ── */}
        <div className="overflow-hidden" style={{ height: 250 }}>
          <div className="flex" style={slide(idx)}>

            {/* Step 1 — intro */}
            <div className="w-full shrink-0 px-8 pt-6 pb-5 flex flex-col">
              <h2 className="font-title font-semibold text-[#1e1e1e] leading-snug mb-1.5"
                style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.3rem)" }}>
                Brrr… iscriviti alla Steadynews
              </h2>
              <p className="font-light text-[#1e1e1e]/55 text-sm leading-relaxed mb-5" style={raleway}>
                Segui tutti gli aggiornamenti del Centro.
              </p>
              <button
                onClick={() => setStep("form")}
                className="w-full py-2.5 bg-[#8ac893] text-white font-title font-medium text-xs uppercase tracking-[0.14em] hover:bg-[#6db577] transition-colors mb-3"
              >
                Iscriviti
              </button>
              <p className="text-xs text-[#1e1e1e]/40 text-center" style={raleway}>
                Niente spam. Disiscriviti quando vuoi.
              </p>
            </div>

            {/* Step 2 — form */}
            <div className="w-full shrink-0 px-8 pt-5 pb-5 flex flex-col">
              <h2 className="font-title font-semibold text-[#1e1e1e] leading-snug mb-1"
                style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)" }}>
                I tuoi dati
              </h2>
              <p className="font-light text-[#1e1e1e]/50 text-sm mb-3" style={raleway}>
                Solo nome e email, promesso.
              </p>
              <form onSubmit={handleSubmit} className="space-y-2">
                <input type="text" placeholder="Il tuo nome" value={nome}
                  onChange={e => setNome(e.target.value)} required
                  className="w-full px-3 py-2 border border-[#1e1e1e]/15 text-sm focus:outline-none focus:border-[#8ac893] transition-colors"
                  style={raleway} />
                <input type="email" placeholder="La tua email" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  className="w-full px-3 py-2 border border-[#1e1e1e]/15 text-sm focus:outline-none focus:border-[#8ac893] transition-colors"
                  style={raleway} />
                {error && <p className="text-red-500 text-xs" style={raleway}>{error}</p>}
                <button type="submit" disabled={!canSubmit}
                  className={`w-full py-2.5 font-title font-medium text-xs uppercase tracking-[0.12em] transition-colors ${
                    canSubmit
                      ? "bg-[#1e1e1e] text-white hover:bg-[#333] cursor-pointer"
                      : "bg-[#1e1e1e]/15 text-[#1e1e1e]/30 cursor-not-allowed"
                  }`}>
                  Conferma →
                </button>
              </form>
            </div>

            {/* Step 3 — loading */}
            <div className="w-full shrink-0 px-8 pt-5 pb-5 flex flex-col items-center justify-center">
              <p className="font-title text-[#1e1e1e] uppercase tracking-[0.14em] text-sm mb-1">
                Un momento…
              </p>
              <p className="font-light text-[#1e1e1e]/40 text-xs mb-5" style={raleway}>
                Stiamo completando la tua iscrizione
              </p>
              <div className="flex gap-2">
                {[0, 200, 400].map((delay, i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-[#8ac893] animate-pulse"
                    style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>

            {/* Step 4 — successo */}
            <div className="w-full shrink-0 px-8 pt-6 pb-5 flex flex-col">
              <h2 className="font-title font-semibold text-[#1e1e1e] leading-snug mb-1.5"
                style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.3rem)" }}>
                Sei a bordo!
              </h2>
              <p className="font-light text-[#1e1e1e]/55 text-sm leading-relaxed mb-5" style={raleway}>
                Da adesso riceverai tutte le news sulle attività del Centro Steadycam.
              </p>
              <button onClick={onClose}
                className="w-full py-2.5 border border-[#1e1e1e] text-xs font-title uppercase tracking-[0.14em] hover:bg-[#1e1e1e] hover:text-white transition-colors">
                Inizia a leggere
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
