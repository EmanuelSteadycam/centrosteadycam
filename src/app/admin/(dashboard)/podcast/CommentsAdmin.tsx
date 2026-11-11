"use client";
import { useState, useTransition } from "react";
import { setCommentStatus, saveCommentReply, deleteComment } from "./actions";

export type AdminComment = {
  id: string;
  episode_id: string;
  nome: string;
  email: string | null;
  testo: string;
  status: "pending" | "approved" | "rejected";
  reply: string | null;
  created_at: string;
  episodeLabel: string;
};

type Filter = "pending" | "approved" | "rejected";
const FILTER_LABEL: Record<Filter, string> = { pending: "Da approvare", approved: "Pubblicati", rejected: "Rifiutati" };

export default function CommentsAdmin({ comments }: { comments: AdminComment[] }) {
  const [filter, setFilter] = useState<Filter>("pending");
  const counts = {
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    rejected: comments.filter((c) => c.status === "rejected").length,
  };
  const visible = comments.filter((c) => c.status === filter);

  return (
    <div id="commenti" className="bg-white rounded-lg shadow-sm mb-6">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Commenti</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          I commenti compaiono sotto la puntata solo dopo l&apos;approvazione. L&apos;email (facoltativa) non viene mai pubblicata.
        </p>
        <div className="flex gap-1 mt-3">
          {(Object.keys(FILTER_LABEL) as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                filter === f ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {FILTER_LABEL[f]} ({counts[f]})
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {visible.length === 0 && <p className="px-5 py-4 text-sm text-gray-400">Nessun commento.</p>}
        {visible.map((c) => (
          <CommentRow key={c.id} comment={c} />
        ))}
      </div>
    </div>
  );
}

function CommentRow({ comment: c }: { comment: AdminComment }) {
  const [isPending, startTransition] = useTransition();
  const [reply, setReply] = useState(c.reply ?? "");
  const [replyOpen, setReplyOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error: string | null }>) => {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (r.error) setError(r.error);
    });
  };

  const date = new Date(c.created_at).toLocaleString("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" });
  const btn = "text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-30";

  return (
    <div className={`px-5 py-4 ${isPending ? "opacity-50" : ""}`}>
      <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
        {c.episodeLabel} · {date}
      </p>
      <p className="text-sm text-gray-800">
        <span className="font-semibold">{c.nome}</span>
        {c.email && (
          <a href={`mailto:${c.email}`} className="text-gray-400 hover:text-gray-600 ml-2 text-xs">{c.email}</a>
        )}
      </p>
      <p className="text-sm text-gray-700 whitespace-pre-line break-words mt-1">{c.testo}</p>

      {c.reply && !replyOpen && (
        <div className="mt-2 ml-3 pl-3 border-l-2 border-pink-400">
          <p className="text-[11px] uppercase tracking-wide text-pink-500">Risposta Centro Steadycam</p>
          <p className="text-sm text-gray-700 whitespace-pre-line">{c.reply}</p>
        </div>
      )}

      {replyOpen && (
        <div className="mt-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="Risposta pubblica come Centro Steadycam (vuota = nessuna risposta)"
            className="w-full text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5 resize-y"
          />
          <div className="flex gap-2 mt-1">
            <button
              disabled={isPending}
              onClick={() => run(async () => { const r = await saveCommentReply(c.id, reply); if (!r.error) setReplyOpen(false); return r; })}
              className={`${btn} text-white bg-gray-800 hover:bg-gray-700`}
            >
              Salva risposta
            </button>
            <button onClick={() => { setReply(c.reply ?? ""); setReplyOpen(false); }} className={`${btn} text-gray-500 hover:text-gray-700`}>
              Annulla
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {c.status !== "approved" && (
          <button disabled={isPending} onClick={() => run(() => setCommentStatus(c.id, "approved"))} className={`${btn} text-white bg-green-600 hover:bg-green-700`}>
            Approva
          </button>
        )}
        {c.status !== "rejected" && (
          <button disabled={isPending} onClick={() => run(() => setCommentStatus(c.id, "rejected"))} className={`${btn} text-gray-700 bg-gray-100 hover:bg-gray-200`}>
            {c.status === "approved" ? "Nascondi" : "Rifiuta"}
          </button>
        )}
        {!replyOpen && (
          <button disabled={isPending} onClick={() => setReplyOpen(true)} className={`${btn} text-gray-700 bg-gray-100 hover:bg-gray-200`}>
            {c.reply ? "Modifica risposta" : "Rispondi"}
          </button>
        )}
        <button
          disabled={isPending}
          onClick={() => (confirmDelete ? run(() => deleteComment(c.id)) : setConfirmDelete(true))}
          onBlur={() => setConfirmDelete(false)}
          className={`${btn} ml-auto ${confirmDelete ? "text-white bg-red-600 hover:bg-red-700" : "text-red-600 hover:bg-red-50"}`}
        >
          {confirmDelete ? "Conferma eliminazione" : "Elimina"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
