"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "./[slug]/actions";

export default function CreateEventForm() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = () => {
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createEvent(name.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setName("");
        if (result.slug) router.push(`/admin/eventi/${result.slug}`);
      }
    });
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        placeholder="Nome evento (es. Corso Montaggio 2026)"
        className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
      />
      <button
        onClick={handleCreate}
        disabled={isPending || !name.trim()}
        className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-40 transition-colors whitespace-nowrap"
      >
        {isPending ? "Creando..." : "+ Crea evento"}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
