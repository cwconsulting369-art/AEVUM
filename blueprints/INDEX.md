# AEVUM Blueprints — Übersicht

Fertige n8n-Workflows für Agenturen, Personal Brands und Mittelstand.
Jedes Blueprint enthält eine Setup-Anleitung (README.md) und eine importierbare n8n-Workflow-Datei (workflow.json).

**Voraussetzung für alle Blueprints:** n8n (self-hosted oder Cloud, Version >= 1.30)

---

## Die 6 Blueprints

| # | Name | Ordner | Was es macht | Schwierigkeit |
|---|------|--------|-------------|---------------|
| 1 | Content-Factory | `content-factory/` | Thema → fertig formatierter Post für Instagram + LinkedIn, täglich automatisch | Einsteiger |
| 2 | Lead-Qualifier | `lead-qualifier/` | Eingehende Leads per BANT-Score bewerten und ans CRM routen | Einsteiger |
| 3 | Reporting Dashboard | `reporting-dashboard/` | Wöchentlicher KPI-Report aus GA4, automatisch per Mail | Mittel |
| 4 | Onboarding-Autopilot | `onboarding-autopilot/` | Neukunden vollautomatisch durch Welcome + Follow-up-Sequenz führen | Einsteiger |
| 5 | Newsletter Machine | `newsletter-machine/` | Newsletter-Draft KI-generiert, menschlicher Review-Step, Beehiiv-Push | Mittel |
| 6 | Cold Outreach System | `cold-outreach-system/` | DSGVO-konformes Cold-Outreach mit KI-Personalisierung, 3-Schritt-Sequenz | Fortgeschritten |

---

## Welches Blueprint passt zu dir?

**Du willst mehr Content produzieren ohne mehr Zeit zu investieren?**
→ Blueprint 1: Content-Factory

**Du bekommst Anfragen, aber weißt nicht wie du sie priorisieren sollst?**
→ Blueprint 2: Lead-Qualifier

**Du verlierst den Überblick über deine Marketing-KPIs?**
→ Blueprint 3: Reporting Dashboard

**Dein Onboarding-Prozess ist uneinheitlich oder manuell?**
→ Blueprint 4: Onboarding-Autopilot

**Du willst regelmäßig einen Newsletter schicken, aber hast keine Zeit zum Schreiben?**
→ Blueprint 5: Newsletter Machine

**Du willst aktiv neue Kunden ansprechen ohne Kaltakquise per Telefon?**
→ Blueprint 6: Cold Outreach System

---

## Schnellstart

1. n8n öffnen
2. Oben rechts auf **"Import Workflow"** klicken
3. Die gewünschte `workflow.json` Datei hochladen
4. README.md des Blueprints lesen und Setup-Schritte befolgen
5. Credentials eintragen, Workflow aktivieren

---

## Technische Voraussetzungen

Alle Blueprints nutzen Standard-n8n-Nodes. Keine Custom-Nodes oder Plugins nötig.

**Genutzte Node-Typen:**
- `n8n-nodes-base.scheduleTrigger` — Zeitgesteuerte Ausführung
- `n8n-nodes-base.webhook` — Externe Trigger empfangen
- `n8n-nodes-base.httpRequest` — API-Aufrufe (OpenRouter, GA4, Airtable, Beehiiv etc.)
- `n8n-nodes-base.set` — Daten aufbereiten und transformieren
- `n8n-nodes-base.code` — Custom JavaScript-Logik (Scoring, Report-Generierung)
- `n8n-nodes-base.if` — Bedingungen prüfen
- `n8n-nodes-base.switch` — Mehrfach-Routing
- `n8n-nodes-base.sendEmail` — E-Mails versenden
- `n8n-nodes-base.wait` — Zeitverzögerte Fortsetzung
- `n8n-nodes-base.splitInBatches` — Daten in Pakete aufteilen
- `n8n-nodes-base.notion` — Notion-Integration

---

## Placeholder-Referenz

Alle Blueprints nutzen diese Platzhalter — vor der Aktivierung ersetzen:

| Placeholder | Was einsetzen |
|-------------|---------------|
| `YOUR_OPENROUTER_API_KEY` | API Key von openrouter.ai |
| `YOUR_NOTION_DATABASE_ID` | 32-stellige ID aus Notion-URL |
| `YOUR_AIRTABLE_BASE_ID` | Base-ID aus Airtable API-Docs |
| `YOUR_AIRTABLE_API_KEY` | Personal Access Token von Airtable |
| `YOUR_GA4_PROPERTY_ID` | Numerische ID aus GA4 Admin |
| `YOUR_TELEGRAM_CHAT_ID` | Chat-ID aus @userinfobot |
| `YOUR_BEEHIIV_API_KEY` | API Key aus Beehiiv Settings |
| `pub_YOUR_PUBLICATION_ID` | Publication ID aus Beehiiv URL |
| `YOUR_SLACK_WEBHOOK_URL` | Incoming Webhook URL aus Slack API |
| `YOUR_DOMAIN.de` | Deine eigene Domain |
| `YOUR_N8N_BASE_URL` | Öffentliche URL deiner n8n-Instanz |

---

## Support

**Probleme beim Setup?**

1. README.md des jeweiligen Blueprints lesen (Troubleshooting-Section am Ende)
2. n8n Execution-Log prüfen (zeigt genau welcher Node fehlschlägt)
3. AEVUM Audit buchen — wir konfigurieren alles gemeinsam: [aevum-system.de](https://aevum-system.de)

**Lizenz:** Für den persönlichen und kommerziellen Einsatz frei nutzbar. Weitergabe oder Weiterverkauf dieser Blueprints ist nicht gestattet.
