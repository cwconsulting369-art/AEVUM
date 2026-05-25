---
title: AEVUM DFY — script-factory-dfy
date: 2026-05-25
---

# AEVUM Done-for-You — script-factory-dfy

> Generated 2026-05-25. Combined Master-Doc.

---

# 1. Sales-Brief


## In einem Satz

AEVUM baut dir eine vollautomatisierte, KI-gestützte Ad-Script-Pipeline, die aus Produktdaten, Zielgruppen-Input und Performance-Feedback kontinuierlich conversion-optimierte Video-Ad-Scripts produziert — ohne dass dein Team jeden Brief manuell schreibt.

---

## Wer das braucht

| Segment | Konkreter Use-Case | Fit |
|---|---|---|
| **AG** (Agenturen 3–50 MA) | Performance-Agentur betreut 5–15 E-Com-Clients, schreibt Briefs und Scripts manuell, Bottleneck beim Creative-Strategist | ★★★★★ |
| **AG** | Social-Media-Agentur will Creative-Output skalieren ohne Headcount-Aufbau | ★★★★☆ |
| **PB** | D2C-Founder mit eigenem Brand, schaltet selbst Ads, braucht konstanten Script-Output für UGC-Creators | ★★★★☆ |
| **FI** | B2B-Mittelstand mit E-Com-Kanal (z. B. Ersatzteile, Produkt-Konfiguratoren), baut Performance-Marketing intern auf | ★★★☆☆ |
| **FI** | Retailer mit 50+ SKUs, will systematisch Product-Launch-Ads produzieren | ★★★★☆ |

---

## Was Customer bekommt

1. **Produktdaten-Ingestion-Layer** — Anbindung an Produktkatalog (Shopify/WooCommerce/CSV/Feed), automatische Extraktion von USPs, Features, Preisinformationen
2. **Zielgruppen-Persona-Datenbank** — Strukturierte Persona-Library (angelegt durch AEVUM, pflegbar durch Customer), inkl. Pain-Points, Buying-Motivations, Tonality-Flags
3. **Hook-Generator-Engine** — Regelbasierte + LLM-gestützte Produktion von Hook-Varianten (Pattern-Typen: Problem, Curiosity, Social Proof, Contrarian, Direct Offer)
4. **Script-Assembly-Pipeline** — Automatische Komposition vollständiger Ad-Scripts (Hook → Bridge → Body → CTA) pro Persona × Produkt × Format (15s / 30s / 60s)
5. **Brief-Output-Format** — Strukturierte Briefs für UGC-Creators/Editors inkl. Szenen-Beschreibung, B-Roll-Hints, On-Screen-Text-Vorschläge
6. **Feedback-Loop-Integration** — Mechanismus zum Einspielen von Ad-Performance-Daten (CTR, Hook-Rate, Spend) zurück in die Pipeline für Script-Priorisierung
7. **Review-Workflow** — Interner Freigabe-Workflow (Draft → Review → Approved → Briefed) mit Status-Tracking
8. **Batch-Produktion** — Konfigurierbare Batch-Runs (z. B. wöchentlich 20 neue Scripts) mit Output in strukturiertem Format (Notion/Airtable/Google Docs)
9. **Script-Archiv & Tagging** — Searchable Library aller produzierten Scripts mit Tags (Produkt, Persona, Format, Status, Performance-Score)
10. **Custom-Style-Guide-Integration** — Brand-Voice-Regeln und verbotene Formulierungen als harte Filter in der Pipeline

---

## Mehrwert (konkret)

### Vorher / Nachher

| Dimension | Vorher | Nachher | Schätzwert |
|---|---|---|---|
| Zeit pro Script | 45–90 min (manuell) | 3–8 min (Review only) | **−85% Zeitaufwand** |
| Scripts/Woche (1 Stratege) | 5–10 | 40–80 | **8× Output** |
| Onboarding neuer Produkte | 2–3 Tage bis erster Brief | 2–4 Stunden | **−70% Time-to-Brief** |
| Creative-Testing-Velocity | 2–3 neue Konzepte/Monat | 15–30 Konzepte/Monat | **10× Testing-Speed** |
| Wissenssilos | Im Kopf des Creative-Strategists | Dokumentiert, skalierbar | Struktureller Wert |
| Revenue-Impact (Agentur) | Bottleneck limitiert Client-Kapazität | +3–5 Clients ohne Headcount | **+€30–80k ARR möglich** |

> Schätzwerte basieren auf Benchmarks aus vergleichbaren Setups. Tatsächliche Ergebnisse hängen von Produktkomplexität, Datenlage und Nutzungsintensität ab.

---

## Pricing-Logic

| | **Tier M** | **Tier L** |
|---|---|---|
| **Setup** | €9.000 – €14.000 | €20.000 – €35.000 |
| **Monthly Retainer** | €2.200 – €3.000 | €3.200 – €5.000 |
| **Deliverables-Scope** | 1 Brand / bis 50 SKUs / 3 Personas / 3 Formate / Standard-Feedback-Loop | Multi-Brand oder 150+ SKUs / unbegrenzte Personas / 6+ Formate / Performance-Daten-Integration (Meta/TikTok API) / Custom Scoring-Modell |
| **Implementation** | 5–7 Wochen | 8–12 Wochen |
| **Scripts/Monat (Batch)** | bis 80 | bis 300+ |
| **Retainer-Inhalt** | Wartung, monatliche Batch-Runs, 1 Persona-Update, Support | Wartung, Batch-Runs, Reporting, Persona-Optimierung, Performance-Feedback-Automatisierung, Quarterly Review |

---

## Timeline

| Phase | Woche(n) | Inhalt |
|---|---|---|
| Discovery & Setup | W1 | Kick-off, Datenzugang, Persona-Workshop, Style-Guide-Erfassung |
| Daten-Pipeline & Ingestion | W2 | Produktkatalog-Anbindung, Daten-Normalisierung, Persona-Library |
| Script-Engine Build | W3–4 | Hook-Generator, Assembly-Pipeline, Format-Templates |
| Review-Workflow & Output-Format | W5 | Freigabe-Workflow, Archiv, Batch-Run-Konfiguration |
| Feedback-Loop (Tier L: W6–8) | W5–6 | Performance-Daten-Anbindung, Scoring-Logik |
| QA & Handover | W6–7 (M) / W10–12 (L) | Testing, Dokumentation, Training, Go-Live |

---

## Voraussetzungen Customer

- Zugang zum Produktkatalog (Shopify-Admin / WooCommerce-API / strukturierter Produktfeed)
- Vorhandene oder erstellbare Brand-Voice-Richtlinien (mind. grundlegende Tonality-Aussagen)
- Ansprechpartner auf Customer-Seite mit Entscheidungsbefugnis für Persona-Definition (2–3 Calls à 60 min)
- Bereitschaft, 20–30 Beispiel-Scripts (Bestand oder Wunsch-Stil) als Training-Input bereitzustellen
- Ad-Account-Zugang für Feedback-Loop-Integration (Tier L, lesend)
- Output-Tool vorhanden oder gewählt (Notion, Airtable, Google Drive — AEVUM empfiehlt, Customer entscheidet)

---

## Nicht-Ziele (explizit Out-of-Scope)

1. **Video-Produktion** — kein Schnitt, kein Filming, kein Editing
2. **UGC-Creator-Sourcing** — AEVUM brieft, findet aber keine Creator
3. **Media-Buying / Ad-Management** — keine Kampagnen-Steuerung, kein Budget-Management
4. **Performance-Analyse / Reporting-Dashboard** — Feedback-Loop speist die Pipeline, ist aber kein vollständiges Analytics-System (→ Command Center DFY)
5. **Mehrsprachigkeit** (außer explizit gebucht als Add-On) — Standard-Setup ist DE oder EN, nicht beides
6. **SEO-Content oder Blogartikel** — Pipeline ist ausschließlich für Ad-Scripts optimiert
7. **Brand-Strategy oder Positioning** — AEVUM nutzt vorhandene Inputs, entwickelt keine neue Brand-Strategie
8. **Automatisches Posting / Ad-Upload** — Scripts werden produziert, nicht automatisch deployed

---

## Upsell-Pfade

| Trigger | Next Service |
|---|---|
| Customer will Ad-Performance visualisieren und Entscheidungen datenbasiert treffen | `command-center-dashboard` oder `hud-command-center` |
| Creative-Output soll in Content-Kalender und organic Posts integriert werden | `content-engine` |
| Agentur will den gesamten Client-Pipeline-Prozess (Leads, Onboarding, Reporting) abbilden | `business-os` oder `sales-os` |
| Feedback-Loop soll auf Basis echter Verkaufsdaten (nicht nur Ad-Metriken) optimieren | `database-system` |
| Customer will auch Landing-Pages und E-Mail-Flows aus Produktdaten generieren | Custom Scope (neues DFY) |

---

## Conversion-Story

Stell dir vor, dein bester Creative-Strategist verlässt die Agentur. Von einem Tag auf den anderen ist das institutionelle Wissen weg — welche Hooks für welche Zielgruppe funktionieren, welche Formulierungen konvertieren, welche Produkte welche Story brauchen. Du fängst von vorne an. Dieser Moment passiert früher oder später in jeder Agentur, die Script-Writing im Kopf einer Person trägt statt in einem System.

Die Script Factory DFY macht aus diesem Kopf-Wissen eine Maschine. Nicht indem sie kreative Entscheidungen wegautomatisiert, sondern indem sie den 80%-Anteil, der reproduzierbar ist — Struktur, Personas, Hooks, Format — in einen systematischen Output-Prozess überführt. Dein Team reviewed und verfeinert statt zu produzieren. Die Qualität steigt, weil Feedback aus echten Kampagnen direkt zurück in die Produktion fließt. Und du kannst skalieren, ohne den nächsten Creative-Strategist einzustellen.

Für D2C-Brands bedeutet das konkret: du bestellst eine Batch von 20 Scripts für den nächsten Product-Launch, bekommst sie nach einem Batch-Run strukturiert in Notion — inkl. Creator-Briefs — und kannst am gleichen Tag UGC-Creator briefen. Keine Engpässe. Kein Leerstand zwischen Produkt-Go-Live und ersten Ad-Tests. Die Velocity, die du für profitables Performance-Marketing brauchst, ist keine Frage von Headcount mehr. Sie ist eine Frage von System-Design.
\newpage

# 2. Scope-Checklist


## In-Scope

| Kategorie | Item | Aufwand-Estimate |
|---|---|---|
| **Discovery** | Persona-Workshop (1–2 Sessions, strukturierte Abfrage) | 4–6h |
| **Discovery** | Style-Guide-Extraktion aus Bestandsmaterial | 2–4h |
| **Discovery** | Produktkatalog-Analyse und Datenfeld-Mapping | 3–5h |
| **Daten-Pipeline** | Shopify/WooCommerce/CSV-Anbindung und Normalisierung | 6–12h |
| **Daten-Pipeline** | Persona-Library-Aufbau (bis 3 Personas Tier M / bis 8 Tier L) | 4–8h |
| **Daten-Pipeline** | Brand-Voice-Regelwerk als Filterschicht | 3–5h |
| **Script-Engine** | Hook-Generator (5 Pattern-Typen, LLM-Prompting + Regellogik) | 12–20h |
| **Script-Engine** | Script-Assembly (Hook→Bridge→Body→CTA, 3 Formate Tier M) | 10–18h |
| **Script-Engine** | Brief-Output-Template (UGC-Creator-Ready) | 4–6h |
| **Script-Engine** | Batch-Run-Konfiguration (Scheduling, Volume-Settings) | 3–5h |
| **Workflow** | Review-Status-Tracking (Draft/Review/Approved/Briefed) | 4–8h |
| **Workflow** | Output-Integration in gewähltes Tool (Notion/Airtable/GDocs) | 4–8h |
| **Archiv** | Script-Library mit Tagging-System | 3–6h |
| **Feedback-Loop** | Manueller Feedback-Einspiel-Mechanismus (Tier M) | 3–5h |
| **Feedback-Loop** | API-Anbindung Meta/TikTok Ads + Scoring-Logik (Tier L only) | 15–25h |
| **QA** | Test-Batch (20–30 Scripts), Review, Kalibrierung | 6–10h |
| **Handover** | Dokumentation + Loom-Walkthrough-Videos | 4–6h |
| **Handover** | Training-Session Customer-Team (1 × 90 min) | 1.5h |
| **Retainer** | Monatliche Batch-Runs, Wartung, 1 Persona-Update/Monat | laufend |

---

## Out-of-Scope

| Was Customer NICHT bekommt | Begründung / Verweis |
|---|---|
| Video- oder Audio-Produktion | Anderes Gewerk — weder Equipment noch Post-Production |
| Creator-Sourcing oder -Management | Marktplatz-Logik außerhalb AEVUM-Scope |
| Media-Buying, Kampagnen-Setup, Budget-Allokation | Ad-Management ist eigener Service |
| Vollständiges Performance-Reporting-Dashboard | → `command-center-dashboard` DFY |
| Mehrsprachige Pipelines (ohne Add-On) | Separater Aufwand, eigenes Pricing |
| Organische Content-Formate (Blogartikel, Newsletter, Reels-Skripte) | Script Factory ist Ad-spezifisch |
| Brand-Positioning oder Messaging-Strategie | Nur Nutzung vorhandener Inputs |
| Automatisches Ad-Deployment in Plattformen | Kein Schreib-Zugang auf Ad-Accounts nötig/gewollt |
| A/B-Test-Automatisierung innerhalb der Plattformen | Plattform-seitig, nicht Pipeline-seitig |
| Unbegrenzte Personas ohne Change Request | Tier M: 3, Tier L: 8 — darüber: CR-pflichtig |

---

## Voraussetzungen Customer-Side

| Kategorie | Requirement | Kritikalität |
|---|---|---|
| **Datenzugang** | Shopify-Admin-API-Key ODER WooCommerce-API ODER strukturierter Produktfeed (CSV/XML) | ⚠ Blocker |
| **Datenzugang** | Leser-Zugang Ad-Account (Meta/TikTok) für Tier-L-Feedback-Loop | ⚠ Tier L Blocker |
| **Content** | Min. 20 Beispiel-Scripts oder Referenz-Ads (eigene oder Inspiration) | Hoch |
| **Content** | Brand-Voice-Dokument ODER Bereitschaft 2h in Style-Guide-Workshop | Hoch |
| **Personas** | Grundlegende Zielgruppen-Beschreibung (Customer kann roh sein — AEVUM strukturiert) | Hoch |
| **Tools** | Entscheidung für Output-Tool vor Kick-off (Notion/Airtable/GDocs) | Mittel |
| **Team** | 1 Ansprechpartner mit ~3h/Woche Verfügbarkeit in Weeks 1–3 | Mittel |
| **Team** | Freigabe-Person definiert (wer approved Scripts?) | Mittel |
| **Rechtlich** | Klärung ob LLM-generierte Scripts IP-rechtlich für Customer ok (Eigenverantwortung) | Hinweis |

---

## Quality-Standards

AEVUM erklärt den Service als "Done" wenn folgende Kriterien erfüllt sind:

| # | Kriterium |
|---|---|
| 1 | Produktkatalog-Anbindung läuft stabil, Updates werden erkannt |
| 2 | Persona-Library enthält alle vereinbarten Personas vollständig ausgefüllt |
| 3 | Hook-Generator produziert mind. 5 Hook-Varianten pro Produkt × Persona |
| 4 | Vollständige Scripts werden in allen vereinbarten Formaten (15s/30s/60s) ausgegeben |
| 5 | Brand-Voice-Filter blockiert definierte verbotene Formulierungen nachweislich |
| 6 | Test-Batch von 30 Scripts wurde reviewt, Qualitätsscore ≥ 7/10 durch Customer-Feedback |
| 7 | Review-Workflow funktioniert in gewähltem Output-Tool |
| 8 | Batch-Run läuft einmalig vollständig durch ohne manuellen Eingriff |
| 9 | Dokumentation vollständig, Training-Session durchgeführt |
| 10 | Feedback-Loop-Mechanismus ist eingerichtet und einmalig erfolgreich getestet |

---

## Change-Request-Policy

| Szenario | Handling |
|---|---|
| Zusätzliche Persona (über vereinbarte Anzahl) | CR: €400–800 Setup + ggf. Retainer-Anpassung |
| Neues Output-Format (z. B. Podcast-Ad, E-Mail-Script) | CR: €600–1.500 je nach Komplexität |
| Zweite Sprache / Lokalisierung | CR: ab €2.500 Setup |
| Plattform-Wechsel (z. B. Shopify → neues System) | CR: €800–2.000 Migration |
| Zusätzliche Brand / Sub-Brand in gleiche Pipeline | CR: ab €3.000 Setup |
| Scope-Creep < 2h Aufwand | Kulanz, intern dokumentiert |
| Scope-Creep > 2h Aufwand | Formaler CR, schriftlich, vor Umsetzung |

**Grundsatz:** Jeder CR wird schriftlich bestätigt (E-Mail reicht), bevor AEVUM umsetzt. Keine mündlichen Erweiterungen.

---

## Pricing-Variations

| Add-On / Variation | Setup-Delta | Monatlich-Delta |
|---|---|---|
| Zweite Sprache (z. B. EN + DE) | +€2.500–4.000 | +€500–800 |
| Zweite Brand / zweiter Mandant (Agentur-Setup) | +€3.000–5.000 | +€700–1.200 |
| Performance-Feedback via API (Meta oder TikTok, Tier M → L Upgrade) | +€5.000–8.000 | +€800–1.500 |
| Zusätzliche Personas (je 3er-Block) | +€1.200–2.000 | +€200–400 |
| Erweiterte Formate (+3 Formate über Standard) | +€1.500–2.500 | +€300–600 |
| Slack/Teams-Benachrichtigungen bei Batch-Completion | +€500–800 | inklusive |
| White-Label-Output für Agentur (Custom-Branding der Docs) | +€800–1.500 | +€150–300 |
| Quarterly Performance-Review-Call (1h, AEVUM-Analyst) | — | +€400/Quartal |
\newpage

# 3. Delivery-Plan


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
\newpage

# 4. Quality-Gate


**Item-Slug:** `script-factory-dfy`
**Customer:** [CUSTOMER_NAME]
**Delivery-Lead:** [CS_LEAD_NAME]
**Go-Live-Datum:** [DATUM]
**Tier:** [ ] M / [ ] L

---

## Asset-Inventory

| # | Asset | Format/Ort | Status | Abgenommen von |
|---|---|---|---|---|
| 1 | Produktkatalog-Anbindung | Live-Integration / Log | [ ] | Eng |
| 2 | Persona-Library | [Tool-Link] | [ ] | CS-Lead |
| 3 | Brand-Voice-Regelwerk | [Doc-Link] | [ ] | CS-Lead + Customer |
| 4 | Hook-Generator-Konfiguration | [System-Doku] | [ ] | Eng |
| 5 | Script-Assembly-Pipeline | [System-Doku] | [ ] | Eng |
| 6 | Brief-Output-Template (UGC) | [Tool-Link] | [ ] | CS-Lead |
| 7 | Review-Workflow im Output-Tool | [Tool-Link] | [ ] | CS-Lead |
| 8 | Script-Archive mit Tagging | [Tool-Link] | [ ] | CS-Lead |
| 9 | Feedback-Loop-Mechanismus | [System-Doku / API-Log] | [ ] | Eng |
| 10 | Test-Batch (30 Scripts) | [Tool-Link] | [ ] | Customer |
| 11 | System-Dokumentation | [Doc-Link] | [ ] | CS-Lead |
| 12 | Loom: Batch-Run starten | [Video-Link] | [ ] | CS-Lead |
| 13 | Loom: Personas pflegen | [Video-Link] | [ ] | CS-Lead |
| 14 | Loom: Feedback einspielen | [Video-Link] | [ ] | CS-Lead |
| 15 | Training-Session durchgeführt | Kalender-Bestätigung | [ ] | CS-Lead + Customer |
| 16 | Retainer-Prozess-Doku | [Doc-Link] | [ ] | CS-Lead |
| 17 | Change-Request-Vorlage | [Template-Link] | [ ] | CS-Lead |
| 18 | Erster produktiver Batch-Run | Log / Output-Tool | [ ] | Customer + Eng |

---

## Sign-Off-Kriterien

| # | Kriterium | Status |
|---|---|---|
| 1 | Produktkatalog-Anbindung läuft stabil und Updates werden korrekt erkannt | [ ] ✅ |
| 2 | Persona-Library enthält alle vertraglich vereinbarten Personas vollständig | [ ] ✅ |
| 3 | Hook-Generator produziert mind. 5 Hook-Varianten pro Produkt × Persona (alle 5 Pattern-Typen) | [ ] ✅ |
| 4 | Script-Assembly produziert vollständige Scripts in allen vereinbarten Formaten (15s/30s/60s) | [ ] ✅ |
| 5 | Brand-Voice-Filter blockiert alle definierten verbotenen Formulierungen (Negativtest bestanden) | [ ] ✅ |
| 6 | Customer-Qualitätsscore auf Test-Batch ≥ 7/10 (mind. 10 Scripts bewertet, dokumentiert) | [ ] ✅ |
| 7 | Review-Workflow im Output-Tool funktioniert, alle Status-Stufen durchgespielt | [ ] ✅ |
| 8 | Ein vollständiger Batch-Run ohne manuellen Eingriff erfolgreich abgeschlossen | [ ] ✅ |
| 9 | Alle Handover-Dokumente und Loom-Videos vollständig und vom CS-Lead reviewed | [ ] ✅ |
| 10 | Feedback-Loop-Mechanismus eingerichtet und einmalig erfolgreich getestet (Tier M: manuell / Tier L: API-Log) | [ ] ✅ |

**→ Alle 10 Kriterien müssen ✅ sein. Kein partieller Sign-Off.**

Freigabe Founder/Lead: _________________________ Datum: _____________
Freigabe Customer: _________________________ Datum: _____________

---

## Known Limitations (Phase-2-Items)

Diese Punkte sind bewusst nicht im aktuellen Scope und werden im Retainer oder als separates Offering adressiert:

| # | Limitation | Empfohlener nächster Schritt |
|---|---|---|
| L1 | Kein automatisches Ad-Deployment — Scripts müssen manuell in Ad-Accounts eingespielt werden | Scope-Erweiterung bei Bedarf (CR) |
| L2 | Feedback-Loop (Tier M) ist manuell — keine automatische Korrelation zwischen Script-ID und Ad-Performance | Upgrade auf Tier L oder → `hud-command-center` |
| L3 | Pipeline ist auf 1 Brand kalibriert — Multi-Mandant-Nutzung (Agentur) erfordert Re-Architektur | Explizit als Add-On gepreist |
| L4 | LLM-Qualität ist abhängig von Datenlage — bei dünnen Produktbeschreibungen sinkt Output-Qualität messbar | Datenqualitäts-Wartung ist Customer-Verantwortung |
| L5 | Kein integriertes Creator-Briefing-Tool — Briefs werden produziert, aber Übergabe an Creator ist manuell | → Zukünftiges Feature oder Prozess-Integration per CR |
| L6 | Style-Guide-Filter ist regelbasiert, kein lernender Filter — muss bei Brand-Evolution manuell aktualisiert werden | Retainer-Service: monatliche Pflege inklusive |

---

## DB-Update-Befehl

```sql
-- Script Factory DFY: Delivery Sign-Off
UPDATE aevum_dfy_items
SET
  status                = 'delivered',
  go_live_date          = CURRENT_DATE,
  tier                  = 'M', -- oder 'L', anpassen
  setup_revenue         = 11000, -- tatsächlichen Wert einsetzen
  monthly_retainer      = 2500,  -- tatsächlichen Wert einsetzen
  customer_score        = 7.8,   -- aus Test-Batch-Review
  quality_gate_passed   = TRUE,
  known_limitations     = '["no-auto-deploy","manual-feedback-loop-tierM","single-brand","data-quality-dependency","no-creator-tool","static-style-filter"]',
  handover_package_url  = 'https://notion.so/[LINK]', -- ersetzen
  updated_at            = NOW()
WHERE
  item_slug             = 'script-factory-dfy'
  AND customer_id       = '[CUSTOMER_ID]'; -- ersetzen

-- Retainer aktivieren
INSERT INTO aevum_retainer_schedule (
  item_slug,
  customer_id,
  monthly_amount,
  next_billing_date,
  retainer_scope,
  created_at
) VALUES (
  'script-factory-dfy',
  '[CUSTOMER_ID]',
  2500, -- anpassen
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month',
  'batch-runs,maintenance,1-persona-update-per-month,monthly-sync',
  NOW()
);
```

---

## Pattern-Notes für DFY-Builder-Pattern

**Pattern-Typ:** Content-Production-Pipeline mit strukturiertem Output-Layer

**Differenzierung zu ähnlichen Items:**
- `content-engine` → organischer Content (Planung + Publishing); Script Factory → bezahlte Werbung, kein Publishing
- `hud-command-center` → Visualisierung; Script Factory → Produktion
- `database-system` → Data-Engineering; Script Factory nutzt Data-Engineering nur als Input-Layer

**Kritische Design-Entscheidungen dieses Patterns:**
1. Prompt-Engineering-Kalibrierung ist der eigentliche Wert-Hebel — mehr Zeit hier = bessere Output-Qualität
2. Mid-Build-Preview (W3) ist nicht optional — früher Feedback-Einbau spart 20–30% Korrekturaufwand
3. Datenqualität ist Customer-Verantwortung — explizit in Scope-Checklist und Kick-off kommunizieren
4. Test-Batch-Score als objektives Abnahme-Kriterium ist Schutz für beide Seiten

**Skalierbarkeit:**
- Von Tier M → L: primär Feedback-Loop-Automatisierung und Volume-Erhöhung, keine Architektur-Änderung
- Multi-Brand: Architektur-Änderung erforderlich (separate Persona-Libraries, Brand-Voice-Filter-Isolation)

**Upsell-Signal im Retainer:** Wenn Customer ≥ 3× nach Performance-Reporting fragt → `command-center-dashboard` pitchen