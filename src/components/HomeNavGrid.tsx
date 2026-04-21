"use client";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";

const WP = "https://centrosteadycam.it/wp-content/uploads";

type CardData = { label: string; img: string; href: string; col: string; row: string; objectPosition?: string };

const staticCards: CardData[] = [
  { label: "Il Centro",         img: `${WP}/Steadycam_ilCentro3-scaled.jpg`,      href: "/il-centro",          col: "1 / 3", row: "1 / 2", objectPosition: "bottom" },
  { label: "I Servizi",         img: `${WP}/Steadycam_servizi-scaled.jpg`,         href: "/il-centro#i-servizi",  col: "1 / 3", row: "2 / 3" },
  { label: "Il Metodo",         img: `${WP}/Steadycam_metodo-scaled.jpg`,          href: "/il-centro#il-metodo",  col: "1 / 3", row: "3 / 4" },
  { label: "L'Archivio",        img: `${WP}/01Steadycam_archivio1-100-1.jpg`,     href: "/il-centro#l-archivio", col: "1 / 3", row: "4 / 5" },
  { label: "SMCR",              img: `${WP}/Steadycam-SMCR.png`,                   href: "/blog",                 col: "1 / 3", row: "5 / 7" },
  // slot latest post → col 3-5 rows 1-3, iniettato via prop
  { label: "I Progetti",        img: `${WP}/ProgettiSteadycamNew-scaled.jpg`,      href: "/i-progetti",         col: "3 / 6", row: "3 / 5" },
  { label: "ADAM",              img: `${WP}/ADAM_LOGO_SITO2.png`,                  href: "https://adam-video-platform.vercel.app/", col: "3 / 5", row: "5 / 7" },
  { label: "Comunicare Salute", img: `${WP}/Logo-per-home@3x.png`,                href: "/i-progetti",         col: "6 / 7", row: "1 / 3" },
  { label: "Staff",             img: `${WP}/2017/07/thanachot-phonket-319688.jpg`, href: "/il-centro#staff",    col: "6 / 7", row: "3 / 4" },
  { label: "Contatti",          img: `${WP}/Contatti_2-scaled.jpg`,                href: "/il-centro#contatti", col: "6 / 7", row: "4 / 5" },
  { label: "Vincere Facile",    img: `${WP}/MOOC_iscrizione02.png`,                href: "/blog",               col: "5 / 7", row: "5 / 7" },
];

type Direction = "top" | "right" | "bottom" | "left";

function getDirection(e: React.MouseEvent, el: HTMLElement): Direction {
  const { left, top, width, height } = el.getBoundingClientRect();
  const x = e.clientX - left - width / 2;
  const y = e.clientY - top - height / 2;
  const angle = Math.atan2(y, x) * (180 / Math.PI);
  if (angle > -135 && angle <= -45) return "top";
  if (angle > -45  && angle <= 45)  return "right";
  if (angle > 45   && angle <= 135) return "bottom";
  return "left";
}

const offscreen: Record<Direction, string> = {
  top:    "translateY(-100%)",
  right:  "translateX(100%)",
  bottom: "translateY(100%)",
  left:   "translateX(-100%)",
};

function NavCard({ label, img, href, col, row, objectPosition = "center" }: CardData) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered]       = useState(false);
  const [transform, setTransform]   = useState("translateY(-100%)");
  const [transition, setTransition] = useState("none");

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const dir = getDirection(e, ref.current);
    setTransition("none");
    setTransform(offscreen[dir]);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setTransition("transform 0.4s ease");
      setTransform("translate(0,0)");
      setHovered(true);
    }));
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const dir = getDirection(e, ref.current);
    setTransition("transform 0.4s ease");
    setTransform(offscreen[dir]);
    setHovered(false);
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      className="relative overflow-hidden block"
      style={{ gridColumn: col, gridRow: row }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={img}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: hovered ? "scale(1.05)" : "scale(1)", transition: "transform 0.5s ease", objectPosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: "rgba(136,191,129,0.45)", transform, transition }}
      />
      <div className="absolute inset-0 z-10 flex items-end p-4 pointer-events-none">
        <span className="text-white font-title font-semibold uppercase tracking-[0.12em] drop-shadow" style={{ fontSize: "18px" }}>
          {label}
        </span>
      </div>
    </Link>
  );
}

export type LatestPost = { title: string; img: string; href: string };

export default function HomeNavGrid({
  latestPost,
  smcrPost,
  vincereFacilePost,
}: {
  latestPost?: LatestPost;
  smcrPost?: LatestPost;
  vincereFacilePost?: LatestPost;
}) {
  const latestCard: CardData = latestPost
    ? { label: latestPost.title, img: latestPost.img, href: latestPost.href, col: "3 / 6", row: "1 / 3" }
    : { label: "Dal Blog",       img: `${WP}/Steadynews03.png`,               href: "/blog",              col: "3 / 6", row: "1 / 3" };

  // Patch SMCR and Vincere Facile with dynamic data if available
  const cards = staticCards.map((c) => {
    if (c.label === "SMCR" && smcrPost)
      return { ...c, img: smcrPost.img, href: smcrPost.href };
    if (c.label === "Vincere Facile" && vincereFacilePost)
      return { ...c, img: vincereFacilePost.img, href: vincereFacilePost.href };
    return c;
  });

  const allCards = [latestCard, ...cards];

  return (
    <div
      className="grid gap-[6px]"
      style={{
        gridTemplateColumns: "repeat(6, 1fr)",
        gridTemplateRows: "repeat(4, 280px) repeat(2, 140px)",
      }}
    >
      {allCards.map((card) => (
        <NavCard key={card.col + card.row} {...card} />
      ))}
    </div>
  );
}
