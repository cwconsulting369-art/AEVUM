-- AEVUM DSGVO B4/B6 — Audit-Log table + automatic triggers on PII tables
-- Created: 2026-05-20
-- Project: iwyzbiufmdnwmddjkevf (AEVUM Supabase)
--
-- Adds:
--   1) audit_logs       — generic change-trail for every PII-bearing table
--   2) audit_pii_change — trigger function (mirrors UH 038)
--   3) Triggers on audits, orders, consent_log, erasure_log
--
-- All actions by service_role get logged too (SECURITY DEFINER → bypasses RLS for INSERT).

-- ─── 1) audit_logs table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id        UUID,                       -- nullable: service_role writes have no auth.uid()
  actor_label     TEXT,                       -- 'service_role' | 'admin' | 'system_cron' | api endpoint
  action          TEXT        NOT NULL,       -- insert | update | delete | admin_action
  table_name      TEXT        NOT NULL,
  record_id       TEXT,                       -- not always UUID (e.g. stripe session ids)
  old_data        JSONB,
  new_data        JSONB,
  ip              TEXT,
  user_agent      TEXT,
  ip_anonymized   BOOLEAN     DEFAULT FALSE,
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS audit_logs_table_idx       ON public.audit_logs (table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_record_idx      ON public.audit_logs (table_name, record_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx      ON public.audit_logs (action, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx     ON public.audit_logs (created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- service_role bypasses RLS; no public/anon policies → nobody else can read/write
COMMENT ON TABLE public.audit_logs IS 'DSGVO Art 30 Verarbeitungsverzeichnis — auto-trail for every PII write';

-- ─── 2) Generic audit-trigger function ──────────────────────────
CREATE OR REPLACE FUNCTION public.audit_pii_change()
RETURNS TRIGGER AS $$
DECLARE
  v_actor    UUID;
  v_old      JSONB;
  v_new      JSONB;
  v_record   TEXT;
BEGIN
  v_actor := auth.uid();  -- nullable when service_role

  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    v_new := NULL;
    v_record := COALESCE((OLD).id::TEXT, NULL);
  ELSIF TG_OP = 'INSERT' THEN
    v_old := NULL;
    v_new := to_jsonb(NEW);
    v_record := COALESCE((NEW).id::TEXT, NULL);
  ELSE  -- UPDATE
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_record := COALESCE((NEW).id::TEXT, NULL);
    -- Skip no-op updates that only touch updated_at
    IF (v_old - 'updated_at') = (v_new - 'updated_at') THEN
      RETURN NEW;
    END IF;
  END IF;

  INSERT INTO public.audit_logs (
    actor_id, actor_label, action, table_name, record_id, old_data, new_data
  ) VALUES (
    v_actor,
    CASE WHEN v_actor IS NULL THEN 'service_role' ELSE 'authenticated' END,
    LOWER(TG_OP),
    TG_TABLE_NAME,
    v_record,
    v_old,
    v_new
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.audit_pii_change() IS 'Auto-audit-trigger — even service_role writes get logged';

-- ─── 3) Apply to PII tables ─────────────────────────────────────
DROP TRIGGER IF EXISTS audit_audits ON public.audits;
CREATE TRIGGER audit_audits
  AFTER INSERT OR UPDATE OR DELETE ON public.audits
  FOR EACH ROW EXECUTE FUNCTION public.audit_pii_change();

DROP TRIGGER IF EXISTS audit_orders ON public.orders;
CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_pii_change();

DROP TRIGGER IF EXISTS audit_consent_log ON public.consent_log;
CREATE TRIGGER audit_consent_log
  AFTER INSERT OR UPDATE OR DELETE ON public.consent_log
  FOR EACH ROW EXECUTE FUNCTION public.audit_pii_change();

DROP TRIGGER IF EXISTS audit_erasure_log ON public.erasure_log;
CREATE TRIGGER audit_erasure_log
  AFTER INSERT OR UPDATE OR DELETE ON public.erasure_log
  FOR EACH ROW EXECUTE FUNCTION public.audit_pii_change();
