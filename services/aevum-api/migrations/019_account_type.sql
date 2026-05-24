-- AEVUM v2 — User-Klassen-Trennung (Carlos 2026-05-24)
-- Project: iwyzbiufmdnwmddjkevf
--
-- Zweck: trennt Shop-Käufer (Einmal-Käufer, kein Personal-Agent) von Vollkunden
-- (Audit-getriebene Partnerschaft, Personal-OS-Agent + Dashboard) auf Schema-Ebene.
--
-- Memory: project_aevum_user_classes_separation.md
--
-- Idempotent: ja, alles IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.

BEGIN;

-- 1) account_type: 'shop' (Variante A — Blueprint-Shop-Käufer)
--                  'customer' (Variante B — Vollkunde nach Audit/Partnerschaft)
--                  'saas' (Variante C — SaaS-Nutzer auf Credits, kein voller Partner)
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS account_type TEXT
    NOT NULL DEFAULT 'customer'
    CHECK (account_type IN ('shop', 'customer', 'saas'));

COMMENT ON COLUMN public.accounts.account_type IS
  'User-Klasse: shop=Blueprint-Käufer (kein Personal-Agent), customer=Vollkunde (volle AEVUM-Partnerschaft mit Personal-Agent), saas=SaaS-Credit-Nutzer (z.B. Script-Factory)';

-- 2) has_agent_access: explizites Flag — Gating-Source-of-Truth für Personal-Agent
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS has_agent_access BOOLEAN
    NOT NULL DEFAULT false;

COMMENT ON COLUMN public.accounts.has_agent_access IS
  'Hat der Account Zugriff auf Personal-OS-Agent? Default: false. Wird true für account_type=customer + manuelle Upgrades.';

-- 3) Backfill: alle existierenden Accounts sind Vollkunden (Miguel/Tommy/Patrick etc.)
--    Ausnahme: client_zero (= Carlos selbst) bleibt customer mit agent_access
UPDATE public.accounts
SET account_type = 'customer',
    has_agent_access = true
WHERE account_type = 'customer'    -- default zu explizit overschreiben
  AND has_agent_access = false;

-- 4) Index für gating-checks
CREATE INDEX IF NOT EXISTS idx_accounts_type ON public.accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_agent_access ON public.accounts(has_agent_access) WHERE has_agent_access = true;

-- 5) Verify
DO $$
DECLARE
  customer_count INT;
  shop_count INT;
  agent_count INT;
BEGIN
  SELECT count(*) INTO customer_count FROM public.accounts WHERE account_type = 'customer';
  SELECT count(*) INTO shop_count FROM public.accounts WHERE account_type = 'shop';
  SELECT count(*) INTO agent_count FROM public.accounts WHERE has_agent_access = true;
  RAISE NOTICE 'mig019: customers=%, shop=%, agent_access=%', customer_count, shop_count, agent_count;
END $$;

COMMIT;
