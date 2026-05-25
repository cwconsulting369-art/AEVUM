# HUD Command Center — Live-KPI-HUD mit Real-Time-Data-Streams

## In einem Satz

Ein einziges, immer aktuelles Dashboard das alle kritischen KPIs deines Business in Echtzeit sichtbar macht — kein manuelles Reporting mehr, keine blinden Flecken, kein Zahlen-Chaos aus fünf verschiedenen Tools.

---

## Wer das braucht

| Segment | Konkreter Use-Case | Fit |
|---|---|---|
| **AG** (Agentur 3-50 MA) | Kampagnen-Performance, Billable Hours, MRR, Churn-Rate und Team-Utilization auf einem Screen sichtbar — statt täglich in Ads Manager, Harvest und HubSpot zu wühlen | ★★★★★ |
| **PB** (Personal Brand) | Revenue-Streams (Kurs, Coaching, Affiliate), Content-Performance (Reach, Saves, Story-Replies), E-Mail-Wachstum und Launch-Pipeline auf einem Dashboard — ohne VA-Overhead | ★★★☆☆ |
| **FI** (Mittelstand B2B 10-100 MA) | Sales-Pipeline, Produktionsauslastung, offene Forderungen, Support-Ticket-Volumen und Team-KPIs konsolidiert — statt Abteilungsleiter-Roundtable für Status-Updates | ★★★★★ |

> PB-Fit ist bedingt: Nur sinnvoll wenn mind. 3 separate Datenquellen existieren und kein All-in-One-Tool genutzt wird.

---

## Was Customer bekommt

1. **Architektur-Dokument** — Datenquellen-Map, Update-Frequenzen, Abhängigkeiten (Übergabedokument, versioniert)
2. **Daten-Connector-Setup** — Anbindung von bis zu 6 Quell-Systemen (APIs, Webhooks, DB-Abfragen, Zapier/Make-Brücken)
3. **Zentrales Data-Warehouse-Layer** — strukturierte, bereinigte Datenbasis (Airtable Enterprise, Supabase oder BigQuery je nach Tier)
4. **Live-KPI-HUD** — angepasstes Dashboard (Looker Studio, Retool oder Custom Web-App je nach Tier) mit Auto-Refresh-Intervall ≤ 15 Minuten
5. **5-10 Custom KPI-Cards** — definiert aus Customer-Input, mit Drill-Down-Logik und Zeitreihenvergleich (WoW, MoM, YoY)
6. **Alert-System** — automatische Benachrichtigungen bei KPI-Schwellenwert-Überschreitungen (Slack / E-Mail / SMS)
7. **Rollen-basierte Views** — mind. 2 Dashboard-Ebenen (Executive-View + Ops-Detail-View)
8. **Monitoring-Dokumentation** — Fehlerbehandlung, was passiert wenn eine API offline ist, Fallback-Verhalten
9. **Training-Session (60 Min)** — live Walkthrough + aufgezeichnet
10. **30-Tage Post-Launch-Support** — Bug-Fixes und Connector-Anpassungen im vereinbarten Scope

---

## Mehrwert (konkret)

### Vorher / Nachher

| Dimension | Vorher | Nachher | Schätzwert |
|---|---|---|---|
| Reporting-Zeit | 3-8h/Woche manuelles Daten-Zusammensuchen | Echtzeit, keine manuelle Arbeit | **-4-6h/Woche** |
| Reaktionszeit auf KPI-Abweichungen | 2-7 Tage bis jemand das Problem sieht | 15 Minuten bis Alert greift | **-80-95% Reaktionslatenz** |
| Entscheidungsqualität | Bauchgefühl + veraltete Reports | Faktenbasiert, tagesaktuell | **messbar weniger Fehlentscheidungen** |
| Agentur: Client-Reporting | 2-4h/Woche pro Client-Report | Automated Snapshots / Live-Links | **€500-1.500/Mo Opportunitätskosten gespart** |
| FI: Management-Meeting-Vorbereitung | 4-6h/Woche für Folien und Export | Dashboard-Link, keine Vorbereitung | **-4h/Woche Führungszeit** |

> Revenue-Lift-Schätzung: Nicht direkt quantifizierbar. Indirekt durch schnellere Kurs-Korrekturen in Sales-Pipeline und Kampagnen realistisch +10-25% auf bestehende Conversion-Rates über 6 Monate. Keine Garantie.

---

## Pricing-Logic

| | **Tier M** | **Tier L** |
|---|---|---|
| **Zielgruppe** | AG klein, PB, FI bis 25 MA | AG mittel-groß, FI 25-100 MA |
| **Setup** | €8.000 – €14.000 | €18.000 – €35.000 |
| **Monthly Retainer** | €1.800 – €2.500 | €3.000 – €4.500 |
| **Datenquellen** | bis 6 Quellen | bis 15 Quellen |
| **KPI-Cards** | 5-10 | 15-30 |
| **Dashboard-Tool** | Looker Studio / Airtable-Dashboard | Retool / Custom React-App |
| **Data-Warehouse** | Airtable Enterprise oder Sheets+Sync | Supabase / BigQuery |
| **Rollen-Views** | 2 (Exec + Ops) | bis 5 (per Abteilung/Funktion) |
| **Alert-Kanäle** | Slack + E-Mail | Slack + E-Mail + SMS + PagerDuty |
| **Implementation** | 4-6 Wochen | 8-12 Wochen |
| **Retainer-Inhalt** | Connector-Maintenance, 2 KPI-Änderungen/Mo, Monitoring | Alles M + neue Quellen, Reporting-Layer-Evolution, QBR-Call |

> Retainer ist kein Nice-to-Have: APIs brechen, Felder ändern sich, Kunden wollen neue Metriken. Ohne Retainer wird das HUD innerhalb von 3-6 Monaten unzuverlässig.

---

## Timeline

| Phase | Zeitraum | Inhalt |
|---|---|---|
| **Discovery & Architecture** | Woche 1-2 | Datenquellen-Audit, KPI-Definition-Workshop, Architektur-Entscheidung |
| **Connector-Build** | Woche 2-4 (M) / 2-6 (L) | API-Anbindungen, Webhook-Setup, Datenpipeline aufbauen |
| **Dashboard-Build** | Woche 4-5 (M) / 6-9 (L) | Layout, KPI-Cards, Drill-Downs, Views |
| **Alert-System + Testing** | Woche 5-6 (M) / 9-11 (L) | Schwellenwerte definieren, Edge-Cases testen, Fehlertoleranz prüfen |
| **Handover & Training** | Woche 6 (M) / 11-12 (L) | Dokumentation, Training-Session, 30-Tage-Support-Start |

---

## Voraussetzungen Customer

- Klare Benennung von 1 internen Ansprechpartner mit Entscheidungsbefugnis für KPI-Definitionen
- Zugang (API-Keys / Login-Credentials) zu allen Quell-Systemen innerhalb von 5 Werktagen nach Kick-off
- Definierte Liste der Top-10 KPIs die sichtbar sein müssen — AEVUM moderiert den Workshop, Customer muss aber Input liefern
- Aktives Tool-Stack-Abo für alle Datenquellen (AEVUM kauft keine Lizenzen für Customer)
- Bei Tier L: IT-Kontakt der technische Datenbankzugriffe freigeben kann (falls on-premise Datenquellen)

---

## Nicht-Ziele (Out-of-Scope)

1. **Kein Business-Intelligence-Layer** — keine OLAP-Würfel, keine Ad-hoc-SQL-Abfragen, keine Prognose-Modelle oder Forecasting-Algorithmen
2. **Kein Data-Cleaning-Projekt** — wenn Quelldaten strukturell kaputt sind (Duplikate, falsche Formate seit Jahren) ist das ein separates Engagement
3. **Kein Custom ERP/CRM-Bau** — das HUD konsumiert Daten, baut sie nicht
4. **Keine Marketing-Attribution-Modellierung** — Multi-Touch-Attribution oder probabilistische Modelle sind kein Bestandteil
5. **Keine Compliance/DSGVO-Beratung** — Customer ist selbst verantwortlich für Datenschutz-Konformität der Datenquellen
6. **Kein Onboarding des Customer-Teams** — Training für 1-2 Admins inklusive, nicht für gesamte Belegschaft
7. **Keine unbegrenzte Quellen-Erweiterung im Setup** — über vereinbarte Anzahl hinaus: Change Request

---

## Upsell-Pfade

| Trigger | Next Service |
|---|---|
| Customer fragt: "Können wir auch automatisch auf KPI-Abweichungen reagieren?" | **Business-OS** oder **Sales-OS** — Automation-Layer auf Basis des HUDs |
| HUD zeigt: Sales-Pipeline-Daten sind lückenhaft, kein sauberes CRM | **Website-CRM** oder **Sales-OS** |
| Customer will mehr aus den Daten herausholen, Trend-Analyse fehlt | **Database-System** (Multi-Source Data-Pipeline + Reporting-Layer) |
| Lead-Daten fehlen gänzlich im HUD, Outbound ist manuell | **AI-Lead-Engine** |
| Customer sieht im HUD: Content-Performance fehlt komplett | **Content-Engine** |
| HUD ist live aber Customer hat keine Automation-Strategie | **Automation-Audit** (Einstieg niedrigschwellig) |

---

## Conversion-Story

Es ist Montagmorgen, 8:47 Uhr. Der Geschäftsführer einer 20-Personen-Agentur öffnet seinen Laptop. Bevor er eine einzige strategische Entscheidung treffen kann, verbringt er die nächste Stunde damit, Zahlen aus Ads Manager, aus dem Projektmanagement-Tool, aus der Buchhaltung und aus drei Slack-Channels zusammenzusuchen. Dann tippt er alles in eine Tabelle, schätzt wo Daten fehlen, und schreibt ein Meeting-Summary das schon veraltet ist bevor es versendet wird. Das ist kein Einzelfall — das ist Routine. Und diese Routine kostet seine Agentur pro Woche mindestens einen vollen Arbeitstag an Führungszeit.

Das HUD Command Center löst genau dieses Problem — nicht durch ein weiteres Tool das manuell gepflegt werden muss, sondern durch eine lebendige, sich selbst aktualisierende Schaltzentrale. Alle relevanten Datenquellen werden einmalig verbunden, strukturiert und in einem Dashboard konsolidiert das immer aktuell ist. Wenn ein Kampagnen-ROAS unter Schwellenwert fällt, kommt die Benachrichtigung in Slack — nicht beim nächsten Reporting-Meeting. Wenn ein Projekt im Rückstand ist, ist das sichtbar bevor der Client danach fragt. Sichtbarkeit schlägt Intuition.

Das Ergebnis nach sechs Wochen: Kein wöchentliches Reporting-Ritual mehr. Kein Daten-Sammeln vor Meetings. Kein "ich glaube der Umsatz war letzten Monat gut" — sondern exakte Zahlen, auf Knopfdruck, für jeden im Team der Zugang braucht. Der ROI rechnet sich nicht nur in Zeit: Schnellere Entscheidungen auf Basis echter Daten bedeuten weniger verschwendetes Budget, frühere Kurs-Korrekturen und ein Führungsteam das wieder strategisch denkt statt operativ zu feuerwehren.