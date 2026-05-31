// Kurz-Beschreibungen der Shop-Karten (Shop.tsx Grids).
// Keyed by slug → Card-Description. Separat von den Detail-Texten in
// data/shop-items (die via localizeShopItem übersetzt werden).
export default {
  // Blueprint-Cards (HTML-Entities erlaubt — werden via dangerouslySetInnerHTML gerendert)
  'content-factory.desc':
    'Automatisiert Content-Produktion von Idee bis Publish f&uuml;r Instagram &amp; LinkedIn.',
  'lead-qualifier-pro.desc':
    'Qualifiziert eingehende Leads automatisch, scored nach 7 Kriterien und pusht direkt ins CRM.',
  'reporting-dashboard-setup.desc':
    'W&ouml;chentlicher KPI-Report, automatisch generiert und per Mail an dein Team verschickt.',
  'onboarding-autopilot.desc':
    'Neukunden-Onboarding vollst&auml;ndig automatisiert &mdash; Welcome-Mail, Task-Creation, Slack-Ping.',
  'newsletter-growth-machine.desc':
    'Newsletter-Ideen bis Versand-Queue &mdash; 80% automatisiert, Outline bis Draft in Minuten.',
  'cold-outreach-system.desc':
    'Personalisierte Outreach-Sequenzen, via LLM individualisiert, mit automatischem CRM-Sync.',

  // DFY-Service-Cards (plain text)
  'aevum-business-os.desc':
    'Komplette Unternehmens-Infrastruktur: Datenbank-Backend + Website/CRM + Automation. Tool-Wildwuchs raus, ein verbundenes System rein.',
  'aevum-command-center.desc':
    'Live-KPI-Dashboard im Web + Mobile-HUD via Telegram. KI-Insights, Anomalie-Alerts, Section-Drill-Down. Business-Status in 5 Sek.',
  'aevum-lead-engine.desc':
    'End-to-end Lead-System: Lead-Gen + 7-Kriterien-Qualifier + CRM-Sync + Follow-up-Automation + Sales-Pipeline. DSGVO-konform.',
  'aevum-content-engine.desc':
    'Content-Produktion full-stack: Blog + Social + Newsletter + Cold-Outreach. KI-Content-Fabrik mit Brand-Voice-Tuning, du gibst frei.',
  'aevum-audit.desc':
    'Strategie-Audit in 48h: Tool-Stack-Analyse + Top-3 Quick-Wins + Pitch-Report + Long-Term-Roadmap. Einmalig, Festpreis.',
  'ecommerce-os.desc':
    'Industry-Specific: Shop + Inventory + Payments + Email-Automation. Für DTC-Brands und Shopify-Operations.',
  'script-factory-dfy.desc':
    'Industry-Specific: Ad-Script-Produktion für Meta/TikTok/YouTube nach bewiesenen Frameworks. Für DTC + Performance-Agenturen.',

  // DFY-Service-Cards — Namen (Marken bleiben, nur generische Anhänge übersetzt)
  'aevum-business-os.name': 'AEVUM Business OS',
  'aevum-command-center.name': 'AEVUM Command Center',
  'aevum-lead-engine.name': 'AEVUM Lead-Engine',
  'aevum-content-engine.name': 'AEVUM Content-Engine',
  'aevum-audit.name': 'AEVUM Audit',
  'ecommerce-os.name': 'E-Commerce OS',
  'script-factory-dfy.name': 'Script Factory',

  // DFY tier hints
  'aevum-business-os.tierHint': 'Growth ab €4.500',
  'aevum-command-center.tierHint': 'Starter ab €1.800',
  'aevum-lead-engine.tierHint': 'Growth ab €2.200',
  'aevum-content-engine.tierHint': 'Starter ab €900',
  'aevum-audit.tierHint': 'Einmaliges Festpreis-Paket',
  'ecommerce-os.tierHint': 'Industry-Specific',
  'script-factory-dfy.tierHint': 'Industry-Specific',

  // DFY tags
  'aevum-business-os.tag': 'Komplett',
  'aevum-audit.tag': 'Einstieg',

  // Blueprint tags
  'content-factory.tag': 'Beliebt',
  'lead-qualifier-pro.tag': 'Premium',
  'cold-outreach-system.tag': 'Neu',

  // Blueprint-Card includes (Kurz-Liste, separat von Detail-Page includes)
  'content-factory.includes': [
    'n8n-Workflow JSON',
    'PDF-Setup-Guide (12 Seiten)',
    'Prompt-Library (30+ Prompts)',
  ],
  'lead-qualifier-pro.includes': [
    'n8n-Workflow JSON',
    'DSGVO-Compliance-Checklist',
    'PDF-Guide (18 Seiten)',
  ],
  'reporting-dashboard-setup.includes': [
    'Dashboard-Template',
    'API-Konfiguration',
    'PDF-Setup-Guide (8 Seiten)',
  ],
  'onboarding-autopilot.includes': ['n8n-Workflow JSON', 'PDF-Guide (6 Seiten)'],
  'newsletter-growth-machine.includes': [
    'n8n-Workflow JSON',
    'Prompt-Templates',
    'PDF-Guide (10 Seiten)',
  ],
  'cold-outreach-system.includes': [
    'n8n-Workflow JSON',
    'DSGVO-konforme Templates',
    'PDF-Guide (15 Seiten)',
  ],
};
