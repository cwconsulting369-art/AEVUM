# Script Factory DFY — Delivery-Playbook (AEVUM-Intern)

## Phasen

### Phase 1: Discovery & Alignment (W1)

**Ziel:** Vollständiges Verständnis von Produktwelt, Zielgruppen, Brand-Voice, Output-Erwartungen

| Deliverable | Owner | Status-Marker |
|---|---|---|
| Kick-off-Call-Protokoll (Ziele, Risiken, Erwartungen) | CS-Lead | ○ |
| Produktkatalog-Analyse: Felder, Datenqualität, Lücken | Eng | ○ |
| Persona-Workshop-Ergebnis (strukturierte Personas 1–N) | CS-Lead + Eng | ○ |
| Style-Guide-Dokument (extrahiert + dokumentiert) | CS-Lead | ○ |
| Beispiel-Script-Analyse (Muster, Stärken, Schwächen) | CS-Lead | ○ |
| Tech-Stack-Entscheidung (Output-Tool, API-Zugänge bestätigt) | Eng | ○ |

**Customer-Touchpoint:** Kick-off-Call (90 min) + Persona-Workshop (60 min, kann kombiniert werden)

---

### Phase 2: Daten-Pipeline & Persona-Library (W2)

**Ziel:** Stabile Datengrundlage, aus der die Engine produzieren kann

| Deliverable | Owner | Status-Marker |
|---|---|---|
| Produktkatalog-Anbindung live (API/CSV-Import, Normalisierung) | Eng | ○ |
| Datenfeld-Mapping dokumentiert (Produkt → Script-Variable) | Eng | ○ |
| Persona-Library im System angelegt (alle vereinbarten Personas) | Eng + CS | ○ |
| Brand-Voice-Regelwerk als Filterschicht implementiert | Eng | ○ |
| Interner QA-Test: 5 Produkte × 1 Persona durchgespielt | Eng | ○ |

**Customer-Touchpoint:** Weekly-Sync (30 min) — Datenqualität-Feedback, offene Fragen zu Produktdaten

---

### Phase 3: Script-Engine Build (W3–4)

**Ziel:** Funktionsfähige Hook-Generator- und Assembly-Pipeline für alle vereinbarten Formate

| Deliverable | Owner | Status-Marker |
|---|---|---|
| Hook-Generator implementiert (5 Pattern-Typen, LLM-Prompting) | Eng | ○ |
| Prompt-Engineering: Kalibrierung auf Style-Guide und Beispiel-Scripts | Eng + CS | ○ |
| Script-Assembly-Logik (Hook→Bridge→Body→CTA, alle Formate) | Eng | ○ |
| Brief-Output-Template fertiggestellt (UGC-Creator-Ready) | CS-Lead | ○ |
| Batch-Run-Konfiguration (Scheduling, Volume-Parameter) | Eng | ○ |
| Interner Test-Run: 10 Scripts, cross-reviewed | Eng + CS | ○ |

**Customer-Touchpoint:** Mid-Build-Preview (30 min) — 5 Sample-Scripts zeigen, Feedback einholen, Kalibrierung bevor Vollausbau

> ⚠ Wichtig: Diesen Touchpoint nicht überspringen. Prompt-Kalibrierung nach Customer-Feedback spart in W5 erheblich Zeit.

---

### Phase 4: Workflow, Output-Integration & Archiv (W5)

**Ziel:** Vollständiger End-to-End-Flow von Batch-Run bis Customer-Hand

| Deliverable | Owner | Status-Marker |
|---|---|---|
| Review-Workflow in Output-Tool konfiguriert (Draft/Review/Approved/Briefed) | Eng | ○ |
| Output-Integration live (Notion/Airtable/GDocs, je nach Entscheidung W1) | Eng | ○ |
| Script-Library mit Tagging-System aufgesetzt | Eng | ○ |
| Feedback-Einspiel-Mechanismus eingerichtet (manuell Tier M / API Tier L) | Eng | ○ |
| Tier L only: Meta/TikTok API-Anbindung + Scoring-Modell | Eng | ○ |
| Test-Batch: 30 Scripts produziert, strukturiert in Output-Tool | Eng | ○ |

**Customer-Touchpoint:** Test-Batch-Review-Call (60 min) — Customer reviewed 30 Scripts, gibt Feedback, Scoring ≥ 7/10 erforderlich

---

### Phase 5: QA, Kalibrierung & Dokumentation (W6 / Tier L: W8–10)

**Ziel:** Produktionsreife bestätigt, alle Edges getestet, Customer-Team befähigt

| Deliverable | Owner | Status-Marker |
|---|---|---|
| Vollständiger QA-Run (alle Produktkategorien × alle Personas × alle Formate) | Eng + CS | ○ |
| Fehlerbehandlung getestet (fehlende Produktdaten, leere Felder) | Eng | ○ |
| Dokumentation: System-Architektur, Datenfluss, Konfigurationsanleitung | Eng | ○ |
| Loom-Walkthrough-Videos (3–5 Videos: Batch-Run starten / Personas pflegen / Feedback einspielen) | CS-Lead | ○ |
| Customer-Training-Session (90 min, Walkthrough live) | CS-Lead | ○ |

**Customer-Touchpoint:** Training-Session (90 min)

---

### Phase 6: Handover & Go-Live (W7 / Tier L: W11–12)

**Ziel:** Sauberer Übergabepunkt, Customer ist selbstständig handlungsfähig

| Deliverable | Owner | Status-Marker |
|---|---|---|
| Handover-Package vollständig (siehe unten) | CS-Lead | ○ |
| Erster produktiver Batch-Run live und abgenommen | Eng + Customer | ○ |
| Retainer-Modus aktiviert (Billing, Prozesse dokumentiert) | CS-Lead | ○ |
| Quality-Gate-Dokument sign-off | Founder/Lead | ○ |

**Customer-Touchpoint:** Go-Live-Call (45 min) + schriftliche Handover-Bestätigung

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Retainer |
|---|---|---|---|---|---|---|---|
| **Founder / Lead** | Review, Freigabe Discovery | — | Quality-Check Sample-Scripts | — | Final Sign-Off | Go-Live-Freigabe | Quarterly Review |
| **Eng (Senior)** | Tech-Stack-Setup | Pipeline-Build (Vollzeit) | Engine-Build (Vollzeit) | Workflow + Integration | QA, Bugfixes | Go-Live-Support | Wartung, Updates |
| **CS-Lead** | Kick-off, Workshop, Persona | Persona-Library Review | Prompt-Engineering, Script-Review | Test-Batch-Review | Doku, Training | Handover | Monthly Check-in |
| **Customer** | ~3h/W (Workshops, Input) | ~1h/W (Datenfragen) | ~1h/W (Sample-Feedback) | ~2h (Batch-Review) | ~2h (Training) | ~1h (Go-Live) | ~1h/Mo |

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Wann | Format | Ziel | Owner |
|---|---|---|---|---|
| Kick-off-Call | W1 Tag 1–2 | Video-Call 90 min | Ziele, Erwartungen, Daten, Rollout-Plan klären | CS-Lead |
| Persona-Workshop | W1 (ggf. Kick-off kombiniert) | Video-Call 60 min | Personas strukturiert aufnehmen | CS-Lead |
| Weekly Sync | W2, W3, W4 | Video-Call 30 min | Offene Fragen, Blocker, Feedback | CS-Lead |
| Mid-Build-Preview | W3 Ende | Video-Call 30 min | 5 Sample-Scripts reviewen, Kalibrierung | CS-Lead + Eng |
| Test-Batch-Review | W5 | Video-Call 60 min | 30 Scripts reviewen, Qualitätsfreigabe | CS-Lead |
| Training-Session | W6 | Video-Call 90 min | System-Walkthrough, Übergabe Bedienung | CS-Lead |
| Go-Live-Call | W7 | Video-Call 45 min | Erster produktiver Batch-Run, offene Punkte | CS-Lead |
| Retainer-Monthly-Sync | Monatlich | Video-Call 30 min | Batch-Status, Persona-Updates, Feedback-Loop | CS-Lead |
| Quarterly Review | Q1, Q2... | Video-Call 60 min | Performance-Analyse, Roadmap, Upsell-Prüfung | CS-Lead + Founder |

---

## Risk-Register

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Produktdaten-Qualität unzureichend** (fehlende Beschreibungen, uneinheitliche Felder, veralteter Katalog) | Hoch | Hoch | In W1 explizit prüfen, Datenqualitäts-Gate vor Phase-2-Start; bei kritischen Lücken: Customer-Action-Item mit Deadline |
| R2 | **Prompt-Output entspricht nicht Brand-Voice** (LLM produziert generischen Content, Customer unzufrieden) | Mittel | Hoch | Mid-Build-Preview in W3 ist Pflicht; 20 Beispiel-Scripts als Training-Input einfordern; iterative Kalibrierung einplanen (+3–5h Buffer) |
| R3 | **Customer-Verfügbarkeit zu gering in W1–3** (kein Feedback, Blocker nicht beseitigt) | Mittel | Mittel | Erwartung in Kick-off explizit setzen: 3h/Woche Minimum; Eskalations-Pfad definieren (CS-Lead → Founder wenn 2× kein Feedback) |
| R4 | **API-Zugang (Shopify/Meta) wird nicht bereitgestellt oder entzogen** | Niedrig | Hoch | Zugänge in W1 einfordern und testen; CSV-Fallback für Produktdaten immer vorbereiten; bei API-Entzug im Retainer: CR-Mechanismus |
| R5 | **Scope-Creep durch Agentur-Kunden** (Agentur will Pipeline für 5 ihrer Clients nutzen, nicht nur einen) | Mittel | Mittel | In Scope-Checklist klar: 1 Brand/Mandant = Standard; Multi-Mandant = explizit geprüft und gepreist; früh im Sales-Prozess klären |

---

## Quality-Gates

| Gate | Zeitpunkt | Abnahme durch | Kriterium |
|---|---|---|---|
| **QG-1: Discovery Complete** | Ende W1 | CS-Lead | Personas vollständig, Datenqualität bewertet, Tech-Entscheidungen gefallen |
| **QG-2: Pipeline Stable** | Ende W2 | Eng | Produktdaten fließen korrekt, keine kritischen Datenqualitäts-Issues offen |
| **QG-3: Engine Functional** | Ende W4 | Eng + CS-Lead | 10 interne Test-Scripts reviewed, Hook-Generator produziert alle 5 Pattern-Typen |
| **QG-4: Customer-Validation** | Ende W5 (Test-Batch-Review) | Customer + CS-Lead | Customer-Qualitätsscore ≥ 7/10 auf Test-Batch-Sample (mind. 10 Scripts bewertet) |
| **QG-5: Handover Ready** | Ende W6 | Founder | Dokumentation vollständig, Training durchgeführt, Retainer-Prozess dokumentiert |
| **QG-6: Go-Live** | W7 | Founder + Customer | Erster produktiver Batch-Run erfolgreich, Quality-Gate-Doc sign-off |

---

## Handover-Package

| Asset | Format | Beschreibung |
|---|---|---|
| System-Dokumentation | Notion-Seite oder PDF | Architektur, Datenfluss, Konfigurationsübersicht |
| Loom: Batch-Run starten | Video (10–15 min) | Schritt-für-Schritt wie Customer einen Batch initiiert |
| Loom: Personas pflegen | Video (8–12 min) | Neue Persona anlegen, bestehende updaten |
| Loom: Feedback einspielen | Video (8–10 min) | Manueller Feedback-Prozess (Tier M) oder API-Monitoring (Tier L) |
| Persona-Library | Strukturiert in Output-Tool | Alle Personas vollständig ausgefüllt, kommentiert |
| Script-Archive | Strukturiert in Output-Tool | Alle Handover-Scripts getaggt, erster Batch archiviert |
| Brand-Voice-Regelwerk | Dokument (PDF + Live-Version) | Alle aktiven Filter und Regeln dokumentiert |
| Change-Request-Vorlage | Template (Doc/Notion) | Für zukünftige Scope-Erweiterungen |
| Retainer-Prozess-Doku | Dokument | Was passiert jeden Monat, wie Customer Input gibt |
| Support-Kontakt + Eskalationspfad | Dokument | Wen Customer bei welchen Issues kontaktiert |