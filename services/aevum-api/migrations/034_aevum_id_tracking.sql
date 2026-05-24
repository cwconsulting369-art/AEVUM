-- AEVUM-ID + Source-Tracking + Auto-Upgrade-Trigger
-- Project: iwyzbiufmdnwmddjkevf
-- Carlos 2026-05-24: 4 Account-Stufen, AEV-XXXXX IDs, Funnel-Tracking
--
-- Idempotent: ALTER ADD COLUMN IF NOT EXISTS

BEGIN;

-- 1) Sequential AEVUM-ID Sequence
CREATE SEQUENCE IF NOT EXISTS public.aevum_id_seq START 1 INCREMENT 1;

-- 2) accounts erweitern um Tracking-Felder
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS aevum_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS source TEXT,                       -- 'shop-blueprint:content-factory', 'saas-signup:script-factory', 'audit-funnel', 'direct', 'referral:X', 'helpbot-handoff'
  ADD COLUMN IF NOT EXISTS first_purchase_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_purchase_amount_eur NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS first_purchase_type TEXT,          -- 'blueprint','saas-credits','dfy','audit','bundle'
  ADD COLUMN IF NOT EXISTS lifetime_value_eur NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();

COMMENT ON COLUMN public.accounts.aevum_id IS
  'Human-readable Account-ID Format AEV-00001 — auto-generated via aevum_id_seq beim Account-Create';
COMMENT ON COLUMN public.accounts.source IS
  'Akquisitions-Quelle für Funnel-Tracking. Format <kanal>:<detail>';
COMMENT ON COLUMN public.accounts.lifetime_value_eur IS
  'Running total aller Käufe (Blueprint+DFY+Credits+Setup+Retainer). Updated bei jedem Stripe-Webhook.';

-- 3) Backfill: existing 8 accounts bekommen aevum_id
UPDATE public.accounts
SET aevum_id = 'AEV-' || LPAD(nextval('public.aevum_id_seq')::text, 5, '0')
WHERE aevum_id IS NULL;

-- 4) Indexes für Master-Dashboard-Queries
CREATE INDEX IF NOT EXISTS idx_accounts_aevum_id ON public.accounts(aevum_id);
CREATE INDEX IF NOT EXISTS idx_accounts_source ON public.accounts(source) WHERE source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_ltv ON public.accounts(lifetime_value_eur DESC) WHERE status != 'archived';
CREATE INDEX IF NOT EXISTS idx_accounts_first_purchase ON public.accounts(first_purchase_at DESC) WHERE first_purchase_at IS NOT NULL;

-- 5) Trigger: bei INSERT neuer accounts automatisch aevum_id setzen
CREATE OR REPLACE FUNCTION public.set_aevum_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.aevum_id IS NULL THEN
    NEW.aevum_id := 'AEV-' || LPAD(nextval('public.aevum_id_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_aevum_id ON public.accounts;
CREATE TRIGGER trg_set_aevum_id
  BEFORE INSERT ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_aevum_id();

-- 6) Credit-Packages (für Stripe-Initial-Credit-Purchase)
CREATE TABLE IF NOT EXISTS public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_eur NUMERIC(10,2) NOT NULL,
  credits INT NOT NULL,
  bonus_pct NUMERIC(5,2) DEFAULT 0,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.credit_packages (slug, name, price_eur, credits, bonus_pct, sort_order) VALUES
  ('starter', 'Starter', 10, 100, 0, 10),
  ('growth', 'Growth', 25, 300, 20, 20),
  ('pro', 'Pro', 50, 700, 40, 30)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- 7) Materialized Funnel-View für Master-Dashboard
CREATE OR REPLACE VIEW public.customer_funnel AS
SELECT
  account_type,
  has_agent_access,
  count(*) AS account_count,
  count(*) FILTER (WHERE first_purchase_at IS NOT NULL) AS purchasers,
  COALESCE(SUM(lifetime_value_eur), 0) AS total_ltv_eur,
  COALESCE(AVG(lifetime_value_eur) FILTER (WHERE lifetime_value_eur > 0), 0) AS avg_ltv_eur
FROM public.accounts
WHERE status != 'archived'
GROUP BY account_type, has_agent_access
ORDER BY account_type;

-- Verify
DO $$
DECLARE
  total INT;
  with_id INT;
  pkg_count INT;
BEGIN
  SELECT count(*) INTO total FROM public.accounts;
  SELECT count(*) INTO with_id FROM public.accounts WHERE aevum_id IS NOT NULL;
  SELECT count(*) INTO pkg_count FROM public.credit_packages;
  RAISE NOTICE 'mig034: accounts=%, with aevum_id=%, credit_packages=%', total, with_id, pkg_count;
END $$;

COMMIT;
