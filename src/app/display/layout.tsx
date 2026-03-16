import type { Metadata } from "next";
import { Raleway, Roboto_Slab } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600"],
  variable: "--font-raleway",
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["100", "300", "400"],
  variable: "--font-roboto-slab",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Display — Laboratorio Multimediale Permanente",
  description:
    "Il Centro Display è un Laboratorio multimediale permanente per Scuole e Centri Estivi. Stanze tematiche: Timeline, Storie, Gaming, Making, Corpo.",
};

export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${raleway.variable} ${robotoSlab.variable}`}>
      {children}
    </div>
  );
}
