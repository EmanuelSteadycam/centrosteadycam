"use client";
import Image from "next/image";
import type { SlideId } from "../DisplaySlider";

interface Props {
  id: SlideId;
  title: string;
  subtitle: string;
  description: string;
  bgImage: string;
  color: string;
  onNavigate: (id: SlideId) => void;
}

export default function RoomSlide({ title, subtitle, description, bgImage, onNavigate }: Props) {
  return (
    <div className="relative w-full h-full flex items-end overflow-hidden">
      {/* Full background image */}
      <div className="absolute inset-0">
        <Image
          src={bgImage}
          alt={title}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        {/* Gradient overlay — heavier at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      </div>

      {/* Content — anchored to bottom */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-8 pb-20 md:pb-24">
        {/* Category label */}
        <p className="text-white/50 text-xs tracking-[0.4em] uppercase mb-3">{subtitle}</p>

        {/* Title */}
        <h1 className="text-white text-5xl md:text-7xl font-thin tracking-[0.15em] uppercase mb-6">
          {title}
        </h1>

        {/* Description */}
        <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
          {description}
        </p>

        {/* Back to stanze */}
        <button
          onClick={() => onNavigate("portfolio")}
          className="px-8 py-3 border border-white/40 text-white/70 text-xs font-medium tracking-[0.2em] uppercase
                     hover:border-white hover:text-white transition-all duration-300"
        >
          Tutte le stanze
        </button>
      </div>

      {/* Side navigation hints */}
      <div className="absolute top-1/2 -translate-y-1/2 left-6 z-10">
        <button
          onClick={() => onNavigate("portfolio")}
          className="text-white/30 hover:text-white/70 transition-colors"
          aria-label="Stanza precedente"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
