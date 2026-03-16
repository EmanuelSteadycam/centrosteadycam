"use client";
import Image from "next/image";
import type { SlideId } from "../DisplaySlider";

const WP_UPLOADS = "https://centrosteadycam.it/wp-content/uploads/2017/09";

const rooms = [
  {
    id: "timeline" as SlideId,
    title: "Timeline",
    image: `${WP_UPLOADS}/Steadycam-Dispaly-Isole_300x200_2.jpg`,
    color: "from-blue-900/80",
  },
  {
    id: "storie" as SlideId,
    title: "Storie",
    image: `${WP_UPLOADS}/Steadycam-Dispaly-Storie-04.jpg`,
    color: "from-slate-900/80",
  },
  {
    id: "gaming" as SlideId,
    title: "Gaming",
    image: `${WP_UPLOADS}/Steadycam-Dispaly-Gaming_300x200_2.jpg`,
    color: "from-gray-900/80",
  },
  {
    id: "making" as SlideId,
    title: "Making",
    image: `${WP_UPLOADS}/Steadycam-Display-making03-2.jpg`,
    color: "from-zinc-900/80",
  },
  {
    id: "corpo" as SlideId,
    title: "Corpo",
    image: `${WP_UPLOADS}/Steadycam-Dispaly-Corpo-300x200.jpg`,
    color: "from-neutral-900/80",
  },
];

interface Props {
  onNavigate: (id: SlideId) => void;
}

export default function PortfolioSlide({ onNavigate }: Props) {
  return (
    <div className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background blur */}
      <div className="absolute inset-0 opacity-20">
        <Image
          src={`${WP_UPLOADS}/Steadycam-Dispaly-Isole_300x200_2.jpg`}
          alt=""
          fill
          className="object-cover blur-xl scale-110"
          unoptimized
        />
      </div>

      <div className="relative z-10 w-full px-6 md:px-12 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-white/40 text-xs tracking-[0.4em] uppercase mb-2">Display</h2>
          <h1 className="text-white text-3xl md:text-4xl font-thin tracking-[0.2em] uppercase">
            Le Stanze
          </h1>
          <p className="text-white/50 text-sm mt-3">Scegli una stanza da esplorare</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onNavigate(room.id)}
              className="group relative aspect-[3/4] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
            >
              <Image
                src={room.image}
                alt={room.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                unoptimized
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${room.color} to-transparent`} />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-xs font-semibold tracking-[0.15em] uppercase">
                  {room.title}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Back to intro */}
        <div className="text-center mt-8">
          <button
            onClick={() => onNavigate("intro")}
            className="text-white/40 text-xs tracking-[0.2em] uppercase hover:text-white/70 transition-colors"
          >
            ← Menu
          </button>
        </div>
      </div>
    </div>
  );
}
