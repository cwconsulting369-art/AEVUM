-- AEVUM v2 — Customer Project-Agent Conversations
-- Created: 2026-05-22
-- Project: iwyzbiufmdnwmddjkevf (AEVUM Supabase)
--
-- One conversation row per (project_id, session_id, channel).
-- Channel: 'portal' (web widget), 'tg' (telegram), 'terminal' (curl/CLI), 'api' (programmatic)
-- Messages persisted as JSONB array — analogous to helpbot_conversations but project-scoped.
--
-- Retention: 90d auto-delete via cron for inactive sessions (DSGVO).
-- Memory-files live on filesystem (data/agent-memory/<account>/<project>/) — NOT in DB.

CREATE TABLE IF NOT EXISTS public.agent_conversations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  session_id      TEXT        NOT NULL,
  channel         TEXT        NOT NULL DEFAULT 'portal'
                              CHECK (channel IN ('portal', 'tg', 'terminal', 'api')),
  messages        JSONB       NOT NULL DEFAULT '[]'::JSONB,
  message_count   INTEGER     NOT NULL DEFAULT 0,
  total_chars     INTEGER     NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_msg_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  meta            JSONB       NOT NULL DEFAULT '{}'::JSONB,
  CONSTRAINT agent_conversations_session_unique UNIQUE (project_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_conv_project
  ON public.agent_conversations (project_id);

CREATE INDEX IF NOT EXISTS idx_agent_conv_last_msg
  ON public.agent_conversations (last_msg_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_conv_channel
  ON public.agent_conversations (project_id, channel);

ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.agent_conversations IS
  'Customer project-agent conversations across channels (portal/tg/terminal/api). Memory files live on filesystem.';
