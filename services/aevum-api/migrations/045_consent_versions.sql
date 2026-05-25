-- 045_consent_versions.sql
-- Block C2 — DSGVO Audit Refresh (2026-05-25)
--
-- Adds:
--   1) consent_versions registry table — single source of truth for the
--      text-version-strings stamped onto every PII row at write-time.
--      Enables Art 7 burden-of-proof reconstructions when the
--      Datenschutzerklaerung wording changes.
--   2) consent_version columns on previously-missing PII tables:
--      - accounts            (Vollkunden + Shop-Customers)
--      - saas_waitlist       (SaaS-Tool-Waitlist)
--      - customer_leads      (Patrick/Thailand-RE intake)
--      - lead_magnet_signups (EU-AI-Act lead magnet, if table exists)
--      - leads               (lead-scraper-factory, only if PII actually stored)
--
-- Idempotent. RLS unchanged (service-role only).

-- ─── 1) Registry table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.consent_versions (
  version_id  TEXT PRIMARY KEY,                              -- e.g. 'datenschutz-v1-2026-05-19'
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  superseded_at  TIMESTAMPTZ,                                -- null = currently active
  scope          TEXT NOT NULL,                              -- 'audit' | 'waitlist' | 'helpbot' | 'global'
  text_url       TEXT,                                       -- canonical URL to that text version (e.g. /datenschutz?v=...)
  text_sha256    TEXT,                                       -- optional integrity hash of the rendered text
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS consent_versions_scope_idx
  ON public.consent_versions(scope, effective_from DESC);

ALTER TABLE public.consent_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service-role only consent_versions" ON public.consent_versions;
CREATE POLICY "service-role only consent_versions" ON public.consent_versions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE public.consent_versions IS
  'DSGVO Art 7 — Registry of consent-text versions. Every consent_version string stamped on a PII row must reference a row here (FK enforced application-side, not DB-side, to avoid blocking writes).';

-- Seed the currently active versions discovered in code (2026-05-25).
INSERT INTO public.consent_versions (version_id, scope, text_url, notes) VALUES
  ('datenschutz-v1-2026-05-19',     'audit',    '/datenschutz',                    'Initial Datenschutzerklaerung version stamped by audit flow (routes/audit.js).'),
  ('2026-05-25-v1',                 'waitlist', '/datenschutz',                    'Active default for waitlist + maintenance-banner forms.'),
  ('2026-05-24-v0-implicit',        'waitlist', '/datenschutz',                    'Implicit-consent backfill marker for legacy launch_waitlist rows (mig 041).'),
  ('helpbot-v1-2026-05-19',         'helpbot',  '/datenschutz',                    'Helpbot chat consent (set by frontend Helpbot.tsx).')
ON CONFLICT (version_id) DO NOTHING;

-- ─── 2) Add consent_version to PII tables missing it ────────────

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS consent_version TEXT,
  ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;

ALTER TABLE public.saas_waitlist
  ADD COLUMN IF NOT EXISTS consent_version TEXT,
  ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ DEFAULT now();

-- Backfill saas_waitlist with implicit marker (legacy rows pre-audit-refresh).
UPDATE public.saas_waitlist
  SET consent_version = '2026-05-24-v0-implicit'
  WHERE consent_version IS NULL;

-- customer_leads may exist (mig 020). Guard each ALTER inside DO-block.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='customer_leads') THEN
    EXECUTE 'ALTER TABLE public.customer_leads ADD COLUMN IF NOT EXISTS consent_version TEXT';
    EXECUTE 'ALTER TABLE public.customer_leads ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='lead_magnet_signups') THEN
    EXECUTE 'ALTER TABLE public.lead_magnet_signups ADD COLUMN IF NOT EXISTS consent_version TEXT';
    EXECUTE 'ALTER TABLE public.lead_magnet_signups ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ';
  END IF;

  -- leads table from lead-scraper-factory: only stamp if email/PII column present
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='leads' AND column_name='email') THEN
    EXECUTE 'ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS consent_version TEXT';
    EXECUTE 'ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ';
  END IF;
END $$;

COMMENT ON COLUMN public.accounts.consent_version IS
  'DSGVO Art 7 — stamp of which Datenschutzerklaerung the customer accepted at signup. References consent_versions.version_id.';
COMMENT ON COLUMN public.saas_waitlist.consent_version IS
  'DSGVO Art 7 — stamp of waitlist-consent text version.';
