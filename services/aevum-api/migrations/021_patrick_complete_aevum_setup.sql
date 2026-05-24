-- Migration 021: Patrick Roth — Complete AEVUM-Customer-Setup
-- Created: 2026-05-24
-- Author: Lennox (autonom, Carlos liefert echte Daten)
--
-- Patrick = AEVUM-Audit-Kunde
--   Email:    patrick.roth.th@outlook.com
--   Phone:    +49 1511 4363994
--   LinkedIn: https://www.linkedin.com/in/living-in-thailand-463321350/
--   TG-Bot:   @<unknown>_bot (Token 8880115748:* in env)
--
-- Setup:
--   1. accounts UPDATE — echte Email/Phone, LinkedIn in contact_data
--   2. account_profiles UPDATE — socials.linkedin
--   3. Audit-Record (AEVUM-Schematik) für Patrick
--   4. project_intelligence (Knowledge-Base für Personal-Agent)
--   5. customer_agent_config UPDATE — Bot-Token-Slot, Status configured

BEGIN;

-- =============================================================================
-- 1. ACCOUNT — echte Daten
-- =============================================================================

UPDATE public.accounts
SET
  email = 'patrick.roth.th@outlook.com',
  phone = '+49 1511 4363994',
  contact_data = contact_data || jsonb_build_object(
    'linkedin', 'https://www.linkedin.com/in/living-in-thailand-463321350/',
    'tg_bot_username_placeholder', 'pattaya-agent-bot',
    'languages', jsonb_build_array('de', 'en'),
    'time_zone', 'Asia/Bangkok'
  ),
  updated_at = now()
WHERE slug = 'patrick-roth';

UPDATE public.account_profiles
SET
  socials = socials || jsonb_build_object(
    'linkedin', 'https://www.linkedin.com/in/living-in-thailand-463321350/',
    'website_kimi', 'https://w3m6s2cqu4aug.kimi.page/',
    'website_vercel', 'https://patrick-roth-thailand-q7bib9gow-cwconsulting369-9599s-projects.vercel.app'
  ),
  updated_at = now()
WHERE account_id = (SELECT id FROM public.accounts WHERE slug = 'patrick-roth');

-- =============================================================================
-- 2. AUDIT — AEVUM-Schematik Audit-Record für Patrick
-- =============================================================================

INSERT INTO public.audits (
  name,
  company,
  email,
  phone,
  industry,
  team_size,
  description,
  time_wasters,
  tools,
  budget,
  timeline,
  status,
  meta
) VALUES (
  'Patrick Roth',
  'Patrick Roth Thailand Concierge',
  'patrick.roth.th@outlook.com',
  '+49 1511 4363994',
  'real-estate-thailand-concierge',
  '1-2',
  'Concierge-Service Pattaya + Rayong. Immobilien-Kauf, Visa-Begleitung, Einbürgerung, Property-Management. 18 Monate vor Ort. Netzwerk aus 30+ lokalen Partnern (Anwälte, Steuer, Handwerker).',
  'Cold Lead-Generierung (Patrick aktuell hauptsächlich Empfehlungen). LinkedIn-Sichtbarkeit fehlt. CRM nicht systematisiert. Voice-Message-Sequenz nicht automatisiert. Newsletter-Pipeline fehlt.',
  jsonb_build_object(
    'crm', 'noch keins - HubSpot Free geplant',
    'social_scheduling', 'manuell - Buffer geplant',
    'email', 'manuell - Brevo geplant',
    'scheduling', 'manuell - Calendly geplant',
    'dm_automation', 'nicht vorhanden - ManyChat Pro geplant',
    'website', 'Vite+React Vercel deployment 2026-05-24'
  )::text,
  '1.500-3.000 EUR/Mo Ads + 149 EUR/Mo Tools (Tier-S Comfort-Mapping)',
  'Sofort-Start Phase 1 Foundation 2026-05-25+ — 90 Tage bis Compounding',
  'qualified',
  jsonb_build_object(
    'account_slug', 'patrick-roth',
    'project_slug', 'thailand-re-leadfunnel',
    'framework_id', 'patrick-trust-funnel-v1',
    'aevum_tier', 'setup',
    'pakete_offer', jsonb_build_object(
      'starter_eur', 1900,
      'comfort_eur', 5000,
      'premium_eur', 6900
    ),
    'targets_90d', jsonb_build_object(
      'leads_per_month', '15-25',
      'cpl_max_eur', 80,
      'ssi_min', 75,
      'newsletter_subs', 200
    ),
    'revenue_target_mo6_eur', '15000-35000',
    'icp_segments_share', jsonb_build_object(
      'der-neue-anfang_rentner', 0.40,
      'der-kluge-investor_dink', 0.30,
      'der-freigeist_nomad', 0.20,
      'der-weitsichtige_hnw', 0.10
    ),
    'created_by', 'lennox-autonom-2026-05-24',
    'master_doc_path', 'personal-os/01-business/patrick-thailand/LINKEDIN-STRATEGIE-MASTER.md'
  )
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 3. PROJECT_INTELLIGENCE — Website + LinkedIn + Audit-Summary
-- =============================================================================

INSERT INTO public.project_intelligence (
  project_id,
  website_url,
  website_meta,
  linkedin_url,
  linkedin_data,
  social_data,
  audit_summary,
  optimizations,
  status
)
SELECT
  p.id,
  'https://patrick-roth-thailand-q7bib9gow-cwconsulting369-9599s-projects.vercel.app',
  jsonb_build_object(
    'kimi_reference', 'https://w3m6s2cqu4aug.kimi.page/',
    'stack', 'Vite + React + TS + Tailwind + shadcn + Framer Motion',
    'pages', jsonb_build_array('Home (Split-Gate)', 'Auswanderer-Track', 'Investor-Track', 'Pakete', 'Quiz (10Q)', 'Kontakt', 'UeberPatrick + 8 Prinzipien + Anti-Zielgruppe'),
    'github_repo', 'https://github.com/cwconsulting369-art/patrick-roth-thailand',
    'vercel_project_id', 'prj_LYLjhVKd4QMxRzPRC3ExwuJu4oGB',
    'domain_pending', true,
    'domain_options', jsonb_build_array('patrickroth-thailand.de', 'patrick.aevum-system.de')
  ),
  'https://www.linkedin.com/in/living-in-thailand-463321350/',
  jsonb_build_object(
    'profile_optimization_pending', true,
    'creator_mode_status', 'unknown',
    'ssi_baseline_pending', true
  ),
  jsonb_build_object(
    'whatsapp_business_pending', true,
    'instagram_pending', true,
    'newsletter_brevo_pending', true
  ),
  E'Patrick Roth = Thailand-Concierge Pattaya/Rayong (18 Mo vor Ort). Brand "Patrick Roth Thailand Concierge". Tagline "Alle Wege führen nach Thailand". Framework: patrick-trust-funnel-v1 (BEGEGNUNG→VERBINDUNG→BEGLEITUNG, 8 Prinzipien, Anti-Hard-Sell).\n\nICP 4-Typen: Der Neue Anfang (Rentner 40%, 200-400k), Der kluge Investor (DINK 30%, 250-500k), Der Freigeist (Nomad 20%, 100-250k), Der Weitsichtige (HNW 10%, 500k-2M+).\n\nPakete: Starter 1.900€ (audit-only) / Comfort 5.000€ (Tier-S, deckt 1 Mo Budget) / Premium 6.900€ (White-Glove).\n\n90T-Targets: 15-25 Leads/Mo, CPL<80€, SSI>75. Mo6: 3-5 Abschlüsse/Mo, 15-35k€/Mo.\n\nStimme 5-Säulen: Ehrlich, Menschlich, Vor-Ort, Netzwerkstolz, Langfristig.',
  jsonb_build_array(
    jsonb_build_object('priority', 'P1', 'area', 'linkedin-profile', 'task', 'Headline mit Value-Prop (max 220 Z) + Creator Mode + Featured-Section mit Lead-Magnet'),
    jsonb_build_object('priority', 'P1', 'area', 'newsletter', 'task', 'Brevo "Briefe aus Pattaya" Pipeline + Welcome-Sequenz'),
    jsonb_build_object('priority', 'P1', 'area', 'tools', 'task', 'HubSpot Free + Calendly + Buffer + ManyChat Pro + Sales Navigator (W9+)'),
    jsonb_build_object('priority', 'P2', 'area', 'document-ad', 'task', '"Thailand-Immobilien-Check" PDF erstellen + LinkedIn Document Ad (20 EUR/Tag, W3)'),
    jsonb_build_object('priority', 'P2', 'area', 'content-pipeline', 'task', '5 Posts/Wo nach 4-Pillar-Plan (Vor-Ort 2x, Kunden 1x, Wissen 1x, Netzwerk 1x)'),
    jsonb_build_object('priority', 'P3', 'area', 'whatsapp', 'task', 'WhatsApp Business API + Meta-Verifizierung (2-5 Tage)'),
    jsonb_build_object('priority', 'P3', 'area', 'domain', 'task', 'Custom Domain registrieren + an Vercel verbinden')
  ),
  'done'
FROM public.projects p
JOIN public.accounts a ON a.id = p.account_id
WHERE a.slug = 'patrick-roth' AND p.slug = 'thailand-re-leadfunnel'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 4. CUSTOMER_AGENT_CONFIG — Bot-Token-Slot (Token wird per separater UPDATE encrypted geschrieben)
-- =============================================================================

UPDATE public.customer_agent_config
SET
  agent_name = 'Pattaya',
  language_pref = 'de',
  status = 'configured',  -- Bot-Token wird via separater encrypted-Update gesetzt
  agent_persona = agent_persona || jsonb_build_object(
    'patrick_contact', jsonb_build_object(
      'email', 'patrick.roth.th@outlook.com',
      'phone', '+49 1511 4363994',
      'linkedin', 'https://www.linkedin.com/in/living-in-thailand-463321350/'
    ),
    'website_live', 'https://patrick-roth-thailand-q7bib9gow-cwconsulting369-9599s-projects.vercel.app',
    'identity_summary', 'Du bist Pattaya, Patrick Roth''s persönlicher AEVUM-Assistent. Du hilfst Patrick bei Lead-Management, Calendar, Property-Recherche und Übersetzung Deutsch-Englisch. Du sprichst wie Patrick (ehrlich, menschlich, vor-Ort, netzwerkstolz, langfristig). Du verkaufst nie. Wenn unsicher: "Ich frag Patrick und meld mich zurück."'
  ),
  updated_at = now()
WHERE account_id = (SELECT id FROM public.accounts WHERE slug = 'patrick-roth');

COMMIT;
