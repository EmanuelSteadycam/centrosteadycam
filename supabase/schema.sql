-- ============================================================
-- Centro Steadycam — Supabase Schema
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================

-- Posts table (blog posts + custom types)
CREATE TABLE IF NOT EXISTS posts (
  id            BIGSERIAL PRIMARY KEY,
  wp_id         INTEGER UNIQUE NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  type          TEXT NOT NULL DEFAULT 'post', -- 'post' | 'page' | 'adam_archivio'
  title         TEXT NOT NULL,
  content       TEXT,
  excerpt       TEXT,
  featured_image_url  TEXT,
  featured_image_alt  TEXT,
  date          TIMESTAMPTZ,
  modified      TIMESTAMPTZ,
  categories    INTEGER[] DEFAULT '{}',
  tags          INTEGER[] DEFAULT '{}',
  status        TEXT DEFAULT 'publish',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_type_idx ON posts(type);
CREATE INDEX IF NOT EXISTS posts_date_idx ON posts(date DESC);
CREATE INDEX IF NOT EXISTS posts_categories_idx ON posts USING GIN(categories);

-- Media table
CREATE TABLE IF NOT EXISTS media (
  id            BIGSERIAL PRIMARY KEY,
  wp_id         INTEGER UNIQUE NOT NULL,
  slug          TEXT,
  title         TEXT,
  source_url    TEXT NOT NULL,
  supabase_url  TEXT,   -- populated after migration to Supabase Storage
  alt_text      TEXT DEFAULT '',
  caption       TEXT DEFAULT '',
  mime_type     TEXT,
  width         INTEGER,
  height        INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS media_wp_id_idx ON media(wp_id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id            BIGSERIAL PRIMARY KEY,
  wp_id         INTEGER UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT DEFAULT '',
  parent_wp_id  INTEGER DEFAULT 0,
  post_count    INTEGER DEFAULT 0
);

-- Display bookings table (replaces WP Super Forms / display_booking CPT)
CREATE TABLE IF NOT EXISTS display_bookings (
  id              BIGSERIAL PRIMARY KEY,
  tipo_scuola     TEXT NOT NULL,
  tipo_visita     TEXT NOT NULL,
  n_alunni        INTEGER NOT NULL,
  n_adulti        INTEGER NOT NULL,
  disabilita      BOOLEAN DEFAULT FALSE,
  istituto        TEXT NOT NULL,
  ordine_scuola   TEXT NOT NULL,
  nome            TEXT NOT NULL,
  cognome         TEXT NOT NULL,
  classe          TEXT NOT NULL,
  email           TEXT NOT NULL,
  cellulare       TEXT,
  note            TEXT,
  status          TEXT DEFAULT 'pending', -- 'pending' | 'confirmed' | 'cancelled'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_bookings ENABLE ROW LEVEL SECURITY;

-- Public read access for posts, media, categories
CREATE POLICY "Public read posts" ON posts FOR SELECT TO anon USING (status = 'publish');
CREATE POLICY "Public read media" ON media FOR SELECT TO anon USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT TO anon USING (true);

-- Allow public insert for bookings (anyone can book)
CREATE POLICY "Public insert bookings" ON display_bookings FOR INSERT TO anon WITH CHECK (true);
-- Only service role can read bookings
CREATE POLICY "Service read bookings" ON display_bookings FOR SELECT TO service_role USING (true);

-- Full text search index on posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('italian', coalesce(title, '') || ' ' || coalesce(excerpt, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS posts_fts_idx ON posts USING GIN(fts);

-- Storage bucket for images (create via Supabase dashboard or:)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
