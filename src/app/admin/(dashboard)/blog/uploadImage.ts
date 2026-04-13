"use server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export async function deleteBlogImage(url: string): Promise<void> {
  if (!url.includes("/blog-images/")) return; // non è una nostra immagine
  const fileName = url.split("/blog-images/").pop();
  if (!fileName) return;
  const supabase = createSupabaseAdminClient();
  await supabase.storage.from("blog-images").remove([fileName]);
}

export async function uploadBlogImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "Nessun file" };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) return { error: "Formato non supportato (jpg, png, webp, gif)" };

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(fileName, buffer, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from("blog-images").getPublicUrl(fileName);
  return { url: data.publicUrl };
}
