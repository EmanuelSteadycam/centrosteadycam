#!/usr/bin/env python3
"""
Genera file SQL per aggiornare:
  - abstract (usa abstract_operatore dove è più lungo)
  - ora_inizio, durata (raggruppati per valore)
  - con_testimonianze, con_statistiche (booleani raggruppati)
"""
import xlrd, os, math

XLS_PATH = os.path.dirname(os.path.abspath(__file__)) + "/../archivio-data/tb_dati_base.xls"
OUT_DIR  = os.path.dirname(os.path.abspath(__file__)) + "/../supabase"
ABSTRACT_BATCH = 100

def q(s): return str(s).replace("'", "''")

def clean_time(val):
    v = str(val).strip()
    if not v or v in ("00:00:00", "0.0", ""): return None
    parts = v.split(":")
    if len(parts) >= 2:
        h, m = parts[0].strip(), parts[1].strip()
        if h == "0" and m == "0": return None
        return f"{h}:{m}"
    return None

def parse_bool(val):
    v = str(val).strip().lower()
    if v in ("si", "sì", "yes", "1", "1.0"): return True
    if v in ("no", "0", "0.0"): return False
    return None

print("Lettura XLS...")
wb = xlrd.open_workbook(XLS_PATH)
ws = wb.sheet_by_index(0)

abstracts   = []           # [(id_orig, testo)]
ora_groups  = {}           # {valore: [id_orig, ...]}
dur_groups  = {}           # {valore: [id_orig, ...]}
test_true   = []           # id_orig con testimonianza=True
test_false  = []
stat_true   = []
stat_false  = []

for r in range(1, ws.nrows):
    try:
        id_orig = int(float(ws.cell_value(r, 0)))
    except (ValueError, TypeError):
        print(f"  ⚠ riga {r}: id non valido '{ws.cell_value(r, 0)}', saltata")
        continue
    abstract_short = str(ws.cell_value(r, 24)).strip()
    abstract_op    = str(ws.cell_value(r, 25)).strip()
    ora            = clean_time(ws.cell_value(r, 9))
    dur            = clean_time(ws.cell_value(r, 11))
    test           = parse_bool(ws.cell_value(r, 37))
    stat           = parse_bool(ws.cell_value(r, 38))

    # Abstract solo se operatore è più lungo
    if len(abstract_op) > len(abstract_short):
        abstracts.append((id_orig, abstract_op))
    elif abstract_op and not abstract_short:
        abstracts.append((id_orig, abstract_op))

    if ora: ora_groups.setdefault(ora, []).append(id_orig)
    if dur: dur_groups.setdefault(dur, []).append(id_orig)

    if test is True:  test_true.append(id_orig)
    elif test is False: test_false.append(id_orig)
    if stat is True:  stat_true.append(id_orig)
    elif stat is False: stat_false.append(id_orig)

print(f"  abstract da aggiornare: {len(abstracts)}")
print(f"  ora_inizio valori distinti: {len(ora_groups)}")
print(f"  durata valori distinti: {len(dur_groups)}")
print(f"  con_testimonianze true/false: {len(test_true)}/{len(test_false)}")
print(f"  con_statistiche true/false: {len(stat_true)}/{len(stat_false)}")

os.makedirs(OUT_DIR, exist_ok=True)

# ── Abstract (batch individuali) ──────────────────────────────────────────────
n_files = math.ceil(len(abstracts) / ABSTRACT_BATCH)
for fi in range(n_files):
    batch = abstracts[fi * ABSTRACT_BATCH : (fi+1) * ABSTRACT_BATCH]
    lines = [f"-- Abstract aggiornato ({fi+1}/{n_files})"]
    for id_orig, text in batch:
        lines.append(f"UPDATE archivio_items SET abstract = '{q(text)}' WHERE id_originale = {id_orig};")
    path = f"{OUT_DIR}/update_abstract_{fi+1:02d}.sql"
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"  ✓ update_abstract_{fi+1:02d}.sql  ({len(batch)} righe, {os.path.getsize(path)//1024} KB)")

# ── ora_inizio (raggruppato per valore) ───────────────────────────────────────
lines = ["-- Aggiornamento ora_inizio"]
for val, ids in sorted(ora_groups.items()):
    ids_str = ",".join(str(i) for i in ids)
    lines.append(f"UPDATE archivio_items SET ora_inizio = '{q(val)}' WHERE id_originale IN ({ids_str});")
path = f"{OUT_DIR}/update_ora_inizio.sql"
with open(path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"  ✓ update_ora_inizio.sql  ({len(lines)-1} UPDATE, {os.path.getsize(path)//1024} KB)")

# ── durata (raggruppato per valore) ───────────────────────────────────────────
lines = ["-- Aggiornamento durata"]
for val, ids in sorted(dur_groups.items()):
    ids_str = ",".join(str(i) for i in ids)
    lines.append(f"UPDATE archivio_items SET durata = '{q(val)}' WHERE id_originale IN ({ids_str});")
path = f"{OUT_DIR}/update_durata.sql"
with open(path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"  ✓ update_durata.sql  ({len(lines)-1} UPDATE, {os.path.getsize(path)//1024} KB)")

# ── con_testimonianze ─────────────────────────────────────────────────────────
lines = ["-- Aggiornamento con_testimonianze"]
if test_true:
    lines.append(f"UPDATE archivio_items SET con_testimonianze = true WHERE id_originale IN ({','.join(str(i) for i in test_true)});")
if test_false:
    lines.append(f"UPDATE archivio_items SET con_testimonianze = false WHERE id_originale IN ({','.join(str(i) for i in test_false)});")
path = f"{OUT_DIR}/update_testimonianze.sql"
with open(path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"  ✓ update_testimonianze.sql  ({os.path.getsize(path)//1024} KB)")

# ── con_statistiche ───────────────────────────────────────────────────────────
lines = ["-- Aggiornamento con_statistiche"]
if stat_true:
    lines.append(f"UPDATE archivio_items SET con_statistiche = true WHERE id_originale IN ({','.join(str(i) for i in stat_true)});")
if stat_false:
    lines.append(f"UPDATE archivio_items SET con_statistiche = false WHERE id_originale IN ({','.join(str(i) for i in stat_false)});")
path = f"{OUT_DIR}/update_statistiche.sql"
with open(path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"  ✓ update_statistiche.sql  ({os.path.getsize(path)//1024} KB)")

print("\nDone.")
