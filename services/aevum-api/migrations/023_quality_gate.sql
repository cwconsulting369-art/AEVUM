-- AEVUM Quality-Gate — Shop-Item-Build-Tracking
-- Created: 2026-05-24 (Agent A5)
-- Tracks: which shop items have been built+tested autonomously once, gate-passed for production sell

CREATE TABLE IF NOT EXISTS public.shop_item_build_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_slug TEXT UNIQUE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('blueprint', 'dfy', 'saas', 'bundle')),
  last_build_run TIMESTAMPTZ,
  built_by TEXT,
  n8n_export_url TEXT,
  pdf_url TEXT,
  demo_video_url TEXT,
  gate_passed BOOLEAN DEFAULT false,
  gate_passed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qgate_slug ON public.shop_item_build_status(item_slug);
CREATE INDEX IF NOT EXISTS idx_qgate_passed ON public.shop_item_build_status(gate_passed);

ALTER TABLE public.shop_item_build_status ENABLE ROW LEVEL SECURITY;

-- Seed all existing shop items as gate_passed=false (retro-active Quality-Gate)
INSERT INTO public.shop_item_build_status (item_slug, item_type, gate_passed, notes) VALUES
  ('content-factory', 'blueprint', false, 'Existing — Quality-Gate retro-aktiv pending'),
  ('lead-qualifier-pro', 'blueprint', false, 'Existing — Quality-Gate retro-aktiv pending'),
  ('reporting-dashboard-setup', 'blueprint', false, 'Existing — Quality-Gate retro-aktiv pending'),
  ('onboarding-autopilot', 'blueprint', false, 'Existing — Quality-Gate retro-aktiv pending'),
  ('newsletter-growth-machine', 'blueprint', false, 'Existing — Quality-Gate retro-aktiv pending'),
  ('cold-outreach-system', 'blueprint', false, 'Existing — Quality-Gate retro-aktiv pending'),
  ('bundle-all', 'bundle', false, 'Existing — alle Blueprints'),
  ('business-os', 'dfy', false, 'DFY-Service'),
  ('command-center-dashboard', 'dfy', false, 'DFY-Service'),
  ('ai-lead-engine', 'dfy', false, 'DFY-Service'),
  ('sales-os', 'dfy', false, 'DFY-Service'),
  ('ecommerce-os', 'dfy', false, 'DFY-Service'),
  ('automation-audit', 'dfy', false, 'DFY-Service'),
  ('website-crm', 'dfy', false, 'DFY-Service'),
  ('database-system', 'dfy', false, 'DFY-Service'),
  ('content-engine', 'dfy', false, 'DFY-Service'),
  ('hud-command-center', 'dfy', false, 'DFY-Service'),
  ('script-factory', 'saas', false, 'SaaS Variante C — Pay-per-Run + Monthly-Bundle')
ON CONFLICT (item_slug) DO NOTHING;
