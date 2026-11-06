"use client";
import { useState, useTransition } from "react";
import { updatePodcastSettings } from "./actions";

export default function SettingsForm({ showUrl, intro, trailerUrl }: { showUrl: string; intro: string; trailerUrl: string }) {
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState(showUrl);
  const [text, setText] = useState(intro);
  const [trailer, setTrailer] = useState(trailerUrl);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updatePodcastSettings({ spotify_show_url: url.trim(), intro: text.trim(), trailer_url: trailer.trim() });
      if (result.error) setError(result.error);
      else setDirty(false);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm px-5 py-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Show</h2>
      <div className="space-y-2">
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setDirty(true); }}
          placeholder="Link Spotify dello show (https://open.spotify.com/show/...)"
          className="w-full text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5"
        />
        <input
          type="url"
          value={trailer}
          onChange={(e) => { setTrailer(e.target.value); setDirty(true); }}
          placeholder="Link Spotify del trailer (https://open.spotify.com/episode/...) — se lo pubblichi come Trailer viene trovato da solo"
          className="w-full text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5"
        />
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setDirty(true); }}
          rows={3}
          placeholder="Presentazione del podcast. Per il grassetto: **parola**"
          className="w-full text-sm text-gray-700 border border-gray-200 rounded px-2 py-1.5 resize-y"
        />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={handleSave}
          disabled={isPending || !dirty}
          className="text-xs text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-30 px-3 py-1.5 rounded transition-colors"
        >
          Salva
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
