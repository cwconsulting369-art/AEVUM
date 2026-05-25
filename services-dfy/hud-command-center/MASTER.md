---
title: AEVUM DFY — hud-command-center
date: 2026-05-25
---

# AEVUM Done-for-You — hud-command-center

> Generated 2026-05-25. Combined Master-Doc.

---

# 1. Sales-Brief


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
\newpage

# 2. Scope-Checklist


## In-Scope

| Kategorie | Item | Aufwand-Estimate |
|---|---|---|
| **Discovery** | KPI-Definition-Workshop (moderiert, 90 Min.) | 2h inkl. Vor-/Nachbereitung |
| **Discovery** | Datenquellen-Audit (Verfügbarkeit, API-Limits, Auth-Methoden) | 3-5h |
| **Discovery** | Architektur-Dokument (Datenfluss-Diagramm, Update-Frequenzen) | 3h |
| **Connector-Build** | API-Anbindung je Quelle (REST/GraphQL) | 3-6h pro Quelle |
| **Connector-Build** | Webhook-Setup (wo API nicht verfügbar) | 2-4h pro Webhook |
| **Connector-Build** | Make/Zapier-Brücke (wo kein direkter API-Zugang) | 2-3h pro Flow |
| **Data-Layer** | Daten-Normalisierung + Schema-Design | 4-8h |
| **Data-Layer** | Tier M: Airtable Enterprise / Sheets-Sync-Layer Setup | 4-6h |
| **Data-Layer** | Tier L: Supabase- oder BigQuery-Setup + Schema | 8-15h |
| **Dashboard-Build** | KPI-Card-Design + Implementation (je Card) | 1-2h pro Card |
| **Dashboard-Build** | Drill-Down-Logik (Zeitreihen, Filter) | 4-6h |
| **Dashboard-Build** | Rollen-Views (2 Views Tier M, bis 5 Views Tier L) | 3-5h pro View |
| **Dashboard-Build** | Tier M: Looker Studio Deployment | 6-10h |
| **Dashboard-Build** | Tier L: Retool- oder Custom React-App Deployment | 20-40h |
| **Alert-System** | Schwellenwert-Definition (Workshop, 45 Min.) | 1h |
| **Alert-System** | Slack + E-Mail Alerts Setup | 3-5h |
| **Alert-System** | Tier L: SMS + PagerDuty-Integration | 3-5h zusätzlich |
| **Testing** | End-to-End-Datenfluss-Test pro Quelle | 1-2h pro Quelle |
| **Testing** | Edge-Case-Tests (API offline, leere Felder, Rate-Limits) | 4-6h |
| **Testing** | User-Acceptance-Test mit Customer | 2h (Customer-Zeit) |
| **Handover** | Architektur-Dokumentation (finalisiert) | 2h |
| **Handover** | Fehlerbehandlungs-Playbook (was tun wenn X kaputt ist) | 2h |
| **Handover** | Training-Session (60 Min., aufgezeichnet) | 2h inkl. Recording-Setup |
| **Retainer** | Connector-Maintenance (API-Brüche, Felder-Änderungen) | bis 4h/Mo Tier M / bis 8h/Mo Tier L |
| **Retainer** | KPI-Anpassungen (Tier M: 2/Mo, Tier L: 5/Mo) | 1-2h pro Änderung |
| **Retainer** | Monitoring + Alert-Review | laufend, ca. 2h/Mo |

---

## Out-of-Scope

| Item | Begründung / Kommentar |
|---|---|
| Datenbereinigung historischer Quelldaten | Separates Engagement. Wenn Daten seit Jahren kaputt sind, kostet das Wochen. |
| Forecasting / Predictive Analytics / ML-Modelle | Anderes Skill-Set, anderes Pricing. Nicht Teil eines HUDs. |
| Custom ERP, CRM, Buchhaltungs-Software bauen | Das HUD liest Daten — es produziert keine. |
| Multi-Touch-Attribution-Modellierung | Eigenes Projekt, komplex, rechtlich heikel. |
| DSGVO-Compliance-Beratung | Customer-Verantwortung. Wir implementieren was Customer freigibt. |
| Mehr Datenquellen als vereinbart (ohne Change Request) | Jede zusätzliche Quelle = neues Scoping, neues Pricing. |
| Team-weites Training (>2 Admins) | Training-Session = 1-2 Personen. Mehr = Add-on. |
| Dashboard-Übersetzungen (mehrere Sprachen) | Auf Anfrage als Add-on. |
| White-Label-Dashboard für Customer's Clients | Separates Engagement, andere Haftungs-Logik. |
| Infrastruktur-Kosten (API-Subscriptions, DB-Hosting) | Customer trägt eigene Tool-Kosten. AEVUM baut, nicht betreibt auf eigene Kosten. |

---

## Voraussetzungen Customer-Side

| Bereich | Konkrete Anforderung | Timing |
|---|---|---|
| **Zugang** | API-Keys / OAuth-Zugang für alle Quell-Systeme | Bis 5 Werktage nach Kick-off |
| **Zugang** | Admin-Zugang zum Ziel-Dashboard-Tool (Looker Studio / Retool) | Bis Kick-off |
| **Zugang** | Tier L: DB-Zugang oder IT-Ansprechpartner für on-premise Quellen | Bis Woche 2 |
| **Tools** | Aktive Abos aller Quell-Systeme (AEVUM kauft keine Lizenzen) | Vor Kick-off bestätigt |
| **Daten** | KPI-Liste (Top 10-15) vorab schriftlich — AEVUM moderiert, Customer muss Input haben | Workshop Woche 1 |
| **Personal** | 1 fester interner Ansprechpartner mit Entscheidungsbefugnis | Durchgängig |
| **Zeit** | Customer-Availability für Kick-off (90 Min.), UAT (2h), Training (60 Min.) | Terminbestätigung vor Start |
| **Datenqualität** | Quelldaten müssen grundlegend strukturiert vorliegen (kein komplett ungepflegtes Chaos) | Audit in Woche 1 klärt das |

---

## Quality-Standards

AEVUM sagt "Done" wenn folgende Standards erfüllt sind:

| Standard | Messkriterium |
|---|---|
| Alle vereinbarten Datenquellen liefern Daten ins HUD | Nachweis: Live-Screenshot + Timestamp, kein manueller Import |
| Auto-Refresh läuft zuverlässig | ≤ 15 Min. Datenverzögerung unter Normalbetrieb, dokumentiert |
| Alle definierten KPI-Cards zeigen korrekte Werte | Gegencheck mit Rohdaten aus Quell-System, Abweichung ≤ 1% |
| Alert-System reagiert auf Schwellenwerte | Testlauf dokumentiert: Alert ausgelöst in ≤ 5 Min. nach Trigger |
| Mind. 2 Rollen-Views (Tier M) / bis 5 (Tier L) live und zugänglich | User-Login-Test mit Customer-Account |
| Architektur-Doku vorhanden und aktuell | Dokument versioniert, Datenfluss erklärt, Quellen benannt |
| Fehlerbehandlungs-Playbook existiert | Dokument übergeben, mind. Top-3-Fehlerszenarien abgedeckt |
| Training abgehalten und aufgezeichnet | Recording-Link vorhanden, Customer bestätigt Empfang |
| Customer-UAT abgenommen | Schriftliche Sign-Off-Bestätigung per E-Mail |
| 30-Tage-Support gestartet | Ticket-Kanal aktiv, Reaktionszeit-SLA kommuniziert |

---

## Change-Request-Policy

| Situation | Vorgehen |
|---|---|
| Customer möchte zusätzliche Datenquelle (über vereinbarte Anzahl) | Change Request: Scoping-Call → Angebot (typisch €500-1.500 pro Quelle) → Approval → Build |
| Customer möchte neue KPI-Card jenseits Retainer-Kontingent | Tier M: ab 3. Card/Mo CR → €150-300/Card; Tier L: ab 6. Card/Mo → €150-300/Card |
| Grundlegendes Dashboard-Layout soll geändert werden | CR: Scoping → Angebot → Approval. Kein "mal eben umbauen". |
| Datenquelle war im Scope aber API existiert nicht wie erwartet | Internes Risiko — AEVUM trägt Mehraufwand bis 30% über Estimate; darüber hinaus gemeinsame Lösung |
| Customer-seitige Zugangsprobleme verzögern Build | Timeline verschiebt sich um Verzögerungs-Zeitraum, kein Preisnachlass |
| Scope-Freeze-Zeitpunkt | Nach abgeschlossenem Architecture-Dokument (Ende Woche 2) — danach nur noch per CR |

---

## Pricing-Variations

| Situation / Add-on | Preisauswirkung |
|---|---|
| Jede zusätzliche Datenquelle über Paket hinaus | +€800 – €1.500 pro Quelle (einmalig Setup) |
| Tier-Upgrade: Looker Studio → Retool | +€4.000 – €8.000 Setup |
| Tier-Upgrade: Airtable-Layer → Supabase/BigQuery | +€3.000 – €6.000 Setup |
| White-Label-Dashboard (für Customer's Clients) | +€5.000 – €12.000 Setup, Retainer erhöht sich um €500-1.000/Mo |
| SMS + PagerDuty-Alerts (wenn nicht in Tier L) | +€500 Setup, +€100/Mo Retainer |
| Team-Training (über 2 Admins hinaus, je 5 Personen) | +€500 pro Session |
| Dritte Rollen-View (bei Tier M) | +€800-1.200 einmalig |
| Historische Daten-Migration (>12 Monate Backfill) | +€1.500 – €4.000 je nach Volumen und Quell-Qualität |
| Dediziertes Monitoring-Dashboard für AEVUM-Retainer-Oversight | Inklusive ab Tier L; Tier M +€300/Mo |
\newpage

# 3. Delivery-Plan


## Phasen

### Phase 1: Discovery & Architecture (Woche 1-2)

**Ziel:** Vollständiges Verständnis der Datenlandschaft, KPI-Prioritäten geklärt, Architektur entschieden.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| Kick-off Call (90 Min.) | Founder / CS | Ja — KPI-Ideen, Tool-Stack vorstellen |
| Datenquellen-Audit (API-Verfügbarkeit, Rate-Limits, Auth) | Eng | API-Keys/Credentials liefern |
| KPI-Definition-Workshop (moderiert, 90 Min.) | Founder / CS | Ja — Top-KPIs benennen, Prioritäten setzen |
| Architektur-Dokument v1 (Datenfluss, Update-Frequenzen, Tool-Entscheidung) | Eng + Founder | Architektur-Approval |
| Scope-Freeze-Bestätigung (schriftlich) | CS | Schriftliche Bestätigung |

**Customer-Touchpoint:** Kick-off Call + KPI-Workshop (2 separate Calls oder kombiniert)

---

### Phase 2: Connector-Build (Woche 2-4 / Tier L: 2-6)

**Ziel:** Alle vereinbarten Datenquellen liefern sauber und zuverlässig in den Data-Layer.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| API-Connector je Quelle (REST/GraphQL/Webhook/Make) | Eng | Keiner — sofern Credentials vorhanden |
| Data-Schema-Design + Normalisierung | Eng | Bestätigung Schema entspricht KPI-Logik |
| Data-Layer-Setup (Airtable/Supabase/BigQuery je Tier) | Eng | — |
| Interner Connector-Test (alle Quellen, Datenfluss geprüft) | Eng | — |
| Wöchentlicher Status-Update | CS | 15-Min-Check-in |

**Customer-Touchpoint:** Wöchentlicher Sync (15 Min.) + Schriftlicher Status-Bericht

---

### Phase 3: Dashboard-Build (Woche 4-5 / Tier L: 6-9)

**Ziel:** Vollständiges HUD live, alle KPI-Cards gebaut, Rollen-Views konfiguriert.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| Dashboard-Layout-Entwurf (Wireframe / Mockup) | Eng + Founder | Feedback innerhalb 48h |
| KPI-Card-Build (je Card) | Eng | — |
| Drill-Down-Logik (Zeitreihen, WoW/MoM/YoY-Vergleich) | Eng | — |
| Rollen-Views (Exec-View + Ops-View, weitere bei Tier L) | Eng | View-Anforderungen bestätigt in Phase 1 |
| Staging-Review intern | Eng + Founder | — |
| Customer-Preview (informell, 30 Min.) | CS | Feedback, keine formale Abnahme |

**Customer-Touchpoint:** Dashboard-Preview-Call (30 Min.)

---

### Phase 4: Alert-System + Testing (Woche 5-6 / Tier L: 9-11)

**Ziel:** Alert-System live, alle Datenflüsse getestet, Edge-Cases dokumentiert.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| Schwellenwert-Definition-Session (45 Min.) | CS | Ja — Customer definiert kritische Grenzwerte |
| Slack + E-Mail Alert-Setup | Eng | Slack-Workspace-Zugang |
| Tier L: SMS + PagerDuty Setup | Eng | Telefonnummern / PagerDuty-Account |
| End-to-End-Test je Datenquelle | Eng | — |
| Edge-Case-Tests (API offline, Rate-Limit, leere Felder) | Eng | — |
| Alert-Test-Dokumentation | Eng | — |
| User-Acceptance-Test (UAT) mit Customer | CS + Customer | 2h Customer-Zeit, Testprotokoll ausfüllen |
| UAT-Sign-Off | Customer | Schriftliche Bestätigung per E-Mail |

**Customer-Touchpoint:** Schwellenwert-Session + UAT (2 separate Calls)

---

### Phase 5: Handover & Go-Live (Woche 6 / Tier L: 11-12)

**Ziel:** Customer kann selbstständig arbeiten, alle Unterlagen übergeben, 30-Tage-Support startet.

| Deliverable | Owner | Customer-Input erforderlich |
|---|---|---|
| Architektur-Dokumentation (final, versioniert) | Eng | — |
| Fehlerbehandlungs-Playbook | Eng | — |
| Dashboard-Access übergeben (alle Rollen) | CS | User-Accounts angelegt |
| Training-Session (60 Min., live + recorded) | CS + Founder | 1-2 Admin-Personen teilnehmen |
| Recording-Link gesendet | CS | — |
| 30-Tage-Support-Kanal aktiviert (Slack-Channel oder Ticketing) | CS | — |
| Retainer-SLA kommuniziert | CS | Bestätigung |

**Customer-Touchpoint:** Training-Session + Handover-Call

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Retainer |
|---|---|---|---|---|---|---|
| **Founder** | Lead: Discovery, Architektur-Entscheidung, KPI-Workshop | Review | Review Wireframes | UAT-Oversight | Training-Session | QBR (Tier L) |
| **Engineer** | Datenquellen-Audit | Lead: alle Connector-Builds, Data-Layer | Lead: Dashboard-Build | Lead: Alert-System, Testing | Finaldoku, Access-Setup | Connector-Maintenance, Monitoring |
| **Customer-Success** | Kick-off, Erwartungs-Management | Wöchentliche Syncs | Customer-Preview | UAT-Koordination, Schwellenwert-Session | Handover, Training-Koordination | Retainer-Kommunikation, Ticket-Routing |

> Bei kleinen Teams: Founder übernimmt CS-Rolle in Phase 1-2, ab Phase 3 dedizierter CS wenn verfügbar.

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Zeitpunkt | Format | Dauer | Owner |
|---|---|---|---|---|
| **Kick-off Call** | Woche 1 Tag 1-2 | Video-Call | 90 Min. | Founder + CS |
| **KPI-Definition-Workshop** | Woche 1 (ggf. kombiniert mit Kick-off) | Video-Call moderiert | 90 Min. | Founder |
| **Wöchentlicher Sync** | Woche 2-5 / Woche 2-10 (Tier L) | Video-Call | 15-30 Min. | CS |
| **Dashboard-Preview** | Ende Phase 3 | Video-Call / Loom | 30 Min. | CS |
| **Schwellenwert-Session** | Start Phase 4 | Video-Call | 45 Min. | CS |
| **UAT-Session** | Ende Phase 4 | Video-Call + Screenshare | 2h | CS + Customer |
| **Handover + Training** | Phase 5 | Video-Call, aufgezeichnet | 60-90 Min. | CS + Founder |
| **30-Tage Check-in** | 30 Tage nach Go-Live | Video-Call oder async | 30 Min. | CS |
| **QBR (Tier L only)** | Quartal 1 nach Go-Live | Video-Call | 60 Min. | Founder + CS |

---

## Risk-Register

| # | Risk | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Datenquelle hat keine brauchbare API (oder API ist hinter Enterprise-Paywall) | Mittel | Hoch | Audit in Phase 1 deckt das auf. Alternative: Webhook oder Make-Brücke. Falls unmöglich: Quelle aus Scope, Preis-Anpassung. Scope-Freeze schützt. |
| **R2** | Customer liefert Credentials zu spät / hat keinen Admin-Zugang | Hoch | Mittel | Voraussetzungen schriftlich kommuniziert vor Vertragsstart. Timeline-Verschiebung liegt bei Customer, kein Preisnachlass. |
| **R3** | KPI-Definitionen ändern sich nach Scope-Freeze wiederholt | Mittel | Mittel | Scope-Freeze-Dokument als Vertragsbestandteil. Änderungen = Change Request. CR-Policy in Kick-off kommunizieren. |
| **R4** | Quelldaten sind qualitativ so schlecht (Duplikate, fehlende IDs) dass Dashboard-Werte unbrauchbar sind | Niedrig-Mittel | Hoch | Datenquellen-Audit in Phase 1 identifiziert das. Bei kritischen Problemen: Data-Cleaning als separates Engagement anbieten, HUD-Start verschieben bis Basis stimmt. |
| **R5** | Customer hat nach Go-Live hohes Anpassungsvolumen das Retainer-Kontingent sprengt | Mittel | Niedrig-Mittel | Klare Retainer-Kontingent-Kommunikation in Handover. CR-Policy aktiv. Ehrliches Erwartungs-Management: HUD braucht 2-3 Wochen Einlaufzeit bis Customer weiß was er wirklich will. |

---

## Quality-Gates

| Gate | Zeitpunkt | Kriterium | Freigabe durch |
|---|---|---|---|
| **QG-1: Architecture Approved** | Ende Phase 1 | Architektur-Dokument v1 fertig, Customer hat schriftlich bestätigt, Scope-Freeze unterschrieben | Founder |
| **QG-2: All Connectors Live** | Ende Phase 2 | Alle Datenquellen liefern Daten in Data-Layer, interner Test bestanden, Datenfluss-Diagramm aktuell | Eng |
| **QG-3: Dashboard Staging-Ready** | Ende Phase 3 | Alle KPI-Cards gebaut, Werte mit Rohdaten gegengeprüft (≤1% Abweichung), Rollen-Views zugänglich | Eng + Founder |
| **QG-4: Alerts + UAT Passed** | Ende Phase 4 | Alert-Test dokumentiert, Customer-UAT schriftlich abgenommen, Edge-Case-Protokoll vorhanden | CS + Customer |
| **QG-5: Handover Complete** | Ende Phase 5 | Alle Docs übergeben, Recording vorhanden, Support-Kanal aktiv, Customer-Confirmation erhalten | CS |

---

## Handover-Package

| Asset | Format | Übergabe-Weg |
|---|---|---|
| Dashboard-Access (alle Rollen) | Live-URL + User-Accounts | Direkt im Call, schriftlich per E-Mail bestätigt |
| Architektur-Dokumentation (final) | Markdown / Notion-Page | Shared Workspace oder PDF |
| Datenfluss-Diagramm | PDF / Figma-Export | Als Anhang + in Doku verlinkt |
| Fehlerbehandlungs-Playbook | Markdown / Notion-Page | Shared Workspace oder PDF |
| Connector-Übersicht (alle Quellen + Auth-Methoden + Update-Frequenz) | Tabelle in Doku | In Architektur-Doku integriert |
| Training-Recording | Video-Link (Loom / Google Drive) | Per E-Mail + in Shared Workspace |
| Schwellenwert-Tabelle (Alert-Definitionen) | Tabelle | In Architektur-Doku + separates Sheet |
| Change-Request-Formular | Vorlage | Per E-Mail, Erklärung in Training |
| Support-Kanal-Zugang | Slack-Channel oder Ticket-System-Link | In Handover-Call aktiviert |
| Retainer-SLA-Dokument | PDF | Per E-Mail bei Vertragsstart Retainer |
\newpage

# 4. Quality-Gate


## Asset-Inventory

| # | Asset | Format | Status | Ablageort |
|---|---|---|---|---|
| 1 | Architektur-Dokumentation (final, versioniert) | Markdown / Notion | ☐ | `/projects/{customer-id}/docs/architecture-v[n].md` |
| 2 | Datenfluss-Diagramm | PDF / Figma | ☐ | `/projects/{customer-id}/docs/dataflow-diagram.pdf` |
| 3 | Connector-Übersicht (Quellen, Auth, Frequenz) | Tabelle in Doku | ☐ | In architecture doc integriert |
| 4 | Data-Schema-Dokument (Feld-Definitionen, Typen) | Markdown / Sheet | ☐ | `/projects/{customer-id}/docs/schema.md` |
| 5 | Dashboard (Live-Deployment) | URL | ☐ | In Handover-E-Mail dokumentiert |
| 6 | Dashboard-Access-Übersicht (User/Rolle/Permissions) | Tabelle | ☐ | `/projects/{customer-id}/access-log.md` |
| 7 | Alert-Definitionen + Schwellenwert-Tabelle | Tabelle | ☐ | `/projects/{customer-id}/docs/alerts.md` |
| 8 | Fehlerbehandlungs-Playbook | Markdown | ☐ | `/projects/{customer-id}/docs/error-playbook.md` |
| 9 | Training-Recording | Video-Link | ☐ | `/projects/{customer-id}/handover/training-recording.url` |
| 10 | Connector-Test-Protokoll (je Quelle) | Tabelle / Doc | ☐ | `/projects/{customer-id}/qa/connector-tests.md` |
| 11 | UAT-Protokoll + Customer Sign-Off (E-Mail) | E-Mail-Screenshot / PDF | ☐ | `/projects/{customer-id}/qa/uat-signoff.pdf` |
| 12 | Edge-Case-Test-Protokoll | Markdown | ☐ | `/projects/{customer-id}/qa/edge-case-tests.md` |
| 13 | Change-Request-Formular-Vorlage | Markdown / PDF | ☐ | `/projects/{customer-id}/handover/cr-template.md` |
| 14 | Retainer-SLA-Dokument | PDF | ☐ | `/projects/{customer-id}/handover/retainer-sla.pdf` |
| 15 | 30-Tage-Support-Kanal (aktiv) | Slack-Channel / Ticket-Link | ☐ | In Handover-E-Mail dokumentiert |

---

## Sign-Off-Kriterien

| # | Kriterium | Prüfmethode | Status |
|---|---|---|---|
| 1 | Alle vereinbarten Datenquellen liefern Daten live ins HUD, kein manueller Import | Live-Screenshot mit Timestamp, Gegencheck mit Quell-System | ☐ |
| 2 | Auto-Refresh läuft: Datenverzögerung ≤ 15 Min. unter Normalbetrieb | Timed Test dokumentiert (3x zu verschiedenen Zeitpunkten) | ☐ |
| 3 | Alle KPI-Card-Werte korrekt: Abweichung ≤ 1% vs. Rohdaten im Quell-System | Gegencheck-Tabelle ausgefüllt je Card | ☐ |
| 4 | Alert-System löst innerhalb ≤ 5 Min. nach Trigger aus | Testlauf dokumentiert mit Timestamp Trigger / Timestamp Alert-Empfang | ☐ |
| 5 | Mind. 2 Rollen-Views (Tier M) / vereinbarte Anzahl (Tier L) live und mit korrekten Permissions | Login-Test mit Customer-Accounts beider Rollen, Screenshot | ☐ |
| 6 | Edge-Cases dokumentiert und Dashboard verhält sich definiert bei API-Ausfall | Test: API-Verbindung getrennt → Dashboard zeigt "Last Updated"-Timestamp + kein Crash | ☐ |
| 7 | Architektur-Dokument final, aktuell, alle Quellen und Frequenzen korrekt beschrieben | Founder-Review bestätigt | ☐ |
| 8 | Fehlerbehandlungs-Playbook deckt Top-3-Szenarien ab | CS-Review: Playbook lesbar und umsetzbar für nicht-technischen Customer | ☐ |
| 9 | Training abgehalten, Recording-Link an Customer gesendet und bestätigt | E-Mail-Bestätigung Customer vorhanden | ☐ |
| 10 | Customer-UAT schriftlich abgenommen, Support-Kanal aktiv, Retainer-SLA kommuniziert | UAT-Sign-Off-E-Mail in QA-Ordner, Slack-Kanal/Ticket-System überprüft | ☐ |

**Alle 10 Punkte müssen ✅ sein vor DB-Update und Retainer-Start-Bestätigung.**

---

## Known-Limitations (Phase-2-Items)

Diese Items sind bewusst nicht in diesem Engagement enthalten. Sie sind dokumentiert damit kein falsches Erwartungsmanagement entsteht und für spätere Upsell-Gespräche genutzt werden können:

| Limitation | Kontext | Potentieller Phase-2-Pfad |
|---|---|---|
| Kein Forecasting / Predictive Layer | HUD zeigt historische + aktuelle Daten. Keine ML-Prognosen. | Database-System-Erweiterung oder dediziertes ML-Engagement |
| Kein Automation-Response-Layer | HUD triggert Alerts, handelt aber nicht selbst (kein "wenn KPI X → automatisch Aktion Y") | Business-OS oder Sales-OS als Automation-Layer drüber |
| Historische Daten nur soweit API hergibt | Backfill über API-Limits hinaus wurde nicht implementiert (außer explizit beauftragt) | Data-Migration-Add-on, separat zu beauftragen |
| Keine White-Label-Fähigkeit | Dashboard ist für Customer intern, nicht für Weitergabe an deren Clients gebaut | Separates White-Label-Engagement |
| Qualität der Daten abhängig von Quell-Systemen | Wenn Quelldaten sich verschlechtern (fehlende Pflege im CRM etc.) verschlechtert sich HUD-Qualität | Regelmäßige Datenqualitäts-Reviews im Retainer; ggf. Database-System-Engagement |
| Kein natürlichsprachlicher Query-Layer | Man kann nicht "Zeig mir alle Kunden die letzten Monat über 10k ausgegeben haben" reintippen | Future: AI-Query-Layer als Add-on |

---

## DB-Update-Befehl

```sql
-- HUD Command Center Delivery Sign-Off
-- Ausführen NUR wenn alle 10 Sign-Off-Kriterien ✅

UPDATE aevum_projects
SET
  status                  = 'delivered',
  delivery_completed_at   = NOW(),
  phase                   = 'retainer',
  retainer_start_date     = CURRENT_DATE,
  handover_package_url    = '/projects/{customer-id}/handover/',
  known_limitations_noted = TRUE,
  updated_at              = NOW()
WHERE
  project_slug  = 'hud-command-center'
  AND customer_id = '{customer-id}'; -- Ersetzen vor Ausführung

-- Retainer-Record anlegen
INSERT INTO aevum_retainers (
  project_id,
  customer_id,
  service_slug,
  tier,                    -- 'M' oder 'L'
  monthly_fee,             -- z.B. 2200 (Tier M) oder 3800 (Tier L)
  included_changes_per_mo, -- 2 (Tier M) oder 5 (Tier L)
  start_date,
  next_review_date,
  status
)
VALUES (
  (SELECT id FROM aevum_projects WHERE project_slug = 'hud-command-center' AND customer_id = '{customer-id}'),
  '{customer-id}',
  'hud-command-center',
  '{tier}',
  {monthly_fee},
  {included_changes},
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days', -- erster Check-in
  'active'
);
```

---

## Pattern-Notes für DFY-Builder-Pattern

**Service-Charakter:** Daten-Aggregation + Visualisierung. Kein Logic-Building, kein Automation-Bau. Das HUD ist passiv — es zeigt, handelt nicht.

**Kritischste Phase:** Phase 2 (Connector-Build). Hier entstehen 70% der unerwarteten Aufwände. API-Dokumentation lügt, Rate-Limits sind undokumentiert, Auth-Flows ändern sich. Buffer einplanen.

**Häufigstes Scope-Creep-Muster:** Customer sieht das fertige Dashboard und will sofort 3 neue Quellen dazuhaben die "eigentlich eh logisch wären". Scope-Freeze-Disziplin ist nicht optional. CR-Policy muss im Kick-off explizit besprochen werden, nicht nur im Vertrag stehen.

**Differenzierung zu command-center-dashboard (ähnlicher Slug):** HUD-Command-Center = Real-Time-Focus mit Live-Streams und Alert-System. Cross-Tool-Visibility ist das Ziel von command-center-dashboard aber der Echtzeit-Aspekt und das Alert-System sind das differenzierende Merkmal dieses Slugs. Im Sales-Gespräch: "Wie schnell merkt ihr aktuell wenn eine wichtige Metrik aus dem Ruder läuft?"

**Retainer-Risiko:** Technisch gesehen das stabilste DFY-Offering wenn Phase 1-2 sauber sind. Connector-Maintenance ist berechenbar. Höchstes Churn-Risiko: Customer denkt nach 3 Monaten "das läuft ja alleine, warum zahle ich noch?" — proaktiv mit Retainer-Wert-Kommunikation entgegenwirken (monatlicher "was haben wir gemacht" Summary).

**Upsell-Timing:** 60-90 Tage nach Go-Live. Customer hat dann genug Daten gesehen um zu wissen was er nicht nur sehen, sondern auch automatisch anstoßen will. Dann ist der Boden für Business-OS oder Sales-OS bereitet.