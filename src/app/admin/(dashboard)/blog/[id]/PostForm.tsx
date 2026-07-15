"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost, sendBlogNewsletter, getBrevoLists } from "../actions";
import { uploadBlogImage, deleteBlogImage, uploadBlogFile, listBlogFiles } from "../uploadImage";
import RichTextEditor from "@/components/admin/RichTextEditor";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  author_name: string | null;
  status: string;
  date: string;
} | null;

function generateSlug(title: string) {
  return title.toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function PostForm({ post }: { post: Post }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const [existingFiles, setExistingFiles] = useState<{ name: string; url: string; size: number }[]>([]);
  const [showExisting, setShowExisting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [newsletterState, setNewsletterState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [newsletterMsg, setNewsletterMsg] = useState<string | null>(null);
  const [brevoLists, setBrevoLists] = useState<{ id: number; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState<number>(15);

  useEffect(() => {
    if (post) getBrevoLists().then(setBrevoLists);
  }, [post]);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featured_image_url ?? "");
  const [authorName, setAuthorName] = useState(post?.author_name ?? "Staff Steadycam");
  const [date, setDate] = useState(
    post?.date ? post.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!post) setSlug(generateSlug(v));
  };

  const handleSave = (targetStatus: "draft" | "publish") => {
    setError(null);
    setSaveMsg(null);
    if (!title.trim()) { setError("Il titolo è obbligatorio"); return; }
    if (!slug.trim()) { setError("Lo slug è obbligatorio"); return; }

    startTransition(async () => {
      const formData = { title, slug, excerpt, content, featured_image_url: featuredImageUrl, author_name: authorName, status: targetStatus, date };

      if (post) {
        const result = await updatePost(post.id, formData);
        if (result.error) { setError(result.error); return; }
        setSaveMsg(targetStatus === "publish" ? "Pubblicato ✓" : "Bozza salvata ✓");
        setTimeout(() => setSaveMsg(null), 3000);
      } else {
        const result = await createPost(formData);
        if (result.error) { setError(result.error); return; }
        router.push(`/admin/blog/${result.id}`);
      }
    });
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4 max-w-3xl">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Titolo *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-mono text-gray-600 focus:outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Estratto</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Immagine copertina</label>
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

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Allegati scaricabili</label>
          <div className="flex flex-col gap-2">
            {uploadedFiles.map((f) => (
              <div key={f.url} className="flex items-center gap-2 text-xs">
                <span className="text-gray-600 truncate max-w-[200px]" title={f.name}>{f.name}</span>
                <code className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-500 truncate">{f.url}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(f.url);
                    setCopiedUrl(f.url);
                    setTimeout(() => setCopiedUrl(null), 2000);
                  }}
                  className="shrink-0 px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {copiedUrl === f.url ? "Copiato ✓" : "Copia URL"}
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <label className={`cursor-pointer self-start text-xs px-3 py-2 rounded border transition-colors ${uploadingFile ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800"}`}>
                {uploadingFile ? "Caricamento…" : "+ Carica file (PDF, PNG, …)"}
                <input
                  type="file"
                  className="hidden"
                  disabled={uploadingFile}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingFile(true);
                    const fd = new FormData();
                    fd.append("file", file);
                    const result = await uploadBlogFile(fd);
                    setUploadingFile(false);
                    if (result.error) { alert(result.error); return; }
                    if (result.url && result.name) {
                      setUploadedFiles((prev) => [...prev, { name: result.name!, url: result.url! }]);
                    }
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={async () => {
                  if (!showExisting && existingFiles.length === 0) {
                    setLoadingExisting(true);
                    const files = await listBlogFiles();
                    setExistingFiles(files);
                    setLoadingExisting(false);
                  }
                  setShowExisting((v) => !v);
                }}
                className="text-xs px-3 py-2 rounded border border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800 transition-colors"
              >
                {loadingExisting ? "Caricamento…" : showExisting ? "Nascondi archivio" : "Scegli da archivio"}
              </button>
            </div>

            {showExisting && (
              <div className="mt-2 border border-gray-200 rounded overflow-hidden">
                {existingFiles.length === 0 ? (
                  <p className="text-xs text-gray-400 p-3">Nessun file caricato in precedenza.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                    {existingFiles.map((f) => (
                      <div key={f.url} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                        <span className="text-xs text-gray-600 flex-1 truncate" title={f.name}>{f.name}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(f.url);
                            setCopiedUrl(f.url);
                            setTimeout(() => setCopiedUrl(null), 2000);
                          }}
                          className="shrink-0 text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          {copiedUrl === f.url ? "Copiato ✓" : "Copia URL"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5">
        <label className="block text-xs font-medium text-gray-600 mb-2">Contenuto</label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          onUploadFile={async (file) => {
            const fd = new FormData();
            fd.append("file", file);
            const result = await uploadBlogFile(fd);
            return result.url ?? null;
          }}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Autore</label>
          <select
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          >
            {["Staff Steadycam","Beppe","Emanuel","Valentino","Christian","Sara","Martina","Stefano","Carmen"].map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        {post && (
          <div className="flex items-center gap-2">
            {newsletterMsg && (
              <span className={`text-xs ${newsletterState === "sent" ? "text-green-600" : "text-red-500"}`}>
                {newsletterMsg}
              </span>
            )}
            {brevoLists.length > 0 && (
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(Number(e.target.value))}
                disabled={newsletterState === "sending" || newsletterState === "sent"}
                className="border border-gray-200 rounded px-2 py-2 text-xs text-gray-700 focus:outline-none focus:border-gray-400 disabled:opacity-40"
              >
                {brevoLists.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              disabled={newsletterState === "sending" || newsletterState === "sent"}
              onClick={async () => {
                const listName = brevoLists.find((l) => l.id === selectedListId)?.name ?? `lista ${selectedListId}`;
                if (!confirm(`Inviare la newsletter agli iscritti di "${listName}"?`)) return;
                setNewsletterState("sending");
                setNewsletterMsg(null);
                const res = await sendBlogNewsletter(post.id, selectedListId);
                if (res.error) {
                  setNewsletterState("error");
                  setNewsletterMsg(res.error);
                } else {
                  setNewsletterState("sent");
                  setNewsletterMsg(`Inviata (campagna #${res.campaignId})`);
                }
              }}
              className="text-sm px-4 py-2 rounded border transition-colors disabled:opacity-40
                border-green-600 text-green-700 hover:bg-green-50 disabled:border-gray-200 disabled:text-gray-400"
            >
              {newsletterState === "sending" ? "Invio…" : newsletterState === "sent" ? "Inviata ✓" : "Invia Newsletter"}
            </button>
          </div>
        )}

        <div className="ml-auto flex gap-3 items-center">
          {saveMsg && <span className="text-xs text-green-600 font-medium">{saveMsg}</span>}
          {post && slug && (
            <a
              href={`/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 px-4 py-2 border border-blue-200 rounded transition-colors hover:bg-blue-50 flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Anteprima
            </a>
          )}
          <button
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 border border-gray-200 rounded transition-colors"
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave("draft")}
            className="text-sm px-4 py-2 rounded border transition-colors disabled:opacity-40 border-gray-400 text-gray-700 hover:bg-gray-50"
          >
            {isPending ? "…" : "Salva bozza"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave("publish")}
            className="text-sm bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            {isPending ? "…" : "Pubblica"}
          </button>
        </div>
      </div>
    </form>
  );
}
