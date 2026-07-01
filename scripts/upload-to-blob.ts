import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PUBLIC_DIR = path.join(process.cwd(), "public");

// Tutte le immagini da caricare su Blob con il loro path relativo
const IMAGES: { localPath: string; blobPath: string }[] = [];

function collectFiles(dir: string, basePrefix: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const blobPath = `media/${basePrefix}${entry.name}`;
    if (entry.isDirectory()) {
      collectFiles(fullPath, `${basePrefix}${entry.name}/`);
    } else {
      IMAGES.push({ localPath: fullPath, blobPath });
    }
  }
}

// Immagini root di /public (non le sottocartelle di sistema)
const ROOT_FILES = [
  "01Banner-Centro-Steadycam2.png",
  "Logo_Display21_6x3.5.png",
  "MOOC_iscrizione02.png",
  "Steadycam-SMCR.png",
  "Steadynews03.png",
  "signalhome2.jpg",
];
for (const f of ROOT_FILES) {
  IMAGES.push({ localPath: path.join(PUBLIC_DIR, f), blobPath: `media/${f}` });
}

// Tutto wp-content/uploads/
collectFiles(path.join(PUBLIC_DIR, "wp-content/uploads"), "");

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("BLOB_READ_WRITE_TOKEN mancante in .env.local");
    process.exit(1);
  }

  console.log(`Carico ${IMAGES.length} file su Vercel Blob...\n`);

  let ok = 0;
  let fail = 0;

  for (const { localPath, blobPath } of IMAGES) {
    if (!fs.existsSync(localPath)) {
      console.warn(`SKIP (non trovato): ${localPath}`);
      continue;
    }
    try {
      const fileBuffer = fs.readFileSync(localPath);
      const blob = await put(blobPath, fileBuffer, {
        access: "public",
        addRandomSuffix: false,
        token,
      });
      console.log(`OK  ${blobPath} → ${blob.url}`);
      ok++;
    } catch (err) {
      console.error(`ERR ${blobPath}:`, err);
      fail++;
    }
  }

  console.log(`\nCaricati: ${ok} | Errori: ${fail}`);
}

main();
