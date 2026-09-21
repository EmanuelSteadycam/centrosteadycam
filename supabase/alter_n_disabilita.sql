-- Sostituisce il flag booleano "disabilita" (sì/no) con il conteggio esatto
-- "n_disabilita" (quanti alunni con disabilità motorie), richiesto per
-- organizzare correttamente le visite Display.
-- Da eseguire manualmente nell'SQL editor di Supabase prima del lancio.

ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS n_disabilita SMALLINT NOT NULL DEFAULT 0;

-- Backfill: le prenotazioni esistenti con disabilita = TRUE non hanno un
-- numero esatto salvato: le impostiamo a 1 come stima minima, da correggere
-- a mano se necessario.
UPDATE event_bookings SET n_disabilita = 1 WHERE disabilita = TRUE AND n_disabilita = 0;

ALTER TABLE event_bookings DROP COLUMN IF EXISTS disabilita;
