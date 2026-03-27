-- ============================================================
-- Centro Steadycam — Admin + Booking Schema (addendum)
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Display slots: date disponibili per le prenotazioni
CREATE TABLE IF NOT EXISTS display_slots (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date           DATE NOT NULL,
  time_slot      TEXT NOT NULL CHECK (time_slot IN ('mattina', 'intera')),
  max_capacity   INTEGER NOT NULL DEFAULT 1,
  bookings_count INTEGER NOT NULL DEFAULT 0,
  is_open        BOOLEAN NOT NULL DEFAULT true,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, time_slot)
);

CREATE INDEX IF NOT EXISTS slots_date_idx ON display_slots(date);

-- Aggiungi slot_id a display_bookings (se non esiste già)
ALTER TABLE display_bookings
  ADD COLUMN IF NOT EXISTS slot_id UUID REFERENCES display_slots(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE display_slots ENABLE ROW LEVEL SECURITY;

-- Chiunque può leggere gli slot (per il calendario frontend)
CREATE POLICY "Public read slots"
  ON display_slots FOR SELECT TO anon USING (true);

-- Solo admin (authenticated) può gestire slot e prenotazioni
CREATE POLICY "Admin manage slots"
  ON display_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin read bookings"
  ON display_bookings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin update bookings"
  ON display_bookings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete bookings"
  ON display_bookings FOR DELETE TO authenticated USING (true);

-- Funzione per incrementare bookings_count atomicamente
CREATE OR REPLACE FUNCTION increment_slot_bookings(p_slot_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE display_slots
  SET bookings_count = bookings_count + 1
  WHERE id = p_slot_id;
END;
$$;
