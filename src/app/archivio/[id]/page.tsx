import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type Params = { id: string };

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== false) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-black/6 last:border-0">
      <span className="shrink-0 w-44 text-[11px] font-title uppercase tracking-wider text-black/35 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-[#1e1e1e]/80" style={{ fontFamily: "var(--font-raleway)" }}>
        {value}
      </span>
    </div>
  );
}

export default async function ArchivioItemPage({ params }: { params: Params }) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const supabase = createSupabaseServerClient();
  const { data: item } = await supabase
    .from("archivio_items")
    .select("*")
    .eq("id", id)
    .single();

  if (!item) notFound();

  const dataOra = [formatDate(item.data_trasmissione), item.ora_inizio].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="px-12 pt-20 pb-10 bg-[#f7f7f5]">
        <Link href="/archivio"
          className="text-[11px] font-title uppercase tracking-wider text-black/35 hover:text-black transition-colors mb-6 inline-block">
          ← Archivio
        </Link>

        <div className="flex items-start gap-6">
          {item.image_url && (
            <div className="shrink-0 w-[100px] h-[100px] rounded overflow-hidden bg-black/5">
              <Image
                src={item.image_url}
                alt={item.titolo || ""}
                width={100} height={100}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          )}

          <div className="flex-1">
            {item.is_fondamentale && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-title uppercase tracking-wider text-[#6aaa64] mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6aaa64]" />
                Fondamentale
              </span>
            )}
            <h1 className="font-title font-semibold text-[#1e1e1e] leading-snug mb-2"
              style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.8rem)" }}>
              {item.titolo || <span className="italic text-black/30">Senza titolo</span>}
            </h1>
            <p className="text-black/50 text-sm" style={{ fontFamily: "var(--font-raleway)" }}>
              {[item.programma_riferimento, item.rete, dataOra, item.natura].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
      </div>

      {/* Corpo */}
      <div className="px-12 py-10 max-w-4xl">

        {/* Abstract */}
        {item.abstract && (
          <div className="mb-10">
            <p className="font-light text-[#1e1e1e]/75 leading-[1.75] text-[15px]"
              style={{ fontFamily: "var(--font-raleway)" }}>
              {item.abstract}
            </p>
          </div>
        )}

        {/* Tags */}
        {item.tags && (
          <div className="flex flex-wrap gap-1.5 mb-10">
            {item.tags.split(",").map((t: string) => (
              <Link
                key={t}
                href={`/archivio?tematica1=${encodeURIComponent(t.trim())}`}
                className="text-[10px] font-title uppercase tracking-wider text-black/40 border border-black/15 px-2.5 py-1 rounded-full hover:border-black/40 hover:text-black transition-colors"
              >
                {t.trim()}
              </Link>
            ))}
          </div>
        )}

        {/* Scheda tecnica */}
        <div className="bg-[#f7f7f5] rounded-xl px-6 py-4">
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
          <Row label="Con testimonianze" value={item.con_testimonianze === true ? "Sì" : item.con_testimonianze === false ? "No" : null} />
          <Row label="Con statistiche"   value={item.con_statistiche === true ? "Sì" : item.con_statistiche === false ? "No" : null} />
          <Row label="Codice"             value={item.codice_programma} />
          <Row label="Streaming"         value={
            item.streaming_url
              ? <a href={item.streaming_url} target="_blank" rel="noopener noreferrer"
                  className="text-[#5a9a5a] hover:underline">Guarda lo streaming →</a>
              : null
          } />
        </div>

      </div>
    </div>
  );
}
