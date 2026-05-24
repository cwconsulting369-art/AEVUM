-- 038_launch_waitlist.sql
-- AEVUM Launch-Waitlist — Wave I7 (Maintenance-Mode Frontend)
-- Created: 2026-05-24
--
-- Captures emails of users who clicked a disabled Buy-Button while
-- app_settings.payments_paused=true. Source identifies WHERE (banner,
-- maintenance-modal, checkout-gate), interest identifies WHAT they wanted.
-- Defensive: UNIQUE(email) — one entry per address.

CREATE TABLE IF NOT EXISTS public.launch_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'unknown',
  interest TEXT,
  notified BOOLEAN DEFAULT false,
  ts TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email)
);

CREATE INDEX IF NOT EXISTS idx_launch_waitlist_ts ON public.launch_waitlist(ts DESC);
CREATE INDEX IF NOT EXISTS idx_launch_waitlist_notified ON public.launch_waitlist(notified, ts);
CREATE INDEX IF NOT EXISTS idx_launch_waitlist_interest ON public.launch_waitlist(interest);

ALTER TABLE public.launch_waitlist ENABLE ROW LEVEL SECURITY;

-- Service-role only; inserts come exclusively from aevum-api.
DROP POLICY IF EXISTS launch_waitlist_service_role ON public.launch_waitlist;
CREATE POLICY launch_waitlist_service_role ON public.launch_waitlist
  FOR ALL TO service_role USING (true) WITH CHECK (true);
