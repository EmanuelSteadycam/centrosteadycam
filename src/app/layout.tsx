import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/navigation/SiteShell";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-open-sans",
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
      <body className={`${montserrat.variable} ${openSans.variable}`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
