-- AEVUM v2 — Account/Project Model + Blueprint Library
-- Project: iwyzbiufmdnwmddjkevf (AEVUM-Supabase)
-- Date: 2026-05-22
-- Source: AEVUM-V2-MASTER-VISION + AEVUM-V2-SCHEMAS + Carlos's Account/Project-Direktive
--
-- Architecture (Carlos 2026-05-22):
--   1 Account (= 1 Person/Firma) → 1 Account-Profile (Network) + 1 Account-Agent (Master)
--   1 Account → N Projects → each Project has 1 Dashboard + 1 Project-Agent + N Workflows
--   Account-Agent steuert Project-Agents (Orchestrierung), aber Project-Agents bleiben isoliert
--   Blueprint-Library: zentrale Templates für Dashboards/Agents/Workflows/Pricing/Marketing-Thesis
--
-- Apply via: Supabase SQL Editor (paste full file) ODER aevum-api migration-runner
-- Risk: Low — additive only, all IF NOT EXISTS. New tables RLS-enabled (service-role only).
-- Reversible: Yes — drop all new tables + new audits cols

-- ============================================================
-- PART A: ACCOUNT LAYER (1 Account = 1 Kunde, hat N Projects)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  business_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'active', 'paused', 'churned')),
  client_zero BOOLEAN DEFAULT false,
  contact_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounts_status ON public.accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_slug ON public.accounts(slug);
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.accounts IS 'AEVUM v2 Account = 1 Kunde (Person/Firma). Hat N Projects.';

-- Account-Profile: Netzwerk-Profil (kuratierter Unternehmer-Member-Pool)
CREATE TABLE IF NOT EXISTS public.account_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL UNIQUE REFERENCES public.accounts(id) ON DELETE CASCADE,
  display_name TEXT,
  industry TEXT,
  team_size TEXT,
  revenue_band TEXT,
  vision TEXT,
  looking_for JSONB DEFAULT '[]'::jsonb,
  socials JSONB DEFAULT '{}'::jsonb,
  bio TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'network', 'public')),
  member_since DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_profiles_visibility ON public.account_profiles(visibility);
ALTER TABLE public.account_profiles ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.account_profiles IS 'Netzwerk-Profil pro Account (Industry, Vision, Synergien). Visibility: private|network|public.';

-- Account-Agent: Master-Agent pro Account (orchestriert Project-Agents)
CREATE TABLE IF NOT EXISTS public.account_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL UNIQUE REFERENCES public.accounts(id) ON DELETE CASCADE,
  agent_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  channels JSONB DEFAULT '{}'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  guardrails JSONB DEFAULT '{}'::jsonb,
  deployment_status TEXT DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'deployed', 'paused', 'errored')),
  deployment_target TEXT,
  deployed_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_agents_account ON public.account_agents(account_id);
CREATE INDEX IF NOT EXISTS idx_account_agents_status ON public.account_agents(deployment_status);
ALTER TABLE public.account_agents ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.account_agents IS 'Master-Agent pro Account. Steuert Project-Agents (orchestriert), liest aggregierte KPIs.';

-- Account-Permissions: Sharing-Defaults auf Account-Level
CREATE TABLE IF NOT EXISTS public.account_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL UNIQUE REFERENCES public.accounts(id) ON DELETE CASCADE,
  share_logo BOOLEAN DEFAULT false,
  share_company_name BOOLEAN DEFAULT false,
  share_industry BOOLEAN DEFAULT true,
  share_revenue_band BOOLEAN DEFAULT false,
  share_team_size BOOLEAN DEFAULT false,
  share_kpis BOOLEAN DEFAULT false,
  share_kpi_deltas BOOLEAN DEFAULT false,
  share_case_study BOOLEAN DEFAULT false,
  share_testimonial_quote BOOLEAN DEFAULT false,
  share_video_testimonial BOOLEAN DEFAULT false,
  channel_website BOOLEAN DEFAULT false,
  channel_linkedin BOOLEAN DEFAULT false,
  channel_pitchdeck BOOLEAN DEFAULT false,
  channel_internal_network BOOLEAN DEFAULT true,
  anonymize_revenue BOOLEAN DEFAULT true,
  anonymize_industry_detail BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,
  consent_signed_by TEXT,
  consent_document_url TEXT,
  consent_hash TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_permissions_account ON public.account_permissions(account_id);
ALTER TABLE public.account_permissions ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.account_permissions IS 'Default-Permissions auf Account-Level. Projekte können überschreiben.';

-- ============================================================
-- PART B: PROJECT LAYER (1 Project = 1 Business-Setup, hat 1 Dashboard + 1 Agent)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  subdomain TEXT UNIQUE,
  status TEXT DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'active', 'paused', 'churned')),
  tier TEXT CHECK (tier IN ('audit', 'setup', 'retainer-light', 'retainer-full', 'enterprise')),
  industry TEXT,
  marketing_thesis JSONB,
  pricing JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_projects_account ON public.projects(account_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_subdomain ON public.projects(subdomain);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.projects IS 'Project = ein konkretes Business-Setup. Account kann N haben. Eigenes Dashboard + Agent.';

-- Project-Dashboards: 1:1 zu project
CREATE TABLE IF NOT EXISTS public.project_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  blueprint_id TEXT NOT NULL,
  blueprint_version TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  branding JSONB DEFAULT '{}'::jsonb,
  modules_enabled JSONB DEFAULT '[]'::jsonb,
  data_sources JSONB DEFAULT '{}'::jsonb,
  deployment_status TEXT DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'deployed', 'paused', 'errored')),
  deployment_url TEXT,
  deployed_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_dashboards_project ON public.project_dashboards(project_id);
CREATE INDEX IF NOT EXISTS idx_project_dashboards_blueprint ON public.project_dashboards(blueprint_id);
ALTER TABLE public.project_dashboards ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.project_dashboards IS 'Dashboard-Instance pro Projekt, basierend auf Blueprint.';

-- Project-Agents: 1:1 zu project (gesteuert via Account-Agent)
CREATE TABLE IF NOT EXISTS public.project_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  blueprint_id TEXT NOT NULL,
  blueprint_version TEXT NOT NULL,
  agent_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  channels JSONB DEFAULT '{}'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  guardrails JSONB DEFAULT '{}'::jsonb,
  context_refs JSONB DEFAULT '{}'::jsonb,
  deployment_status TEXT DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'deployed', 'paused', 'errored')),
  deployment_target TEXT,
  deployment_url TEXT,
  deployed_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  parent_account_agent_id UUID REFERENCES public.account_agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_agents_project ON public.project_agents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_agents_account_agent ON public.project_agents(parent_account_agent_id);
CREATE INDEX IF NOT EXISTS idx_project_agents_status ON public.project_agents(deployment_status);
ALTER TABLE public.project_agents ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.project_agents IS 'Project-OS-Agent pro Projekt. Daten-isoliert. Steuerbar via parent account_agent.';

-- Project-Workflows: N pro Project
CREATE TABLE IF NOT EXISTS public.project_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  blueprint_id TEXT NOT NULL,
  blueprint_version TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'deployed', 'paused', 'errored')),
  deployment_target TEXT,
  deployment_url TEXT,
  deployed_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_workflows_project ON public.project_workflows(project_id);
CREATE INDEX IF NOT EXISTS idx_project_workflows_blueprint ON public.project_workflows(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_project_workflows_status ON public.project_workflows(status);
ALTER TABLE public.project_workflows ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.project_workflows IS 'Workflow-Blueprint-Instanzen pro Projekt.';

-- Project-APIs: Read-only Keys pro Projekt (encrypted)
CREATE TABLE IF NOT EXISTS public.project_apis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  key_label TEXT,
  key_encrypted TEXT NOT NULL,
  scope TEXT DEFAULT 'read-only' CHECK (scope IN ('read-only', 'read-write')),
  added_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  health TEXT DEFAULT 'unknown' CHECK (health IN ('ok', 'expired', 'revoked', 'unknown'))
);

CREATE INDEX IF NOT EXISTS idx_project_apis_project ON public.project_apis(project_id);
CREATE INDEX IF NOT EXISTS idx_project_apis_service ON public.project_apis(service);
ALTER TABLE public.project_apis ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.project_apis IS 'Read-only API-Keys pro Projekt. Encryption-Key NIE in DB.';

-- Project-Permissions: optional Override über Account-Permissions
CREATE TABLE IF NOT EXISTS public.project_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  override_account_defaults BOOLEAN DEFAULT false,
  share_logo BOOLEAN,
  share_company_name BOOLEAN,
  share_industry BOOLEAN,
  share_revenue_band BOOLEAN,
  share_kpis BOOLEAN,
  share_kpi_deltas BOOLEAN,
  share_case_study BOOLEAN,
  channel_website BOOLEAN,
  channel_linkedin BOOLEAN,
  channel_pitchdeck BOOLEAN,
  channel_internal_network BOOLEAN,
  anonymize_revenue BOOLEAN,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_permissions_project ON public.project_permissions(project_id);
ALTER TABLE public.project_permissions ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.project_permissions IS 'Optional Project-Level-Override über Account-Permissions. override_account_defaults=true aktiviert.';

-- ============================================================
-- PART C: BLUEPRINT LIBRARY (Templates für alles Modulare)
-- ============================================================

-- Blueprint Dashboards: wiederverwendbare Dashboard-Templates
CREATE TABLE IF NOT EXISTS public.blueprint_dashboards (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  category TEXT,
  default_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_kpi_strip JSONB DEFAULT '[]'::jsonb,
  config_schema JSONB NOT NULL,
  required_data_sources JSONB DEFAULT '[]'::jsonb,
  preview_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_dashboards_category ON public.blueprint_dashboards(category);
CREATE INDEX IF NOT EXISTS idx_blueprint_dashboards_active ON public.blueprint_dashboards(is_active);
ALTER TABLE public.blueprint_dashboards ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.blueprint_dashboards IS 'Dashboard-Templates für Project-Dashboards.';

-- Blueprint Agents: wiederverwendbare Agent-Templates
CREATE TABLE IF NOT EXISTS public.blueprint_agents (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  agent_type TEXT CHECK (agent_type IN ('account-master', 'project-os', 'specialized')),
  category TEXT,
  default_persona TEXT,
  default_skills JSONB DEFAULT '[]'::jsonb,
  default_guardrails JSONB DEFAULT '{}'::jsonb,
  config_schema JSONB NOT NULL,
  required_apis JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_agents_type ON public.blueprint_agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_blueprint_agents_active ON public.blueprint_agents(is_active);
ALTER TABLE public.blueprint_agents ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.blueprint_agents IS 'Agent-Templates für Account-Master + Project-OS-Agents.';

-- Blueprint Workflows: Workflow-Library
CREATE TABLE IF NOT EXISTS public.blueprint_workflows (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  category TEXT CHECK (category IN ('sales', 'reporting', 'content', 'automation', 'monitoring', 'integration')),
  deployment_target TEXT CHECK (deployment_target IN ('n8n', 'aevum-internal', 'customer-self-hosted')),
  inputs JSONB DEFAULT '[]'::jsonb,
  outputs JSONB DEFAULT '[]'::jsonb,
  config_knobs JSONB DEFAULT '[]'::jsonb,
  dependencies JSONB DEFAULT '{}'::jsonb,
  metrics_tracked JSONB DEFAULT '[]'::jsonb,
  failure_modes JSONB DEFAULT '[]'::jsonb,
  estimated_setup_hours NUMERIC,
  estimated_monthly_value_hours_saved NUMERIC,
  blueprint_artifact_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_workflows_category ON public.blueprint_workflows(category);
CREATE INDEX IF NOT EXISTS idx_blueprint_workflows_active ON public.blueprint_workflows(is_active);
ALTER TABLE public.blueprint_workflows ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.blueprint_workflows IS 'Workflow-Library. JSON-Blueprints für n8n/internal/self-hosted.';

-- Blueprint Pricing: Pricing-Templates (Baulig-Ranges + Internal Rules)
CREATE TABLE IF NOT EXISTS public.blueprint_pricing (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  deal_type TEXT CHECK (deal_type IN ('A', 'B', 'C')),
  category TEXT,
  setup_range_min_eur NUMERIC,
  setup_range_max_eur NUMERIC,
  retainer_range_min_eur NUMERIC,
  retainer_range_max_eur NUMERIC,
  tool_margin_multiplier NUMERIC DEFAULT 2.0,
  setup_to_retainer_ratio NUMERIC,
  revenue_share_pct_default NUMERIC,
  pricing_logic JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_pricing_deal_type ON public.blueprint_pricing(deal_type);
CREATE INDEX IF NOT EXISTS idx_blueprint_pricing_active ON public.blueprint_pricing(is_active);
ALTER TABLE public.blueprint_pricing ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.blueprint_pricing IS 'Pricing-Templates basierend auf Baulig-Marktpreisen + AEVUM-Rules (Setup~=3xRetainer, Tools×2).';

-- Blueprint Audit-Forms: versionierte Audit-Form-Definitionen
CREATE TABLE IF NOT EXISTS public.blueprint_audit_forms (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  categories JSONB NOT NULL,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_audit_forms_active ON public.blueprint_audit_forms(is_active);
ALTER TABLE public.blueprint_audit_forms ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.blueprint_audit_forms IS 'Audit-Form-Definitionen (versioned).';

-- Blueprint Marketing-Thesis: für Customer-Website-Generation
-- Struktur: PROBLEM → HYPOTHESE → ANTI-THESE → DIAGNOSE → MECHANISMUS → BEISPIEL-BEWEIS → CTA
CREATE TABLE IF NOT EXISTS public.blueprint_marketing_thesis (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  industry TEXT,
  structure_schema JSONB NOT NULL,
  example_content JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blueprint_marketing_thesis_industry ON public.blueprint_marketing_thesis(industry);
CREATE INDEX IF NOT EXISTS idx_blueprint_marketing_thesis_active ON public.blueprint_marketing_thesis(is_active);
ALTER TABLE public.blueprint_marketing_thesis ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.blueprint_marketing_thesis IS 'Marketing-Thesis-Templates (Problem→Hypothese→Mechanism→Beweis→CTA). Source: Baulig-Pattern.';

-- ============================================================
-- PART D: AUDITS EXTEND (link to accounts + projects)
-- ============================================================

ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS uploaded_files JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS analysis_result JSONB;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS plan_pdf_url TEXT;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS call_booked_at TIMESTAMPTZ;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS form_version TEXT DEFAULT 'v1';
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS audit_form_blueprint_id TEXT;

CREATE INDEX IF NOT EXISTS idx_audits_account ON public.audits(account_id);
CREATE INDEX IF NOT EXISTS idx_audits_project ON public.audits(project_id);
CREATE INDEX IF NOT EXISTS idx_audits_form_version ON public.audits(form_version);

COMMENT ON COLUMN public.audits.answers IS 'v2 structured form answers (key->value)';
COMMENT ON COLUMN public.audits.analysis_result IS 'Auto-Workflow output (pain_points, blueprints, costs, roadmap, agent_spec)';
COMMENT ON COLUMN public.audits.form_version IS 'v1=legacy WGM, v2=AEVUM-v2-audit';

-- ============================================================
-- PART E: TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'accounts', 'account_profiles', 'account_agents', 'account_permissions',
    'projects', 'project_dashboards', 'project_agents', 'project_workflows', 'project_permissions',
    'blueprint_dashboards', 'blueprint_agents', 'blueprint_workflows', 'blueprint_pricing',
    'blueprint_audit_forms', 'blueprint_marketing_thesis'
  ])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $$;

-- ============================================================
-- DONE
-- ============================================================
-- Next steps:
--   1. Seed Account #0 = Carlos (client_zero=true) with Projects: AEVUM, LennoxOS, GTS, etc.
--   2. Seed Account #1 = Patrick → Project: Thailand RE
--   3. Seed Blueprint-Library initial entries (dashboard-os-standard, agent-os, workflow-lead-routing, pricing-tier-S/M/L, marketing-thesis-default)
--   4. Add /api/accounts + /api/projects + /api/blueprints routes to aevum-api
--   5. Build Account-View + Project-View in aevum-os dashboard
