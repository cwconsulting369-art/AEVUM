-- AEVUM Helpbot — Knowledge / Hand-off layer
-- Created: 2026-05-22
-- Project: iwyzbiufmdnwmddjkevf (AEVUM Supabase)
--
-- Adds an `extracted_data` JSONB column to helpbot_conversations so the
-- pre-qualification fields (industry, team_size, biggest_pain, current_tools,
-- goal_90_days, budget_indicator, timing, name, company) inferred from the
-- conversation can be cached and passed to the Audit form for pre-fill.
--
-- The actual extraction is performed by /api/helpbot/extract/:session_id
-- (admin-token gated) using Claude Haiku for cost-efficient distillation.

ALTER TABLE public.helpbot_conversations
  ADD COLUMN IF NOT EXISTS extracted_data JSONB NOT NULL DEFAULT '{}'::JSONB;

COMMENT ON COLUMN public.helpbot_conversations.extracted_data IS
  'AI-extracted pre-qualification fields {name, company, industry, team_size, biggest_pain, current_tools, goal_90_days, budget_indicator, timing}. Populated lazily by /extract endpoint.';
