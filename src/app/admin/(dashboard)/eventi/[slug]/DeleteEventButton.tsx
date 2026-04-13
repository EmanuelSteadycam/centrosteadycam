"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "./actions";

export default function DeleteEventButton({ eventSlug }: { eventSlug: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("Eliminare questo evento e tutti i suoi slot e iscrizioni? L'operazione è irreversibile.")) return;
    startTransition(async () => {
      const { error } = await deleteEvent(eventSlug);
      if (error) { alert(error); return; }
      router.push("/admin/eventi");
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded transition-colors disabled:opacity-40"
    >
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
      </svg>
      {isPending ? "Eliminando…" : "Elimina evento"}
    </button>
  );
}
