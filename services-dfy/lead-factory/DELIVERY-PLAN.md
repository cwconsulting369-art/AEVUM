# Lead Factory — Delivery-Plan (Intern / AEVUM-Team)

## Phasen

### Phase 1: Discovery & Infrastruktur-Setup
**Dauer:** Woche 1-2
**Ziel:** Gemeinsames Verständnis von ICP, Offer und technischer Ausgangslage. Alle Zugänge gesichert. Infrastruktur steht.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| ICP-Workshop-Protokoll (schriftlich) | Founder / CS | Ja — 90-Min. Call |
| Targeting-Matrix (Firmografika, Technografika, Trigger-Events) | Founder | Review + Freigabe |
| Tech-Stack-Audit-Doku | Eng | Zugänge bereitstellen |
| Domain-Setup (Outreach-Domain registriert, DNS konfiguriert) | Eng | DNS-Zugang |
| SPF/DKIM/DMARC live | Eng | — |
| Domain-Warming gestartet | Eng | — |
| Tool-Zugänge gesichert (LinkedIn SN, Apollo, CRM, etc.) | CS | Ja |

**Customer-Touchpoint:** Kick-off Call (90 Min.) + Asynchrone Freigabe Targeting-Matrix bis EOW2

---

### Phase 2: Scraping- & Enrichment-Pipeline
**Dauer:** Woche 2-4
**Ziel:** Automatischer Lead-Flow von Source zu qualifizierter Lead-Liste funktioniert ohne manuelle Eingriffe.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| Scraping-Pipeline (2+ Quellen) live | Eng | — |
| Deduplication-Layer aktiv | Eng | — |
| Enrichment-Layer (Kontaktdaten, LinkedIn, Company-News) | Eng | — |
| Trigger-Event-Detection konfiguriert | Eng | — |
| Scoring-Modell v1 definiert + implementiert | Founder + Eng | Ja — Kalibrierungs-Session (60 Min.) |
| Blacklist / Ausschluss-Logik implementiert | Eng | Ggf. bestehende Ausschlusslisten |
| Testlauf: 100-200 Leads durch Pipeline, manuell spot-gecheckt | Eng + CS | Ja — Feedback auf Qualität |

**Customer-Touchpoint:** Wöchentlicher Sync (30 Min.) Woche 3 + Kalibrierungs-Session Scoring (60 Min.)

---

### Phase 3: Outreach-System & Copy
**Dauer:** Woche 4-6
**Ziel:** Sequenzen sind getextet, technisch eingerichtet und freigegeben. Personalisierungs-Layer läuft.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| Outreach-Copy v1 (alle Sequenzen, alle Steps) | Founder (Copy) | Review + Freigabe innerhalb 48h |
| Personalisierungs-Variablen technisch eingebunden | Eng | — |
| Sequenzen in Outreach-Tool eingerichtet und getestet | Eng | — |
| Reply-Handling-Templates (4 Kategorien) fertig | Founder | Freigabe |
| LinkedIn-Sequenz (wenn in Scope) eingerichtet | Eng | — |
| Deliverability-Test (Seed-Test, Spam-Score-Check) | Eng | — |

**Customer-Touchpoint:** Copy-Review-Call (45 Min.) + Asynchrone Freigabe aller Sequenzen

**Internes Quality-Gate:** Copy-Review durch zweiten AEVUM-Mitarbeiter vor Übergabe an Customer

---

### Phase 4: CRM-Integration & Dashboard
**Dauer:** Woche 6-8
**Ziel:** CRM läuft bidirektional. Dashboard zeigt Live-Daten. Reply-Handling operativ.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| CRM-Anbindung live (bidirektional) | Eng | CRM-Admin-Zugang, Field-Mapping bestätigen |
| Automatische Stage-Updates via Webhook | Eng | — |
| Lead-Tracking-Dashboard fertig | Eng | — |
| Conversion-Tracking (Reply-Rate, Open-Rate, Bounce-Rate) | Eng | — |
| Source-Attribution pro Kanal | Eng | — |
| End-to-End-Test: Lead fließt von Scraping bis CRM durch | Eng + CS | Ja — Bestätigung aus Customer-CRM |

**Customer-Touchpoint:** Milestone-Review-Call (60 Min.) — System-Demo, Feedback-Runde

---

### Phase 5: Soft-Launch & Hyper-Care
**Dauer:** Woche 8-10
**Ziel:** System läuft unter echten Bedingungen. Erste Daten kommen rein. Tuning auf Basis von Realität.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| Soft-Launch (20-30% Volumen) | Eng | — |
| Monitoring: Deliverability, Bounce-Rate, Reply-Rate täglich | Eng | — |
| Iteration 1 auf Basis erster Daten (Scoring, Copy, Timing) | Founder + Eng | Feedback zu Replies-Qualität |
| Iteration 2 falls notwendig | Founder + Eng | — |
| Volumen-Hochfahren auf Ziel-Kapazität | Eng | — |

**Customer-Touchpoint:** 2x Wöchentlicher Sync (30 Min.) in dieser Phase — erhöhte Frequenz wegen Launch

---

### Phase 6: Übergabe & Retainer-Start
**Dauer:** Woche 10-12
**Ziel:** Customer-Team ist eigenständig operativ. Retainer-Betrieb ist definiert. Alle Assets übergeben.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| SOPs vollständig dokumentiert | CS | Review + Bestätigung |
| Video-Walkthroughs (3x Loom) produziert | CS | — |
| Übergabe-Call (90 Min.) mit Customer-Team | Founder + CS | Ja — Team teilnehmen |
| 5-Tage-Stabilitätstest (Customer läuft solo) | CS (Support auf Anfrage) | Ja |
| Retainer-Scope-Doku übergeben (was ist monatlich enthalten) | CS | Bestätigung |
| Handover-Package übergeben | CS | Bestätigung Erhalt |

**Customer-Touchpoint:** Übergabe-Call + Abschluss-Sign-Off

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|---|---|---|---|---|---|---|
| **Founder** | Lead (ICP, Strategie) | Scoring-Modell | Copy-Lead | Review | Tuning | Übergabe |
| **Eng** | Infra-Setup | Pipeline-Build (Lead) | Technische Umsetzung | Integration (Lead) | Monitoring | — |
| **Customer-Success** | Onboarding, Docs | Koordination | Freigabe-Management | Testing | Hyper-Care (Lead) | Übergabe (Lead) |

*Bei Tier L: Eng-Aufwand erhöht sich in Phase 2 und 4 um ca. 40%. Founder-Involvement in Phase 5 bleibt gleich.*

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Zeitpunkt | Dauer | Format | Ziel |
|---|---|---|---|---|
| **Kick-off Call** | Woche 1 | 90 Min. | Video-Call | ICP-Workshop, Zugänge, Erwartungs-Alignment |
| **Weekly Sync** | Woche 2-8 | 30 Min. | Video-Call | Status, Blocker, Feedback |
| **Kalibrierungs-Session** | Woche 3 | 60 Min. | Video-Call | Scoring-Modell gemeinsam kalibrieren |
| **Copy-Review-Call** | Woche 5 | 45 Min. | Video-Call | Sequenzen besprechen, Freigaben einholen |
| **Milestone-Review** | Woche 7-8 | 60 Min. | Video-Call | System-Demo, Dashboard-Walkthrough |
| **Launch-Sync (2x)** | Woche 8-10 | 30 Min. | Video-Call | Erhöhte Frequenz während Soft-Launch |
| **Übergabe-Call** | Woche 11 | 90 Min. | Video-Call | SOPs, Walkthroughs, Team-Training |
| **30-Tage-Retainer-Check** | Woche 16 | 45 Min. | Video-Call | Retainer-Performance-Review, Optimierungen |

*Alle Calls werden als Summary-Notiz asynchron nachgefasst. Customer bekommt immer schriftliche Zusammenfassung + Next Steps innerhalb 24h.*

---

## Risk-Register

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | E-Mail-Deliverability-Probleme (Spam-Folder, Domain-Blacklisting) | Mittel | Hoch | Domain-Warming mind. 3 Wochen, Bounce-Rate-Monitoring täglich in Phase 5, Rotation-Setup bei Tier L, sofortiger Stopp bei Bounce-Rate >5% |
| **R2** | Customer-Freigaben verzögern Timeline (Copy-Review, CRM-Zugang) | Hoch | Mittel | Fristen klar kommunizieren (48h-SLA für Customer-Feedback). Bei >72h Verzögerung: Timeline-Anpassung kommunizieren, nicht schweigen |
| **R3** | ICP ist zu vage oder Offer ist unklar — Pipeline liefert Volumen aber keine Conversion | Mittel | Hoch | ICP-Workshop in Phase 1 mit harten Kriterien. Wenn Offer-Problem erkannt: eskalieren an Founder, nicht das System optimieren |
| **R4** | Lead-Source (LinkedIn SN / Apollo) ändert API/Scraping-Regeln oder sperrt Account | Niedrig-Mittel | Hoch | Backup-Source immer in Scope kalkulieren. Keine Single-Source-Abhängigkeit. Bei Sperrung: 48h-Reaktionszeit für Umkonfiguration |
| **R5** | CRM-Anbindung schlägt fehl wegen nicht-standardisierter CRM-Konfiguration beim Customer | Mittel | Mittel | Tech-Stack-Audit in Phase 1 deckt Risiken auf. Bei Custom-CRM: Change-Request direkt kommunizieren, nicht still lösen |

---

## Quality-Gates

| Gate | Zeitpunkt | Kriterium | Freigabe durch |
|---|---|---|---|
| **QG-1: ICP-Lock** | Ende Woche 2 | Targeting-Matrix von Customer schriftlich freigegeben | CS + Founder |
| **QG-2: Pipeline-Qualität** | Ende Woche 4 | Spot-Check 50 Leads: >75% treffen ICP-Kriterien | Founder |
| **QG-3: Deliverability-Check** | Vor Phase 5 | Spam-Score <2, Domain-Warming abgeschlossen, SPF/DKIM/DMARC grün | Eng |
| **QG-4: Copy-Freigabe** | Ende Woche 6 | Alle Sequenzen schriftlich von Customer freigegeben | CS |
| **QG-5: Integration-Test** | Ende Woche 8 | End-to-End-Test erfolgreich, Lead im CRM sichtbar, Dashboard live | Eng + CS |
| **QG-6: Launch-Stabilität** | Ende Woche 10 | Bounce <3%, Open-Rate >30%, keine technischen Fehler über 48h | Eng |
| **QG-7: Done-Sign-Off** | Ende Woche 12 | Alle Quality-Standards (aus Scope-Checklist) erfüllt, schriftlich bestätigt | Founder |

---

## Handover-Package

Was der Customer am Ende von Phase 6 physisch bekommt:

| Asset | Format | Inhalt |
|---|---|---|
| **System-Dokumentation** | Notion / PDF | Architektur-Übersicht, alle Tool-Verbindungen, Datenfluss-Diagramm |
| **SOP: Scraping & Qualifikation** | Schriftlich (Notion) | Schritt-für-Schritt wie Scraping-Pipeline überwacht und bei Problemen eingegriffen wird |
| **SOP: Outreach-Management** | Schriftlich (Notion) | Wie neue Sequenzen angelegt, bestehende angepasst und Reply-Handling durchgeführt wird |
| **SOP: CRM & Dashboard** | Schriftlich (Notion) | Wie Dashboard gelesen wird, was welche Metrik bedeutet, wann zu eskalieren ist |
| **Video-Walkthroughs (3x)** | Loom (unlisted) | Dashboard-Walkthrough / Outreach-Tool-Walkthrough / CRM-Integration-Walkthrough |
| **Retainer-Scope-Doku** | PDF | Was im monatlichen Retainer enthalten ist, wie Change-Requests eingereicht werden |
| **Zugänge-Inventar** | Internes Doc | Alle Tool-Zugänge, Domains, API-Keys (verschlüsselt übergeben) |
| **Optimierungs-Backlog** | Notion | Bekannte Phase-2-Items, Nice-to-Haves, dokumentierte Limitations |
| **30-Tage-Analyse-Template** | Spreadsheet | Vorlage für monatliche Performance-Review (Retainer) |