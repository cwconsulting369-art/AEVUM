-- 018_helpbot_consent_version.sql
-- Server-side recording of consent_version for helpbot chats (DSGVO Art 7 evidence).
-- Idempotent.

ALTER TABLE IF EXISTS helpbot_conversations
  ADD COLUMN IF NOT EXISTS consent_version text;

COMMENT ON COLUMN helpbot_conversations.consent_version IS
  'DSGVO Art 7 Nachweis: Welche Consent-Version der Nutzer akzeptiert hatte als er den Helpbot benutzte.';
