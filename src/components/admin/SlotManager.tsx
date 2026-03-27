"use client";
import { useState, useTransition } from "react";
import { addSlot, toggleSlot, deleteSlot } from "@/app/admin/(dashboard)/prenotazioni/actions";

type Slot = {
  id: string; date: string; time_slot: string;
  max_capacity: number; bookings_count: number; is_open: boolean; notes: string | null;
};

export default function SlotManager({ slots }: { slots: Slot[] }) {
  const [isPending, startTransition] = useTransition();
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("mattina");

  const handleAdd = () => {
    if (!newDate) return;
    startTransition(() => { addSlot(newDate, newTimeSlot); });
    setNewDate("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-700">Slot disponibili</h2>
        <span className="text-xs text-gray-400">{slots.length} date</span>
      </div>

      {/* Aggiungi slot */}
      <div className="px-5 py-4 border-b border-gray-100 flex gap-2">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
        />
        <select
          value={newTimeSlot}
          onChange={(e) => setNewTimeSlot(e.target.value)}
          className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
        >
          <option value="mattina">Mattina</option>
          <option value="intera">Giornata intera</option>
        </select>
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
                <span className="ml-2 text-xs text-gray-400 capitalize">{slot.time_slot}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {slot.bookings_count}/{slot.max_capacity} prenotazioni
              </p>
            </div>

            {/* Toggle aperto/chiuso */}
            <button
              onClick={() => startTransition(() => toggleSlot(slot.id, !slot.is_open))}
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
                  startTransition(() => deleteSlot(slot.id));
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
