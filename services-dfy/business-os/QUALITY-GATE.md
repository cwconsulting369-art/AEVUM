# Business-OS — Quality-Gate & Sign-Off

**Item-Slug:** `business-os`
**Item-Type:** DFY
**Tier:** ☐ M / ☐ L *(bei Abnahme ausfüllen)*
**Customer:** _______________
**Delivery-Abschluss-Datum:** _______________
**Sign-Off durch (AEVUM):** _______________
**Sign-Off durch (Customer):** _______________

---

## Asset-Inventar

| # | Asset | Format | Speicherort | Status |
|---|---|---|---|---|
| 01 | Datenbankschema (finalisiert) | Notion-Page / PDF | /projects/[customer]/docs | ☐ |
| 02 | CRM-Modul (Produktion) | Live in Zielplattform | [Plattform-Link] | ☐ |
| 03 | PM-Modul (Produktion) | Live in Zielplattform | [Plattform-Link] | ☐ |
| 04 | Reporting-Dashboard (Produktion) | Live in Zielplattform | [Plattform-Link] | ☐ |
| 05 | AI-Agent(en) (deployed) | Live in Zielplattform + Docs | [Plattform-Link + /docs] | ☐ |
| 06 | Automations-Inventar | Notion-Tabelle / PDF | /projects/[customer]/docs | ☐ |
| 07 | Systemdokumentation | Notion-Page / PDF | /projects/[customer]/docs | ☐ |
| 08 | SOP-Templates (3–5 Stück) | Notion-Page | /projects/[customer]/sops | ☐ |
| 09 | Screen-Recording-Walkthroughs (4 Videos) | Loom | /projects/[customer]/videos | ☐ |
| 10 | Handover-Call-Aufzeichnung | Loom / MP4 | /projects/[customer]/videos | ☐ |
| 11 | Benutzer-Zugänge übergeben | Passwort-Safe-Eintrag | 1Password / Bitwarden | ☐ |
| 12 | Support-Kanal eingerichtet | Slack / Email | [Channel-Link] | ☐ |
| 13 | Customer-Sign-Off (schriftlich) | Email / Notion-Kommentar | /projects/[customer]/sign-off | ☐ |

---

## Sign-Off-Kriterien

Alle 10 Punkte müssen ✅ sein vor Übergabe in Retainer-Phase:

| # | Kriterium | Status |
|---|---|---|
| 01 | Alle Module (CRM, PM, Dashboard, Agent) laufen in Produktion ohne P1/P2-Fehler | ☐ |
| 02 | Dashboard zeigt korrekte Live-Daten aus allen Quellen (Stichproben-Test: <2% Abweichung) | ☐ |
| 03 | Alle vereinbarten Automationen sind live, dokumentiert und in Test-Runs fehlerfrei durchgelaufen | ☐ |
| 04 | AI-Agent beantwortet alle definierten Use-Cases korrekt in >90% der Testfälle (Test-Protokoll vorhanden) | ☐ |
| 05 | Benutzer-Rollen korrekt konfiguriert — Zugriffstest für jede Rolle bestanden und dokumentiert | ☐ |
| 06 | Systemdokumentation vollständig — Nicht-Techniker kann Kern-Funktionen ohne AEVUM-Hilfe nachvollziehen | ☐ |
| 07 | Onboarding-Flow(s) erfolgreich durch End-to-End-Test mit realen Testdaten | ☐ |
| 08 | Handover-Package vollständig (alle 13 Assets im Inventar vorhanden) | ☐ |
| 09 | Customer-Ansprechpartner hat Handover-Session abgenommen — schriftliche Bestätigung vorliegt | ☐ |
| 10 | Retainer-Bedingungen kommuniziert, Support-Kanal aktiv, erster Monthly-Review-Termin gebucht | ☐ |

---

## Known Limitations / Phase-2-Items

Folgende Items sind bewusst nicht in Phase 1 enthalten und müssen bei Bedarf separat beauftragt werden:

| # | Item | Empfohlener Zeitpunkt | Zugehöriger Service |
|---|---|---|---|
| L1 | Daten-Migration aus Altsystemen (vollständige Übernahme historischer Daten) | Nach 4–8 Wochen Betrieb wenn Datenstruktur stabil | Add-On: Migrations-Sprint |
| L2 | Erweiterung auf zusätzliche Datenquellen (z.B. Accounting, Ads, Support-Tools) | Nach 3 Monaten wenn Kern-System stabil genutzt wird | Command-Center-Dashboard Erweiterung |
| L3 | Erweiterte AI-Agenten (Sales-Coaching, Deep-Research, Meeting-Intelligence) | Nach 6 Monaten Business-OS-Nutzung | Sales-OS oder separater Agent-Sprint |
| L4 | Full-Stack Lead-Generierung (Scraping, Outreach, Qualifizierung) | Wenn CRM-Nutzung etabliert ist | AI-Lead-Engine |
| L5 | Marketing-Automation und Content-Pipeline-Integration | Nach stabilem Ops-System | Content-Engine |
| L6 | Mobile-optimierte Views oder native App-Experience | Auf Anfrage, custom Scope | Custom Engineering Angebot |
| L7 | Automatisches Reporting an externe Stakeholder (Investoren, Board) | Nach 6+ Monaten | Dashboard-Erweiterung |

---

## DB-Update-Befehl

```sql
-- Business-OS DFY Item: Status auf DELIVERED setzen
UPDATE aevum_service_items
SET
  status              = 'delivered',
  delivery_date       = CURRENT_DATE,
  sign_off_customer   = TRUE,
  sign_off_internal   = TRUE,
  retainer_active     = TRUE,
  post_launch_support = TRUE,
  phase_2_items       = JSON_ARRAY(
                          'data-migration',
                          'additional-data-sources',
                          'extended-ai-agents',
                          'lead-generation-integration',
                          'marketing-automation',
                          'mobile-views',
                          'external-stakeholder-reporting'
                        ),
  updated_at          = NOW()
WHERE
  item_slug           = 'business-os'
  AND customer_id     = :customer_id
  AND project_id      = :project_id;

-- Upsell-Tracking: offene Pfade loggen
INSERT INTO aevum_upsell_pipeline
  (customer_id, source_item_slug, target_item_slug, trigger_condition, status, created_at)
VALUES
  (:customer_id, 'business-os', 'ai-lead-engine',              'leads-incoming-manual',          'open', NOW()),
  (:customer_id, 'business-os', 'command-center-dashboard',    'analytics-depth-request',         'open', NOW()),
  (:customer_id, 'business-os', 'sales-os',                    'crm-underutilized-by-sales-team', 'open', NOW()),
  (:customer_id, 'business-os', 'content-engine',              'content-not-integrated',          'open', NOW()),
  (:customer_id, 'business-os', 'automation-audit',            '90-days-post-launch',             'scheduled', NOW());
```

---

## Pattern-Notes für DFY-Builder-Pattern

```
ITEM: business-os
PATTERN-TYPE: multi-module-system-build
CORE-COMPLEXITY: hoch (4 Module, AI-Layer, Automations-Layer, Rollen-System)
DIFFERENTIATOR vs. andere DFY-Items:
  - Breite statt Tiefe: 4 Module vs. 1 Deep-Module (z.B. sales-os, ai-lead-engine)
  - Fundament-Item: Business-OS ist häufig Prerequisite für andere DFY-Services
  - Change-Risk: hoch — Customer-Prozesse oft unklar zu Beginn, Discovery ist kritischer als bei Single-Module-Items
  - AI-Agent hier: Ops-focused (nicht Lead-Gen, nicht Content) → andere Prompt-Patterns als ai-lead-engine oder content-engine

PRICING-ANCHOR: Setup €12k–€60k (breiteste Range aller DFY-Items)
DELIVERY-COMPLEXITY: höchste im DFY-Portfolio (Tier L: bis 320h)
UPSELL-POTENZIAL: höchstes im Portfolio (Fundament für alle anderen Services)
CHURN-RISIKO: niedrig wenn System tatsächlich genutzt wird (high switching cost)

WARNUNG-PATTERN:
  - Kein Architecture-Sign-Off → Scope-Creep guaranteed → niemals Phase 2 starten ohne QG-1 ✅
  - Customer mit Entscheidungs-Silos (Approval durch mehrere Parteien) → Timeline +30%
  - "Wir wollen erst mal schauen" Mindset → kein guter Fit → Pre-Qualifying in Sales-Call

TEMPLATE-VARIATION-HINTS:
  - Für AG: PM-Modul-Gewichtung erhöhen (Projektabwicklung = Kernprozess)
  - Für PB: CRM + Dashboard priorisieren, PM reduziert, Agent stärker auf Content-Ops
  - Für FI: Mehr Rollen, mehr Datenquellen, längere Discovery, Tier L als Default
```