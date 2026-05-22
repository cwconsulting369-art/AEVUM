-- AEVUM DSGVO — extensions on existing tables for retention + erasure
-- Created: 2026-05-20
-- Project: iwyzbiufmdnwmddjkevf (AEVUM Supabase)
--
-- Adds:
--   1) consent_log.order_id   — link consent to Stripe order (not just audits)
--   2) erasure_log columns    — track orders/security_events deletions too
--   3) orders.dsgvo_deletion_due — soft-delete flag for retention cron
--   4) dsgvo_settings singleton — central retention config
--   5) audits.dsgvo_deletion_due — same for audits

-- ─── 1) consent_log links to orders too ─────────────────────────
ALTER TABLE public.consent_log
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS consent_log_order_idx ON public.consent_log (order_id);

-- ─── 2) Extend erasure_log to cover new tables ──────────────────
ALTER TABLE public.erasure_log
  ADD COLUMN IF NOT EXISTS orders_deleted_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS security_events_deleted_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ip TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- ─── 3) orders retention flag ───────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS dsgvo_deletion_due TIMESTAMPTZ;

COMMENT ON COLUMN public.orders.dsgvo_deletion_due IS 'Wenn gesetzt: cron löscht nach diesem Datum (DSGVO Speicherbegrenzung). Default: paid_at + 10 Jahre (HGB §147)';

-- ─── 4) audits retention flag ───────────────────────────────────
ALTER TABLE public.audits
  ADD COLUMN IF NOT EXISTS dsgvo_deletion_due TIMESTAMPTZ;

COMMENT ON COLUMN public.audits.dsgvo_deletion_due IS 'Wenn gesetzt: cron löscht nach diesem Datum. Default: 12 Monate nach closed_lost / 36 Monate nach closed_won';

-- ─── 5) Central DSGVO settings (singleton) ──────────────────────
CREATE TABLE IF NOT EXISTS public.dsgvo_settings (
  id                              INT         PRIMARY KEY DEFAULT 1,
  consent_text_version            TEXT        NOT NULL DEFAULT 'datenschutz-v1-2026-05-19',
  audit_log_retention_days        INT         NOT NULL DEFAULT 365,
  security_events_retention_days  INT         NOT NULL DEFAULT 90,
  ip_anon_after_days              INT         NOT NULL DEFAULT 30,
  audits_lost_retention_days      INT         NOT NULL DEFAULT 365,    -- 12 months for closed_lost
  audits_won_retention_days       INT         NOT NULL DEFAULT 1095,   -- 36 months for closed_won
  orders_retention_days           INT         NOT NULL DEFAULT 3650,   -- 10 years HGB §147
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dsgvo_settings_singleton CHECK (id = 1)
);

INSERT INTO public.dsgvo_settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.dsgvo_settings ENABLE ROW LEVEL SECURITY;

-- Read-only public so frontend can show current consent_text_version
DROP POLICY IF EXISTS "anyone read dsgvo settings" ON public.dsgvo_settings;
CREATE POLICY "anyone read dsgvo settings" ON public.dsgvo_settings
  FOR SELECT USING (true);

COMMENT ON TABLE public.dsgvo_settings IS 'Central DSGVO config — retention windows, current consent version';

-- ─── 6) Tighten security_events RLS (was implicit deny only) ────
-- Service-role bypasses; explicit policy makes intent clear.
DROP POLICY IF EXISTS "service-role only security_events" ON public.security_events;
CREATE POLICY "service-role only security_events" ON public.security_events
  FOR ALL USING (false) WITH CHECK (false);

-- ─── 7) Tighten audits RLS — same explicit deny ─────────────────
DROP POLICY IF EXISTS "service-role only audits" ON public.audits;
CREATE POLICY "service-role only audits" ON public.audits
  FOR ALL USING (false) WITH CHECK (false);

-- ─── 8) consent_log + erasure_log policies ──────────────────────
DROP POLICY IF EXISTS "service-role only consent_log" ON public.consent_log;
CREATE POLICY "service-role only consent_log" ON public.consent_log
  FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "service-role only erasure_log" ON public.erasure_log;
CREATE POLICY "service-role only erasure_log" ON public.erasure_log
  FOR ALL USING (false) WITH CHECK (false);
