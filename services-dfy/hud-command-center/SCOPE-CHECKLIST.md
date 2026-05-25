# HUD Command Center — Scope-Checklist (Intern / Sales-Calls)

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