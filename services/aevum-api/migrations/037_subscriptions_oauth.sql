-- Migration 037 — Subscription-Plans + Google-OAuth-Linking
-- Wave I4 — Knightvision-Style: Subscribe → Google-Login → Stripe-Subscription
-- 2026-05-24

CREATE TABLE IF NOT EXISTS subscription_plans (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_eur NUMERIC(10,2),
  credits_per_month INT,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO subscription_plans (slug, name, price_eur, credits_per_month, sort_order, features) VALUES
('starter','Starter', 19,  200,  10, '["200 Credits/Mo","Pay-per-Run","Email-Support"]'::jsonb),
('growth', 'Growth',  49,  600,  20, '["600 Credits/Mo","Pay-per-Run","Brand-Profile-Save","Priority-Support"]'::jsonb),
('pro',    'Pro',     99,  1500, 30, '["1500 Credits/Mo","Pay-per-Run","Multi-Brand-Profiles","Slack-Support"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_next_renewal TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS google_oauth_sub TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_accounts_google_sub
  ON accounts(google_oauth_sub) WHERE google_oauth_sub IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_stripe_sub
  ON accounts(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_subscription_plan
  ON accounts(subscription_plan) WHERE subscription_plan IS NOT NULL;
