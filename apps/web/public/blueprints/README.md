# AEVUM Blueprint-Library — Customer-Setup

Diese n8n-Workflow-JSONs sind direkt in n8n importierbar. Du brauchst keine Coding-Skills, nur einen n8n-Account und die jeweiligen API-Credentials.

## Setup

1. **n8n öffnen** (Self-Host auf eigenem Server, oder Cloud auf [n8n.cloud](https://n8n.cloud))
2. **Workflow → Import from File** → JSON aus dieser Library auswählen
3. **Credentials pro Node setzen** — jeder Node mit `PLACEHOLDER_REPLACE` muss verbunden werden
4. **Test-Run** ausführen
5. **Aktivieren** wenn der Test sauber durchläuft

## Verfügbare Blueprints

### 1. `lead-qualifier-pro.json` — Lead-Qualifier Pro
Web-Form → BANT-Scoring (Claude Sonnet) → CRM-Push (Airtable) → Sales-Notification.

**Voraussetzungen:**
- Anthropic API-Key
- Airtable Personal Access Token + Base mit Tabelle "Leads"
- SMTP-Credentials für Sales-Team-Notification

**Setup-Zeit:** 30-60 Minuten

### 2. `reporting-dashboard-setup.json` — Reporting Dashboard
Wöchentlicher KPI-Report aus Stripe + GA4 + Postgres → Email + Slack jeden Montag 09:00.

**Voraussetzungen:**
- Stripe API-Key (read-only restricted reicht)
- Google Analytics 4 Service-Account + Property-ID
- Postgres-DB mit eigenen Customer-Daten
- SMTP-Credentials
- Slack-Token (optional)

**Setup-Zeit:** 45-90 Minuten

### 3. `onboarding-autopilot.json` — Onboarding Autopilot
Neukunde signs → Welcome-Mail (5min) → Check-In (1 Tag) → Activity-Check (3 Tage) → IF active=Skip / IF inactive=Reminder + Slack-Ping.

**Voraussetzungen:**
- SMTP-Credentials
- Eigene Activity-API (Response: `{ has_logged_in, workflow_count }`)
- Slack-Token (optional)
- Stripe / CRM-Webhook der den Workflow triggert

**Setup-Zeit:** 20-40 Minuten

## DSGVO-Hinweise

- **EU-Hosting empfohlen** für alle Blueprints die mit Kundendaten arbeiten
- **Lead-Qualifier Pro** ist DSGVO-konform wenn n8n + Airtable in EU laufen
- **Onboarding Autopilot** verarbeitet nur Daten die du bereits hast (Vertragsbasis Art. 6 Abs. 1 lit. b)
- **Reporting Dashboard** läuft auf aggregierten Daten, kein personenbezogener Output

## Support

- **Detail-Setup-Guide pro Blueprint:** Liegt nach Kauf in deinem Customer-Portal (PDF)
- **Fragen:** Helpbot auf der AEVUM-Site, oder kostenloser Audit-Call
- **Custom-Anpassungen:** Buch einen Setup-Call (€99) oder unser DFY-Service
- **Quality-Gate:** Alle Blueprints in dieser Library sind 1x autonom von uns gebaut + getestet (Initial-Library Wave-F5 2026-05-24)

## Updates

Major-Updates 12 Monate kostenlos. Patch-Updates dauerhaft. Beobachte dein Customer-Portal für Versions-Bumps.
