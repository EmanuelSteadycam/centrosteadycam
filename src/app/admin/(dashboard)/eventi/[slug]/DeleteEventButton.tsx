"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "./actions";

export default function DeleteEventButton({ eventSlug, eventName }: { eventSlug: string; eventName: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const { error } = await deleteEvent(eventSlug);
      if (error) { setError(error); return; }
      router.push("/admin/eventi");
    });
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded transition-colors"
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
        Elimina evento
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2">
        <span className="text-xs text-red-700">
          Operazione irreversibile. Scrivi <strong>{eventName}</strong> per confermare:
        </span>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="text-xs border border-red-300 rounded px-2 py-1 w-40 focus:outline-none focus:border-red-500"
          autoFocus
        />
        <button
          onClick={handleDelete}
          disabled={isPending || typed !== eventName}
          className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Eliminando…" : "Conferma eliminazione"}
        </button>
        <button
          onClick={() => { setConfirming(false); setTyped(""); setError(null); }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Annulla
        </button>
      </div>
      {error && <p className="text-xs text-red-600 max-w-xs text-right">{error}</p>}
    </div>
  );
}
