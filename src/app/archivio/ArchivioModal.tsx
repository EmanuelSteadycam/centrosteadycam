"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Item = Record<string, any>;

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-3 py-2 border-b border-black/6 last:border-0">
      <span className="shrink-0 w-40 text-[11px] font-title uppercase tracking-wider text-[#7068a8]/50 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-[#1e1e1e]" style={{ fontFamily: "var(--font-raleway)" }}>
        {value}
      </span>
    </div>
  );
}

export default function ArchivioModal({
  itemId,
  onClose,
}: {
  itemId: number;
  onClose: () => void;
}) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/archivio/${itemId}`)
      .then(r => r.json())
      .then(data => { setItem(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [itemId]);

  // Chiudi con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Blocca scroll body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const dataOra = item
    ? [formatDate(item.data_trasmissione), item.ora_inizio].filter(Boolean).join(" · ")
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Barra superiore */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-end px-6 py-4 border-b border-black/8">
          <div className="flex items-center gap-3">
            {item && (
              <button
                onClick={() => {
                  const dataOraStr = [formatDate(item.data_trasmissione), item.ora_inizio].filter(Boolean).join(" · ");
                  const rows: [string, string][] = [
                    ["Rete", item.rete],
                    ["Programma", item.programma_riferimento],
                    ["Data", dataOraStr || item.anno],
                    ["Durata", item.durata],
                    ["Natura", item.natura],
                    ["Target", item.target],
                    ["Approccio", item.approccio],
                    ["Origine", item.origine],
                    ["Anno", item.anno],
                    ["Produzione", item.produzione],
                    ["Autore", item.autore],
                    ["Interpreti", item.interpreti],
                    ["Con testimonianze", item.con_testimonianze === true ? "Sì" : item.con_testimonianze === false ? "No" : ""],
                    ["Con statistiche", item.con_statistiche === true ? "Sì" : item.con_statistiche === false ? "No" : ""],
                    ["Codice", item.codice_programma],
                  ].filter(([, v]) => v) as [string, string][];
                  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${item.titolo || "Scheda"}</title>
                  <style>body{font-family:Arial,sans-serif;font-size:13px;color:#222;max-width:700px;margin:40px auto;padding:0 20px}
                  h1{font-size:18px;margin-bottom:4px}p.meta{color:#666;font-size:12px;margin-bottom:16px}
                  p.abstract{line-height:1.7;margin-bottom:16px}
                  table{width:100%;border-collapse:collapse}td{padding:5px 8px;border-bottom:1px solid #eee;font-size:12px}
                  td:first-child{color:#999;text-transform:uppercase;font-size:10px;width:160px;white-space:nowrap}
                  </style></head><body>
                  <h1>${item.titolo || "Senza titolo"}</h1>
                  <p class="meta">${[item.programma_riferimento, item.rete, dataOraStr, item.natura].filter(Boolean).join(" · ")}</p>
                  ${item.abstract ? `<p class="abstract">${item.abstract}</p>` : ""}
                  <table>${rows.map(([l, v]) => `<tr><td>${l}</td><td>${v}</td></tr>`).join("")}</table>
                  </body></html>`;
                  const w = window.open("", "_blank");
                  if (w) { w.document.write(html); w.document.close(); w.print(); }
                }}
                className="text-black/35 hover:text-black transition-colors"
                title="Stampa"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/8 transition-colors text-black/60 hover:text-black text-3xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-sm text-black/30" style={{ fontFamily: "var(--font-raleway)" }}>
              Caricamento…
            </span>
          </div>
        ) : !item ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-sm text-black/30" style={{ fontFamily: "var(--font-raleway)" }}>
              Scheda non trovata.
            </span>
          </div>
        ) : (
          <div className="px-6 py-6">

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="shrink-0 w-[140px] h-[140px] rounded-lg overflow-hidden bg-black/5">
                <Image
                  src={item.image_url && !imgError ? item.image_url : "/archivio-placeholder.jpg"}
                  alt={item.titolo || ""}
                  width={140} height={140}
                  className="w-full h-full object-cover"
                  unoptimized
                  onError={() => setImgError(true)}
                />
              </div>
              <div className="flex-1">
                {item.is_fondamentale && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-title uppercase tracking-wider text-[#7068a8] mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b8b0d0]" />
                    Fondamentale
                  </span>
                )}
                <h2 className="font-title font-semibold text-[#7068a8] leading-snug text-lg mb-1">
                  {item.titolo || <span className="italic text-black/30">Senza titolo</span>}
                </h2>
                <p className="text-black/60 text-sm" style={{ fontFamily: "var(--font-raleway)" }}>
                  {[item.natura, item.programma_riferimento, item.rete, dataOra].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>

            {/* Abstract */}
            {item.abstract && (
              <p className="font-light text-[#1e1e1e]/85 leading-[1.75] text-[15px] mb-6"
                style={{ fontFamily: "var(--font-raleway)" }}>
                {item.abstract}
              </p>
            )}

            {/* Tags */}
            {item.tags && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {item.tags.split(",").map((t: string) => (
                  <a
                    key={t}
                    href={`/archivio?tematica1=${encodeURIComponent(t.trim())}`}
                    className="text-[10px] font-title uppercase tracking-wider text-[#7068a8]/70 border border-[#7068a8]/25 px-2.5 py-1 rounded-full hover:border-[#7068a8] hover:text-[#5b4d8a] transition-colors"
                  >
                    {t.trim()}
                  </a>
                ))}
              </div>
            )}

            {/* Scheda tecnica */}
            <div className="bg-[#f0edf8] rounded-xl px-5 py-3">
              <Row label="Rete"              value={item.rete} />
              <Row label="Programma"         value={item.programma_riferimento} />
              <Row label="Data"              value={dataOra || item.anno} />
              <Row label="Durata"            value={item.durata} />
              <Row label="Natura"            value={item.natura} />
              <Row label="Target"            value={item.target} />
              <Row label="Approccio"         value={item.approccio} />
              <Row label="Origine"           value={item.origine} />
              <Row label="Anno"              value={item.anno} />
              <Row label="Produzione"        value={item.produzione} />
              <Row label="Autore"            value={item.autore} />
              <Row label="Interpreti"        value={item.interpreti} />
              <Row label="Con testimonianze" value={item.con_testimonianze === true ? "Sì" : item.con_testimonianze === false ? "No" : undefined} />
              <Row label="Con statistiche"   value={item.con_statistiche === true ? "Sì" : item.con_statistiche === false ? "No" : undefined} />
              <Row label="Codice"             value={item.codice_programma} />
              <Row label="Streaming"         value={
                item.streaming_url
                  ? <a href={item.streaming_url} target="_blank" rel="noopener noreferrer"
                      className="text-[#7068a8] hover:underline">Guarda lo streaming →</a>
                  : undefined
              } />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
