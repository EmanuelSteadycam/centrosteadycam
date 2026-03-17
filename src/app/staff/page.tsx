import type { Metadata } from "next";
import NavGrid from "@/components/NavGrid";

export const metadata: Metadata = {
  title: "Staff",
  description: "Il team del Centro Steadycam: educatori, psicologi, media designer e formatori.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

const staff = [
  {
    name: "Valentino",
    role: "Coordinatore / Educatore Professionale",
    bio: "Attraverso l'esperienza del volontariato e del Servizio Civile matura l'idea di diventare Educatore Professionale. Dal 2011 coordina le attività del Centro Steadycam. Si occupa degli aspetti progettuali e organizzativi e della promozione della salute e saggezza digitale. Ha una spiccata predilezione per P. K. Dick e Bruce Springsteen.",
    color: "#a3d39c",
    initial: "V",
  },
  {
    name: "Carmen",
    role: "Psicologa Psicoterapeuta",
    bio: "Psicologa psicoterapeuta specializzata in psicoterapie espressive. Si occupa del disagio adolescenziale presso lo spazio di ascolto giovani dell'ASL CN 2. Lavora con gruppi di supporto per genitori e conduce laboratori espressivi con adolescenti.",
    color: "#88bfe0",
    initial: "C",
  },
  {
    name: "Emanuel",
    role: "Media Designer / Videomaker",
    bio: "Da oltre venti anni crea e produce formati video su differenti piattaforme. Videomaker, Media designer, esperto in editing video e crossmedialità. Realizza tutti i materiali audiovisivi del Centro.",
    color: "#f4a261",
    initial: "E",
  },
  {
    name: "Gianna",
    role: "Assistente Sociale / Docente",
    bio: "Laureata in Servizio Sociale (Trieste). Dipendente del SerD ASL CN2, docente all'Università del Piemonte Orientale. Specializzata in tecniche di scrittura autobiografica e respirazione consapevole.",
    color: "#e07b8a",
    initial: "G",
  },
  {
    name: "Stefano",
    role: "Educatore Professionale",
    bio: "Educatore professionale. Dal 2002 al Ser.D dell'AslCn2. Si occupa di clinica, formazione, supervisione e promozione della salute con adolescenti e giovani adulti.",
    color: "#7bbfa3",
    initial: "S",
  },
  {
    name: "Beppe",
    role: "Media Educator / Comunicatore",
    bio: "Laureato in Scienze della Comunicazione (Torino). Entrato in Steadycam nel 2007. Dal 2010 conduce serate informative per genitori e insegnanti. Gestisce laboratori sul gaming al Centro Display. Appassionato di cinema e videogiochi fantasy.",
    color: "#b07fd4",
    initial: "B",
  },
  {
    name: "Valentina",
    role: "Psicologa Psicoterapeuta",
    bio: "Psicologa psicoterapeuta, specializzazione in psicoterapia sistemico-relazionale (Scuola Mara Selvini Palazzoli, Torino). Si occupa del GAP (gioco d'azzardo patologico) con approccio individuale, di coppia e familiare.",
    color: "#f4c96e",
    initial: "V",
  },
  {
    name: "Michele",
    role: "Media Educator / Formatore",
    bio: "Media educator, supervisore e formatore. Insegna all'Università Cattolica di Milano (Cremit). Dal 2000 collabora con Steadycam. Sostiene che «saper guardare sia una virtù etica».",
    color: "#80c4d0",
    initial: "M",
  },
];

export default function StaffPage() {
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="page-hero" style={{ height: 400 }}>
        <img
          src={`${WP}/2017/07/thanachot-phonket-319688.jpg`}
          alt="Staff"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="page-hero-title">Staff</h1>
      </div>

      {/* Staff grid */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {staff.map((m) => (
              <div key={m.name} className="text-center group">
                {/* Avatar circle */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-title font-light"
                  style={{ background: m.color }}
                >
                  {m.initial}
                </div>
                <h3 className="font-title font-semibold text-cs-charcoal text-lg mb-1">{m.name}</h3>
                <p
                  className="text-xs font-title font-medium uppercase tracking-wider mb-3"
                  style={{ color: m.color }}
                >
                  {m.role}
                </p>
                <p className="text-cs-text text-sm leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12" style={{ background: "#3f424a" }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-white/70 font-light mb-4">Vuoi collaborare con noi?</p>
          <a href="mailto:info@progettosteadycam.it" className="btn-ghost-white">
            Scrivici
          </a>
        </div>
      </section>

      <NavGrid exclude="/staff" />
    </div>
  );
}
