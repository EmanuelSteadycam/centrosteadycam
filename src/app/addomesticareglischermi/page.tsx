import type { Metadata } from "next";
import Image from "next/image";
import { Rubik_Dirt } from "next/font/google";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { spotifyEmbedUrl, formatReleaseDate, PODCAST_COVER, type PodcastEpisode } from "@/lib/podcast";

// Lettering "graffiato" bianco, in stile con la copertina
const dirt = Rubik_Dirt({ subsets: ["latin"], weight: "400", display: "swap" });

// Palette presa dalla copertina
const GREEN = "#6B9F5E";
const GREEN_DARK = "#4E7F43";
const PINK = "#FF3EA5";
const INK = "#1E1B1C";

export const metadata: Metadata = {
  title: "Addomesticare gli schermi — Podcast",
  description: "Addomesticare gli schermi, il podcast del Centro Steadycam. Un nuovo episodio ogni settimana su Spotify.",
  openGraph: { images: [PODCAST_COVER] },
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
    <div className="min-h-screen pt-14 text-white" style={{ background: GREEN }}>
      {/* Hero — titolo a sinistra, bambina scontornata appoggiata sul fondo a destra */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-16 grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-6 md:gap-4 items-end">
        <div className="md:pb-24">
          <p className="font-title text-xs font-semibold uppercase tracking-[0.3em] text-white/80 mb-5">
            Il podcast del Centro Steadycam
          </p>
          <h1 className={`${dirt.className} uppercase leading-[0.95] mb-8`} style={{ fontSize: "clamp(2.2rem, 4.6vw, 4.2rem)" }}>
            Addomesticare
            <br />
            gli schermi
          </h1>
          <p className="font-title text-base md:text-lg font-light text-white/90 mb-8">
            Un nuovo episodio ogni settimana.
          </p>
          {showUrl && (
            <a
              href={showUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${dirt.className} inline-block uppercase text-xl px-7 py-3 transition-transform hover:-rotate-2`}
              style={{ background: PINK, color: "#fff" }}
            >
              Ascolta su Spotify
            </a>
          )}
        </div>
        <Image
          src="/podcast/bambina.png"
          alt="Bambina mascherata da supereroina con la bacchetta magica"
          width={1600}
          height={1409}
          priority
          sizes="(min-width: 768px) 55vw, 100vw"
          className="w-full h-auto block"
        />
      </section>

      {intro && (
        <section className="pb-14">
          <p className="max-w-3xl mx-auto px-4 sm:px-6 font-title text-base md:text-lg font-light leading-relaxed whitespace-pre-line text-white/95">
            {intro}
          </p>
        </section>
      )}

      {/* Episodi */}
      <section className="pb-24" style={{ background: GREEN_DARK }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <h2 className={`${dirt.className} uppercase text-4xl md:text-5xl mb-10`}>Episodi</h2>

          {list.length === 0 && <p className="font-title text-white/80">Il primo episodio è in arrivo.</p>}

          <div className="space-y-6">
            {list.map((ep) => {
              const released = new Date(ep.release_at).getTime() <= now;
              const embed = spotifyEmbedUrl(ep.spotify_url) ?? showEmbed;
              return (
                <article
                  key={ep.id}
                  className={`flex flex-col sm:flex-row gap-5 p-5 ${
                    released ? "" : "opacity-40 grayscale pointer-events-none select-none"
                  }`}
                  style={{ background: INK }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ep.cover_url || PODCAST_COVER}
                    alt=""
                    className="w-full sm:w-36 aspect-square object-cover shrink-0 sm:self-start"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-title text-xs font-semibold uppercase tracking-widest mb-2">
                      <span style={{ color: PINK }}>Episodio {ep.number}</span>
                      <span className="text-white/50">
                        {" · "}
                        {released ? formatReleaseDate(ep.release_at) : `Esce il ${formatReleaseDate(ep.release_at)}`}
                      </span>
                    </p>
                    <h3 className={`${dirt.className} uppercase text-2xl md:text-3xl leading-tight mb-3`}>{ep.title}</h3>
                    {ep.description && (
                      <p className="font-title text-sm font-light leading-relaxed text-white/80 whitespace-pre-line mb-4">
                        {ep.description}
                      </p>
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
