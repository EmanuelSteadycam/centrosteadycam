"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TEMATICHE = ([
  "AIDS","ASL","Aborto","Abuso","Accessibilità","Accoglienza","Addetto assistenza",
  "Adolescenza","Adozione","Adulto","Affettività","Affidamento","Aggregazione",
  "Aggressività","Alcool","Alcoolismo","Allucinogeni","Altre dipendenze","Altre droghe",
  "Altre religioni","Ambiente","Analfabetismo","Anfetamine","Animatore socio culturale",
  "Animazione","Anoressia","Antiproibizionismo","Anziano","Arte","Assistente domiciliare",
  "Assistente sociale","Assistenza domiciliare","Assistenza sociale","Associazionismo",
  "Autoaiuto","Bambini di strada","Barriere architettoniche","Bisogno","Bulimia","Bullismo",
  "Burn out","CNCA","Camorra","Cannabis","Carcere","Cartone animato","Casa",
  "Centro aggregazione","Centro diurno","Centro documentazione","Centro sociale",
  "Chiesa cattolica","Cinema","Città","Classi sociali","Coca","Cocaina","Complessità",
  "Comportamento","Comportamento a rischio","Comunicazione","Comunità","Confisca",
  "Conflitto","Consultorio","Consumo","Contestazione","Contraccezione","Cooperazione",
  "Cooperazione internazionale","Coppia","Corpo","Counselling","Crack","Criminalità",
  "Cultura","Devianza","Didattica","Diritti sociali politici","Diritti umani","Disagio",
  "Discriminazione","Disoccupazione","Dispersione scolastica","Disturbi alimentari",
  "Donna","Doping","Droghe","Ecstasy","Educatore professionale","Educazione",
  "Educazione civica","Emarginazione","Ente locale","Equipe","Eroina","Famiglia",
  "Farmaco","Farmacodipendenza","Finanziamento","Flussi migratori","Formazione",
  "Formazione professionale","Gambling","Genitori","Gioco","Giovane","Giurisprudenza",
  "Gravidanza","Gruppo","Gruppo Abele","Guerra","HIV Positivo","Handicap","Identità",
  "Immagine","Immigrati","Inalanti","Incidente","Industria","Infanzia","Infermiere",
  "Informagiovani","Informazione","Insegnante","Integrazione","Interculturalità",
  "Internet","Intervento","Islamismo","Istituto","Lavoro","Lavoro di strada","Lesbismo",
  "Linguaggio","Mafia","Magistrato","Malato terminale","Malattia","Malattia mentale",
  "Maltrattamenti","Mass media","Maternità","Medico","Mercato","Metadone","Metodologia",
  "Minoranza etnica","Minore","Moda","Morte","Movimento","Musica","Narcotraffico",
  "Ndrangheta","Omosessualità","Operatore","Operatore culturale","Oppiacei",
  "Organismi non governativi","Organizzazione","Organizzazione internazionale",
  "Orientamento","Ospedale","Pace","Partecipazione","Pedofilia","Politica",
  "Politiche sociali","Povertà","Preadolescenza","Pregiudizio","Preservativo",
  "Prevenzione","Privato profit","Privato sociale","Progetto","Proibizionismo",
  "Prostituzione","Provincia","Psichiatra","Psicofarmaci","Psicologo","Psicoterapeuta",
  "Pubblica sicurezza","Pubblicità","Pubblico","Quartiere","Razzismo","Reato","Reddito",
  "Regione","Relazione","Religiosità","Rete","Riabilitazione","Riciclaggio",
  "Ricongiungimento familiare","Riduzione del danno","Riforma","Ruolo","Salute",
  "Sanità","Sanzione","Scambi internazionali","Scuola","Senza fissa dimora","Separazione",
  "Servizi sociosanitari","Servizio civile","Servizio militare","Servizio sociale",
  "Servizio tossicodipendenze","Sesso sicuro","Sessualità","Sette religiose","Sfruttamento",
  "Sindacato","Sistema","Sistema economico","Sistema giudiziario","Skinhead","Sociale",
  "Socializzazione","Società","Sociologo","Solidarietà","Spaccio","Sport","Suicidio",
  "Sviluppo","Tabacco","Tabagismo","Telefonia","Televisione","Tempo libero","Tendenze",
  "Terapia","Test HIV","Tossicodipendenza","Transessualità","Trasfusione","Travestitismo",
  "Turismo e vacanze","Tutela","Università","Urbanistica","Usura","Utente","Vaccino HIV",
  "Valore","Valutazione","Videogioco","Violenza","Violenza sessuale","Vittima",
  "Volontariato","Welfare","Zingari",
] as const).slice().sort((a, b) => a.localeCompare(b, "it", { sensitivity: "base" }));

type Options = {
  reti: string[];
  nature: string[];
  targets: string[];
  programmi: string[];
};

const inp = "bg-white text-[#1e1e1e]/80 border border-[#7068a8]/20 rounded px-3 py-1.5 text-xs outline-none w-full focus:border-[#7068a8]/50";
const lab = "text-[#7068a8]/60 text-[10px] font-title font-bold uppercase tracking-wider mb-1";

function ComboField({
  label, value, options, placeholder, onChange,
}: {
  label: string; listId?: string; value: string;
  options: string[]; placeholder: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const containerRef          = useRef<HTMLDivElement>(null);

  const filtered = search
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const select = useCallback((opt: string) => {
    onChange(opt);
    setOpen(false);
    setSearch("");
  }, [onChange]);

  const clear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setOpen(false);
    setSearch("");
  }, [onChange]);

  // Chiudi cliccando fuori
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {label && <p className={lab}>{label}</p>}
      <div className="flex gap-1">
        <div
          className={inp + " flex-1 flex items-center justify-between cursor-pointer gap-2"}
          onClick={() => { setOpen(o => !o); setSearch(""); }}
        >
          {open ? (
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
              placeholder={placeholder}
              className="flex-1 outline-none bg-transparent text-xs"
            />
          ) : (
            <span className={value ? "text-[#1e1e1e]/80" : "text-black/30"}>
              {value || placeholder}
            </span>
          )}
          <span className="text-black/30 text-[10px] shrink-0">▼</span>
        </div>
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-black/15 rounded shadow-lg max-h-80 overflow-y-auto">
          {filtered.map(o => (
            <div
              key={o}
              onMouseDown={() => select(o)}
              className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-black/5 ${o === value ? "bg-black/5 font-medium" : ""}`}
              style={{ fontFamily: "var(--font-raleway)" }}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ArchivioSearchForm({ options }: { options: Options }) {
  const router = useRouter();
  const sp = useSearchParams();

  const push = (key: string, val: string) => {
    const params = new URLSearchParams(sp.toString());
    if (val) params.set(key, val); else params.delete(key);
    params.delete("page");
    router.push(`/archivio?${params.toString()}`);
  };

  const CHIP_LABELS: Record<string, string> = {
    q: "Cerca", rete: "Rete", natura: "Natura", programma: "Programma",
    target: "Target", anno: "Anno", sequenza: "Sequenza",
    tematica1: "Tematica", tematica2: "Tematica", tematica3: "Tematica",
  };
  const activeChips = Array.from(sp.entries()).filter(([k]) => k !== "page" && CHIP_LABELS[k]);

  const q         = sp.get("q") || "";
  const natura    = sp.get("natura") || "";
  const rete      = sp.get("rete") || "";
  const anno      = sp.get("anno") || "";
  const programma = sp.get("programma") || "";
  const target    = sp.get("target") || "";
  const sequenza  = sp.get("sequenza") || "";
  const tematica1 = sp.get("tematica1") || "";
  const tematica2 = sp.get("tematica2") || "";
  const tematica3 = sp.get("tematica3") || "";

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3" style={{ fontFamily: "var(--font-raleway)" }}>

        {/* Rete + Programma | Tematica 1 */}
        <div className="grid grid-cols-2 gap-x-6">
          <ComboField label="Rete" value={rete}
            options={[...options.reti].sort((a, b) => a.localeCompare(b, "it"))}
            placeholder="Cerca rete…" onChange={v => push("rete", v)} />
          <ComboField label="Programma di riferimento" value={programma}
            options={options.programmi}
            placeholder="Cerca programma…" onChange={v => push("programma", v)} />
        </div>

        <ComboField label="Tematica" value={tematica1}
          options={TEMATICHE} placeholder="Tematica 1…"
          onChange={v => push("tematica1", v)} />

        {/* Natura + Target | Tematica 2 */}
        <div className="grid grid-cols-2 gap-x-6">
          <ComboField label="Natura" value={natura}
            options={options.nature}
            placeholder="Cerca tipo…" onChange={v => push("natura", v)} />
          <ComboField label="Target" value={target}
            options={options.targets}
            placeholder="Cerca target…" onChange={v => push("target", v)} />
        </div>

        <ComboField label="Tematica" value={tematica2}
          options={TEMATICHE} placeholder="Tematica 2…"
          onChange={v => push("tematica2", v)} />

        {/* Anno + Sequenza | Tematica 3 */}
        <div className="grid grid-cols-2 gap-x-6">
          <div>
            <p className={lab}>Anno</p>
            <select value={anno} onChange={e => push("anno", e.target.value)} className={inp}>
              <option value="">Tutti gli anni</option>
              {Array.from({ length: 2014 - 1913 + 1 }, (_, i) => 2014 - i).map(y =>
                <option key={y} value={y}>{y}</option>
              )}
            </select>
          </div>
          <div>
            <p className={lab}>Sequenza</p>
            <select value={sequenza} onChange={e => push("sequenza", e.target.value)} className={inp}>
              <option value="">Tutti</option>
              <option value="1">Solo sequenze</option>
            </select>
          </div>
        </div>

        <ComboField label="Tematica" value={tematica3}
          options={TEMATICHE} placeholder="Tematica 3…"
          onChange={v => push("tematica3", v)} />
    </div>
  );
}
