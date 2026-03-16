import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Staff — Il Team",
  description: "Scopri il team del Centro Steadycam: educatori, psicologi, media designer e formatori.",
};

const WP_UPLOADS = "https://centrosteadycam.it/wp-content/uploads";

const staff = [
  {
    name: "Valentino",
    role: "Coordinatore / Educatore Professionale",
    bio: "Attraverso l'esperienza del volontariato e del Servizio Civile matura l'idea di diventare Educatore Professionale. Dal 2011 coordina le attività del Centro Steadycam. Si occupa degli aspetti progettuali e organizzativi. Ha una spiccata predilezione per P. K. Dick e Bruce Springsteen.",
    initials: "V",
    color: "bg-teal-600",
  },
  {
    name: "Carmen",
    role: "Psicologa Psicoterapeuta",
    bio: "Psicologa psicoterapeuta specializzata in psicoterapie espressive. Si occupa del disagio adolescenziale presso lo spazio di ascolto giovani dell'ASL CN 2.",
    initials: "C",
    color: "bg-blue-600",
  },
  {
    name: "Emanuel",
    role: "Media Designer / Videomaker",
    bio: "Da oltre venti anni crea e produce formati video su differenti piattaforme. Videomaker, Media designer, esperto in editing video e crossmedialità.",
    initials: "E",
    color: "bg-purple-600",
  },
  {
    name: "Gianna",
    role: "Assistente Sociale / Docente",
    bio: "Laureata in Servizio Sociale (Trieste). Dipendente del SerD ASL CN2, docente all'Università del Piemonte Orientale. Specializzata in scrittura autobiografica.",
    initials: "G",
    color: "bg-orange-600",
  },
  {
    name: "Stefano",
    role: "Educatore Professionale",
    bio: "Educatore professionale. Dal 2002 al Ser.D dell'AslCn2. Si occupa di clinica, formazione, supervisione e promozione della salute con adolescenti.",
    initials: "S",
    color: "bg-green-600",
  },
  {
    name: "Beppe",
    role: "Comunicatore / Media Educator",
    bio: "Laureato in Scienze della Comunicazione (Torino). Entrato in Steadycam nel 2007. Dal 2010 conduce serate informative per genitori e insegnanti. Gestisce laboratori sul gaming al Centro Display.",
    initials: "B",
    color: "bg-red-600",
  },
  {
    name: "Valentina",
    role: "Psicologa Psicoterapeuta",
    bio: "Psicologa psicoterapeuta, psicoterapia sistemico-relazionale (Scuola Mara Selvini Palazzoli, Torino). Si occupa del GAP (gioco d'azzardo patologico).",
    initials: "V",
    color: "bg-pink-600",
  },
  {
    name: "Michele",
    role: "Media Educator / Formatore",
    bio: "Media educator, supervisore e formatore. Insegna all'Università Cattolica di Milano (Cremit). Dal 2000 collabora con Steadycam.",
    initials: "M",
    color: "bg-indigo-600",
  },
];

export default function StaffPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-brand-navy pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="tag mb-4 inline-block">Centro Steadycam</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Il Team</h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Un gruppo interdisciplinare di educatori, psicologi, esperti di comunicazione e formatori
            uniti dalla passione per l&apos;educazione digitale
          </p>
        </div>
      </div>

      {/* Staff grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {staff.map((member) => (
              <div
                key={`${member.name}-${member.role}`}
                className="card group hover:-translate-y-1 transition-transform duration-300"
              >
                {/* Avatar */}
                <div className="p-8 text-center">
                  <div className={`w-20 h-20 rounded-full ${member.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <span className="text-white text-2xl font-bold">{member.initials}</span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-navy mb-1">{member.name}</h3>
                  <p className="text-brand-teal text-xs font-semibold uppercase tracking-wider mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-brand-lightGray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-brand-navy mb-8">Con il supporto di</h2>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-70">
            <Image src={`${WP_UPLOADS}/AslCn2.jpg`} alt="ASL CN2" width={120} height={50} className="h-12 w-auto object-contain" unoptimized />
            <Image src={`${WP_UPLOADS}/Logo_ROeRO.png`} alt="Ro e Ro" width={120} height={50} className="h-12 w-auto object-contain" unoptimized />
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 bg-brand-navy text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Collabora con noi</h2>
          <p className="text-white/70 mb-8">
            Sei un professionista interessato alla media education e alla promozione della salute?
          </p>
          <a href="mailto:info@progettosteadycam.it" className="btn-outline-white">
            Scrivici
          </a>
        </div>
      </section>
    </div>
  );
}
