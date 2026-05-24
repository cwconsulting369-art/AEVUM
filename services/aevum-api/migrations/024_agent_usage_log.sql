-- AEVUM Credit-Spending-Layer — Agent-Usage-Log + Daily-Cap
-- Created: 2026-05-24 (Agent A5)
-- Purpose: track Anthropic LLM-spend per account + global, enforce daily-caps to prevent credit-waste

CREATE TABLE IF NOT EXISTS public.agent_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  session_id UUID,
  endpoint TEXT NOT NULL,                    -- '/api/helpbot/chat', '/api/me/projects/:slug/agent/chat', etc.
  model TEXT,                                 -- 'claude-sonnet-4-5', etc.
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  cost_eur NUMERIC(10,6) DEFAULT 0,
  credits_spent INT DEFAULT 0,
  context TEXT,                               -- 'helpbot-question', 'agent-chat', 'factory-script', etc.
  ts TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_account_ts ON public.agent_usage_log(account_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_usage_ts ON public.agent_usage_log(ts DESC);

ALTER TABLE public.agent_usage_log ENABLE ROW LEVEL SECURITY;

-- Daily-spend aggregates on accounts (rolling 24h, auto-reset via RPC)
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS daily_agent_spend_eur NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_spend_reset_at TIMESTAMPTZ DEFAULT now();

-- App-settings key-value store (general-purpose; here for agent-caps)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.app_settings (key, value) VALUES
  ('agent_daily_cap_eur_per_account', '5.00'::jsonb),
  ('agent_daily_cap_eur_global', '50.00'::jsonb),
  ('agent_max_messages_per_conversation', '20'::jsonb),
  ('agent_credit_cost_per_message', '2'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RPC: idempotent increment of daily-spend with 24h-rolling reset
CREATE OR REPLACE FUNCTION public.increment_daily_spend(p_account_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.accounts
  SET daily_agent_spend_eur = CASE
        WHEN daily_spend_reset_at < (now() - interval '1 day') THEN p_amount
        ELSE COALESCE(daily_agent_spend_eur, 0) + p_amount
      END,
      daily_spend_reset_at = CASE
        WHEN daily_spend_reset_at < (now() - interval '1 day') THEN now()
        ELSE daily_spend_reset_at
      END
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
