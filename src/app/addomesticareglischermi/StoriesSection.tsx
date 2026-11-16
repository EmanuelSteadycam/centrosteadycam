"use client";
import { useRef, useState } from "react";
import {
  STORY_NAME_MAX_LENGTH,
  STORY_MAX_LENGTH,
  STORY_REPLY_MAX_LENGTH,
  STORY_TITLE_MAX_LENGTH,
  type PublicStoryPost,
} from "@/lib/podcast";

const PINK = "#FF3EA5";
const INK = "#1E1B1C";
// Oltre questa lunghezza la storia si mostra accorciata con "Leggi tutto"
const PREVIEW_CHARS = 600;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" });
}

export default function StoriesSection({ posts, titleClassName }: { posts: PublicStoryPost[]; titleClassName: string }) {
  const [formOpen, setFormOpen] = useState(false);
  // Storie dalla più recente; risposte in ordine cronologico sotto ciascuna
  const stories = posts.filter((p) => p.parent_id === null).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const repliesFor = (id: string) =>
    posts.filter((p) => p.parent_id === id).sort((a, b) => a.created_at.localeCompare(b.created_at));

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className={`${titleClassName} uppercase text-4xl md:text-5xl leading-[0.95] tracking-[0.08em] mb-6`}>Le vostre storie</h2>
      <p className="font-title text-base md:text-lg font-light text-white/90 max-w-2xl mb-8">
        Anche a casa vostra gli schermi sono un tema? Raccontateci com&apos;è andata: le fatiche, le regole che funzionano,
        quelle che non hanno funzionato. Le storie vengono pubblicate dopo una lettura della redazione e chiunque può rispondere.
      </p>

      {formOpen ? (
        <div className="rounded-2xl p-5 md:p-6 mb-10" style={{ background: INK }}>
          <PostForm mode="story" onClose={() => setFormOpen(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="font-title font-semibold inline-flex items-center rounded-lg uppercase tracking-widest text-sm px-7 py-3.5 mb-10 transition-transform hover:-rotate-2"
          style={{ background: PINK, color: "#fff" }}
        >
          Racconta la tua storia
        </button>
      )}

      {stories.length === 0 ? (
        <p className="font-title text-white/80">Ancora nessuna storia: la prima può essere la tua.</p>
      ) : (
        <div className="space-y-6">
          {stories.map((s) => (
            <StoryCard key={s.id} story={s} replies={repliesFor(s.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function StoryCard({ story: s, replies }: { story: PublicStoryPost; replies: PublicStoryPost[] }) {
  const long = s.testo.length > PREVIEW_CHARS;
  const [expanded, setExpanded] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const shown = long && !expanded ? s.testo.slice(0, PREVIEW_CHARS).replace(/\s+\S*$/, "") + "…" : s.testo;

  return (
    <article className="rounded-2xl p-5 md:p-6" style={{ background: INK }}>
      <p className="font-title text-xs font-semibold uppercase tracking-widest mb-2">
        <span style={{ color: PINK }}>{s.nome}</span>
        <span className="text-white/60"> · {formatDate(s.created_at)}</span>
      </p>
      <h3 className="font-title font-bold uppercase text-xl md:text-2xl leading-snug mb-3 break-words">{s.titolo}</h3>
      <p className="font-title text-sm md:text-base font-light leading-relaxed text-white/90 whitespace-pre-line break-words">{shown}</p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="font-title text-xs font-semibold uppercase tracking-widest mt-3 underline underline-offset-4 text-white/70 hover:text-white"
        >
          {expanded ? "Riduci" : "Leggi tutto"}
        </button>
      )}

      <div className="mt-5 pt-4 border-t border-white/10">
        {replies.length > 0 && (
          <ul className="space-y-4 mb-5">
            {replies.map((r) => (
              <li key={r.id} className="pl-4 border-l-2" style={{ borderColor: r.is_staff ? PINK : "rgba(255,255,255,0.25)" }}>
                <p className="font-title text-xs uppercase tracking-widest text-white/60 mb-1">
                  <span className="font-semibold" style={{ color: r.is_staff ? PINK : "#fff" }}>
                    {r.is_staff ? "Centro Steadycam" : r.nome}
                  </span>{" "}
                  · {formatDate(r.created_at)}
                </p>
                <p className="font-title text-sm font-light leading-relaxed text-white/90 whitespace-pre-line break-words">{r.testo}</p>
              </li>
            ))}
          </ul>
        )}
        {replyOpen ? (
          <PostForm mode="reply" parentId={s.id} onClose={() => setReplyOpen(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setReplyOpen(true)}
            className="font-title text-xs font-semibold uppercase tracking-widest inline-flex items-center gap-2 hover:opacity-80"
            style={{ color: PINK }}
          >
            {replies.length === 0 ? "Rispondi" : `Rispondi · ${replies.length} ${replies.length === 1 ? "risposta" : "risposte"}`}
          </button>
        )}
      </div>
    </article>
  );
}

function PostForm({ mode, parentId, onClose }: { mode: "story" | "reply"; parentId?: string; onClose: () => void }) {
  const isReply = mode === "reply";
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [titolo, setTitolo] = useState("");
  const [testo, setTesto] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Il form compare solo dopo un clic: l'apertura è l'inizio della compilazione
  const startedAt = useRef<number>(Date.now());
  const maxText = isReply ? STORY_REPLY_MAX_LENGTH : STORY_MAX_LENGTH;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/podcast/storie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: parentId ?? null, nome, email, titolo, testo, website, t: startedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Errore nell'invio, riprova");
      } else {
        setSent(true);
        setNome("");
        setEmail("");
        setTitolo("");
        setTesto("");
      }
    } catch {
      setError("Errore di connessione, riprova");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-lg border border-white/20 px-4 py-3">
        <p className="font-title text-sm text-white">
          Grazie! {isReply ? "La tua risposta" : "La tua storia"} sarà visibile dopo l&apos;approvazione della redazione.
        </p>
        <button type="button" onClick={onClose} className="font-title text-xs underline text-white/60 mt-2 hover:text-white">
          Chiudi
        </button>
      </div>
    );
  }

  const input =
    "w-full font-title text-sm text-white bg-white/5 border border-white/20 rounded-lg px-3 py-2 placeholder:text-white/40 focus:outline-none focus:border-white/60";

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          required
          maxLength={STORY_NAME_MAX_LENGTH}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome o pseudonimo *"
          aria-label="Nome o pseudonimo"
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
      {!isReply && (
        <input
          type="text"
          required
          maxLength={STORY_TITLE_MAX_LENGTH}
          value={titolo}
          onChange={(e) => setTitolo(e.target.value)}
          placeholder="Titolo della storia *"
          aria-label="Titolo della storia"
          className={input}
        />
      )}
      <textarea
        required
        rows={isReply ? 3 : 8}
        maxLength={maxText}
        value={testo}
        onChange={(e) => setTesto(e.target.value)}
        placeholder={isReply ? "La tua risposta *" : "La tua storia *"}
        aria-label={isReply ? "Risposta" : "Storia"}
        className={`${input} resize-y`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-title text-[11px] text-white/50 max-w-md">
          {!isReply && <>Non inserire nomi, luoghi o dettagli che permettano di riconoscere te o altre persone, soprattutto i minori. </>}
          Pubblicazione dopo l&apos;approvazione della redazione. Dati trattati secondo la{" "}
          <a href="/privacy" className="underline hover:text-white">privacy policy</a>.
        </p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose} className="font-title text-xs uppercase tracking-widest text-white/60 hover:text-white">
            Annulla
          </button>
          <button
            type="submit"
            disabled={sending}
            className="font-title font-semibold rounded-lg uppercase tracking-widest text-xs px-5 py-2.5 transition-transform hover:-rotate-2 disabled:opacity-50"
            style={{ background: PINK, color: "#fff" }}
          >
            {sending ? "Invio…" : "Invia"}
          </button>
        </div>
      </div>
      {error && <p className="font-title text-sm text-red-300">{error}</p>}
    </form>
  );
}
