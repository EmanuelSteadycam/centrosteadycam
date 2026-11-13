"use client";
import { useState } from "react";
import NewsletterModal from "@/components/NewsletterModal";

// Invito alla SteadyNews in fondo alla pagina del podcast: stesso modal/iscrizione Brevo del blog, grafica del podcast
export default function SteadyNewsInvito({ titleClassName, pink }: { titleClassName: string; pink: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="text-center">
        <h2 className={`${titleClassName} uppercase text-3xl md:text-4xl leading-[0.95] tracking-[0.08em] mb-5`}>
          Ti è piaciuto il podcast?
        </h2>
        <p className="font-title text-base font-light text-white/90 max-w-lg mx-auto mb-8 leading-relaxed">
          Se vuoi restare aggiornato sulle attività del Centro Steadycam
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-title font-semibold rounded-lg uppercase tracking-widest text-sm px-7 py-3.5 transition-transform hover:-rotate-2"
          style={{ background: pink, color: "#fff" }}
        >
          Iscriviti alla SteadyNews
        </button>
      </div>

      {open && <NewsletterModal onClose={() => setOpen(false)} />}
    </>
  );
}
