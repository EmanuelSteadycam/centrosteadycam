"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEpisode, updateEpisode, deleteEpisode } from "./actions";
import { uploadPodcastImage } from "./uploadImage";
import type { PodcastEpisode } from "@/lib/podcast";

// ISO → valore per <input type="datetime-local"> nel fuso del browser
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props =
  | { mode: "create"; nextNumber: number; nextRelease: string }
  | { mode: "edit"; episode: PodcastEpisode };

export default function EpisodeForm(props: Props) {
  const ep = props.mode === "edit" ? props.episode : null;
  const [isPending, startTransition] = useTransition();
  const [number, setNumber] = useState(ep?.number ?? (props.mode === "create" ? props.nextNumber : 1));
  const [title, setTitle] = useState(ep?.title ?? "");
  const [description, setDescription] = useState(ep?.description ?? "");
  const [releaseAt, setReleaseAt] = useState(
    ep ? toLocalInput(ep.release_at) : props.mode === "create" ? toLocalInput(props.nextRelease) : ""
  );
  const [spotifyUrl, setSpotifyUrl] = useState(ep?.spotify_url ?? "");
  const [coverUrl, setCoverUrl] = useState(ep?.cover_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (deleted) return null;

  const change = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setDirty(true); };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadPodcastImage(fd);
    if (result.error) setError(result.error);
    else if (result.url) {
      setCoverUrl(result.url);
      setDirty(true);
    }
    setUploading(false);
  };

  const handleSave = () => {
    if (!title.trim()) return setError("Il titolo è obbligatorio");
    if (!releaseAt) return setError("La data di uscita è obbligatoria");
    setError(null);
    const input = {
      number,
      title: title.trim(),
      description: description.trim(),
      coverUrl: coverUrl || null,
      releaseAt: new Date(releaseAt).toISOString(),
      spotifyUrl: spotifyUrl.trim() || null,
    };
    startTransition(async () => {
      const result = ep ? await updateEpisode(ep.id, input) : await createEpisode(input);
      if (result.error) return setError(result.error);
      setDirty(false);
      if (!ep) {
        setTitle("");
        setDescription("");
        setSpotifyUrl("");
        setCoverUrl("");
        setNumber(number + 1);
        const next = new Date(releaseAt);
        next.setDate(next.getDate() + 7);
        setReleaseAt(toLocalInput(next.toISOString()));
      }
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!ep || !confirm(`Eliminare l'episodio ${ep.number}?`)) return;
    startTransition(async () => {
      const result = await deleteEpisode(ep.id);
      if (!result.error) setDeleted(true);
      else setError(result.error);
    });
  };

  return (
    <div className="px-5 py-4">
      <div className="flex items-start gap-4">
        <input
          type="number"
          value={number}
          onChange={(e) => change(setNumber)(Number(e.target.value))}
          title="Numero episodio"
          className="w-16 text-sm font-medium text-gray-800 border border-gray-200 rounded px-2 py-1.5 shrink-0"
        />
        <div className="flex flex-col items-center gap-1 shrink-0">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="w-16 h-16 object-cover rounded border border-gray-200" />
          ) : (
            <div className="w-16 h-16 rounded border border-dashed border-gray-300 bg-gray-50" />
          )}
          <label className={`cursor-pointer text-[11px] px-2 py-1 rounded border transition-colors ${uploading ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:border-gray-500"}`}>
            {uploading ? "…" : coverUrl ? "Cambia" : "Copertina"}
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
              value={title}
              onChange={(e) => change(setTitle)(e.target.value)}
              placeholder="Titolo episodio"
              className="flex-1 text-sm font-medium text-gray-800 border border-gray-200 rounded px-2 py-1.5"
            />
            <input
              type="datetime-local"
              value={releaseAt}
              onChange={(e) => change(setReleaseAt)(e.target.value)}
              title="Data e ora di uscita"
              className="text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5"
            />
          </div>
          <textarea
            value={description}
            onChange={(e) => change(setDescription)(e.target.value)}
            rows={2}
            placeholder="Descrizione..."
            className="w-full text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5 resize-y"
          />
          <input
            type="url"
            value={spotifyUrl}
            onChange={(e) => change(setSpotifyUrl)(e.target.value)}
            placeholder="Link Spotify dell'episodio (https://open.spotify.com/episode/...) — da incollare quando esce"
            className="w-full text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <button
            onClick={handleSave}
            disabled={isPending || uploading || (!!ep && !dirty)}
            className="text-xs text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-30 px-3 py-1.5 rounded transition-colors"
          >
            {ep ? "Salva" : "+ Aggiungi"}
          </button>
          {ep && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 px-2 py-1.5 rounded transition-colors disabled:opacity-40"
            >
              Elimina
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
