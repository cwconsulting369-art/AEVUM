-- 042_waitlist_drip_tracking.sql
-- Block A3 (2026-05-25) — Pre-Launch Drip-Sequence Tracking
--
-- Extends launch_waitlist with drip-state columns + introduces launch_drip_log
-- für lifecycle-tracking (sent/opened/clicked/bounced).
--
-- Drip-Step-Mapping (siehe drip-templates.js):
--   0 = Initial (confirmation already sent via /launch endpoint, drip_step=1 after)
--   1 = "Bestätigung" (already sent on signup)
--   2 = +7d: "Was wir bauen — und warum nicht im Hustle-Modus"
--   3 = +21d: "Behind-the-scenes — was wir gerade härten"
--   4 = +35d: "10 Tage vor Launch — was du als Erstes bekommst"
--   5 = LLC-Live-Day: "Wir sind live — dein Early-Access"
--
-- Idempotent. Safe to re-apply.

ALTER TABLE public.launch_waitlist
  ADD COLUMN IF NOT EXISTS drip_step INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS drip_next_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS drip_paused BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS drip_paused_reason TEXT;

-- Backfill bestehende Signups: drip_step=1 (confirmation already sent),
-- drip_next_at = ts + 7 days (Step 2 fällt 7d nach Signup an)
UPDATE public.launch_waitlist
SET
  drip_step = 1,
  drip_next_at = ts + interval '7 days'
WHERE drip_step = 0
  AND status = 'pending'
  AND notified_at IS NOT NULL;

-- Index für Cron-Query "wer ist heute fällig?"
CREATE INDEX IF NOT EXISTS idx_launch_waitlist_drip_due
  ON public.launch_waitlist(drip_next_at)
  WHERE drip_paused = false AND status IN ('pending','confirmed');

-- ---------------------------------------------------------------------------
-- launch_drip_log: ein Eintrag pro gesendeter Drip-Mail
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.launch_drip_log (
  id              BIGSERIAL PRIMARY KEY,
  waitlist_id     UUID NOT NULL REFERENCES public.launch_waitlist(id) ON DELETE CASCADE,
  step            INT NOT NULL,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  resend_message_id TEXT,
  status          TEXT NOT NULL DEFAULT 'sent'
                    CHECK (status IN ('sent','failed','bounced','complaint')),
  error_message   TEXT,
  opened_at       TIMESTAMPTZ,
  clicked_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_drip_log_waitlist
  ON public.launch_drip_log(waitlist_id);
CREATE INDEX IF NOT EXISTS idx_drip_log_step
  ON public.launch_drip_log(step);
CREATE INDEX IF NOT EXISTS idx_drip_log_sent_at
  ON public.launch_drip_log(sent_at DESC);

-- Prevent duplicate sends (one row per waitlist_id × step max)
CREATE UNIQUE INDEX IF NOT EXISTS idx_drip_log_unique_step
  ON public.launch_drip_log(waitlist_id, step)
  WHERE status = 'sent';

-- ---------------------------------------------------------------------------
-- View: drip-funnel stats for admin dashboard
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_drip_stats AS
SELECT
  step,
  COUNT(*)                                          AS sent,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL)     AS opened,
  COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)    AS clicked,
  COUNT(*) FILTER (WHERE status = 'bounced')        AS bounced,
  COUNT(*) FILTER (WHERE status = 'failed')         AS failed
FROM public.launch_drip_log
GROUP BY step
ORDER BY step;
