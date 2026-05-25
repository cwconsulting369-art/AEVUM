-- 041_waitlist_pre_launch.sql
-- Block A2 — Pre-Launch-Waitlist Extension (Wyoming-LLC Foundation Window)
-- Created: 2026-05-25
--
-- Erweitert launch_waitlist (Wave I7) um Spec-Felder fuer Pre-Launch-Capture:
-- - interest_tier (shop|saas|full-audit|unsure)
-- - utm_* + referrer + user_agent + ip_anon
-- - consent_version (DSGVO-Stempel)
-- - status (pending|confirmed|launched|unsubscribed|bounced)
-- - unsubscribe_token (one-click opt-out)
-- - notified_at / launched_notified_at (lifecycle timestamps)
-- - metadata (jsonb erweiterung)
--
-- Idempotent — bestehende Rows behalten ihre Werte; neue Spalten haben Defaults.

ALTER TABLE public.launch_waitlist
  ADD COLUMN IF NOT EXISTS interest_tier TEXT
    CHECK (interest_tier IN ('shop','saas','full-audit','unsure') OR interest_tier IS NULL),
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS referrer TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS ip_anon INET,
  ADD COLUMN IF NOT EXISTS consent_version TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','launched','unsubscribed','bounced')),
  ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS launched_notified_at TIMESTAMPTZ;

-- Backfill: bestehende rows bekommen unsubscribe_token + consent_version-Marker
UPDATE public.launch_waitlist
SET unsubscribe_token = encode(gen_random_bytes(24), 'hex')
WHERE unsubscribe_token IS NULL;

UPDATE public.launch_waitlist
SET consent_version = '2026-05-24-v0-implicit'
WHERE consent_version IS NULL;

-- Stricter token uniqueness for one-click unsubscribe URLs
CREATE UNIQUE INDEX IF NOT EXISTS idx_launch_waitlist_unsub_token
  ON public.launch_waitlist(unsubscribe_token);

CREATE INDEX IF NOT EXISTS idx_launch_waitlist_status
  ON public.launch_waitlist(status);

CREATE INDEX IF NOT EXISTS idx_launch_waitlist_tier
  ON public.launch_waitlist(interest_tier);

-- View: weekly signups for admin dashboard
CREATE OR REPLACE VIEW public.v_waitlist_stats AS
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
  COUNT(*) FILTER (WHERE status = 'unsubscribed') AS unsubscribed,
  COUNT(*) FILTER (WHERE ts > now() - interval '7 days') AS last_7d,
  COUNT(*) FILTER (WHERE ts > now() - interval '24 hours') AS last_24h,
  COUNT(*) FILTER (WHERE interest_tier = 'shop') AS tier_shop,
  COUNT(*) FILTER (WHERE interest_tier = 'saas') AS tier_saas,
  COUNT(*) FILTER (WHERE interest_tier = 'full-audit') AS tier_full,
  COUNT(*) FILTER (WHERE interest_tier = 'unsure' OR interest_tier IS NULL) AS tier_unsure
FROM public.launch_waitlist;
