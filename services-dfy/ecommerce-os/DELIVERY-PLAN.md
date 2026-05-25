# AEVUM E-Commerce-OS — Delivery-Playbook (intern)

---

## Phasen

### Phase 1: Discovery & Architecture — W1–W2

**Ziel:** Vollständiges Verständnis des bestehenden Tech-Stacks, Datenmodell finalisiert, Architektur abgenommen.

| Deliverable | Owner | Customer-Input benötigt |
|---|---|---|
| Tech-Stack-Audit-Dokument (API-Check für alle Tools) | Engineering | API-Keys, Tool-Zugänge |
| Flow-Map: Ist-Zustand (Order-Journey, Support-Journey, Inventory-Journey) | Founder / Engineering | Interview mit Customer-POC |
| Datenmodell-Entwurf (Produkte, Orders, Kunden, Inventory) | Engineering | Sortimentsstruktur-Info |
| Architektur-Skizze (Toolstack + Verbindungen + Datenfluss) | Engineering | — |
| Onboarding-Dokument: Customer-Zugang-Checkliste abgehakt | Customer Success | Alle Zugänge liefern |

**Customer-Touchpoint:** Kick-off Call (90 Min.) + Discovery-Interview (60 Min., W2)

---

### Phase 2: Core-Build — W3–W5

**Ziel:** Shop-Connector, Order-Management, Inventory-Sync laufen stabil in Staging.

| Deliverable | Owner | Customer-Input benötigt |
|---|---|---|
| Shop-API-Integration (bidirektional, Webhook-Setup) | Engineering | API-Keys freigegeben |
| Order-Routing-Flow (Zahlungseingang → Fulfillment → Notification) | Engineering | Fulfillment-Partner-Zugang |
| Storno- und Verzögerungs-Flow | Engineering | — |
| Inventory-Sync (Shop ↔ Lager-Tool, Schwellwerte konfiguriert) | Engineering | Lager-Daten im Ziel-Format |
| Überverkaufs-Schutz aktiv | Engineering | — |
| Fulfillment-Partner-Integration + Tracking-Automation | Engineering | Partner-API-Doku |

**Customer-Touchpoint:** Weekly Sync W3 (30 Min.) + Milestone-Review W5 (45 Min.) — Demo des Order-Flows live

**Quality-Gate intern:** Engineering-Sign-Off: Order-Flow 3x End-to-End getestet in Staging. Inventory-Sync delta <5 Min. verifiziert.

---

### Phase 3: Support & Returns — W5–W6

**Ziel:** Helpdesk-Integration läuft, Triage funktioniert, RMA-Flow komplett.

| Deliverable | Owner | Customer-Input benötigt |
|---|---|---|
| Helpdesk-Tool-Integration (Webhooks + API) | Engineering | Helpdesk-Admin-Zugang |
| Ticket-Triage-Logik (Tags, Kategorien, Routing-Regeln) | Engineering | Top-5-FAQ definiert von Customer |
| Auto-Antwort-Templates (5 Kategorien, dynamische Order-Daten) | Engineering + CS | Template-Texte vom Customer oder Freigabe für AEVUM-Entwürfe |
| Eskalations-Routing (Timeouts konfiguriert) | Engineering | — |
| RMA-Formular / Antragsstrecke live | Engineering | Retouren-Policy-Dokument vom Customer |
| Approval/Rejection-Flow + Inventory-Rückbuchung | Engineering | — |

**Customer-Touchpoint:** Weekly Sync W6 (30 Min.) — Demo Support-Triage + RMA-Flow

**Quality-Gate intern:** CS prüft: Triage-Trefferquote >90% auf 20 Test-Tickets. RMA-Flow 3x durchgetestet.

---

### Phase 4: Reporting & Exports — W6–W7

**Ziel:** Dashboard live, Auto-Reports konfiguriert, Buchhaltungs-Export läuft autonom.

| Deliverable | Owner | Customer-Input benötigt |
|---|---|---|
| KPI-Dashboard (GMV, AOV, Conversion, Return-Rate, Ticket-Volumen, Response-Time) | Engineering | — |
| Täglicher Auto-Report (E-Mail oder Slack) | Engineering | Ziel-Kanal und Empfänger |
| Customer-Segment-Tags live (New / Repeat / VIP / At-Risk) mit E-Mail-Tool-Sync | Engineering | E-Mail-Tool-Zugang und Segment-Definitions |
| Buchhaltungs-CSV-Export (wöchentlich automatisch) | Engineering | Pflichtfelder-Definition (ggf. mit Steuerberater abgestimmt) |

**Customer-Touchpoint:** Weekly Sync W7 (30 Min.) — Dashboard-Walkthrough

**Quality-Gate intern:** Founder-Check: Dashboard-Werte mit Roh-Daten aus Shop-Backend abgeglichen (Abweichung <2%). Export-CSV manuell auf Pflichtfelder geprüft.

---

### Phase 5: Testing & Hardening — W7–W8

**Ziel:** Alle Flows vollständig End-to-End getestet, Error-Handling aktiv, Silent-Fails eliminiert.

| Deliverable | Owner | Customer-Input benötigt |
|---|---|---|
| End-to-End-Test-Protokoll (alle Kern-Flows, 3 Durchläufe) | Engineering + CS | Zugriff auf echte Staging-Daten oder Testdaten |
| Fehler-Log-Analyse und Fixes | Engineering | — |
| Error-Notification-Setup (alle Flows haben Fallback + Alert) | Engineering | Benachrichtigungs-Kanal |
| Performance-Check (Latenz Shop-Sync, Webhook-Delivery-Rate) | Engineering | — |
| Dokumentation Review-Draft (SOP + Video-Script) | CS | Customer-POC für Review-Runde |

**Customer-Touchpoint:** UAT-Session (User Acceptance Testing) mit Customer-POC — W7/W8, 60 Min.

**Quality-Gate intern:** Engineering + CS Sign-Off gemeinsam: Kein Flow ohne Error-Handler. Test-Protokoll vollständig ausgefüllt. Customer-POC hat UAT-Freigabe gegeben.

---

### Phase 6: Handover & Go-Live — W8 (M) / W12–14 (L)

**Ziel:** Customer ist operativ eigenständig. Retainer-Monitoring aktiv.

| Deliverable | Owner | Customer-Input benötigt |
|---|---|---|
| SOP-Dokumentation final (alle Flows schriftlich) | CS | Final-Freigabe |
| Video-Walkthroughs (3–5 Loom-Videos) | CS | — |
| Access-Übergabe (Zugänge dokumentiert, AEVUM-Test-Keys revoked) | Engineering | Customer bestätigt Zugänge |
| Monitoring-Setup (Uptime-Alerts, Flow-Fehler-Alerts, Weekly Health-Check) | Engineering | — |
| Retainer-Kickoff (Async-Ticket-System erklärt, SLA kommuniziert) | CS | — |
| Go-Live-Freigabe (schriftliche Bestätigung Customer) | CS | Schriftlich |

**Customer-Touchpoint:** Handover-Call (60 Min.) + Go-Live-Bestätigung schriftlich

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|---|---|---|---|---|---|---|
| **Founder** | Kick-off, Architektur-Review | Milestone-Gate | — | Dashboard-Check | Final Sign-Off | Go-Live-Freigabe |
| **Engineering** | Tech-Audit, Datenmodell | Core-Build (Vollzeit) | Support/RMA-Build | Reporting-Build | Testing, Fixes | Monitoring-Setup |
| **Customer Success** | Onboarding-Dok, Discovery | Weekly Syncs | Template-Koordination, Triage-Test | Dashboard-Walkthrough | UAT-Begleitung, Doku-Draft | Handover-Call, Retainer-Kickoff |

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Timing | Format | Dauer | Owner |
|---|---|---|---|---|
| **Kick-off Call** | W1, Tag 2–3 | Video-Call | 90 Min. | Founder + CS |
| **Discovery-Interview** | W2 | Video-Call | 60 Min. | Engineering + CS |
| **Weekly Sync** | Jede Woche (W3–W7) | Video-Call oder Async-Loom | 30 Min. | CS |
| **Milestone-Review: Core-Build** | W5 | Video-Call mit Live-Demo | 45 Min. | Engineering + CS |
| **Milestone-Review: Support/RMA** | W6 | Video-Call mit Live-Demo | 30 Min. | Engineering |
| **UAT-Session** | W7–W8 | Video-Call, Customer testet live | 60 Min. | CS + Customer-POC |
| **Handover-Call** | W8 (M) / W12–14 (L) | Video-Call | 60 Min. | CS + Founder |
| **Retainer-Monatliches Update** | Laufend | Async Report + optionaler Call | 30 Min. | CS |

---

## Risk-Register

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Fulfillment-Partner hat keine stabile API oder inkonsistente Doku | Mittel | Hoch | API-Check in W1 als Blocker-Gate. Wenn keine API: EDI-Fallback evaluieren oder manuelle Übergabe-Workflow als Interim. Scope-Anpassung in CR kommunizieren. |
| **R2** | Customer-POC nicht verfügbar oder Feedback-Loops >48h | Mittel | Mittel | Klare Verfügbarkeits-Vereinbarung im Kick-off. Bei 2x Delay: formelle Warnung, Zeitplan-Verschiebung auf Customer-Konto kommuniziert. |
| **R3** | Lager-Daten nicht strukturiert oder in proprietärem Format | Mittel | Hoch | Früh in W1 prüfen. Wenn nicht strukturiert: Interim-Sheet-Lösung als Connector, aber Mehraufwand als CR. Clean-Data als Voraussetzung explizit kommuniziert. |
| **R4** | Tool-Entscheidung (Helpdesk) ändert sich nach W3 | Niedrig | Hoch | Tool-Festlegung als hartes Gate vor Phase 3. Jeder Wechsel danach = CR + Zeitverschiebung, schriftlich bestätigt. |
| **R5** | Webhooks / API-Limits des Shop-Systems (Rate-Limiting) bei hohem Volumen | Niedrig (Tier M) / Mittel (Tier L) | Mittel | In Architecture-Phase Rate-Limits dokumentieren. Queue-Mechanismus einbauen wenn >500 Orders/Mo erwartet. In Tier-L standard. |

---

## Quality-Gates

| Gate | Zeitpunkt | Prüfer | Kriterium |
|---|---|---|---|
| **Gate 1: Architecture Sign-Off** | Ende W2 | Founder | Datenmodell vollständig, alle APIs erreichbar und dokumentiert, Architektur-Skizze genehmigt |
| **Gate 2: Core-Build Sign-Off** | Ende W5 | Engineering | Order-Flow 3x End-to-End erfolgreich, Inventory-Sync-Delta <5 Min., Fehler-Log leer |
| **Gate 3: Support & RMA Sign-Off** | Ende W6 | CS | Triage-Trefferquote >90%, RMA 3x durchgetestet, keine Silent-Fails |
| **Gate 4: Reporting Sign-Off** | Ende W7 | Founder | Dashboard-Werte verifiziert (<2% Abweichung), Export-CSV geprüft, Auto-Report live |
| **Gate 5: UAT Sign-Off** | W7–W8 | Customer-POC | Customer hat alle Kern-Flows selbst durchgeklickt und schriftlich freigegeben |
| **Gate 6: Go-Live Sign-Off** | W8 (M) / W14 (L) | Founder + CS | Handover-Package vollständig, Monitoring aktiv, schriftliche Go-Live-Bestätigung Customer vorhanden |

---

## Handover-Package

| Asset | Format | Ablage |
|---|---|---|
| SOP-Dokumentation alle Haupt-Flows | Notion / PDF | Customer-Notion-Workspace oder Google Drive |
| Video-Walkthroughs (3–5 Loom-Videos) | Loom-Links + MP4-Download | Shared Drive |
| Architektur-Übersicht (Tool-Map + Datenfluss) | Miro / PDF | Shared Drive |
| API-Keys & Zugänge-Dokumentation | Passwort-Manager-Export (1Password / Bitwarden) | Sicher an Customer übergeben |
| Test-Protokoll (abgenommene Flows) | PDF | Shared Drive |
| Change-Request-Log (falls CRs während Setup) | Notion / PDF | Shared Drive |
| Monitoring-Anleitung (wie Alerts lesen, wie eskalieren) | Notion-Seite | Customer-Notion-Workspace |
| Retainer-SLA-Dokument | PDF | E-Mail + Shared Drive |
| Buchhaltungs-Export-Konfiguration | Inline in SOP | — |
| Kontakt- und Eskalations-Pfad AEVUM | Notion-Seite | Customer-Notion-Workspace |