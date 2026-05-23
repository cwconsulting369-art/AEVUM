-- Internal Security-Firewall migration (2026-05-24)
-- CR-01 Magic-Link single-use + rate-limit verify
-- CR-02 DSGVO Export/Erase Challenge-Flow
-- CR-03 IP-Anonymisierung (raw `ip` columns dropped, replaced by ip_anonymized text)

CREATE TABLE IF NOT EXISTS magic_link_used (
  token_hash text PRIMARY KEY,
  used_at timestamptz NOT NULL DEFAULT now(),
  email text,
  ip_anonymized text
);
CREATE INDEX IF NOT EXISTS idx_mlu_used_at ON magic_link_used(used_at);

CREATE TABLE IF NOT EXISTS dsgvo_challenge (
  token_hash text PRIMARY KEY,
  email text NOT NULL,
  action text NOT NULL CHECK (action IN ('export','erase')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  ip_anonymized text
);
CREATE INDEX IF NOT EXISTS idx_dsg_ch_expires ON dsgvo_challenge(expires_at);

-- Drop legacy boolean ip_anonymized flag, add proper text storage
ALTER TABLE security_events DROP COLUMN IF EXISTS ip_anonymized;
ALTER TABLE audit_logs       DROP COLUMN IF EXISTS ip_anonymized;
ALTER TABLE security_events ADD COLUMN IF NOT EXISTS ip_anonymized text;
ALTER TABLE audit_logs       ADD COLUMN IF NOT EXISTS ip_anonymized text;
ALTER TABLE consent_log      ADD COLUMN IF NOT EXISTS ip_anonymized text;
ALTER TABLE erasure_log      ADD COLUMN IF NOT EXISTS ip_anonymized text;
ALTER TABLE orders           ADD COLUMN IF NOT EXISTS ip_anonymized text;

-- Backfill: anonymize existing raw IPs into the new column
UPDATE security_events SET ip_anonymized = CASE
  WHEN ip IS NULL OR ip = 'unknown' THEN NULL
  WHEN ip LIKE '%:%' THEN array_to_string((string_to_array(ip, ':'))[1:4], ':') || '::'
  WHEN array_length(string_to_array(ip, '.'),1) = 4 THEN
    (string_to_array(ip, '.'))[1] || '.' || (string_to_array(ip, '.'))[2] || '.' || (string_to_array(ip, '.'))[3] || '.0'
  ELSE NULL END WHERE ip IS NOT NULL;
UPDATE audit_logs SET ip_anonymized = CASE
  WHEN ip IS NULL OR ip = 'unknown' THEN NULL
  WHEN ip LIKE '%:%' THEN array_to_string((string_to_array(ip, ':'))[1:4], ':') || '::'
  WHEN array_length(string_to_array(ip, '.'),1) = 4 THEN
    (string_to_array(ip, '.'))[1] || '.' || (string_to_array(ip, '.'))[2] || '.' || (string_to_array(ip, '.'))[3] || '.0'
  ELSE NULL END WHERE ip IS NOT NULL;
UPDATE consent_log SET ip_anonymized = CASE
  WHEN ip IS NULL OR ip = 'unknown' THEN NULL
  WHEN ip LIKE '%:%' THEN array_to_string((string_to_array(ip, ':'))[1:4], ':') || '::'
  WHEN array_length(string_to_array(ip, '.'),1) = 4 THEN
    (string_to_array(ip, '.'))[1] || '.' || (string_to_array(ip, '.'))[2] || '.' || (string_to_array(ip, '.'))[3] || '.0'
  ELSE NULL END WHERE ip IS NOT NULL AND ip_anonymized IS NULL;
UPDATE erasure_log SET ip_anonymized = CASE
  WHEN ip IS NULL OR ip = 'unknown' THEN NULL
  WHEN ip LIKE '%:%' THEN array_to_string((string_to_array(ip, ':'))[1:4], ':') || '::'
  WHEN array_length(string_to_array(ip, '.'),1) = 4 THEN
    (string_to_array(ip, '.'))[1] || '.' || (string_to_array(ip, '.'))[2] || '.' || (string_to_array(ip, '.'))[3] || '.0'
  ELSE NULL END WHERE ip IS NOT NULL AND ip_anonymized IS NULL;
UPDATE orders SET ip_anonymized = CASE
  WHEN ip IS NULL OR ip = 'unknown' THEN NULL
  WHEN ip LIKE '%:%' THEN array_to_string((string_to_array(ip, ':'))[1:4], ':') || '::'
  WHEN array_length(string_to_array(ip, '.'),1) = 4 THEN
    (string_to_array(ip, '.'))[1] || '.' || (string_to_array(ip, '.'))[2] || '.' || (string_to_array(ip, '.'))[3] || '.0'
  ELSE NULL END WHERE ip IS NOT NULL AND ip_anonymized IS NULL;

-- Migrate audits.meta.ip → audits.meta.ip_anonymized
UPDATE audits SET meta = meta - 'ip' || jsonb_build_object('ip_anonymized', CASE
  WHEN meta->>'ip' IS NULL OR meta->>'ip' = 'unknown' THEN NULL
  WHEN meta->>'ip' LIKE '%:%' THEN array_to_string((string_to_array(meta->>'ip', ':'))[1:4], ':') || '::'
  WHEN array_length(string_to_array(meta->>'ip', '.'),1) = 4 THEN
    (string_to_array(meta->>'ip', '.'))[1] || '.' || (string_to_array(meta->>'ip', '.'))[2] || '.' || (string_to_array(meta->>'ip', '.'))[3] || '.0'
  ELSE NULL END) WHERE meta ? 'ip';

-- Drop raw IP columns
ALTER TABLE security_events DROP COLUMN IF EXISTS ip;
ALTER TABLE audit_logs       DROP COLUMN IF EXISTS ip;
ALTER TABLE consent_log      DROP COLUMN IF EXISTS ip;
ALTER TABLE erasure_log      DROP COLUMN IF EXISTS ip;
ALTER TABLE orders           DROP COLUMN IF EXISTS ip;
