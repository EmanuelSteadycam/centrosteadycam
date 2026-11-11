"use client";
import { useRef, useState } from "react";
import { COMMENT_MAX_LENGTH, COMMENT_NAME_MAX_LENGTH, type PublicComment } from "@/lib/podcast";

const PINK = "#FF3EA5";

function formatCommentDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" });
}

export default function EpisodeComments({ episodeId, comments }: { episodeId: string; comments: PublicComment[] }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [testo, setTesto] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef<number>(0);

  const toggle = () => {
    if (!open && !startedAt.current) startedAt.current = Date.now();
    setOpen((o) => !o);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/podcast/commenti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId, nome, email, testo, website, t: startedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Errore nell'invio, riprova");
      } else {
        setSent(true);
        setNome("");
        setEmail("");
        setTesto("");
      }
    } catch {
      setError("Errore di connessione, riprova");
    } finally {
      setSending(false);
    }
  };

  const label = comments.length === 0 ? "Lascia un commento" : `Commenti (${comments.length})`;
  const input = "w-full font-title text-sm text-white bg-white/5 border border-white/20 rounded-lg px-3 py-2 placeholder:text-white/40 focus:outline-none focus:border-white/60";

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="font-title text-xs font-semibold uppercase tracking-widest inline-flex items-center gap-2 hover:opacity-80"
        style={{ color: PINK }}
      >
        {label}
        <span aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="mt-5 space-y-6">
          {comments.length > 0 && (
            <ul className="space-y-5">
              {comments.map((c) => (
                <li key={c.id}>
                  <p className="font-title text-xs uppercase tracking-widest text-white/60 mb-1">
                    <span className="font-semibold text-white">{c.nome}</span> · {formatCommentDate(c.created_at)}
                  </p>
                  <p className="font-title text-sm font-light leading-relaxed text-white/90 whitespace-pre-line break-words">{c.testo}</p>
                  {c.reply && (
                    <div className="mt-3 ml-4 pl-4 border-l-2" style={{ borderColor: PINK }}>
                      <p className="font-title text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: PINK }}>
                        Centro Steadycam
                      </p>
                      <p className="font-title text-sm font-light leading-relaxed text-white/90 whitespace-pre-line break-words">{c.reply}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {sent ? (
            <div className="rounded-lg border border-white/20 px-4 py-3">
              <p className="font-title text-sm text-white">Grazie! Il tuo commento sarà visibile dopo l&apos;approvazione.</p>
              <button type="button" onClick={() => { setSent(false); startedAt.current = Date.now(); }} className="font-title text-xs underline text-white/60 mt-2 hover:text-white">
                Scrivi un altro commento
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  maxLength={COMMENT_NAME_MAX_LENGTH}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome *"
                  aria-label="Nome"
                  className={input}
                />
                <input
                  type="email"
                  maxLength={200}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (facoltativa, non sarà pubblicata)"
                  aria-label="Email (facoltativa)"
                  className={input}
                />
              </div>
              {/* Campo trappola per i bot: invisibile e fuori dal tab order */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                aria-hidden
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <textarea
                required
                rows={4}
                maxLength={COMMENT_MAX_LENGTH}
                value={testo}
                onChange={(e) => setTesto(e.target.value)}
                placeholder="Il tuo commento *"
                aria-label="Commento"
                className={`${input} resize-y`}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-title text-[11px] text-white/50 max-w-md">
                  I commenti vengono pubblicati dopo l&apos;approvazione della redazione. Dati trattati secondo la{" "}
                  <a href="/privacy" className="underline hover:text-white">privacy policy</a>.
                </p>
                <button
                  type="submit"
                  disabled={sending}
                  className="font-title font-semibold rounded-lg uppercase tracking-widest text-xs px-5 py-2.5 transition-transform hover:-rotate-2 disabled:opacity-50"
                  style={{ background: PINK, color: "#fff" }}
                >
                  {sending ? "Invio…" : "Invia"}
                </button>
              </div>
              {error && <p className="font-title text-sm text-red-300">{error}</p>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
