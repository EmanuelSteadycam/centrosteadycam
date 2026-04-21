#!/usr/bin/env python3
"""
Import degli approfondimenti su Supabase.
1. Carica le immagini sul bucket 'approfondimenti' di Supabase Storage
2. Inserisce i record nella tabella 'approfondimenti'

Prerequisito: aver già eseguito scripts/parse-approfondimenti.py
Usage: python3 scripts/import-approfondimenti.py
"""

import os, json, mimetypes, re
from pathlib import Path

# ── Deps ──────────────────────────────────────────────────────────────────────
try:
    from supabase import create_client
except ImportError:
    print("Installo supabase-py…")
    os.system("pip3 install supabase --quiet")
    from supabase import create_client

# ── Config ───────────────────────────────────────────────────────────────────
BASE          = Path(__file__).parent.parent
JSON_PATH     = BASE / "scripts" / "approfondimenti.json"
IMG_CACHE_DIR = BASE / "archivio-data" / "immagini"
BUCKET        = "approfondimenti"

SUPABASE_URL  = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
SERVICE_KEY   = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()

if not SUPABASE_URL or not SERVICE_KEY:
    # Leggi da .env.local
    env_path = BASE / ".env.local"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("NEXT_PUBLIC_SUPABASE_URL="):
                SUPABASE_URL = line.split("=", 1)[1].strip()
            elif line.startswith("SUPABASE_SERVICE_ROLE_KEY="):
                SERVICE_KEY = line.split("=", 1)[1].strip()

if not SUPABASE_URL or not SERVICE_KEY:
    raise SystemExit("Credenziali Supabase non trovate. Controlla .env.local")

supabase = create_client(SUPABASE_URL, SERVICE_KEY)

# ── Carica dati JSON ──────────────────────────────────────────────────────────
with open(JSON_PATH, encoding="utf-8") as f:
    articles = json.load(f)

print(f"Carico {len(articles)} articoli…\n")

# ── 1. Upload immagini ────────────────────────────────────────────────────────
# Assicura che il bucket esista
try:
    supabase.storage.get_bucket(BUCKET)
except Exception:
    supabase.storage.create_bucket(BUCKET, options={"public": True})
    print(f"Bucket '{BUCKET}' creato.")

uploaded: dict[str, str] = {}  # filename → public URL

imgs_to_upload = [a for a in articles if a.get("image_filename")]
print(f"Immagini da caricare: {len(imgs_to_upload)}")

for i, article in enumerate(imgs_to_upload, 1):
    fname = article["image_filename"]
    local_path = IMG_CACHE_DIR / fname

    if not local_path.exists():
        print(f"  [skip] file non trovato: {fname[:60]}")
        continue

    if fname in uploaded:
        continue

    storage_name = f"{article['id_originale']}.jpg"

    try:
        with open(local_path, "rb") as img_file:
            img_data = img_file.read()
        # Rimuovi se esiste già, poi carica
        try:
            supabase.storage.from_(BUCKET).remove([storage_name])
        except Exception:
            pass
        supabase.storage.from_(BUCKET).upload(
            storage_name, img_data, {"content-type": "image/jpeg"}
        )
        url = supabase.storage.from_(BUCKET).get_public_url(storage_name)
        uploaded[fname] = url
        if i % 20 == 0 or i == len(imgs_to_upload):
            print(f"  [{i}/{len(imgs_to_upload)}] caricati…")
    except Exception as e:
        print(f"  [{i}/{len(imgs_to_upload)}] ✗ {storage_name}: {e}")

print(f"\nImmagini caricate: {len(uploaded)}\n")

# ── 2. Insert record ──────────────────────────────────────────────────────────
inserted = 0
skipped  = 0
errors   = 0

for article in articles:
    image_url = None
    if article.get("image_filename") and article["image_filename"] in uploaded:
        image_url = uploaded[article["image_filename"]]

    record = {
        "id_originale":   article["id_originale"],
        "titolo":         article["titolo"] or "Senza titolo",
        "data":           article["data"] or None,
        "estratto":       article["estratto"] or None,
        "contenuto_html": article["contenuto_html"] or None,
        "image_url":      image_url,
        "links":          article["links"] or [],
    }

    try:
        res = supabase.table("approfondimenti").upsert(
            record, on_conflict="id_originale"
        ).execute()
        inserted += 1
    except Exception as e:
        err_str = str(e)
        if "duplicate" in err_str.lower():
            skipped += 1
        else:
            print(f"  ✗ id={article['id_originale']}: {e}")
            errors += 1

print(f"✓ Inseriti: {inserted}")
print(f"  Saltati (già presenti): {skipped}")
print(f"  Errori: {errors}")
