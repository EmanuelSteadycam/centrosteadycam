-- Indici mancanti per archivio_items
-- Eseguire in Supabase SQL Editor

-- Indici sui campi filtro
CREATE INDEX IF NOT EXISTS archivio_prog_rif_idx    ON archivio_items(programma_riferimento);
CREATE INDEX IF NOT EXISTS archivio_target_idx      ON archivio_items(target);
CREATE INDEX IF NOT EXISTS archivio_data_tx_idx     ON archivio_items(data_trasmissione DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS archivio_sequenza_idx    ON archivio_items(is_sequenza) WHERE is_sequenza = true;

-- Indice composto per l'ordinamento (is_fondamentale DESC, data_trasmissione DESC)
CREATE INDEX IF NOT EXISTS archivio_sort_idx
  ON archivio_items(is_fondamentale DESC, data_trasmissione DESC NULLS LAST);

-- Indice trigram su tags per query ILIKE '%...%' veloci
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS archivio_tags_trgm_idx ON archivio_items USING gin(tags gin_trgm_ops);
