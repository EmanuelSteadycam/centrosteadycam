#!/usr/bin/env python3
"""
Aggiorna programma_riferimento, target, tags, approccio, origine
direttamente via Supabase REST API — nessun SQL Editor necessario.
"""
import os, re, html as htmllib, json, urllib.request, urllib.error, time

SUPABASE_URL = "https://zotrurzfsaerabpqgjiq.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHJ1cnpmc2FlcmFicHFnamlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4MDM5NywiZXhwIjoyMDg5MjU2Mzk3fQ.kAEBurUjnpinIsngJIi15-rE2OkL8zxZcxgLNjbr1k0"
PAGINE_DIR   = os.path.dirname(os.path.abspath(__file__)) + "/../pagine/ita"
BATCH_SIZE   = 50   # record per richiesta

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {SERVICE_KEY}",
    "apikey": SERVICE_KEY,
    "Prefer": "return=minimal",
}

def unescape(s):
    return htmllib.unescape(re.sub(r'<[^>]+>', '', s)).strip()

def extract_repliche(content, label):
    pattern = r'>\s*' + re.escape(label) + r'[^<]*</b>.*?<div class="testorepliche"><p[^>]*>(.*?)</p>'
    m = re.search(pattern, content, re.DOTALL)
    return unescape(m.group(1)) if m else None

def patch_record(id_originale, data):
    url = f"{SUPABASE_URL}/rest/v1/archivio_items?id_originale=eq.{id_originale}"
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers=HEADERS, method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return True
    except urllib.error.HTTPError as e:
        print(f"  ✗ id={id_originale} → HTTP {e.code}: {e.read()[:100]}")
        return False
    except Exception as e:
        print(f"  ✗ id={id_originale} → {e}")
        return False

# ── Estrazione dati dagli HTML ────────────────────────────────────────────────
print("Estrazione dati dagli HTML...")
files = sorted([f for f in os.listdir(PAGINE_DIR)
    if f.startswith('dettaglio_programma') and 'print=si' not in f])

records = {}
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

    data = {}
    if programma: data['programma_riferimento'] = programma
    if target:    data['target']                = target
    if tags:      data['tags']                  = tags
    if approccio: data['approccio']             = approccio
    if origine:   data['origine']               = origine

    if data:
        records[rid] = data

print(f"  {len(records)} record da aggiornare\n")

# ── Aggiornamento via API ─────────────────────────────────────────────────────
items = list(records.items())
total = len(items)
ok = 0
errors = 0

for i, (rid, data) in enumerate(items):
    if patch_record(rid, data):
        ok += 1
    else:
        errors += 1

    if (i + 1) % 500 == 0:
        print(f"  [{i+1}/{total}] ok={ok} err={errors}")

print(f"\n✓ Completato: {ok} aggiornati, {errors} errori su {total} record")
