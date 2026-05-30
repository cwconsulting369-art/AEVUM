-- AEVUM — account_type 'tim-premium' freischalten (Carlos 2026-05-30)
-- Project: iwyzbiufmdnwmddjkevf
--
-- Zweck: Der Script-Factory-Code (routes/factories/script.js → isTimAccount)
-- gated Tim-Customer-Management + kostenlose Nutzung an account_type='tim-premium'.
-- Die ursprüngliche CHECK-Constraint (Migration 019) erlaubte den Wert nicht →
-- toter Code-Pfad. Diese Migration erweitert die Constraint.
--
-- tim-premium = Partner-Operator (KnightVision/Tim): managt eigene Kunden,
-- lädt SSOT-Skripte hoch, nutzt Script-Factory kostenlos (kein Credit-Abzug).
--
-- Idempotent: ja (DROP + ADD constraint).

BEGIN;

ALTER TABLE public.accounts
  DROP CONSTRAINT IF EXISTS accounts_account_type_check;

ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_account_type_check
  CHECK (account_type IN ('shop', 'customer', 'saas', 'tim-premium'));

COMMENT ON COLUMN public.accounts.account_type IS
  'User-Klasse: shop=Blueprint-Käufer, customer=Vollkunde (Personal-Agent), saas=SaaS-Credit-Nutzer, tim-premium=Partner-Operator (eigene Kunden, Script-Factory kostenlos)';

COMMIT;
