-- Migration 019: Patrick Roth Customer-Account + Coaching-Frameworks Seed
-- Created: 2026-05-24
-- Author: Lennox (autonom, Carlos-Approval per "ziehe autonom durch")
--
-- Purpose:
--   1. Patrick Roth Thailand Concierge als AEVUM-Customer-Account anlegen
--   2. Coaching-Frameworks Seed (Salinsky + Patrick-Trust-Funnel + Baulig-Pricing-Tiers)
--      → Sub-Modul für Coaching-Wissen-Hub (siehe personal-os/07-tools/coaching-hub/CONCEPT.md)
--
-- Idempotent: ON CONFLICT DO NOTHING / DO UPDATE wo nötig

BEGIN;

-- =============================================================================
-- 1. PATRICK ROTH — AEVUM-Account
-- =============================================================================

INSERT INTO public.accounts (
  slug,
  name,
  business_name,
  email,
  phone,
  status,
  client_zero,
  contact_data
) VALUES (
  'patrick-roth',
  'Patrick Roth',
  'Patrick Roth Thailand Concierge',
  'patrick@aevum-customer.placeholder',  -- TODO: echte Email nachreichen
  NULL,
  'onboarding',
  false,
  jsonb_build_object(
    'location', 'Pattaya, Thailand',
    'industry', 'real-estate',
    'sub_industry', 'concierge-real-estate-thailand',
    'niche', 'Pattaya + Rayong',
    'language_pref', 'de',
    'vor_ort_seit', '2024-10',
    'website', 'https://w3m6s2cqu4aug.kimi.page/',
    'tagline', 'Alle Wege führen nach Thailand',
    'tagline_sub', 'Von A bis Z. Vor Ort. Nach dem Deal. Für immer.',
    'icp_segments', jsonb_build_array(
      jsonb_build_object('id', 'der-neue-anfang', 'label', 'Der Neue Anfang', 'internal', 'rentner-investor', 'share', 0.40, 'budget_min', 200000, 'budget_max', 400000),
      jsonb_build_object('id', 'der-kluge-investor', 'label', 'Der kluge Investor', 'internal', 'dink', 'share', 0.30, 'budget_min', 250000, 'budget_max', 500000),
      jsonb_build_object('id', 'der-freigeist', 'label', 'Der Freigeist', 'internal', 'digital-nomad', 'share', 0.20, 'budget_min', 100000, 'budget_max', 250000),
      jsonb_build_object('id', 'der-weitsichtige', 'label', 'Der Weitsichtige', 'internal', 'hnw', 'share', 0.10, 'budget_min', 500000, 'budget_max', 2000000)
    ),
    'pakete', jsonb_build_object(
      'starter', jsonb_build_object('price_eur', 1900, 'tier', 'audit-only'),
      'comfort', jsonb_build_object('price_eur', 5000, 'tier', 'S'),
      'premium', jsonb_build_object('price_eur', 6900, 'tier', 'S-plus'),
      'concierge_annual', jsonb_build_object('price_eur', NULL, 'tier', 'M')
    ),
    'frameworks_active', jsonb_build_array('patrick-trust-funnel-v1', 'baulig-pricing-tiers')
  )
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  business_name = EXCLUDED.business_name,
  contact_data = EXCLUDED.contact_data,
  updated_at = now();

-- Account-Profile für Patrick (Netzwerk-Sichtbarkeit, default-restrictive)
INSERT INTO public.account_profiles (
  account_id,
  display_name,
  industry,
  team_size,
  revenue_band,
  vision,
  looking_for,
  socials,
  bio
)
SELECT
  a.id,
  'Patrick Roth Thailand Concierge',
  'Real Estate Thailand (Pattaya/Rayong)',
  '1-2',
  'pre-revenue-aevum',
  'Deutscher Concierge für Immobilien & Einbürgerung in Pattaya/Rayong. Begleitung von A bis Z. Nicht der krasse Makler — der ehrlichste Partner.',
  jsonb_build_array('linkedin-leadfunnel-aufbau', 'lead-nurturing-automation', 'content-pipeline'),
  jsonb_build_object(
    'linkedin', NULL,  -- TODO: nach Aktivierungs-Call
    'website', 'https://w3m6s2cqu4aug.kimi.page/',
    'whatsapp', NULL
  ),
  'Patrick lebt seit Oktober 2024 in Pattaya. 18 Monate Vor-Ort-Erfahrung, Netzwerk aufgebaut aus lokalen Handwerkern, Anwälten, Steuerberatern, Investoren. Begleitet deutsche/internationale Auswanderer und Investoren durch Immobilien-Kauf und Einbürgerung in Thailand. Spezialisiert auf Pattaya + Rayong.'
FROM public.accounts a
WHERE a.slug = 'patrick-roth'
ON CONFLICT (account_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  industry = EXCLUDED.industry,
  vision = EXCLUDED.vision,
  looking_for = EXCLUDED.looking_for,
  bio = EXCLUDED.bio,
  updated_at = now();

-- Project #1: Thailand RE Website + Lead-System
INSERT INTO public.projects (
  account_id,
  slug,
  name,
  description,
  status,
  tier,
  industry,
  marketing_thesis,
  pricing
)
SELECT
  a.id,
  'thailand-re-leadfunnel',
  'Thailand RE Website + LinkedIn-Lead-Funnel',
  'Comprehensive lead-funnel: LinkedIn-Content + Document-Ads + Quiz-Form + WhatsApp/DM-Nurturing + Calendly-Booking. Ziel 15-25 Leads/Mo, 3-5 Abschlüsse/Mo ab Monat 6.',
  'onboarding',
  'setup',
  'real-estate-thailand-concierge',
  jsonb_build_object(
    'framework_id', 'patrick-trust-funnel-v1',
    'pricing_framework_id', 'baulig-pricing-tiers',
    'tagline', 'Alle Wege führen nach Thailand',
    'niche', 'Pattaya + Rayong'
  ),
  jsonb_build_object(
    'packages', jsonb_build_object(
      'starter', jsonb_build_object('price_eur', 1900, 'tier_mapping', 'audit-only'),
      'comfort', jsonb_build_object('price_eur', 5000, 'tier_mapping', 'tier-s-start'),
      'premium', jsonb_build_object('price_eur', 6900, 'tier_mapping', 'tier-s-plus'),
      'concierge_annual', jsonb_build_object('price_eur', null, 'tier_mapping', 'tier-m-growth')
    ),
    'cost_structure', jsonb_build_object(
      'tools_eur_per_month', 149,
      'ads_eur_per_month_min', 1500,
      'ads_eur_per_month_max', 3000,
      'tools_breakdown', jsonb_build_object(
        'manychat_pro', 15,
        'hubspot_starter', 0,
        'calendly', 0,
        'brevo', 0,
        'buffer_later', 15,
        'zapier', 30,
        'shield_ai', 25,
        'linkedin_sales_navigator', 80,
        'jasper', 49,
        'canva_pro', 13,
        'descript', 15
      )
    ),
    'targets_90d', jsonb_build_object(
      'leads_per_month', '15-25',
      'cpl_max_eur', 80,
      'ssi_min', 75,
      'newsletter_subs', 200,
      'conversations_per_week', 10,
      'long_term_contacts', 50
    ),
    'revenue_target_monthly_eur', '15000-35000',
    'master_doc', 'personal-os/01-business/patrick-thailand/LINKEDIN-STRATEGIE-MASTER.md',
    'roadmap_phase_current', 0,
    'roadmap_phases', jsonb_build_array(
      jsonb_build_object('phase', 0, 'name', 'Infrastructure Activation', 'status', 'in_progress'),
      jsonb_build_object('phase', 1, 'name', 'Foundation (W1-4)', 'status', 'pending'),
      jsonb_build_object('phase', 2, 'name', 'Acceleration (W5-8)', 'status', 'pending'),
      jsonb_build_object('phase', 3, 'name', 'Conversion (W9-12)', 'status', 'pending'),
      jsonb_build_object('phase', 4, 'name', 'Skalierung (M6+)', 'status', 'pending')
    ),
    'tools_stack', jsonb_build_object(
      'crm', 'HubSpot Free',
      'email', 'Brevo',
      'scheduling', 'Calendly',
      'social_scheduling', 'Buffer/Later',
      'dm_automation', 'ManyChat Pro',
      'analytics', 'Shield.ai',
      'sales_outreach', 'LinkedIn Sales Navigator (Phase 9+)',
      'orchestration', 'n8n (iamcarlostheone.app.n8n.cloud)'
    )
  )
FROM public.accounts a
WHERE a.slug = 'patrick-roth'
ON CONFLICT (account_id, slug) DO UPDATE SET
  description = EXCLUDED.description,
  marketing_thesis = EXCLUDED.marketing_thesis,
  pricing = EXCLUDED.pricing,
  updated_at = now();

-- =============================================================================
-- 2. COACHING-FRAMEWORKS — Seed (Sub-Modul Coaching-Hub)
-- =============================================================================

-- Framework: Baulig Pricing Tiers (extracted aus 009)
INSERT INTO public.blueprint_marketing_thesis (
  id, display_name, description, version, industry, structure_schema, example_content, is_active
) VALUES (
  'baulig-pricing-tiers',
  'Baulig Pricing-Tiers',
  'Andreas Baulig Pricing-Framework: 6 Tiers (audit-only, S, M, L, B-Cashflow, C-GrowthShare). Setup ≈ 3× Retainer, Tool-Lizenzen ×2 (Margin-Pflicht).',
  'v1.0.0',
  NULL,
  jsonb_build_object(
    'rule_setup_to_retainer', '3:1',
    'rule_tool_margin', '2x',
    'tiers', jsonb_build_array(
      jsonb_build_object('id', 'audit-only', 'setup_eur', '1500-4000', 'retainer_eur', null, 'note', 'Standalone Audit'),
      jsonb_build_object('id', 'tier-s-start', 'setup_eur', '2000-8000', 'retainer_eur', '1000-2000', 'note', 'Standard-Case 1 Use-Case'),
      jsonb_build_object('id', 'tier-m-growth', 'setup_eur', '8000-20000', 'retainer_eur', '2000-3500', 'note', 'Multi-Use-Case'),
      jsonb_build_object('id', 'tier-l-skalierung', 'setup_eur', '25000-75000', 'retainer_eur', '3000-5000', 'note', 'Enterprise SLA'),
      jsonb_build_object('id', 'tier-b-cashflow', 'setup_modifier', '-50%', 'retainer_modifier', '+30%', 'note', 'Knappes Setup-Cash'),
      jsonb_build_object('id', 'tier-c-growth', 'setup_eur_min', '1000-5000', 'revshare_pct', '10-15', 'note', 'Wachstum, low-cash')
    )
  ),
  jsonb_build_object(
    'example_apply', 'Patrick Roth Thailand: Comfort-Paket €5.000 = Tier S (Single-Use-Case Leadfunnel, 1 Mo Tools+Ads-Budget gedeckt)'
  ),
  true
)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  structure_schema = EXCLUDED.structure_schema,
  example_content = EXCLUDED.example_content,
  updated_at = now();

-- Framework: Salinsky Cold Email v1
INSERT INTO public.blueprint_marketing_thesis (
  id, display_name, description, version, industry, structure_schema, example_content, is_active
) VALUES (
  'salinsky-cold-email-v1',
  'Salinsky Cold Email Framework',
  'Strukturiertes Cold-Email-Outreach-Framework (Tim Salinsky / knightvision.tech). Hyper-Personalization + Subject-Line-Engineering + 4-Step-Follow-up. Designed für hochwertige B2B-Outreach.',
  'v1.0.0',
  'b2b-outreach',
  jsonb_build_object(
    'steps', jsonb_build_array(
      jsonb_build_object('id', 1, 'name', 'Subject-Line', 'rule', 'Pattern-Interrupt, max 4 Wörter, kein Spam-Trigger'),
      jsonb_build_object('id', 2, 'name', 'Personalization-Hook', 'rule', 'Erste 1-2 Zeilen MÜSSEN spezifisch auf Empfänger sein (Trigger, kein Fluff)'),
      jsonb_build_object('id', 3, 'name', 'Value-Proposition', 'rule', '1 Satz, konkrete Outcome-Promise (kein Feature-Sales)'),
      jsonb_build_object('id', 4, 'name', 'Low-Commit-CTA', 'rule', 'Frage statt Calendly-Link, "Open for a 12-Min-Chat?"')
    ),
    'follow_up_cadence', jsonb_build_array(
      jsonb_build_object('day', 4, 'type', 'bump', 'note', 'Kurz, Re-Pitch + neuer Angle'),
      jsonb_build_object('day', 8, 'type', 'value-add', 'note', 'Free Insight ohne Pitch'),
      jsonb_build_object('day', 14, 'type', 'soft-close', 'note', '"Bad timing? Close loop?"')
    ),
    'anti_patterns', jsonb_build_array(
      'Generic Personalization (LinkedIn-Headline-Copy ohne Bezug)',
      'Subject-Line >50 Zeichen',
      'Feature-Listen statt Outcome',
      'Calendly-Link in erster Mail',
      'Mehr als 3 Sätze Body'
    )
  ),
  jsonb_build_object(
    'example_apply', 'Tim Knightvision.tech Use-Case: E-Commerce Ad-Script-Outreach an D2C-Brands ab €1M ARR'
  ),
  true
)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  structure_schema = EXCLUDED.structure_schema,
  example_content = EXCLUDED.example_content,
  updated_at = now();

-- Framework: Patrick Trust-Funnel v1
INSERT INTO public.blueprint_marketing_thesis (
  id, display_name, description, version, industry, structure_schema, example_content, is_active
) VALUES (
  'patrick-trust-funnel-v1',
  'Patrick Trust-Funnel (3-Phase + 8-Prinzipien)',
  'Vertrauens-basierter Lead-Funnel für High-Trust-Industries (RE, Concierge, Wealth-Management). Anti-Hard-Sell. 3 Phasen BEGEGNUNG → VERBINDUNG → BEGLEITUNG. 8 Prinzipien (Qualität vor Quantität). Anti-Zielgruppe explizit.',
  'v1.0.0',
  'high-trust-services',
  jsonb_build_object(
    'phases', jsonb_build_array(
      jsonb_build_object('id', 1, 'name', 'BEGEGNUNG', 'meta', 'Wir werden gesehen', 'tactics', jsonb_build_array('5 organische Posts/Wo', 'Newsletter (intim)', 'Document Ads', 'Thought Leader Ads')),
      jsonb_build_object('id', 2, 'name', 'VERBINDUNG', 'meta', 'Wir werden gekannt', 'tactics', jsonb_build_array('Persönliche DM-Antworten', 'LinkedIn Live/Events', 'Newsletter-Dialog', 'Sanftes Retargeting')),
      jsonb_build_object('id', 3, 'name', 'BEGLEITUNG', 'meta', 'Wir werden vertraut', 'tactics', jsonb_build_array('Erstgespräch 30-45 Min', 'Voice Messages', 'Langfristige Begleitung (Jahre)'))
    ),
    'principles', jsonb_build_array(
      'Vertrauen ist die Basis',
      'Nicht der krasse Makler, sondern der ehrlichste',
      'Kein Deal ohne Details',
      'Immobilie passt zum Menschen, nicht zum Konto',
      'Das Menschliche zählt',
      'Teil der Familie (auch nach Deal)',
      'Wir hören nicht beim Deal auf',
      'Qualität vor Quantität'
    ),
    'voice_pillars', jsonb_build_array(
      jsonb_build_object('name', 'Ehrlich', 'do', 'Schwächen benennen', 'dont', '"Alles ist perfekt"'),
      jsonb_build_object('name', 'Menschlich', 'do', 'Eigene Unsicherheit zugeben', 'dont', '"Vertrauen Sie mir, ich bin der Profi"'),
      jsonb_build_object('name', 'Vor-Ort-basiert', 'do', '"Gestern beim Abendessen..."', 'dont', '"Laut einer Studie..."'),
      jsonb_build_object('name', 'Netzwerkstolz', 'do', '"Ich kenne da jemanden"', 'dont', '"Das ist nicht meine Aufgabe"'),
      jsonb_build_object('name', 'Langfristig', 'do', '"Rufen Sie an, auch in 2 Jahren"', 'dont', '"Nach Notartermin bin ich raus"')
    ),
    'anti_audience', jsonb_build_array(
      'Schnell-Käufer (günstigster Deal egal wie)',
      'Spekulanten ohne Recherche',
      'Reine Preis-Optimierer',
      'Spürbar später-unzufrieden Vibe'
    ),
    'trust_filter_questions', jsonb_build_array(
      jsonb_build_object('q', 'Warum Thailand?', 'good', 'echte Geschichte', 'bad', '"ist billig"'),
      jsonb_build_object('q', 'Preis oder Beratung?', 'good', 'Beratung', 'bad', 'Preis'),
      jsonb_build_object('q', 'Wie stellen Sie sich Betreuung vor?', 'good', 'Langfristigkeit', 'bad', 'Schnell + raus'),
      jsonb_build_object('q', 'Schon schlechte Erfahrungen?', 'good', 'Ehrliche Antwort', 'bad', '"Alles super"')
    ),
    'lead_scorecard', jsonb_build_object(
      'questions', jsonb_build_array(
        jsonb_build_object('q', 'Zeitplan', 'best', 'Sofort (0-3 Mo)', 'max', 10),
        jsonb_build_object('q', 'Budget', 'best', '>500k EUR', 'max', 10),
        jsonb_build_object('q', 'Hauptbedarf', 'best', 'Investment/Rendite', 'max', 10),
        jsonb_build_object('q', 'Begleitungswunsch', 'best', 'Sehr wichtig', 'max', 10),
        jsonb_build_object('q', 'Entscheidungsstatus', 'best', 'Definitiv 100%', 'max', 15)
      ),
      'tiers', jsonb_build_array(
        jsonb_build_object('tier', 'A', 'min', 40, 'max', 50, 'action', 'Voice-Message sofort'),
        jsonb_build_object('tier', 'B', 'min', 30, 'max', 39, 'action', '7-Tage-Nurturing'),
        jsonb_build_object('tier', 'C', 'min', 20, 'max', 29, 'action', 'Newsletter only'),
        jsonb_build_object('tier', 'D', 'min', 0, 'max', 19, 'action', 'Kein Fokus')
      )
    ),
    'dm_sequence', jsonb_build_array(
      jsonb_build_object('day', 0, 'type', 'Verbindungsanfrage', 'len_max', 100),
      jsonb_build_object('day', 1, 'type', 'Value-First (kein Verkauf)', 'len_max', 400),
      jsonb_build_object('day', 4, 'type', 'Case-Study-Follow-up', 'len_max', 400),
      jsonb_build_object('day', 7, 'type', 'Voice Message 30s', 'len_max', null),
      jsonb_build_object('day', 10, 'type', 'Calendly-Einladung "kein Verkauf"', 'len_max', 400)
    ),
    'content_pillars', jsonb_build_array(
      jsonb_build_object('name', 'Leben vor Ort', 'freq', '2/Wo', 'format', 'Video <90s, Photo+Story'),
      jsonb_build_object('name', 'Menschen, die wir begleitet haben', 'freq', '1/Wo', 'format', 'Text/Carousel'),
      jsonb_build_object('name', 'Wissen, das schützt', 'freq', '1/Wo', 'format', 'Carousel'),
      jsonb_build_object('name', 'Das Netzwerk teilen', 'freq', '1/Wo', 'format', 'Text + Empfehlung')
    ),
    'post_templates', jsonb_build_array(
      '"Ich war gerade..." (Vor-Ort-Moment mit ehrlichem Detail)',
      '"Vor drei Monaten..." (Begleitgeschichte mit Lächeln)',
      '"Was ich in 18 Monaten gelernt habe..." (Ehrlicher Tipp)',
      '"Ich habe gestern mit ... gesprochen" (Netzwerk teilen)',
      '"Die Frage, die mir am häufigsten gestellt wird..." (Wissens-Share)'
    ),
    'kpis_external', jsonb_build_object(
      'reichweite', '500+ Views/Wo',
      'verbindung', '15+ echte Kommentare/Post',
      'gemeinschaft', '200+ Newsletter',
      'vertrauen', '10+ Gespräche/Wo',
      'beziehung', '50+ Langzeit-Kontakte (6 Mo+)'
    )
  ),
  jsonb_build_object(
    'example_apply', 'Patrick Roth Thailand Concierge — Pattaya/Rayong Immobilien & Einbürgerung. 18 Mo Vor-Ort. Brand: "Alle Wege führen nach Thailand". Comfort-Paket €5.000 deckt 1 Mo Tools+Ads.'
  ),
  true
)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  structure_schema = EXCLUDED.structure_schema,
  example_content = EXCLUDED.example_content,
  updated_at = now();

COMMIT;

-- Verification (run nach Apply):
-- SELECT slug, name, status FROM accounts WHERE slug='patrick-roth';
-- SELECT slug, name, status FROM projects WHERE slug='thailand-re-leadfunnel';
-- SELECT id, display_name, is_active FROM blueprint_marketing_thesis WHERE id IN ('baulig-pricing-tiers', 'salinsky-cold-email-v1', 'patrick-trust-funnel-v1');
