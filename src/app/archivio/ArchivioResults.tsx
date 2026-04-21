"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import ArchivioModal from "./ArchivioModal";

type Item = {
  id: number;
  titolo: string | null;
  natura: string | null;
  rete: string | null;
  anno: number | null;
  data_trasmissione: string | null;
  abstract: string | null;
  tags: string | null;
  codice_programma: string | null;
  is_fondamentale: boolean;
  image_url: string | null;
  target: string | null;
  programma_riferimento: string | null;
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function ItemCard({ item, onOpen }: { item: Item; onOpen: (id: number) => void }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="py-5 group cursor-pointer" onClick={() => onOpen(item.id)}>
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-[90px] h-[90px] rounded overflow-hidden bg-black/5 flex items-center justify-center">
          <Image
            src={item.image_url && !imgError ? item.image_url : "/archivio-placeholder.jpg"}
            alt={item.titolo || ""}
            width={90} height={90}
            className="w-full h-full object-cover"
            unoptimized
            onError={() => setImgError(true)}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {item.is_fondamentale && (
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#b8b0d0] mt-[5px]" />
            )}
            <p className="font-title font-semibold text-[#7068a8] leading-snug mb-1 group-hover:text-[#5b4d8a] transition-colors" style={{ fontSize: "15px" }}>
              {item.titolo || <span className="italic text-[#1e1e1e]/40">Senza titolo</span>}
            </p>
          </div>
          <p className="text-[#1e1e1e]/40 mb-2" style={{ fontFamily: "var(--font-raleway)", fontSize: "12px" }}>
            {item.codice_programma && <strong className="font-semibold text-[#1e1e1e]/60">{item.codice_programma} · </strong>}
            {[item.natura, item.programma_riferimento, item.rete, formatDate(item.data_trasmissione) || item.anno].filter(Boolean).join(" · ")}
          </p>
          {item.abstract && (
            <p className="font-light text-[#1e1e1e]/60 leading-[1.65] line-clamp-3"
              style={{ fontFamily: "var(--font-raleway)", fontSize: "13px" }}>
              {item.abstract}
            </p>
          )}
          {item.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.split(",").slice(0, 6).map((t: string) => (
                <span key={t} className="text-[10px] font-title uppercase tracking-wider text-[#7068a8]/50 border border-[#7068a8]/20 px-2 py-0.5 rounded-full hover:bg-[#7068a8]/12 hover:border-[#7068a8]/40 hover:text-[#7068a8] transition-colors cursor-default">
                  {t.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ArchivioResults({
  initialItems,
  initialTotal,
  initialHasMore,
}: {
  initialItems: Item[];
  initialTotal: number;
  initialHasMore: boolean;
}) {
  const sp = useSearchParams();
  const [items, setItems]       = useState<Item[]>(initialItems);
  const [total, setTotal]       = useState(initialTotal);
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(initialHasMore);
  const [loading, setLoading]   = useState(false);
  const [modalId, setModalId]   = useState<number | null>(null);
  const sentinelRef             = useRef<HTMLDivElement>(null);
  const currentParams           = useRef(sp.toString());

  // Reset quando cambiano i filtri
  useEffect(() => {
    if (sp.toString() === currentParams.current) return;
    currentParams.current = sp.toString();
    setItems(initialItems);
    setTotal(initialTotal);
    setHasMore(initialHasMore);
    setPage(1);
  }, [sp, initialItems, initialTotal, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(nextPage));
    try {
      const res  = await fetch(`/api/archivio?${params.toString()}`);
      const data = await res.json();
      setItems(prev => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, sp]);

  // IntersectionObserver sul sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (items.length === 0) return null;

  return (
    <>
      <div>
        <div className="divide-y divide-[#7068a8]/10">
          {items.map(item => (
            <ItemCard key={item.id} item={item} onOpen={setModalId} />
          ))}
        </div>

        {/* Sentinel per lazy loading */}
        <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-4">
          {loading && (
            <span className="text-xs text-[#1e1e1e]/30" style={{ fontFamily: "var(--font-raleway)" }}>
              Caricamento…
            </span>
          )}
        </div>

        {!hasMore && items.length > 0 && (
          <p className="text-xs text-[#1e1e1e]/20 text-center mt-2 pb-6" style={{ fontFamily: "var(--font-raleway)" }}>
            {total.toLocaleString("it-IT")} risultati totali
          </p>
        )}
      </div>

      {modalId !== null && (
        <ArchivioModal itemId={modalId} onClose={() => setModalId(null)} />
      )}
    </>
  );
}
