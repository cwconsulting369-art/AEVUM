-- 014_project_intelligence.sql
-- Auto-Audit bei Account-Anlage: SEO, Website, LinkedIn, Social, GBP
-- Läuft als Background-Job, Ergebnisse hier gespeichert

CREATE TABLE IF NOT EXISTS public.project_intelligence (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  -- SEO
  seo_score     INTEGER,
  seo_raw       JSONB DEFAULT '{}'::jsonb,
  -- Website
  website_url   TEXT,
  website_issues JSONB DEFAULT '[]'::jsonb,
  website_meta  JSONB DEFAULT '{}'::jsonb,
  -- LinkedIn
  linkedin_url  TEXT,
  linkedin_data JSONB DEFAULT '{}'::jsonb,
  -- Social / GBP
  social_data   JSONB DEFAULT '{}'::jsonb,
  gbp_data      JSONB DEFAULT '{}'::jsonb,
  -- AI-generierter Report
  optimizations JSONB DEFAULT '[]'::jsonb,
  audit_summary TEXT,
  -- Meta
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','running','done','error')),
  error_msg     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intelligence_project ON public.project_intelligence(project_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_status  ON public.project_intelligence(status);
ALTER TABLE public.project_intelligence ENABLE ROW LEVEL SECURITY;
