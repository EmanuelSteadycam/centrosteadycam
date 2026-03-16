"use client";
import Image from "next/image";
import type { SlideId } from "../DisplaySlider";

const WP_UPLOADS = "https://centrosteadycam.it/wp-content/uploads";

interface Props {
  onNavigate: (id: SlideId) => void;
}

export default function IntroSlide({ onNavigate }: Props) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={`${WP_UPLOADS}/2017/09/Logo_Dsplay_home4.jpg`}
          alt="Display background"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src={`${WP_UPLOADS}/2017/09/Icon_Display64x48_2pt.png`}
            alt="Display logo icon"
            width={80}
            height={60}
            className="mx-auto mb-4 filter brightness-0 invert"
            unoptimized
          />
          <h1 className="text-6xl md:text-8xl font-thin tracking-[0.3em] text-white uppercase">
            Display
          </h1>
          <p className="text-white/60 text-sm tracking-[0.4em] uppercase mt-2">
            Laboratorio Multimediale Permanente
          </p>
        </div>

        {/* ASL logo */}
        <div className="mb-10 opacity-70">
          <Image
            src={`${WP_UPLOADS}/ASL_CN2_new@2x.png`}
            alt="ASL CN2"
            width={120}
            height={40}
            className="filter brightness-0 invert"
            unoptimized
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => onNavigate("portfolio")}
            className="px-10 py-4 border-2 border-white text-white text-sm font-semibold tracking-[0.2em] uppercase
                       hover:bg-white hover:text-black transition-all duration-300"
          >
            Le Stanze
          </button>
          <button
            onClick={() => onNavigate("booking")}
            className="px-10 py-4 bg-white text-black text-sm font-semibold tracking-[0.2em] uppercase
                       hover:bg-white/80 transition-all duration-300"
          >
            Prenota
          </button>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-8 z-10">
        {[
          { id: "il-centro" as SlideId, label: "Il Centro" },
          { id: "il-progetto" as SlideId, label: "Il Progetto" },
          { id: "partner" as SlideId, label: "Partner" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="text-white/50 text-xs tracking-[0.2em] uppercase hover:text-white transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-28 right-8 text-white/30 text-xs tracking-wider hidden md:block">
        ESC · ← →
      </div>
    </div>
  );
}
