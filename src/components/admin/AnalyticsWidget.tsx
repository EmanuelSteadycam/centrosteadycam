"use client";

import { useState } from "react";
import type { VercelAnalyticsSummary } from "@/lib/vercel-analytics";

export default function AnalyticsWidget({
  data,
  error,
  days,
}: {
  data: VercelAnalyticsSummary | null;
  error?: string;
  days: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const notEnabled = error?.includes("not enabled");

  return (
    <div className="bg-white rounded-lg shadow-sm border-l-4 border-sky-400 mb-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <span className="text-sm font-semibold text-gray-800">Analytics sito</span>
          <p className="text-xs text-gray-400 mt-0.5">
            {data
              ? `Ultimi ${days} giorni — ${data.totalViews.toLocaleString("it-IT")} visualizzazioni`
              : "Vercel Web Analytics"}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          {notEnabled ? (
            <div className="px-5 py-5 text-sm text-gray-500 space-y-2">
              <p className="font-medium text-gray-700">Web Analytics non ancora attivato</p>
              <p className="text-xs text-gray-400">
                Vai su <strong>Vercel Dashboard → centrosteadycam → Settings → Analytics</strong> e clicca <strong>Enable</strong>.
                I dati appariranno qui dopo la prima visita al sito.
              </p>
            </div>
          ) : error ? (
            <p className="px-5 py-4 text-sm text-red-400">{error}</p>
          ) : !data ? (
            <p className="px-5 py-4 text-sm text-gray-400">Caricamento...</p>
          ) : (
            <div>
              {/* Totali */}
              <div className="px-5 py-4 grid grid-cols-2 gap-4 border-b border-gray-50">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{data.totalViews.toLocaleString("it-IT")}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">Visualizzazioni</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{data.totalVisitors.toLocaleString("it-IT")}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">Visitatori unici</p>
                </div>
              </div>

              {/* Grafico giornaliero */}
              {data.byDay.length > 0 && (
                <div className="px-5 py-4 border-b border-gray-50">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Visite per giorno</p>
                  <MiniBarChart rows={data.byDay} />
                </div>
              )}

              {/* Top pages */}
              {data.topPages.length > 0 && (
                <div className="px-5 py-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Pagine più visitate</p>
                  <div className="space-y-2">
                    {data.topPages.map((p) => (
                      <TopPageRow key={p.route} route={p.route} views={p.views} max={data.topPages[0].views} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniBarChart({ rows }: { rows: { timestamp: string; views: number }[] }) {
  const max = Math.max(...rows.map((r) => r.views), 1);
  return (
    <div className="flex items-end gap-0.5 h-12">
      {rows.map((r) => {
        const h = Math.max((r.views / max) * 100, 4);
        const label = r.timestamp ? new Date(r.timestamp).toLocaleDateString("it-IT", { day: "numeric", month: "short" }) : "";
        return (
          <div key={r.timestamp} className="flex-1 flex flex-col items-center group relative" title={`${label}: ${r.views}`}>
            <div
              className="w-full bg-sky-200 group-hover:bg-sky-400 rounded-sm transition-colors"
              style={{ height: `${h}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function TopPageRow({ route, views, max }: { route: string; views: number; max: number }) {
  const pct = max > 0 ? (views / max) * 100 : 0;
  const label = route === "/" ? "Homepage" : route;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="relative h-5 rounded overflow-hidden bg-gray-50">
          <div className="absolute inset-y-0 left-0 bg-sky-100 rounded" style={{ width: `${pct}%` }} />
          <span className="absolute inset-0 flex items-center px-2 text-xs text-gray-700 truncate">{label}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 shrink-0 w-16 text-right">{views.toLocaleString("it-IT")}</span>
    </div>
  );
}
