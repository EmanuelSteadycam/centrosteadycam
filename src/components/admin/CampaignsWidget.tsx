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

export default function CampaignsWidget({ campaigns }: { campaigns: BrevoStat[] }) {
  const [expanded, setExpanded] = useState(false);

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
                      <span className="text-gray-600 font-medium">{c.sent.toLocaleString("it-IT")} inviati</span>
                      <span>📬 {c.openRate.toFixed(1)}%</span>
                      <span>🖱 {c.clickRate.toFixed(1)}%</span>
                      {c.unsubscribed > 0 && <span className="text-red-400">−{c.unsubscribed} disiscritti</span>}
                      {(c.hardBounces + c.softBounces) > 0 && (
                        <span className="text-orange-400">{c.hardBounces + c.softBounces} bounce</span>
                      )}
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
