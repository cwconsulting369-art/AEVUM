-- AEVUM Helpbot — Conversation persistence
-- Created: 2026-05-22
-- Project: iwyzbiufmdnwmddjkevf (AEVUM Supabase)
--
-- Anonymous chat-widget on aevum-system.de.
-- One row per session_id. Messages appended as JSONB array.
-- IP is anonymized (last octet zeroed) at write time.
-- 90-day retention via cron (out of scope here — manual job).

CREATE TABLE IF NOT EXISTS public.helpbot_conversations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT        NOT NULL UNIQUE,
  messages        JSONB       NOT NULL DEFAULT '[]'::JSONB,
  message_count   INTEGER     NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_msg_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_anonymized   TEXT,                                    -- e.g. "146.52.231.0" or "2a01:4f9:c011:abcd::"
  user_agent      TEXT,
  meta            JSONB       NOT NULL DEFAULT '{}'::JSONB -- {referrer, lang, ...}
);

CREATE INDEX IF NOT EXISTS idx_helpbot_session
  ON public.helpbot_conversations (session_id);

CREATE INDEX IF NOT EXISTS idx_helpbot_last_msg
  ON public.helpbot_conversations (last_msg_at DESC);

ALTER TABLE public.helpbot_conversations ENABLE ROW LEVEL SECURITY;

-- Service-role only — no public read/write (widget talks via aevum-api with service role)
DROP POLICY IF EXISTS helpbot_service_all ON public.helpbot_conversations;
CREATE POLICY helpbot_service_all ON public.helpbot_conversations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE public.helpbot_conversations IS
  'AEVUM helpbot chat sessions. Anonymous, IP-anonymized. 90-day retention.';
