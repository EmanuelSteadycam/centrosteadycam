import type { Metadata } from "next";
import NavGrid from "@/components/NavGrid";

export const metadata: Metadata = {
  title: "I Servizi",
  description: "Consulenza, formazione e interventi del Centro Steadycam per scuole, educatori e operatori socio-sanitari.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

const services = [
  {
    title: "Consulenza",
    icon: "💡",
    text: "Cercate alcuni video da vedere in classe per discutere su un tema? State preparando un progetto educativo che prevede metodi didattici innovativi, interattività e uso della tecnologia? Il Centro può aiutarvi nella ricerca, selezione e assemblaggio di materiali audiovisivi, nella progettazione metodologica e negli spunti operativi.",
  },
  {
    title: "Formazione",
    icon: "🎓",
    text: "Consumo e dipendenze, utilizzo critico e consapevole della tecnologia digitale, videogiochi e cyberbullismo, produzione di immagini e video. Con oltre quindici anni di esperienza formativa, Steadycam ha numerose proposte rivolte ad insegnanti, educatori e operatori sociosanitari, per esplorare e sperimentare l'intreccio tra media education e promozione della salute.",
  },
  {
    title: "Interventi",
    icon: "🤝",
    text: "Gli operatori di Steadycam lavorano da sempre con i ragazzi, dalla scuola primaria agli Istituti Superiori, sui temi legati alla promozione della salute (consumo e sostanze, azzardo, bullismo, saggezza digitale, maschile e femminile…). È possibile concordare insieme le modalità dell'intervento: il numero e la durata degli incontri, la cadenza, la possibilità di coinvolgere i genitori.",
  },
];

export default function ServiziPage() {
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="page-hero" style={{ height: 500 }}>
        <img
          src={`${WP}/Steadycam_servizi-scaled.jpg`}
          alt="I Servizi"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <h1 className="page-hero-title">i servizi</h1>
      </div>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {services.map((s) => (
              <div key={s.title}>
                <div className="text-3xl mb-4">{s.icon}</div>
                <h2 className="font-title font-semibold text-cs-charcoal text-xl uppercase tracking-[0.08em] mb-4">
                  {s.title}
                </h2>
                <p className="text-cs-text text-sm leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-cs-textLight text-sm mb-3">Hai un progetto in mente?</p>
            <a href="mailto:info@progettosteadycam.it" className="btn-orange">
              info@progettosteadycam.it
            </a>
          </div>
        </div>
      </section>

      {/* Nav grid — exclude i-servizi */}
      <NavGrid exclude="/i-servizi" />
    </div>
  );
}
