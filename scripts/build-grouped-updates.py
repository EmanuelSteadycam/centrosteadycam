#!/usr/bin/env python3
"""
Genera SQL compatti raggruppando per valore:
  - update_grouped_programma.sql  (840 UPDATE, ~1 per programma)
  - update_grouped_target.sql     (8 UPDATE)
  - update_grouped_approccio.sql  (~20 UPDATE)
  - update_grouped_origine.sql    (~20 UPDATE)
  - update_grouped_tags_NN.sql    (tag individuali, file da 2000 righe)
"""
import os, re, html as htmllib, math

PAGINE_DIR = os.path.dirname(os.path.abspath(__file__)) + "/../pagine/ita"
OUT_DIR    = os.path.dirname(os.path.abspath(__file__)) + "/../supabase"
TAGS_BATCH = 2000

def unescape(s):
    return htmllib.unescape(re.sub(r'<[^>]+>', '', s)).strip()

def extract_repliche(content, label):
    pattern = r'>\s*' + re.escape(label) + r'[^<]*</b>.*?<div class="testorepliche"><p[^>]*>(.*?)</p>'
    m = re.search(pattern, content, re.DOTALL)
    return unescape(m.group(1)) if m else None

def q(s): return s.replace("'", "''")

# ── Estrazione ────────────────────────────────────────────────────────────────
print("Estrazione dati HTML...")
files = sorted([f for f in os.listdir(PAGINE_DIR)
    if f.startswith('dettaglio_programma') and 'print=si' not in f])

# groups[field][value] = [id1, id2, ...]
groups = { 'programma': {}, 'target': {}, 'approccio': {}, 'origine': {} }
tags_rows = []  # [(id_originale, tags), ...]

for fname in files:
    m_id = re.search(r'id=(\d+)', fname)
    if not m_id: continue
    rid = int(m_id.group(1))

    with open(os.path.join(PAGINE_DIR, fname), 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    m_prog = re.search(r'<font class="verdana12viola">(.*?)</font>', content)
    programma = unescape(m_prog.group(1)) if m_prog else None
    target    = extract_repliche(content, '&gt; Target:')
    approccio = extract_repliche(content, '&gt; Approccio:')
    origine   = extract_repliche(content, '&gt; Origine:')

    m_tags = re.search(r'Tematiche:.*?<font class="verdana11nero">\s*<b>(.*?)</b>', content, re.DOTALL)
    tags = None
    if m_tags:
        tags = ', '.join(t.strip() for t in unescape(m_tags.group(1)).split(',') if t.strip())

    for field, val in [('programma', programma), ('target', target),
                       ('approccio', approccio), ('origine', origine)]:
        if val:
            groups[field].setdefault(val, []).append(rid)

    if tags:
        tags_rows.append((rid, tags))

print(f"  programma: {len(groups['programma'])} valori distinti")
print(f"  target:    {len(groups['target'])} valori distinti")
print(f"  approccio: {len(groups['approccio'])} valori distinti")
print(f"  origine:   {len(groups['origine'])} valori distinti")
print(f"  tags:      {len(tags_rows)} record")

os.makedirs(OUT_DIR, exist_ok=True)

# ── Funzione per file raggruppati ─────────────────────────────────────────────
def write_grouped(field, db_col, filename):
    lines = [f"-- Aggiornamento {db_col} (raggruppato per valore)"]
    for val, ids in sorted(groups[field].items(), key=lambda x: x[0].lower()):
        ids_str = ','.join(str(i) for i in ids)
        lines.append(
            f"UPDATE archivio_items SET {db_col} = '{q(val)}'"
            f" WHERE id_originale IN ({ids_str});"
        )
    path = f"{OUT_DIR}/{filename}"
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    size = os.path.getsize(path)
    print(f"  ✓ {filename}  ({len(lines)-1} UPDATE, {size/1024:.0f} KB)")

# ── File raggruppati ──────────────────────────────────────────────────────────
print("\nGenerazione file SQL raggruppati...")
write_grouped('programma', 'programma_riferimento', 'update_grouped_programma.sql')
write_grouped('target',    'target',                'update_grouped_target.sql')
write_grouped('approccio', 'approccio',             'update_grouped_approccio.sql')
write_grouped('origine',   'origine',               'update_grouped_origine.sql')

# ── Tags (individuali, batch da 2000) ─────────────────────────────────────────
print("\nGenerazione file tags...")
n_files = math.ceil(len(tags_rows) / TAGS_BATCH)
for fi in range(n_files):
    batch = tags_rows[fi * TAGS_BATCH : (fi+1) * TAGS_BATCH]
    lines = [f"-- Tags batch {fi+1}/{n_files}"]
    for rid, tags in batch:
        lines.append(f"UPDATE archivio_items SET tags = '{q(tags)}' WHERE id_originale = {rid};")
    path = f"{OUT_DIR}/update_grouped_tags_{fi+1:02d}.sql"
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    size = os.path.getsize(path)
    print(f"  ✓ update_grouped_tags_{fi+1:02d}.sql  ({len(batch)} righe, {size/1024:.0f} KB)")

print(f"\nDone. File da eseguire in Supabase SQL Editor:")
print(f"  1. update_grouped_programma.sql")
print(f"  2. update_grouped_target.sql")
print(f"  3. update_grouped_approccio.sql")
print(f"  4. update_grouped_origine.sql")
print(f"  5-{4+n_files}. update_grouped_tags_NN.sql")
