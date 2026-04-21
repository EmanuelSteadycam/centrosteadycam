-- ══════════════════════════════════════════════════════════
-- Approfondimenti — articoli dal vecchio sito Steadycam
-- Eseguire nel SQL Editor di Supabase
-- ══════════════════════════════════════════════════════════

CREATE TABLE approfondimenti (
  id               BIGSERIAL PRIMARY KEY,
  id_originale     INTEGER UNIQUE,
  titolo           TEXT NOT NULL,
  data             DATE,
  estratto         TEXT,
  contenuto_html   TEXT,
  image_url        TEXT,
  links            JSONB DEFAULT '[]'::jsonb,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indice full-text per ricerca
ALTER TABLE approfondimenti
  ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('italian',
      coalesce(titolo, '') || ' ' ||
      coalesce(estratto, '') || ' ' ||
      coalesce(contenuto_html, '')
    )
  ) STORED;

CREATE INDEX approfondimenti_fts_idx ON approfondimenti USING GIN (fts);
CREATE INDEX approfondimenti_data_idx ON approfondimenti (data DESC);

-- RLS: lettura pubblica
ALTER TABLE approfondimenti ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON approfondimenti FOR SELECT USING (true);
