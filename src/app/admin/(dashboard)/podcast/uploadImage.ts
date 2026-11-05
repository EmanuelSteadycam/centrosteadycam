"use server";
import { put } from "@vercel/blob";

export async function uploadPodcastImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "Nessun file" };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) return { error: "Formato non supportato" };

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  await put(`media/podcast/${fileName}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return { url: `/media/podcast/${fileName}` };
}
