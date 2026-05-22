-- AEVUM Approval-Layer — Lennox ↔ Carlos async decision channel
-- Created: 2026-05-22
-- Project: iwyzbiufmdnwmddjkevf (AEVUM Supabase)
--
-- Lennox writes a row + sends TG to Carlos.
-- Carlos replies "approve A7" / "deny A7" in TG → webhook updates the row.
-- Lennox polls /api/approval/:id and continues work async once decided.

CREATE TABLE IF NOT EXISTS public.pending_approvals (
  id            TEXT        PRIMARY KEY,                  -- short code "A7", "A8", ...
  action        TEXT        NOT NULL,                     -- "merge_branch", "delete_project", ...
  description   TEXT        NOT NULL,                     -- one-liner for TG
  context       JSONB       NOT NULL DEFAULT '{}'::JSONB, -- {urls, details, ...}
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','denied','expired')),
  decided_at    TIMESTAMPTZ,
  decided_by    TEXT,                                     -- "carlos" | "system" | "auto-expire"
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  notes         TEXT
);

CREATE INDEX IF NOT EXISTS idx_pending_approvals_status_requested
  ON public.pending_approvals (status, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_pending_approvals_expires
  ON public.pending_approvals (expires_at)
  WHERE status = 'pending';

ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;

-- Service-role only — everything goes through aevum-api with the service-role key.
DROP POLICY IF EXISTS "service-role only" ON public.pending_approvals;
CREATE POLICY "service-role only" ON public.pending_approvals
  FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE public.pending_approvals IS
  'Lennox→Carlos async approval channel via Telegram. Service-role only.';
