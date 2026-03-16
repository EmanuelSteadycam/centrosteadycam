import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";

export const metadata: Metadata = {
  title: {
    default: "Centro Steadycam — Dove la tecnologia promuove salute",
    template: "%s | Centro Steadycam",
  },
  description:
    "Centro Steadycam dell'ASL CN2 — educazione alla salute, media education, laboratori per scuole e famiglie. Alba (CN).",
  keywords: ["media education", "salute digitale", "centro steadycam", "alba cn", "display", "adam"],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://centrosteadycam.it",
    siteName: "Centro Steadycam",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
