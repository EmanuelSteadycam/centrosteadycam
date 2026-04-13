"use client";
import { useState, useTransition } from "react";
import { addSlot, toggleSlot, deleteSlot } from "@/app/admin/(dashboard)/eventi/[slug]/actions";

type Slot = {
  id: string; date: string; time_slot: string;
  time_start: string | null; time_end: string | null;
  max_capacity: number; bookings_count: number; is_open: boolean; notes: string | null;
};

const TIME_OPTIONS = Array.from({ length: 24 }, (_, h) =>
  ["00", "30"].map((m) => `${String(h).padStart(2, "0")}:${m}`)
).flat();

const selectCls = "border border-gray-200 rounded px-2 py-2 text-sm focus:outline-none focus:border-cs-sage text-gray-700";

export default function SlotManager({ slots, eventSlug }: { slots: Slot[]; eventSlug: string }) {
  const [isPending, startTransition] = useTransition();
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("mattina");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");

  const handleAdd = () => {
    if (!newDate) return;
    startTransition(() => { addSlot(eventSlug, newDate, newTimeSlot, timeStart || undefined, timeEnd || undefined); });
    setNewDate("");
    setTimeStart("");
    setTimeEnd("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-700">Slot disponibili</h2>
        <span className="text-xs text-gray-400">{slots.length} date</span>
      </div>

      {/* Aggiungi slot */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-2 items-center">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="flex-1 min-w-[120px] border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-cs-sage"
        />
        <select
          value={newTimeSlot}
          onChange={(e) => setNewTimeSlot(e.target.value)}
          className={selectCls}
        >
          <option value="mattina">Mattina</option>
          <option value="pomeriggio">Pomeriggio</option>
          <option value="sera">Sera</option>
          <option value="intera">Giornata intera</option>
        </select>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">dalle</span>
          <select value={timeStart} onChange={(e) => setTimeStart(e.target.value)} className={selectCls} style={{ width: 80 }}>
            <option value="">--:--</option>
            {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="text-xs text-gray-400">alle</span>
          <select value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} className={selectCls} style={{ width: 80 }}>
            <option value="">--:--</option>
            {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button
          onClick={handleAdd}
          disabled={isPending || !newDate}
          className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          + Aggiungi
        </button>
      </div>

      {/* Lista slot */}
      <div className="divide-y divide-gray-50 max-h-96 overflow-auto">
        {slots.length === 0 && (
          <p className="px-5 py-4 text-sm text-gray-400">Nessuno slot configurato.</p>
        )}
        {slots.map((slot) => (
          <div key={slot.id} className="px-5 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                {new Date(slot.date + "T00:00:00").toLocaleDateString("it-IT", {
                  weekday: "short", day: "numeric", month: "short", year: "numeric"
                })}
                <span className="ml-2 text-xs text-cs-sage capitalize">
                  {slot.time_slot}
                  {slot.time_start && slot.time_end && ` · ${slot.time_start}–${slot.time_end}`}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {slot.bookings_count}/{slot.max_capacity} prenotazioni
              </p>
            </div>

            {/* Toggle aperto/chiuso */}
            <button
              onClick={() => startTransition(() => toggleSlot(slot.id, !slot.is_open, eventSlug))}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                slot.is_open
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {slot.is_open ? "Aperto" : "Chiuso"}
            </button>

            {/* Elimina */}
            <button
              onClick={() => {
                if (confirm("Eliminare questo slot?"))
                  startTransition(() => deleteSlot(slot.id, eventSlug));
              }}
              className="text-gray-300 hover:text-red-500 transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
