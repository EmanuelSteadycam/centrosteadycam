import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "I Progetti — Centro Steadycam",
  description: "I progetti del Centro Steadycam: Display, Restart, Comunicare Salute e altri.",
};

const WP = "/media";

/* ── Progetti propri ─────────────────────────────────────────────────────── */
const ownProjects = [
  {
    title: "Centro Display",
    years: "2015 — oggi",
    desc: "Il laboratorio multimediale del Centro: un percorso interattivo tra media, salute e tecnologia per le scuole del territorio.",
    href: "/display",
    img: `${WP}/Logo_Display21_6x3.5-1024x598.png`,
    bg: "#0d1117",
    span: "col-span-2",
  },
  {
    title: "Comunicare Salute",
    years: "2012 — 2018",
    desc: "Formazione e comunicazione sulla salute per operatori sanitari, insegnanti e professionisti del territorio piemontese.",
    href: "/comunicare-salute",
    img: `${WP}/Logo-per-home@3x.png`,
    bg: "#2c5364",
    span: "col-span-1",
  },
  {
    title: "Restart",
    years: "2013 — 2020",
    desc: "Sensibilizzazione al gioco d'azzardo patologico nelle scuole superiori del Piemonte. Oltre 10.000 studenti coinvolti.",
    href: "/restart",
    img: null,
    logoSrc: `${WP}/RESTART_trasp_newsletter.svg`,
    logoSub: "PREVENIRE IL GIOCO D'AZZARDO",
    bg: "#000",
    span: "col-span-1",
  },
  {
    title: "SteadyGap",
    years: "2021 — oggi",
    desc: "Progetto di ricerca e intervento sul divario digitale tra generazioni: anziani, famiglie e comunità locali.",
    href: "#",
    img: `${WP}/ProgettiSteadycamNew-scaled.jpg`,
    bg: "#1a1a2e",
    span: "col-span-2",
  },
];

/* ── Progetti con partecipazione ─────────────────────────────────────────── */
const partnerProjects = [
  {
    title: "Rete senza Fili",
    years: "2016 — 2021",
    desc: "Progetto regionale sulla dipendenza da smartphone e dai social media, rivolto a studenti, genitori e insegnanti.",
    href: "https://www.retesenzafili.it/",
    external: true,
    img: `${WP}/Steadycam-RetesenzaFili-evento-finale-scaled-e1758011411350-1024x543.png`,
    bg: "#1a3a5c",
    span: "col-span-1",
  },
  {
    title: "Patentino dello Smartphone",
    years: "2018 — 2023",
    desc: "Percorso educativo sull'uso consapevole degli smartphone per le scuole secondarie di primo grado.",
    href: "#",
    img: `${WP}/Steadycam-Patente-per-lo-smartphone2-1024x747.png`,
    bg: "#2d2416",
    span: "col-span-1",
  },
];

/* ── Card progetto ───────────────────────────────────────────────────────── */
type Project = typeof ownProjects[number] | typeof partnerProjects[number];

function ProjectCard({ p }: { p: Project }) {
  return (
    <Link
      href={p.href}
      target={"external" in p && p.external ? "_blank" : undefined}
      rel={"external" in p && p.external ? "noopener noreferrer" : undefined}
      className={`group relative overflow-hidden ${p.span} h-[280px] flex flex-col justify-end p-6`}
      style={{ background: p.bg }}
    >
      {"logoSrc" in p && p.logoSrc ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
          <Image
            src={p.logoSrc as string}
            alt={p.title}
            width={340}
            height={206}
            className="w-[110%] max-w-[520px] transition-transform duration-500 group-hover:scale-110"
            unoptimized
          />
          {"logoSub" in p && p.logoSub && (
            <p className="font-title font-black text-white uppercase tracking-[0.12em] text-xs text-center">
              {p.logoSub as string}
            </p>
          )}
        </div>
      ) : (
        <>
          <div
            className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${p.img})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="relative z-10">
            <span className="text-white/40 text-xs font-title uppercase tracking-[0.14em] mb-1 block"
              style={{ fontFamily: "var(--font-raleway)" }}>
              {p.years}
            </span>
            <h3 className="font-title font-semibold text-white text-xl uppercase tracking-[0.06em] mb-2 leading-tight">
              {p.title}
            </h3>
            <p className="text-white/60 text-xs leading-relaxed line-clamp-2"
              style={{ fontFamily: "var(--font-raleway)" }}>
              {p.desc}
            </p>
          </div>
        </>
      )}
    </Link>
  );
}


export default function IProgettiPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ── */}
      <div className="max-w-[1000px] mx-auto px-4 pt-[120px] pb-10">
        <div className="border-b border-[#1e1e1e]/10 pb-6">
          <h1
            className="font-title font-semibold text-[#1e1e1e] uppercase tracking-[0.12em]"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.2rem)" }}
          >
            I Progetti
          </h1>
          <p className="font-light text-[#1e1e1e]/50 text-sm mt-2 max-w-xl" style={{ fontFamily: "var(--font-raleway)" }}>
            Vent&apos;anni di attività tra media education, prevenzione e promozione della salute nel territorio dell&apos;ASL CN2.
          </p>
        </div>
      </div>

      {/* ── Progetti propri ── */}
      <section className="max-w-[1000px] mx-auto px-4 pb-12">
        <h2 className="font-title font-light text-[#1e1e1e]/40 uppercase tracking-[0.18em] text-xs mb-6">
          I nostri progetti
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {ownProjects.map((p) => (
            <ProjectCard key={p.title} p={p} />
          ))}
        </div>
      </section>

      {/* ── Progetti con partecipazione ── */}
      <section className="max-w-[1000px] mx-auto px-4 pb-20">
        <h2 className="font-title font-light text-[#1e1e1e]/40 uppercase tracking-[0.18em] text-xs mb-6">
          Progetti ai quali abbiamo partecipato
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {partnerProjects.map((p) => (
            <ProjectCard key={p.title} p={p} />
          ))}
        </div>
      </section>

    </div>
  );
}
