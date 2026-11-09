import type { Metadata } from "next";
import Image from "next/image";
import localFont from "next/font/local";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { syncSpotifyLinks } from "@/lib/podcast-sync";
import { spotifyEmbedUrl, formatReleaseDate, PODCAST_COVER, type PodcastEpisode } from "@/lib/podcast";

// Boxpot Amateur (Nick Polifroni, dafont "100% Free"): lo stesso font del titolo in copertina.
// Spaziature dal file grafico: interlinea 260,48/274,63 ≈ 0.95, tracking 80 = 0.08em
const dirt = localFont({ src: "./fonts/boxpot.ttf", display: "swap" });

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

  const setting = (key: string): string => settings?.find((s) => s.key === key)?.value ?? "";
  const showUrl = setting("spotify_show_url");
  const { episodes: list, trailerUrl } = await syncSpotifyLinks(
    (episodes ?? []) as PodcastEpisode[],
    showUrl,
    setting("trailer_url")
  );
  const trailerEmbed = spotifyEmbedUrl(trailerUrl);
  const introParagraphs = setting("intro").split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const showEmbed = spotifyEmbedUrl(showUrl);
  const now = Date.now();

  return (
    <div className="min-h-screen pt-14 text-white" style={{ background: GREEN }}>
      {/* Hero — titolo a sinistra, bambina scontornata appoggiata sul fondo a destra */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-16 grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-6 md:gap-4 items-end">
        <div className="md:self-stretch flex flex-col">
          <div className="md:my-auto">
            <p className="font-title text-xs font-semibold uppercase tracking-[0.3em] text-white/80 mb-5">
              Il podcast del Centro Steadycam
            </p>
            <h1 className={`${dirt.className} uppercase leading-[0.95] tracking-[0.08em] mb-8`} style={{ fontSize: "clamp(2.2rem, 4.6vw, 4.2rem)" }}>
              Addomesticare
              <br />
              gli schermi
            </h1>
            <p className="font-title text-base md:text-lg font-light text-white/90 mb-8">
              Un nuovo episodio ogni settimana
            </p>
            {/* Pulsante Spotify e, sulla stessa riga, le icone delle altre piattaforme */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {showUrl && (
                <a
                  href={showUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-title font-semibold inline-flex items-center gap-2.5 rounded-lg uppercase tracking-widest text-sm px-7 py-3.5 transition-transform hover:-rotate-2"
                  style={{ background: PINK, color: "#fff" }}
                >
                  <SpotifyLogo size={26} />
                  Ascolta su Spotify
                </a>
              )}
              <div className="flex items-center gap-2">
                {OTHER_PLATFORMS.filter((p) => p.url).map((p) => (
                  <a
                    key={p.name}
                    href={p.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ascolta su ${p.name}`}
                    title={p.name}
                    className="flex items-center justify-center rounded-lg border border-white/60 h-[48px] w-[48px] transition-transform hover:-rotate-6 hover:border-white"
                  >
                    <Image src={p.icon} alt="" width={28} height={28} unoptimized className="h-7 w-7 invert" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          {/* Loghi istituzionali (file unico fornito dalla grafica), sulla riga su cui poggia la bambina */}
          <Image
            src="/podcast/loghi/loghi-v2.png"
            alt="Un podcast realizzato da ASL CN2 e Minimadigitalia, nell'ambito di Wellgranda – Reti di Welfare, con il supporto di Fondazione CRC"
            width={2345}
            height={413}
            className="hidden md:block mt-10 mb-2 w-full max-w-[540px] h-auto"
          />
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
        {/* Su mobile i loghi vanno sotto la bambina */}
        <Image
          src="/podcast/loghi/loghi-v2.png"
          alt="Un podcast realizzato da ASL CN2 e Minimadigitalia, nell'ambito di Wellgranda – Reti di Welfare, con il supporto di Fondazione CRC"
          width={2345}
          height={413}
          className="md:hidden mt-2 mb-10 w-full max-w-[460px] h-auto"
        />
      </section>

      {/* Trailer — subito dopo l'hero; compare solo quando c'è il link (inserito a mano o trovato su Spotify) */}
      {trailerEmbed && (
        <section className="border-t border-white/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-12 items-center">
            <h2 className={`${dirt.className} uppercase text-4xl md:text-5xl leading-[0.95] tracking-[0.08em]`}>Trailer</h2>
            <iframe
              src={trailerEmbed}
              title="Trailer di Addomesticare gli schermi"
              width="100%"
              height="152"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="rounded-xl border-0 max-w-3xl"
            />
          </div>
        </section>
      )}

      {/* Presentazione — il primo paragrafo fa da attacco, gli altri (autori, ospiti, crediti) più piccoli */}
      {introParagraphs.length > 0 && (
        <section className="border-t border-white/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-12">
            <h2 className={`${dirt.className} uppercase text-4xl md:text-5xl leading-[0.95] tracking-[0.08em] md:-rotate-2 md:origin-top-left`}>
              Il podcast
            </h2>
            <div className="space-y-5 max-w-3xl">
              {introParagraphs.map((par, i) => (
                <p
                  key={i}
                  className={`font-title leading-relaxed ${
                    i === 0 ? "text-lg md:text-xl font-normal text-white" : "text-base font-light text-white/85"
                  }`}
                >
                  <RichText text={par} />
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Episodi */}
      <section className="pb-24" style={{ background: GREEN_DARK }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <h2 className={`${dirt.className} uppercase text-4xl md:text-5xl leading-[0.95] tracking-[0.08em] mb-10`}>Episodi</h2>

          {list.length === 0 && <p className="font-title text-white/80">Il primo episodio è in arrivo.</p>}

          <div className="space-y-6">
            {list.map((ep) => {
              const released = new Date(ep.release_at).getTime() <= now;
              const embed = spotifyEmbedUrl(ep.spotify_url) ?? showEmbed;
              // Uscita → player Spotify vero; altrimenti la sua ricostruzione grafica, così le schede si somigliano tutte
              const player = released ? embed : null;
              return (
                <article
                  key={ep.id}
                  className={`p-5 rounded-2xl ${released ? "" : "pointer-events-none select-none"}`}
                  style={{ background: INK }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-title text-xs font-semibold uppercase tracking-widest mb-2">
                      <span style={{ color: PINK }}>Episodio {ep.number}</span>
                      <span className="text-white">
                        {" · "}
                        {released ? formatReleaseDate(ep.release_at) : `Esce il ${formatReleaseDate(ep.release_at)}`}
                      </span>
                    </p>
                    {/* Puntata futura: resta ben leggibile solo la riga "Episodio N · Esce il …", il resto è opacizzato */}
                    <div className={released ? "" : "opacity-40"}>
                      <h3 className="font-title font-bold uppercase text-xl md:text-2xl leading-snug mb-3">{ep.title}</h3>
                      {player ? (
                        <iframe
                          src={player}
                          title={`Episodio ${ep.number} — ${ep.title}`}
                          width="100%"
                          height="152"
                          loading="lazy"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          className="rounded-xl border-0 mb-4 ring-1 ring-white/20"
                        />
                      ) : (
                        <PlayerPreview title={ep.title} cover={ep.cover_url || PODCAST_COVER} />
                      )}
                      {ep.description && (
                        <p className="font-title text-sm font-light leading-relaxed text-white/80 whitespace-pre-line">
                          <RichText text={ep.description} />
                        </p>
                      )}
                    </div>
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

// Altre piattaforme dove esce il podcast (url null = non ancora disponibile, icona nascosta)
const OTHER_PLATFORMS: { name: string; url: string | null; icon: string }[] = [
  { name: "Apple Podcasts", url: "https://podcasts.apple.com/it/podcast/addomesticare-gli-schermi/id6832362072", icon: "/podcast/piattaforme/applepodcasts.svg" },
  { name: "Pocket Casts", url: "https://pocketcasts.com/podcast/addomesticare-gli-schermi/93fd5860-bdf0-013f-55d8-0affcb2f3ff3", icon: "/podcast/piattaforme/pocketcasts.svg" },
  { name: "Amazon Music", url: "https://music.amazon.it/podcasts/d5e2e0a9-46a6-4bc6-967c-bd9555dc00ad/addomesticare-gli-schermi", icon: "/podcast/piattaforme/amazonmusic.svg" },
];

// Ricostruzione solo grafica del player embed di Spotify (152px, tema scuro theme=0: sfondo #1F1F1F, testi secondari #B3B3B3)
function PlayerPreview({ title, cover }: { title: string; cover: string }) {
  return (
    <div
      aria-hidden
      className="relative h-[152px] rounded-xl ring-1 ring-white/20 mb-4 p-3 flex gap-3 overflow-hidden"
      style={{ background: "#1F1F1F" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cover} alt="" className="h-full aspect-square object-cover rounded-lg shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col pt-1">
        <p className="font-title font-bold text-white text-[15px] leading-tight truncate pr-8">{title}</p>
        <p className="font-title text-[#B3B3B3] text-xs mt-1 truncate">Addomesticare gli schermi</p>
        <div className="mt-auto flex items-center gap-3 pb-1">
          <div className="flex-1 h-1 rounded-full bg-white/30" />
          <span className="font-title text-[#B3B3B3] text-xs">--:--</span>
          <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill={INK}><path d="M3 1.5v9l7.5-4.5z" /></svg>
          </span>
        </div>
      </div>
      <SpotifyLogo className="absolute top-3 right-3" size={22} />
    </div>
  );
}

function SpotifyLogo({ size, className }: { size: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0a12 12 0 100 24 12 12 0 000-24zm5.5 17.3a.75.75 0 01-1 .25c-2.85-1.74-6.44-2.13-10.67-1.17a.75.75 0 11-.33-1.46c4.63-1.06 8.6-.6 11.75 1.33.36.22.47.69.25 1.05zm1.47-3.27a.94.94 0 01-1.29.31c-3.26-2-8.23-2.59-12.08-1.42a.94.94 0 11-.55-1.8c4.4-1.33 9.87-.69 13.6 1.6.44.27.58.85.31 1.3zm.13-3.4C15.18 8.3 8.73 8.08 5 9.22a1.13 1.13 0 11-.66-2.16c4.28-1.3 11.4-1.05 15.9 1.62a1.13 1.13 0 01-1.15 1.95z" />
    </svg>
  );
}

// Testi scritti in admin: **parola** diventa semibold (Montserrat 600)
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
          <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      )}
    </>
  );
}
