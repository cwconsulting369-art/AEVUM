# AI Lead Engine — Delivery-Playbook (intern)

## Phasen

### Phase 1: Discovery & ICP-Definition
**Dauer:** Woche 1-2
**Ziel:** Glasklarer ICP, Tool-Stack fixiert, technische Voraussetzungen bestätigt.

| Deliverable | Verantwortlich | Customer-Input nötig? |
|---|---|---|
| ICP-Workshop-Call (90 Min) | Founder + Customer | Ja — Customer muss Entscheider dabei haben |
| ICP-Dokumentation (1 Seite: Firmogr., Technogr., Psychogr.) | Eng / Founder | Review durch Customer |
| Scoring-Kriterien-Definition (Hot / Warm / Cold Logik) | Eng | Freigabe Customer |
| Tool-Stack-Entscheidung (Scraping / Sending / CRM) | Founder | Customer gibt Account-Zugang |
| Domain-Setup + DNS-Konfiguration | Eng | Customer kauft Domain |
| Domain-Warming-Start (Mailwarm / Warmup Inbox) | Eng | — |
| Onboarding-Checklist an Customer | Customer Success | — |

**Customer-Touchpoint:** Kick-off Call (90 Min) + schriftliche ICP-Freigabe bis Ende Woche 2.

---

### Phase 2: Pipeline Build (Scraping + Enrichment + Qualifikation)
**Dauer:** Woche 2-4
**Ziel:** Funktionierender Scraping-zu-Scoring-Flow ohne Lücken.

| Deliverable | Verantwortlich | Hinweis |
|---|---|---|
| Scraping-Setup in Apollo / Clay (Filter nach ICP-Params) | Eng | Needs Account-Zugang |
| Automatischer Deduplizierungs-Layer | Eng | Verhindert Doppel-Kontakte |
| Blacklist / DNC-Import (existing customers etc.) | Eng | Customer liefert Liste |
| Enrichment-Workflow (E-Mail-Verifikation + Company-Daten) | Eng | — |
| AI-Scoring-Logik (GPT-Call oder regelbasiert) | Eng | ICP-Kriterien aus Phase 1 |
| Schwellenwert-Kalibrierung (Scoring-Test mit 100 Sample-Leads) | Eng + Founder | Internes Review |
| Weekly-Sync-Call #1 | Founder + Customer | Status-Update, erste Lead-Samples zeigen |

**Quality-Gate intern:** Scoring-Test mit 100 Sample-Leads — mind. 80% werden korrekt kategorisiert (Hot/Warm/Cold). Founder reviewed vor Customer-Präsentation.

---

### Phase 3: Copy & Outreach-Setup
**Dauer:** Woche 3-5
**Ziel:** Outreach-Sequenzen live, Personalisierungs-Logik aktiv, Sending-Tool konfiguriert.

| Deliverable | Verantwortlich | Hinweis |
|---|---|---|
| Cold-Email-Sequenz (3-4 Steps, 3 Varianten Tier L / 1 Tier M) | Founder / Copywriter | Customer-Review + max. 2 Revision-Zyklen |
| LinkedIn-Message-Sequenz (Connect-Request + 2 Follow-Ups) | Founder / Copywriter | — |
| AI-First-Line-Personalisierung (Clay GPT-Spalte oder Workflow) | Eng | Test mit 20 Leads |
| Verhaltensbasierte Follow-Up-Logik (Opener vs. Non-Opener) | Eng | Sending-Tool-Setup |
| Sending-Tool-Setup (Instantly / Smartlead / Lemlist) | Eng | Domain-Warming muss ≥2 Wo gelaufen sein |
| Bounce-Handling + Unsubscribe-Flow | Eng | — |
| Copy-Freigabe durch Customer | Customer Success | Schriftliche Freigabe nötig vor Go-Live |
| Weekly-Sync-Call #2 | Founder + Customer | Copy-Review, Feedback einarbeiten |

**Quality-Gate intern:** First-Line-Personalisierung für Test-Batch (20 Leads) — 90% müssen korrekt und nicht leer sein. Kein "Fallback-Text" sichtbar.

---

### Phase 4: CRM-Integration + Dashboard
**Dauer:** Woche 4-6
**Ziel:** Warme Leads landen automatisch im CRM, Dashboard zeigt alle Metriken in Echtzeit.

| Deliverable | Verantwortlich | Hinweis |
|---|---|---|
| CRM-Verbindung via Webhook / API / Zapier | Eng | Zugang zu CRM benötigt |
| Lead-Status-Mapping (Contacted → Replied → Booked) | Eng | Customer definiert Stage-Namen |
| Calendly-/Buchungs-Link-Tracking (Click = Warm Lead) | Eng | Customer muss Calendly-Zugang geben |
| Dashboard-Build (Airtable / Notion / Custom) | Eng | — |
| Weekly-Automated-Report (Make / Zapier E-Mail-Trigger) | Eng | An Customer-E-Mail |
| Dashboard-Walkthrough für Customer | Customer Success | Loom-Video (10-15 Min) |
| Weekly-Sync-Call #3 | Founder + Customer | Dashboard-Review, CRM-Test |

**Quality-Gate intern:** Live-Test: Test-Lead durch gesamte Pipeline schicken — Scraping → Scoring → Outreach → CRM-Eintrag. Alles muss ohne manuellen Eingriff funktionieren.

---

### Phase 5: Soft-Launch & QA
**Dauer:** Woche 5-7
**Ziel:** Kontrollierter Launch mit 50-100 realen Leads, Bugs gefixed, Customer bereit für Vollbetrieb.

| Deliverable | Verantwortlich | Hinweis |
|---|---|---|
| Soft-Launch: 50-100 Leads werden kontaktiert | Eng + Founder | Täglich Monitoring erste 3 Tage |
| Bug-Fixing (Reply-Handling, Bounce-Rates, Scoring-Anomalien) | Eng | Innerhalb 48h nach Identifikation |
| Spam-Rate-Check (Google Postmaster / Microsoft SNDS) | Eng | Muss unter 0.1% bleiben |
| Reply-Handling-Test (manuelle Antwort simulieren) | Eng | CRM-Trigger muss feuern |
| Milestone-Review-Call | Founder + Customer | Soft-Launch-Ergebnisse präsentieren |
| Customer-Freigabe für Vollbetrieb | Customer Success | Schriftlich |

**Quality-Gate intern:** Kein Spam-Flag in ersten 100 Sends. Bounce-Rate <5%. Mind. 1 organischer Reply im Soft-Launch (zeigt dass Zustellung funktioniert).

---

### Phase 6: Go-Live, Handover & Retainer-Start
**Dauer:** Woche 7-8
**Ziel:** System läuft autonom, Customer kann es bedienen, Retainer-Modus aktiv.

| Deliverable | Verantwortlich | Hinweis |
|---|---|---|
| Vollbetrieb-Start (tägliche Pipeline läuft) | Eng | — |
| Playbook-Dokumentation (Notion: wie neue Kampagnen starten) | Eng + Customer Success | — |
| Handover-Call (60 Min: Live-Walkthrough aller Systemteile) | Founder + Customer Success | Aufgezeichnet |
| Loom-Video-Serie (3-5 Videos: Dashboard / Kampagnen / CRM) | Customer Success | — |
| Retainer-Modus aktivieren (Monitoring-Schedule) | Eng | Wöchentliches Health-Check |
| Monatlicher Retainer-Call einrichten (45 Min Slot) | Customer Success | Recurring Booking |

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|---|---|---|---|---|---|---|
| **Founder** | Lead (ICP-Workshop, Tool-Entscheidung) | Review | Copy-Ownership | Review | Milestone-Call | Handover |
| **Engineer** | Domain-Setup | Haupt-Owner | Personalisierungs-Tech | Haupt-Owner | Monitoring + Fixes | Retainer-Setup |
| **Copywriter** | — | — | Sequenz-Copy | — | — | — |
| **Customer Success** | Onboarding-Checklist | Weekly-Sync | Copy-Koordination | Dashboard-Loom | Freigabe-Management | Retainer-Call-Setup |

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Timing | Format | Dauer | Ziel |
|---|---|---|---|---|
| **Kick-off Call** | Woche 1 | Video Call | 90 Min | ICP, Erwartungen, Tool-Entscheidungen |
| **ICP-Freigabe** | Ende Woche 2 | Async (Dokument) | — | Scope-Bestätigung schriftlich |
| **Weekly Sync #1** | Woche 3 | Video Call | 30 Min | Scraping-Ergebnisse zeigen, erste Lead-Samples |
| **Copy-Review** | Woche 4 | Async (Notion/Doc) | — | Customer gibt Feedback auf Sequenzen |
| **Weekly Sync #2** | Woche 4-5 | Video Call | 30 Min | Copy-Freigabe, Dashboard-Preview |
| **Weekly Sync #3** | Woche 5-6 | Video Call | 30 Min | CRM-Test, Dashboard live |
| **Milestone-Review** | Woche 6-7 | Video Call | 45 Min | Soft-Launch-Ergebnisse, Go-Live-Entscheidung |
| **Handover-Call** | Woche 7-8 | Video Call | 60 Min | Vollständige System-Übergabe, Playbook-Walkthrough |
| **Retainer-Call (Mo 2+)** | Monatlich | Video Call | 45 Min | Performance-Review, Optimierungen |

---

## Risk-Register

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Domain-Warming dauert länger als geplant (Spam-Reputation) | Mittel | Hoch | Warming ≥3 Wochen einplanen, nie vor 2 Wochen senden. Wenn Spam-Flag: sofort pausieren, Domain-Analyse. |
| **R2** | Customer-ICP zu vage / ändert sich nach Kick-off | Hoch | Hoch | ICP-Dokument wird schriftlich freigegeben. Änderungen nach Freigabe = Change Request. |
| **R3** | Offer des Customers ist unklar oder zu schwach — Reply-Rate bleibt niedrig | Mittel | Mittel | Früh kommunizieren: Wir bauen Kanal, nicht Angebot. Bei <3% Reply nach 200 Sends: Offer-Review-Call anbieten (kostenpflichtig). |
| **R4** | Tool-API-Limits oder Rate-Limits (Apollo, LinkedIn) blockieren Pipeline | Mittel | Mittel | Throttling-Logik von Beginn an einbauen. Tagesvolumen-Caps setzen (≤200 LinkedIn / ≤500 Email). |
| **R5** | Customer gibt kein rechtzeitiges Feedback — Delivery verzögert sich | Hoch | Mittel | 48h-Feedback-SLA kommunizieren. Nach 48h ohne Rückmeldung: Eskalation via Customer Success. Delay ist dann Customer-seitig, nicht AEVUM-seitig. |

---

## Quality-Gates (intern, abzunehmen vor nächster Phase)

| Gate | Zeitpunkt | Abnahme durch | Kriterium |
|---|---|---|---|
| **QG-1: ICP-Qualität** | Ende Phase 1 | Founder | ICP-Dokument hat alle Pflichtfelder, schriftliche Freigabe Customer liegt vor |
| **QG-2: Scoring-Kalibrierung** | Ende Phase 2 | Founder + Eng | 80% der 100 Test-Leads werden korrekt kategorisiert |
| **QG-3: Copy-Freigabe** | Ende Phase 3 | Customer + Founder | Schriftliche Copy-Freigabe, First-Line-Test mit 20 Leads bestanden |
| **QG-4: End-to-End-Pipeline-Test** | Ende Phase 4 | Eng | Test-Lead läuft vollständig durch: Scraping → Scoring → Outreach → CRM. Kein manueller Schritt nötig. |
| **QG-5: Soft-Launch-Clearance** | Ende Phase 5 | Founder | Spam-Rate <0.1%, Bounce <5%, mind. 1 organischer Reply, Customer-Freigabe schriftlich |
| **QG-6: Handover-Vollständigkeit** | Ende Phase 6 | Customer Success | Alle Handover-Items übergeben (Playbook, Loom-Videos, Zugänge, Retainer-Call gebucht) |

---

## Handover-Package

| Item | Format | Übergabe via |
|---|---|---|
| ICP-Dokumentation | Notion-Seite | Shared Workspace |
| Scoring-Kriterien-Übersicht | Notion-Tabelle | Shared Workspace |
| Outreach-Sequenzen (alle Varianten) | Notion-Dokument | Shared Workspace |
| Campaign-Setup-Playbook | Notion-Seite (step-by-step) | Shared Workspace |
| Dashboard-Walkthrough | Loom-Video (15 Min) | Link im Notion |
| CRM-Integration-Doku | Notion-Seite | Shared Workspace |
| Tool-Zugänge-Übersicht | 1Password Vault oder Notion (verschlüsselt) | Direkt übergeben |
| Weekly-Report-Setup-Doku | Notion | Shared Workspace |
| Loom-Video: "Neue Kampagne starten" | Loom (10 Min) | Link im Notion |
| Loom-Video: "Blacklist pflegen" | Loom (5 Min) | Link im Notion |
| Loom-Video: "Dashboard lesen" | Loom (10 Min) | Link im Notion |
| Retainer-Call-Booking-Link | Calendly | E-Mail |