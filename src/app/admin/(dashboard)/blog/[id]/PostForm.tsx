"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "../actions";
import { uploadBlogImage, deleteBlogImage } from "../uploadImage";
import RichTextEditor from "@/components/admin/RichTextEditor";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
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
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featured_image_url ?? "");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [date, setDate] = useState(
    post?.date ? post.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!post) setSlug(generateSlug(v));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("Il titolo è obbligatorio"); return; }
    if (!slug.trim()) { setError("Lo slug è obbligatorio"); return; }

    startTransition(async () => {
      const formData = { title, slug, excerpt, content, featured_image_url: featuredImageUrl, status, date };
      const result = post
        ? await updatePost(post.id, formData)
        : await createPost(formData);

      if (result.error) { setError(result.error); return; }
      router.push("/admin/blog");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
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
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5">
        <label className="block text-xs font-medium text-gray-600 mb-2">Contenuto</label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Stato</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          >
            <option value="draft">Bozza</option>
            <option value="publish">Pubblicato</option>
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
        <div className="ml-auto flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 border border-gray-200 rounded transition-colors"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="text-sm bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            {isPending ? "Salvataggio…" : post ? "Salva modifiche" : "Crea articolo"}
          </button>
        </div>
      </div>
    </form>
  );
}
