"use client";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IntroSlide from "./slides/IntroSlide";
import PortfolioSlide from "./slides/PortfolioSlide";
import RoomSlide from "./slides/RoomSlide";
import BookingSlide from "./slides/BookingSlide";
import InfoSlide from "./slides/InfoSlide";
import PartnersSlide from "./slides/PartnersSlide";

export type SlideId =
  | "intro"
  | "portfolio"
  | "timeline"
  | "storie"
  | "gaming"
  | "making"
  | "corpo"
  | "booking"
  | "il-centro"
  | "il-progetto"
  | "partner";

const SLIDE_ORDER: SlideId[] = [
  "intro",
  "portfolio",
  "timeline",
  "storie",
  "gaming",
  "making",
  "corpo",
  "booking",
  "il-centro",
  "il-progetto",
  "partner",
];

interface DisplaySliderProps {
  initialSlide?: SlideId;
}

export default function DisplaySlider({ initialSlide = "intro" }: DisplaySliderProps) {
  const [currentSlide, setCurrentSlide] = useState<SlideId>(initialSlide);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const goTo = useCallback(
    (slideId: SlideId) => {
      const currentIdx = SLIDE_ORDER.indexOf(currentSlide);
      const nextIdx = SLIDE_ORDER.indexOf(slideId);
      setDirection(nextIdx >= currentIdx ? 1 : -1);
      setCurrentSlide(slideId);
    },
    [currentSlide]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const idx = SLIDE_ORDER.indexOf(currentSlide);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (idx < SLIDE_ORDER.length - 1) goTo(SLIDE_ORDER[idx + 1]);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (idx > 0) goTo(SLIDE_ORDER[idx - 1]);
      } else if (e.key === "Escape") {
        goTo("intro");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentSlide, goTo]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case "intro":
        return <IntroSlide key="intro" onNavigate={goTo} />;
      case "portfolio":
        return <PortfolioSlide key="portfolio" onNavigate={goTo} />;
      case "timeline":
        return (
          <RoomSlide
            key="timeline"
            id="timeline"
            title="TIMELINE"
            subtitle="TUTTE LE STANZE"
            description="Un gioco a squadre per sfidarsi sulle date chiave del mondo dei media."
            bgImage="https://centrosteadycam.it/wp-content/uploads/2017/09/Steadycam-Dispaly-Isole_02.jpg"
            color="#1A5276"
            onNavigate={goTo}
          />
        );
      case "storie":
        return (
          <RoomSlide
            key="storie"
            id="storie"
            title="STORIE"
            subtitle="IN GALLERIA"
            description="Ogni immagine racconta molte storie: la nostra, quella di chi vi è ritratto, quella di chi la guarda. Quante storie si possono raccontare mettendo insieme più immagini?"
            bgImage="https://centrosteadycam.it/wp-content/uploads/2017/09/Steadycam-Dispaly-Storie-03.jpg"
            color="#1A3A4A"
            onNavigate={goTo}
          />
        );
      case "gaming":
        return (
          <RoomSlide
            key="gaming"
            id="gaming"
            title="GAMING"
            subtitle="EMOZIONALE"
            description="I videogiochi sono un mondo, in cui a volte perdersi... per poi interrogarsi sulle emozioni. Per i ragazzi di terza media il gioco entra nella realtà virtuale, con l'utilizzo dei caschi VR."
            bgImage="https://centrosteadycam.it/wp-content/uploads/2017/09/Steadycam-Dispaly-Gaming_Big_Right.jpg"
            color="#1B2631"
            onNavigate={goTo}
          />
        );
      case "making":
        return (
          <RoomSlide
            key="making"
            id="making"
            title="MAKING"
            subtitle="CHI È SIRI?"
            description="La stanza giusta per mettere le mani dentro alla tecnologia: aprire un dispositivo, smontarne e rimontarne i componenti, capire cosa c'è davvero dentro il nostro smartphone."
            bgImage="https://centrosteadycam.it/wp-content/uploads/2017/09/Steadycam-Display-making03.jpg"
            color="#1C2833"
            onNavigate={goTo}
          />
        );
      case "corpo":
        return (
          <RoomSlide
            key="corpo"
            id="corpo"
            title="CORPO"
            subtitle="IL NOSTRO"
            description="Una stanza dove dimenticare i dispositivi digitali e riscoprire la tecnologia più evoluta che abbiamo: il nostro corpo. Attività fisiche e sensoriali per riconnettersi con se stessi."
            bgImage="https://centrosteadycam.it/wp-content/uploads/2017/09/Steadycam-Dispaly-Corpo-Big.jpg"
            color="#1A2744"
            onNavigate={goTo}
          />
        );
      case "booking":
        return <BookingSlide key="booking" onNavigate={goTo} />;
      case "il-centro":
        return (
          <InfoSlide
            key="il-centro"
            title="IL CENTRO"
            bgImage="https://centrosteadycam.it/wp-content/uploads/Il_centro1.jpg"
            content={`Il Centro Display è un Laboratorio multimediale permanente: un luogo fisico, fatto di stanze, oggetti, tecnologie e persone, che può essere visitato e diventare meta di un viaggio di istruzione per Scuole e Centri Estivi.

All'interno di Display i ragazzi partecipano ad un percorso didattico-esperienziale attraverso le sue stanze tematiche, prendendo parte a giochi, sfide e laboratori, interagendo continuamente con se stessi, i compagni, gli educatori del Centro e le tecnologie digitali.

Un tempo importante viene dedicato, al termine di ogni attività, alla riflessione e al confronto sulle esperienze vissute, condividendo emozioni, idee e domande, con l'obiettivo di attivare uno 'sguardo critico' sui comportamenti e sulle relazioni mediate dalle nuove tecnologie.

Il Centro è parte del Progetto Display, promosso dalla Città di Bra, dall'ASL CN2 e realizzato con il contributo della Fondazione CRC, nell'ambito del bando Prevenzione e Promozione della Salute.`}
            onNavigate={goTo}
          />
        );
      case "il-progetto":
        return (
          <InfoSlide
            key="il-progetto"
            title="IL PROGETTO"
            bgImage="https://centrosteadycam.it/wp-content/uploads/Il_centro2-1.jpg"
            content={`PREMESSA

La dipendenza da nuove tecnologie, tra le 'dipendenze senza sostanze', è una modalità disadattiva nell'utilizzo delle stesse che va ben oltre le necessità lavorative e/o di svago.

L'uomo, per sua naturale caratteristica evolutiva, ha la capacità di adeguarsi ai più radicali cambiamenti socio-ambientali, ma la rivoluzione tecnologica che lo ha investito è avvenuta con una velocità tale da superare ogni capacità di adattamento.

OBIETTIVI

Dal 2000 il Centro Steadycam dell'ASL CN2, ha avviato in ambito sanitario, educativo e didattico, a livello locale, regionale e nazionale, riflessioni ed interventi su promozione della salute e media education.

DESTINATARI

Il Centro Display è rivolto principalmente a scuole primarie e secondarie di primo grado del territorio albese, ai loro insegnanti, e alle famiglie.`}
            onNavigate={goTo}
          />
        );
      case "partner":
        return <PartnersSlide key="partner" onNavigate={goTo} />;
      default:
        return <IntroSlide key="intro" onNavigate={goTo} />;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          {renderSlide()}
        </motion.div>
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {SLIDE_ORDER.map((id) => (
          <button
            key={id}
            onClick={() => goTo(id)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === id ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Vai a ${id}`}
          />
        ))}
      </div>
    </div>
  );
}
