"use client";
import { useState, useTransition } from "react";
import { updateStaff, deleteStaff } from "./actions";
import { uploadStaffImage } from "./uploadImage";

type Member = { id: string; name: string; role: string; bio: string; photo_url: string | null; sort_order: number };

export default function StaffRow({ member }: { member: Member }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);
  const [bio, setBio] = useState(member.bio);
  const [sortOrder, setSortOrder] = useState(member.sort_order);
  const [photoUrl, setPhotoUrl] = useState(member.photo_url ?? "");
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
    const result = await uploadStaffImage(fd);
    if (result.error) setError(result.error);
    else if (result.url) {
      setPhotoUrl(result.url);
      setDirty(true);
    }
    setUploading(false);
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateStaff(member.id, name, role, bio, photoUrl || null, sortOrder);
      if (result.error) setError(result.error);
      else setDirty(false);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Eliminare ${member.name}?`)) return;
    startTransition(async () => {
      const result = await deleteStaff(member.id);
      if (!result.error) setDeleted(true);
      else setError(result.error);
    });
  };

  return (
    <div className="px-5 py-3 flex items-start gap-4">
      <input
        type="number"
        value={sortOrder}
        onChange={(e) => { setSortOrder(Number(e.target.value)); setDirty(true); }}
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
            onChange={(e) => { setName(e.target.value); setDirty(true); }}
            className="flex-1 text-sm font-medium text-gray-800 border border-gray-200 rounded px-2 py-1.5"
          />
          <input
            type="text"
            value={role}
            onChange={(e) => { setRole(e.target.value); setDirty(true); }}
            className="flex-1 text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5"
          />
        </div>
        <textarea
          value={bio}
          onChange={(e) => { setBio(e.target.value); setDirty(true); }}
          rows={2}
          className="w-full text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5 resize-y"
        />
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
