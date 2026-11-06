import { createSupabaseAdminClient } from "@/lib/supabase-server";
import type { PodcastEpisode } from "@/lib/podcast";

type SpotifyLatest = { id: string; title: string; releaseDate: string | null; isTrailer: boolean };

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const romeDay = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });

// Il player embed pubblico dello show espone l'ultimo episodio uscito (id, titolo, data) in __NEXT_DATA__
async function fetchLatestEpisode(showId: string): Promise<SpotifyLatest | null> {
  try {
    const res = await fetch(`https://open.spotify.com/embed/show/${showId}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!m) return null;
    const entity = JSON.parse(m[1])?.props?.pageProps?.state?.data?.entity;
    if (!entity?.id || typeof entity.uri !== "string" || !entity.uri.startsWith("spotify:episode:")) return null;
    return {
      id: entity.id,
      title: entity.title ?? entity.name ?? "",
      releaseDate: entity.releaseDate?.isoString ?? null,
      isTrailer: entity.isTrailer === true,
    };
  } catch {
    return null;
  }
}

// Se l'ultimo episodio su Spotify è il trailer e il link trailer manca, lo salva; altrimenti, per gli episodi
// già usciti senza link, se l'ultimo episodio corrisponde (titolo o giorno di uscita) salva il link della puntata
export async function syncSpotifyLinks(
  episodes: PodcastEpisode[],
  showUrl: string,
  trailerUrl: string
): Promise<{ episodes: PodcastEpisode[]; trailerUrl: string }> {
  const unchanged = { episodes, trailerUrl };
  const showId = showUrl.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?show\/([A-Za-z0-9]+)/)?.[1];
  const now = Date.now();
  const missing = episodes.filter((e) => !e.spotify_url && new Date(e.release_at).getTime() <= now);
  if (!showId || (missing.length === 0 && trailerUrl)) return unchanged;

  const latest = await fetchLatestEpisode(showId);
  if (!latest) return unchanged;
  const latestUrl = `https://open.spotify.com/episode/${latest.id}`;
  const supabase = createSupabaseAdminClient();

  if (latest.isTrailer) {
    if (trailerUrl) return unchanged;
    const { error } = await supabase.from("podcast_settings").upsert({ key: "trailer_url", value: latestUrl });
    return error ? unchanged : { episodes, trailerUrl: latestUrl };
  }

  const byTitle = missing.find((e) => norm(e.title) && norm(latest.title).includes(norm(e.title)));
  const byDay = latest.releaseDate ? missing.find((e) => romeDay(e.release_at) === romeDay(latest.releaseDate!)) : undefined;
  const match = byTitle ?? byDay;
  if (!match) return unchanged;

  const { error } = await supabase
    .from("podcast_episodes")
    .update({ spotify_url: latestUrl, updated_at: new Date().toISOString() })
    .eq("id", match.id)
    .is("spotify_url", null);
  if (error) return unchanged;

  return { episodes: episodes.map((e) => (e.id === match.id ? { ...e, spotify_url: latestUrl } : e)), trailerUrl };
}
