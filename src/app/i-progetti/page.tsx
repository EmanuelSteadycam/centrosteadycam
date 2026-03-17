import type { Metadata } from "next";
import NavGrid from "@/components/NavGrid";

export const metadata: Metadata = {
  title: "I Progetti — Centro Steadycam",
  description: "I progetti del Centro Steadycam: Display, Restart, ADAM, Comunicare Salute e altri.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

const projects = [
  {
    title: "Display",
    desc: "Il laboratorio multimediale del Centro Steadycam: un percorso interattivo tra media, salute e tecnologia.",
    href: "/display",
    img: `${WP}/Steadycam-Dispaly-Storie-03.jpg`,
    color: "#ff7302",
  },
  {
    title: "Restart",
    desc: "Sensibilizzazione al gioco d'azzardo nelle scuole superiori del Piemonte.",
    href: "/restart",
    img: `${WP}/RESTART_MOBILE_DLT1_4.svg`,
    color: "#a3d39c",
  },
  {
    title: "Archivio ADAM",
    desc: "Archivio digitale Azzardo e Media: oltre 200 risorse per l'educazione alla prevenzione.",
    href: "/adam",
    img: `${WP}/ProgettiSteadycamNew-scaled.jpg`,
    color: "#3f424a",
  },
  {
    title: "Comunicare Salute",
    desc: "Formazione e comunicazione sulla salute per operatori, insegnanti e professionisti.",
    href: "/comunicare-salute",
    img: `${WP}/Logo-per-home@3x.png`,
    color: "#88bfe0",
  },
];

export default function IProgettiPage() {
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="page-hero" style={{ height: 400 }}>
        <img
          src={`${WP}/ProgettiSteadycamNew-scaled.jpg`}
          alt="I Progetti"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="page-hero-title">i progetti</h1>
      </div>

      {/* Projects grid */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {projects.map((p) => (
              <a key={p.title} href={p.href} className="group block overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <h3
                    className="absolute bottom-4 left-4 text-white font-title font-semibold text-xl uppercase tracking-[0.08em]"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
                  >
                    {p.title}
                  </h3>
                </div>
                <div className="p-5">
                  <p className="text-cs-text text-sm leading-relaxed">{p.desc}</p>
                  <span
                    className="inline-block mt-4 text-xs font-title font-semibold uppercase tracking-wider"
                    style={{ color: p.color }}
                  >
                    Scopri →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <NavGrid exclude="/i-progetti" />
    </div>
  );
}
