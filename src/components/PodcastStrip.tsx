"use client";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { motion } from "framer-motion";
import { PODCAST_PATH } from "@/lib/podcast";

const boxpot = localFont({ src: "../app/addomesticareglischermi/fonts/boxpot.ttf", display: "swap" });

const GREEN_DARK = "#4E7F43";
const PINK = "#FF3EA5";

// Fascia in home che porta alla pagina del podcast: la bambina entra da destra e poggia sulla griglia sottostante
export default function PodcastStrip() {
  return (
    <section className="bg-white overflow-hidden">
      <Link
        href={PODCAST_PATH}
        className="group pl-4 sm:pl-6 lg:pl-8 md:pr-[50px] grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:gap-8 items-end"
      >
        <motion.div
          className="pt-4 md:self-center md:justify-self-end"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span
            className="w-12 h-12 rounded-full flex items-center justify-center mb-5 text-white"
            style={{ background: PINK }}
            aria-hidden
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0014 0M12 17v5M8 22h8" />
            </svg>
          </span>
          <p className="font-title text-xs font-semibold uppercase tracking-[0.3em] text-[#555] mb-5">
            Il nuovo podcast del Centro Steadycam
          </p>
          <h2
            className={`${boxpot.className} uppercase leading-[0.95] tracking-[0.08em] transition-transform group-hover:-rotate-2 origin-left`}
            style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.8rem)", color: GREEN_DARK }}
          >
            Addomesticare
            <br />
            gli schermi
          </h2>
        </motion.div>
        <motion.div
          className="justify-self-end w-full md:w-[640px]"
          initial={{ opacity: 0, x: "60%" }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/podcast/bambina.png"
            alt="Addomesticare gli schermi, il podcast del Centro Steadycam"
            width={1600}
            height={1409}
            sizes="(min-width: 768px) 640px, 100vw"
            className="w-full h-auto block"
          />
        </motion.div>
      </Link>
    </section>
  );
}
