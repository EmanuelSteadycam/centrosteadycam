"use client";
import Image from "next/image";
import type { SlideId } from "../DisplaySlider";

interface Props {
  title: string;
  bgImage: string;
  content: string;
  onNavigate: (id: SlideId) => void;
}

export default function InfoSlide({ title, bgImage, content, onNavigate }: Props) {
  const paragraphs = content.split("\n\n").filter(Boolean);

  return (
    <div className="relative w-full h-full flex overflow-hidden">
      {/* Split layout */}
      <div className="flex w-full h-full">
        {/* Left — image */}
        <div className="hidden md:block w-1/2 relative">
          <Image
            src={bgImage}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-end p-12">
            <h1 className="text-white text-5xl font-thin tracking-[0.2em] uppercase">{title}</h1>
          </div>
        </div>

        {/* Right — text */}
        <div className="w-full md:w-1/2 bg-black flex flex-col justify-center px-8 md:px-12 py-16 overflow-y-auto">
          <h1 className="md:hidden text-white text-3xl font-thin tracking-[0.2em] uppercase mb-8">{title}</h1>

          <div className="space-y-6 max-w-lg">
            {paragraphs.map((para, i) => {
              // Check if it's a heading (all caps, short)
              const isHeading = para.length < 30 && para === para.toUpperCase();
              return isHeading ? (
                <h3
                  key={i}
                  className="text-white/50 text-xs tracking-[0.3em] uppercase font-semibold pt-4 first:pt-0"
                >
                  {para}
                </h3>
              ) : (
                <p key={i} className="text-white/70 text-sm leading-relaxed">
                  {para}
                </p>
              );
            })}
          </div>

          <div className="flex gap-4 mt-12">
            <button
              onClick={() => onNavigate("intro")}
              className="px-8 py-3 border border-white/30 text-white/60 text-xs tracking-[0.2em] uppercase
                         hover:border-white hover:text-white transition-all"
            >
              ← Menu
            </button>
            <button
              onClick={() => onNavigate("booking")}
              className="px-8 py-3 bg-white text-black text-xs font-semibold tracking-[0.2em] uppercase
                         hover:bg-white/80 transition-all"
            >
              Prenota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
