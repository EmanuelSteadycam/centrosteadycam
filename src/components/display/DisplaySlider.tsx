"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";
import { submitBooking } from "@/app/display/actions";

// ── Slide types ───────────────────────────────────────────────────────────────
export type SlideId =
  | "intro"
  | "apertura"
  | "portfolio"
  | "timeline"
  | "storie"
  | "gaming"
  | "making"
  | "corpo"
  | "booking"
  | "il-centro"
  | "il-progetto"
  | "partner"
  | "contatti";

const WP = "https://centrosteadycam.it/wp-content/uploads";

// ── Animation helpers ─────────────────────────────────────────────────────────
const BASE_DELAY = 0.6; // attende la fine della transizione di pagina (0.55s)

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay: BASE_DELAY + delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const fadeLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -55 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, delay: BASE_DELAY + delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const fadeRight = (delay = 0) => ({
  initial: { opacity: 0, x: 55 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, delay: BASE_DELAY + delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6, delay: BASE_DELAY + delay },
});

// ── Hamburger Menu ────────────────────────────────────────────────────────────
const menuItems: { label: string; slide: SlideId }[] = [
  { label: "HOME", slide: "intro" },
  { label: "IL CENTRO", slide: "il-centro" },
  { label: "LE STANZE", slide: "portfolio" },
  { label: "PRENOTA", slide: "booking" },
  { label: "PROGETTO", slide: "il-progetto" },
  { label: "PARTNER", slide: "partner" },
  { label: "INFO", slide: "contatti" },
];

function HamburgerMenu({
  open,
  onToggle,
  onNavigate,
  current,
  lightBg,
}: {
  open: boolean;
  onToggle: () => void;
  onNavigate: (id: SlideId) => void;
  current: SlideId;
  lightBg: boolean;
}) {
  return (
    <>
      {/* Hamburger trigger (visible when closed) */}
      {!open && (
        <button
          onClick={onToggle}
          className="fixed top-4 right-4 z-[200] w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
          aria-label="Apri menu"
        >
          <span className="block w-6 h-[2px]" style={{ background: lightBg ? "#222" : "#fff" }} />
          <span className="block w-6 h-[2px]" style={{ background: lightBg ? "#222" : "#fff" }} />
          <span className="block w-6 h-[2px]" style={{ background: lightBg ? "#222" : "#fff" }} />
        </button>
      )}

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onToggle}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 300,
            }}
          >
            {/* X close button */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              style={{
                position: "absolute",
                top: "20px",
                right: "28px",
                color: lightBg ? "#222" : "#fff",
                fontSize: "22px",
                fontWeight: 300,
                lineHeight: 1,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-raleway)",
                opacity: 0.85,
              }}
              aria-label="Chiudi menu"
            >
              ✕
            </button>

            {/* Menu items */}
            <nav onClick={(e) => e.stopPropagation()} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-end", paddingRight: "40px", paddingTop: "60px" }}>
              {menuItems.map((item, i) => {
                const isActive = current === item.slide;
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.04 + i * 0.05, ease: "easeOut" }}
                    onClick={() => { onNavigate(item.slide); onToggle(); }}
                    style={{
                      display: "inline-block",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                      paddingTop: "1px",
                      paddingBottom: "1px",
                      fontFamily: "var(--font-raleway)",
                      fontWeight: 300,
                      fontSize: "18px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: lightBg ? "#222" : "#fff",
                      background: isActive ? "#88BF81" : "transparent",
                      transition: "background 0.15s",
                      cursor: "pointer",
                      border: "none",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#88BF81"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    {item.label}
                  </motion.button>
                );
              })}

              {/* Separatore + link home */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.04 + menuItems.length * 0.05 + 0.06, ease: "easeOut" }}
                style={{ marginTop: "28px", paddingRight: "8px" }}
              >
                <a
                  href="/"
                  style={{
                    fontFamily: "var(--font-raleway)",
                    fontWeight: 300,
                    fontSize: "13px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#88BF81",
                    textDecoration: "none",
                    opacity: 0.85,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                >
                  ← centrosteadycam.it
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Pill Button ───────────────────────────────────────────────────────────────
function PillBtn({
  children,
  onClick,
  dark = false,
  coral = false,
  large = false,
  href,
  target,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  dark?: boolean;
  coral?: boolean;
  large?: boolean;
  href?: string;
  target?: string;
}) {
  const base = large
    ? "inline-block px-12 py-3 rounded-full text-[13px] font-semibold tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer"
    : "inline-block px-7 py-2 rounded-full text-[11px] font-medium tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer";
  const style = coral
    ? { background: "#f26c68", color: "#fff", border: "none", fontFamily: "var(--font-raleway)" }
    : dark
    ? { background: "transparent", color: "#555", border: "1px solid #999", fontFamily: "var(--font-raleway)" }
    : { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.55)", fontFamily: "var(--font-raleway)" };

  if (href) {
    return (
      <a href={href} target={target} rel="noopener noreferrer" className={base} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={base} style={style}>
      {children}
    </button>
  );
}

// ── Slides ────────────────────────────────────────────────────────────────────

function SlideIntro({ nav, onMenu }: { nav: (id: SlideId) => void; onMenu: () => void }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#111] overflow-hidden">

      {/* Main logo — the actual "display" block-font image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="w-[68vw] max-w-[780px] min-w-[300px]"
      >
        <img
          src={`${WP}/Logo_Display21_6x3.5.png`}
          alt="display"
          className="w-full"
          draggable={false}
        />
      </motion.div>

      {/* MENU + PRENOTA */}
      <motion.div
        {...fadeUp(0.75)}
        className="flex gap-6 mt-5"
      >
        <PillBtn large onClick={onMenu}>Menu</PillBtn>
        <PillBtn large onClick={() => nav("booking")}>Prenota</PillBtn>
      </motion.div>

      {/* ASL CN2 logo */}
      <motion.div
        {...fadeIn(1.05)}
        style={{ marginTop: "80px" }}
      >
        <img
          src={`${WP}/ASL_CN2_new@2x.png`}
          alt="ASL CN2"
          className="w-32 opacity-90"
          draggable={false}
        />
      </motion.div>

    </div>
  );
}

function SlideApertura({ nav }: { nav: (id: SlideId) => void }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Image src={`${WP}/NooDisplay.jpg.webp`} alt="" fill className="object-cover" priority unoptimized />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-3xl">
        <motion.h2
          {...fadeUp(0.2)}
          className="text-5xl md:text-7xl font-light text-white mb-8"
          style={{ fontFamily: "var(--font-roboto-slab)" }}
        >
          Nooo...!
        </motion.h2>
        <motion.p
          {...fadeUp(0.45)}
          className="text-white text-xl md:text-2xl font-light tracking-[0.1em] mb-6"
          style={{ fontFamily: "var(--font-raleway)" }}
        >
          Tutte le date disponibili per l&apos;anno scolastico 25-26 sono state prenotate.
        </motion.p>
        <motion.p
          {...fadeUp(0.6)}
          className="text-white text-lg font-light mb-4"
          style={{ fontFamily: "var(--font-raleway)" }}
        >
          Alternative?
        </motion.p>
        <motion.p
          {...fadeUp(0.75)}
          className="text-white/80 text-sm font-light mb-10 leading-relaxed"
          style={{ fontFamily: "var(--font-raleway)" }}
        >
          CAPS - Centro Attività Promozione della Salute. Anche quest&apos;anno scolastico sarà possibile
          vivere un&apos;esperienza simile a Display con il programma Prox Experience Techno.
        </motion.p>
        <motion.div {...fadeUp(0.95)} className="flex flex-wrap gap-3 justify-center">
          <PillBtn href={`${WP}/Scheda-catalogo-CAPS-Prox-Experience-Techno-2025.26-1.pdf`} target="_blank">
            Scheda Progetto
          </PillBtn>
          <PillBtn href="https://forms.gle/Y8LETMFMmEQwUQtq5" target="_blank">
            Iscrizione
          </PillBtn>
          <PillBtn onClick={() => nav("contatti")}>Contattaci</PillBtn>
          <PillBtn onClick={() => nav("intro")}>Back</PillBtn>
        </motion.div>
      </div>
    </div>
  );
}

function SlidePortfolio({ nav, onMenu: _onMenu }: { nav: (id: SlideId) => void; onMenu: () => void }) {
  const tiles: { id: SlideId; img: string; label: string }[] = [
    { id: "timeline", img: `${WP}/2017/09/Steadycam-Dispaly-Isole_02.jpg`,        label: "Timeline" },
    { id: "making",   img: `${WP}/2017/09/Steadycam-Display-making03.jpg`,         label: "Making"   },
    { id: "gaming",   img: `${WP}/2017/09/Steadycam-Dispaly-Gaming_Big_Right.jpg`, label: "Gaming"   },
    { id: "storie",   img: `${WP}/2017/09/Steadycam-Dispaly-Storie-03.jpg`,        label: "Storie"   },
    { id: "corpo",    img: `${WP}/2017/09/Steadycam-Dispaly-Corpo-Big.jpg`,        label: "Corpo"    },
    { id: "intro",    img: `${WP}/revslider/photography/photography_thumb6.jpg`,    label: ""         },
  ];

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center" style={{ paddingTop: "6vh" }}>
      {/* wrapper spostato a destra */}
      <div style={{ marginLeft: "12%", width: "810px", maxWidth: "90vw" }}>

      {/* Titolo */}
      <motion.p
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -18, transition: { duration: 0.3, ease: "easeOut" } }}
        transition={{ duration: 0.4, delay: BASE_DELAY, ease: "easeOut" }}
        className="uppercase tracking-[0.22em] mb-6 w-full"
        style={{ fontFamily: "var(--font-raleway)", fontWeight: 600, fontSize: "24px", color: "#aaa" }}
      >
        Le Stanze
      </motion.p>

      {/* Griglia 3×2 */}
      <div className="grid grid-cols-3 gap-[6px] w-full">
        {tiles.map((tile, i) => (
          <motion.button
            key={tile.id + i}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: 20,
              transition: { duration: 0.28, delay: (tiles.length - 1 - i) * 0.055, ease: "easeOut" },
            }}
            transition={{ duration: 0.42, delay: BASE_DELAY + i * 0.075, ease: "easeIn" }}
            onClick={() => nav(tile.id)}
            className="group relative overflow-hidden"
            style={{ aspectRatio: "3/2" }}
          >
            <img
              src={tile.img}
              alt={tile.label}
              className="w-full h-full object-cover transition-transform duration-700 ease-out scale-[1.06] group-hover:scale-100"
              draggable={false}
            />
          </motion.button>
        ))}
      </div>

      </div>{/* fine wrapper */}
    </div>
  );
}

function SlideRoom({
  title,
  subtitle,
  subtitleColor = "#ffcc00",
  description,
  bgImage,
  align = "left",
  overlay = "rgba(0,0,0,0.25)",
  titleColor = "#ffffff",
  textColor = "rgba(255,255,255,1)",
  bgPosition = "center",
  nav,
}: {
  title: string;
  subtitle: string;
  subtitleColor?: string;
  description: string;
  bgImage: string;
  align?: "left" | "right";
  overlay?: string;
  titleColor?: string;
  textColor?: string;
  bgPosition?: string;
  nav: (id: SlideId) => void;
}) {
  const isRight = align === "right";
  const titleAnim = isRight ? fadeRight(0.3) : fadeLeft(0.3);

  return (
    <div className="relative w-full h-full flex items-center overflow-hidden">
      <Image
        src={bgImage}
        alt={title}
        fill
        className="object-cover"
        style={{ objectPosition: bgPosition }}
        priority
        unoptimized
      />
      <div className="absolute inset-0" style={{ background: overlay }} />

      {isRight && (
        <div
          className="absolute right-0 top-0 bottom-0 w-[50%] hidden md:block"
          style={{ background: "rgba(0,0,0,0.2)" }}
        />
      )}

      <div
        className={`relative z-10 w-full max-w-5xl mx-auto px-10 md:px-20 ${isRight ? "text-right flex flex-col items-end" : ""}`}
      >
        <motion.h1
          {...titleAnim}
          className="text-5xl md:text-[72px] font-medium tracking-[0.15em] uppercase mb-3"
          style={{ color: titleColor, fontFamily: "var(--font-raleway)" }}
        >
          {title}
        </motion.h1>

        <motion.p
          {...fadeIn(0.6)}
          className="text-[13px] font-semibold tracking-[0.22em] uppercase mb-6"
          style={{ color: subtitleColor, fontFamily: "var(--font-raleway)" }}
        >
          {subtitle}
        </motion.p>

        <motion.p
          {...fadeUp(0.8)}
          className="text-sm md:text-[15px] font-light leading-[1.85] mb-8 max-w-[480px] tracking-[0.04em]"
          style={{ color: textColor, fontFamily: "var(--font-raleway)" }}
        >
          {description}
        </motion.p>

        <motion.div {...fadeUp(1.0)}>
          <PillBtn
            onClick={() => nav("portfolio")}
            dark={titleColor === "rgba(0,0,0,0.75)"}
          >
            Tutte le stanze
          </PillBtn>
        </motion.div>
      </div>
    </div>
  );
}

// ── Custom Select ─────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none"
        style={{ fontFamily: "var(--font-raleway)" }}
      >
        <span>{selected?.label ?? "Seleziona"}</span>
        <span className="ml-2 text-gray-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul className="absolute z-50 w-full border border-gray-200 bg-white shadow-lg max-h-52 overflow-auto">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-[#ffe694] transition-colors ${o.value === value ? "bg-[#ffe694] font-medium" : ""}`}
                style={{ fontFamily: "var(--font-raleway)", color: "#333" }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type AvailableSlot = {
  id: string; date: string; time_slot: string;
  bookings_count: number; max_capacity: number;
};

function useSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function SlideBooking({ nav }: { nav: (id: SlideId) => void }) {
  const [screen, setScreen] = useState<"intro" | "date" | "form" | "success">("intro");
  const dateListRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [sloading, setSloading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isWaitlist, setIsWaitlist] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    giaPart: "", nAlunni: "", nAdulti: "2", disabilita: "nessuno",
    istituto: "", plesso: "",
    classe: "", nome: "", cognome: "", email: "", cellulare: "",
  });
  const supabase = useSupabase();

  const DUMMY_STEPS = [
    { label: "Partecipazione precedente" },
    { label: "Partecipanti" },
    { label: "Dati scuola e insegnante" },
  ];

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("display_slots")
      .select("id, date, time_slot, bookings_count, max_capacity")
      .eq("is_open", true)
      .gte("date", today)
      .order("date", { ascending: true })
      .then(({ data }) => {
        setSlots(data ?? []);
        setSloading(false);
      });
    supabase
      .from("display_settings")
      .select("value")
      .eq("key", "waitlist_enabled")
      .single()
      .then(({ data }) => setIsWaitlist(data?.value === "true"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!isWaitlist && !selectedSlot) return;
    setSubmitting(true);
    setSubmitError("");
    const { error, emailError } = await submitBooking({
      slot_id: isWaitlist ? null : selectedSlot!.id,
      tipo_visita: isWaitlist ? "lista_attesa" : selectedSlot!.time_slot,
      n_alunni: parseInt(form.nAlunni),
      n_adulti: parseInt(form.nAdulti),
      disabilita: form.disabilita !== "nessuno",
      istituto: form.istituto,
      ordine_scuola: form.plesso,
      nome: form.nome,
      cognome: form.cognome,
      classe: form.classe,
      email: form.email,
      cellulare: form.cellulare || null,
      note: form.giaPart === "si" ? "Classe già partecipante" : null,
    });
    if (error) {
      setSubmitError(error);
      setSubmitting(false);
      return;
    }
    if (emailError) console.warn("DEBUG email error:", emailError);
    setScreen("success");
    setSubmitting(false);
  };

  // ── Grouped slots by month ────────────────────────────────────────────────
  const grouped: Record<string, AvailableSlot[]> = {};
  slots.forEach((s) => {
    const month = s.date.slice(0, 7);
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(s);
  });

  const BG = (
    <>
      <Image src={`${WP}/Display_over_booking2-scaled.jpg`} alt="" fill className="object-cover object-center" unoptimized />
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.88)" }} />
    </>
  );

  // ── Intro / istruzioni ───────────────────────────────────────────────────
  if (screen === "intro") {
    const steps = isWaitlist
      ? [
          "Compila tutti i campi richiesti",
          "Invia la richiesta",
          "Sarai contattato quando si libera una data",
        ]
      : [
          "Scegli una data disponibile",
          "Compila tutti i campi richiesti",
          "Invia la prenotazione",
          "Attendi l'email di conferma dello staff",
        ];
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <Image src={`${WP}/Display_over_booking2-scaled.jpg`} alt="" fill className="object-cover object-center" unoptimized />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.88)" }} />
        <motion.div {...fadeUp(0)} className="relative z-10 w-full max-w-lg mx-auto px-8 py-10">
          <motion.p
            {...fadeUp(0.05)}
            className="text-[#88BF81] text-xl font-bold uppercase tracking-[0.2em] mb-4"
            style={{ fontFamily: "var(--font-raleway)" }}
          >
            Display Techno
          </motion.p>
          <motion.h2
            {...fadeUp(0.1)}
            className="font-bold tracking-[0.05em] mb-3 whitespace-nowrap uppercase"
            style={{ fontFamily: "var(--font-raleway)", color: "#ffffff", fontSize: "30px" }}
          >
            {isWaitlist ? "Iscriviti alla lista d'attesa" : "Prenota la tua visita"}
          </motion.h2>
          <motion.p
            {...fadeUp(0.15)}
            className="text-lg mb-10"
            style={{ fontFamily: "var(--font-raleway)", color: "#ffffff" }}
          >
            {isWaitlist ? "Segui i passi per iscriverti alla lista d'attesa" : "Segui i passi per completare la prenotazione"}
          </motion.p>

          <motion.ol {...fadeUp(0.2)} className="space-y-5 mb-10">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-4">
                <span
                  className="shrink-0 w-8 h-8 rounded-full border border-[#88BF81] text-[#88BF81] text-base flex items-center justify-center mt-0.5"
                  style={{ fontFamily: "var(--font-raleway)" }}
                >
                  {i + 1}
                </span>
                <span className="text-xl leading-relaxed" style={{ fontFamily: "var(--font-raleway)", color: "#ffffff" }}>
                  {s}
                </span>
              </li>
            ))}
          </motion.ol>

          <motion.div {...fadeUp(0.3)} className="border-t border-white/10 pt-6 mb-8 space-y-3">
            <p className="text-lg whitespace-nowrap" style={{ fontFamily: "var(--font-raleway)", color: "#ffffff" }}>
              · Puoi prenotare una sola classe alla volta fino ad un massimo di 3 (tre) classi per Plesso.
            </p>
            <p className="text-lg whitespace-nowrap" style={{ fontFamily: "var(--font-raleway)", color: "#ffffff" }}>
              · Il servizio è gratuito · Orario visita: 8.00–13.00
            </p>
            <p className="text-lg whitespace-nowrap" style={{ fontFamily: "var(--font-raleway)", color: "#ffffff" }}>
              · La visita richiede la presenza dell&apos;insegnante per tutta la durata
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.35)} className="flex gap-3">
            <button
              onClick={() => nav("intro")}
              className="px-6 py-2.5 text-sm tracking-wider uppercase border border-white/40 rounded-full hover:border-white transition-all"
              style={{ fontFamily: "var(--font-raleway)", color: "#ffffff" }}
            >
              Annulla
            </button>
            <button
              onClick={() => isWaitlist ? setScreen("form") : setScreen("date")}
              className="px-7 py-2.5 text-white text-sm tracking-wider uppercase rounded-full transition-all"
              style={{ background: "#f26c68", fontFamily: "var(--font-raleway)" }}
            >
              {isWaitlist ? "Iscriviti →" : "Inizia →"}
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (screen === "success") {
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {BG}
        <motion.div {...fadeUp(0)} className="relative z-10 text-center px-8 max-w-md">
          <h2 className="font-bold text-white tracking-[0.2em] uppercase mb-4"
            style={{ fontFamily: "var(--font-raleway)", fontSize: "30px" }}>
            {isWaitlist ? "Iscrizione alla lista ricevuta" : "Richiesta inviata"}
          </h2>
          <p className="text-white font-semibold mb-3" style={{ fontFamily: "var(--font-raleway)", fontSize: "22px" }}>
            Grazie, {form.nome} {form.cognome}.
          </p>
          <p className="text-white/80 mb-10 leading-relaxed" style={{ fontFamily: "var(--font-raleway)", fontSize: "18px" }}>
            {isWaitlist
              ? "Sei in lista d'attesa. Ti contatteremo non appena si libera una data disponibile."
              : "Lo staff del Centro ti contatterà a breve per confermare la visita."}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <PillBtn onClick={() => nav("intro")}>← Home</PillBtn>
            <PillBtn onClick={() => {
              setScreen("intro");
              setFormStep(0);
              setSelectedSlot(null);
              setForm({ giaPart: "", nAlunni: "", nAdulti: "2", disabilita: "nessuno", istituto: "", plesso: "", classe: "", nome: "", cognome: "", email: "", cellulare: "" });
            }}>Iscrivi altra classe</PillBtn>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Date selection ────────────────────────────────────────────────────────
  if (screen === "date") {
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {BG}
        <motion.div
          {...fadeUp(0)}
          className="relative z-10 w-full max-w-lg mx-auto px-6 py-8 flex flex-col max-h-screen"
        >
          <h2 className="text-center text-3xl font-bold tracking-[0.1em] uppercase mb-5 whitespace-nowrap"
            style={{ fontFamily: "var(--font-raleway)", color: "#ffffff" }}>
            Scegli una data disponibile
          </h2>

          <div className="relative flex gap-2">
          <div ref={dateListRef} className="overflow-y-auto space-y-4 pb-2 flex-1" style={{ maxHeight: "45vh", scrollbarWidth: "none" }}>
            {sloading && (
              <p className="text-center text-base py-6" style={{ fontFamily: "var(--font-raleway)", color: "#ffffff" }}>
                Caricamento...
              </p>
            )}
            {!sloading && slots.length === 0 && (
              <p className="text-center text-base py-6 leading-relaxed" style={{ fontFamily: "var(--font-raleway)", color: "#ffffff" }}>
                Nessuna data disponibile al momento.<br />
                <span className="text-sm opacity-60">Controlla più avanti o contattaci.</span>
              </p>
            )}
            {Object.entries(grouped).map(([month, monthSlots]) => (
              <div key={month}>
                <p className="text-base font-semibold uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-raleway)", color: "#88BF81" }}>
                  {new Date(month + "-01").toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
                </p>
                <div className="space-y-1.5">
                  {monthSlots.map((slot) => {
                    const isFull = slot.bookings_count >= slot.max_capacity;
                    const isSelected = selectedSlot?.id === slot.id;
                    const dateLabel = new Date(slot.date + "T00:00:00").toLocaleDateString("it-IT", {
                      weekday: "long", day: "numeric", month: "long",
                    });
                    return (
                      <button
                        key={slot.id}
                        onClick={() => !isFull && setSelectedSlot(slot)}
                        disabled={isFull}
                        className={`w-full text-left px-4 py-2 rounded transition-all border flex items-center justify-between ${
                          isFull
                            ? "border-white/10 bg-white/3 opacity-50 cursor-not-allowed"
                            : isSelected
                              ? "border-[#88BF81] bg-[#88BF81]/15"
                              : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                        }`}
                      >
                        <div>
                          <p className="text-base capitalize" style={{ fontFamily: "var(--font-raleway)", color: "#ffffff" }}>{dateLabel}</p>
                          <p className="text-sm opacity-50" style={{ fontFamily: "var(--font-raleway)", color: "#ffffff" }}>
                            h. 8.00–13.00
                          </p>
                        </div>
                        {isFull && (
                          <span className="text-xs font-semibold px-3 py-1 rounded-full shrink-0 ml-3"
                            style={{ background: "#ffe694", color: "#1a1a1a", fontFamily: "var(--font-raleway)" }}>
                            Prenotata
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {/* Frecce scroll */}
          <div className="flex flex-col justify-between py-1 shrink-0">
            <button
              onClick={() => dateListRef.current?.scrollBy({ top: -120, behavior: "smooth" })}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/30 hover:border-[#88BF81] hover:text-[#88BF81] transition-all"
              style={{ color: "#ffffff" }}>
              ▲
            </button>
            <button
              onClick={() => dateListRef.current?.scrollBy({ top: 120, behavior: "smooth" })}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/30 hover:border-[#88BF81] hover:text-[#88BF81] transition-all"
              style={{ color: "#ffffff" }}>
              ▼
            </button>
          </div>
          </div>

          <div className="flex gap-3 mt-5 justify-between">
            <button
              onClick={() => setScreen("intro")}
              className="px-6 py-2.5 text-sm tracking-wider uppercase border border-white/40 rounded-full hover:border-white transition-all"
              style={{ fontFamily: "var(--font-raleway)", color: "#ffffff" }}
            >
              ← Indietro
            </button>
            <button
              disabled={!selectedSlot}
              onClick={() => setScreen("form")}
              className="px-7 py-2.5 text-white text-sm tracking-wider uppercase rounded-full disabled:opacity-30 transition-all"
              style={{ background: "#f26c68", fontFamily: "var(--font-raleway)" }}
            >
              Continua →
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Multi-step form ───────────────────────────────────────────────────────
  const selectedDateLabel = selectedSlot
    ? new Date(selectedSlot.date + "T00:00:00").toLocaleDateString("it-IT", {
        weekday: "long", day: "numeric", month: "long",
      })
    : "";

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {BG}
      <motion.div
        key="form"
        {...fadeUp(0)}
        className="relative z-10 w-full max-w-xl mx-auto px-6 py-8 overflow-y-auto max-h-screen"
      >
        <h2 className="text-center text-white font-bold tracking-[0.1em] uppercase mb-4"
          style={{ fontFamily: "var(--font-raleway)", fontSize: "30px" }}>
          {isWaitlist ? "Lista d'attesa" : "Prenota la visita"}
        </h2>
        {!isWaitlist && (
          <div className="text-center mb-6 px-4 py-3 rounded-lg" style={{ background: "rgba(136,191,129,0.15)", border: "1px solid #88BF81" }}>
            <p className="text-xl font-semibold capitalize" style={{ fontFamily: "var(--font-raleway)", color: "#88BF81" }}>
              {selectedDateLabel}
            </p>
            <p className="text-base mt-0.5" style={{ fontFamily: "var(--font-raleway)", color: "#88BF81" }}>
              h. 8.00–13.00
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-8 justify-center">
          {DUMMY_STEPS.map((_s, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= formStep ? "bg-white" : "bg-white/20"}`} />
          ))}
        </div>

        <div style={{ background: "#ffe694", padding: "24px", borderRadius: "8px" }}>
          {formStep === 0 && (
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2 text-gray-700"
                style={{ fontFamily: "var(--font-raleway)" }}>
                La tua classe ha già partecipato ai laboratori del Centro Display?
              </label>
              <CustomSelect
                value={form.giaPart}
                onChange={(v) => setForm({ ...form, giaPart: v })}
                options={[
                  { value: "", label: "Seleziona" },
                  { value: "si", label: "Sì" },
                  { value: "no", label: "No, è la prima volta" },
                ]}
              />
            </div>
          )}

          {formStep === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium tracking-wider uppercase mb-1 text-gray-700"
                  style={{ fontFamily: "var(--font-raleway)" }}>
                  N° alunni (max 30)
                </label>
                <CustomSelect
                  value={form.nAlunni}
                  onChange={(v) => setForm({ ...form, nAlunni: v })}
                  options={[
                    { value: "", label: "Seleziona" },
                    ...Array.from({ length: 30 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-wider uppercase mb-1 text-gray-700"
                  style={{ fontFamily: "var(--font-raleway)" }}>
                  N° adulti (max 4)
                </label>
                <CustomSelect
                  value={form.nAdulti}
                  onChange={(v) => setForm({ ...form, nAdulti: v })}
                  options={Array.from({ length: 4 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-wider uppercase mb-1 text-gray-700"
                  style={{ fontFamily: "var(--font-raleway)" }}>
                  Alunni con disabilità motorie
                </label>
                <CustomSelect
                  value={form.disabilita}
                  onChange={(v) => setForm({ ...form, disabilita: v })}
                  options={[
                    { value: "nessuno", label: "Nessuno" },
                    { value: "1", label: "1" },
                    { value: "2", label: "2" },
                    { value: "piu", label: "Più di due" },
                  ]}
                />
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-3">
              {[
                { label: "Istituto", field: "istituto", placeholder: "Istituto Comprensivo...", type: "text" },
                { label: "Plesso", field: "plesso", placeholder: "", type: "text" },
                { label: "Classe", field: "classe", placeholder: "es. 2A", type: "text" },
                { label: "Nome insegnante referente", field: "nome", placeholder: "", type: "text" },
                { label: "Cognome insegnante referente", field: "cognome", placeholder: "", type: "text" },
                { label: "Email insegnante referente", field: "email", placeholder: "", type: "email" },
                { label: "Telefono insegnante referente", field: "cellulare", placeholder: "", type: "tel" },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field}>
                  <label className="block text-xs font-medium tracking-wider uppercase mb-1 text-gray-700"
                    style={{ fontFamily: "var(--font-raleway)" }}>{label}</label>
                  <input
                    type={type}
                    value={form[field as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:border-gray-500"
                    required
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {formStep === 2 && (
          <p className="mt-3 text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-raleway)", fontSize: "11px" }}>
            *I dati verranno trattati dal Centro Display esclusivamente per fini riguardanti il Centro stesso e non saranno in alcun modo ceduti a terzi.
          </p>
        )}
        {submitError && (
          <p className="mt-4 text-sm text-red-400 text-center" style={{ fontFamily: "var(--font-raleway)" }}>
            Errore: {submitError}
          </p>
        )}
        <div className="flex gap-3 mt-6 justify-between">
          <button
            onClick={() => formStep > 0 ? setFormStep(formStep - 1) : setScreen(isWaitlist ? "intro" : "date")}
            className="px-6 py-2.5 text-white/60 text-sm tracking-wider uppercase border border-white/30 rounded-full hover:text-white hover:border-white transition-all"
            style={{ fontFamily: "var(--font-raleway)" }}
          >
            ← Indietro
          </button>
          {formStep < DUMMY_STEPS.length - 1 ? (
            <button
              disabled={(formStep === 0 && !form.giaPart) || (formStep === 1 && !form.nAlunni)}
              onClick={() => setFormStep(formStep + 1)}
              className="px-7 py-2.5 text-white text-sm tracking-wider uppercase rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ background: "#f26c68", fontFamily: "var(--font-raleway)" }}
            >
              Avanti →
            </button>
          ) : (
            <button
              disabled={
                submitting ||
                !form.istituto || !form.plesso || !form.classe ||
                !form.nome || !form.cognome || !form.cellulare ||
                !form.email || !(form.email.includes("@") && form.email.includes("."))
              }
              onClick={handleSubmit}
              className="px-7 py-2.5 text-white text-sm tracking-wider uppercase rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ background: "#f26c68", fontFamily: "var(--font-raleway)" }}
            >
              {submitting ? "Invio..." : "Conferma"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}


function SlideCentro() {
  const rects = [
    { color: "#88BF81" }, // top-left green
    { color: "#f26c68" }, // top-right coral
    { color: "#d4a853" }, // bottom-left gold
    { color: "#43b9dc" }, // bottom-right blue
  ];

  return (
    <div className="relative w-full h-full flex overflow-hidden bg-white">

      {/* LEFT — 2×2 colored rectangles, full height */}
      <div className="w-[28%] shrink-0 h-full grid grid-cols-2 grid-rows-2 gap-[2px]">
        {rects.map((r, i) => (
          <motion.div
            key={i}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.55, delay: 0.05 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ background: r.color }}
          />
        ))}
      </div>

      {/* RIGHT — white, text slides up from below */}
      <div className="flex-1 relative overflow-hidden">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.55, ease: "easeOut" }}
          className="h-full flex flex-col justify-center px-12 py-16 overflow-y-auto"
          style={{ maxWidth: "70%" }}
        >
          <p className="text-[#444] font-light leading-[1.85] mb-5"
            style={{ fontSize: "22px", fontFamily: "var(--font-raleway)" }}>
            Il Centro Display è un Laboratorio multimediale permanente: un luogo fisico, fatto di stanze,
            oggetti, tecnologie e persone, che può essere visitato e diventare meta di un viaggio di
            istruzione per Scuole e Centri Estivi. All&apos;interno di Display i ragazzi partecipano ad un
            percorso didattico-esperienziale attraverso le sue stanze tematiche, prendendo parte a giochi,
            sfide e laboratori, interagendo continuamente con se stessi, i compagni, gli educatori del Centro
            e le tecnologie digitali.
          </p>
          <p className="text-[#444] font-light leading-[1.85] mb-5"
            style={{ fontSize: "22px", fontFamily: "var(--font-raleway)" }}>
            Un tempo importante viene dedicato, al termine di ogni attività, alla riflessione e al confronto
            sulle esperienze vissute, condividendo emozioni, idee e domande, con l&apos;obiettivo di attivare
            uno &ldquo;sguardo critico&rdquo; sui comportamenti e sulle relazioni mediate dalle nuove tecnologie.
          </p>
          <p className="text-[#444] font-light leading-[1.85]"
            style={{ fontSize: "22px", fontFamily: "var(--font-raleway)" }}>
            Il Centro è parte del Progetto Display, promosso dalla Città di Bra, dall&apos;ASL CN2 e realizzato
            con il contributo della Fondazione CRC, nell&apos;ambito del bando Prevenzione e Promozione della
            Salute. Il progetto prevede anche interventi educativi rivolti ai ragazzi, serate informative per
            genitori e formazione rivolta ai docenti delle scuole del territorio.
          </p>
        </motion.div>
      </div>

    </div>
  );
}

function SlideProgetto({ nav: _nav, onMenu }: { nav: (id: SlideId) => void; onMenu: () => void }) {
  const [tab, setTab] = useState(0);
  const tabs = [
    {
      label: "PREMESSA",
      color: "rgba(139,199,157,0.6)",
      text: "La dipendenza da nuove tecnologie, tra le 'dipendenze senza sostanze', è una modalità disadattiva nell'utilizzo delle stesse che va ben oltre le necessità lavorative e/o di svago. L'uomo, per sua naturale caratteristica evolutiva, ha la capacità di adeguarsi ai più radicali cambiamenti socio-ambientali, ma la rivoluzione tecnologica che lo ha investito è avvenuta con una velocità tale da superare ogni capacità di adattamento.",
    },
    {
      label: "OBIETTIVI",
      color: "rgba(255,92,94,0.5)",
      text: "Dal 2000 il Centro Steadycam dell'ASL CN2, ha avviato in ambito sanitario, educativo e didattico, a livello locale, regionale e nazionale, riflessioni ed interventi su promozione della salute e media education. Il Progetto Display nasce dall'esigenza di creare uno spazio fisico dedicato all'educazione ai media.",
    },
    {
      label: "ATTIVITÀ PREVISTE",
      color: "rgba(221,174,74,0.5)",
      text: "Percorsi didattico-esperienziali attraverso 5 stanze tematiche: Timeline, Storie, Gaming, Making, Corpo. Ogni stanza prevede attività hands-on, momenti di gioco e sfida, e una fase di riflessione guidata dagli educatori del Centro.",
    },
    {
      label: "DESTINATARI",
      color: "rgba(67,185,220,0.5)",
      text: "Il Centro Display è rivolto principalmente a scuole secondarie di primo grado del territorio dell'ASL CN2, ai loro insegnanti e alle famiglie. Le visite sono possibili per una classe alla volta (max 28-30 ragazzi).",
    },
  ];

  return (
    <div className="relative w-full h-full flex items-start overflow-hidden">
      <Image src={`${WP}/Il_centro2-1.jpg`} alt="Il Progetto" fill className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-white/65" />
      <div className="relative z-10 w-full max-w-4xl mx-auto px-10 pt-16 md:pt-24">
        <motion.div {...fadeUp(0.15)} className="flex flex-wrap gap-x-8 gap-y-2 mb-8">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setTab(i)}
              className="relative text-[11px] font-bold tracking-[0.12em] uppercase pb-2 transition-colors"
              style={{ color: "#444", fontFamily: "var(--font-raleway)" }}
            >
              {t.label}
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full transition-all duration-300"
                style={{ background: tab === i ? t.color : "transparent" }}
              />
            </button>
          ))}
        </motion.div>
        <motion.div key={tab} {...fadeIn(0)} className="max-w-3xl">
          <p
            className="text-[#444] text-sm md:text-[15px] font-light leading-[1.9] tracking-[0.04em]"
            style={{ fontFamily: "var(--font-raleway)" }}
          >
            {tabs[tab].text}
          </p>
        </motion.div>
        <motion.div {...fadeUp(0.35)} className="mt-10">
          <PillBtn dark onClick={onMenu}>Menu</PillBtn>
        </motion.div>
      </div>
    </div>
  );
}

function SlidePartner({ nav: _nav, onMenu }: { nav: (id: SlideId) => void; onMenu: () => void }) {
  const logos = [
    { src: `${WP}/Logo-FCRC-orizzontale-nuovoprevenzione-e-promozione-salute.png`, alt: "Fondazione CRC" },
    { src: `${WP}/Bra.png`, alt: "Città di Bra" },
    { src: `${WP}/AslCn2.jpg`, alt: "ASL CN2" },
    { src: `${WP}/Consorzio-ALBA.jpg`, alt: "Consorzio Alba" },
    { src: `${WP}/logo.png`, alt: "Logo" },
    { src: `${WP}/Stemma_Alba_size-L_02.jpg`, alt: "Stemma Alba" },
    { src: `${WP}/Logo-RoRo.jpg`, alt: "Ro e Ro" },
    { src: `${WP}/associazione-don-verri-roberto.jpg`, alt: "Don Verri Roberto" },
    { src: `${WP}/logoDorsregioneasl.png`, alt: "Regione ASL" },
    { src: `${WP}/istituti-comprensivi.jpg`, alt: "Istituti Comprensivi" },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-4xl px-8">
        <motion.p
          {...fadeUp(0.1)}
          className="text-gray-400 text-xl font-light tracking-[0.25em] uppercase text-center mb-10"
          style={{ fontFamily: "var(--font-raleway)" }}
        >
          Partner
        </motion.p>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.alt}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
              className="flex items-center justify-center p-3"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="max-h-14 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
              />
            </motion.div>
          ))}
        </div>
        <motion.div {...fadeUp(0.85)} className="text-center mt-10">
          <PillBtn dark onClick={onMenu}>Menu</PillBtn>
        </motion.div>
      </div>
    </div>
  );
}

function SlideContatti({ nav: _nav, onMenu }: { nav: (id: SlideId) => void; onMenu: () => void }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <Image src={`${WP}/revslider/photography/photography_contact.jpg`} alt="" fill className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-black/50" />
      <motion.div
        {...fadeUp(0.2)}
        className="relative z-10 flex flex-col items-center text-center px-8 max-w-2xl"
      >
        <div className="bg-white/55 backdrop-blur-sm rounded-sm p-8 md:p-12 w-full">
          <p
            className="text-[#444] font-light mb-6 leading-relaxed"
            style={{ fontFamily: "var(--font-raleway)", fontSize: "16px" }}
          >
            C.so Michele Coppino 46/A, ALBA (CN)<br />
            0173/316210<br />
            info@progettosteadycam.it<br />
            Valentino Merlo – Emanuel Pellegrini
          </p>
          <p
            className="text-[#444] text-sm font-light leading-relaxed mb-6"
            style={{ fontFamily: "var(--font-raleway)" }}
          >
            Le visite al Centro Display sono rivolte a tutte le classi della Scuola Secondaria
            di Primo Grado del territorio dell&apos;ASL CN2. È possibile prenotare la visita per
            una sola classe alla volta (28-30 ragazzi). La visita durerà mezza giornata (h 8.30–13.00).
          </p>
          <PillBtn dark onClick={onMenu}>Menu</PillBtn>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Slider ───────────────────────────────────────────────────────────────

export default function DisplaySlider() {
  const [current, setCurrent] = useState<SlideId>("intro");
  const [dir, setDir] = useState(1);
  const [transAxis, setTransAxis] = useState<"x" | "y">("x");
  const [menuOpen, setMenuOpen] = useState(false);
  const [history, setHistory] = useState<SlideId[]>([]);

  const ORDER: SlideId[] = [
    "intro", "apertura", "portfolio",
    "timeline", "storie", "gaming", "making", "corpo",
    "booking", "il-centro", "il-progetto", "partner", "contatti",
  ];

  const nav = useCallback(
    (id: SlideId) => {
      setHistory((h) => [...h, current]);
      if (id === "intro" && current !== "intro") {
        setTransAxis("y");
        setDir(-1);
      } else if (id === "il-centro") {
        setTransAxis("x");
        setDir(-1);
      } else if (current === "il-centro") {
        setTransAxis("x");
        setDir(1);
      } else {
        setTransAxis("x");
        const ci = ORDER.indexOf(current);
        const ni = ORDER.indexOf(id);
        setDir(ni >= ci ? 1 : -1);
      }
      setCurrent(id);
      setMenuOpen(false);
    },
    [current]
  );

  const back = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    if (prev === "intro") {
      setTransAxis("y"); setDir(1);
    } else {
      setTransAxis("x");
      const ci = ORDER.indexOf(current);
      const pi = ORDER.indexOf(prev);
      setDir(pi >= ci ? 1 : -1);
    }
    setCurrent(prev);
    setMenuOpen(false);
  }, [history, current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, nav]);

  // Blocca swipe a due dita (navigazione browser) mentre lo slider è montato
  useEffect(() => {
    // CSS: blocca overscroll su html e body
    document.documentElement.style.overscrollBehaviorX = "none";
    document.body.style.overscrollBehaviorX = "none";

    // Wheel: blocca qualsiasi scroll orizzontale (non-passive)
    const onWheel = (e: WheelEvent) => {
      if (e.deltaX !== 0) e.preventDefault();
    };
    window.addEventListener("wheel", onWheel, { passive: false });

    // Popstate: impedisce la navigazione back/forward del browser
    window.history.pushState(null, "", window.location.href);
    const onPopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      document.documentElement.style.overscrollBehaviorX = "";
      document.body.style.overscrollBehaviorX = "";
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const variants = {
    enter: (d: number) => transAxis === "y"
      ? { y: d > 0 ? "100%" : "-100%", x: 0, opacity: 0 }
      : { x: d > 0 ? "100%" : "-100%", y: 0, opacity: 0 },
    center: { x: 0, y: 0, opacity: 1 },
    exit: (d: number) => transAxis === "y"
      ? { y: d > 0 ? "-100%" : "100%", x: 0, opacity: 0 }
      : { x: d > 0 ? "-100%" : "100%", y: 0, opacity: 0 },
  };

  const lightBg = current === "portfolio" || current === "partner" || current === "il-progetto" || current === "il-centro";

  const renderSlide = () => {
    switch (current) {
      case "intro":     return <SlideIntro key="intro" nav={nav} onMenu={() => setMenuOpen((v) => !v)} />;
      case "apertura":  return <SlideApertura key="apertura" nav={nav} />;
      case "portfolio": return <SlidePortfolio key="portfolio" nav={nav} onMenu={() => setMenuOpen((v) => !v)} />;
      case "timeline":  return (
        <SlideRoom key="timeline" nav={nav}
          title="Timeline" subtitle="Un gioco a squadre"
          subtitleColor="rgba(0,0,0,0.5)" titleColor="rgba(0,0,0,0.8)" textColor="rgba(0,0,0,0.75)"
          overlay="rgba(255,255,255,0.05)"
          bgImage={`${WP}/2017/09/Steadycam-Dispaly-Isole_02.jpg`}
          description="Quando sono stati inventati il telegrafo, la televisione o il primo cellulare? Come si è evoluto il mercato della tecnologia? Un gioco a squadre per sfidarsi sulle date chiave del mondo dei media." />
      );
      case "storie":    return (
        <SlideRoom key="storie" nav={nav}
          title="Storie" subtitle="In Galleria"
          bgImage={`${WP}/2017/09/Steadycam-Dispaly-Storie-03.jpg`}
          description="Ogni immagine racconta molte storie: la nostra, quella di chi vi è ritratto, quella di chi la guarda. Quante storie si possono raccontare mettendo insieme più immagini? Ciò che solo pochi anni fa era lungo e macchinoso, ora con le app si può fare in un'ora." />
      );
      case "gaming":    return (
        <SlideRoom key="gaming" nav={nav}
          title="Gaming" subtitle="Emozionale"
          bgImage={`${WP}/2017/09/Steadycam-Dispaly-Gaming_Big_Right.jpg`} bgPosition="right center"
          description="I videogiochi sono un mondo, in cui a volte perdersi, a volte entrare e uscire velocemente. In questa stanza si gioca davvero: su console e tablet, provando generi diversi e mettendoli a confronto, per poi interrogarsi sulle emozioni che suscitano." />
      );
      case "making":    return (
        <SlideRoom key="making" nav={nav}
          title="Making" subtitle="Chi è Siri?" align="right"
          bgImage={`${WP}/2017/09/Steadycam-Display-making03.jpg`}
          description="La stanza giusta per mettere le mani dentro alla tecnologia: aprire un dispositivo, smontarne e rimontarne i componenti, sentirne il peso, l'odore, la dimensione. Per scoprire che il digitale non è immateriale." />
      );
      case "corpo":     return (
        <SlideRoom key="corpo" nav={nav}
          title="Corpo" subtitle="Il Nostro" align="right"
          bgImage={`${WP}/2017/09/Steadycam-Dispaly-Corpo-Big.jpg`}
          description="Una stanza dove dimenticare i dispositivi digitali e riscoprire la tecnologia più evoluta che abbiamo: il nostro corpo. Un viaggio guidato da esercizi, musiche e giochi per esplorare i propri movimenti, il respiro, lo spazio che occupiamo." />
      );
      case "booking":   return <SlideBooking key="booking" nav={nav} />;
      case "il-centro": return <SlideCentro key="il-centro" />;
      case "il-progetto": return <SlideProgetto key="il-progetto" nav={nav} onMenu={() => setMenuOpen(true)} />;
      case "partner":   return <SlidePartner key="partner" nav={nav} onMenu={() => setMenuOpen(true)} />;
      case "contatti":  return <SlideContatti key="contatti" nav={nav} onMenu={() => setMenuOpen(true)} />;
      default:          return <SlideIntro key="intro" nav={nav} onMenu={() => setMenuOpen(true)} />;
    }
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-[#111]"
      style={{ fontFamily: "var(--font-raleway)" }}
    >

      {/* Hamburger */}
      <HamburgerMenu
        open={menuOpen}
        onToggle={() => setMenuOpen(!menuOpen)}
        onNavigate={nav}
        current={current}
        lightBg={lightBg}
      />

      {/* Slides */}
      <AnimatePresence initial={false} custom={dir} mode="wait">
        <motion.div
          key={current}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          {renderSlide()}
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-50">
        {ORDER.map((id) => (
          <button
            key={id}
            onClick={() => nav(id)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              current === id ? "w-6 bg-transparent" : "w-1.5 bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* ← Torna */}
      {current !== "intro" && history.length > 0 && (
        <button
          onClick={back}
          className="absolute top-5 left-6 z-[150] text-[13px] tracking-[0.15em] uppercase transition-opacity duration-200 opacity-50 hover:opacity-100"
          style={{
            fontFamily: "var(--font-raleway)",
            fontWeight: 400,
            color: lightBg ? "#111" : "#fff",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ← Torna
        </button>
      )}

      {/* Keyboard hint */}
      <div
        className="absolute bottom-12 right-5 text-white/20 text-[10px] tracking-widest hidden md:block"
        style={{ fontFamily: "var(--font-raleway)" }}
      >
        ← → navigare
      </div>
    </div>
  );
}
