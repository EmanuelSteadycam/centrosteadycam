"use client";
import { useRouter, useSearchParams } from "next/navigation";

const btn = "px-5 py-2 text-xs font-title uppercase tracking-[0.1em] border border-[#7068a8] bg-[#7068a8] text-white hover:bg-transparent hover:text-[#7068a8] transition-colors duration-200 rounded";

export default function ApprofondimentiSearchClient() {
  const router = useRouter();
  const sp     = useSearchParams();
  const q      = sp.get("q") || "";

  return (
    <form
      className="flex gap-2 max-w-xl"
      onSubmit={e => {
        e.preventDefault();
        const val = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
        const params = new URLSearchParams();
        if (val) params.set("q", val);
        router.push(`/archivio/approfondimenti${params.toString() ? `?${params}` : ""}`);
      }}
    >
      <input
        name="q"
        defaultValue={q}
        placeholder="Cerca negli approfondimenti…"
        className="flex-1 bg-white text-[#1e1e1e] placeholder-[#7068a8]/30 border border-[#7068a8]/20 rounded px-4 py-2 text-sm outline-none focus:border-[#7068a8]/50 font-light"
        style={{ fontFamily: "var(--font-raleway)" }}
      />
      <button type="submit" className={btn + " shrink-0"}>Cerca</button>
      {q && (
        <button type="button" onClick={() => router.push("/archivio/approfondimenti")}
          className="px-5 py-2 text-xs font-title uppercase tracking-[0.1em] border border-red-300 text-red-400 hover:bg-red-400 hover:text-white hover:border-red-400 transition-colors duration-200 rounded shrink-0">
          Reset
        </button>
      )}
    </form>
  );
}
