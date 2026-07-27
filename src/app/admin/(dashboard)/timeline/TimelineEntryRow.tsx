"use client";
import { useState, useTransition } from "react";
import { updateEntry, deleteEntry } from "./actions";
import { uploadTimelineImage } from "./uploadImage";

type Entry = { id: string; year: number; description: string; image_url: string | null };

export default function TimelineEntryRow({ entry }: { entry: Entry }) {
  const [isPending, startTransition] = useTransition();
  const [year, setYear] = useState(entry.year);
  const [description, setDescription] = useState(entry.description);
  const [imageUrl, setImageUrl] = useState(entry.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (deleted) return null;

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadTimelineImage(fd);
    if (result.error) setError(result.error);
    else if (result.url) { setImageUrl(result.url); setDirty(true); }
    setUploading(false);
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateEntry(entry.id, year, description, imageUrl || null);
      if (result.error) setError(result.error);
      else setDirty(false);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Eliminare l'anno ${entry.year}?`)) return;
    startTransition(async () => {
      const result = await deleteEntry(entry.id);
      if (!result.error) setDeleted(true);
      else setError(result.error);
    });
  };

  return (
    <div className="px-5 py-3 flex items-start gap-4">
      <input
        type="number"
        value={year}
        onChange={(e) => { setYear(Number(e.target.value)); setDirty(true); }}
        className="w-20 text-sm font-medium text-gray-800 border border-gray-200 rounded px-2 py-1.5 shrink-0"
      />
      <textarea
        value={description}
        onChange={(e) => { setDescription(e.target.value); setDirty(true); }}
        rows={2}
        className="flex-1 text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5 resize-y"
      />
      <div className="flex flex-col items-center gap-1 shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-14 h-14 object-cover rounded border border-gray-200" />
        ) : (
          <div className="w-14 h-14 rounded border border-dashed border-gray-300 bg-gray-50" />
        )}
        <label className={`cursor-pointer text-[11px] px-2 py-1 rounded border transition-colors ${uploading ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:border-gray-500"}`}>
          {uploading ? "…" : imageUrl ? "Cambia" : "Immagine"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
          />
        </label>
      </div>
      <div className="flex items-center gap-2 shrink-0 pt-1">
        <button
          onClick={handleSave}
          disabled={isPending || !dirty}
          className="text-xs text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-30 px-3 py-1.5 rounded transition-colors"
        >
          Salva
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 px-2 py-1.5 rounded transition-colors disabled:opacity-40"
        >
          Elimina
        </button>
      </div>
      {error && <p className="text-xs text-red-500 shrink-0">{error}</p>}
    </div>
  );
}
