"use client";
import { useState, useTransition } from "react";
import { setOpensAt } from "@/app/admin/(dashboard)/eventi/[slug]/actions";

export default function OpeningDateInput({ value, eventSlug }: {
  value: string | null;
  eventSlug: string;
}) {
  const [date, setDate] = useState(value ? value.slice(0, 10) : "");
  const [time, setTime] = useState(value ? value.slice(11, 16) : "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const iso = date && time ? `${date}T${time}` : null;
    startTransition(async () => {
      await setOpensAt(eventSlug, iso);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const handleRemove = () => {
    setDate(""); setTime("");
    startTransition(() => setOpensAt(eventSlug, null));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm px-5 py-4">
      <p className="text-sm font-semibold text-gray-700 mb-0.5">Apertura iscrizioni</p>
      <p className="text-xs text-gray-400 mb-3">Prima di questa data/ora il form non è visibile</p>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={e => { setDate(e.target.value); setSaved(false); }}
          className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-cs-sage text-gray-700"
        />
        <input
          type="time"
          value={time}
          onChange={e => { setTime(e.target.value); setSaved(false); }}
          className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-cs-sage text-gray-700"
          style={{ width: 90 }}
        />
        <button
          onClick={handleSave}
          disabled={isPending || !date || !time}
          className="text-xs px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {saved ? "✓ Salvato" : "Salva"}
        </button>
        {(date || time) && (
          <button onClick={handleRemove} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            Rimuovi
          </button>
        )}
      </div>
    </div>
  );
}
