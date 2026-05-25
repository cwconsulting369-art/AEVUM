# Scope-Checklist — Database System (DFY)

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