-- AEVUM DSGVO B-extra — Sofort-Verzicht-Zustimmung (§ 356 Abs 4 BGB)
-- Created: 2026-05-20
-- Project: iwyzbiufmdnwmddjkevf (AEVUM Supabase)
--
-- Purpose:
--   B2C-Schutz vor Widerruf nach erbrachter Leistung. Bei Checkout muss
--   Verbraucher (a) ausdrücklich Sofort-Beginn verlangen UND
--   (b) Kenntnis vom Erlöschen des Widerrufsrechts bestätigen.
--   Pflicht für Paket S+M (kurze Delivery), optional für L (Dauerleistung).
--
-- Adds:
--   1) orders.consent_immediate_start        — BOOLEAN (default FALSE)
--   2) orders.consent_immediate_start_at     — TIMESTAMPTZ (when given)
--   3) orders.consent_immediate_start_version — TEXT (text-version snapshot)
--   4) consent_log.consent_type default safety net (already TEXT NOT NULL,
--      hier nur DEFAULT für Forward-compat, falls Drift)
--
-- Idempotent — kann mehrfach laufen.

-- ─── 1) orders columns ──────────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS consent_immediate_start         BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_immediate_start_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_immediate_start_version TEXT;

COMMENT ON COLUMN public.orders.consent_immediate_start IS
  '§ 356 Abs 4 BGB — Verbraucher hat Sofort-Beginn verlangt + Erlöschen-Kenntnis bestätigt';
COMMENT ON COLUMN public.orders.consent_immediate_start_at IS
  'Zeitstempel der Sofort-Verzicht-Zustimmung (zum Checkout-Submit-Zeitpunkt)';
COMMENT ON COLUMN public.orders.consent_immediate_start_version IS
  'Snapshot der Text-Version (z.B. immediate-start-v1-2026-05-20) — Beweissicherung';

-- ─── 2) consent_log type default (forward-compat) ───────────────
-- consent_type is already TEXT NOT NULL from migration 003.
-- DEFAULT here only protects future inserts that forget the field.
ALTER TABLE public.consent_log
  ALTER COLUMN consent_type SET DEFAULT 'datenschutz';
