#!/usr/bin/env python3
"""
Aggiorna i record di archivio_items con:
- abstract: usa abstract_operatore dove è più lungo
- ora_inizio, durata, con_testimonianze, con_statistiche
"""
import xlrd, json, urllib.request, urllib.error, os

SUPABASE_URL = "https://zotrurzfsaerabpqgjiq.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHJ1cnpmc2FlcmFicHFnamlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4MDM5NywiZXhwIjoyMDg5MjU2Mzk3fQ.kAEBurUjnpinIsngJIi15-rE2OkL8zxZcxgLNjbr1k0"
XLS_PATH     = os.path.dirname(os.path.abspath(__file__)) + "/../archivio-data/tb_dati_base.xls"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {SERVICE_KEY}",
    "apikey": SERVICE_KEY,
    "Prefer": "return=minimal",
}

def patch(id_originale, data):
    url = f"{SUPABASE_URL}/rest/v1/archivio_items?id_originale=eq.{id_originale}"
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers=HEADERS, method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=15):
            return True
    except urllib.error.HTTPError as e:
        print(f"  ✗ id={id_originale} HTTP {e.code}: {e.read()[:80]}")
        return False
    except Exception as e:
        print(f"  ✗ id={id_originale}: {e}")
        return False

def parse_bool(val):
    v = str(val).strip().lower()
    if v in ("si", "sì", "yes", "1", "1.0"): return True
    if v in ("no", "0", "0.0", ""): return False
    return None

def clean_time(val):
    v = str(val).strip()
    if not v or v == "00:00:00" or v.startswith("0.0"): return None
    # Rimuovi secondi se presenti (HH:MM:SS → HH:MM)
    parts = v.split(":")
    if len(parts) >= 2:
        return f"{parts[0]}:{parts[1]}"
    return v

# ── Leggi XLS ────────────────────────────────────────────────────────────────
print("Lettura XLS...")
wb = xlrd.open_workbook(XLS_PATH)
ws = wb.sheet_by_index(0)

records = {}
for r in range(1, ws.nrows):
    id_orig = int(float(ws.cell_value(r, 0)))
    abstract_short = str(ws.cell_value(r, 24)).strip()
    abstract_op    = str(ws.cell_value(r, 25)).strip()
    ora_inizio     = clean_time(ws.cell_value(r, 9))
    durata         = clean_time(ws.cell_value(r, 11))
    testimonianza  = parse_bool(ws.cell_value(r, 37))
    statistiche    = parse_bool(ws.cell_value(r, 38))

    data = {}

    # Usa abstract_operatore solo se più lungo
    if len(abstract_op) > len(abstract_short):
        data["abstract"] = abstract_op
    elif abstract_op and not abstract_short:
        data["abstract"] = abstract_op

    if ora_inizio:           data["ora_inizio"]        = ora_inizio
    if durata:               data["durata"]             = durata
    if testimonianza is not None: data["con_testimonianze"] = testimonianza
    if statistiche   is not None: data["con_statistiche"]   = statistiche

    if data:
        records[id_orig] = data

print(f"  {len(records)} record da aggiornare")

# ── Aggiorna via API ──────────────────────────────────────────────────────────
items = list(records.items())
total = len(items)
ok = errors = 0

for i, (id_orig, data) in enumerate(items):
    if patch(id_orig, data):
        ok += 1
    else:
        errors += 1
    if (i + 1) % 1000 == 0:
        print(f"  [{i+1}/{total}] ok={ok} err={errors}")

print(f"\n✓ Completato: {ok} aggiornati, {errors} errori su {total}")
