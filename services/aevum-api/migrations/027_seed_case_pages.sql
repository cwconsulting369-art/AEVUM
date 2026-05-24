-- 027_seed_case_pages.sql — Wave B5: Seed 4 echte Cases
--
-- Ketolabs (Tommy), UtilityHub (Miguel), Thailand-RE (Patrick), GoldTraderSociety (Kevin)
-- Memory-Quellen: feedback_aevum_ehrlichkeit_brand, project_patrick_complete_aevum_setup,
-- project_gts_phase2_closed_community, project_ketolabs_2026_05_10
--
-- Idempotent via ON CONFLICT (slug) DO UPDATE.

INSERT INTO public.case_pages (
  account_id, slug, hero_title, hero_subtitle, brand_url,
  project_description, collaboration_story, vision,
  activated_services, live_kpis,
  public, show_revenue, show_users, show_growth,
  testimonial_quote, testimonial_author, sort_order
)
SELECT a.id, v.slug, v.hero_title, v.hero_subtitle, v.brand_url,
       v.project_description, v.collaboration_story, v.vision,
       v.activated_services::jsonb, v.live_kpis::jsonb,
       v.public, v.show_revenue, v.show_users, v.show_growth,
       v.testimonial_quote, v.testimonial_author, v.sort_order
FROM (VALUES
  (
    'ketolabs', 'ketolabs',
    'Ketolabs — CollaGlow als daten-getriebenes DTC-System',
    'Tommy Beretta + AEVUM',
    'https://ketolabs.de',
    'Ketolabs vertreibt CollaGlow (Kollagen-Pulver) DTC ueber Meta-Ads + Klaviyo + Shopify. Bei rund €70k/Mo Meta-Budget brauchte Tommy ein Daten-System, das alle Touchpoints zusammenfuehrt und Margen pro Persona/Kanal sichtbar macht.',
    'Tommy kam mit einem klassischen E-Commerce-Bottleneck: viele Tools, keine konsolidierte Sicht. AEVUM hat einen Live-Datenkanal aus Meta + Klaviyo + Shopify in ein Dashboard gezogen und einen Personal-Agent fuer die Daily-Operations aufgesetzt.',
    'Ketolabs wird das daten-genaueste DTC-System im Keto-Segment. Jede Kampagne, jeder Persona-Cluster, jede Margenrechnung sichtbar in einem System.',
    '[
      {"slug":"command-center-dashboard","name":"Command Center Dashboard","started_at":"2026-05-22","impact":"Tagliche KPIs in einem Blick"},
      {"slug":"ecommerce-os","name":"E-Commerce OS","started_at":"2026-05-22","impact":"Shop + Meta + Klaviyo + Shopify connected"},
      {"slug":"personal-agent","name":"Personal AI-Agent","started_at":"2026-05-22","impact":"Daily-Ops-Assistant mit Kunden-Kontext"}
    ]',
    '[
      {"label":"Monatliches Werbebudget","value":"€70.000","unit":"/Mo","source":"manual"},
      {"label":"Klaviyo-Liste","value":"20.000","unit":"Subscribers","source":"manual"}
    ]',
    true, false, false, false,
    NULL, 'Tommy Beretta, Founder Ketolabs',
    10
  ),
  (
    'utilityhub', 'utilityhub',
    'UtilityHub — Energie-Beratung skalieren mit Daten-Hub',
    'HC Growth LTD + AEVUM',
    'https://utility-hub.one',
    'HC Growth (Miguel) betreibt UtilityHub als Daten-Hub fuer Energie-Beratung in DACH. Hausverwaltungen und B2B-Kunden bekommen DSGVO-konformen Portal-Zugang fuer Stromkosten-Vergleiche und Vertrags-Management.',
    'Miguel braucht ein professionelles Daten-Hub, das technisch sauber skaliert (DSGVO-konform, Multi-Org-Architecture, Audit-Trail). AEVUM baut die komplette Infrastruktur als Sub-Auftragsverarbeiter — Miguel / HC Growth bleibt Hauptanbieter.',
    'UtilityHub als groesster Daten-Hub fuer Energie-Beratung in DACH. Stromvergleich, Vertrags-Management und Customer-Dashboards als One-Stop-Loesung fuer Beratungen.',
    '[
      {"slug":"business-os","name":"Business OS","started_at":"2026-05-15","impact":"Komplette Customer-Portal Infrastruktur"},
      {"slug":"database-system","name":"Database System","started_at":"2026-05-15","impact":"Multi-Org Supabase mit Audit-Trail"},
      {"slug":"website-crm","name":"Website + CRM","started_at":"2026-05-15","impact":"app.utility-hub.one + Admin-Backend"}
    ]',
    '[
      {"label":"Status","value":"Live in Produktion","unit":"","source":"manual"},
      {"label":"DSGVO-Compliance","value":"Phase A-C done","unit":"","source":"manual"}
    ]',
    true, false, false, false,
    NULL, 'Miguel, HC Growth LTD',
    20
  ),
  (
    'patrick-roth', 'thailand-re',
    'Thailand RE — Buyer-Concierge fuer Pattaya + Rayong',
    'Patrick Roth + AEVUM',
    'https://thailand-real-estate.de',
    'Patrick Roth baut den ersten daten-getriebenen Real-Estate-Concierge fuer Deutsch-Investoren in Pattaya und Rayong (Thailand). Trust-Funnel mit Property-Database, Lead-Qualifizierung und Personal-Agent fuer Investor-Fragen.',
    'Patrick brauchte eine vollstaendige Plattform vom Trust-Aufbau (Website + Frameworks) bis zu den Operations (Lead-API + Bot + Personal-Agent). AEVUM hat in einem Sprint Setup + Personal-Agent live geschaltet.',
    'Thailand-RE wird Reference fuer Deutsch-Investoren in Suedost-Asien. Vollstaendige Concierge-Erfahrung von Erst-Anfrage bis Property-Uebergabe — alles ueber ein System.',
    '[
      {"slug":"website-crm","name":"Website + CRM","started_at":"2026-05-24","impact":"Trust-Funnel mit Property-DB"},
      {"slug":"ai-lead-engine","name":"AI Lead Engine","started_at":"2026-05-24","impact":"Lead-Qualifizierung + n8n-Pipeline"},
      {"slug":"personal-agent","name":"Personal AI-Agent","started_at":"2026-05-24","impact":"@thailandre_bot mit AEVUM-DB-Context"}
    ]',
    '[
      {"label":"Status","value":"Live seit 2026-05-24","unit":"","source":"manual"},
      {"label":"Bot","value":"@thailandre_bot","unit":"","source":"manual"}
    ]',
    true, false, false, false,
    NULL, 'Patrick Roth',
    30
  ),
  (
    'goldtradersociety', 'goldtradersociety',
    'GoldTraderSociety — Closed-Community fuer Top-Trader',
    'Kevin Uhl + AEVUM',
    'https://goldtradersociety.com',
    'GoldTraderSociety ist eine Closed-Community fuer 20-30 Top-Trader (XAUUSD-Focus). MT5-Bridge bringt Signale und Performance live in die Member-App, Rebate-Split via IB-Setup.',
    'Kevin braucht eine technisch saubere Closed-Community-Infrastruktur, die Signale + Trading-Performance + Member-Verwaltung verbindet. AEVUM baut MT5-Bridge, Mobile-Dashboard, AI-Tools und Signal-Aggregation.',
    'GoldTraderSociety als Reference fuer professionelle XAUUSD-Trading-Communities. Daten-genau, exklusiv, mit AI-Tools, die Top-Trader weiterbringen.',
    '[
      {"slug":"command-center-dashboard","name":"Command Center Dashboard","started_at":"2026-05-23","impact":"MT5-Bridge + Live-KPIs Mobile"},
      {"slug":"hud-command-center","name":"HUD Command Center","started_at":"2026-05-23","impact":"TG-Bot + Game-HUD"},
      {"slug":"business-os","name":"Business OS","started_at":"2026-05-23","impact":"Member-Management + IB-Setup"}
    ]',
    '[
      {"label":"MT5-Bridge","value":"Live","unit":"","source":"manual"},
      {"label":"Community-Status","value":"Phase 2 Closed","unit":"","source":"manual"}
    ]',
    true, false, false, false,
    NULL, 'Kevin Uhl, GTS',
    40
  )
) AS v(
  acc_slug, slug, hero_title, hero_subtitle, brand_url,
  project_description, collaboration_story, vision,
  activated_services, live_kpis,
  public, show_revenue, show_users, show_growth,
  testimonial_quote, testimonial_author, sort_order
)
JOIN public.accounts a ON a.slug = v.acc_slug
ON CONFLICT (slug) DO UPDATE
SET hero_title          = EXCLUDED.hero_title,
    hero_subtitle       = EXCLUDED.hero_subtitle,
    brand_url           = EXCLUDED.brand_url,
    project_description = EXCLUDED.project_description,
    collaboration_story = EXCLUDED.collaboration_story,
    vision              = EXCLUDED.vision,
    activated_services  = EXCLUDED.activated_services,
    live_kpis           = EXCLUDED.live_kpis,
    public              = EXCLUDED.public,
    testimonial_author  = EXCLUDED.testimonial_author,
    sort_order          = EXCLUDED.sort_order,
    updated_at          = now();
