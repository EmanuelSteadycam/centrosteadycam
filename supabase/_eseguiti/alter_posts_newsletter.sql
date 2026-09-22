-- Traccia l'ultimo invio email per gli articoli "solo email" (posts.type = 'newsletter').
-- Questi articoli non vengono mai pubblicati sul sito: le query pubbliche filtrano
-- sempre type = 'post', quindi restano invisibili di default.
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS newsletter_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS newsletter_list_id INTEGER;
