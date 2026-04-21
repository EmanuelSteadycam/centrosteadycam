#!/usr/bin/env python3
"""
Genera supabase/update_archivio_extra_fields.sql con:
- ALTER TABLE per aggiungere colonne target, programma_riferimento, is_sequenza
- UPDATE batch per target (8 istruzioni)
- UPDATE batch per programma_riferimento (≤1277 istruzioni)
- UPDATE batch per is_sequenza (2 istruzioni)
"""
import os, re
import pandas as pd

BASE = os.path.dirname(os.path.abspath(__file__)) + "/../archivio-data"
OUT  = os.path.dirname(os.path.abspath(__file__)) + "/../supabase"

TARGET_MAP = {
    1: "Adolescenti",
    2: "Adolescenti e giovani",
    3: "Adulti",
    4: "Bambini",
    5: "Bambini e adolescenti",
    6: "Giovani",
    7: "Giovani e adulti",
    8: "Tutti",
}

print("Caricamento dati...")
df    = pd.read_excel(f"{BASE}/tb_dati_base.xls", engine="xlrd")
prog  = pd.read_excel(f"{BASE}/tb_programma.xls",  engine="xlrd")

# Mappa id_programma → nome programma
prog_map = {}
for _, row in prog.iterrows():
    key = str(row["id_programma"]).strip().zfill(5)
    prog_map[key] = str(row["programma"]).strip()

print(f"  {len(df)} record, {len(prog_map)} programmi di riferimento")

sql = [
    "-- Nuovi campi archivio: target, programma_riferimento, is_sequenza",
    "ALTER TABLE archivio_items ADD COLUMN IF NOT EXISTS target text;",
    "ALTER TABLE archivio_items ADD COLUMN IF NOT EXISTS programma_riferimento text;",
    "ALTER TABLE archivio_items ADD COLUMN IF NOT EXISTS is_sequenza boolean DEFAULT false;",
    "",
]

# ── Target ────────────────────────────────────────────────────────────────────
sql.append("-- Target")
for code, label in TARGET_MAP.items():
    ids = df[df["target"] == float(code)]["ID"].dropna().astype(int).tolist()
    if ids:
        ids_str = ",".join(str(i) for i in ids)
        sql.append(
            f"UPDATE archivio_items SET target = '{label}'"
            f" WHERE id_originale IN ({ids_str});"
        )
print(f"  Target: {sum(1 for c in TARGET_MAP if not df[df['target']==float(c)].empty)} istruzioni")

# ── Programma di riferimento ──────────────────────────────────────────────────
sql.append("")
sql.append("-- Programma di riferimento")

# Raggruppa per valore del campo (dopo risoluzione FK)
groups: dict[str, list[int]] = {}
for _, row in df.iterrows():
    raw = row.get("programma_riferimento")
    try:
        if pd.isna(raw): continue
    except: pass
    key = str(raw).strip().zfill(5)
    name = prog_map.get(key)
    if not name or name in ("nan", ""): continue
    oid = row.get("ID")
    try:
        if pd.isna(oid): continue
        oid = int(oid)
    except: continue
    if name not in groups:
        groups[name] = []
    groups[name].append(oid)

for name, ids in groups.items():
    safe_name = name.replace("'", "''")
    ids_str   = ",".join(str(i) for i in ids)
    sql.append(
        f"UPDATE archivio_items SET programma_riferimento = '{safe_name}'"
        f" WHERE id_originale IN ({ids_str});"
    )
print(f"  Programma di riferimento: {len(groups)} istruzioni")

# ── is_sequenza ───────────────────────────────────────────────────────────────
sql.append("")
sql.append("-- is_sequenza")
seq_ids = df[df["is_sequenza"] == "si"]["ID"].dropna().astype(int).tolist()
if seq_ids:
    sql.append(
        f"UPDATE archivio_items SET is_sequenza = true"
        f" WHERE id_originale IN ({','.join(str(i) for i in seq_ids)});"
    )
print(f"  is_sequenza: {len(seq_ids)} record contrassegnati")

# ── Scrivi file ───────────────────────────────────────────────────────────────
os.makedirs(OUT, exist_ok=True)
out_path = f"{OUT}/update_archivio_extra_fields.sql"
with open(out_path, "w", encoding="utf-8") as f:
    f.write("\n".join(sql))

print(f"\n✓ SQL generato: supabase/update_archivio_extra_fields.sql")
print(f"  ({len(sql)} righe totali)")
print("\nEsegui update_archivio_extra_fields.sql nel Supabase SQL Editor")
