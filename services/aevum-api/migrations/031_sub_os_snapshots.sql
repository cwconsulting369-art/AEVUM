-- Migration 031 — Sub-OS Snapshots (Wave E3, 2026-05-24)
-- Persistent KPI snapshots per customer Sub-OS (UH/Ketolabs/GTS/Thailand-RE).
-- Used by aevum-api `/api/sub-os/:system/summary` cache + LennoxOS Master-Dashboard
-- Sub-OS-Health-Section. History enables trend analytics.

CREATE TABLE IF NOT EXISTS public.sub_os_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system TEXT NOT NULL,                       -- 'utilityhub','ketolabs','gts','thailand-re'
  kpis JSONB NOT NULL,
  alerts JSONB DEFAULT '[]'::jsonb,
  source TEXT,                                -- 'live','cache','fallback'
  fetched_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_os_snapshots_system_ts
  ON public.sub_os_snapshots(system, fetched_at DESC);

ALTER TABLE public.sub_os_snapshots ENABLE ROW LEVEL SECURITY;

-- No public policies — service-role only access via aevum-api.

COMMENT ON TABLE public.sub_os_snapshots IS
  'Wave E3: Periodic KPI snapshots per Customer Sub-OS for Master-Dashboard aggregator + trend history.';
COMMENT ON COLUMN public.sub_os_snapshots.system IS
  'Sub-OS identifier: utilityhub | ketolabs | gts | thailand-re';
COMMENT ON COLUMN public.sub_os_snapshots.kpis IS
  'Per-system KPI payload (schema varies). See routes/sub-os.js.';
COMMENT ON COLUMN public.sub_os_snapshots.source IS
  'live = fetched fresh; cache = TTL hit; fallback = upstream unavailable';
