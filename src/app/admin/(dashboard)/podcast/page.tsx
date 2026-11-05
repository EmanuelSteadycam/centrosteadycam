import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { PODCAST_PATH, type PodcastEpisode } from "@/lib/podcast";
import EpisodeForm from "./EpisodeForm";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminPodcastPage() {
  const supabase = createSupabaseAdminClient();
  const [{ data: episodes, error }, { data: settings }] = await Promise.all([
    supabase
      .from("podcast_episodes")
      .select("id, number, title, description, cover_url, release_at, spotify_url")
      .order("number", { ascending: true }),
    supabase.from("podcast_settings").select("key, value"),
  ]);

  const list = (episodes ?? []) as PodcastEpisode[];
  const setting = (key: string) => settings?.find((s) => s.key === key)?.value ?? "";
  const last = list[list.length - 1];
  const nextNumber = last ? last.number + 1 : 1;
  // Uscita settimanale: il prossimo episodio parte 7 giorni dopo l'ultimo
  const nextRelease = last
    ? new Date(new Date(last.release_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    : new Date().toISOString();
  const now = Date.now();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Podcast — Addomesticare gli schermi</h1>
        <a href={PODCAST_PATH} target="_blank" className="text-xs text-gray-400 hover:text-gray-600">
          Vedi pagina ↗
        </a>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
          Errore: {error.message}. La tabella &ldquo;podcast_episodes&rdquo; esiste su Supabase? (supabase/schema_podcast.sql)
        </div>
      )}

      <SettingsForm showUrl={setting("spotify_show_url")} intro={setting("intro")} />

      <div className="bg-white rounded-lg shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-gray-700 px-5 pt-4">Aggiungi episodio</h2>
        <EpisodeForm mode="create" nextNumber={nextNumber} nextRelease={nextRelease} />
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Episodi</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Prima della data di uscita l&apos;episodio appare in anteprima opacizzata e non ascoltabile; dalla data in poi si attiva da solo.
            Quando esce su Spotify incolla il link dell&apos;episodio: finché manca, la pagina mostra il player dello show.
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {list.length === 0 && <p className="px-5 py-4 text-sm text-gray-400">Nessun episodio inserito.</p>}
          {list.map((ep) => {
            const released = new Date(ep.release_at).getTime() <= now;
            return (
              <div key={ep.id}>
                <p className="px-5 pt-3 text-[11px] uppercase tracking-wide">
                  {released
                    ? ep.spotify_url
                      ? <span className="text-green-600">Online</span>
                      : <span className="text-amber-600">Uscito — manca il link Spotify</span>
                    : <span className="text-gray-400">In anteprima</span>}
                </p>
                <EpisodeForm mode="edit" episode={ep} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
