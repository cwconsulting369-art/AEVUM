-- AEVUM Script-Factory SaaS — Wave C1
-- Created: 2026-05-24 (Agent C1)
--
-- 3 Tabellen: brands (wiederverwendbare Brand-Profile), runs (Job-Queue),
-- outputs (generierte Script-Varianten).
-- Pay-per-Run via Credit-Spend (40 Credits = ~€4).

-- ─── Brand-Profile (vom User definiert, wiederverwendbar) ────────
CREATE TABLE IF NOT EXISTS public.script_factory_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  voice TEXT,
  audience TEXT,
  product_category TEXT,
  unique_selling_points JSONB DEFAULT '[]'::jsonb,
  do_not_say JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, name)
);
CREATE INDEX IF NOT EXISTS idx_script_brands_account ON public.script_factory_brands(account_id);
ALTER TABLE public.script_factory_brands ENABLE ROW LEVEL SECURITY;

-- ─── Run pro Generation (Job-Queue) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.script_factory_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.script_factory_brands(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_description TEXT,
  hook_goal TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('meta','tiktok','youtube','all')),
  variant_count INT DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','running','complete','failed','cancelled')),
  credits_spent INT DEFAULT 0,
  cost_eur NUMERIC(10,4) DEFAULT 0,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_script_runs_account ON public.script_factory_runs(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_script_runs_status ON public.script_factory_runs(status)
  WHERE status IN ('pending','running');
ALTER TABLE public.script_factory_runs ENABLE ROW LEVEL SECURITY;

-- ─── Generierte Scripts pro Run ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.script_factory_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.script_factory_runs(id) ON DELETE CASCADE,
  variant_index INT NOT NULL,
  hook TEXT NOT NULL,
  body TEXT NOT NULL,
  cta TEXT NOT NULL,
  full_script TEXT NOT NULL,
  platform_format TEXT,
  estimated_duration_sec INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_script_outputs_run ON public.script_factory_outputs(run_id, variant_index);
ALTER TABLE public.script_factory_outputs ENABLE ROW LEVEL SECURITY;
