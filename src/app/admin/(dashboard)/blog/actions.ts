"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { BLOG_CATEGORY_ID } from "@/lib/blog";

type PostData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  status: string;
  date: string;
};

export async function createPost(data: PostData): Promise<{ error: string | null; id?: number }> {
  const supabase = createSupabaseAdminClient();
  const { data: row, error } = await supabase
    .from("posts")
    .insert({
      type: "post",
      categories: [BLOG_CATEGORY_ID],
      tags: [],
      ...data,
      featured_image_url: data.featured_image_url || null,
      date: data.date || new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { error: null, id: row.id };
}

export async function updatePost(id: number, data: PostData): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("posts")
    .update({
      ...data,
      featured_image_url: data.featured_image_url || null,
      modified: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/admin/blog");
  return { error: null };
}

export async function deletePost(id: number, slug: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  return { error: null };
}

export async function togglePostStatus(id: number, slug: string, currentStatus: string): Promise<{ error: string | null }> {
  const newStatus = currentStatus === "publish" ? "draft" : "publish";
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("posts").update({ status: newStatus }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  return { error: null };
}
