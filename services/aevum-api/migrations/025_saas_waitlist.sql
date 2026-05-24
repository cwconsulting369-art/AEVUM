-- 025_saas_waitlist.sql
-- AEVUM SaaS Coming-Soon waitlist (Pfad C — Script-Factory, DSGVO-Factory, Lead-Factory)
-- Created: 2026-05-24 — Wave B4 (Helpbot 3-Varianten Routing)
--
-- Captures emails of users who want early access to in-build SaaS tools.
-- Privacy: email stored as-is (lowercased); user explicitly opts in via UI prompt.
-- Idempotent: UNIQUE(tool, email) prevents duplicates.

CREATE TABLE IF NOT EXISTS public.saas_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool TEXT NOT NULL CHECK (tool IN ('script-factory','dsgvo-factory','lead-factory')),
  email TEXT NOT NULL,
  context TEXT,
  notified BOOLEAN DEFAULT false,
  ts TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tool, email)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_tool ON public.saas_waitlist(tool, notified);
CREATE INDEX IF NOT EXISTS idx_waitlist_ts ON public.saas_waitlist(ts DESC);

ALTER TABLE public.saas_waitlist ENABLE ROW LEVEL SECURITY;

-- Service-role only; no anon access. Inserts come exclusively from aevum-api.
DROP POLICY IF EXISTS saas_waitlist_service_role ON public.saas_waitlist;
CREATE POLICY saas_waitlist_service_role ON public.saas_waitlist
  FOR ALL TO service_role USING (true) WITH CHECK (true);
