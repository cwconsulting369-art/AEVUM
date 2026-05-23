-- AEVUM Credit + Loyalty System
-- 2026-05-23

-- Credits-Konto pro Account
CREATE TABLE IF NOT EXISTS account_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  lifetime_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id)
);

-- Jede Credit-Transaktion
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount integer NOT NULL, -- positiv = earn, negativ = redeem
  type text NOT NULL CHECK (type IN ('purchase_earn', 'redemption', 'bonus', 'expiry', 'manual')),
  reference_id text, -- z.B. Stripe Session ID oder Blueprint Slug
  description text,
  created_at timestamptz DEFAULT now()
);

-- Stempelkarte
CREATE TABLE IF NOT EXISTS stamp_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  stamps integer NOT NULL DEFAULT 0, -- Anzahl Käufe
  last_stamp_at timestamptz,
  reward_claimed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(account_id)
);

-- Indexes für schnelle Lookups
CREATE INDEX IF NOT EXISTS idx_credit_transactions_account_id ON credit_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(account_id, created_at DESC);

-- RLS
ALTER TABLE account_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamp_cards ENABLE ROW LEVEL SECURITY;

-- owner: jeder sieht nur seine eigenen Daten
CREATE POLICY "owner" ON account_credits FOR ALL USING (account_id = auth.uid()::uuid);
CREATE POLICY "owner" ON credit_transactions FOR ALL USING (account_id = auth.uid()::uuid);
CREATE POLICY "owner" ON stamp_cards FOR ALL USING (account_id = auth.uid()::uuid);

-- updated_at auto-trigger für account_credits
CREATE OR REPLACE FUNCTION update_account_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER account_credits_updated_at
  BEFORE UPDATE ON account_credits
  FOR EACH ROW EXECUTE FUNCTION update_account_credits_updated_at();
