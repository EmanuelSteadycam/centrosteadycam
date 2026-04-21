import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ApprofondimentiResults from "./ApprofondimentiResults";

export const metadata: Metadata = {
  title: "Approfondimenti — Centro Steadycam",
  description: "Articoli e approfondimenti del Centro di documentazione audiovisiva Steadycam.",
};

const PER_PAGE = 20;

type SearchParams = { q?: string; page?: string };

async function fetchResults(sp: SearchParams) {
  const supabase = createSupabaseServerClient();
  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * PER_PAGE;
  const to   = from + PER_PAGE - 1;

  let q = supabase
    .from("approfondimenti")
    .select("id,id_originale,titolo,data,estratto,image_url", { count: "exact" });

  if (sp.q?.trim()) q = q.textSearch("fts", sp.q.trim(), { type: "websearch", config: "italian" });

  q = q.order("data", { ascending: false, nullsFirst: false }).range(from, to);

  const { data, count, error } = await q;
  if (error) console.error("Approfondimenti query error:", error);
  const total = count ?? 0;
  return { items: data ?? [], total, hasMore: total > PER_PAGE };
}

export default async function ApprofondimentiPage({ searchParams }: { searchParams: SearchParams }) {
  const { items, total, hasMore } = await fetchResults(searchParams);
  const hasQuery = !!searchParams.q?.trim();

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="px-12 pt-[120px] pb-8 bg-[#ede9f5]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4" style={{ fontFamily: "var(--font-raleway)" }}>
          <Link href="/archivio" className="text-[11px] font-title uppercase tracking-wider text-[#7068a8]/50 hover:text-[#7068a8] transition-colors">
            ← L&apos;Archivio Storico
          </Link>
        </div>

        <h1 className="font-title font-semibold text-[#1e1e1e] uppercase tracking-[0.12em] mb-2"
          style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.2rem)" }}>
          Approfondimenti
        </h1>
        <p className="font-light text-black/50 mb-8" style={{ fontFamily: "var(--font-raleway)", fontSize: "15px" }}>
          Articoli e rassegne dal Centro di documentazione audiovisiva
          {hasQuery && total > 0 && (
            <span className="text-black/70"> — <strong className="font-semibold">{total.toLocaleString("it-IT")}</strong> risultati</span>
          )}
        </p>

        {/* Ricerca */}
        <Suspense>
          <ApprofondimentiSearch />
        </Suspense>
      </div>

      {/* Risultati */}
      <div className="px-12 py-8">
        {items.length === 0 ? (
          hasQuery ? (
            <p className="font-light text-black/40 text-sm" style={{ fontFamily: "var(--font-raleway)" }}>
              Nessun risultato per questa ricerca.
            </p>
          ) : null
        ) : (
          <Suspense>
            <ApprofondimentiResults initialItems={items} initialTotal={total} initialHasMore={hasMore} />
          </Suspense>
        )}
      </div>

      {/* Logo in fondo */}
      <div className="flex justify-center py-12">
        <img src="/CentroSteadycam_logo_old@2x.png" alt="Steadycam" className="h-[300px] w-auto opacity-60" />
      </div>
    </div>
  );
}

// Search bar separata per Suspense boundary
function ApprofondimentiSearch() {
  return <ApprofondimentiSearchClient />;
}

import ApprofondimentiSearchClient from "./ApprofondimentiSearchClient";
