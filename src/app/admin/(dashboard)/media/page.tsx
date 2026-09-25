import { list } from "@vercel/blob";
import MediaLibrary from "./MediaLibrary";

export const dynamic = "force-dynamic";

export type MediaFile = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
};

const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"];
const VIDEO_EXTS = ["mp4", "mov", "webm", "avi", "mkv"];

function extOf(pathname: string) {
  return (pathname.split(".").pop() || "").toLowerCase();
}

async function getAllBlobs(): Promise<MediaFile[]> {
  const all: MediaFile[] = [];
  let cursor: string | undefined;
  do {
    const res = await list({ prefix: "media/", cursor, limit: 1000 });
    for (const b of res.blobs) {
      all.push({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt.toString() });
    }
    cursor = res.cursor;
  } while (cursor);
  return all.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export default async function MediaPage() {
  const files = await getAllBlobs();

  const images = files.filter((f) => IMAGE_EXTS.includes(extOf(f.pathname)));
  const videos = files.filter((f) => VIDEO_EXTS.includes(extOf(f.pathname)));
  const documents = files.filter((f) => !IMAGE_EXTS.includes(extOf(f.pathname)) && !VIDEO_EXTS.includes(extOf(f.pathname)));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Media</h1>
        <p className="text-xs text-gray-400 mt-1">
          Tutti i file caricati sul sito ({files.length} totali) — immagini, documenti, video.
        </p>
      </div>

      <MediaLibrary images={images} documents={documents} videos={videos} />
    </div>
  );
}
