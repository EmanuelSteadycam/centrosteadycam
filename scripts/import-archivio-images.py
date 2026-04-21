#!/usr/bin/env python3
"""
1. Crea bucket 'archivio' su Supabase Storage
2. Carica le immagini
3. Aggiunge colonna image_url ad archivio_items
4. Collega ogni immagine ai record corrispondenti
"""

import os, re, time, json, urllib.request, urllib.error

SUPABASE_URL = "https://zotrurzfsaerabpqgjiq.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHJ1cnpmc2FlcmFicHFnamlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4MDM5NywiZXhwIjoyMDg5MjU2Mzk3fQ.kAEBurUjnpinIsngJIi15-rE2OkL8zxZcxgLNjbr1k0"
IMG_DIR      = os.path.dirname(os.path.abspath(__file__)) + "/../archivio-data/immagini"
BUCKET       = "archivio"

HEADERS_JSON = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {SERVICE_KEY}",
    "apikey": SERVICE_KEY,
}

def http(method, url, data=None, headers=None, binary=False):
    h = {**HEADERS_JSON, **(headers or {})}
    if binary: h.pop("Content-Type", None)
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

def parse_filename(fname):
    """
    Estrae (tipo, nome_pulito) dal nome file codificato.
    Separatore ꤷ = /
    Ritorna (tipo, stem) dove tipo in: programmi, programmi_riferimento, reti_televisive, altro
    """
    # Estrai la parte src=..ꤷ...&wmax
    m = re.search(r'src=\.\.ꤷ(.+?)&wmax', fname)
    if not m:
        return None, None
    path = m.group(1)  # es: filemanagerꤷprogrammiꤷmꤷMoment09.jpg
    parts = path.split('ꤷ')
    # parts[0] = filemanager, parts[1] = tipo, parts[-2] = lettera, parts[-1] = filename
    if len(parts) < 3:
        return None, None
    tipo = parts[1]  # programmi / programmi_riferimento / reti_televisive / approfondimenti
    filename = parts[-1]  # es: Moment09.jpg
    stem = re.sub(r'\.[^.]+$', '', filename)  # rimuovi estensione
    return tipo, stem

# ── 1. Crea bucket ────────────────────────────────────────────────────────────
print("→ Creazione bucket 'archivio'...")
status, _ = http("POST", f"{SUPABASE_URL}/storage/v1/bucket",
    data=json.dumps({"id": BUCKET, "name": BUCKET, "public": True}).encode())
if status in (200, 201):
    print("  ✓ Bucket creato")
elif status == 409:
    print("  ✓ Bucket già esistente")
else:
    print(f"  ✗ Errore creazione bucket: {status}")

# ── 2. Carica immagini ────────────────────────────────────────────────────────
files = [f for f in os.listdir(IMG_DIR) if not f.startswith('.')]
print(f"\n→ Upload {len(files)} immagini...")

uploaded = {}  # tipo → {stem: public_url}
errors = 0

for i, fname in enumerate(files):
    tipo, stem = parse_filename(fname)
    if not stem:
        continue

    fpath = os.path.join(IMG_DIR, fname)
    with open(fpath, 'rb') as f:
        img_data = f.read()

    # Path nel bucket: tipo/stem.jpeg
    import urllib.parse
    safe_stem = re.sub(r'[^\w\-. ]', '_', stem)
    storage_path = f"{tipo}/{safe_stem}.jpeg"
    encoded_path = urllib.parse.quote(storage_path, safe="/")

    status, resp = http(
        "POST",
        f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{encoded_path}",
        data=img_data,
        headers={"Content-Type": "image/jpeg", "x-upsert": "true"},
        binary=True
    )

    if status in (200, 201):
        url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{storage_path}"
        if tipo not in uploaded:
            uploaded[tipo] = {}
        uploaded[tipo][stem.lower()] = url
        if (i+1) % 100 == 0:
            print(f"  [{i+1}/{len(files)}] ✓")
    else:
        errors += 1

print(f"  ✓ Upload completato — {sum(len(v) for v in uploaded.values())} immagini, {errors} errori")
for tipo, imgs in uploaded.items():
    print(f"     {tipo}: {len(imgs)} immagini")

# ── 3. Aggiungi colonna image_url ─────────────────────────────────────────────
print("\n→ Aggiunta colonna image_url...")

# Usa Management API per ALTER TABLE — se non disponibile, skippa (tabella già aggiornata)
project_ref = "zotrurzfsaerabpqgjiq"
alter_sql = "ALTER TABLE archivio_items ADD COLUMN IF NOT EXISTS image_url text;"
status, resp = http("POST",
    f"https://api.supabase.com/v1/projects/{project_ref}/database/query",
    data=json.dumps({"query": alter_sql}).encode())
if status in (200, 201):
    print("  ✓ Colonna aggiunta")
else:
    print(f"  ⚠ Management API non disponibile ({status}) — aggiungi manualmente in SQL Editor:")
    print(f"    ALTER TABLE archivio_items ADD COLUMN IF NOT EXISTS image_url text;")

# ── 4. Collega immagini ai record ─────────────────────────────────────────────
print("\n→ Collegamento immagini ai record...")

def update_records(filter_field, filter_value, image_url):
    """Aggiorna image_url sui record che matchano filter_field = filter_value."""
    encoded_val = urllib.parse.quote(filter_value) if hasattr(urllib, 'parse') else filter_value
    import urllib.parse
    url = (f"{SUPABASE_URL}/rest/v1/archivio_items"
           f"?{filter_field}=eq.{urllib.parse.quote(filter_value)}"
           f"&image_url=is.null")
    data = json.dumps({"image_url": image_url}).encode()
    headers = {**HEADERS_JSON, "Prefer": "return=minimal"}
    req = urllib.request.Request(url, data=data, headers=headers, method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return True
    except:
        return False

updated = 0

# 4a. Reti televisive → aggiorna per campo 'rete'
if "reti_televisive" in uploaded:
    print("  Canali TV...")
    for stem, url in uploaded["reti_televisive"].items():
        # Il stem è il nome del file es: "Ita1", "RAI3", "Rai3" — proviamo match case-insensitive
        # Fetch tutti i valori rete distinti
        pass  # gestiamo sotto con query diretta

# Strategia alternativa: genera SQL di update e stampalo per l'esecuzione manuale
# dato che ALTER TABLE potrebbe non funzionare via API

print("\n→ Generazione SQL di aggiornamento...")
sql_lines = ["-- Aggiornamento image_url in archivio_items",
             "ALTER TABLE archivio_items ADD COLUMN IF NOT EXISTS image_url text;", ""]

# Reti
if "reti_televisive" in uploaded:
    for stem, url in uploaded["reti_televisive"].items():
        safe_url = url.replace("'", "''")
        safe_stem = stem.replace("'", "''")
        sql_lines.append(
            f"UPDATE archivio_items SET image_url = '{safe_url}' "
            f"WHERE image_url IS NULL AND lower(rete) LIKE lower('%{safe_stem}%');"
        )

# Programmi
if "programmi" in uploaded:
    for stem, url in uploaded["programmi"].items():
        safe_url = url.replace("'", "''")
        safe_stem = stem.replace("'", "''")
        sql_lines.append(
            f"UPDATE archivio_items SET image_url = '{safe_url}' "
            f"WHERE image_url IS NULL AND lower(titolo) LIKE lower('%{safe_stem}%');"
        )

# Programmi riferimento
if "programmi_riferimento" in uploaded:
    for stem, url in uploaded["programmi_riferimento"].items():
        safe_url = url.replace("'", "''")
        safe_stem = stem.replace("'", "''")
        sql_lines.append(
            f"UPDATE archivio_items SET image_url = '{safe_url}' "
            f"WHERE image_url IS NULL AND lower(titolo) LIKE lower('%{safe_stem}%');"
        )

out_path = os.path.dirname(os.path.abspath(__file__)) + "/../supabase/update_archivio_images.sql"
with open(out_path, "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print(f"  ✓ SQL generato: supabase/update_archivio_images.sql")
print(f"     ({len(sql_lines)} istruzioni)")
print(f"\nPasso finale: esegui update_archivio_images.sql nel Supabase SQL Editor")
