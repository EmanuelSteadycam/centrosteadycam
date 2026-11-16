"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { PODCAST_PATH } from "@/lib/podcast";

export type EpisodeInput = {
  number: number;
  title: string;
  description: string;
  coverUrl: string | null;
  releaseAt: string;
  spotifyUrl: string | null;
};

function toRow(e: EpisodeInput) {
  return {
    number: e.number,
    title: e.title,
    description: e.description,
    cover_url: e.coverUrl,
    release_at: e.releaseAt,
    spotify_url: e.spotifyUrl,
  };
}

function revalidate() {
  revalidatePath(PODCAST_PATH);
  revalidatePath("/admin/podcast");
}

export async function createEpisode(e: EpisodeInput): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("podcast_episodes").insert(toRow(e));
  if (error) return { error: error.message };
  revalidate();
  return { error: null };
}

export async function updateEpisode(id: string, e: EpisodeInput): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("podcast_episodes")
    .update({ ...toRow(e), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return { error: null };
}

export async function deleteEpisode(id: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("podcast_episodes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return { error: null };
}

export async function updatePodcastSettings(settings: Record<string, string>): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from("podcast_settings").upsert(rows);
  if (error) return { error: error.message };
  revalidate();
  return { error: null };
}

// ── Le vostre storie ──────────────────────────────────────────────────────────
export async function setStoryStatus(id: string, status: "approved" | "rejected" | "pending"): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("podcast_stories").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return { error: null };
}

// Risposta del Centro Steadycam: pubblicata subito
export async function addStaffStoryReply(storyId: string, testo: string): Promise<{ error: string | null }> {
  const text = testo.trim();
  if (!text) return { error: "La risposta è vuota" };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("podcast_stories").insert({
    parent_id: storyId,
    nome: "Centro Steadycam",
    testo: text,
    status: "approved",
    is_staff: true,
  });
  if (error) return { error: error.message };
  revalidate();
  return { error: null };
}

// Elimina una storia (con tutte le sue risposte, on delete cascade) o una singola risposta
export async function deleteStoryPost(id: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("podcast_stories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return { error: null };
}
