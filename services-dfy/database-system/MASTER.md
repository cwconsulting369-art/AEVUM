---
title: AEVUM DFY — database-system
date: 2026-05-25
---

# AEVUM Done-for-You — database-system

> Generated 2026-05-25. Combined Master-Doc.

---

# 1. Sales-Brief


## In einem Satz

Wir bauen deine gesamte Datenbasis von Grund auf: alle relevanten Quellen werden verbunden, normalisiert und in ein sauberes Reporting-Layer überführt — sodass du Entscheidungen auf echten Zahlen basierst, nicht auf Bauchgefühl oder Export-CSVs.

---

## Wer das braucht

| Segment | Konkreter Use-Case | Fit-Rating |
|---|---|---|
| **AG** (Agenturen 3–50 MA) | Agentur betreibt 5–15 Kunden-Projekte, Daten liegen in Asana, HubSpot, Google Ads, Meta Ads, eigener Zeiterfassung — kein zentrales Reporting, kein Überblick über Profitabilität pro Kunde | ★★★★★ |
| **AG** | Retainer-Kunden wollen monatliche Performance-Reports — Mitarbeiter ziehen Daten manuell aus 6 Tools zusammen (3–5h pro Report) | ★★★★★ |
| **PB** (Personal Brands) | Creator mit Newsletter, Kurs-Business, Social-Channels, Affiliate-Links — kein einheitliches Revenue-Dashboard, kein Überblick über welcher Content welchen Euro generiert | ★★★☆☆ |
| **PB** | Speaker/Coach mit mehreren Einnahmeströmen (Live-Events, Online-Kurse, 1:1) — Buchhaltung und Performance-Zahlen leben in komplett verschiedenen Welten | ★★★☆☆ |
| **FI** (Mittelstand B2B 10–100 MA) | Vertrieb nutzt CRM, Operations nutzt ERP, Finance nutzt Excel — niemand hat ein konsolidiertes Bild auf Umsatz + Kosten + Pipeline gleichzeitig | ★★★★★ |
| **FI** | Wöchentliche Management-Runden basieren auf manuell zusammengestellten Zahlen, die zum Zeitpunkt der Präsentation bereits 3–5 Tage alt sind | ★★★★★ |

---

## Was Customer bekommt

1. **Data-Source-Mapping** — vollständige Dokumentation aller verbundenen Quellen inkl. Datenstruktur, Refresh-Frequenz und Owner
2. **Multi-Source Data-Pipeline** — automatisierte Verbindung von bis zu 8 Quell-Systemen (CRM, Ads, Analytics, ERP, Zeiterfassung, E-Commerce, Finance-Tool, sonstiges)
3. **Zentrale Datenbank / Data-Warehouse** — normalisierter, bereinigter Datensatz in einer strukturierten Datenbank (Postgres, Supabase, BigQuery oder Airtable Enterprise je nach Anforderung)
4. **Transformation-Layer** — Bereinigung, Deduplication, Vereinheitlichung von Felddefinitionen (z.B. "Umsatz" bedeutet in allen Quellen dasselbe)
5. **Reporting-Layer** — 3–5 fertige Dashboards (operativ / strategisch / je Abteilung oder Use-Case) in einem vereinbarten Reporting-Tool (Metabase, Looker Studio, PowerBI oder ähnlich)
6. **Automatische Refresh-Logik** — Daten werden ohne manuellen Eingriff aktualisiert (Frequenz je nach Quelle: stündlich bis täglich)
7. **Dokumentation der Datenmodelle** — ERD, Tabellen-Glossar, Feld-Definitionen auf Deutsch, für interne Weitergabe geeignet
8. **Custom Metrics + Calculated Fields** — 10–20 kundenspezifische KPIs (z.B. Revenue per Lead, Cost per Acquisition, Agentur-Marge pro Kunde, Forecast-Werte)
9. **Alerting-Setup** — 3–5 automatische Alerts bei kritischen Schwellenwerten (z.B. CAC überschreitet Budget, Pipeline-Wert fällt unter Zielwert)
10. **Handover + Schulung** — 2h Onboarding-Session, Video-Walkthrough der Pipeline, schriftliche SOP für Erweiterungen

---

## Mehrwert (konkret)

### Vorher / Nachher

| Dimension | Vorher | Nachher | Schätzwert |
|---|---|---|---|
| **Report-Erstellung** | 3–6h manuelle Arbeit pro Woche | < 15 Minuten Review, Rest automatisch | **~150–250h/Jahr gespart** |
| **Daten-Aktualität** | Zahlen 3–7 Tage alt bei Entscheidungen | Max. 24h Latenz, kritische KPIs stündlich | Entscheidungsqualität messbar höher |
| **Fehlerquote** | Manuelle Copy-Paste-Fehler in 40–60% der Reports (Branchenerhebung) | Einzelne getestete Transformations-Pipeline | **Fehlerquote < 2%** |
| **Profitabilitätssicht** | Keine Projekt-/Kunden-Profitabilität sichtbar | Klare Marge pro Kunde / Produkt / Kanal | Durchschnittlich **8–15% Kosten-Reduktion** durch Sichtbarkeit auf Verlust-Kunden/-Kanäle |
| **Team-Zeit** | Senior-Mitarbeiter zieht Zahlen zusammen | Kein manueller Aufwand mehr | **€15–40k/Jahr Opportunitätskosten** zurückgewonnen |
| **Forecast-Fähigkeit** | Nicht möglich ohne Aufwand | Historische Trends → automatische Trend-Projektionen | Bessere Budget-Planungsbasis |

---

## Pricing-Logic

| | **Tier M** | **Tier L** |
|---|---|---|
| **Zielgruppe** | AG (klein-mittel), PB (größere Brands) | FI Mittelstand, Agenturen 20+ MA mit komplexen Quellen |
| **Setup** | €9.000 – €16.000 | €25.000 – €50.000 |
| **Monthly Retainer** | €2.000 – €3.000 | €3.500 – €5.000 |
| **Quellen** | Bis zu 5 Quellen | Bis zu 12 Quellen |
| **Dashboards** | 3 Dashboards, bis 15 KPIs | 5–8 Dashboards, bis 40 KPIs |
| **Alerting** | 3 Alerts | 8 Alerts + Anomalie-Detection |
| **Datenbasis** | Supabase / Airtable Enterprise / Looker Studio | BigQuery / Postgres + Metabase/PowerBI |
| **Retainer-Scope** | Pipeline-Wartung, neue Quellen (1/Quartal), Anpassungen KPIs, monatlicher Check | Pipeline-Wartung + Erweiterungen (laufend), Governance-Reviews, Datenschutz-Monitoring |
| **Impl.-Dauer** | 6–8 Wochen | 10–14 Wochen |

**Setup-to-Retainer-Ratio:** ~4:1 (Tier M) bis ~8:1 (Tier L) — Retainer deckt laufende Pipeline-Stabilität, Quellen-Änderungen (APIs brechen, Felder ändern sich) und kontinuierliche KPI-Evolution ab.

---

## Timeline

| Phase | Woche | Inhalt |
|---|---|---|
| **Phase 1: Discovery & Mapping** | W1–W2 | Audit aller Datenquellen, Zugänge, Datenqualität, Felder-Mapping, KPI-Definition mit Customer |
| **Phase 2: Pipeline-Build** | W3–W5 | Verbindung der Quellen, erste ETL-Läufe, Transformation-Layer, Datenbasis aufsetzen |
| **Phase 3: Validierung** | W6 | Daten-Qualitäts-Check, Abgleich mit bekannten Referenzwerten, Fehlerbehebung |
| **Phase 4: Reporting-Layer** | W7–W8 | Dashboard-Build, Custom Metrics, Alerting-Setup |
| **Phase 5: Handover** | W9 | Dokumentation, Onboarding-Session, Video-Walkthrough, SOP-Übergabe |

*(Tier L: +3–5 Wochen in Phase 2 + 4)*

---

## Voraussetzungen Customer

- **Zugang zu allen Quell-Systemen** (API-Keys, OAuth-Zugänge, Export-Zugänge) — Customer muss diese bereitstellen und intern freigeben
- **Benannter interner Ansprechpartner** mit Entscheidungskompetenz für Daten-Fragen (mind. 2h/Woche verfügbar in W1–W2)
- **Klarheit über die 5–10 wichtigsten Entscheidungsfragen**, die das System beantworten soll — ohne diese Grundarbeit kein sinnvolles Reporting
- **Definierte KPI-Verantwortlichkeiten** — wer "owns" welche Kennzahl intern?
- **Historische Daten** (mind. 6 Monate, ideal 12+ Monate) in den Quell-Systemen vorhanden
- **Bereitschaft zur Daten-Bereinigung** — wenn Quell-Daten grob fehlerhaft sind, muss Customer das intern klären (AEVUM kann flaggen, nicht beheben)
- Bei Tier L: **IT-Freigabe** für externe Datenbankverbindungen

---

## Nicht-Ziele (Out-of-Scope)

1. **Kein ERP-Customizing** — wir verbinden bestehende ERP-Systeme, bauen sie nicht um oder erweitern sie
2. **Keine Rohdaten-Bereinigung in Quell-Systemen** — wenn CRM-Daten vollständig inkonsistent sind, ist das ein separates Projekt
3. **Kein Business-Intelligence-Consulting** — AEVUM baut das technische System; Interpretation der Daten und strategische Ableitung liegt beim Customer
4. **Keine Custom-Software-Entwicklung** für Quell-Systeme ohne API — Systeme ohne API oder Export-Möglichkeit sind Out-of-Scope
5. **Kein DSGVO-Compliance-Audit** — wir bauen datenschutzkonform, aber ein formaler Compliance-Audit ist nicht Teil des Scopes
6. **Keine prädiktive ML-Modellierung** — Trend-Projektionen ja, Custom ML-Modelle nein (separates Angebot)
7. **Kein laufendes Reporting-Service** im Sinne von AEVUM zieht Zahlen raus und erklärt sie — das System ist self-service
8. **Keine unbegrenzte Quellen-Anzahl** — alles über den vereinbarten Umfang ist Change Request

---

## Upsell-Pfade

| Trigger | Next Service |
|---|---|
| Customer will KPIs live im Büro / auf dem Laptop sehen | `hud-command-center` — Live-KPI-HUD mit Real-Time-Data-Streams |
| Customer will neben Reporting auch Lead-Daten automatisch anreichern | `ai-lead-engine` — Full-Stack Lead-Generation |
| Database-System zeigt Lücken im Sales-Prozess auf | `sales-os` — Sales-Pipeline mit AI-Scoring + CRM-Integration |
| Agentur-Kunden wollen Self-Service-Zugang zu ihren eigenen Daten | `command-center-dashboard` — Custom Dashboard für Cross-Tool-Sichtbarkeit |
| Gesamter Business-Stack soll auf ein System, nicht nur Daten | `business-os` — Komplettes Business-OS |
| Customer hat jetzt Datenbasis und will Content-Performance systematisch tracken | `content-engine` — End-to-End Content-Production |

---

## Conversion-Story

Es gibt einen Moment, den fast jede Agentur, jeder Mittelständler, jede wachsende Brand kennt: Jemand im Meeting fragt "Wie ist eigentlich unsere Conversion-Rate aus LinkedIn-Ads im letzten Quartal verglichen mit dem Vorjahr?" — und dann folgt Stille. Oder schlimmer: drei verschiedene Zahlen von drei verschiedenen Personen, weil jeder in ein anderes Tool schaut. Entscheidungen werden trotzdem getroffen. Auf Basis von nichts Verlässlichem. Das ist kein Einzelfall, das ist Alltag.

Das Database-System löst genau dieses Problem, und zwar dauerhaft. Wir bauen keine weitere Excel-Tabelle und keinen weiteren manuellen Report. Wir verbinden deine echten Systeme — CRM, Ads, Analytics, Zeiterfassung, Finance — in eine saubere, automatisierte Pipeline, die täglich läuft. Das Ergebnis: Eine einzige Wahrheit. Für das ganze Team. Ohne dass jemand samstags Zahlen zusammenkopiert.

Der wirtschaftliche Effekt ist keine abstrakte Zahl. Wenn ein Senior-Mitarbeiter 4 Stunden pro Woche mit Reporting verbringt — das sind 200 Stunden im Jahr, bei einem Stundensatz von €80 intern sind das €16.000 gebundene Kapazität, jedes Jahr, für immer. Dazu kommt die strategische Dimension: Unternehmen, die blinde Flecken in ihrer Profitabilität schließen, entdecken regelmäßig Kunden oder Kanäle, die sie aktiv Geld kosten. Sichtbarkeit auf Zahlen ist kein Komfort — es ist Wettbewerbsvorteil.

---
\newpage

# 2. Scope-Checklist


**Verwendung:** Interner Sales-Call, Scope-Definition vor Vertragsabschluss. Jede Zeile muss mit Customer explizit bestätigt werden.

---

## In-Scope

| Kategorie | Item | Aufwand-Estimate |
|---|---|---|
| **Discovery** | Kick-off Workshop: Quellen-Audit, KPI-Definition, Entscheidungsfragen-Mapping | 6–8h (AEVUM) + 2–3h (Customer) |
| **Discovery** | Dokumentation aller Quell-Systeme (Felder, Datenstruktur, API-Verfügbarkeit) | 4–6h |
| **Discovery** | Data-Quality-Assessment je Quelle (Vollständigkeit, Konsistenz, Aktualität) | 3–5h |
| **Pipeline-Build** | API-Verbindungen zu vereinbarten Quellen (bis zu 5 Tier M / bis zu 12 Tier L) | 2��6h pro Quelle |
| **Pipeline-Build** | ETL-Prozesse: Extract, Transform, Load für alle Quellen | 8–20h gesamt |
| **Pipeline-Build** | Deduplication + Normalisierung (Felder vereinheitlichen, Formate angleichen) | 6–10h |
| **Pipeline-Build** | Zentrale Datenbankstruktur aufsetzen (Schema-Design, Tabellen-Struktur) | 4–8h |
| **Pipeline-Build** | Automatische Refresh-Logik (Scheduler, Fehler-Handling, Retry-Logik) | 4–6h |
| **Transformation** | Custom Metrics / Calculated Fields (vereinbarte KPI-Liste, max. 20 Tier M / 40 Tier L) | 6–12h |
| **Validierung** | Daten-Abgleich gegen bekannte Referenzwerte (Customer stellt Referenz-Zahlen bereit) | 4–6h |
| **Validierung** | Dokumentierter QA-Prozess mit Sign-Off durch Customer | 2–3h |
| **Reporting** | Dashboard-Build (3 Dashboards Tier M / 5–8 Tier L) | 8–20h |
| **Reporting** | Alerting-Setup (3 Alerts Tier M / 8 Alerts Tier L) | 2–4h |
| **Dokumentation** | Datenmodell-Dokumentation (ERD, Tabellen-Glossar, Feld-Definitionen) | 4–6h |
| **Dokumentation** | SOP für Erweiterungen (neue Quellen hinzufügen, KPIs anpassen) | 2–3h |
| **Handover** | 2h Onboarding-Session (Live, mit Recording) | 2h |
| **Handover** | Video-Walkthrough der Pipeline (async, 20–40 Minuten) | 3–4h Produktion |
| **Retainer** | Monatliche Pipeline-Wartung, API-Änderungen abfangen, Fehler-Behebung | 4–8h/Monat |
| **Retainer** | Quartalsweise: 1 neue Quelle ODER 5 neue KPIs (Tier M) | Enthalten |

---

## Out-of-Scope

Was Customer NICHT bekommt — diese Liste muss im Sales-Call explizit kommuniziert werden:

- **Datenbereinigungs-Arbeit in Quell-Systemen** — wenn CRM-Daten chaotisch sind (doppelte Kontakte, fehlende Felder, inkonsistente Kategorien), muss Customer das intern bereinigen; AEVUM flaggt Qualitätsprobleme, behebt sie nicht
- **Mehr Quellen als vereinbart** ohne Change Request und neue Preisverhandlung
- **ERP-Anpassungen oder -Customizing** — wir lesen aus, wir schreiben nicht zurück (außer explizit anders vereinbart)
- **Custom ML-Modelle oder prädiktive Analysen** über einfache Trend-Projektionen hinaus
- **Formaler DSGVO/Datenschutz-Audit** — System wird datenschutzbewusst gebaut, Compliance-Verantwortung liegt beim Customer
- **Business-Intelligence-Beratung** — Interpretation der Daten, strategische Ableitung, Handlungsempfehlungen auf Basis der Reports
- **Unbegrenzte Dashboard-Anpassungen** nach Handover — Änderungen nach Go-Live sind Retainer-Scope oder Change Request
- **Systeme ohne API oder strukturierten Export** (z.B. alte Legacy-Software, PDF-only Reports, manuell gepflegte Excels ohne konsistente Struktur)
- **User-Management / Rechteverwaltung** für das Reporting-Tool — initiales Setup ja, laufende User-Administration nein
- **Training für das gesamte Team** — 1 Onboarding-Session für 2–3 Personen ist enthalten; weitere Schulungen sind Add-on

---

## Voraussetzungen Customer-Side

| Kategorie | Anforderung | Wer? | Bis wann? |
|---|---|---|---|
| **Access** | API-Keys / OAuth-Zugänge für alle vereinbarten Quellen | IT oder Owner | Vor W1 |
| **Access** | Admin-Zugang zum Reporting-Tool (oder Bereitschaft, neues Tool anzuschaffen) | Owner / IT | Vor W4 |
| **Daten** | Historische Daten mind. 6 Monate in Quell-Systemen vorhanden | — | Voraussetzung |
| **Menschen** | Benannter Data-Owner intern (2h/Woche verfügbar in W1–W2) | Fachseite | Sofort |
| **Commitment** | Liste der 5–10 wichtigsten KPIs / Entscheidungsfragen (Vorarbeit vor Kick-off) | Management | Vor W1 |
| **Commitment** | Referenz-Zahlen für Daten-Validierung (bekannte Werte aus vergangenen Reports) | Fachseite | Vor W6 |
| **Tools** | Entscheidung über Reporting-Tool (Metabase / Looker Studio / PowerBI / anderes) | Owner | Vor W3 |
| **Freigaben** | IT-Freigabe für externe Datenbankverbindungen (bei FI Pflicht) | IT | Vor W2 |
| **Kommunikation** | Reaktionszeit auf AEVUM-Anfragen max. 48h Werktage | Owner + Data-Owner | Durchgängig |

---

## Quality-Standards

AEVUM sagt "Done" wenn folgendes erfüllt ist — nicht früher:

1. **Alle vereinbarten Quellen verbunden** und Pipeline läuft fehlerlos durch mindestens 5 automatische Refresh-Zyklen
2. **Daten-Abgleich bestanden**: Werte in Dashboards weichen max. 1–2% von Customer-bestätigten Referenzwerten ab (oder Abweichungen sind dokumentiert und erklärt)
3. **Alle vereinbarten KPIs** vorhanden, korrekt berechnet, definiert in Glossar
4. **Dashboards funktionieren** in vereinbartem Reporting-Tool, korrekte Filter, Mobile-Grundfunktion gegeben
5. **Alerting aktiv** und mind. 1 Test-Alert ausgelöst und empfangen
6. **Fehler-Handling in Pipeline** dokumentiert — was passiert wenn eine Quelle nicht erreichbar ist
7. **Dokumentation vollständig** (ERD + Glossar + SOP)
8. **Customer hat Onboarding-Session absolviert** und schriftlich bestätigt, dass sie das System selbst bedienen können
9. **Video-Walkthrough** abgenommen und zugänglich
10. **Kein kritischer offener Bug** (P0/P1) im System zum Handover-Zeitpunkt

---

## Change-Request-Policy

| Situation | Vorgehen | Kosten |
|---|---|---|
| Neue Datenquelle (während Implementation) | CR-Dokument, Aufwand-Schätzung, Customer muss schriftlich bestätigen | €500–2.500 je nach Komplexität + ggf. Timeline-Verschiebung |
| Mehr KPIs als vereinbart | Bis +5 KPIs: kostenfrei wenn in Phase 4 noch Zeit. Darüber: CR | Ab €300 pro zusätzlichem Block à 5 KPIs |
| Dashboard-Änderungen nach Go-Live | Erste 30 Tage: 1 Runde Minor-Änderungen enthalten. Danach Retainer oder CR | Retainer: 1 Change/Monat enthalten |
| Änderung des Reporting-Tools | Nur mit hohem Aufwand möglich — zählt als Neuaufbau | Separate Kalkulation, typisch 30–50% des Original-Setups |
| Scope-Verkleinerung | Schriftliche Änderungsvereinbarung, bereits erbrachte Leistungen werden verrechnet | Kein Rabatt auf bereits gebaute Komponenten |
| Customer liefert Zugänge zu spät | Timeline verschiebt sich 1:1, kein Preisnachlass | — |

---

## Pricing-Variations

| Add-On / Variation | Preis-Auswirkung | Bedingung |
|---|---|---|
| Jede zusätzliche Datenquelle über Grundpaket | +€800–2.500 Setup je nach API-Komplexität | Muss vor Start vereinbart sein |
| BigQuery / Snowflake statt einfachem DB-Setup | +€2.000–5.000 Setup | Enterprise-Datenvolumen, >50M Rows/Jahr |
| Zweites Unternehmen / zweite Business-Unit | +50–70% des Setup-Preises | Separate Datenmodelle notwendig |
| Anomalie-Detection / einfache ML-Trends | +€3.000–8.000 Setup | Nur Tier L, mind. 12 Monate Historik |
| White-Label-Dashboard für Kunden (Agentur-Use-Case) | +€1.500–4.000 Setup + €300/Mo je Instanz | Hosting-Kosten separat |
| Datenschutz-konformes Setup EU-only (kein US-Server) | +€500–1.500 Setup | Hosting-Auswahl eingeschränkt |
| Erweiterte Alerting-Suite (>8 Alerts + Slack-Integration) | +€800 Setup | — |
| Retainer-Upgrade: 2 neue Quellen/Quartal statt 1 | +€500/Mo | Tier M → Tier M+ |
| Zusätzliche Onboarding-Sessions (je 1h) | +€250/Session | Nach Handover buchbar |

---
\newpage

# 3. Delivery-Plan


**Intern. Nicht für Customer.** Operatives Playbook für AEVUM-Team.

---

## Phasen

### Phase 1: Discovery & Source-Mapping (W1–W2)

**Ziel:** Vollständiges Bild aller Quellen, KPIs, Qualitätsstandards. Kein Bit Code bevor diese Phase abgenommen ist.

| Deliverable | Owner | Customer-Input nötig? |
|---|---|---|
| Kick-off Call durchgeführt, Recording verfügbar | Founder / CS | Ja — Data-Owner + Entscheider |
| Source-Inventory-Doc (alle Quellen, Felder, API-Status) | Eng | Ja — Zugänge bereitgestellt |
| KPI-Glossar (Rohentwurf, von Customer bestätigt) | CS + Founder | Ja — Customer liefert KPI-Liste |
| Data-Quality-Report pro Quelle (Vollständigkeit, Anomalien, Gaps) | Eng | Nein |
| Priorisierungs-Entscheidung: welche Quellen zuerst, welche später | Founder | Ja — Customer buy-in |
| Tech-Stack-Entscheidung final (DB, ETL-Tool, Reporting-Tool) | Eng + Founder | Ja — Tool-Präferenz |

**Customer-Touchpoint:** Kick-off Call (90 Min) + Async-Feedback auf Source-Inventory innerhalb 48h

**Quality-Gate:** Phase 1 ist abgeschlossen wenn Source-Inventory von Customer schriftlich freigegeben + KPI-Glossar Rohentwurf existiert.

---

### Phase 2: Pipeline-Build (W3–W5 Tier M / W3–W8 Tier L)

**Ziel:** Funktionierende ETL-Pipelines für alle vereinbarten Quellen. Daten landen korrekt in DB.

| Deliverable | Owner | Anmerkung |
|---|---|---|
| Datenbankschema finalisiert (ERD, Tabellen, Relationen) | Eng | Intern reviewed vor Implementierung |
| API-Verbindungen implementiert (je Quelle) | Eng | Pro Quelle einzeln testen |
| Transformation-Layer (Normalisierung, Dedup, Bereinigung) | Eng | Kritischste Phase — Bugs hier sind teuer |
| Refresh-Scheduler eingerichtet (je nach Frequenz-Anforderung) | Eng | |
| Fehler-Handling implementiert (Retry, Alerting bei Pipeline-Fehler) | Eng | Intern — kein Customer-Alert |
| Erste interne Daten-Sichtprüfung | Eng + Founder | Stichproben gegen bekannte Referenzwerte |

**Customer-Touchpoint:** Weekly Sync W3 + W5 — kurzer Status (15–20 Min), keine langen Calls. Ziel: frühzeitig Probleme mit Zugängen oder API-Limits klären.

**Quality-Gate:** Alle Pipelines laufen 3× fehlerfrei durch automatischen Refresh. Keine P0-Bugs.

---

### Phase 3: Daten-Validierung (W6 Tier M / W9 Tier L)

**Ziel:** Customer bestätigt, dass die Zahlen stimmen. Keine Phase 4 ohne bestätigte Validierung.

| Deliverable | Owner | Customer-Input nötig? |
|---|---|---|
| Validierungs-Dokument (Soll-Ist-Vergleich für alle KPIs) | Eng + CS | Ja — Customer liefert Referenz-Zahlen |
| Abweichungs-Log (was weicht ab und warum?) | Eng | Nein |
| Customer Sign-Off auf Validierungs-Dokument | CS | Ja — schriftlich per Email |
| Bugfixes aus Validierung | Eng | — |

**Customer-Touchpoint:** Validierungs-Review-Call (60 Min) — Customer, Data-Owner, AEVUM CS + Eng.

**Quality-Gate:** Alle KPI-Abweichungen < 2% oder dokumentiert + erklärt. Customer hat schriftlich freigegeben.

**Risiko-Note:** Wenn Customer keine Referenz-Zahlen hat, dauert Validierung länger. Das muss in W1 bereits geprüft werden.

---

### Phase 4: Reporting-Layer + Alerting (W7–W8 Tier M / W10–W12 Tier L)

**Ziel:** Fertige, benutzte Dashboards. Nicht nur hübsch — tatsächlich auf die vereinbarten KPIs ausgerichtet.

| Deliverable | Owner | Anmerkung |
|---|---|---|
| Dashboard-Build (vereinbarte Anzahl) | Eng + CS | Design nach vereinbarten Wireframes / Anforderungen aus Phase 1 |
| Custom Metrics / Calculated Fields fertig | Eng | Alle aus KPI-Glossar |
| Alerting-Setup (Schwellenwerte vom Customer, nicht von uns erfinden) | Eng | Customer muss Schwellenwerte liefern |
| Intern: Dashboard-Review (UX, Korrektheit, Vollständigkeit) | Founder + CS | Vor Customer-Preview |
| Customer-Preview-Session (30 Min async oder live) | CS | Feedback-Runde #1 |
| Finale Anpassungen (1 Runde enthalten) | Eng | Scope: Minor-Änderungen, kein Umbau |

**Customer-Touchpoint:** Dashboard-Preview — live oder Loom-Video. Customer gibt Feedback innerhalb 48h.

**Quality-Gate:** Alle Dashboards entsprechen KPI-Glossar. Alle vereinbarten Alerts aktiv und getestet. Visueller Review durch Founder abgenommen.

---

### Phase 5: Dokumentation + Handover (W9 Tier M / W13–W14 Tier L)

**Ziel:** Customer kann das System ohne AEVUM bedienen und verstehen.

| Deliverable | Owner | Format |
|---|---|---|
| ERD-Dokument (Datenbankstruktur) | Eng | PNG + Notion/PDF |
| Tabellen-Glossar (alle Felder erklärt, auf Deutsch) | Eng + CS | Notion / Google Doc |
| SOP: neue Quelle hinzufügen | Eng | Schritt-für-Schritt, Deutsch |
| SOP: KPI anpassen | Eng | Schritt-für-Schritt, Deutsch |
| Video-Walkthrough Pipeline (20–40 Min, Loom) | Eng | Loom, unlisted Link |
| Onboarding-Session live (2h) | CS + Founder | Zoom mit Recording |
| Zugänge übergeben (alle relevanten Logins dokumentiert) | CS | Passwort-Manager oder sicheres Doc |
| Retainer-Kickoff (Scope des laufenden Retainers erklären) | Founder / CS | 20 Min, Ende der Onboarding-Session |

**Customer-Touchpoint:** Onboarding-Session (2h, live, aufgezeichnet).

**Quality-Gate:** Customer bestätigt schriftlich, dass sie das System bedienen können. Alle Docs zugänglich. Kein offener P0/P1-Bug.

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Retainer |
|---|---|---|---|---|---|---|
| **Founder** | Lead (Kick-off, Tech-Stack-Entscheidung) | Review (Quality-Gate) | Review (Sign-Off) | Final-Review vor Customer-Preview | Retainer-Scope erklären | Eskalations-Punkt |
| **Engineer** | Source-Inventory, API-Analyse | Lead (Pipeline-Build, alle technischen Deliverables) | Lead (Validierung, Bugfix) | Lead (Dashboards, Alerts) | Docs, Video | Pipeline-Wartung (4–8h/Mo) |
| **Customer-Success** | Kick-off koordinieren, KPI-Glossar moderieren | Weekly Syncs, Kommunikation | Validierungs-Call, Customer-Kommunikation | Preview koordinieren, Feedback managen | Onboarding-Session, Zugänge-Übergabe | Monthly Check-in, CR-Management |

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Wann | Format | Dauer | Owner | Ziel |
|---|---|---|---|---|---|
| **Kick-off Call** | W1 | Zoom, live | 90 Min | Founder + CS | Gegenseitiges Verständnis, Erwartungen, Zugänge-Timeline |
| **Weekly Sync** | W3, W5 | Zoom oder Async-Update | 20 Min | CS | Status, offene Blocker, Zugänge |
| **Validierungs-Review** | W6 (W9 Tier L) | Zoom, live | 60 Min | CS + Eng | Zahlen stimmen? Customer Buy-in |
| **Dashboard-Preview** | W8 (W12 Tier L) | Loom oder Zoom | 30–45 Min | CS | Feedback auf Dashboards |
| **Onboarding-Session** | W9 (W14 Tier L) | Zoom, live, recorded | 2h | CS + Eng | Übergabe, Schulung, Retainer-Scope |
| **30-Tage-Check** | 4 Wochen nach Go-Live | Zoom | 30 Min | CS | Pipeline läuft? Fragen? Minor-Fixes? |

---

## Risk-Register

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Customer liefert API-Zugänge verspätet oder unvollständig | Hoch | Hoch — blockiert Phase 2 komplett | In W1 Kick-off: klare Deadline, wer liefert was bis wann. CS eskaliert bei Nicht-Lieferung nach 3 Werktagen. Timeline-Verschiebung kommunizieren, nicht still schlucken. |
| **R2** | Datenqualität in Quell-Systemen deutlich schlechter als erwartet (fehlende Felder, inkonsistente Kategorien, Duplikate >20%) | Mittel | Mittel — Transformation-Layer massiv aufwändiger | Data-Quality-Assessment in Phase 1 explizit. Bei kritischen Qualitätsproblemen: Customer auffordern, Quell-Daten intern zu bereinigen, bevor Pipeline gebaut wird. Timeline pausieren. |
| **R3** | API einer Quell-Plattform ist instabil, rate-limited oder ändert sich während Implementierung | Mittel | Mittel — einzelne Quelle fällt aus | Fehler-Handling + Retry-Logik von Anfang an einbauen. Fallback: manueller CSV-Export als Überbrückung dokumentieren. Customer informieren, wenn Quelle strukturell unzuverlässig ist. |
| **R4** | Customer kann keine Referenz-Zahlen für Validierung liefern ("wir haben nie Zahlen gehabt") | Mittel | Mittel — Validierungsphase verlängert sich, keine eindeutige Bestätigung möglich | Früh in Phase 1 ansprechen. Wenn keine Referenz-Zahlen: Customer wird gebeten, mind. 3 Zahlen aus der Vergangenheit manuell zu prüfen. Oder: Validierung via Spot-Check einzelner Transaktionen statt KPI-Summen. |
| **R5** | Customer-seitige IT blockiert externe Datenbankverbindungen nachträglich | Niedrig bei AG/PB, Hoch bei FI | Hoch — kann gesamtes Projekt gefährden | In Pre-Sales bereits klären: gibt es IT-Abteilung? Freigabeprozesse? Bei FI: IT als Stakeholder von Anfang an einbinden, nicht erst in W4. |

---

## Quality-Gates

| Gate | Phase | Wer nimmt ab? | Kriterium |
|---|---|---|---|
| **QG-1: Source-Inventory freigegeben** | Ende Phase 1 | CS + Customer schriftlich | Alle Quellen dokumentiert, KPI-Glossar Rohentwurf bestätigt |
| **QG-2: Pipeline-Erstlauf sauber** | Mitte Phase 2 | Eng intern | 3 fehlerfreie Refresh-Zyklen, keine P0-Bugs, Daten landen in DB |
| **QG-3: Validierung bestanden** | Ende Phase 3 | Founder + Customer schriftlich | <2% Abweichung oder dokumentiert, Customer-Sign-Off vorhanden |
| **QG-4: Dashboards abgenommen** | Ende Phase 4 | Founder visuell + CS | Alle KPIs vorhanden, Alerts aktiv, Dashboard-Preview-Feedback eingearbeitet |
| **QG-5: Handover komplett** | Ende Phase 5 | CS Checkliste | Alle Docs zugänglich, Onboarding-Session done, Customer-Bestätigung schriftlich, kein P0/P1 offen |

---

## Handover-Package

Was Customer am Ende physisch bekommt:

| Asset | Format | Zugänglich via |
|---|---|---|
| ERD-Dokument (Datenbankstruktur) | PNG + PDF | Shared Google Drive / Notion |
| Tabellen-Glossar (alle Felder, Deutsch) | Notion-Page oder Google Doc | Link in Übergabe-Dokument |
| SOP: neue Datenquelle hinzufügen | Google Doc, Schritt-für-Schritt | Shared Drive |
| SOP: KPI / Calculated Field anpassen | Google Doc, Schritt-für-Schritt | Shared Drive |
| Video-Walkthrough Pipeline (Loom, 20–40 Min) | Loom-Link (unlisted) | Übergabe-Dokument |
| Recording Onboarding-Session | Zoom-Recording-Link | Per Email |
| Zugangsdaten / Credentials (alle relevanten) | 1Password Shared Vault oder gesichertes Doc | Direkt an Customer-Owner |
| Retainer-Scope-Dokumentation | 1-pager PDF | Per Email + Drive |
| Kontakt für Retainer-Support | Email + Slack-Channel (wenn vorhanden) | Onboarding-Session |

---
\newpage

# 4. Quality-Gate


**Dokument-Typ:** Sign-Off-Doku  
**Verwendet bei:** Handover-Zeitpunkt, intern vor Übergabe an Customer  
**Status-Marker:** ✅ = bestanden | ⏳ = ausstehend | ❌ = nicht bestanden

---

## Asset-Inventory

| # | Asset | Format | Location | Status |
|---|---|---|---|---|
| 1 | Source-Inventory-Dokument | Google Doc / Notion | [Link] | ⏳ |
| 2 | KPI-Glossar (finalisiert, Customer-freigegeben) | Google Doc / Notion | [Link] | ⏳ |
| 3 | Data-Quality-Report (alle Quellen) | Google Doc | [Link] | ⏳ |
| 4 | Datenbankschema / ERD | PNG + PDF | [Link] | ⏳ |
| 5 | Tabellen-Glossar (alle Felder, Deutsch) | Notion / Google Doc | [Link] | ⏳ |
| 6 | ETL-Pipeline-Code / Konfiguration (dokumentiert) | Git-Repo oder Notion | [Link] | ⏳ |
| 7 | Refresh-Scheduler-Konfiguration | Intern dokumentiert | [Link] | ⏳ |
| 8 | Fehler-Handling-Dokumentation | Intern | [Link] | ⏳ |
| 9 | Validierungs-Dokument mit Customer-Sign-Off | Google Doc | [Link] | ⏳ |
| 10 | Dashboard-Set (alle vereinbarten Boards) | Reporting-Tool | [Link] | ⏳ |
| 11 | Alerting-Konfiguration (dokumentiert) | Reporting-Tool / Doc | [Link] | ⏳ |
| 12 | SOP: neue Quelle hinzufügen | Google Doc | [Link] | ⏳ |
| 13 | SOP: KPI anpassen | Google Doc | [Link] | ⏳ |
| 14 | Video-Walkthrough Pipeline (Loom) | Loom-Link | [Link] | ⏳ |
| 15 | Recording Onboarding-Session | Zoom-Link | [Link] | ⏳ |
| 16 | Zugänge übergeben (Credentials dokumentiert) | 1Password / Sec. Doc | [Link] | ⏳ |
| 17 | Retainer-Scope-Doku (1-pager) | PDF | [Link] | ⏳ |

---

## Sign-Off-Kriterien

Alle 10 Kriterien müssen ✅ sein. Kein Handover bei offenen ❌.

| # | Kriterium | Status | Notiz |
|---|---|---|---|
| 1 | Alle vereinbarten Datenquellen verbunden und Pipeline läuft ≥ 5× fehlerfrei durch automatischen Refresh | ⏳ | Datum letzter erfolgreicher Run: [DATUM] |
| 2 | Daten-Validierung: alle KPI-Abweichungen < 2% oder dokumentiert + erklärt. Customer-Sign-Off schriftlich vorhanden. | ⏳ | Sign-Off-Email von: [KONTAKT], Datum: [DATUM] |
| 3 | Alle vereinbarten KPIs im Dashboard vorhanden und korrekt berechnet (laut KPI-Glossar) | ⏳ | Geprüft durch: [ENG-NAME] |
| 4 | Alle vereinbarten Dashboards funktionieren im gewählten Reporting-Tool. Filter korrekt. Mobile-Grundfunktion gegeben. | ⏳ | |
| 5 | Alerting aktiv: mind. 1 Test-Alert je konfiguriertem Alert ausgelöst und vom Customer-Empfänger bestätigt empfangen | ⏳ | Test-Datum: [DATUM] |
| 6 | Fehler-Handling in Pipeline dokumentiert und getestet: was passiert wenn Quelle X nicht erreichbar ist? | ⏳ | |
| 7 | Dokumentation vollständig: ERD + Tabellen-Glossar + beide SOPs zugänglich und von CS reviewed | ⏳ | CS-Review durch: [CS-NAME] |
| 8 | Video-Walkthrough (Loom) fertig, zugänglich, Länge ≥ 20 Min, deckt alle Pipeline-Komponenten ab | ⏳ | Loom-Link: [LINK] |
| 9 | Onboarding-Session durchgeführt (≥ 2h, aufgezeichnet). Customer hat schriftlich bestätigt, System selbst bedienen zu können. | ⏳ | Bestätigung von: [KONTAKT], Datum: [DATUM] |
| 10 | Kein offener Bug P0 oder P1 zum Handover-Zeitpunkt. Offene P2-Bugs dokumentiert mit Retainer-Bearbeitung kommuniziert. | ⏳ | Offene P2-Bugs: [ANZAHL], dokumentiert in [LINK] |

---

## Known Limitations (Phase-2-Items)

Diese Punkte sind bewusst nicht Teil des initialen Setups. Sie sind dokumentiert für Retainer-Roadmap oder Upsell:

| # | Limitation | Warum nicht in Phase 1? | Empfohlener Zeitpunkt |
|---|---|---|---|
| L1 | Prädiktive Analysen / ML-basierte Forecasts | Erfordert mind. 12 Monate Historik + separate Architektur | Nach 6–12 Monaten Retainer |
| L2 | Weitere Datenquellen über Grundpaket hinaus | Scope-Grenze. Neue Quellen = neue Komplexität. | Quartalsweise im Retainer (1 Quelle/Quartal enthalten) |
| L3 | Granularere Daten-Historik (über Erstbefüllung hinaus) | APIs liefern nur begrenzten Rückblick. Historik-Erweiterung über Archivierungs-Pipeline möglich. | Bei Bedarf als CR |
| L4 | Self-Service-KPI-Builder für Customer (ohne AEVUM) | Würde deutlich komplexeres Frontend erfordern. | Bei hohem Bedarf: Upsell auf erweitertes Reporting-Tool |
| L5 | Automatische Anomalie-Detection (Outlier-Flagging) | Erfordert Baseline-Daten über mind. 3 Monate + separate Logik | Tier L Add-on nach Stabilisierungsphase |
| L6 | White-Label-Zugang für Kunden des Customers (Agentur-Use-Case) | User-Management und Multi-Tenancy deutlich komplexer | Separater Scope, separates Angebot |

---

## DB-Update-Befehl

```sql
-- AEVUM Internal: DFY Item Sign-Off
UPDATE dfy_items
SET
  status            = 'delivered',
  handover_date     = CURRENT_DATE,
  quality_gate_passed = TRUE,
  phase2_items      = ARRAY[
    'ml-forecasting',
    'additional-sources-beyond-scope',
    'extended-data-history',
    'self-service-kpi-builder',
    'anomaly-detection',
    'white-label-multi-tenant'
  ],
  retainer_active   = TRUE,
  notes             = 'All 10 sign-off criteria passed. Known limitations documented. Retainer scope communicated.'
WHERE
  item_slug = 'database-system'
  AND customer_id = [CUSTOMER_ID];  -- REPLACE before executing
```

---

## Pattern-Notes für DFY-Builder-Pattern

**Was macht `database-system` strukturell anders als andere DFY-Items:**

1. **Validierungsphase ist kritischer Differentiator** — Im Gegensatz zu z.B. `content-engine` oder `command-center-dashboard` gibt es hier eine explizite Daten-Validierungsphase die Customer-Input (Referenz-Zahlen) zwingend erfordert. Ohne diese Phase kein vertrauenswürdiges System. In anderen Items ist Validierung intern — hier ist sie bilateral.

2. **Zugänge-Dependency ist der häufigste Blocker** — API-Keys, OAuth-Zugänge, IT-Freigaben. Das ist bei keinem anderen Item so ausgeprägt. In Sales-Calls früh ansprechen: "Haben Sie eine IT-Abteilung mit Freigabeprozessen?" — wenn ja, diese Person muss in W1 dabei sein, nicht erst in W3.

3. **Transformation-Layer ist die unsichtbare Komplexität** — Customer sieht die Dashboards, nicht die Transformation. Fehler im Transformation-Layer (falsche Dedup-Logik, falsche KPI-Berechnung) sind schwer sichtbar und teuer zu fixen. QG-2 und QG-3 existieren genau deswegen. Nie Phase 4 starten ohne QG-3 schriftlich abgenommen.

4. **Retainer ist strukturell notwendig, nicht optional** — APIs ändern sich. Felder werden umbenannt. Rate-Limits verändern sich. Das ist keine Verkaufsstrategie, das ist Realität von API-basierten Pipelines. Im Sales-Gespräch klar kommunizieren: ohne Retainer ist das System nach 6–12 Monaten kaputt.

5. **Pricing-Eskalation kommt fast immer aus Quellen-Anzahl** — Nicht aus Dashboard-Komplexität. Die wichtigste Scope-Frage im Sales-Call: "Zählen wir gemeinsam die Quellen." Jede Quelle über das Paket hinaus ist reale Arbeitszeit.

---