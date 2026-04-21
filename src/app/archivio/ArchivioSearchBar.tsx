"use client";
import { useRouter, useSearchParams } from "next/navigation";

const lab = "text-[#7068a8]/60 text-[10px] font-title uppercase tracking-wider mb-1";

const CHIP_LABELS: Record<string, string> = {
  q: "Cerca", rete: "Rete", natura: "Natura", programma: "Programma",
  target: "Target", anno: "Anno", sequenza: "Sequenza",
  tematica1: "Tematica", tematica2: "Tematica", tematica3: "Tematica",
};

const btn = "px-5 py-2 text-xs font-title uppercase tracking-[0.1em] border border-[#7068a8] bg-[#7068a8] text-white hover:bg-transparent hover:text-[#7068a8] transition-colors duration-200 rounded";

export default function ArchivioSearchBar() {
  const router = useRouter();
  const sp     = useSearchParams();

  const push = (key: string, val: string) => {
    const params = new URLSearchParams(sp.toString());
    if (val) params.set(key, val); else params.delete(key);
    params.delete("page");
    router.push(`/archivio?${params.toString()}`);
  };

  const q = sp.get("q") || "";
  const activeChips = Array.from(sp.entries()).filter(([k]) => k !== "page" && CHIP_LABELS[k]);

  return (
    <div className="grid grid-cols-2 gap-x-6" style={{ fontFamily: "var(--font-raleway)" }}>

      {/* Col 1: ricerca libera */}
      <div className="flex flex-col">
        <p className={lab + " invisible"}>_</p>
        <form className="flex gap-2" onSubmit={e => {
          e.preventDefault();
          const v = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
          push("q", v);
        }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Cerca titolo, abstract, parole chiave…"
            className="flex-1 bg-white text-[#1e1e1e] placeholder-[#7068a8]/30 border border-[#7068a8]/20 rounded px-4 py-2 text-sm outline-none focus:border-[#7068a8]/50 font-light"
          />
          <button type="submit" className={btn + " shrink-0"}>
            Cerca
          </button>
        </form>
      </div>

      {/* Col 2: chips filtri attivi */}
      <div className="self-start">
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 items-end">
            {activeChips.map(([key, val]) => (
              <div key={key} className="flex flex-col">
                <p className={lab}>{CHIP_LABELS[key]}</p>
                <button onClick={() => push(key, "")} className={btn + " group flex items-center gap-2"}>
                  {val}
                  <span className="text-white/70 text-lg leading-none group-hover:text-[#7068a8] transition-colors">×</span>
                </button>
              </div>
            ))}
            <button onClick={() => router.push("/archivio")} className="px-5 py-2 text-xs font-title uppercase tracking-[0.1em] border border-red-300 text-red-400 hover:bg-red-400 hover:text-white hover:border-red-400 transition-colors duration-200 rounded">
              Reset
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
