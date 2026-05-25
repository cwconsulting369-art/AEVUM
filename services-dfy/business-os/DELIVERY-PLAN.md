# Business-OS — Delivery-Playbook (AEVUM intern)

---

## Phasen

### Phase 1: Discovery & Architecture — W1–W2

**Ziel:** Vollständiges Verständnis der Kunden-Prozesse, Tool-Landschaft und Prioritäten. System-Design abgeschlossen vor erstem Build-Commit.

| Deliverable | Verantwortlich | Status-Check |
|---|---|---|
| Discovery-Call 1: Sales/CRM-Prozess-Mapping | Founder + Customer | Ende W1 |
| Discovery-Call 2: PM-Prozess + Reporting-Anforderungen | Founder + Customer | Ende W1 |
| Prozess-Dokumentation (intern) | Eng | Anfang W2 |
| Datenbankschema-Entwurf | Eng | Mitte W2 |
| Modul-Priorisierungs-Dokument (mit Customer abgestimmt) | Founder | Ende W2 |
| Architecture-Sign-Off durch Customer | Customer | Ende W2 |

**Customer-Touchpoint:** Kick-off Call (W1, 90 min) + Architecture-Review Call (W2, 60 min)

---

### Phase 2: Core-Build — Datenbank + CRM — W3–W4

**Ziel:** Funktionales CRM-Modul auf solider Datenbankbasis. Erste Automationen live.

| Deliverable | Verantwortlich | Status-Check |
|---|---|---|
| Datenbank vollständig aufgebaut (alle Entitäten, Relationen) | Eng | Ende W3 |
| CRM-Modul: Kontakte, Companies, Deals, Pipeline live | Eng | Ende W3 |
| Benutzer-Rollen konfiguriert (alle 4 Rollen) | Eng | Mitte W4 |
| Erste Automationen live (Lead-Capture, Deal-Stage-Updates) | Eng | Ende W4 |
| Interner QA-Test CRM-Modul | Eng + CS | Ende W4 |

**Customer-Touchpoint:** Weekly Sync W3 (30 min Status-Update) + Milestone-Review W4 (45 min Demo CRM)

---

### Phase 3: PM-Modul + Dashboard — W5–W6

**Ziel:** Projektmanagement-Modul einsatzbereit. Dashboard aggregiert Daten aus CRM und PM.

| Deliverable | Verantwortlich | Status-Check |
|---|---|---|
| PM-Modul: Projekttypen, Phasen, Aufgaben, Ressourcen live | Eng | Ende W5 |
| Onboarding-Flows (1–2) konfiguriert und getestet | Eng | Ende W5 |
| Dashboard: CRM-Feeds live (Deal-Wert, Pipeline-Stage) | Eng | Mitte W6 |
| Dashboard: PM-Feeds live (Projekt-Status, Auslastung) | Eng | Ende W6 |
| Dashboard-Views für alle Rollen konfiguriert | Eng | Ende W6 |
| Interner QA-Test PM + Dashboard | Eng + CS | Ende W6 |

**Customer-Touchpoint:** Weekly Sync W5 + Milestone-Review W6 (60 min Demo PM + Dashboard)

---

### Phase 4: AI-Agent + Automations-Layer — W7–W8

**Ziel:** Alle Automationen live. AI-Agent(en) deployed und getestet. System technisch vollständig.

| Deliverable | Verantwortlich | Status-Check |
|---|---|---|
| AI-Agent(en) konfiguriert (Prompts, Kontext, Datenbank-Anbindung) | Eng + Founder | Ende W7 |
| Alle verbleibenden Automationen live | Eng | Ende W7 |
| End-to-End-Test aller Module + Automationen | Eng | Mitte W8 |
| Automations-Dokumentation vollständig | Eng | Ende W8 |
| Agent-Use-Case-Tests (alle definierten Szenarien) | Eng + CS | Ende W8 |

**Customer-Touchpoint:** Weekly Sync W7 + Agent-Demo W8 (45 min)

---

### Phase 5: UAT + Refinement — W9

**Ziel:** Customer testet vollständiges System. Feedback wird eingearbeitet (max. 2 Runden).

| Deliverable | Verantwortlich | Status-Check |
|---|---|---|
| UAT-Zugang für Customer eingerichtet | CS | Anfang W9 |
| UAT-Feedback-Template an Customer übergeben | CS | Anfang W9 |
| Feedback-Runde 1: Sammlung + Priorisierung | CS + Eng | Mitte W9 |
| Fixes und Anpassungen implementiert | Eng | Ende W9 |
| Finale Sign-Off durch Customer | Customer | Ende W9 |

**Customer-Touchpoint:** UAT-Briefing-Call (W9 Anfang, 30 min) + Feedback-Review-Call (W9 Mitte, 45 min)

---

### Phase 6: Go-Live + Handover — W10

**Ziel:** System in Produktion. Customer und Key-User sind ongeboardet. Support-Phase beginnt.

| Deliverable | Verantwortlich | Status-Check |
|---|---|---|
| Produktions-Deployment aller Module | Eng | Anfang W10 |
| Systemdokumentation finalisiert | Eng + CS | Mitte W10 |
| Übergabe-Session (90 min, Customer + Key-User) | Founder + CS | Mitte W10 |
| Screen-Recording-Walkthroughs für alle Module | CS | Ende W10 |
| Support-Kanal eingerichtet und kommuniziert | CS | Ende W10 |
| Go-Live-Bestätigung (intern + Customer) | CS | Ende W10 |

**Customer-Touchpoint:** Handover-Session (W10, 90 min) + 1-Wochen-Check-in (W11)

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Retainer |
|---|---|---|---|---|---|---|---|
| **Founder** | Lead (Calls, Architecture-Sign-Off) | Review | Review | AI-Agent-Konzept | Eskalation | Handover | Monatliches Strategy-Review |
| **Engineering** | Datenbankschema | Full Build | Full Build | Full Build | Fixes | Deployment + Docs | Wartung, Updates, Bugfixes |
| **Customer Success** | Koordination | Syncs | Syncs | Syncs | UAT-Management | Training, Handover | Monatliche Check-ins, Support-Kanal |

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Zeitpunkt | Format | Dauer | Ziel |
|---|---|---|---|---|
| **Kick-off Call** | W1 | Video-Call | 90 min | Prozess-Discovery, Erwartungen alignment, Timeline bestätigen |
| **Architecture-Review** | W2 | Video-Call | 60 min | Datenbankschema + Modul-Plan abnehmen |
| **Weekly Syncs** | W3–W8 | Video-Call | 30 min | Status, Blocker, nächste Schritte |
| **Milestone-Reviews** | W4, W6, W8 | Video-Call + Demo | 45–60 min | Module live demonstrieren, Feedback einholen |
| **UAT-Briefing** | W9 | Video-Call | 30 min | Testing-Scope erklären, Feedback-Template übergeben |
| **Feedback-Review** | W9 Mitte | Video-Call | 45 min | Feedback besprechen, Priorisierung |
| **Handover-Session** | W10 | Video-Call (aufgezeichnet) | 90 min | System-Walkthrough, Key-User-Training |
| **1-Wochen-Check-in** | W11 | Video-Call oder Async | 30 min | Erste Praxis-Erfahrungen, offene Fragen |
| **Monthly Business-Review** | Monatlich (Retainer) | Video-Call | 45 min | KPI-Review, Iterations-Planung |

---

## Risk-Register

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Scope-Creep durch unklare Prozesse** — Customer entdeckt in der Build-Phase, dass die eigenen Prozesse komplexer sind als initial kommuniziert | Hoch | Hoch | Detailliertes Architecture-Sign-Off in W2 als Fundament. Change-Request-Policy kommunizieren. Discovery-Phase nicht überspringen. |
| R2 | **Fehlende Customer-Verfügbarkeit** — Ansprechpartner fällt aus oder ist zu wenig verfügbar für Feedback-Runden | Mittel | Hoch | Commitment-Brief vor Projekt-Start. Backup-Ansprechpartner identifizieren. Deadline-Eskalation an Founder wenn 48h kein Feedback. |
| R3 | **Datenqualität der Bestandsdaten** — Kundendaten aus Altsystemen sind so unstrukturiert, dass Import oder Referenzierung scheitert | Mittel | Mittel | In Discovery klären was tatsächlich integriert werden muss vs. was Customer selbst migriert. Klare OOS-Kommunikation zu Migration. |
| R4 | **SaaS-Plattform-Limitierungen** — gewählte Plattform (Notion/Airtable/Make) kann bestimmte Anforderungen nicht abbilden | Niedrig | Hoch | Architecture-Phase prüft Plattform-Fitness vor Build-Start. Fallback-Optionen vordenken. Plattform-Wechsel = neue Kalkulation. |
| R5 | **AI-Agent-Performance unter Erwartung** — Agent liefert in Praxis-Tests nicht die gewünschte Qualität für definierte Use-Cases | Mittel | Mittel | Use-Cases in Discovery realistisch kalibrieren. Prompt-Iteration als festen Bestandteil der Agent-Phase. 90%-Korrektheit als Quality-Gate, nicht 100%. |

---

## Quality-Gates

| Gate | Zeitpunkt | Was wird geprüft | Verantwortlich | Muss bestehen vor |
|---|---|---|---|---|
| **QG-1: Architecture-Sign-Off** | Ende W2 | Datenbankschema vollständig, Modul-Plan mit Customer abgestimmt | Founder | Phase 2 Start |
| **QG-2: CRM-Abnahme** | Ende W4 | CRM funktional, Rollen korrekt, erste Automationen ohne Fehler | Eng + CS | Phase 3 Start |
| **QG-3: Dashboard-Abnahme** | Ende W6 | Dashboard zeigt korrekte Daten aus CRM + PM, alle Views funktional | Eng + CS | Phase 4 Start |
| **QG-4: Full-System-Test** | Ende W8 | Alle Module + Automationen + Agent End-to-End fehlerfrei | Eng | UAT-Freigabe |
| **QG-5: UAT-Sign-Off** | Ende W9 | Customer-Abnahme schriftlich, keine offenen P1/P2 Bugs | CS | Go-Live |
| **QG-6: Handover-Vollständigkeit** | Ende W10 | Docs, Videos, Zugänge, Support-Kanal alles vorhanden | CS | Retainer-Start |

---

## Handover-Package

| Asset | Format | Verantwortlich |
|---|---|---|
| **Systemdokumentation** | Notion/PDF — Datenbankstruktur, Module, Automations-Map | Eng |
| **Automations-Inventar** | Tabelle: Name / Trigger / Action / Status / Wartungshinweis | Eng |
| **AI-Agent-Dokumentation** | Prompt-Texte, Use-Cases, Kontext-Setup, Update-Anleitung | Eng |
| **SOP-Templates** | 3–5 Kern-Prozesse als schriftliche SOPs | CS |
| **Screen-Recording-Walkthroughs** | Loom-Videos pro Modul (CRM / PM / Dashboard / Agent) | CS |
| **Benutzer-Zugänge** | Übergabe aller Admin-Zugänge + Passwort-Safe-Eintrag | CS |
| **Change-Request-Formular** | Template für zukünftige Erweiterungsanfragen | CS |
| **Support-Kanal-Info** | Slack-Channel oder Email + SLA-Beschreibung (Retainer) | CS |
| **Handover-Call-Aufzeichnung** | Video-Aufzeichnung der 90-min-Übergabe-Session | CS |