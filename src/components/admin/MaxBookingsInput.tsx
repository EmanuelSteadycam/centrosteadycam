"use client";
import { useState, useTransition } from "react";
import { setMaxBookings } from "@/app/admin/(dashboard)/eventi/[slug]/actions";

export default function MaxBookingsInput({ value, eventSlug, totalBookings }: {
  value: number | null;
  eventSlug: string;
  totalBookings: number;
}) {
  const [max, setMax] = useState<string>(value !== null ? String(value) : "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const parsed = max === "" ? null : parseInt(max);
  const isValid = max === "" || (parsed !== null && parsed >= 1);
  const autoActive = parsed !== null && totalBookings >= parsed;

  const handleSave = () => {
    if (!isValid) return;
    startTransition(async () => {
      await setMaxBookings(eventSlug, parsed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-700">Max iscrizioni (auto lista d&apos;attesa)</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {parsed !== null
              ? autoActive
                ? <span className="text-orange-500 font-medium">Attiva — {totalBookings}/{parsed} iscrizioni raggiunte</span>
                : <span>{totalBookings}/{parsed} iscrizioni ricevute</span>
              : "Lascia vuoto per disabilitare"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min={1}
            value={max}
            onChange={(e) => { setMax(e.target.value); setSaved(false); }}
            placeholder="—"
            className="w-16 text-center border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-cs-sage text-gray-700"
          />
          <button
            onClick={handleSave}
            disabled={isPending || !isValid}
            className="text-xs px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {saved ? "✓" : "Salva"}
          </button>
        </div>
      </div>
    </div>
  );
}
