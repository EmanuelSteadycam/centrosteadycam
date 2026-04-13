-- ══════════════════════════════════════════════════════════
-- Sistema eventi generico — Centro Steadycam
-- Eseguire nel SQL Editor di Supabase
-- ══════════════════════════════════════════════════════════

-- 1. Tabella eventi
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Slot per evento
CREATE TABLE event_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 1,
  bookings_count INTEGER NOT NULL DEFAULT 0,
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, date, time_slot)
);

-- 3. Iscrizioni/prenotazioni
CREATE TABLE event_bookings (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id),
  slot_id UUID REFERENCES event_slots(id) ON DELETE SET NULL,
  tipo_visita TEXT NOT NULL,
  n_alunni INTEGER NOT NULL,
  n_adulti INTEGER NOT NULL,
  disabilita BOOLEAN DEFAULT FALSE,
  istituto TEXT NOT NULL,
  ordine_scuola TEXT NOT NULL,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  classe TEXT NOT NULL,
  email TEXT NOT NULL,
  cellulare TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending',
  mailup_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Impostazioni per evento
CREATE TABLE event_settings (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (event_id, key)
);

-- 5. RPC: incrementa/decrementa bookings_count
CREATE OR REPLACE FUNCTION increment_event_slot_bookings(p_slot_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE event_slots SET bookings_count = bookings_count + 1 WHERE id = p_slot_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_event_slot_bookings(p_slot_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE event_slots SET bookings_count = GREATEST(bookings_count - 1, 0) WHERE id = p_slot_id;
END;
$$;

-- 6. RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events" ON events FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Admin manage events" ON events TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE event_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read slots" ON event_slots FOR SELECT TO anon USING (true);
CREATE POLICY "Admin manage slots" ON event_slots TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert bookings" ON event_bookings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin manage bookings" ON event_bookings TO service_role USING (true);

ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON event_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Admin manage settings" ON event_settings TO authenticated USING (true) WITH CHECK (true);

-- 7. Seed: evento Display
INSERT INTO events (name, slug, description)
VALUES ('Display Techno', 'display', 'Laboratorio Display del Centro Steadycam');

INSERT INTO event_settings (event_id, key, value)
SELECT id, 'confirmation_email_enabled', 'true' FROM events WHERE slug = 'display';

INSERT INTO event_settings (event_id, key, value)
SELECT id, 'waitlist_enabled', 'false' FROM events WHERE slug = 'display';
