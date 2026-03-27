# Deploy Guide — Centro Steadycam

## Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animazioni**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Storage immagini**: Supabase Storage
- **Deploy**: Vercel

---

## 1. Setup Supabase

### 1a. Crea il progetto
1. Vai su [supabase.com](https://supabase.com) → New project
2. Scegli region: **Europe (Frankfurt)**

### 1b. Crea le tabelle
Nel SQL Editor di Supabase, esegui il file:
```
supabase/schema.sql
```

### 1c. Crea il bucket Storage
Nel pannello Storage → New bucket:
- Name: `images`
- Public: ✅

### 1d. Ottieni le credenziali
Settings → API → copia:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Migrazione contenuti WordPress

```bash
# Aggiorna .env.local con le credenziali Supabase
cp .env.local.example .env.local
# Edita .env.local con i tuoi valori

# Esegui la migrazione completa
npm run migrate

# Oppure singole sezioni:
npm run migrate -- --posts      # solo post del blog
npm run migrate -- --pages      # solo pagine
npm run migrate -- --adam       # solo archivio ADAM
npm run migrate -- --media      # solo metadati media
npm run migrate -- --images     # migra immagini in Supabase Storage (50 alla volta)
```

---

## 3. Deploy su Vercel

### 3a. Push su GitHub
```bash
git init
git add .
git commit -m "Initial commit: Centro Steadycam React"
git remote add origin https://github.com/TUO_USERNAME/centrosteadycam.git
git push -u origin main
```

### 3b. Connetti a Vercel
1. [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Framework: **Next.js** (rilevato automaticamente)
3. Imposta le **Environment Variables**:

| Nome | Valore |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... (solo server) |
| `WORDPRESS_API_URL` | https://centrosteadycam.it/wp-json/wp/v2 |

4. Deploy → il sito sarà live su `https://centrosteadycam.vercel.app`

### 3c. Dominio custom
Dashboard Vercel → Settings → Domains → aggiungi `centrosteadycam.it`
Poi aggiorna i DNS presso il tuo registrar.

---

## 4. Struttura del progetto

```
centrosteadycam/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── display/              # Laboratorio Display (fullscreen slider)
│   │   ├── blog/                 # Blog listing + post singolo
│   │   ├── restart/              # Progetto Restart
│   │   ├── adam/                 # Archivio ADAM (208 items)
│   │   ├── archivio/             # Archivio audiovisivi
│   │   ├── staff/                # Team
│   │   ├── contatti/             # Contatti + mappa
│   │   └── privacy/              # Privacy policy
│   ├── components/
│   │   ├── navigation/           # Navbar + Footer
│   │   └── display/              # Slider + 6 tipi di slide
│   ├── lib/
│   │   ├── wordpress.ts          # Client API WordPress
│   │   └── supabase.ts           # Client Supabase
│   └── types/
│       └── wordpress.ts          # TypeScript types
├── scripts/
│   └── migrate-wordpress.ts      # Script migrazione WP → Supabase
├── supabase/
│   └── schema.sql                # Schema database
└── vercel.json
```

---

## 5. Architettura dei dati

Il sito funziona in due modalità:

**Senza migrazione** (subito operativo):
- Legge direttamente dall'API WordPress `centrosteadycam.it/wp-json/`
- Immagini servite da `centrosteadycam.it/wp-content/uploads/`
- Nessuna dipendenza da Supabase per la lettura

**Con migrazione Supabase** (produzione):
- Tutti i contenuti in Supabase PostgreSQL
- Immagini in Supabase Storage
- Full-text search in italiano
- API WordPress non più necessaria
- Aggiornare `src/lib/wordpress.ts` per leggere da Supabase invece che da WP

---

## Note sulla pagina Display

La pagina `/display` è completamente standalone (nessun header/footer WP).
Replica il RevSlider con:
- Slide navigabili (tasti freccia, click sui dot, pulsanti interni)
- Animazioni Framer Motion con slide-in/out staggerati (BASE_DELAY = 0.6)
- Bottone `← Torna` su tutte le slide tranne la home (history stack)
- Form di prenotazione integrato → salva in `display_bookings` Supabase
- Immagini originali da `centrosteadycam.it/wp-content/uploads/`
- SlidePortfolio (Le Stanze): griglia 3×2, 5 stanze + gatto nero (link alla home)
- Overlay menu hamburger: si apre/chiude con il bottone Menu

---

## Area Admin (`/admin`)

Accesso protetto via Supabase Auth (email/password).

### File chiave
| File | Descrizione |
|------|-------------|
| `src/middleware.ts` | Protegge tutte le route `/admin/*` |
| `src/app/admin/login/page.tsx` | Pagina di login |
| `src/app/admin/(dashboard)/layout.tsx` | Layout con sidebar |
| `src/app/admin/(dashboard)/page.tsx` | Dashboard panoramica |
| `src/app/admin/(dashboard)/prenotazioni/page.tsx` | Gestione slot + iscrizioni |
| `src/app/admin/(dashboard)/prenotazioni/actions.ts` | Server Actions (add/toggle/delete slot) |
| `src/components/admin/AdminSidebar.tsx` | Sidebar navigazione |
| `src/components/admin/SlotManager.tsx` | Componente client gestione slot |
| `src/components/admin/BookingsList.tsx` | Lista iscrizioni con filtro + export CSV |
| `src/lib/supabase-server.ts` | Client Supabase SSR (anon + service role) |
| `src/components/navigation/SiteShell.tsx` | Nasconde Navbar/Footer su /admin e /display |
| `supabase/schema_admin.sql` | Tabelle display_slots + display_bookings + RLS |

### Setup admin (prima volta)
1. Esegui `supabase/schema_admin.sql` nel SQL Editor di Supabase
2. Crea utente in Supabase Auth → Authentication → Users
3. Se email non verificata, esegui:
   ```sql
   UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'tua@email.com';
   ```
4. Aggiungi a `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

### Sezioni admin disponibili
- **Prenotazioni** ✅ — slot + iscrizioni
- **Blog** 🚧 — in costruzione
- **Pagine** 🚧 — in costruzione
- **Staff** 🚧 — in costruzione
- **Home Grid** 🚧 — in costruzione
