"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Item = Record<string, any>;

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ApprofondimentiModal({
  itemId,
  onClose,
}: {
  itemId: number;
  onClose: () => void;
}) {
  const [item, setItem]       = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setImgError(false);
    fetch(`/api/approfondimenti/${itemId}`)
      .then(r => r.json())
      .then(data => { setItem(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [itemId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

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
        {/* Header sticky */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-end px-6 py-4 border-b border-black/8">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/8 transition-colors text-black/60 hover:text-black text-3xl leading-none"
          >
            ×
          </button>
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
              Articolo non trovato.
            </span>
          </div>
        ) : (
          <div className="px-6 py-6">

            {/* Header articolo */}
            <div className="flex items-start gap-4 mb-6">
              <div className="shrink-0 w-[120px] h-[120px] rounded-lg overflow-hidden bg-black/5">
                <Image
                  src={item.image_url && !imgError ? item.image_url : "/archivio-placeholder.jpg"}
                  alt={item.titolo || ""}
                  width={120} height={120}
                  className="w-full h-full object-cover"
                  unoptimized
                  onError={() => setImgError(true)}
                />
              </div>
              <div className="flex-1">
                <h2 className="font-title font-semibold text-[#7068a8] leading-snug text-lg mb-1">
                  {item.titolo}
                </h2>
                {item.data && (
                  <p className="text-black/40 text-sm" style={{ fontFamily: "var(--font-raleway)" }}>
                    {formatDate(item.data)}
                  </p>
                )}
              </div>
            </div>

            {/* Contenuto */}
            {item.contenuto_html && (
              <div
                className="prose prose-sm max-w-none text-[#1e1e1e]/80 leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-raleway)", fontSize: "14px" }}
                dangerouslySetInnerHTML={{ __html: item.contenuto_html }}
              />
            )}

            {/* Link esterni */}
            {item.links && item.links.length > 0 && (
              <div className="bg-[#f0edf8] rounded-xl px-5 py-4">
                <p className="text-[10px] font-title font-bold uppercase tracking-wider text-[#7068a8]/60 mb-3">
                  Per saperne di più
                </p>
                <div className="flex flex-col gap-2">
                  {item.links.map((l: { label: string; url: string }, i: number) => (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#7068a8] hover:underline"
                      style={{ fontFamily: "var(--font-raleway)" }}
                    >
                      {l.label} →
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
