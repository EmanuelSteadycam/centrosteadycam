import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contatti",
  description: "Contatta il Centro Steadycam: C.so Michele Coppino 46/A, 12051 Alba (CN). Tel. 0173 316210.",
};

const contacts = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "Indirizzo",
    value: "C.so Michele Coppino 46/A\n12051 Alba (CN)",
    href: "https://maps.google.com/?q=Centro+Steadycam+Alba",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: "Telefono",
    value: "0173 316210",
    href: "tel:+390173316210",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: "Email",
    value: "info@progettosteadycam.it",
    href: "mailto:info@progettosteadycam.it",
  },
];

export default function ContattiPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-brand-navy pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="tag mb-4 inline-block">Siamo qui</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contatti</h1>
          <p className="text-white/60 text-lg max-w-xl">
            Dove la tecnologia promuove salute — vieni a trovarci o scrivici
          </p>
        </div>
      </div>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-bold text-brand-navy mb-8">Dove siamo</h2>

              <div className="space-y-6 mb-10">
                {contacts.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.label === "Indirizzo" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal flex-shrink-0 group-hover:bg-brand-teal group-hover:text-white transition-colors">
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{c.label}</p>
                      <p className="text-brand-navy font-medium whitespace-pre-line group-hover:text-brand-teal transition-colors">
                        {c.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>

              {/* ASL info */}
              <div className="bg-brand-lightGray rounded-2xl p-6">
                <p className="text-sm text-gray-500 mb-2">Parte di</p>
                <p className="font-bold text-brand-navy">ASL CN2 — Azienda Sanitaria Locale Cuneo 2</p>
                <p className="text-sm text-gray-500 mt-1">Distretto di Alba</p>
              </div>
            </div>

            {/* Map */}
            <div>
              <h2 className="text-2xl font-bold text-brand-navy mb-8">Come raggiungerci</h2>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <iframe
                  title="Mappa Centro Steadycam"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2844.2!2d8.034!3d44.698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zQ2VudHJvIFN0ZWFkeWNhbSwgQWxiYQ!5e0!3m2!1sit!2sit!4v1"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact form CTA */}
      <section className="py-20 bg-brand-lightGray">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-navy mb-4">Prenota una visita al Display</h2>
          <p className="text-gray-600 mb-8">
            Porta la tua classe al Laboratorio multimediale permanente per un percorso educativo unico
          </p>
          <Link href="/display" className="btn-primary text-base px-8 py-4">
            Vai alla prenotazione
          </Link>
        </div>
      </section>
    </div>
  );
}
