# Handoff — sessione 2026-07-26 / 2026-07-27 (aggiornato)

## Nota sulla versione precedente di questo file

Il contenuto precedente di `HANDOFF.md` (sessione 2026-07-22/23, fix di margini/gap/timing sulla timeline mesi originale) è superato: da allora la pagina `/storia` è stata riscritta più volte (anni 2000-2011 al posto dei mesi, hero "La nostra Storia", rimozione sezione Resources/footer placeholder, nuova voce di menu, admin CRUD per anno+descrizione+immagine). La cronologia dettagliata di quei passaggi resta recuperabile da `git log` e dalla cronologia della conversazione precedente; qui si riparte dallo stato attuale.

## Cosa è successo in questa sessione

Il grosso del lavoro è stata la costruzione, per tentativi successivi e molto guidata dall'utente, di un elemento visivo decorativo a sinistra della timeline di `/storia`, dentro `src/components/CovidTimelineClone.tsx`. Il percorso è stato:

1. **Occhio di bue ovale**: un pannello fisso mascherato con un gradiente radiale (CSS `mask-image`), immagini che entravano/uscivano lateralmente agganciate allo scroll dello stesso anno. Ingrandito una volta su richiesta ("Prova 2 Impatto" vs "Prova 1 Compatta", entrambe annotate nel codice via commento). Poi scartato: con `filter:blur` sui bordi il risultato è stato giudicato "inguardabile" e si è tornati alla versione senza blur.
2. **Buco da proiettile**: la maschera ovale è stata sostituita con un path SVG generato via script (bordo irregolare + crepe radianti), per un effetto "buco nello sfondo viola, nero dietro". Anche questo scartato ("non rende") su richiesta esplicita di cambiare completamente idea.
3. **Televisore anni '90 (soluzione attuale)**: l'utente ha fornito due immagini reali (`/Users/emam1/Desktop/TV.png`, poi `TV2.png` con le gambe modificate), copiate in `public/tv-90s-2.png`. La zona "schermo" nel PNG **è già trasparente in origine** — verificato con uno script Python (PIL, flood-fill) che ha misurato la bbox esatta (29.4%/32.0%/39.7%/28.7% di left/top/width/height rispetto al canvas 2500×2500), non stimata a occhio. Il contenuto scorrevole è posizionato dietro l'immagine usando quelle percentuali, quindi combacia esattamente con gli angoli arrotondati dello schermo (verificato via screenshot+zoom in Chrome, non solo a occhio).

Sul televisore sono poi stati aggiunti, uno per uno, su richieste separate dell'utente:
- Tilt 3D (`rotateY`/`rotateX` su un contenitore con `perspective`, poi invertito su richiesta "inclina dalla parte opposta").
- Scanline (repeating-linear-gradient orizzontale).
- Bob verticale infinito (loop 3.2s) su un `motion.div` **separato** dal contenitore con il tilt statico (per lo stesso motivo già in memoria: mai mischiare `y`/`x` animati di Framer Motion con un `transform` CSS letterale sullo stesso elemento).
- Ombra "ancorata al piano": non si sposta mai, ma si allarga/scurisce e si restringe/schiarisce in fase con lo stesso bob, per dare l'idea che la TV si allontani/avvicini dal pavimento.
- Rumore "sabbia" via SVG `feTurbulence` (nessuna immagine esterna), prima come effetto per-immagine durante ogni transizione, poi **consolidato in un solo strato condiviso** sotto tutte le immagini (rimosso il rumore per-immagine duplicato) su richiesta esplicita ("manteniamo sotto a tutte le transizioni la sabbia").
- Transizioni tra immagini cambiate da orizzontali a verticali (`x` → `y` sul motion.div di ogni immagine).
- "Accensione" della TV a **scrollY = 100px assoluti** (non percentuale di blocco): lampo sottile bianco che si espande in orizzontale dal centro (poi assottigliato da 6px a 2px su richiesta), dopo il quale la sabbia di base resta accesa per sempre (clamp di Framer Motion, mai più spenta).
- **Prima immagine (anno 2000) agganciata a scrollY = 500px assoluti**: componente dedicato `FirstTVImage` che combina due `MotionValue` (lo scroll assoluto della pagina per l'ingresso, e il normale `p1` percentuale per l'uscita, così il passaggio alla seconda immagine resta senza buchi). Tutte le altre 9 immagini restano sul vecchio meccanismo `TVImage` basato su `p1`/`p2` percentuale, invariato.

Durante questo lavoro è stato trovato e corretto un problema reale non legato all'estetica: una delle foto placeholder usate per il carosello (`Steadycam_metodo-scaled.jpg`) si è rivelata — controllata a schermo, non assunta — una foto stock di occhiali da sole a marchio "Stranger Things" (Netflix), completamente scollegata dal contenuto e potenzialmente problematica per diritti. Sostituita con `Contatti_2-scaled.jpg` (foto generica di una cornetta telefonica rossa) dopo aver controllato visivamente anche le altre 4 immagini della lista, che sono risultate innocue.

Fuori dal lavoro sul televisore, in questa sessione sono state fatte due ricerche su richiesta dell'utente (nessuna modifica al codice): esempi di siti/demo con carousel ed effetti 3D non convenzionali (Codrops, Awwwards — inclusi link diretti a demo scaricabili tipo "ScrollSynced Carousel" e "CSS-only scroll-driven carousels"), e un'analisi tecnica del sito `wallow-bath-body-63.aura.build` (stack: React+Vite, Tailwind compilato, Spline per il 3D, hosting Netlify, referral tracking PromoteKit — spiegato anche il parametro `?via=Vpromotion` nell'URL), con relativa ricerca prezzi (Spline: free/$12/$20/mese; aura.build non verificato, la pagina prezzi non è leggibile da fetch statico perché è una SPA).

Dopo il primo commit/deploy di questa sessione sono seguiti **due giri di rottura in produzione**, entrambi trovati e risolti nella stessa sessione:

1. **Build fallita su Vercel** (`npm run build` locale non l'aveva mostrato perché non era mai stato lanciato per intero, solo `tsc --noEmit`): ESLint (`react/no-unescaped-entities`) bloccava la build per due virgolette dritte dentro il testo di `admin/timeline/page.tsx` (titolo pagina + messaggio di errore Supabase). Risolto con `&ldquo;`/`&rdquo;`. **Lezione**: `tsc --noEmit` non esegue il lint — prima di un push che poi triggera un deploy, lanciare `npm run build` per intero almeno una volta se sono stati toccati file con testo/JSX nuovo.
2. **Immagini del carosello TV assenti online ma presenti in locale**: le richieste dirette a `/wp-content/uploads/*` tornano **403** su Vercel (confermato via network log di un vero tab Chrome, non solo `curl`), mentre in `next dev` funzionavano perché quella regola di sicurezza esiste solo lato piattaforma Vercel, non nel dev server locale. Il sito in realtà non serve mai le immagini da `public/wp-content/uploads/` direttamente: tutte le immagini "vecchie" sono già state caricate su Vercel Blob con lo stesso nome file (script `scripts/upload-to-blob.ts`, path piatto `media/{filename}`) e servite tramite il rewrite `/media/:path*` → Blob già esistente in `next.config.js`. Fix: cambiati i 5 path in `CAROUSEL_IMAGES` da `/wp-content/uploads/...` a `/media/...`. **Regola per il futuro**: qualsiasi nuovo riferimento a un'immagine già presente in `public/wp-content/uploads/` va scritto come `/media/{stesso-nome-file}`, mai come `/wp-content/uploads/...` — quel path è bloccato in produzione.

Infine, sono state fatte tre modifiche puntuali al televisore su richieste successive: il tilt 3D è stato reincli­nato (`rotateY(-16deg)` → provato a `-28deg` → invertito a `+28deg` perché la direzione era "al contrario" di quanto voluto — la versione finale tenuta è `rotateY(28deg) rotateX(4deg)`); la vignetta CRT radiale è stata rimossa su richiesta (creava un ovale più chiaro visibile al centro dello schermo, codice lasciato commentato per un ripristino rapido); ed è stata provata e poi **scartata** una modifica per cui ogni transizione fra immagini doveva mostrare esplicitamente "immagine1 → sabbia pura → immagine2" invece del crossfade diretto — funzionava esattamente come richiesto (verificato con l'overlay di debug, sabbia pura visibile a scrollY 1200/1400px) ma il risultato visivo è stato giudicato "inguardabile" dall'utente stesso ("colpa mia"), quindi si è tornati al crossfade diretto precedente.

C'è stato anche un problema operativo non legato al codice: il server di sviluppo locale era rimasto attivo per oltre 2 giorni con la cartella `.next` diventata inconsistente (i chunk JS/CSS tornavano 404 pur con l'HTML principale a 200 — pagina visibile solo come documento vuoto/non stilizzato nel browser reale, mentre `curl` sulla sola pagina sembrava dare tutto OK). Risolto con `rm -rf .next` + riavvio del processo. **Lezione**: se l'utente dice "non vedo nulla" ma `curl` sulla pagina risponde 200, controllare anche che i chunk statici referenziati nell'HTML rispondano 200 (non solo il documento) prima di escludere un problema locale.

## Stato attuale esatto

`/storia` risponde 200 sia in locale sia in produzione (`centrosteadycam.it/storia`), `npx tsc --noEmit` pulito e **`npm run build` completo eseguito con successo** all'ultimo controllo (solo warning preesistenti su `<img>`/`next/image`, nessun errore). Deploy corrente su Vercel: `● Ready` (commit `c692434`). Il televisore è visibile solo da 1400px di larghezza viewport in su (media query `.side-spotlight`), fisso a sinistra, verticalmente centrato. Verificato con screenshot+zoom in Chrome (sia in locale sia sul dominio di produzione), non solo assunto:
- L'allineamento schermo/cornice regge anche col tilt 3D (ora `rotateY(28deg) rotateX(4deg)`).
- Il bob e il pulsare dell'ombra sono visibili e in fase.
- Lo scanline è visibile; la vignetta CRT è stata rimossa (commentata nel codice).
- Il lampo di accensione scatta esattamente a scrollY 100px (letto dall'overlay `?debug=1`, non stimato).
- A scrollY 400px lo schermo è ancora tutta sabbia; a 500px la prima immagine è a piena opacità — confermato con lo stesso overlay di debug.
- **Le immagini del carosello ora si vedono anche online** (fix `/wp-content` → `/media`, vedi sopra) — confermato con screenshot sul dominio reale, non solo in locale.
- Le transizioni fra immagini sono a **crossfade diretto** (non "immagine→sabbia pura→immagine" — provato e scartato, vedi sopra).

**Domanda esplicita dell'utente, con risposta data in chat**: i due trigger a pixel assoluti (100px accensione, 500px prima immagine) **non sono responsive** — a differenza di tutto il resto della timeline, che usa `p1`/`p2` percentuali ricalcolate a runtime dalle altezze reali (adattandosi a viewport/breakpoint diversi), questi due valori sono fissi e tarati sulla finestra di test. Su schermi con viewport diverso (altezza, o sotto i breakpoint che cambiano la larghezza del blocco timeline) non coincideranno più esattamente con la comparsa dell'anno "2000". **L'utente ha confermato di essere d'accordo e ha detto esplicitamente di rimandare la sincronizzazione**: "lo faremo" quando avrà le date/immagini reali definitive per tarare i pixel precisi — a quel punto vanno convertiti alla stessa logica percentuale (`p1`/`p2`) usata ovunque altrove, non lasciati a pixel fissi.

## Decisioni prese e perché

- Maschera CSS vs SVG vs vera immagine PNG: si è arrivati alla vera immagine perché l'utente aveva già in mano un asset disegnato (TV.png/TV2.png) e le due alternative CSS (ovale, buco da proiettile) sono state esplicitamente giudicate insoddisfacenti a schermo.
- La misura della bbox trasparente dello schermo è stata fatta con uno script Python (flood-fill sui pixel alpha), non ad occhio, perché un errore anche piccolo qui si vede subito come disallineamento tra cornice e contenuto — coerente con la regola di progetto "misurare, non indovinare" già in memoria.
- Il bob/tilt/ombra sono tre `motion.div` annidati separati (non un solo elemento con più proprietà animate insieme) per lo stesso motivo già noto: mixare `y` animato di Framer Motion con un `transform` CSS statico sullo stesso elemento inverte/rompe il movimento.
- La sabbia è stata consolidata in un solo strato condiviso (non uno per immagine) su richiesta esplicita, per avere un'unica fonte di verità sotto ogni transizione invece di più rumori sovrapposti.
- Solo la prima immagine usa il trigger a pixel assoluti: è stata una richiesta esplicita e puntuale dell'utente ("la prima immagine deve comparire a 500px"), non estesa alle altre 9 per scelta — quelle restano sul meccanismo percentuale esistente.

## Problemi aperti / da fare

- **Pixel non responsive** (100px accensione, 500px prima immagine): da convertire a percentuale (`p1`) quando l'utente avrà le date/immagini reali — esplicitamente rimandato, non un bug non notato.
- Le altre 9 immagini del carosello TV usano ancora foto placeholder cicliche (le stesse 5 foto stock del sito, ripetute), non le immagini reali per anno.
- Il campo `image_url` esiste già nello schema `timeline_entries` e nell'admin (`/admin/timeline`, upload via Vercel Blob), ma **non è ancora collegato** alla resa pubblica: né il carosello TV né altrove in `/storia` legge `image_url` dal database — l'admin permette di caricarle ma non vengono ancora mostrate.
- Resta non costruito il blocco dinamico per gli anni oltre il 2011 (pattern "Semplice" confermato dall'utente in una sessione precedente, mai implementato) — non toccato in questa sessione.
- Le descrizioni dei 12 anni restano placeholder generici per esplicita richiesta dell'utente ("per ora lascia i placeholder generici"), in attesa di contenuti reali.

## Prossimi passi concreti

1. Quando l'utente fornisce date/immagini definitive: ritarare/convertire i due trigger a pixel fissi (accensione, prima immagine) sulla stessa logica percentuale `p1`/`p2` del resto della pagina.
2. Collegare `image_url` (già in DB e admin) alla resa pubblica — sia nel carosello TV sia, se richiesto, altrove nella pagina.
3. Sostituire le foto placeholder cicliche del carosello con le immagini reali caricate per ciascun anno.
4. Costruire il blocco dinamico per gli anni > 2011 (pattern "Semplice"), quando richiesto esplicitamente.
