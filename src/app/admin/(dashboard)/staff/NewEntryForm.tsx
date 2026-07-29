"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStaff } from "./actions";
import { uploadStaffImage } from "./uploadImage";

export default function NewEntryForm({ nextSortOrder }: { nextSortOrder: number }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [sortOrder, setSortOrder] = useState(nextSortOrder);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadStaffImage(fd);
    if (result.error) setError(result.error);
    else if (result.url) setPhotoUrl(result.url);
    setUploading(false);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Il nome è obbligatorio");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createStaff(name.trim(), role.trim(), bio.trim(), photoUrl || null, sortOrder);
      if (result.error) setError(result.error);
      else {
        setName("");
        setRole("");
        setBio("");
        setPhotoUrl("");
        setSortOrder(sortOrder + 1);
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm px-5 py-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Aggiungi persona</h2>
      <div className="flex items-start gap-4">
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          title="Posizione (1 = in alto a sinistra)"
          className="w-16 text-sm font-medium text-gray-800 border border-gray-200 rounded px-2 py-1.5 shrink-0"
        />
        <div className="flex flex-col items-center gap-1 shrink-0">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="w-14 h-14 object-cover rounded-full border border-gray-200" />
          ) : (
            <div className="w-14 h-14 rounded-full border border-dashed border-gray-300 bg-gray-50" />
          )}
          <label className={`cursor-pointer text-[11px] px-2 py-1 rounded border transition-colors ${uploading ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:border-gray-500"}`}>
            {uploading ? "…" : photoUrl ? "Cambia" : "Immagine"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            />
          </label>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="flex-1 text-sm font-medium text-gray-800 border border-gray-200 rounded px-2 py-1.5"
            />
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ruolo"
              className="flex-1 text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5"
            />
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            placeholder="Bio..."
            className="w-full text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5 resize-y"
          />
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
