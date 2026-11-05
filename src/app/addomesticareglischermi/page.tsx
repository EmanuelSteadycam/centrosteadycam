import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { spotifyEmbedUrl, formatReleaseDate, type PodcastEpisode } from "@/lib/podcast";

export const metadata: Metadata = {
  title: "Addomesticare gli schermi — Podcast",
  description: "Addomesticare gli schermi, il podcast del Centro Steadycam. Un nuovo episodio ogni settimana su Spotify.",
};

// Gli episodi si attivano alla data di uscita: la pagina va calcolata a ogni richiesta
export const dynamic = "force-dynamic";

export default async function PodcastPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: episodes }, { data: settings }] = await Promise.all([
    supabase
      .from("podcast_episodes")
      .select("id, number, title, description, cover_url, release_at, spotify_url")
      .order("number", { ascending: true }),
    supabase.from("podcast_settings").select("key, value"),
  ]);

  const list = (episodes ?? []) as PodcastEpisode[];
  const setting = (key: string) => settings?.find((s) => s.key === key)?.value ?? "";
  const showUrl = setting("spotify_show_url");
  const intro = setting("intro");
  const showEmbed = spotifyEmbedUrl(showUrl);
  const now = Date.now();

  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="page-hero bg-cs-charcoal" style={{ height: 420 }}>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <p className="text-white/60 text-xs font-title font-semibold uppercase tracking-[0.3em] mb-4">
            Il podcast del Centro Steadycam
          </p>
          <h1 className="page-hero-title text-4xl md:text-6xl mb-6">Addomesticare gli schermi</h1>
          {showUrl && (
            <a
              href={showUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-white text-xs font-title font-semibold uppercase tracking-widest px-6 py-3 transition-colors"
              style={{ background: "#1DB954" }}
            >
              Ascolta su Spotify
            </a>
          )}
        </div>
      </div>

      {intro && (
        <section className="py-14">
          <p className="max-w-3xl mx-auto px-4 sm:px-6 text-cs-text text-base md:text-lg font-light leading-relaxed whitespace-pre-line text-center">
            {intro}
          </p>
        </section>
      )}

      {/* Episodi */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-title font-light text-cs-charcoal text-2xl uppercase tracking-[0.06em] mb-8">
            Episodi
          </h2>

          {list.length === 0 && <p className="text-cs-textLight text-sm">Il primo episodio è in arrivo.</p>}

          <div className="space-y-6">
            {list.map((ep) => {
              const released = new Date(ep.release_at).getTime() <= now;
              const embed = spotifyEmbedUrl(ep.spotify_url) ?? showEmbed;
              return (
                <article
                  key={ep.id}
                  aria-disabled={!released}
                  className={`flex flex-col sm:flex-row gap-5 border border-gray-100 p-5 ${
                    released ? "" : "opacity-40 grayscale pointer-events-none select-none"
                  }`}
                >
                  {ep.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ep.cover_url} alt="" className="w-full sm:w-36 aspect-square object-cover shrink-0" />
                  ) : (
                    <div className="w-full sm:w-36 aspect-square shrink-0 bg-cs-charcoal flex items-center justify-center">
                      <span className="font-title font-light text-white text-4xl">{ep.number}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-title font-semibold uppercase tracking-widest text-cs-textLight mb-1">
                      Episodio {ep.number} · {released ? formatReleaseDate(ep.release_at) : `Esce il ${formatReleaseDate(ep.release_at)}`}
                    </p>
                    <h3 className="font-title font-semibold text-cs-charcoal text-lg mb-2">{ep.title}</h3>
                    {ep.description && (
                      <p className="text-cs-text text-sm leading-relaxed whitespace-pre-line mb-4">{ep.description}</p>
                    )}
                    {released && embed && (
                      <iframe
                        src={embed}
                        title={`Episodio ${ep.number} — ${ep.title}`}
                        width="100%"
                        height="152"
                        loading="lazy"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        className="rounded-xl border-0"
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
