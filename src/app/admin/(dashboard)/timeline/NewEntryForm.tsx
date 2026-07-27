"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEntry } from "./actions";
import { uploadTimelineImage } from "./uploadImage";

export default function NewEntryForm({ nextYear }: { nextYear: number }) {
  const [isPending, startTransition] = useTransition();
  const [year, setYear] = useState(nextYear);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadTimelineImage(fd);
    if (result.error) setError(result.error);
    else if (result.url) setImageUrl(result.url);
    setUploading(false);
  };

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      const result = await createEntry(year, description, imageUrl || null);
      if (result.error) setError(result.error);
      else {
        setDescription("");
        setImageUrl("");
        setYear(year + 1);
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm px-5 py-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Aggiungi anno</h2>
      <div className="flex items-start gap-4">
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-20 text-sm font-medium text-gray-800 border border-gray-200 rounded px-2 py-1.5 shrink-0"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Descrizione dell'evento..."
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
        <button
          onClick={handleCreate}
          disabled={isPending || uploading}
          className="text-xs text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-30 px-3 py-1.5 rounded transition-colors shrink-0"
        >
          + Aggiungi
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
