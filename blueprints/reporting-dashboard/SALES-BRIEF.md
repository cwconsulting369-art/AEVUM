# AEVUM Blueprint: Reporting Dashboard — Weekly KPI-Report auf Autopilot

## In einem Satz

Jeden Montag um 07:00 Uhr landet ein vollständiger, optisch sauberer KPI-Report automatisch in den Postfächern deines Teams — ohne dass jemand auch nur einen Tab öffnen muss.

---

## Wer das braucht

| Segment | Situation | Schmerzpunkt |
|---|---|---|
| **AG** Agentur (3–50 MA) | Mehrere Kunden-Accounts, wöchentliche Status-Calls | Freitags 2h GA4 + Meta zusammenklicken, dann noch Slides bauen |
| **PB** Personal Brand / Coach | Solo oder kleines Team, kaum Admin-Ressource | KPIs werden nur angeschaut, wenn "Zeit ist" — also nie systematisch |
| **FI** Mittelstand B2B-Dienstleister | Marketing-Team 1–3 Personen, Geschäftsführer will Zahlen sehen | Reporting fällt unter den Tisch, weil es kein festes System gibt |

---

## Was Customer bekommt

1. Fertiger n8n-Workflow (6 Nodes, import-ready JSON)
2. HTML-Report-Template mit Performance-Ampel (Grün/Gelb/Rot)
3. Konfigurierbare KPI-Schwellenwerte (Conv.Rate, ROAS, Ad Spend)
4. Vorwoche-Vergleich automatisch berechnet (Delta absolut + %)
5. Google Analytics 4 Integration via Service Account (kein OAuth-Refresh-Problem)
6. Meta Ads Integration (optional, aktivierbar)
7. Google Sheets / Airtable Hook für manuelle Offline-KPIs
8. Setup-Anleitung inkl. Service Account, GA4-Berechtigungen, SMTP/Resend
9. Troubleshooting-Dokumentation für die 4 häufigsten Fehlerbilder
10. Diese Dokumentations-Suite (Security, DSGVO, Install-Guide)

---

## Mehrwert (konkret)

### Vorher / Nachher

| Dimension | Vorher | Nachher |
|---|---|---|
| Zeit für wöchentliches Reporting | 1,5–3 h/Woche (manuell) | < 5 Min (Report lesen) |
| Datenstand bei Montags-Meeting | Freitag-Nachmittag oder veraltet | Heute Morgen, 07:00 Uhr |
| Konsistenz der KPIs | Jede Woche andere Metriken je nach Ersteller | Immer gleiche Struktur, vergleichbar |
| Meta Ads + GA4 in einer Ansicht | Copy-Paste aus 2 Tools | Automatisch kombiniert |
| Offshore-Kommentar / Kontext | Fehlt meist | Freitextfeld aus Google Sheet |

### ROI-Schätzung

**Konservative Annahme:** Marketing-Manager oder Agentur-MA mit 40 EUR/h, 2 h Reporting-Aufwand pro Woche.

- Eingesparte Zeit: 2 h × 52 Wochen = **104 h/Jahr**
- Wert: 104 × 40 EUR = **~4.160 EUR/Jahr** nur für eine Person
- Für Agenturen mit 5+ Kunden-Reports: Multiplikator entsprechend höher
- Qualitäts-Effekt (weniger Fehler, schnellere Entscheidung): nicht quantifiziert, aber real

Blueprint-Setup-Kosten amortisieren sich bei 2h/Woche-Einsparung in unter 6 Wochen.

---

## Pricing-Logic

| Modell | Was Customer macht | Was AEVUM macht | Preis |
|---|---|---|---|
| **Blueprint (Self-Service)** | Selbst importieren, selbst konfigurieren, Doku lesen | Workflow + diese Doku bereitstellen | Im Bundle / Flat-Fee |
| **Done-with-You (DwY)** | Credentials besorgen, Testing, Feedback | Gemeinsames Setup-Call (2h), Konfiguration live, 1 Revisions-Runde | **S-Tier: €2–4k Setup, €1k/Mo** |
| **Done-for-You (DFY)** | Zugänge übergeben, Report-Wünsche definieren | Komplettsetup, Hardening, DSGVO-Konfiguration, 4 Wochen Hypercare | **S/M-Tier: €4–8k Setup, €1–2k/Mo** |
| **Audit only** | Bestehenden Workflow zeigen | Security + DSGVO-Check, schriftliches Findings-Dokument | **€1.5–2.5k** |

Hinweis: Dieser Blueprint ist technisch S-Tier. Wer mehr als 3 Datenquellen, Multi-Client-Reporting oder Custom-Dashboard-Frontend braucht, landet in M-Tier (€8–20k Setup).

---

## Voraussetzungen Customer

| Voraussetzung | Beschreibung |
|---|---|
| n8n-Instanz | Self-hosted (empfohlen) oder n8n Cloud. Root-Zugriff für Self-hosted nötig. |
| Google Analytics 4 Property | Muss existieren und min. 7 Tage Daten haben |
| Google Cloud Account | Für Service Account Erstellung (kostenlos) |
| SMTP-Zugang oder Resend.com Account | Für E-Mail-Versand |
| Meta Business Manager (optional) | Nur wenn Meta Ads Teil des Reports sein sollen |
| Google Sheets (empfohlen) | Für manuelle KPI-Eingabe / Kommentarfeld |
| Grundlegendes technisches Verständnis | Service Account JSON handhaben, n8n-Node konfigurieren |

---

## Nicht-Ziele

Dieses Blueprint macht **nicht**:

- Kein Live-Dashboard (kein Browser-Frontend, kein Grafana, kein Looker Studio)
- Kein Multi-Client-Reporting aus einer Instanz heraus (dafür M-Tier Custom-Build)
- Kein automatischer Alert bei Anomalien (kein "Wenn ROAS < 1.5, Slack-Alert" — separater Blueprint)
- Keine historische Trendanalyse über mehr als 2 Wochen
- Kein Google Ads / LinkedIn Ads out of the box
- Keine Daten-Persistenz / Datenbank — Report wird gebaut und verschickt, nicht gespeichert
- Kein White-Label-Report mit Kunden-Logo für Agenturen (Erweiterung möglich, nicht im Scope)

---

## Upsell-Pfade

| Nächster Schritt | Was es löst | Tier |
|---|---|---|
| **Anomaly-Alert Blueprint** | Sofort-Benachrichtigung wenn ROAS abstürzt, nicht erst Montag | S |
| **Multi-Client Reporting Engine** | Eine n8n-Instanz, N Kunden-Reports, automatische Zuordnung | M |
| **Looker Studio / Metabase Integration** | Persistentes Dashboard statt Mail | M |
| **Google Ads + LinkedIn Ads Erweiterung** | Weitere Ad-Kanäle im selben Report | S Add-on |
| **Slack/Teams Digest statt Mail** | Report in Team-Channel posten | S Add-on |
| **AEVUM Full-Stack Marketing Automation** | CRM + Lead-Routing + Reporting in einem System | L |

---

## Conversion-Story

**Für die Agentur:** Du sitzt Freitagabend und weißt, dass morgen früh das Kunden-Meeting ist. Irgendwer muss noch GA4 aufmachen, die Zahlen rausziehen, mit der Vorwoche vergleichen, Meta dazu, alles in eine Mail tippen. Das dauert zwei Stunden, die keiner einkalkuliert hat, und trotzdem ist der Report meistens unvollständig. Mit diesem Blueprint ist der Report Montag früh um 07:00 Uhr im Postfach — bevor dein Team aufwacht. Das Kunden-Meeting beginnt mit echten Zahlen statt Erinnerungen.

**Für Personal Brands und Coaches:** Wer solo arbeitet, hat keine Zeit für Infrastruktur. Gleichzeitig weißt du, dass du ohne regelmäßiges Zahlen-Review blind fährst. Dieses Blueprint ist kein Luxus-Tool für Enterprise — es ist ein 6-Node-Workflow, den du in einem halben Tag aufsetzt und der danach wöchentlich automatisch läuft. Du siehst jeden Montag, ob deine Reichweite wächst, ob deine Ads performen, ob deine Conversion-Rate sich bewegt. Das ist die Basis jeder seriösen Geschäftsentscheidung.

**Für den B2B-Mittelstand:** Geschäftsführer wollen Zahlen sehen, Marketing-Teams wollen keine Stunden in Reporting investieren, und am Ende fehlt das Reporting trotzdem im Management-Meeting. Dieses Blueprint löst genau diesen Konflikt: wöchentlicher Report, automatisch, konsistent, mit Performance-Ampel die auch ein GF in 90 Sekunden lesen kann — ohne dass jemand daran erinnert werden muss.