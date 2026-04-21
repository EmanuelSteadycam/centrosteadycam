#!/usr/bin/env python3
"""
Estrae programma_riferimento, target, tags, approccio, origine
dai file HTML dell'archivio (pagine/ita/dettaglio_programma*)
e genera SQL di aggiornamento in supabase/update_from_html_*.sql
"""
import os, re, html as htmllib, math

PAGINE_DIR = os.path.dirname(os.path.abspath(__file__)) + "/../pagine/ita"
OUT_DIR    = os.path.dirname(os.path.abspath(__file__)) + "/../supabase"
BATCH_SIZE = 1000  # righe per file SQL

def unescape(s):
    return htmllib.unescape(re.sub(r'<[^>]+>', '', s)).strip()

def extract_repliche(content, label_escaped):
    """Estrae il valore dal blocco repliche con il label indicato."""
    pattern = (
        r'>\s*' + re.escape(label_escaped) + r'[^<]*</b>.*?'
        r'<div class="testorepliche"><p[^>]*>(.*?)</p>'
    )
    m = re.search(pattern, content, re.DOTALL)
    if m:
        val = unescape(m.group(1))
        return val if val else None
    return None

# ── Raccogli file ─────────────────────────────────────────────────────────────
files = sorted([
    f for f in os.listdir(PAGINE_DIR)
    if f.startswith('dettaglio_programma') and 'print=si' not in f
])
print(f"Trovati {len(files)} file (escluse versioni stampabili)\n")

records = {}
errors  = 0

for i, fname in enumerate(files):
    m_id = re.search(r'id=(\d+)', fname)
    if not m_id:
        continue
    record_id = int(m_id.group(1))

    fpath = os.path.join(PAGINE_DIR, fname)
    try:
        with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except Exception:
        errors += 1
        continue

    # programma_riferimento → <font class="verdana12viola">...</font>
    m_prog = re.search(r'<font class="verdana12viola">(.*?)</font>', content)
    programma = unescape(m_prog.group(1)) if m_prog else None

    # target, approccio, origine → blocchi <div class="repliche">
    target    = extract_repliche(content, '&gt; Target:')
    approccio = extract_repliche(content, '&gt; Approccio:')
    origine   = extract_repliche(content, '&gt; Origine:')

    # tags/tematiche → <font class="verdana11nero"> <b>TAG1, TAG2...</b></font>
    m_tags = re.search(
        r'Tematiche:.*?<font class="verdana11nero">\s*<b>(.*?)</b>',
        content, re.DOTALL
    )
    tags = unescape(m_tags.group(1)) if m_tags else None
    # Normalizza: rimuovi spazi attorno alle virgole
    if tags:
        tags = ', '.join(t.strip() for t in tags.split(',') if t.strip())

    records[record_id] = {
        'programma': programma,
        'target':    target,
        'tags':      tags,
        'approccio': approccio,
        'origine':   origine,
    }

    if (i + 1) % 2000 == 0:
        print(f"  [{i+1}/{len(files)}] elaborati...")

print(f"\nElaborazione completata: {len(records)} record, {errors} errori di lettura")
print(f"  programma_riferimento : {sum(1 for r in records.values() if r['programma'])}")
print(f"  target                : {sum(1 for r in records.values() if r['target'])}")
print(f"  tags                  : {sum(1 for r in records.values() if r['tags'])}")
print(f"  approccio             : {sum(1 for r in records.values() if r['approccio'])}")
print(f"  origine               : {sum(1 for r in records.values() if r['origine'])}")

# ── Costruisci righe SQL ───────────────────────────────────────────────────────
def q(s):
    """Escape single quotes per SQL."""
    return s.replace("'", "''")

sql_rows = []
for record_id, data in records.items():
    sets = []
    if data['programma']:
        sets.append(f"programma_riferimento = '{q(data['programma'])}'")
    if data['target']:
        sets.append(f"target = '{q(data['target'])}'")
    if data['tags']:
        sets.append(f"tags = '{q(data['tags'])}'")
    if data['approccio']:
        sets.append(f"approccio = '{q(data['approccio'])}'")
    if data['origine']:
        sets.append(f"origine = '{q(data['origine'])}'")
    if sets:
        sql_rows.append(
            f"UPDATE archivio_items SET {', '.join(sets)} WHERE id_originale = {record_id};"
        )

print(f"\n{len(sql_rows)} istruzioni UPDATE da scrivere")

# ── Scrivi file SQL in batch ───────────────────────────────────────────────────
# Prima: ALTER TABLE per aggiungere colonne mancanti
header = (
    "-- Aggiunge colonne mancanti (se non esistono)\n"
    "ALTER TABLE archivio_items ADD COLUMN IF NOT EXISTS approccio text;\n"
    "ALTER TABLE archivio_items ADD COLUMN IF NOT EXISTS origine text;\n"
)

n_files = math.ceil(len(sql_rows) / BATCH_SIZE)
os.makedirs(OUT_DIR, exist_ok=True)

for file_idx in range(n_files):
    batch = sql_rows[file_idx * BATCH_SIZE : (file_idx + 1) * BATCH_SIZE]
    fname = f"update_from_html_{file_idx + 1:02d}.sql"
    out_path = os.path.join(OUT_DIR, fname)
    with open(out_path, 'w', encoding='utf-8') as f:
        if file_idx == 0:
            f.write(header + "\n")
        f.write('\n'.join(batch) + '\n')
    print(f"  ✓ {fname}  ({len(batch)} istruzioni)")

print(f"\nDone — {n_files} file SQL in supabase/")
print("Esegui i file in ordine nel Supabase SQL Editor.")
