export const PODCAST_PATH = "/addomesticareglischermi";
// Copertina dello show, uguale per tutte le puntate (usata se l'episodio non ne ha una propria)
export const PODCAST_COVER = "/podcast/copertina.jpg";

export type PodcastEpisode = {
  id: string;
  number: number;
  title: string;
  description: string;
  cover_url: string | null;
  release_at: string;
  spotify_url: string | null;
};

// open.spotify.com/episode/{id} o /show/{id} → URL embed del player
export function spotifyEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(episode|show)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}

export function formatReleaseDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Rome",
  });
}
