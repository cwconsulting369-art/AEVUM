-- AEVUM v2 — Initial Seeds: Blueprints + Account Zero (Carlos)
-- Project: iwyzbiufmdnwmddjkevf
-- Date: 2026-05-22
-- Source: AEVUM-V2-MASTER-VISION + Baulig-Insights (Pricing-Ranges + Marketing-Thesis-Struktur)
-- Risk: Low — INSERT ... ON CONFLICT DO NOTHING, idempotent
-- Reversible: DELETE WHERE id IN (...)

-- ============================================================
-- BLUEPRINT PRICING (Baulig-Marktpreise als Validation-Ranges)
-- ============================================================

INSERT INTO public.blueprint_pricing (id, display_name, description, version, deal_type, category, setup_range_min_eur, setup_range_max_eur, retainer_range_min_eur, retainer_range_max_eur, tool_margin_multiplier, setup_to_retainer_ratio, revenue_share_pct_default, pricing_logic, is_active)
VALUES
  ('tier-S-start', 'Tier S — Start (Audit + Basic Setup)',
   'Einstiegspaket. Audit + 1 Use Case + Standard-Dashboard + Basic-Agent.',
   'v1.0.0', 'A', 'standard',
   2000, 8000, 1000, 2000, 2.0, 3.0, NULL,
   '{"baulig_match": "ki-automation-standard-case", "service_hours_setup": 30, "retainer_hours_monthly": 8, "notes": "Setup ~3x Retainer (Baulig-Regel)"}'::jsonb,
   true),

  ('tier-M-growth', 'Tier M — Growth (Multi-Use-Case)',
   'Standard-Paket. 2-3 Use Cases + Custom Dashboard + Project-Agent mit Custom-Skills.',
   'v1.0.0', 'A', 'standard',
   8000, 20000, 2000, 3500, 2.0, 3.0, NULL,
   '{"baulig_match": "ki-automation-medium", "service_hours_setup": 80, "retainer_hours_monthly": 16}'::jsonb,
   true),

  ('tier-L-skalierung', 'Tier L — Skalierung (Enterprise)',
   'Premium. Multi-Project, komplette OS-Integration, SLA, Priority-Support.',
   'v1.0.0', 'A', 'enterprise',
   25000, 75000, 3000, 5000, 2.0, 3.0, NULL,
   '{"baulig_match": "individual-project-end-to-end", "service_hours_setup": 200, "retainer_hours_monthly": 32, "sla": "4h-response"}'::jsonb,
   true),

  ('tier-B-cashflow', 'Tier B — Cashflow-Deal (Reduced Setup, Higher Retainer)',
   'Für Kunden mit knappem Setup-Cash aber stabilem MRR. Setup -50%, Retainer +30%.',
   'v1.0.0', 'B', 'flex',
   1000, 8000, 1500, 4500, 2.0, NULL, NULL,
   '{"setup_reduction_pct": 50, "retainer_uplift_pct": 30, "min_term_months": 12}'::jsonb,
   true),

  ('tier-C-growth-share', 'Tier C — Growth + Revenue-Share',
   'Für Wachstums-Cases mit niedrigem Setup-Budget. Minimal-Setup + RevShare auf Growth-Delta.',
   'v1.0.0', 'C', 'growth',
   1000, 5000, 500, 2500, 2.0, NULL, 12.5,
   '{"revshare_pct_range": [10, 15], "baseline_locking": true, "cap_optional": true, "term_months": 24}'::jsonb,
   true),

  ('audit-only', 'Audit Only (Standalone Strategy Audit)',
   'Nur Audit + Roadmap + Pitch-Report. Kein Setup, kein Retainer. Conversion-Pfad in Tier S/M/L.',
   'v1.0.0', 'A', 'audit',
   1500, 4000, 0, 0, 1.0, NULL, NULL,
   '{"baulig_match": "audit-roadmap", "duration_days": 14, "deliverable": "PDF-Pitch-Report + Strategie-Call"}'::jsonb,
   true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BLUEPRINT MARKETING THESIS (Baulig-Struktur als Customer-Website-Template)
-- ============================================================

INSERT INTO public.blueprint_marketing_thesis (id, display_name, description, version, industry, structure_schema, example_content, is_active)
VALUES
  ('baulig-7-step-standard', 'Marketing-Thesis 7-Step (Baulig-Standard)',
   'PROBLEM → HYPOTHESE → ANTI-THESE → DIAGNOSE → MECHANISMUS → BEISPIEL-BEWEIS → CTA. Universal-Anwendbar für jede Customer-Website + AEVUM selbst.',
   'v1.0.0', NULL,
   '{
     "sections": [
       {"id": "problem", "label": "Problem", "guideline": "Konkretes Schmerz-Szenario der Zielgruppe. Emotional, spezifisch.", "max_words": 150},
       {"id": "hypothese", "label": "Hypothese", "guideline": "Was die Zielgruppe glaubt, warum sie das Problem im Griff hat (aber nicht).", "max_words": 100},
       {"id": "anti_these", "label": "Anti-These", "guideline": "Warum die aktuellen Lösungen strukturell scheitern.", "max_words": 100},
       {"id": "diagnose", "label": "Diagnose", "guideline": "Der blinde Fleck. Was wirklich fehlt.", "max_words": 100},
       {"id": "mechanismus", "label": "Mechanismus (Lösung)", "guideline": "Wie unser Setup das Problem strukturell löst. 3-5 Bullet Points.", "max_words": 200},
       {"id": "beispiel_beweis", "label": "Beispiel-Beweis", "guideline": "1 konkretes Case mit Zahlen. Falls keine, anonymisiert.", "max_words": 150},
       {"id": "cta", "label": "Call to Action", "guideline": "EINE klare Aktion. Kein Multi-CTA.", "max_words": 50}
     ]
   }'::jsonb,
   '{
     "industry_example": "Hausverwaltungen / Energieverwaltung",
     "problem": "Liebe Hausverwaltungen, kennt ihr das Gefühl der Unsicherheit bei der Energieverwaltung? Rechnungen stapeln sich, aber niemand weiß, welche Lieferstelle betroffen ist...",
     "hypothese": "Ihr glaubt, das Thema Energie im Griff zu haben, durch interne Zuständigkeit oder einen Makler...",
     "cta": "Bucht jetzt ein kostenloses Analysegespräch. In nur 30 Minuten finden wir gemeinsam heraus, wie eure Hausverwaltung Zeit, Geld und Ressourcen einspart."
   }'::jsonb,
   true),

  ('aevum-own', 'Marketing-Thesis AEVUM Self (aevum-system.de)',
   'Marketing-Thesis für AEVUM selbst auf aevum-system.de — Zielgruppe Unternehmer/KMU.',
   'v1.0.0', 'cross-industry',
   '{
     "sections": [
       {"id": "problem", "label": "Problem", "guideline": "Tool-Chaos, Insellösungen, AI-Spielzeug ohne Substanz."},
       {"id": "hypothese", "label": "Hypothese", "guideline": "Mehr Tools/Hires = Lösung. Stimmt nicht."},
       {"id": "anti_these", "label": "Anti-These", "guideline": "Mehr Komplexität = mehr Chaos. AI ohne Strategie = Geld verbrennen."},
       {"id": "diagnose", "label": "Diagnose", "guideline": "Es fehlt ein zentrales Betriebssystem. Keine Inseln, kein Tool-Wechsel-Schmerz."},
       {"id": "mechanismus", "label": "Mechanismus", "guideline": "AEVUM = Analyse → Setup → laufende Optimierung. 3 Säulen Monitoring/Anpassung/Wachstum."},
       {"id": "beispiel_beweis", "label": "Beweis", "guideline": "Client Zero Carlos + Live-Cases (mit Permissions)."},
       {"id": "cta", "label": "CTA", "guideline": "Audit starten."}
     ]
   }'::jsonb,
   '{}'::jsonb,
   true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BLUEPRINT DASHBOARDS (Standard-Templates)
-- ============================================================

INSERT INTO public.blueprint_dashboards (id, display_name, description, version, category, default_modules, default_kpi_strip, config_schema, required_data_sources, is_active)
VALUES
  ('os-standard-v1', 'OS-Standard-Dashboard (Pro-Layout)',
   'Master-Template basierend auf project_os_standard_template_2026_05_21. 5 Owner-Tabs + Admin-Overlay.',
   'v1.0.0', 'project-os',
   '["kpi-grid", "finance-widget", "roadmap-timeline", "workflow-status", "data-hub-links", "people-table", "recent-activity"]'::jsonb,
   '[{"label": "Active Workflows", "source": "/project/{id}/workflows", "format": "number"}, {"label": "Health", "source": "/project/{id}/health", "format": "status"}]'::jsonb,
   '{"branding": {"required": ["title"]}, "tabs_enabled": {"type": "array", "default": ["finance", "roadmap", "data-hub", "people", "metrics"]}}'::jsonb,
   '[]'::jsonb,
   true),

  ('account-master-v1', 'Account-Master-Dashboard',
   'Account-Level-Dashboard mit Aggregation über alle Projekte + Network-Profile-Section.',
   'v1.0.0', 'account-master',
   '["accounts-summary", "projects-grid", "network-profile-widget", "recent-activity"]'::jsonb,
   '[{"label": "Active Projects", "source": "/account/{id}/projects/count", "format": "number"}, {"label": "Network Connections", "source": "/account/{id}/network/count", "format": "number"}]'::jsonb,
   '{"network_visibility_default": "network"}'::jsonb,
   '[]'::jsonb,
   true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BLUEPRINT AGENTS (Standard-Templates)
-- ============================================================

INSERT INTO public.blueprint_agents (id, display_name, description, version, agent_type, category, default_persona, default_skills, default_guardrails, config_schema, required_apis, is_active)
VALUES
  ('account-master-v1', 'Account Master Agent',
   'Orchestriert alle Project-Agents eines Accounts. Aggregiert KPIs, leitet Tasks weiter.',
   'v1.0.0', 'account-master', 'orchestration',
   'Du bist der Master-Agent für den Account {account_name}. Du hast Zugriff auf alle Project-Agents und kannst sie koordinieren, ohne ihre Daten-Silos zu mischen.',
   '["task-router", "kpi-aggregator", "cross-project-insights", "escalation"]'::jsonb,
   '{"can_write_to_project_systems": false, "can_send_external_emails": false, "data_retention_days": 90}'::jsonb,
   '{"required": ["account_id"], "optional": ["custom_persona", "language_pref"]}'::jsonb,
   '[]'::jsonb,
   true),

  ('project-os-v1', 'Project OS Agent (White-Label Lennox)',
   'Standard-Agent pro Projekt. Liest Read-only-APIs, generiert Reports, beantwortet Fragen zum Projekt.',
   'v1.0.0', 'project-os', 'general',
   'Du bist der AI-Assistant für das Projekt {project_name}. Du arbeitest ausschließlich mit den Daten dieses Projekts.',
   '["kpi-reporter", "data-fetcher", "meeting-summarizer", "task-router", "escalation"]'::jsonb,
   '{"can_write_to_customer_systems": false, "can_send_external_emails": false, "data_retention_days": 30}'::jsonb,
   '{"required": ["project_id"], "optional": ["custom_skills", "language_pref", "channels"]}'::jsonb,
   '[]'::jsonb,
   true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BLUEPRINT WORKFLOWS (Initial Library — 3 Starter-Blueprints)
-- ============================================================

INSERT INTO public.blueprint_workflows (id, display_name, description, version, category, deployment_target, inputs, outputs, config_knobs, dependencies, metrics_tracked, estimated_setup_hours, estimated_monthly_value_hours_saved, is_active)
VALUES
  ('lead-routing-v1', 'Lead Routing',
   'Eingehende Leads von Website-Form/Email/Chat werden gefiltert, qualifiziert und an passenden Owner geroutet.',
   'v1.0.0', 'sales', 'n8n',
   '[{"name": "webhook-form", "type": "webhook"}, {"name": "email-inbox", "type": "email"}]'::jsonb,
   '[{"name": "crm-create-lead", "type": "integration"}, {"name": "tg-notify-owner", "type": "notification"}]'::jsonb,
   '[{"key": "min_qualification_score", "type": "number", "required": false, "default": 60}, {"key": "owner_telegram_id", "type": "string", "required": true}]'::jsonb,
   '{"required_apis": ["crm-of-choice"], "min_tier": "setup"}'::jsonb,
   '[{"metric_id": "leads_per_day", "label": "Leads/Day", "unit": "count"}, {"metric_id": "qualification_rate", "label": "Qualified %", "unit": "percent"}]'::jsonb,
   8, 20, true),

  ('reporting-pipeline-v1', 'Weekly KPI Reporting',
   'Sammelt KPIs aus Read-only-APIs, generiert PDF-Report, sendet wöchentlich an Owner.',
   'v1.0.0', 'reporting', 'aevum-internal',
   '[{"name": "cron-weekly", "type": "cron"}]'::jsonb,
   '[{"name": "pdf-report", "type": "email"}, {"name": "dashboard-update", "type": "database"}]'::jsonb,
   '[{"key": "send_day", "type": "enum", "required": true, "default": "monday"}, {"key": "kpi_sources", "type": "array", "required": true}]'::jsonb,
   '{"required_apis": [], "min_tier": "retainer-light"}'::jsonb,
   '[{"metric_id": "reports_sent", "label": "Reports Sent", "unit": "count"}]'::jsonb,
   4, 8, true),

  ('email-automation-v1', 'Email Automation (Welcome + Nurturing)',
   'Welcome-Sequence + Nurturing-Drip-Campaigns nach Lead-Eintrag.',
   'v1.0.0', 'sales', 'n8n',
   '[{"name": "new-lead-event", "type": "webhook"}]'::jsonb,
   '[{"name": "email-send", "type": "email"}]'::jsonb,
   '[{"key": "from_email", "type": "string", "required": true}, {"key": "sequence_steps", "type": "number", "required": true, "default": 5}]'::jsonb,
   '{"required_apis": ["resend-or-similar"], "min_tier": "setup"}'::jsonb,
   '[{"metric_id": "open_rate", "label": "Open Rate", "unit": "percent"}, {"metric_id": "click_rate", "label": "Click Rate", "unit": "percent"}]'::jsonb,
   12, 15, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BLUEPRINT AUDIT FORMS (v2 Audit-Form Definition)
-- ============================================================

INSERT INTO public.blueprint_audit_forms (id, version, display_name, description, categories, validation_rules, is_active)
VALUES
  ('aevum-audit-v2', 'v2', 'AEVUM Audit Form v2',
   'Strukturierter 9-Kategorien-Audit. ICP-agnostic.',
   '{
     "unternehmen": {"fields": ["name", "company", "industry", "team_size", "location", "revenue_band"]},
     "kontakt": {"fields": ["email", "phone", "preferred_contact"]},
     "aktueller_stack": {"fields": ["tools_in_use", "crm", "automation_tools", "data_storage"]},
     "daten_landschaft": {"fields": ["data_sources", "data_quality_self_score", "data_silos_problem"]},
     "pain_points": {"fields": ["biggest_time_waster", "manual_tasks_weekly_hours", "current_bottleneck"]},
     "ziele": {"fields": ["goal_90_days", "goal_12_months", "success_metric"]},
     "team": {"fields": ["decision_makers", "team_roles"]},
     "budget": {"fields": ["monthly_range", "setup_willingness", "revenue_share_open"]},
     "files": {"fields": ["uploads"]}
   }'::jsonb,
   '{
     "required_fields": ["name", "company", "email", "industry", "biggest_time_waster", "goal_90_days"],
     "max_file_size_mb": 10,
     "max_files": 5
   }'::jsonb,
   true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ACCOUNT ZERO — Carlos (Client Zero)
-- ============================================================

INSERT INTO public.accounts (slug, name, business_name, email, phone, status, client_zero, contact_data)
VALUES (
  'carlos',
  'Carlos Wrusch',
  'Carlos Wrusch (AEVUM/LennoxOS)',
  'cwconsulting369@gmail.com',
  NULL,
  'active',
  true,
  '{"location": "Wehringen DE", "language_pref": "de", "timezone": "Europe/Berlin", "role": "founder"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Account-Profile für Carlos
INSERT INTO public.account_profiles (account_id, display_name, industry, vision, visibility, bio, member_since)
SELECT id, 'Carlos Wrusch', 'ai-systems', 'AEVUM zu 300 Mio. Eigentümer-Business bis 2030', 'private',
  'Founder AEVUM. Client Zero. Baut KI-Betriebssysteme für Unternehmen.',
  '2026-05-22'
FROM public.accounts WHERE slug = 'carlos'
ON CONFLICT (account_id) DO NOTHING;

-- Account-Permissions für Carlos (alles erlaubt, da Client Zero)
INSERT INTO public.account_permissions (account_id, share_logo, share_company_name, share_industry, share_kpi_deltas, share_case_study, channel_website, channel_linkedin, channel_pitchdeck, anonymize_revenue)
SELECT id, true, true, true, true, true, true, true, true, false
FROM public.accounts WHERE slug = 'carlos'
ON CONFLICT (account_id) DO NOTHING;

-- Account-Agent für Carlos = Lennox (Reference, NICHT echte Migration)
INSERT INTO public.account_agents (account_id, agent_config, channels, skills, guardrails, deployment_status, deployment_target)
SELECT id,
  '{"display_name": "Lennox", "persona": "Co-Founder for Carlos. Brutal honest, full context, never sycophantic.", "language_primary": "de"}'::jsonb,
  '{"telegram_bot": "lennox-bot", "web": null}'::jsonb,
  '["task-router", "kpi-aggregator", "cross-project-insights", "escalation", "memory"]'::jsonb,
  '{"can_write_to_project_systems": true, "can_send_external_emails": false, "data_retention_days": 9999}'::jsonb,
  'deployed', 'lennox-os-master'
FROM public.accounts WHERE slug = 'carlos'
ON CONFLICT (account_id) DO NOTHING;

-- ============================================================
-- PROJECTS für Carlos (Client Zero hat mehrere Projekte)
-- ============================================================

INSERT INTO public.projects (account_id, slug, name, description, status, tier, industry, marketing_thesis, pricing)
SELECT a.id, 'aevum', 'AEVUM (Brand)', 'AEVUM Operating Layer für Customer-Beziehungen', 'active', NULL, 'ai-systems',
  '{"blueprint_id": "aevum-own"}'::jsonb,
  '{"deal_type": "internal", "notes": "Client Zero — eigene Plattform"}'::jsonb
FROM public.accounts a WHERE a.slug = 'carlos'
ON CONFLICT (account_id, slug) DO NOTHING;

INSERT INTO public.projects (account_id, slug, name, description, status, tier, industry, pricing)
SELECT a.id, 'lennox-os', 'LennoxOS', 'Master-Workspace + Personal-OS für Carlos', 'active', NULL, 'ai-systems',
  '{"deal_type": "internal"}'::jsonb
FROM public.accounts a WHERE a.slug = 'carlos'
ON CONFLICT (account_id, slug) DO NOTHING;

-- ============================================================
-- DONE
-- ============================================================
-- Verify:
-- SELECT * FROM accounts WHERE client_zero=true;
-- SELECT slug, name FROM projects WHERE account_id=(SELECT id FROM accounts WHERE slug='carlos');
-- SELECT id, display_name, deal_type FROM blueprint_pricing WHERE is_active=true;
-- SELECT id, display_name FROM blueprint_marketing_thesis WHERE is_active=true;
