import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "I Progetti — Centro Steadycam",
  description: "I progetti del Centro Steadycam: Display, Restart, Comunicare Salute e altri.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

/* ── Progetti principali ─────────────────────────────────────────────────── */
const major = [
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
    title: "Rete senza Fili",
    years: "2016 — 2021",
    desc: "Progetto regionale sulla dipendenza da smartphone e dai social media, rivolto a studenti, genitori e insegnanti.",
    href: "#",
    img: `${WP}/Steadycam-RetesenzaFili-evento-finale-scaled-e1758011411350-1024x543.png`,
    bg: "#1a3a5c",
    span: "col-span-1",
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
    title: "Patentino dello Smartphone",
    years: "2018 — 2023",
    desc: "Percorso educativo sull'uso consapevole degli smartphone per le scuole secondarie di primo grado.",
    href: "#",
    img: `${WP}/Steadycam-Patente-per-lo-smartphone2-1024x747.png`,
    bg: "#2d2416",
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

/* ── Timeline ───────────────────────────────────────────────────────────── */
type TEntry = { year: string; title: string; major?: boolean; future?: boolean };

const timeline: TEntry[] = [
  // PASSATO
  { year: "2000", title: "Fondazione del Centro Steadycam", major: true },
  { year: "2003", title: "Primi laboratori media education nelle scuole" },
  { year: "2007", title: "Avvio Archivio Storico Audiovisivo" },
  { year: "2010", title: "Collaborazione con ASL CN2" },
  { year: "2012", title: "Comunicare Salute", major: true },
  { year: "2013", title: "Restart — gioco d'azzardo nelle scuole", major: true },
  { year: "2014", title: "Workshop famiglie e media" },
  { year: "2015", title: "Centro Display", major: true },
  { year: "2016", title: "Rete senza Fili", major: true },
  { year: "2017", title: "Archivio ADAM — azzardo e media" },
  { year: "2018", title: "Patentino dello Smartphone", major: true },
  { year: "2019", title: "Boomerang — progetto anziani e digitale" },
  { year: "2020", title: "Online safety — adattamento COVID" },
  // PRESENTE
  { year: "2021", title: "SteadyGap", major: true },
  { year: "2023", title: "Steadynews — newsletter del Centro" },
  { year: "2024", title: "AI e giovani — nuovo percorso formativo" },
  { year: "2025", title: "Placeholder progetto in corso" },
  // FUTURO
  { year: "2026", title: "Placeholder progetto pianificato", future: true },
  { year: "2027", title: "Placeholder progetto pianificato", future: true },
];

const present = ["2021", "2022", "2023", "2024", "2025"];
const future  = ["2026", "2027", "2028", "2029"];

function phase(entry: TEntry): "past" | "present" | "future" {
  if (entry.future) return "future";
  if (present.includes(entry.year)) return "present";
  return "past";
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
            Vent'anni di attività tra media education, prevenzione e promozione della salute nel territorio dell'ASL CN2.
          </p>
        </div>
      </div>

      {/* ── Grandi Progetti ── */}
      <section className="max-w-[1000px] mx-auto px-4 pb-20">
        <h2
          className="font-title font-light text-[#1e1e1e]/40 uppercase tracking-[0.18em] text-xs mb-6"
        >
          I progetti principali
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {major.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className={`group relative overflow-hidden ${p.span} h-[280px] flex flex-col justify-end p-6`}
              style={{ background: p.bg }}
            >
              {"logoSrc" in p && p.logoSrc ? (
                /* ── Card con logo centrato (es. Restart) ── */
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
                    className="absolute inset-0 opacity-20 bg-center bg-cover transition-opacity duration-500 group-hover:opacity-30"
                    style={{ backgroundImage: `url(${p.img})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
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
          ))}
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="bg-[#f8f8f6] py-20">
        <div className="max-w-[800px] mx-auto px-4">
          <h2
            className="font-title font-light text-[#1e1e1e]/40 uppercase tracking-[0.18em] text-xs mb-12"
          >
            La nostra storia
          </h2>

          {/* Legenda */}
          <div className="flex gap-6 mb-12">
            {[
              { label: "Progetto principale", dot: "bg-[#1e1e1e]", size: "w-3 h-3" },
              { label: "Progetto",            dot: "bg-[#1e1e1e]/30", size: "w-2 h-2" },
              { label: "In corso",            dot: "bg-[#8ac893]", size: "w-2.5 h-2.5" },
              { label: "Pianificato",         dot: "border-2 border-dashed border-[#1e1e1e]/30 bg-transparent", size: "w-2.5 h-2.5" },
            ].map(({ label, dot, size }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`rounded-full shrink-0 ${dot} ${size}`} />
                <span className="text-xs text-[#1e1e1e]/40" style={{ fontFamily: "var(--font-raleway)" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Etichette di fase */}
          {(["past", "present", "future"] as const).map((ph) => {
            const entries = timeline.filter((e) => phase(e) === ph);
            const labels: Record<string, string> = {
              past:    "Passato",
              present: "Presente",
              future:  "Futuro",
            };
            return (
              <div key={ph} className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-title text-xs uppercase tracking-[0.2em] text-[#1e1e1e]/30">
                    {labels[ph]}
                  </span>
                  <div className="flex-1 h-px bg-[#1e1e1e]/10" />
                </div>

                <div className="relative pl-8">
                  {/* Linea verticale */}
                  <div
                    className="absolute left-[5px] top-0 bottom-0 w-px"
                    style={{
                      background: ph === "future"
                        ? "repeating-linear-gradient(to bottom, #1e1e1e22 0px, #1e1e1e22 4px, transparent 4px, transparent 8px)"
                        : ph === "present" ? "#8ac893" : "#1e1e1e22",
                    }}
                  />

                  <div className="flex flex-col gap-5">
                    {entries.map((e, i) => {
                      const p = phase(e);
                      const dotCls = p === "future"
                        ? "w-2.5 h-2.5 border-2 border-dashed border-[#1e1e1e]/30 bg-[#f8f8f6]"
                        : p === "present"
                          ? `${e.major ? "w-3 h-3" : "w-2.5 h-2.5"} bg-[#8ac893] rounded-full`
                          : `${e.major ? "w-3 h-3 bg-[#1e1e1e]" : "w-2 h-2 bg-[#1e1e1e]/30"} rounded-full`;

                      return (
                        <div key={i} className="flex items-start gap-4">
                          {/* Dot */}
                          <div className="shrink-0 flex items-center justify-center" style={{ width: 12, marginTop: 4 }}>
                            <span className={`rounded-full ${dotCls}`} />
                          </div>

                          {/* Anno + titolo */}
                          <div className="flex items-baseline gap-3 flex-1 min-w-0">
                            <span className="font-title text-xs text-[#1e1e1e]/30 tracking-widest shrink-0 w-10">
                              {e.year}
                            </span>
                            <span
                              className={`font-title text-sm ${e.major ? "font-medium text-[#1e1e1e]" : "font-light text-[#1e1e1e]/55"} ${p === "future" ? "opacity-40" : ""}`}
                            >
                              {e.title}
                            </span>
                            {e.major && (
                              <span className="shrink-0 text-[10px] font-title uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
                                style={{
                                  background: p === "present" ? "#eef5ee" : "#1e1e1e08",
                                  color: p === "present" ? "#3a7d44" : "#1e1e1e40",
                                }}>
                                principale
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
