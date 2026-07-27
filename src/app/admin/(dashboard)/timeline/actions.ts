"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export async function createEntry(year: number, description: string, imageUrl: string | null): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("timeline_entries").insert({ year, description, image_url: imageUrl });
  if (error) return { error: error.message };
  revalidatePath("/storia");
  revalidatePath("/admin/timeline");
  return { error: null };
}

export async function updateEntry(id: string, year: number, description: string, imageUrl: string | null): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("timeline_entries")
    .update({ year, description, image_url: imageUrl, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/storia");
  revalidatePath("/admin/timeline");
  return { error: null };
}

export async function deleteEntry(id: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("timeline_entries").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/storia");
  revalidatePath("/admin/timeline");
  return { error: null };
}
