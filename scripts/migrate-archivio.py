#!/usr/bin/env python3
"""
Migrazione archivio XLS → SQL per Supabase.
Legge i 6 file XLS, risolve FK, genera:
  - supabase/schema_archivio.sql  (CREATE TABLE)
  - supabase/seed_archivio.sql    (INSERT ... VALUES, spezzato in batch da 500)
"""

import pandas as pd
import os, json, re
from datetime import datetime

BASE = os.path.dirname(os.path.abspath(__file__)) + "/../archivio-data"
OUT  = os.path.dirname(os.path.abspath(__file__)) + "/../supabase"

# ── 1. Carica lookup tables ──────────────────────────────────────────────────

natura_df   = pd.read_excel(f"{BASE}/tb_natura.xls",        engine="xlrd")
rete_df     = pd.read_excel(f"{BASE}/tb_rete.xls",          engine="xlrd")
programma_df= pd.read_excel(f"{BASE}/tb_programma.xls",     engine="xlrd")
produzione_df=pd.read_excel(f"{BASE}/tb_produzione.xls",    engine="xlrd")
kw_df       = pd.read_excel(f"{BASE}/tb_parole_chiave.xls", engine="xlrd")

# Build lookup dicts
natura_map    = dict(zip(natura_df.iloc[:,0].astype(str).str.strip(),
                         natura_df.iloc[:,1].astype(str).str.strip()))
rete_map      = dict(zip(rete_df.iloc[:,0].astype(str).str.strip(),
                         rete_df.iloc[:,2].astype(str).str.strip()))
programma_map = dict(zip(programma_df.iloc[:,1].astype(str).str.strip(),
                         programma_df.iloc[:,2].astype(str).str.strip()))
produzione_map= dict(zip(produzione_df.iloc[:,1].astype(str).str.strip(),
                         produzione_df.iloc[:,2].astype(str).str.strip()))

print(f"Lookup: {len(natura_map)} nature, {len(rete_map)} reti, "
      f"{len(programma_map)} programmi, {len(produzione_map)} produzioni")

# ── 2. Carica tabella principale ─────────────────────────────────────────────

df = pd.read_excel(f"{BASE}/tb_dati_base.xls", engine="xlrd")
print(f"Righe totali: {len(df)}")
print(f"Colonne: {list(df.columns)}")

# ── 3. Normalizza e risolvi FK ───────────────────────────────────────────────

def clean(val):
    if pd.isna(val): return None
    s = str(val).strip()
    return None if s in ("", "nan", "None") else s

def resolve(val, mapping):
    k = clean(val)
    if k is None: return None
    return mapping.get(k, k)  # fallback al codice grezzo se non trovato

records = []
for _, row in df.iterrows():
    data_val = row.get("data")
    if pd.isna(data_val):
        data_str = None
    else:
        try:
            data_str = pd.to_datetime(data_val).strftime("%Y-%m-%d")
        except:
            data_str = None

    anno_val = clean(row.get("anno"))
    try:
        anno_int = int(float(anno_val)) if anno_val else None
    except:
        anno_int = None

    importanza_val = clean(row.get("Importanza"))
    is_fondamentale = importanza_val == "Fondamentale" if importanza_val else False

    rec = {
        "id_originale":  int(row["ID"]) if not pd.isna(row.get("ID")) else None,
        "titolo":        clean(row.get("programma")),
        "natura":        resolve(row.get("natura"), natura_map),
        "rete":          resolve(row.get("rete"), rete_map),
        "data_trasmissione": data_str,
        "anno":          anno_int,
        "autore":        clean(row.get("autore")),
        "produzione":    resolve(row.get("produzione"), produzione_map),
        "interpreti":    clean(row.get("interpreti")),
        "abstract":      clean(row.get("Abstract")),
        "tags":          clean(row.get("tags")),
        "dvd":           clean(row.get("dvd")),
        "cassetta":      clean(row.get("cassetta")),
        "is_fondamentale": is_fondamentale,
        "streaming_url": clean(row.get("collegamento_streaming")),
    }
    records.append(rec)

print(f"Record processati: {len(records)}")

# ── 4. Schema SQL ─────────────────────────────────────────────────────────────

schema_sql = """-- Archivio Steadycam — 34.119 schede audiovisive (2000-2013)
-- Generato da scripts/migrate-archivio.py

create table if not exists archivio_items (
  id                  bigserial primary key,
  id_originale        integer unique,
  titolo              text,
  natura              text,          -- tipo contenuto (Film, Documentario, ecc.)
  rete                text,          -- canale TV
  data_trasmissione   date,
  anno                integer,
  autore              text,
  produzione          text,
  interpreti          text,
  abstract            text,
  tags                text,          -- parole chiave separate da virgola
  dvd                 text,
  cassetta            text,
  is_fondamentale     boolean default false,
  streaming_url       text,
  -- full-text search vector (italiano)
  fts tsvector generated always as (
    to_tsvector('italian',
      coalesce(titolo,'') || ' ' ||
      coalesce(abstract,'') || ' ' ||
      coalesce(tags,'') || ' ' ||
      coalesce(autore,'') || ' ' ||
      coalesce(natura,'') || ' ' ||
      coalesce(rete,'')
    )
  ) stored
);

create index if not exists archivio_fts_idx   on archivio_items using gin(fts);
create index if not exists archivio_natura_idx on archivio_items(natura);
create index if not exists archivio_rete_idx   on archivio_items(rete);
create index if not exists archivio_anno_idx   on archivio_items(anno);
create index if not exists archivio_fond_idx   on archivio_items(is_fondamentale);
"""

os.makedirs(OUT, exist_ok=True)
with open(f"{OUT}/schema_archivio.sql", "w", encoding="utf-8") as f:
    f.write(schema_sql)
print("✓ schema_archivio.sql scritto")

# ── 5. Seed SQL (batch da 500) ────────────────────────────────────────────────

def esc(val):
    if val is None: return "NULL"
    if isinstance(val, bool): return "true" if val else "false"
    if isinstance(val, int): return str(val)
    s = str(val).replace("'", "''")
    return f"'{s}'"

BATCH = 500
seed_files = []
for batch_idx, start in enumerate(range(0, len(records), BATCH)):
    chunk = records[start:start+BATCH]
    lines = []
    lines.append("insert into archivio_items "
                 "(id_originale,titolo,natura,rete,data_trasmissione,anno,"
                 "autore,produzione,interpreti,abstract,tags,dvd,cassetta,"
                 "is_fondamentale,streaming_url) values")
    rows = []
    for r in chunk:
        rows.append(
            f"({esc(r['id_originale'])},{esc(r['titolo'])},{esc(r['natura'])},"
            f"{esc(r['rete'])},{esc(r['data_trasmissione'])},{esc(r['anno'])},"
            f"{esc(r['autore'])},{esc(r['produzione'])},{esc(r['interpreti'])},"
            f"{esc(r['abstract'])},{esc(r['tags'])},{esc(r['dvd'])},"
            f"{esc(r['cassetta'])},{esc(r['is_fondamentale'])},{esc(r['streaming_url'])})"
        )
    lines.append(",\n".join(rows) + ";")
    fname = f"{OUT}/seed_archivio_{batch_idx:03d}.sql"
    with open(fname, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    seed_files.append(fname)

print(f"✓ {len(seed_files)} file seed scritti (batch da {BATCH} record)")
print(f"  → {OUT}/seed_archivio_000.sql … seed_archivio_{len(seed_files)-1:03d}.sql")
print("\nFatto. Ora esegui schema_archivio.sql in Supabase SQL Editor,")
print("poi i file seed_archivio_*.sql in ordine.")
