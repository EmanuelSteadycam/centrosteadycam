"use server";
import { put, del } from "@vercel/blob";

export async function uploadBlogFile(formData: FormData): Promise<{ url?: string; name?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "Nessun file" };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const baseName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileName = `${Date.now()}-${baseName}`;
  const BLOB_BASE = "https://ziaarm9b5sovaafa.public.blob.vercel-storage.com";

  await put(`media/blog/allegati/${fileName}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return {
    url: `${BLOB_BASE}/media/blog/allegati/${fileName}`,
    name: file.name,
  };
}

const BLOB_BASE = "https://ziaarm9b5sovaafa.public.blob.vercel-storage.com";

export async function deleteBlogImage(url: string): Promise<void> {
  if (!url.includes("/media/blog/")) return;
  // Converte il path relativo nell'URL Blob completo
  const blobUrl = url.startsWith("http") ? url : `${BLOB_BASE}${url}`;
  try {
    await del(blobUrl);
  } catch {
    // ignora se già cancellato
  }
}

export async function uploadBlogImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "Nessun file" };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "webm"];
  if (!allowed.includes(ext)) return { error: "Formato non supportato" };

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const blob = await put(`media/blog/${fileName}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  // Restituiamo il path relativo → servito via rewrite /media/
  return { url: `/media/blog/${fileName}` };
}
