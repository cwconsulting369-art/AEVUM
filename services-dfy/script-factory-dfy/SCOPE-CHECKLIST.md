# Script Factory DFY — Scope-Checklist (Intern / Sales-Calls)

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