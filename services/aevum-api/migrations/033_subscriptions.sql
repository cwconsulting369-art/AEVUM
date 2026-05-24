-- Migration 033 — Subscription-Tracking (Wave F2, 2026-05-24)
-- Tracks Carlos's vendor-side subscriptions globally and per-project allocations.
-- Enables: cost-aggregation per project, billable-vs-aevum-carried split, retainer-pricing inputs.
--
-- Tables:
--   public.subscriptions          — vendor-side subscriptions pool (Carlos's perspective)
--   public.project_subscriptions  — which project uses which subscription with allocation%
--
-- View:
--   public.project_cost_summary   — quick lookup of monthly cost per project

-- ──────────────────────────────────────────────────────────────────────
-- 1) Global subscription list
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor TEXT NOT NULL,                              -- 'openai','anthropic','stripe','vercel','cloudflare','supabase','n8n','klaviyo','meta','resend','mailbox.org', ...
  product TEXT NOT NULL,                              -- e.g. 'GPT-4 Plus', 'Sonnet Pro', 'Vercel Pro'
  tier TEXT,                                          -- 'free','starter','pro','team','enterprise'
  monthly_cost_eur NUMERIC(10,2),
  annual_cost_eur NUMERIC(10,2),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly','annual','pay-per-use')),
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
  started_at DATE,
  next_renewal DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subs_vendor ON public.subscriptions(vendor, status);

-- ──────────────────────────────────────────────────────────────────────
-- 2) Per-project allocations
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  allocation_pct NUMERIC(5,2) DEFAULT 100.00,        -- e.g. 25% when 4 projects share
  per_project_cost_eur_mo NUMERIC(10,2),              -- computed or manual override
  billable_to_customer BOOLEAN DEFAULT false,
  notes TEXT,
  started_at DATE DEFAULT CURRENT_DATE,
  ended_at DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_proj_subs_project ON public.project_subscriptions(project_id);
CREATE INDEX IF NOT EXISTS idx_proj_subs_subscription ON public.project_subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_proj_subs_billable ON public.project_subscriptions(billable_to_customer) WHERE billable_to_customer = true;
CREATE INDEX IF NOT EXISTS idx_proj_subs_active ON public.project_subscriptions(project_id) WHERE ended_at IS NULL;

-- ──────────────────────────────────────────────────────────────────────
-- 3) RLS — service-role only (no public policies)
-- ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_subscriptions ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────────────
-- 4) Cost-aggregation view
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.project_cost_summary AS
SELECT
  p.id AS project_id,
  p.slug AS project_slug,
  p.account_id,
  COALESCE(SUM(ps.per_project_cost_eur_mo), 0) AS total_monthly_eur,
  COALESCE(SUM(ps.per_project_cost_eur_mo) FILTER (WHERE ps.billable_to_customer), 0) AS billable_monthly_eur,
  COALESCE(SUM(ps.per_project_cost_eur_mo) FILTER (WHERE NOT ps.billable_to_customer), 0) AS aevum_carried_eur,
  COUNT(ps.id) AS subscription_count
FROM public.projects p
LEFT JOIN public.project_subscriptions ps
  ON ps.project_id = p.id AND ps.ended_at IS NULL
GROUP BY p.id, p.slug, p.account_id;

-- ──────────────────────────────────────────────────────────────────────
-- 5) Seed Carlos's known subscriptions (from memory + .env inventory)
-- ──────────────────────────────────────────────────────────────────────
INSERT INTO public.subscriptions (vendor, product, tier, monthly_cost_eur, billing_cycle, notes) VALUES
  ('anthropic',   'Claude API',           'pay-per-use', NULL,  'pay-per-use', 'Sonnet 4.5 + Opus 4.7 + Haiku 4.5 — credit-spending live'),
  ('openai',      'GPT-4 / GPT-5',        'pay-per-use', NULL,  'pay-per-use', 'via OpenRouter routing'),
  ('openrouter',  'OpenRouter',           'pay-per-use', NULL,  'pay-per-use', 'LLM-Multiplexer'),
  ('stripe',      'Stripe Standard',      'free',        0,     'monthly',     'tx-fees per payment'),
  ('supabase',    'Supabase Pro',         'pro',         25.00, 'monthly',     '5 projects: AEVUM, LennoxOS, GTS, UH, Ketolabs'),
  ('vercel',      'Vercel Pro',           'pro',         20.00, 'monthly',     'multiple deploys'),
  ('cloudflare',  'Cloudflare Free',      'free',        0,     'monthly',     '5 zones'),
  ('resend',      'Resend',               'pay-per-use', NULL,  'pay-per-use', 'transactional mail'),
  ('mailbox.org', 'Mailbox.org Standard', 'starter',     3.00,  'monthly',     'SMTP fallback'),
  ('higgsfield',  'Higgsfield',           'pro',         NULL,  'monthly',     'image+video generation'),
  ('telegram',    'Telegram Bot API',     'free',        0,     'monthly',     'multiple bots'),
  ('n8n',         'n8n Cloud',            'starter',     20.00, 'monthly',     'iamcarlostheone.app.n8n.cloud'),
  ('airtable',    'Airtable',             'team',        24.00, 'monthly',     'memory + knowledge'),
  ('fireflies',   'Fireflies',            'pro',         19.00, 'monthly',     'meeting transcripts'),
  ('hetzner',     'Hetzner Cloud VPS',    'small',       12.00, 'monthly',     'main VPS')
ON CONFLICT DO NOTHING;
