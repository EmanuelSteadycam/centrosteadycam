import type { Metadata } from "next";
import NavGrid from "@/components/NavGrid";

export const metadata: Metadata = {
  title: "Contatti",
  description: "Contatta il Centro Steadycam: C.so Michele Coppino 46/A, 12051 Alba (CN). Tel. 0173 316210.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

export default function ContattiPage() {
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="page-hero" style={{ height: 500 }}>
        <img
          src={`${WP}/Contatti_2-scaled.jpg`}
          alt="Contatti"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="page-hero-title text-4xl md:text-5xl mb-3">
            Dove la tecnologia promuove salute
          </h1>
          <p className="text-white/80 text-base font-light">
            info@progettosteadycam.it — C.so Coppino 46/A, Alba (CN)
          </p>
        </div>
      </div>

      {/* Contact info + map */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* Info */}
          <div>
            <h2 className="font-title font-light text-cs-charcoal text-2xl uppercase tracking-[0.06em] mb-8">
              Contatti
            </h2>
            <div className="space-y-6">
              {[
                {
                  label: "Indirizzo",
                  value: "C.so Michele Coppino 46/A\n12051 Alba (CN)",
                  href: "https://maps.google.com/?q=Centro+Steadycam+C.so+Michele+Coppino+46+Alba",
                },
                {
                  label: "Telefono",
                  value: "0173 316210",
                  href: "tel:+390173316210",
                },
                {
                  label: "Email",
                  value: "info@progettosteadycam.it",
                  href: "mailto:info@progettosteadycam.it",
                },
              ].map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.label === "Indirizzo" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex gap-4 group"
                >
                  <div
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-white text-xs font-title font-semibold uppercase transition-colors"
                    style={{ background: "#a3d39c" }}
                  >
                    {c.label[0]}
                  </div>
                  <div>
                    <p className="text-xs font-title font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#999" }}>
                      {c.label}
                    </p>
                    <p className="text-cs-text text-sm whitespace-pre-line group-hover:text-cs-orange transition-colors">
                      {c.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Map */}
          <div>
            <iframe
              title="Mappa Centro Steadycam"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2843.9!2d8.033!3d44.699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12d2b6f1a1b8a1a1%3A0x0!2sCentro+Steadycam%2C+Alba!5e0!3m2!1sit!2sit!4v1"
              width="100%"
              height="360"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="shadow-md"
            />
          </div>
        </div>
      </section>

      {/* JotForm — contact form */}
      <section className="py-12" style={{ background: "#f5f5f5" }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-title font-light text-cs-charcoal text-xl uppercase tracking-[0.06em] text-center mb-8">
            Scrivici
          </h2>
          <iframe
            src="https://form.jotform.com/70393978018365"
            title="Modulo di contatto"
            width="100%"
            height="500"
            style={{ border: "none", background: "transparent" }}
            scrolling="yes"
          />
        </div>
      </section>

      <NavGrid exclude="/contatti" />
    </div>
  );
}
