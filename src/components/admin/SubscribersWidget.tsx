"use client";

import { useState, useTransition } from "react";
import { deleteSubscriber } from "@/app/admin/(dashboard)/actions";

interface Subscriber {
  email: string;
  nome: string;
  createdAt: string;
}

export default function SubscribersWidget({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
  const [expanded, setExpanded] = useState(false);
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleDelete = (email: string) => {
    if (!confirm(`Rimuovere ${email} dalla lista Steadynews?`)) return;
    setDeletingEmail(email);
    startTransition(async () => {
      const res = await deleteSubscriber(email);
      if (!res.error) {
        setSubscribers((prev) => prev.filter((s) => s.email !== email));
      }
      setDeletingEmail(null);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border-l-4 border-teal-400 mb-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <span className="text-sm font-semibold text-gray-800">Ultimi iscritti Steadynews</span>
          <p className="text-xs text-gray-400 mt-0.5">{subscribers.length} iscritti</p>
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
          {subscribers.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-400">Nessun iscritto trovato.</p>
          ) : (
            subscribers.map((s) => (
              <div key={s.email} className="px-5 py-2.5 flex items-center justify-between group">
                <div className="flex items-center gap-3 min-w-0">
                  {s.nome && <span className="text-sm text-gray-700 shrink-0">{s.nome}</span>}
                  <span className="text-sm text-gray-400 truncate">{s.email}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {s.createdAt && (
                    <span className="text-xs text-gray-300">
                      {new Date(s.createdAt).toLocaleDateString("it-IT", {
                        day: "numeric", month: "short", year: "2-digit",
                      })}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(s.email)}
                    disabled={deletingEmail === s.email}
                    title="Rimuovi dalla lista"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 disabled:opacity-30"
                  >
                    {deletingEmail === s.email ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
