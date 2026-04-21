-- Aggiunge campi mancanti ad archivio_items
ALTER TABLE archivio_items ADD COLUMN IF NOT EXISTS ora_inizio text;
ALTER TABLE archivio_items ADD COLUMN IF NOT EXISTS durata text;
ALTER TABLE archivio_items ADD COLUMN IF NOT EXISTS con_testimonianze boolean;
ALTER TABLE archivio_items ADD COLUMN IF NOT EXISTS con_statistiche boolean;
