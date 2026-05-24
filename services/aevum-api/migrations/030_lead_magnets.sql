-- Migration 030 — Lead-Magnets capture table (Wave D3, 2026-05-24)
-- Stores email-captures for downloadable lead-magnets (PDFs, checklists).

CREATE TABLE IF NOT EXISTS public.lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  magnet_slug TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  source TEXT,
  consent_ts TIMESTAMPTZ NOT NULL,
  notified BOOLEAN DEFAULT false,
  ts TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_magnets_magnet ON public.lead_magnets(magnet_slug, ts DESC);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_email ON public.lead_magnets(email);

ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;

-- No public policies — service-role only access via API.
