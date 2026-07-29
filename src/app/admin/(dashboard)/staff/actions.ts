"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export async function createStaff(name: string, role: string, bio: string, photoUrl: string | null, sortOrder: number): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("staff").insert({ name, role, bio, photo_url: photoUrl, sort_order: sortOrder });
  if (error) return { error: error.message };
  revalidatePath("/il-centro");
  revalidatePath("/admin/staff");
  return { error: null };
}

export async function updateStaff(id: string, name: string, role: string, bio: string, photoUrl: string | null, sortOrder: number): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("staff")
    .update({ name, role, bio, photo_url: photoUrl, sort_order: sortOrder, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/il-centro");
  revalidatePath("/admin/staff");
  return { error: null };
}

export async function deleteStaff(id: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/il-centro");
  revalidatePath("/admin/staff");
  return { error: null };
}
