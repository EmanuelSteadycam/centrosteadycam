"use client";
import Image from "next/image";
import { useState } from "react";
import type { SlideId } from "../DisplaySlider";

const WP_UPLOADS = "https://centrosteadycam.it/wp-content/uploads";

interface Props {
  onNavigate: (id: SlideId) => void;
}

type FormData = {
  tipoScuola: string;
  tipoVisita: string;
  nAlunni: string;
  nAdulti: string;
  disabilita: string;
  istituto: string;
  ordineScuola: string;
  nome: string;
  cognome: string;
  classe: string;
  email: string;
  cellulare: string;
};

export default function BookingSlide({ onNavigate }: Props) {
  const [form, setForm] = useState<FormData>({
    tipoScuola: "",
    tipoVisita: "",
    nAlunni: "",
    nAdulti: "",
    disabilita: "no",
    istituto: "",
    ordineScuola: "",
    nome: "",
    cognome: "",
    classe: "",
    email: "",
    cellulare: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: integrate with Supabase or email service
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="relative w-full h-full flex overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={`${WP_UPLOADS}/2017/07/Logo_Display4-03.jpg`}
          alt="Display booking background"
          fill
          className="object-cover opacity-30"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
        {submitted ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-white text-2xl font-light tracking-widest uppercase mb-3">
              Richiesta inviata
            </h2>
            <p className="text-white/60 text-sm mb-8">Grazie! Vi contatteremo presto.</p>
            <button
              onClick={() => onNavigate("intro")}
              className="px-8 py-3 border border-white/40 text-white/70 text-xs tracking-[0.2em] uppercase hover:border-white hover:text-white transition-all"
            >
              Home
            </button>
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <p className="text-white/40 text-xs tracking-[0.4em] uppercase mb-2">Display</p>
              <h2 className="text-white text-3xl font-thin tracking-[0.2em] uppercase">Prenota la visita</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs tracking-wider uppercase block mb-1">
                    Tipo scuola
                  </label>
                  <select
                    value={form.tipoScuola}
                    onChange={(e) => setForm({ ...form, tipoScuola: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-white/50"
                    required
                  >
                    <option value="">Seleziona</option>
                    <option value="primaria">Scuola Primaria</option>
                    <option value="secondaria-1">Secondaria di 1° grado</option>
                    <option value="secondaria-2">Secondaria di 2° grado</option>
                    <option value="centro-estivo">Centro Estivo</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/50 text-xs tracking-wider uppercase block mb-1">
                    Tipo visita
                  </label>
                  <select
                    value={form.tipoVisita}
                    onChange={(e) => setForm({ ...form, tipoVisita: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-white/50"
                    required
                  >
                    <option value="">Seleziona</option>
                    <option value="mattina">Solo mattina (h.8–13)</option>
                    <option value="intera">Giornata intera (h.8.30–16.30)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-white/50 text-xs tracking-wider uppercase block mb-1">N° alunni</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={form.nAlunni}
                    onChange={(e) => setForm({ ...form, nAlunni: e.target.value })}
                    placeholder="1–30"
                    className="w-full bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-white/50 placeholder:text-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs tracking-wider uppercase block mb-1">N° adulti</label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={form.nAdulti}
                    onChange={(e) => setForm({ ...form, nAdulti: e.target.value })}
                    placeholder="1–4"
                    className="w-full bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-white/50 placeholder:text-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs tracking-wider uppercase block mb-1">Disabilità motorie</label>
                  <select
                    value={form.disabilita}
                    onChange={(e) => setForm({ ...form, disabilita: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-white/50"
                  >
                    <option value="no">No</option>
                    <option value="si">Sì</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs tracking-wider uppercase block mb-1">Istituto comprensivo</label>
                  <input
                    type="text"
                    value={form.istituto}
                    onChange={(e) => setForm({ ...form, istituto: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-white/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs tracking-wider uppercase block mb-1">Ordine scuola</label>
                  <input
                    type="text"
                    value={form.ordineScuola}
                    onChange={(e) => setForm({ ...form, ordineScuola: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-white/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-white/50 text-xs tracking-wider uppercase block mb-1">Nome</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-white/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs tracking-wider uppercase block mb-1">Cognome</label>
                  <input
                    type="text"
                    value={form.cognome}
                    onChange={(e) => setForm({ ...form, cognome: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-white/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs tracking-wider uppercase block mb-1">Classe</label>
                  <input
                    type="text"
                    value={form.classe}
                    onChange={(e) => setForm({ ...form, classe: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-white/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs tracking-wider uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-white/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs tracking-wider uppercase block mb-1">Cellulare</label>
                  <input
                    type="tel"
                    value={form.cellulare}
                    onChange={(e) => setForm({ ...form, cellulare: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-white/50"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-white text-black text-xs font-semibold tracking-[0.2em] uppercase
                             hover:bg-white/90 disabled:opacity-50 transition-all"
                >
                  {loading ? "Invio in corso..." : "Invia richiesta"}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("intro")}
                  className="px-6 py-3 border border-white/30 text-white/60 text-xs tracking-[0.2em] uppercase hover:border-white/50 hover:text-white/80 transition-all"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
