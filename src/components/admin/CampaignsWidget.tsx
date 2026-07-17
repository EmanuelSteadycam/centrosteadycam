"use client";

import { useState } from "react";
import type { BrevoStat } from "@/lib/brevo";

const STATUS_LABEL: Record<string, string> = {
  sent: "inviata",
  in_review: "in revisione",
  draft: "bozza",
  queued: "in coda",
};

const STATUS_CLASS: Record<string, string> = {
  sent: "bg-green-100 text-green-700",
  in_review: "bg-amber-100 text-amber-700",
  draft: "bg-gray-100 text-gray-500",
  queued: "bg-blue-100 text-blue-700",
};

function fmt(n: number) {
  return n.toLocaleString("it-IT");
}

function ExplanationPopup({ c, onClose }: { c: BrevoStat; onClose: () => void }) {
  const bounces = c.hardBounces + c.softBounces;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full right-0 mb-2 z-50 w-80 max-w-[90vw] bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-sm text-gray-700 leading-relaxed">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-800">Cosa significano questi numeri?</span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
            aria-label="Chiudi"
          >
            ×
          </button>
        </div>

        <p className="mb-2">
          Immagina di aver scritto <strong>{fmt(c.sent)} lettere</strong> e di averle spedite a tutti i tuoi amici. 📮
        </p>

        {bounces > 0 && (
          <p className="mb-2">
            <strong>{fmt(bounces)}</strong> sono tornate indietro perché l&apos;indirizzo non c&apos;era più (bounce) — quindi solo{" "}
            <strong>{fmt(c.delivered)} persone</strong> hanno davvero ricevuto la lettera nella cassetta. ❌
          </p>
        )}

        <p className="mb-2">
          Di queste, <strong>{fmt(c.uniqueViews)} persone</strong> ({c.openRate.toFixed(1)}%, circa 1 su{" "}
          {Math.max(1, Math.round(100 / Math.max(c.openRate, 1)))}) hanno aperto la busta e forse l&apos;hanno letta. Le altre l&apos;hanno lasciata chiusa sul tavolo. 👀
        </p>

        <p className="mb-2">
          Dentro c&apos;era scritto &quot;clicca qui per saperne di più&quot;: solo{" "}
          <strong>{fmt(c.uniqueClicks)} persone</strong> ({c.clickRate.toFixed(1)}%) hanno davvero cliccato per approfondire. 👆
        </p>

        {c.unsubscribed > 0 ? (
          <p>
            <strong>{fmt(c.unsubscribed)} persone</strong> hanno detto &quot;basta, non mandatemi più niente&quot; e si sono cancellate. 🚪
            {c.sent > 0 && c.unsubscribed / c.sent < 0.01 && " Su tutti gli invii è pochissimo — quasi nessuno si è infastidito."}
          </p>
        ) : (
          <p>Nessuno si è disiscritto dopo questa mail — segno che è stata gradita. 🚪</p>
        )}
      </div>
    </>
  );
}

export default function CampaignsWidget({ campaigns }: { campaigns: BrevoStat[] }) {
  const [expanded, setExpanded] = useState(false);
  const [helpOpenId, setHelpOpenId] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-sm border-l-4 border-indigo-400 mb-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <span className="text-sm font-semibold text-gray-800">Campagne Newsletter</span>
          <p className="text-xs text-gray-400 mt-0.5">Ultimi invii Brevo — aggiornati in tempo reale</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {campaigns.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-400">Nessuna campagna trovata.</p>
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-700 font-medium truncate max-w-[60%]">{c.subject}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_CLASS[c.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  {c.sentDate && (
                    <span>{new Date(c.sentDate).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "2-digit" })}</span>
                  )}
                  {c.sent > 0 && (
                    <>
                      <span className="text-gray-600 font-medium">{fmt(c.sent)} inviati</span>
                      <span title="Percentuale di persone uniche che hanno aperto la mail (non eventi totali)">
                        {c.openRate.toFixed(1)}% aperture uniche
                      </span>
                      <span title="Percentuale di persone uniche che hanno cliccato un link (non eventi totali)">
                        {c.clickRate.toFixed(1)}% clic unici
                      </span>
                      {c.unsubscribed > 0 && <span className="text-red-400">−{c.unsubscribed} disiscritti</span>}
                      {(c.hardBounces + c.softBounces) > 0 && (
                        <span className="text-orange-400">{c.hardBounces + c.softBounces} bounce</span>
                      )}
                      <span className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => setHelpOpenId(helpOpenId === c.id ? null : c.id)}
                          className="w-4 h-4 rounded-full border border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 flex items-center justify-center text-[10px] font-bold leading-none"
                          aria-label="Spiegazione numeri"
                        >
                          ?
                        </button>
                        {helpOpenId === c.id && (
                          <ExplanationPopup c={c} onClose={() => setHelpOpenId(null)} />
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
