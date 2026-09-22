"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMail, updateMail, sendMailNewsletter, previewMailHtml } from "../actions";
import { getBrevoLists } from "../../blog/actions";
import { uploadBlogImage, deleteBlogImage, uploadBlogFile, listBlogFiles } from "../../blog/uploadImage";
import RichTextEditor from "@/components/admin/RichTextEditor";

const TEST_LIST_ID = 15;
const DEFAULT_LIST_ID = 3;

type Mail = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  newsletter_sent_at: string | null;
  newsletter_list_id: number | null;
} | null;

function generateSlug(title: string) {
  return "mail-" + title.toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function MailForm({ mail }: { mail: Mail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [sendState, setSendState] = useState<"idle" | "sending" | "error">("idle");
  const [sendMsg, setSendMsg] = useState<string | null>(null);
  const [brevoLists, setBrevoLists] = useState<{ id: number; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState<number>(mail?.newsletter_list_id ?? DEFAULT_LIST_ID);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (mail) getBrevoLists().then(setBrevoLists);
  }, [mail]);

  const [title, setTitle] = useState(mail?.title ?? "");
  const [slug, setSlug] = useState(mail?.slug ?? "");
  const [excerpt, setExcerpt] = useState(mail?.excerpt ?? "");
  const [content, setContent] = useState(mail?.content ?? "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(mail?.featured_image_url ?? "");

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!mail) setSlug(generateSlug(v));
  };

  const save = async (): Promise<number | null> => {
    setError(null);
    setSaveMsg(null);
    if (!title.trim()) { setError("Il titolo è obbligatorio"); return null; }

    const formData = { title, slug, excerpt, content, featured_image_url: featuredImageUrl };

    if (mail) {
      const result = await updateMail(mail.id, formData);
      if (result.error) { setError(result.error); return null; }
      return mail.id;
    } else {
      const result = await createMail(formData);
      if (result.error) { setError(result.error); return null; }
      return result.id ?? null;
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      const id = await save();
      if (id === null) return;
      if (mail) {
        setSaveMsg("Bozza salvata ✓");
        setTimeout(() => setSaveMsg(null), 3000);
      } else {
        router.push(`/admin/mail-inviate/${id}`);
      }
    });
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    const html = await previewMailHtml({ title, excerpt, content, featured_image_url: featuredImageUrl });
    setPreviewLoading(false);
    setPreviewHtml(html);
  };

  const handleSend = (listId: number, isTest: boolean) => {
    if (!isTest) {
      const listName = brevoLists.find((l) => l.id === listId)?.name ?? `lista ${listId}`;
      if (!confirm(`Inviare questa mail a tutti gli iscritti di "${listName}"? L'invio parte subito.`)) return;
    }
    setError(null);
    setSendState("sending");
    setSendMsg(null);
    startTransition(async () => {
      const id = await save();
      if (id === null) { setSendState("error"); return; }
      const res = await sendMailNewsletter(id, listId);
      if (res.error) {
        setSendState("error");
        setSendMsg(res.error);
      } else {
        setSendState("idle");
        setSendMsg(res.isTest ? "Invio di prova inviato ✓" : `Inviata ✓${res.campaignId ? ` (campagna #${res.campaignId})` : ""}`);
        if (!mail) router.push(`/admin/mail-inviate/${id}`);
        else router.refresh();
      }
    });
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4 max-w-3xl">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded">{error}</div>
      )}

      {mail?.newsletter_sent_at && (
        <div className="bg-green-50 text-green-800 text-sm px-4 py-3 rounded">
          Ultimo invio: {new Date(mail.newsletter_sent_at).toLocaleString("it-IT")}
          {mail.newsletter_list_id ? ` — lista #${mail.newsletter_list_id}` : ""}.
          Puoi modificare il contenuto e inviarla di nuovo, anche a un&apos;altra lista.
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Titolo (oggetto email) *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Anteprima email (facoltativa)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Testo che appare come anteprima nella lista email del destinatario"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Immagine di intestazione</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
            <label className={`cursor-pointer text-xs px-3 py-2 rounded border transition-colors ${uploading ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800"}`}>
              {uploading ? "Caricamento…" : "Carica"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  const fd = new FormData();
                  fd.append("file", file);
                  const result = await uploadBlogImage(fd);
                  setUploading(false);
                  if (result.error) { alert(result.error); return; }
                  if (result.url) setFeaturedImageUrl(result.url);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {featuredImageUrl && (
            <div className="relative inline-block mt-2">
              <img src={featuredImageUrl} alt="" className="h-24 w-auto object-cover rounded border border-gray-100" />
              <button
                type="button"
                onClick={() => { deleteBlogImage(featuredImageUrl); setFeaturedImageUrl(""); }}
                className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none hover:bg-red-500 transition-colors"
              >×</button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-gray-600">Contenuto della mail</label>
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewLoading}
            className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800 transition-colors disabled:opacity-40"
          >
            {previewLoading ? "Genero anteprima…" : "👁 Anteprima email"}
          </button>
        </div>
        <RichTextEditor
          value={content}
          onChange={setContent}
          onUploadFile={async (file) => {
            const fd = new FormData();
            fd.append("file", file);
            const result = await uploadBlogFile(fd);
            return result.url ?? null;
          }}
          onListFiles={listBlogFiles}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5 flex flex-wrap items-end gap-4">
        {mail && (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSend(TEST_LIST_ID, true)}
              className="text-sm px-4 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              {sendState === "sending" ? "Invio…" : "Invio di prova"}
            </button>

            {brevoLists.length > 0 && (
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(Number(e.target.value))}
                disabled={isPending}
                className="border border-gray-200 rounded px-2 py-2 text-xs text-gray-700 focus:outline-none focus:border-gray-400 disabled:opacity-40"
              >
                {brevoLists.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSend(selectedListId, false)}
              className="text-sm px-4 py-2 rounded border transition-colors disabled:opacity-40 border-green-600 text-green-700 hover:bg-green-50"
            >
              {sendState === "sending" ? "Invio…" : "Invia →"}
            </button>
            {sendMsg && (
              <span className={`text-xs ${sendState === "error" ? "text-red-500" : "text-green-600"}`}>
                {sendMsg}
              </span>
            )}
          </>
        )}

        <div className="ml-auto flex gap-3 items-center">
          {saveMsg && <span className="text-xs text-green-600 font-medium">{saveMsg}</span>}
          <button
            type="button"
            onClick={() => router.push("/admin/mail-inviate")}
            className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 border border-gray-200 rounded transition-colors"
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="text-sm bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            {isPending ? "…" : "Salva bozza"}
          </button>
        </div>
      </div>

      {previewHtml !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreviewHtml(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-semibold text-gray-800">Anteprima email</h3>
              <button
                type="button"
                onClick={() => setPreviewHtml(null)}
                className="text-gray-400 hover:text-gray-800 text-sm"
              >
                ✕ Chiudi
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              <iframe
                title="Anteprima email"
                srcDoc={previewHtml}
                className="w-full bg-white mx-auto shadow-sm"
                style={{ maxWidth: 640, height: "70vh", border: "1px solid #e5e7eb" }}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
