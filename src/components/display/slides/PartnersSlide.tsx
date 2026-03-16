"use client";
import Image from "next/image";
import type { SlideId } from "../DisplaySlider";

const WP_UPLOADS = "https://centrosteadycam.it/wp-content/uploads";

const partners = [
  { name: "ASL CN2", logo: `${WP_UPLOADS}/AslCn2.jpg` },
  { name: "Fondazione CRC", logo: `${WP_UPLOADS}/Logo-FCRC-orizzontale-nuovoprevenzione-e-promozione-salute.png` },
  { name: "Città di Bra", logo: `${WP_UPLOADS}/Bra.png` },
  { name: "Consorzio Alba", logo: `${WP_UPLOADS}/Consorzio-ALBA.jpg` },
  { name: "Stemma Alba", logo: `${WP_UPLOADS}/Stemma_Alba_size-L_02.jpg` },
  { name: "Logo RoRo", logo: `${WP_UPLOADS}/Logo-RoRo.jpg` },
  { name: "Don Verri Roberto", logo: `${WP_UPLOADS}/associazione-don-verri-roberto.jpg` },
  { name: "Istituti Comprensivi", logo: `${WP_UPLOADS}/istituti-comprensivi.jpg` },
];

interface Props {
  onNavigate: (id: SlideId) => void;
}

export default function PartnersSlide({ onNavigate }: Props) {
  return (
    <div className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden px-8">
      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-white/40 text-xs tracking-[0.4em] uppercase mb-2">Display</p>
          <h1 className="text-white text-4xl font-thin tracking-[0.2em] uppercase">Partner</h1>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="relative w-24 h-14">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain filter brightness-75 hover:brightness-100 transition-all"
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate("intro")}
            className="px-8 py-3 border border-white/30 text-white/60 text-xs tracking-[0.2em] uppercase
                       hover:border-white hover:text-white transition-all"
          >
            ← Menu
          </button>
        </div>
      </div>
    </div>
  );
}
