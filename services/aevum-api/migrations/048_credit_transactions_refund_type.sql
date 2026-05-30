-- Migration 048: Allow 'refund' in credit_transactions.type CHECK constraint
-- 2026-05-30
--
-- Bug: lib/credits.js spendCredits() refund path (negative amount) inserts
--      type='refund', but the original CHECK constraint
--      (supabase/migrations/20260523_credits_and_loyalty.sql, line 20) only allowed
--      ('purchase_earn','redemption','bonus','expiry','manual').
--      → every refund ledger insert silently failed (account_credits.balance was
--        still updated, but no credit_transactions audit row was written).
--
-- Constraint name: credit_transactions_type_check
--   Postgres auto-generates "<table>_<column>_check" for an inline anonymous
--   column CHECK. The original was declared inline as:
--     type text NOT NULL CHECK (type IN (...))
--   → name = credit_transactions_type_check
--
-- !!! NOT YET APPLIED. Apply deliberately against the AEVUM Supabase project
--     (ref iwyzbiufmdnwmddjkevf — NOT LennoxOS), same path as migration 047.
--
-- Apply command (run from repo root; needs SUPABASE_ACCESS_TOKEN in env):
--   curl -s -X POST \
--     "https://api.supabase.com/v1/projects/iwyzbiufmdnwmddjkevf/database/query" \
--     -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
--     -H "Content-Type: application/json" \
--     -d "$(jq -Rs '{query: .}' services/aevum-api/migrations/048_credit_transactions_refund_type.sql)"

ALTER TABLE credit_transactions
  DROP CONSTRAINT IF EXISTS credit_transactions_type_check;

ALTER TABLE credit_transactions
  ADD CONSTRAINT credit_transactions_type_check
  CHECK (type IN ('purchase_earn', 'redemption', 'bonus', 'expiry', 'manual', 'refund'));
