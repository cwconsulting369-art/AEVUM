-- Migration 020: Patrick Roth Lead-Storage + Personal-Agent-Stub
-- Created: 2026-05-24
-- Author: Lennox (autonom)
--
-- Purpose:
--   1. customer_leads table: Generischer Lead-Store per Customer-Account/Project
--      → erstmal für Patrick, später für andere AEVUM-Kunden reusable
--   2. customer_agent_config: Personal-TG-Agent-Konfig pro Customer (Stub für später)

BEGIN;

-- =============================================================================
-- 1. CUSTOMER LEADS (Patrick + andere AEVUM-Kunden)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.customer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,

  -- Lead-Daten (PII)
  name TEXT,
  email TEXT,
  phone TEXT,
  language TEXT DEFAULT 'de',

  -- Qualifikation (basierend auf Framework-Scorecard)
  source TEXT,                   -- 'linkedin', 'website-quiz', 'whatsapp', 'document-ad', 'manual'
  source_detail JSONB DEFAULT '{}'::jsonb,
  scorecard_id TEXT,             -- Verweis auf blueprint_marketing_thesis.id (z.B. 'patrick-trust-funnel-v1')
  score_total INTEGER,
  score_max INTEGER,
  lead_tier TEXT CHECK (lead_tier IN ('A', 'B', 'C', 'D')),
  lead_action TEXT,              -- 'voice-message-sofort' | 'nurture-7-tage' | 'newsletter-only' | 'kein-fokus'

  -- Lead-Content (raw + interpretiert)
  raw_data JSONB DEFAULT '{}'::jsonb,
  notes TEXT,

  -- Lifecycle
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'meeting-scheduled', 'meeting-held', 'won', 'lost', 'parked')),
  status_changed_at TIMESTAMPTZ DEFAULT now(),

  -- Privacy
  consent_given BOOLEAN DEFAULT false,
  consent_text TEXT,
  consent_timestamp TIMESTAMPTZ,
  ip_address_hash TEXT,          -- Hashed (data-min)

  -- Meta
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_account ON public.customer_leads(account_id);
CREATE INDEX IF NOT EXISTS idx_leads_project ON public.customer_leads(project_id);
CREATE INDEX IF NOT EXISTS idx_leads_tier ON public.customer_leads(lead_tier);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.customer_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.customer_leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.customer_leads(created_at DESC);

ALTER TABLE public.customer_leads ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.customer_leads IS 'Generischer Lead-Store. 1 Row pro Lead. Account/Project-scoped. Consent-aware.';

-- =============================================================================
-- 2. PERSONAL AGENT CONFIG (TG-Agent pro Customer)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.customer_agent_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL UNIQUE REFERENCES public.accounts(id) ON DELETE CASCADE,

  -- Agent-Identity
  agent_name TEXT,                          -- z.B. 'Pattaya' (Patrick's Agent-Name)
  agent_persona JSONB DEFAULT '{}'::jsonb,  -- system_prompt, voice_pillars, frameworks
  language_pref TEXT DEFAULT 'de',

  -- Telegram-Konfig
  tg_bot_token TEXT,                        -- VERSCHLÜSSELT speichern wenn echt eingetragen!
  tg_bot_username TEXT,
  tg_chat_id_owner TEXT,                    -- Patrick's eigene Chat-ID (Owner)
  tg_chat_id_allowlist JSONB DEFAULT '[]'::jsonb,  -- weitere Owner

  -- Skills + Tools (was darf der Agent)
  skills_enabled JSONB DEFAULT '[]'::jsonb, -- ['lead-lookup', 'calendar-read', 'crm-read', etc.]
  context_sources JSONB DEFAULT '[]'::jsonb,-- ['customer_leads', 'project_intelligence', 'calendar']

  -- LLM-Konfig
  llm_provider TEXT DEFAULT 'anthropic',
  llm_model TEXT DEFAULT 'claude-haiku-4-5-20251001',
  llm_temperature NUMERIC DEFAULT 0.7,

  -- Lifecycle
  status TEXT DEFAULT 'stub' CHECK (status IN ('stub', 'configured', 'active', 'paused')),
  activated_at TIMESTAMPTZ,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.customer_agent_config ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.customer_agent_config IS 'Personal-TG-Agent-Konfig pro AEVUM-Customer. tg_bot_token wenn echt eingetragen verschlüsseln (AES-256-GCM).';

-- =============================================================================
-- 3. SEED: Patrick's Personal-Agent-Stub
-- =============================================================================

INSERT INTO public.customer_agent_config (
  account_id,
  agent_name,
  agent_persona,
  language_pref,
  skills_enabled,
  context_sources,
  llm_provider,
  llm_model,
  status
)
SELECT
  a.id,
  'Pattaya',  -- Vorschlag: Patrick's Agent heißt nach der Stadt
  jsonb_build_object(
    'role', 'Personal Concierge-Assistant für Patrick Roth',
    'voice_framework_id', 'patrick-trust-funnel-v1',
    'voice_pillars', jsonb_build_array('Ehrlich', 'Menschlich', 'Vor-Ort-basiert', 'Netzwerkstolz', 'Langfristig'),
    'system_prompt_draft', 'Du bist Pattaya — Patrick Roth''s persönlicher Assistent. Du sprichst wie Patrick: ehrlich, menschlich, vor-Ort-basiert, netzwerkstolz, langfristig. Du beantwortest Fragen zu Patrick''s Leads, Terminen, Properties in Pattaya/Rayong. Du verkaufst nie hart — du orientierst. Wenn unsicher, schlägst du vor "Patrick meldet sich persönlich".',
    'do_say', jsonb_build_array(
      '"Lass mich kurz checken..."',
      '"Patrick ist gerade unterwegs, aber..."',
      '"Ich frag Patrick und meld mich zurück."'
    ),
    'do_not_say', jsonb_build_array(
      'Garantien zu Renditen',
      'Verbindliche Preise (immer "Patrick bestätigt")',
      'Rechtsberatung (immer "wir verweisen auf Anwalt")'
    )
  ),
  'de',
  jsonb_build_array(
    'lead-lookup-own-account',
    'project-status-own-account',
    'framework-lookup',
    'tg-relay-to-patrick'
  ),
  jsonb_build_array(
    'customer_leads',
    'project_intelligence',
    'blueprint_marketing_thesis'
  ),
  'anthropic',
  'claude-haiku-4-5-20251001',
  'stub'  -- Konfiguration pending (TG-Bot-Token + System-Prompt-Finale)
FROM public.accounts a
WHERE a.slug = 'patrick-roth'
ON CONFLICT (account_id) DO UPDATE SET
  agent_persona = EXCLUDED.agent_persona,
  skills_enabled = EXCLUDED.skills_enabled,
  context_sources = EXCLUDED.context_sources,
  updated_at = now();

COMMIT;
