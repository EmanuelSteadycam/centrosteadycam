-- ══════════════════════════════════════════════════════════
-- Fix race conditions prenotazioni Display
-- Eseguire nel SQL Editor di Supabase
-- ══════════════════════════════════════════════════════════

-- 1. RPC slot atomica: incrementa solo se c'è ancora posto
--    Restituisce TRUE se riuscito, FALSE se slot era già pieno
CREATE OR REPLACE FUNCTION increment_event_slot_bookings(p_slot_id UUID)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_rows INTEGER;
BEGIN
  UPDATE event_slots
    SET bookings_count = bookings_count + 1
    WHERE id = p_slot_id AND bookings_count < max_capacity;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

-- 2. Funzione trigger: blocca insert se cap globale raggiunto
CREATE OR REPLACE FUNCTION check_booking_cap()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_max TEXT; v_count INTEGER;
BEGIN
  IF NEW.tipo_visita = 'lista_attesa' THEN RETURN NEW; END IF;
  SELECT value INTO v_max FROM event_settings
    WHERE event_id = NEW.event_id AND key = 'max_bookings';
  IF v_max IS NULL OR v_max = '' THEN RETURN NEW; END IF;
  SELECT COUNT(*) INTO v_count FROM event_bookings
    WHERE event_id = NEW.event_id
      AND tipo_visita != 'lista_attesa'
      AND status != 'cancelled';
  IF v_count >= v_max::integer THEN
    RAISE EXCEPTION 'cap_reached';
  END IF;
  RETURN NEW;
END;
$$;

-- Rimuovi trigger precedente se esiste, poi ricrea
DROP TRIGGER IF EXISTS enforce_booking_cap ON event_bookings;
CREATE TRIGGER enforce_booking_cap
  BEFORE INSERT ON event_bookings
  FOR EACH ROW EXECUTE FUNCTION check_booking_cap();
