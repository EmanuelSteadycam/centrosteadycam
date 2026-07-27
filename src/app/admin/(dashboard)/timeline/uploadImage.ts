"use server";
import { put, del } from "@vercel/blob";

export async function uploadTimelineImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "Nessun file" };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) return { error: "Formato non supportato" };

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  await put(`media/timeline/${fileName}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return { url: `/media/timeline/${fileName}` };
}

export async function deleteTimelineImage(url: string): Promise<void> {
  if (!url.includes("/media/timeline/")) return;
  const BLOB_BASE = "https://ziaarm9b5sovaafa.public.blob.vercel-storage.com";
  const blobUrl = url.startsWith("http") ? url : `${BLOB_BASE}${url}`;
  try {
    await del(blobUrl);
  } catch {
    // ignora se già cancellato
  }
}
