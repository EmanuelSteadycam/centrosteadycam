"use client";
import { useState, useTransition } from "react";
import { approveBooking, rejectBooking } from "@/app/admin/(dashboard)/prenotazioni/actions";

type Booking = {
  id: number; created_at: string; istituto: string; nome: string; cognome: string;
  email: string; cellulare: string | null; classe: string; n_alunni: number;
  n_adulti: number; tipo_visita: string; status: string;
  display_slots: { date: string; time_slot: string } | null;
};

export default function BookingsList({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState("");
  const [localBookings, setLocalBookings] = useState(bookings);
  const [isPending, startTransition] = useTransition();
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const filtered = localBookings.filter((b) =>
    !filter ||
    b.istituto.toLowerCase().includes(filter.toLowerCase()) ||
    b.cognome.toLowerCase().includes(filter.toLowerCase()) ||
    b.email.toLowerCase().includes(filter.toLowerCase())
  );

  const handleApprove = (id: number) => {
    setApprovingId(id);
    startTransition(async () => {
      const result = await approveBooking(id);
      if (!result.error) {
        setLocalBookings((prev) =>
          prev.map((b) => b.id === id ? { ...b, status: "confirmed" } : b)
        );
      }
      setApprovingId(null);
    });
  };

  const handleReject = (id: number) => {
    if (!confirm("Rifiutare questa richiesta e inviare la mail di non accettazione?")) return;
    setRejectingId(id);
    startTransition(async () => {
      const result = await rejectBooking(id);
      if (!result.error) {
        setLocalBookings((prev) =>
          prev.map((b) => b.id === id ? { ...b, status: "cancelled" } : b)
        );
      }
      setRejectingId(null);
    });
  };

  const exportCSV = () => {
    const header = "Data,Istituto,Insegnante,Email,Telefono,Classe,Alunni,Adulti,Tipo visita,Stato";
    const rows = localBookings.map((b) => [
      b.display_slots ? b.display_slots.date : "",
      b.istituto, `${b.nome} ${b.cognome}`, b.email,
      b.cellulare ?? "", b.classe, b.n_alunni, b.n_adulti, b.tipo_visita, b.status,
    ].map((v) => `"${v}"`).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "prenotazioni.csv"; a.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-700">Iscrizioni</h2>
        <button
          onClick={exportCSV}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          ↓ CSV
        </button>
      </div>

      <div className="px-5 py-3 border-b border-gray-100">
        <input
          type="text"
          placeholder="Cerca per istituto, cognome, email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-gray-400"
        />
      </div>

      <div className="divide-y divide-gray-50 max-h-[480px] overflow-auto">
        {filtered.length === 0 && (
          <p className="px-5 py-4 text-sm text-gray-400">Nessuna iscrizione trovata.</p>
        )}
        {filtered.map((b) => (
          <div key={b.id} className="px-5 py-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-700">{b.istituto}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {b.nome} {b.cognome} · {b.email}
                  {b.cellulare && ` · ${b.cellulare}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Cl. {b.classe} · {b.n_alunni} alunni · {b.n_adulti} adulti
                </p>
              </div>
              <div className="text-right shrink-0 ml-3 flex flex-col items-end gap-1.5">
                {b.display_slots && (
                  <p className="text-xs text-gray-500">
                    {new Date(b.display_slots.date + "T00:00:00").toLocaleDateString("it-IT", {
                      day: "numeric", month: "short"
                    })}
                  </p>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  b.status === "confirmed" ? "bg-green-100 text-green-700" :
                  b.status === "cancelled" ? "bg-red-100 text-red-500" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {b.status === "confirmed" ? "Confermata" :
                   b.status === "cancelled" ? "Annullata" : "In attesa"}
                </span>
                {b.status === "pending" && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleApprove(b.id)}
                      disabled={isPending && approvingId === b.id}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      {isPending && approvingId === b.id ? "..." : "✓ Approva"}
                    </button>
                    <button
                      onClick={() => handleReject(b.id)}
                      disabled={isPending && rejectingId === b.id}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {isPending && rejectingId === b.id ? "..." : "✕ Rifiuta"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
