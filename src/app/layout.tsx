import type { Metadata } from "next";
import { Montserrat, Open_Sans, Roboto, Poppins, Oswald, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/navigation/SiteShell";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-open-sans",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Centro Steadycam — Dove la tecnologia promuove salute",
    template: "%s | Centro Steadycam",
  },
  description:
    "Centro Steadycam dell'ASL CN2 — educazione alla salute, media education, laboratori per scuole e famiglie. Alba (CN).",
  keywords: ["media education", "salute digitale", "centro steadycam", "alba cn", "display", "adam"],
  openGraph: { type: "website", locale: "it_IT", siteName: "Centro Steadycam" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${montserrat.variable} ${openSans.variable} ${roboto.variable} ${poppins.variable} ${oswald.variable} ${dmSerifDisplay.variable}`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
