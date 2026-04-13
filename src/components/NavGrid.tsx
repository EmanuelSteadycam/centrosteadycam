import Link from "next/link";

const WP = "https://centrosteadycam.it/wp-content/uploads";

const cards = [
  { label: "il centro",        img: `${WP}/Steadycam_ilCentro3-scaled.jpg`,      href: "/il-centro" },
  { label: "i progetti",       img: `${WP}/ProgettiSteadycamNew-scaled.jpg`,      href: "/i-progetti" },
  { label: "l'archivio",       img: `${WP}/01Steadycam_archivio1-100-1.jpg`,      href: "/l-archivio" },
  { label: "il metodo",        img: `${WP}/Steadycam_metodo-scaled.jpg`,           href: "/il-metodo" },
  { label: "staff",            img: `${WP}/2017/07/thanachot-phonket-319688.jpg`,  href: "/staff" },
  { label: "contatti",         img: `${WP}/Contatti_2-scaled.jpg`,                href: "/contatti" },
  { label: "comunicare salute",img: `${WP}/Logo-per-home@3x.png`,                 href: "/comunicare-salute" },
];

export default function NavGrid({ exclude, cols }: { exclude?: string; cols?: number }) {
  const items = exclude ? cards.filter((c) => c.href !== exclude) : cards;
  const colsMap: Record<number, string> = {
    2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4",
    5: "grid-cols-5", 6: "grid-cols-6", 7: "grid-cols-7",
  };
  const gridClass = cols
    ? (colsMap[cols] ?? "grid-cols-4")
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7";
  return (
    <section style={{ background: "rgba(136,191,129,0.49)" }} className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`grid ${gridClass} gap-1`}>
          {items.map((card) => (
            <Link key={card.href} href={card.href} className="nav-card group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.img} alt={card.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="nav-card-overlay">
                <span className="nav-card-label">{card.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
