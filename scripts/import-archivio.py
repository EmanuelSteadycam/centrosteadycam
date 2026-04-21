#!/usr/bin/env python3
"""
Importa l'archivio Steadycam in Supabase via REST API (PostgREST).
Step 1: crea la tabella manualmente in Supabase SQL Editor (schema_archivio.sql)
Step 2: questo script inserisce tutti i record via REST
"""

import os, time, json
import pandas as pd
import urllib.request, urllib.error

SUPABASE_URL = "https://zotrurzfsaerabpqgjiq.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHJ1cnpmc2FlcmFicHFnamlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4MDM5NywiZXhwIjoyMDg5MjU2Mzk3fQ.kAEBurUjnpinIsngJIi15-rE2OkL8zxZcxgLNjbr1k0"
ENDPOINT     = f"{SUPABASE_URL}/rest/v1/archivio_items"
BASE         = os.path.dirname(os.path.abspath(__file__)) + "/../archivio-data"
BATCH        = 500

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {SERVICE_KEY}",
    "apikey": SERVICE_KEY,
    "Prefer": "resolution=merge-duplicates,return=minimal",
}

def clean(val):
    if val is None: return None
    if hasattr(val, '__float__') and val != val: return None  # NaN
    try:
        import math
        if math.isnan(float(val)): return None
    except: pass
    s = str(val).strip()
    return None if s in ("", "nan", "None", "NaT") else s

def post_batch(records):
    data = json.dumps(records, ensure_ascii=False, default=str).encode("utf-8")
    req = urllib.request.Request(ENDPOINT, data=data, headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return True, r.status
    except urllib.error.HTTPError as e:
        return False, e.read().decode()[:200]
    except Exception as ex:
        return False, str(ex)

if __name__ == "__main__":
    print("Caricamento XLS...")
    natura_df    = pd.read_excel(f"{BASE}/tb_natura.xls",        engine="xlrd")
    rete_df      = pd.read_excel(f"{BASE}/tb_rete.xls",          engine="xlrd")
    produzione_df= pd.read_excel(f"{BASE}/tb_produzione.xls",    engine="xlrd")
    df           = pd.read_excel(f"{BASE}/tb_dati_base.xls",     engine="xlrd")

    natura_map    = dict(zip(natura_df.iloc[:,0].astype(str).str.strip(), natura_df.iloc[:,1].astype(str).str.strip()))
    rete_map      = dict(zip(rete_df.iloc[:,0].astype(str).str.strip(),   rete_df.iloc[:,2].astype(str).str.strip()))
    produzione_map= dict(zip(produzione_df.iloc[:,1].astype(str).str.strip(), produzione_df.iloc[:,2].astype(str).str.strip()))

    print(f"Righe: {len(df)}")

    records = []
    for _, row in df.iterrows():
        data_val = row.get("data")
        try:
            data_str = pd.to_datetime(data_val).strftime("%Y-%m-%d") if not pd.isna(data_val) else None
        except: data_str = None

        anno_raw = clean(row.get("anno"))
        try: anno_int = int(float(anno_raw)) if anno_raw else None
        except: anno_int = None

        importanza = clean(row.get("Importanza"))

        def resolve(val, mapping):
            k = clean(val)
            return mapping.get(k, k) if k else None

        records.append({
            "id_originale":      int(row["ID"]) if not pd.isna(row.get("ID")) else None,
            "titolo":            clean(row.get("programma")),
            "natura":            resolve(row.get("natura"), natura_map),
            "rete":              resolve(row.get("rete"), rete_map),
            "data_trasmissione": data_str,
            "anno":              anno_int,
            "autore":            clean(row.get("autore")),
            "produzione":        resolve(row.get("produzione"), produzione_map),
            "interpreti":        clean(row.get("interpreti")),
            "abstract":          clean(row.get("Abstract")),
            "tags":              clean(row.get("tags")),
            "dvd":               clean(row.get("dvd")),
            "cassetta":          clean(row.get("cassetta")),
            "is_fondamentale":   importanza == "Fondamentale",
            "streaming_url":     clean(row.get("collegamento_streaming")),
        })

    total   = len(records)
    batches = [records[i:i+BATCH] for i in range(0, total, BATCH)]
    print(f"Invio {total} record in {len(batches)} batch da {BATCH}...\n")

    errors = 0
    for i, batch in enumerate(batches):
        ok, msg = post_batch(batch)
        status = "✓" if ok else "✗"
        print(f"  [{i+1:3d}/{len(batches)}] {status}  record {i*BATCH+1}–{min((i+1)*BATCH, total)}"
              + (f"  {msg}" if not ok else ""))
        if not ok: errors += 1
        time.sleep(0.2)

    print(f"\n{'✓ Completato' if errors == 0 else f'⚠ {errors} errori su {len(batches)} batch'}")
    print(f"  Totale record: {total}")
