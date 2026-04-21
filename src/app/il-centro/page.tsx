import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Il Centro — Centro Steadycam",
  description: "Il Centro Steadycam dell'ASL CN2 di Alba: storia, metodo, servizi, archivio e staff.",
};

const WP = "https://centrosteadycam.it/wp-content/uploads";

const services = [
  {
    title: "Consulenza",
    text: "Cercate alcuni video da vedere in classe per discutere su un tema? State preparando un progetto educativo che prevede metodi didattici innovativi, interattività e uso della tecnologia? Il Centro può aiutarvi nella ricerca, selezione e assemblaggio di materiali audiovisivi, nella progettazione metodologica e negli spunti operativi.",
  },
  {
    title: "Formazione",
    text: "Consumo e dipendenze, utilizzo critico e consapevole della tecnologia digitale, videogiochi e cyberbullismo, produzione di immagini e video. Con oltre quindici anni di esperienza formativa, Steadycam ha numerose proposte rivolte ad insegnanti, educatori e operatori sociosanitari, per esplorare e sperimentare l'intreccio tra media education e promozione della salute.",
  },
  {
    title: "Interventi",
    text: "Gli operatori di Steadycam lavorano da sempre con i ragazzi, dalla scuola primaria agli Istituti Superiori, sui temi legati alla promozione della salute (consumo e sostanze, azzardo, bullismo, saggezza digitale, maschile e femminile…). È possibile concordare insieme le modalità dell'intervento: il numero e la durata degli incontri, la cadenza, la possibilità di coinvolgere i genitori.",
  },
];


const staff = [
  { name: "Valentino", role: "Coordinatore / Educatore Professionale", bio: "Attraverso l'esperienza del volontariato e del Servizio Civile matura l'idea di diventare Educatore Professionale. Dal 2011 coordina le attività del Centro Steadycam.", color: "#a3d39c", initial: "V" },
  { name: "Carmen",    role: "Psicologa Psicoterapeuta",               bio: "Psicologa psicoterapeuta specializzata in psicoterapie espressive. Si occupa del disagio adolescenziale presso lo spazio di ascolto giovani dell'ASL CN 2.", color: "#88bfe0", initial: "C" },
  { name: "Emanuel",   role: "Media Designer / Videomaker",            bio: "Da oltre venti anni crea e produce formati video su differenti piattaforme. Videomaker, Media designer, esperto in editing video e crossmedialità.", color: "#f4a261", initial: "E" },
  { name: "Gianna",    role: "Assistente Sociale / Docente",           bio: "Laureata in Servizio Sociale (Trieste). Dipendente del SerD ASL CN2, docente all'Università del Piemonte Orientale.", color: "#e07b8a", initial: "G" },
  { name: "Stefano",   role: "Educatore Professionale",                bio: "Educatore professionale. Dal 2002 al Ser.D dell'AslCn2. Si occupa di clinica, formazione, supervisione e promozione della salute con adolescenti e giovani adulti.", color: "#7bbfa3", initial: "S" },
  { name: "Beppe",     role: "Media Educator / Comunicatore",          bio: "Laureato in Scienze della Comunicazione (Torino). Entrato in Steadycam nel 2007. Dal 2010 conduce serate informative per genitori e insegnanti.", color: "#b07fd4", initial: "B" },
  { name: "Valentina", role: "Psicologa Psicoterapeuta",               bio: "Psicologa psicoterapeuta, specializzazione in psicoterapia sistemico-relazionale. Si occupa del GAP con approccio individuale, di coppia e familiare.", color: "#f4c96e", initial: "V" },
  { name: "Michele",   role: "Media Educator / Formatore",             bio: "Media educator, supervisore e formatore. Insegna all'Università Cattolica di Milano (Cremit). Dal 2000 collabora con Steadycam.", color: "#80c4d0", initial: "M" },
];

const bodyStyle    = { fontFamily: "var(--font-raleway)", fontSize: "clamp(14px, 1.5vw, 18px)" };
const servicesStyle = { fontFamily: "var(--font-raleway)", fontSize: "clamp(13px, 1.3vw, 16px)" };

export default function IlCentroPage() {
  return (
    <div>
      {/* ── Il Centro — testo sx, immagine dx ── */}
      <section id="chi-siamo" className="flex overflow-hidden" style={{ height: "100vh" }}>
        <div className="w-[50%] bg-white flex flex-col justify-center px-6 py-10 lg:px-12 lg:py-16">
          <h1 className="font-title font-semibold text-cs-charcoal uppercase tracking-[0.12em] mb-8"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.2rem)" }}>
            Il Centro
          </h1>
          <div className="space-y-5">
            <p className="font-light leading-[1.85] text-[#333]" style={bodyStyle}>
              <strong>Anno 2000:</strong> in un mondo ancora privo di smartphone, Youtube e social network
              nasce ad Alba il Progetto Steadycam, Centro di documentazione multimediale all&apos;interno
              dell&apos;area prevenzione del Servizio Dipendenze Patologiche dell&apos;ASL CN2. Uno sguardo
              insieme stabile e in movimento rivolto all&apos;universo giovanile.
            </p>
            <p className="font-light leading-[1.85] text-[#333]" style={bodyStyle}>
              Negli anni Steadycam cresce, costruendo una banca dati unica in Italia di oltre 34.119 record,
              definendo un metodo ispirato alla media education con uno staff di professionisti del Servizio
              Pubblico e del privato sociale.
            </p>
            <p className="font-light leading-[1.85] text-[#333]" style={bodyStyle}>
              Oggi il Centro partecipa a progetti su scala locale e nazionale, proponendo consulenze e
              percorsi formativi a ragazzi, insegnanti, genitori e operatori sociosanitari.
            </p>
          </div>
        </div>
        <div className="w-[50%] relative shrink-0">
          <img src={`${WP}/Steadycam_ilCentro3-scaled.jpg`} alt="Il Centro" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </section>

      {/* ── Il Metodo — immagine sx, testo dx ── */}
      <section id="il-metodo" className="relative z-10 flex scroll-mt-0 overflow-hidden" style={{ height: "100vh" }}>
        <div className="w-[50%] relative shrink-0">
          <img src={`${WP}/Steadycam_metodo-scaled.jpg`} alt="Il Metodo" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="w-[50%] bg-white flex flex-col justify-center px-6 py-10 lg:px-12 lg:py-16">
          <h2 className="font-title font-semibold text-cs-charcoal uppercase tracking-[0.12em] mb-8"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.2rem)" }}>
            Il Metodo
          </h2>
          <div className="space-y-5">
            <p className="font-light leading-[1.85] text-[#333]" style={bodyStyle}>
              Fare interventi di prevenzione, fino a ieri, prevedeva una logica lineare: un esperto fornisce
              informazioni, il pubblico ascolta, il prodotto fornito è preconfezionato e predefinito. Oggi però
              questo modello si scontra con lo scenario comunicativo contemporaneo, un flusso veloce, interattivo
              e circolare in cui chi consuma informazione è anche, almeno parzialmente, produttore attivo di contenuti.
            </p>
            <p className="font-light leading-[1.85] text-[#333]" style={bodyStyle}>
              Steadycam nasce per immergersi in questa complessità. Se la salute è una risorsa della vita
              quotidiana, come la definisce l&apos;OMS nel 1986, allora promuovere salute non si limita al
              settore sanitario ma deve mirare ad un più ampio benessere, ad uno stare bene nel mondo in cui
              viviamo. Come? Alimentando le <em>life skills</em>, &ldquo;abilità di vita&rdquo; per costruire
              un substrato critico e consapevole forte da utilizzare nel quotidiano.
            </p>
            <p className="font-light leading-[1.85] text-[#333]" style={bodyStyle}>
              Un quotidiano in cui i media non si limitano ad essere strumenti, ma costituiscono il tessuto
              connettivo delle relazioni sociali. Per questo è centrale la Media Education. Immagini, video,
              contenuti web, videogiochi diventano risorse integrali dell&apos;intervento educativo, intrecciando
              costantemente tre pratiche fondamentali: l&apos;educazione ai media, con i media e per i media.
            </p>
            <p className="font-light leading-[1.85] text-[#333]" style={bodyStyle}>
              Il Metodo Steadycam incrocia queste tre aree: una visione della salute come benessere,
              l&apos;attenzione allo sviluppo delle life skills, la Media Education come sguardo e prassi
              operativa. Si lavora con immagini e video per far emergere gli stili di vita degli interlocutori,
              le loro rappresentazioni, i loro saperi, con l&apos;obiettivo di creare confronto e scambio ma,
              soprattutto, di andare a rafforzare criticità e consapevolezza senza imporle in maniera prescrittiva.
              È un salto, a volte faticoso ma sempre arricchente, dalla linearità novecentesca alla circolarità contemporanea.
            </p>
          </div>
        </div>
      </section>

      {/* ── I Servizi — testo sx, immagine dx ── */}
      <section id="i-servizi" className="relative z-10 flex scroll-mt-0 overflow-hidden" style={{ height: "100vh" }}>
        <div className="w-[50%] flex flex-col justify-center px-6 py-10 lg:px-12 lg:py-16" style={{ background: "#1e1e1e" }}>
          <h2 className="font-title font-semibold text-white uppercase tracking-[0.12em] mb-8"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.2rem)" }}>
            I Servizi
          </h2>
          <p className="font-light leading-[1.85] text-white/80 mb-6" style={servicesStyle}>
            Il Centro Steadycam realizza, nell&apos;ambito di progetti specifici, servizi rivolti a operatori
            sociosanitari, educatori, insegnanti, genitori e studenti. Tali servizi, realizzati in collaborazione
            con operatori del privato sociale, includono:
          </p>
          <div className="space-y-5">
            {services.map((s) => (
              <div key={s.title}>
                <p className="font-title font-semibold text-white text-sm uppercase tracking-[0.1em] mb-1">{s.title}</p>
                <p className="font-light leading-[1.85] text-white/80" style={servicesStyle}>{s.text}</p>
              </div>
            ))}
          </div>
          <p className="font-light leading-[1.85] text-white/80 mt-6" style={servicesStyle}>
            La disponibilità dei servizi è legata all&apos;attivazione di progetti sul territorio, locale,
            regionale o nazionale. Potete mandarci le vostre richieste a{" "}
            <a href="mailto:info@progettosteadycam.it" className="underline hover:text-white transition-colors">
              info@progettosteadycam.it
            </a>
            {" "}— valuteremo insieme la fattibilità dell&apos;intervento.
          </p>
        </div>
        <div className="w-[50%] relative shrink-0">
          <img src={`${WP}/Steadycam_servizi-scaled.jpg`} alt="I Servizi" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </section>

      {/* ── L'Archivio — immagine sx, testo dx ── */}
      <section id="l-archivio" className="relative z-10 flex scroll-mt-0 overflow-hidden" style={{ height: "100vh" }}>
        <div className="w-[50%] relative shrink-0">
          <img src={`${WP}/01Steadycam_archivio1-100-1.jpg`} alt="L'Archivio" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="w-[50%] bg-white flex flex-col justify-center px-6 py-10 lg:px-12 lg:py-16">
          <h2 className="font-title font-semibold text-cs-charcoal uppercase tracking-[0.12em] mb-8"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.2rem)" }}>
            L&apos;Archivio
          </h2>
          <div className="space-y-4 mb-8">
            <p className="font-light leading-[1.85] text-[#333]" style={bodyStyle}>
              Il Centro Steadycam mette a disposizione l&apos;archivio storico di materiali audiovisivi
              raccolti e archiviati tra il 2000 e il 2013. Un archivio tematico su ciò che i palinsesti
              televisivi nazionali propongono a livello di &ldquo;immagine giovanile&rdquo; e offrono ai
              giovani stessi.
            </p>
            <p className="font-light leading-[1.85] text-[#333]" style={bodyStyle}>
              È composto da oltre <strong>34.119 schede</strong> di programmi televisivi (servizi da
              telegiornali, programmi di attualità, spot pubblicitari, videoclip) e film. La maggior parte
              del materiale è visionabile presso il Centro. Alcuni esempi di temi: Adolescenza, Scuola,
              Droghe, Tossicodipendenze, Gambling, Alcool, Comportamento a rischio, Informazione,
              Prevenzione, Affettività, Sessualità, Musica, Disturbi alimentari, ecc…
            </p>
            <p className="font-light leading-[1.85] text-[#333]" style={bodyStyle}>
              Si può procedere con una ricerca generica per aree tematiche, anche attraverso l&apos;incrocio
              di più parole chiave, oppure utilizzando la ricerca avanzata che permette di individuare anche
              un programma ben preciso.
            </p>
            <p className="font-light leading-[1.85] text-[#333]" style={bodyStyle}>
              L&apos;archivio comprende anche oltre 200 articoli e approfondimenti tematici pubblicati dal
              Centro tra il 2007 e il 2017, consultabili nella sezione dedicata.
            </p>
          </div>
          <a href="/archivio"
            className="inline-block font-title font-medium text-xs uppercase tracking-[0.1em] border border-[#333] text-[#333] px-5 py-2.5 hover:bg-[#333] hover:text-white transition-colors duration-200 self-start">
            Cerca nell&apos;archivio storico →
          </a>
        </div>
      </section>

      {/* ── Staff — immagine sfondo intera, grid bio ── */}
      <section id="staff" className="relative z-10 scroll-mt-0 overflow-hidden" style={{ height: "100vh" }}>
        <img src={`${WP}/2017/07/thanachot-phonket-319688.jpg`} alt="Staff" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="relative z-10 h-full flex flex-col justify-center px-6 py-8 lg:px-12">
          <h2 className="font-title font-semibold text-white uppercase tracking-[0.12em] mb-6"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.2rem)" }}>
            Staff
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
            {staff.map((m) => (
              <div key={m.name + m.role}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-title shrink-0"
                    style={{ background: m.color }}>
                    {m.initial}
                  </div>
                  <div>
                    <p className="font-title font-semibold text-white text-[15px] leading-tight">{m.name}</p>
                    <p className="font-title uppercase tracking-wider text-[11px]" style={{ color: m.color }}>{m.role}</p>
                  </div>
                </div>
                <p className="font-light text-white/70 leading-[1.7]" style={{ fontSize: "14px" }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contatti — mappa sx, info dx ── */}
      <section id="contatti" className="relative z-10 flex scroll-mt-0 overflow-hidden" style={{ height: "100vh" }}>
        <div className="w-[50%] relative shrink-0">
          <iframe
            title="Mappa Centro Steadycam"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2843.9!2d8.033!3d44.699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12d2b6f1a1b8a1a1%3A0x0!2sCentro+Steadycam%2C+Alba!5e0!3m2!1sit!2sit!4v1"
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="w-[50%] bg-white flex flex-col justify-center px-6 py-10 lg:px-12 lg:py-16">
          <h2 className="font-title font-semibold text-cs-charcoal uppercase tracking-[0.12em] mb-10"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.2rem)" }}>
            Contatti
          </h2>
          <div className="space-y-8">
            {[
              { label: "Indirizzo", value: "C.so Michele Coppino 46/A\n12051 Alba (CN)", href: "https://maps.google.com/?q=Centro+Steadycam+C.so+Michele+Coppino+46+Alba", external: true },
              { label: "Telefono",  value: "0173 316210",                                href: "tel:+390173316210",                   external: false },
              { label: "Email",     value: "info@progettosteadycam.it",                  href: "mailto:info@progettosteadycam.it",     external: false },
            ].map((c) => (
              <a key={c.label} href={c.href} target={c.external ? "_blank" : undefined} rel="noopener noreferrer" className="flex gap-4 group">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center text-white text-xs font-title font-semibold uppercase" style={{ background: "#a3d39c" }}>
                  {c.label[0]}
                </div>
                <div>
                  <p className="text-xs font-title font-semibold uppercase tracking-widest mb-0.5 text-[#999]">{c.label}</p>
                  <p className="font-light leading-[1.7] text-[#333] whitespace-pre-line group-hover:text-cs-sage transition-colors" style={bodyStyle}>{c.value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
