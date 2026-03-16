import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Display — Laboratorio Multimediale Permanente",
  description:
    "Il Centro Display è un Laboratorio multimediale permanente: un luogo fisico, fatto di stanze, oggetti, tecnologie e persone, che può essere visitato da Scuole e Centri Estivi.",
};

export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  // No navbar/footer — Display is a fullscreen standalone experience
  return <>{children}</>;
}
