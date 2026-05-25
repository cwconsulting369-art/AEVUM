# HUD Command Center — Delivery-Plan (Intern)

## Phasen

### Phase 1: Discovery & Architecture (Woche 1-2)

**Ziel:** Vollständiges Verständnis der Datenlandschaft, KPI-Prioritäten geklärt, Architektur entschieden.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| Kick-off Call (90 Min.) | Founder / CS | Ja — KPI-Ideen, Tool-Stack vorstellen |
| Datenquellen-Audit (API-Verfügbarkeit, Rate-Limits, Auth) | Eng | API-Keys/Credentials liefern |
| KPI-Definition-Workshop (moderiert, 90 Min.) | Founder / CS | Ja — Top-KPIs benennen, Prioritäten setzen |
| Architektur-Dokument v1 (Datenfluss, Update-Frequenzen, Tool-Entscheidung) | Eng + Founder | Architektur-Approval |
| Scope-Freeze-Bestätigung (schriftlich) | CS | Schriftliche Bestätigung |

**Customer-Touchpoint:** Kick-off Call + KPI-Workshop (2 separate Calls oder kombiniert)

---

### Phase 2: Connector-Build (Woche 2-4 / Tier L: 2-6)

**Ziel:** Alle vereinbarten Datenquellen liefern sauber und zuverlässig in den Data-Layer.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| API-Connector je Quelle (REST/GraphQL/Webhook/Make) | Eng | Keiner — sofern Credentials vorhanden |
| Data-Schema-Design + Normalisierung | Eng | Bestätigung Schema entspricht KPI-Logik |
| Data-Layer-Setup (Airtable/Supabase/BigQuery je Tier) | Eng | — |
| Interner Connector-Test (alle Quellen, Datenfluss geprüft) | Eng | — |
| Wöchentlicher Status-Update | CS | 15-Min-Check-in |

**Customer-Touchpoint:** Wöchentlicher Sync (15 Min.) + Schriftlicher Status-Bericht

---

### Phase 3: Dashboard-Build (Woche 4-5 / Tier L: 6-9)

**Ziel:** Vollständiges HUD live, alle KPI-Cards gebaut, Rollen-Views konfiguriert.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| Dashboard-Layout-Entwurf (Wireframe / Mockup) | Eng + Founder | Feedback innerhalb 48h |
| KPI-Card-Build (je Card) | Eng | — |
| Drill-Down-Logik (Zeitreihen, WoW/MoM/YoY-Vergleich) | Eng | — |
| Rollen-Views (Exec-View + Ops-View, weitere bei Tier L) | Eng | View-Anforderungen bestätigt in Phase 1 |
| Staging-Review intern | Eng + Founder | — |
| Customer-Preview (informell, 30 Min.) | CS | Feedback, keine formale Abnahme |

**Customer-Touchpoint:** Dashboard-Preview-Call (30 Min.)

---

### Phase 4: Alert-System + Testing (Woche 5-6 / Tier L: 9-11)

**Ziel:** Alert-System live, alle Datenflüsse getestet, Edge-Cases dokumentiert.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| Schwellenwert-Definition-Session (45 Min.) | CS | Ja — Customer definiert kritische Grenzwerte |
| Slack + E-Mail Alert-Setup | Eng | Slack-Workspace-Zugang |
| Tier L: SMS + PagerDuty Setup | Eng | Telefonnummern / PagerDuty-Account |
| End-to-End-Test je Datenquelle | Eng | — |
| Edge-Case-Tests (API offline, Rate-Limit, leere Felder) | Eng | — |
| Alert-Test-Dokumentation | Eng | — |
| User-Acceptance-Test (UAT) mit Customer | CS + Customer | 2h Customer-Zeit, Testprotokoll ausfüllen |
| UAT-Sign-Off | Customer | Schriftliche Bestätigung per E-Mail |

**Customer-Touchpoint:** Schwellenwert-Session + UAT (2 separate Calls)

---

### Phase 5: Handover & Go-Live (Woche 6 / Tier L: 11-12)

**Ziel:** Customer kann selbstständig arbeiten, alle Unterlagen übergeben, 30-Tage-Support startet.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| Architektur-Dokumentation (final, versioniert) | Eng | — |
| Fehlerbehandlungs-Playbook | Eng | — |
| Dashboard-Access übergeben (alle Rollen) | CS | User-Accounts angelegt |
| Training-Session (60 Min., live + recorded) | CS + Founder | 1-2 Admin-Personen teilnehmen |
| Recording-Link gesendet | CS | — |
| 30-Tage-Support-Kanal aktiviert (Slack-Channel oder Ticketing) | CS | — |
| Retainer-SLA kommuniziert | CS | Bestätigung |

**Customer-Touchpoint:** Training-Session + Handover-Call

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Retainer |
|---|---|---|---|---|---|---|
| **Founder** | Lead: Discovery, Architektur-Entscheidung, KPI-Workshop | Review | Review Wireframes | UAT-Oversight | Training-Session | QBR (Tier L) |
| **Engineer** | Datenquellen-Audit | Lead: alle Connector-Builds, Data-Layer | Lead: Dashboard-Build | Lead: Alert-System, Testing | Finaldoku, Access-Setup | Connector-Maintenance, Monitoring |
| **Customer-Success** | Kick-off, Erwartungs-Management | Wöchentliche Syncs | Customer-Preview | UAT-Koordination, Schwellenwert-Session | Handover, Training-Koordination | Retainer-Kommunikation, Ticket-Routing |

> Bei kleinen Teams: Founder übernimmt CS-Rolle in Phase 1-2, ab Phase 3 dedizierter CS wenn verfügbar.

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Zeitpunkt | Format | Dauer | Owner |
|---|---|---|---|---|
| **Kick-off Call** | Woche 1 Tag 1-2 | Video-Call | 90 Min. | Founder + CS |
| **KPI-Definition-Workshop** | Woche 1 (ggf. kombiniert mit Kick-off) | Video-Call moderiert | 90 Min. | Founder |
| **Wöchentlicher Sync** | Woche 2-5 / Woche 2-10 (Tier L) | Video-Call | 15-30 Min. | CS |
| **Dashboard-Preview** | Ende Phase 3 | Video-Call / Loom | 30 Min. | CS |
| **Schwellenwert-Session** | Start Phase 4 | Video-Call | 45 Min. | CS |
| **UAT-Session** | Ende Phase 4 | Video-Call + Screenshare | 2h | CS + Customer |
| **Handover + Training** | Phase 5 | Video-Call, aufgezeichnet | 60-90 Min. | CS + Founder |
| **30-Tage Check-in** | 30 Tage nach Go-Live | Video-Call oder async | 30 Min. | CS |
| **QBR (Tier L only)** | Quartal 1 nach Go-Live | Video-Call | 60 Min. | Founder + CS |

---

## Risk-Register

| # | Risk | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Datenquelle hat keine brauchbare API (oder API ist hinter Enterprise-Paywall) | Mittel | Hoch | Audit in Phase 1 deckt das auf. Alternative: Webhook oder Make-Brücke. Falls unmöglich: Quelle aus Scope, Preis-Anpassung. Scope-Freeze schützt. |
| **R2** | Customer liefert Credentials zu spät / hat keinen Admin-Zugang | Hoch | Mittel | Voraussetzungen schriftlich kommuniziert vor Vertragsstart. Timeline-Verschiebung liegt bei Customer, kein Preisnachlass. |
| **R3** | KPI-Definitionen ändern sich nach Scope-Freeze wiederholt | Mittel | Mittel | Scope-Freeze-Dokument als Vertragsbestandteil. Änderungen = Change Request. CR-Policy in Kick-off kommunizieren. |
| **R4** | Quelldaten sind qualitativ so schlecht (Duplikate, fehlende IDs) dass Dashboard-Werte unbrauchbar sind | Niedrig-Mittel | Hoch | Datenquellen-Audit in Phase 1 identifiziert das. Bei kritischen Problemen: Data-Cleaning als separates Engagement anbieten, HUD-Start verschieben bis Basis stimmt. |
| **R5** | Customer hat nach Go-Live hohes Anpassungsvolumen das Retainer-Kontingent sprengt | Mittel | Niedrig-Mittel | Klare Retainer-Kontingent-Kommunikation in Handover. CR-Policy aktiv. Ehrliches Erwartungs-Management: HUD braucht 2-3 Wochen Einlaufzeit bis Customer weiß was er wirklich will. |

---

## Quality-Gates

| Gate | Zeitpunkt | Kriterium | Freigabe durch |
|---|---|---|---|
| **QG-1: Architecture Approved** | Ende Phase 1 | Architektur-Dokument v1 fertig, Customer hat schriftlich bestätigt, Scope-Freeze unterschrieben | Founder |
| **QG-2: All Connectors Live** | Ende Phase 2 | Alle Datenquellen liefern Daten in Data-Layer, interner Test bestanden, Datenfluss-Diagramm aktuell | Eng |
| **QG-3: Dashboard Staging-Ready** | Ende Phase 3 | Alle KPI-Cards gebaut, Werte mit Rohdaten gegengeprüft (≤1% Abweichung), Rollen-Views zugänglich | Eng + Founder |
| **QG-4: Alerts + UAT Passed** | Ende Phase 4 | Alert-Test dokumentiert, Customer-UAT schriftlich abgenommen, Edge-Case-Protokoll vorhanden | CS + Customer |
| **QG-5: Handover Complete** | Ende Phase 5 | Alle Docs übergeben, Recording vorhanden, Support-Kanal aktiv, Customer-Confirmation erhalten | CS |

---

## Handover-Package

| Asset | Format | Übergabe-Weg |
|---|---|---|
| Dashboard-Access (alle Rollen) | Live-URL + User-Accounts | Direkt im Call, schriftlich per E-Mail bestätigt |
| Architektur-Dokumentation (final) | Markdown / Notion-Page | Shared Workspace oder PDF |
| Datenfluss-Diagramm | PDF / Figma-Export | Als Anhang + in Doku verlinkt |
| Fehlerbehandlungs-Playbook | Markdown / Notion-Page | Shared Workspace oder PDF |
| Connector-Übersicht (alle Quellen + Auth-Methoden + Update-Frequenz) | Tabelle in Doku | In Architektur-Doku integriert |
| Training-Recording | Video-Link (Loom / Google Drive) | Per E-Mail + in Shared Workspace |
| Schwellenwert-Tabelle (Alert-Definitionen) | Tabelle | In Architektur-Doku + separates Sheet |
| Change-Request-Formular | Vorlage | Per E-Mail, Erklärung in Training |
| Support-Kanal-Zugang | Slack-Channel oder Ticket-System-Link | In Handover-Call aktiviert |
| Retainer-SLA-Dokument | PDF | Per E-Mail bei Vertragsstart Retainer |