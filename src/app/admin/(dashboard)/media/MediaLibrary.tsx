"use client";
import { useMemo, useState } from "react";
import type { MediaFile } from "./page";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
}

// Percorso leggibile senza il prefisso "media/" e senza il timestamp iniziale
// (i file caricati dagli allegati hanno nomi tipo "1758543210123-documento.pdf")
function displayName(pathname: string) {
  const rel = pathname.replace(/^media\//, "");
  const file = rel.split("/").pop() || rel;
  return file.replace(/^\d{10,}-/, "");
}

function folderOf(pathname: string) {
  const rel = pathname.replace(/^media\//, "");
  const parts = rel.split("/");
  parts.pop();
  return parts.length ? parts.join("/") : "(root)";
}

type Tab = "immagini" | "documenti" | "video";

export default function MediaLibrary({
  images,
  documents,
  videos,
}: {
  images: MediaFile[];
  documents: MediaFile[];
  videos: MediaFile[];
}) {
  const [tab, setTab] = useState<Tab>("immagini");
  const [query, setQuery] = useState("");

  const current = tab === "immagini" ? images : tab === "video" ? videos : documents;

  const filtered = useMemo(() => {
    if (!query.trim()) return current;
    const q = query.toLowerCase();
    return current.filter((f) => f.pathname.toLowerCase().includes(q));
  }, [current, query]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "immagini", label: "Immagini", count: images.length },
    { id: "documenti", label: "Documenti", count: documents.length },
    { id: "video", label: "Video", count: videos.length },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                tab === t.id ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:text-gray-800 border border-gray-200"
              }`}
            >
              {t.label} <span className="opacity-60">({t.count})</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nome..."
          className="border border-gray-200 rounded px-3 py-1.5 text-xs w-56 focus:outline-none focus:border-gray-400"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">Nessun file trovato.</p>
        )}

        {tab === "immagini" && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {filtered.map((f) => (
              <a
                key={f.pathname}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors"
              >
                <div className="aspect-square bg-gray-50">
                  <img src={f.url} alt={displayName(f.pathname)} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="px-2 py-1.5">
                  <p className="text-[11px] text-gray-700 truncate" title={f.pathname}>{displayName(f.pathname)}</p>
                  <p className="text-[10px] text-gray-400">{formatSize(f.size)}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {tab === "video" && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((f) => (
              <div key={f.pathname} className="rounded overflow-hidden border border-gray-100">
                <video src={f.url} controls preload="metadata" className="w-full aspect-video bg-black" />
                <div className="px-2 py-1.5">
                  <p className="text-[11px] text-gray-700 truncate" title={f.pathname}>{displayName(f.pathname)}</p>
                  <p className="text-[10px] text-gray-400">{formatSize(f.size)} · {formatDate(f.uploadedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "documenti" && filtered.length > 0 && (
          <div className="divide-y divide-gray-50">
            {filtered.map((f) => (
              <a
                key={f.pathname}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-2.5 hover:bg-gray-50 transition-colors px-1 -mx-1 rounded"
              >
                <span className="text-xl shrink-0">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{displayName(f.pathname)}</p>
                  <p className="text-xs text-gray-400">{folderOf(f.pathname)}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatSize(f.size)}</span>
                <span className="text-xs text-gray-400 shrink-0 w-20 text-right">{formatDate(f.uploadedAt)}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
