"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import ApprofondimentiModal from "./ApprofondimentiModal";

type Item = {
  id: number;
  titolo: string;
  data: string | null;
  estratto: string | null;
  image_url: string | null;
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
        <div className="shrink-0 w-[80px] h-[80px] rounded overflow-hidden bg-black/5">
          <Image
            src={item.image_url && !imgError ? item.image_url : "/archivio-placeholder.jpg"}
            alt={item.titolo || ""}
            width={80} height={80}
            className="w-full h-full object-cover"
            unoptimized
            onError={() => setImgError(true)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-title font-semibold text-[#7068a8] leading-snug mb-1 group-hover:text-[#5b4d8a] transition-colors" style={{ fontSize: "15px" }}>
            {item.titolo}
          </p>
          {item.data && (
            <p className="text-[#1e1e1e]/40 mb-1.5" style={{ fontFamily: "var(--font-raleway)", fontSize: "12px" }}>
              {formatDate(item.data)}
            </p>
          )}
          {item.estratto && (
            <p className="font-light text-[#1e1e1e]/60 leading-[1.65] line-clamp-2"
              style={{ fontFamily: "var(--font-raleway)", fontSize: "13px" }}>
              {item.estratto}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ApprofondimentiResults({
  initialItems,
  initialTotal,
  initialHasMore,
}: {
  initialItems: Item[];
  initialTotal: number;
  initialHasMore: boolean;
}) {
  const sp            = useSearchParams();
  const [items, setItems]     = useState<Item[]>(initialItems);
  const [total, setTotal]     = useState(initialTotal);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [modalId, setModalId] = useState<number | null>(null);
  const sentinelRef           = useRef<HTMLDivElement>(null);
  const currentParams         = useRef(sp.toString());

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
      const res  = await fetch(`/api/approfondimenti?${params.toString()}`);
      const data = await res.json();
      setItems(prev => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, sp]);

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
      <div className="divide-y divide-[#7068a8]/10">
        {items.map(item => (
          <ItemCard key={item.id} item={item} onOpen={setModalId} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-4">
        {loading && (
          <span className="text-xs text-[#1e1e1e]/30" style={{ fontFamily: "var(--font-raleway)" }}>
            Caricamento…
          </span>
        )}
      </div>

      {!hasMore && items.length > 0 && (
        <p className="text-xs text-[#1e1e1e]/20 text-center mt-2 pb-6" style={{ fontFamily: "var(--font-raleway)" }}>
          {total.toLocaleString("it-IT")} articoli totali
        </p>
      )}

      {modalId !== null && (
        <ApprofondimentiModal itemId={modalId} onClose={() => setModalId(null)} />
      )}
    </>
  );
}
