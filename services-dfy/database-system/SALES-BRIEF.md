# Database System — Multi-Source Data-Pipeline + Reporting-Layer

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