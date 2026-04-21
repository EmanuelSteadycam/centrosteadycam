#!/usr/bin/env python3
"""
Estrae tutti gli approfondimenti dagli HTML offline.
- Date e titoli: dai file approfondimenti_elenco.lasso?-p=N.html (p=1..21) + c=001, c=002
- Contenuto + immagini + link: dai file approfondimenti_dettaglio.lasso?id=N.html
Output: scripts/approfondimenti.json
"""

import os, re, json
from urllib.parse import unquote
from bs4 import BeautifulSoup

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGINE = os.path.join(BASE, "pagine", "ita")
IMG_CACHE = os.path.join(BASE, "archivio-data", "immagini")
OUT = os.path.join(BASE, "scripts", "approfondimenti.json")

# Carattere speciale usato come separatore di path nelle immagini cachate
SEP = "ꤷ"   # U+A937

# ── 1. Leggi le pagine elenco per: id → {titolo, data, estratto} ──────────────

elenco_files = []
for i in range(1, 22):
    elenco_files.append(f"approfondimenti_elenco.lasso﹖-p={i}.html")
elenco_files += [
    "approfondimenti_elenco.lasso﹖c=001.html",
    "approfondimenti_elenco.lasso﹖c=002.html",
]

meta: dict[int, dict] = {}  # id → {titolo, data, estratto}

for fname in elenco_files:
    path = os.path.join(PAGINE, fname)
    if not os.path.exists(path):
        print(f"  [skip] {fname}")
        continue
    with open(path, encoding="utf-8", errors="replace") as f:
        soup = BeautifulSoup(f, "lxml")

    for div in soup.select("div.risultatiricerca"):
        # titolo + id dal primo link
        link = div.select_one("p.verdana12fucsia a")
        if not link:
            continue
        href = link.get("href", "")
        m = re.search(r"id=(\d+)", href)
        if not m:
            continue
        art_id = int(m.group(1))

        titolo = link.get_text(strip=True)

        # data: <font class="verdana11grigio">GG/MM/AAAA</font>
        font = div.select_one("font.verdana11grigio")
        data_str = font.get_text(strip=True) if font else ""
        data_iso = ""
        if re.match(r"\d{2}/\d{2}/\d{4}", data_str):
            d, mo, y = data_str.split("/")
            data_iso = f"{y}-{mo}-{d}"

        # estratto
        paras = div.select("p.verdana11nero")
        estratto = ""
        for p in paras:
            t = p.get_text(strip=True)
            if t and t != data_str:
                estratto = t
                break

        if art_id not in meta:
            meta[art_id] = {"titolo": titolo, "data": data_iso, "estratto": estratto}

print(f"Trovati {len(meta)} articoli nei file elenco")

# ── 2. Leggi i file dettaglio per: contenuto + immagine + link ────────────────

# Indice dei file immagine cachati (lower-case per match case-insensitive)
img_cache_files = os.listdir(IMG_CACHE)
img_cache_index = {f.lower(): f for f in img_cache_files}

def find_cached_image(src_attr: str):
    """
    src_attr: valore dell'attributo src nell'HTML del dettaglio
    Es: ../../tools/thumb.output.php%EF%B9%96src=..%EA%A4%B7filemanager%EA%A4%B7...jpg&wmax=140&...
    Torna il filename (nel IMG_CACHE) se trovato, altrimenti None.
    """
    # Decodifica URL → contiene ﹖ e ꤷ
    decoded = unquote(src_attr)
    # Rimuovi prefisso ../../tools/
    decoded = re.sub(r"^.*tools/", "", decoded)
    # Cerca prima con wmax=140 (thumbnail grande), poi wmax=45
    candidates = [decoded]
    # Se non contiene wmax=140, prova a variare le dimensioni
    for wh in [("wmax=140&hmax=140", "wmax=45&hmax=40"),
                ("wmax=45&hmax=40", "wmax=140&hmax=140")]:
        alt = decoded.replace(wh[0], wh[1])
        if alt != decoded:
            candidates.append(alt)

    for candidate in candidates:
        if candidate.lower() in img_cache_index:
            return img_cache_index[candidate.lower()]
    return None

articles = []

detail_files = [
    f for f in os.listdir(PAGINE)
    if f.startswith("approfondimenti_dettaglio") and f.endswith(".html")
]

for fname in sorted(detail_files):
    m = re.search(r"id=(\d+)", fname)
    if not m:
        continue
    art_id = int(m.group(1))

    path = os.path.join(PAGINE, fname)
    with open(path, encoding="utf-8", errors="replace") as f:
        soup = BeautifulSoup(f, "lxml")

    # Immagine — salva il src come stringa prima di qualsiasi decompose
    image_filename = None
    img_src_raw = ""
    img_tag = soup.select_one("div.imgdettaglioguidatv img")
    if img_tag:
        img_src_raw = str(img_tag.get("src", "") or "")

    # Contenuto
    content_div = soup.select_one("div.testodettaglioguidatv")
    contenuto_html = ""
    if content_div:
        img_div = content_div.select_one("div.imgdettaglioguidatv")
        if img_div:
            img_div.decompose()
        contenuto_html = content_div.decode_contents().strip()

    if img_src_raw and "imgnotfound" not in img_src_raw:
        image_filename = find_cached_image(img_src_raw)

    # Link "Per saperne di più"
    links = []
    for rep in soup.select("div.repliche"):
        a = rep.select_one("a")
        if a and a.get("href"):
            label = a.get_text(strip=True)
            href = a["href"]
            if label and href and not href.startswith("approfondimenti"):
                links.append({"label": label, "url": href})

    # Titolo dall'h3 del dettaglio (fallback se non nel meta)
    h3 = soup.select_one("h3")
    titolo_dettaglio = h3.get_text(strip=True) if h3 else ""

    base_meta = meta.get(art_id, {})
    articles.append({
        "id_originale": art_id,
        "titolo": base_meta.get("titolo") or titolo_dettaglio,
        "data": base_meta.get("data", ""),
        "estratto": base_meta.get("estratto", ""),
        "contenuto_html": contenuto_html,
        "image_filename": image_filename,
        "links": links,
    })

# Ordina per data decrescente
articles.sort(key=lambda a: a["data"] or "0000", reverse=True)

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

# ── Report ────────────────────────────────────────────────────────────────────
con_data   = sum(1 for a in articles if a["data"])
con_img    = sum(1 for a in articles if a["image_filename"])
con_link   = sum(1 for a in articles if a["links"])
con_testo  = sum(1 for a in articles if a["contenuto_html"])

print(f"\n✓ {len(articles)} articoli scritti in scripts/approfondimenti.json")
print(f"  con data:    {con_data}")
print(f"  con immagine: {con_img}")
print(f"  con link:    {con_link}")
print(f"  con testo:   {con_testo}")
