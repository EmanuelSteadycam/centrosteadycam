"use client";
import { useState, useTransition } from "react";
import { setStoryStatus, addStaffStoryReply, deleteStoryPost } from "./actions";

export type AdminStoryPost = {
  id: string;
  parent_id: string | null;
  nome: string;
  email: string | null;
  titolo: string | null;
  testo: string;
  status: "pending" | "approved" | "rejected";
  is_staff: boolean;
  created_at: string;
  parentTitle: string | null; // per le risposte: titolo della storia
};

type Filter = "pending" | "approved" | "rejected";
const FILTER_LABEL: Record<Filter, string> = { pending: "Da approvare", approved: "Pubblicati", rejected: "Rifiutati" };

export default function StoriesAdmin({ posts }: { posts: AdminStoryPost[] }) {
  const [filter, setFilter] = useState<Filter>("pending");
  const counts = {
    pending: posts.filter((p) => p.status === "pending").length,
    approved: posts.filter((p) => p.status === "approved").length,
    rejected: posts.filter((p) => p.status === "rejected").length,
  };
  const visible = posts.filter((p) => p.status === filter);

  return (
    <div id="storie" className="bg-white rounded-lg shadow-sm mb-6 scroll-mt-20">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Le vostre storie</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Storie degli ascoltatori e risposte: compaiono nella sezione &ldquo;Le vostre storie&rdquo; solo dopo l&apos;approvazione.
          Le risposte del Centro Steadycam scritte da qui sono pubblicate subito. L&apos;email non viene mai pubblicata.
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
        {visible.length === 0 && <p className="px-5 py-4 text-sm text-gray-400">Nessun messaggio.</p>}
        {visible.map((p) => (
          <StoryRow key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

function StoryRow({ post: p }: { post: AdminStoryPost }) {
  const [isPending, startTransition] = useTransition();
  const [reply, setReply] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isStory = p.parent_id === null;

  const run = (fn: () => Promise<{ error: string | null }>) => {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (r.error) setError(r.error);
    });
  };

  const date = new Date(p.created_at).toLocaleString("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" });
  const btn = "text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-30";

  return (
    <div className={`px-5 py-4 ${isPending ? "opacity-50" : ""}`}>
      <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
        {isStory ? "Storia" : <>Risposta a &ldquo;{p.parentTitle ?? "storia eliminata"}&rdquo;</>} · {date}
      </p>
      {isStory && <p className="text-sm font-semibold text-gray-900">{p.titolo}</p>}
      <p className="text-sm text-gray-800">
        <span className={p.is_staff ? "font-semibold text-pink-500" : "font-semibold"}>{p.nome}</span>
        {p.email && (
          <a href={`mailto:${p.email}`} className="text-gray-400 hover:text-gray-600 ml-2 text-xs">{p.email}</a>
        )}
      </p>
      <p className="text-sm text-gray-700 whitespace-pre-line break-words mt-1">{p.testo}</p>

      {replyOpen && (
        <div className="mt-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="Risposta pubblica come Centro Steadycam (pubblicata subito)"
            className="w-full text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5 resize-y"
          />
          <div className="flex gap-2 mt-1">
            <button
              disabled={isPending || !reply.trim()}
              onClick={() =>
                run(async () => {
                  const r = await addStaffStoryReply(p.id, reply);
                  if (!r.error) { setReply(""); setReplyOpen(false); }
                  return r;
                })
              }
              className={`${btn} text-white bg-gray-800 hover:bg-gray-700`}
            >
              Pubblica risposta
            </button>
            <button onClick={() => { setReply(""); setReplyOpen(false); }} className={`${btn} text-gray-500 hover:text-gray-700`}>
              Annulla
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {p.status !== "approved" && (
          <button disabled={isPending} onClick={() => run(() => setStoryStatus(p.id, "approved"))} className={`${btn} text-white bg-green-600 hover:bg-green-700`}>
            Approva
          </button>
        )}
        {p.status !== "rejected" && (
          <button disabled={isPending} onClick={() => run(() => setStoryStatus(p.id, "rejected"))} className={`${btn} text-gray-700 bg-gray-100 hover:bg-gray-200`}>
            {p.status === "approved" ? "Nascondi" : "Rifiuta"}
          </button>
        )}
        {isStory && p.status === "approved" && !replyOpen && (
          <button disabled={isPending} onClick={() => setReplyOpen(true)} className={`${btn} text-gray-700 bg-gray-100 hover:bg-gray-200`}>
            Rispondi come Centro Steadycam
          </button>
        )}
        <button
          disabled={isPending}
          onClick={() => (confirmDelete ? run(() => deleteStoryPost(p.id)) : setConfirmDelete(true))}
          onBlur={() => setConfirmDelete(false)}
          className={`${btn} ml-auto ${confirmDelete ? "text-white bg-red-600 hover:bg-red-700" : "text-red-600 hover:bg-red-50"}`}
        >
          {confirmDelete ? (isStory ? "Conferma (elimina anche le risposte)" : "Conferma eliminazione") : "Elimina"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
