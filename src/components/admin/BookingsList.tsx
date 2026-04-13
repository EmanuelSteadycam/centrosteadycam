"use client";
import { useState, useTransition } from "react";
import { approveBooking, rejectBooking, deleteBooking } from "@/app/admin/(dashboard)/eventi/[slug]/actions";

type Booking = {
  id: number; created_at: string; istituto: string; nome: string; cognome: string;
  email: string; cellulare: string | null; classe: string; n_alunni: number;
  n_adulti: number; tipo_visita: string; status: string;
  event_slots: { date: string; time_slot: string; time_start: string | null; time_end: string | null } | null;
};

const IconCheck = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconX = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const StatusDot = ({ status }: { status: string }) => {
  const color =
    status === "confirmed" ? "bg-green-500" :
    status === "cancelled" ? "bg-red-400" :
    "bg-yellow-400";
  const title =
    status === "confirmed" ? "Confermata" :
    status === "cancelled" ? "Annullata" : "In attesa";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} title={title} />;
};

export default function BookingsList({ bookings, eventSlug }: { bookings: Booking[]; eventSlug: string }) {
  const [filter, setFilter] = useState("");
  const [localBookings, setLocalBookings] = useState(bookings);
  const [isPending, startTransition] = useTransition();
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = localBookings.filter((b) =>
    !filter ||
    b.istituto.toLowerCase().includes(filter.toLowerCase()) ||
    b.cognome.toLowerCase().includes(filter.toLowerCase()) ||
    b.email.toLowerCase().includes(filter.toLowerCase())
  );

  const handleApprove = (id: number) => {
    setApprovingId(id);
    startTransition(async () => {
      const result = await approveBooking(id, eventSlug);
      if (!result.error) setLocalBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "confirmed" } : b));
      setApprovingId(null);
    });
  };

  const handleReject = (id: number) => {
    if (!confirm("Rifiutare questa richiesta e inviare la mail di non accettazione?")) return;
    setRejectingId(id);
    startTransition(async () => {
      const result = await rejectBooking(id, eventSlug);
      if (!result.error) setLocalBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" } : b));
      setRejectingId(null);
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Eliminare definitivamente questa prenotazione?")) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteBooking(id, eventSlug);
      if (!result.error) setLocalBookings((prev) => prev.filter((b) => b.id !== id));
      setDeletingId(null);
    });
  };

  const exportCSV = () => {
    const header = "Data,Istituto,Insegnante,Email,Telefono,Classe,Alunni,Adulti,Tipo visita,Stato";
    const rows = localBookings.map((b) => [
      b.event_slots ? b.event_slots.date : "",
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
        <button onClick={exportCSV} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">↓ CSV</button>
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
              <div className="text-right shrink-0 ml-3 flex flex-col items-end gap-2">
                {b.event_slots && (
                  <p className="text-xs text-gray-500">
                    {new Date(b.event_slots.date + "T00:00:00").toLocaleDateString("it-IT", {
                      day: "numeric", month: "short"
                    })}
                    {b.event_slots.time_start && b.event_slots.time_end &&
                      ` · ${b.event_slots.time_start}–${b.event_slots.time_end}`}
                  </p>
                )}
                <StatusDot status={b.status} />
                <div className="flex gap-1.5 items-center">
                  {b.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(b.id)}
                        disabled={isPending && approvingId === b.id}
                        title="Approva"
                        className="w-7 h-7 flex items-center justify-center rounded border border-green-400 text-green-600 hover:border-green-600 hover:text-green-800 disabled:opacity-40 transition-colors"
                      >
                        {isPending && approvingId === b.id ? <span className="text-xs">…</span> : <IconCheck />}
                      </button>
                      <button
                        onClick={() => handleReject(b.id)}
                        disabled={isPending && rejectingId === b.id}
                        title="Rifiuta"
                        className="w-7 h-7 flex items-center justify-center rounded border border-red-300 text-red-400 hover:border-red-500 hover:text-red-600 disabled:opacity-40 transition-colors"
                      >
                        {isPending && rejectingId === b.id ? <span className="text-xs">…</span> : <IconX />}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(b.id)}
                    disabled={isPending && deletingId === b.id}
                    title="Elimina"
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600 disabled:opacity-40 transition-colors"
                  >
                    {isPending && deletingId === b.id ? <span className="text-xs">…</span> : <IconTrash />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
