#!/usr/bin/env python3
"""
Genera SQL per impostare image_url con logica di fallback:
  1. immagine specifica del programma (già in image_url)
  2. immagine del programma di riferimento (da HTML)
  3. logo della rete (da tb_rete.xls)
"""
import os, re, html as htmllib, urllib.parse
import pandas as pd

SUPABASE_URL = "https://zotrurzfsaerabpqgjiq.supabase.co"
BUCKET       = "archivio"
PAGINE_DIR   = os.path.dirname(os.path.abspath(__file__)) + "/../pagine/ita"
DATA_DIR     = os.path.dirname(os.path.abspath(__file__)) + "/../archivio-data"
OUT_DIR      = os.path.dirname(os.path.abspath(__file__)) + "/../supabase"

def storage_url(tipo, stem):
    safe = re.sub(r'[^\w\-. ]', '_', stem)
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{tipo}/{safe}.jpeg"

def unescape(s):
    return htmllib.unescape(re.sub(r'<[^>]+>', '', s)).strip()

def q(s):
    return s.replace("'", "''")

# ── 1. Mappa programma_riferimento → image_url dagli HTML ────────────────────
print("Analisi HTML per immagini programma di riferimento...")

prog_image = {}  # programma_name → image_url

files = [f for f in os.listdir(PAGINE_DIR)
         if f.startswith('dettaglio_programma') and 'print=si' not in f]

for fname in files:
    fpath = os.path.join(PAGINE_DIR, fname)
    with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    # Nome programma di riferimento
    m_prog = re.search(r'<font class="verdana12viola">(.*?)</font>', content)
    if not m_prog:
        continue
    prog_name = unescape(m_prog.group(1))
    if not prog_name or prog_name in prog_image:
        continue

    # URL immagine dal tag <img> nella div imgdettaglioguidatv
    m_img = re.search(r'class="imgdettaglioguidatv"[^>]*>.*?<img\s+src="([^"]+)"', content, re.DOTALL)
    if not m_img:
        continue

    src_raw = m_img.group(1)
    # URL-decode (%EA%A4%B7 → ꤷ, ecc.)
    src = urllib.parse.unquote(src_raw)

    # Estrai percorso: src=..ꤷfilemanagerꤷtipoꤷletteraꤷfilename.ext
    m_path = re.search(r'src=\.\.ꤷ(.+?)(?:&|$)', src)
    if not m_path:
        continue

    parts = m_path.group(1).split('ꤷ')
    if len(parts) < 3:
        continue

    tipo     = parts[1]   # programmi_riferimento / reti_televisive / programmi
    filename = parts[-1]  # es: StudioAperto.jpg
    stem     = re.sub(r'\.[^.]+$', '', filename)  # rimuovi estensione

    url = storage_url(tipo, stem)
    prog_image[prog_name] = url

print(f"  {len(prog_image)} programmi di riferimento con immagine")

# ── 2. Mappa rete → image_url da tb_rete.xls ─────────────────────────────────
print("Lettura tb_rete.xls per immagini rete...")

rete_image = {}  # rete_name → image_url

rete_df = pd.read_excel(f"{DATA_DIR}/tb_rete.xls", engine="xlrd")

for _, row in rete_df.iterrows():
    nome = str(row.get("rete", "") or "").strip()
    img  = str(row.get("immagine_rete", "") or "").strip()
    if not nome or not img or img == "nan":
        continue

    # Analoga logica del percorso
    # immagine_rete contiene il percorso dell'immagine nel filemanager
    # es: /filemanager/reti_televisive/r/RAI3.gif
    parts = re.split(r'[/\\]', img)
    if len(parts) < 2:
        continue
    filename = parts[-1]
    stem = re.sub(r'\.[^.]+$', '', filename)
    if not stem or stem == "nan":
        continue

    url = storage_url("reti_televisive", stem)
    rete_image[nome] = url

print(f"  {len(rete_image)} reti con immagine")

# ── 3. Genera SQL ─────────────────────────────────────────────────────────────
print("Generazione SQL fallback immagini...")

sql_lines = ["-- Fallback immagini: programma_riferimento → rete"]

# 3a. Fallback programma_riferimento
sql_lines.append("\n-- Fallback 1: immagine dal programma di riferimento")
count_prog = 0
for prog_name, url in prog_image.items():
    sql_lines.append(
        f"UPDATE archivio_items SET image_url = '{q(url)}'"
        f" WHERE image_url IS NULL AND programma_riferimento = '{q(prog_name)}';"
    )
    count_prog += 1

# 3b. Fallback rete
sql_lines.append("\n-- Fallback 2: logo della rete")
count_rete = 0
for rete_name, url in rete_image.items():
    sql_lines.append(
        f"UPDATE archivio_items SET image_url = '{q(url)}'"
        f" WHERE image_url IS NULL AND rete = '{q(rete_name)}';"
    )
    count_rete += 1

out_path = f"{OUT_DIR}/update_image_fallback.sql"
with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

size = os.path.getsize(out_path)
print(f"\n✓ {out_path} ({size/1024:.0f} KB)")
print(f"  {count_prog} UPDATE per programma di riferimento")
print(f"  {count_rete} UPDATE per rete")
print("\nEsegui update_image_fallback.sql nel Supabase SQL Editor.")
