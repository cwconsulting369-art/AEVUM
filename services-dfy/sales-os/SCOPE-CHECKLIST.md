# Sales-OS — Scope-Checklist (Intern / Sales-Calls)

> Dieses Dokument ist für AEVUM-interne Sales-Gespräche. Vor jedem Deal-Close durcharbeiten und Customer-Erwartungen explizit abgleichen.

---

## In-Scope

| Kategorie | Item | Aufwand-Estimate |
|---|---|---|
| **Discovery** | Sales-Prozess-Interview (1-2 Calls à 60 Min) | 2-4h |
| **Discovery** | Bestehende CRM-Struktur auditieren + dokumentieren | 3-6h |
| **Discovery** | Scoring-Kriterien-Workshop mit Customer | 2-3h |
| **CRM-Setup** | Pipeline-Stage-Konfiguration (max. 7 Stages) | 4-6h |
| **CRM-Setup** | Custom-Fields + Deal-Properties definieren und anlegen | 3-5h |
| **CRM-Setup** | User-Rollen + Permissions konfigurieren | 1-2h |
| **CRM-Setup** | Daten-Migration bestehender Kontakte/Deals (bis 5.000 Records) | 4-8h |
| **Scoring-Modell** | Regelbasiertes Scoring-Framework (bis 15 Datenpunkte, Tier M) | 6-10h |
| **Scoring-Modell** | ML-gestütztes Scoring-Modell (Tier L, ab 500 historischen Deals) | 15-25h |
| **Scoring-Modell** | Score-Thresholds definieren (Cold/Warm/Hot) | 2-3h |
| **Enrichment** | Lead-Enrichment via API-Integration (Proxycurl oder Clearbit, Customer-API-Key) | 4-8h |
| **Automation** | Follow-up-Sequenz pro Stage-Übergang (bis 3 Flows, Tier M / bis 8 Flows, Tier L) | 3-5h pro Flow |
| **Automation** | Deal-Velocity-Alert wenn Deal X Tage keine Aktivität | 2-3h |
| **Automation** | Score-Threshold-Trigger (Alert an Sales-Rep wenn Lead Hot wird) | 2-3h |
| **Dashboard** | Sales-Pipeline-Dashboard (Value, Conversion Rates, Velocity, Forecast) | 8-14h |
| **Dashboard** | Team-Performance-View (Tier L) | 4-6h |
| **Testing** | End-to-End QA aller Flows + Scoring-Logik | 6-10h |
| **Handover** | Playbook-Erstellung (Schriftlich + Loom-Videos) | 4-6h |
| **Handover** | Team-Training-Session (1x 90 Min, aufgezeichnet) | 2h inkl. Vor/Nachbereitung |
| **Retainer** | Monatliches Score-Modell-Tuning | 2-3h/Monat |
| **Retainer** | Bis 2 neue Automation-Requests pro Monat | 2-4h/Monat |
| **Retainer** | Proaktives Monitoring + Fehlerreporting | 1-2h/Monat |

---

## Out-of-Scope

| Was Customer NICHT bekommt | Warum explizit nennen |
|---|---|
| Lead-Generierung / Prospecting | Häufigste Verwechslung — klarer Boundary zu `ai-lead-engine` |
| Texterstellung für Follow-up-E-Mails (mehr als Template-Struktur) | Zeitaufwand unkontrollierbar, Content-Qualität liegt beim Customer |
| DSGVO-/Rechtsberatung für Outreach-Sequenzen | Haftungsrisiko — Customer muss eigenen Berater einschalten |
| ERP/Buchhaltungs-Integration (DATEV, SAP, Lexoffice etc.) | Out-of-Scope dieses Service-Typs |
| Marketing-Automation / Newsletter-Broadcasts | Andere System-Logik, anderer Service |
| CRM-Plattform-Lizenzkosten | Customer zahlt eigene SaaS-Kosten (HubSpot, Pipedrive etc.) |
| API-Lizenzen für Enrichment-Tools | Clearbit, Proxycurl etc. laufen auf Customer-Account |
| Mehr als 5.000 Records Migration (Tier M) | Aufwand skaliert linear, Mehraufwand wird separat bepreist |
| Custom-ML-Modell (Tier M) | Nur regelbasiertes Scoring in Tier M |
| Sales-Coaching oder Prozess-Beratung | AEVUM baut System, definiert keine Sales-Strategie |
| Ongoing-Textupdates an Automations im Retainer | Technische Changes ja, Content-Changes nein |

---

## Voraussetzungen Customer-Side

| Kategorie | Requirement | Konsequenz wenn fehlt |
|---|---|---|
| **Zugang** | Admin-Zugang zu bestehendem CRM | Setup kann nicht beginnen — Blocker |
| **Zugang** | DNS-Zugang (SPF/DKIM) wenn E-Mail-Flows genutzt werden | Flows werden aufgebaut, aber nicht aktiviert bis Deliverability klar |
| **Daten** | Exportierte historische Deal-Daten (min. 6 Monate, CSV/Excel) | Nur regelbasiertes Scoring möglich, kein ML-Layer |
| **Daten** | Definition der eigenen ICP-Kriterien (zumindest grob) | Discovery verlängert sich um 1 Woche |
| **Zeit** | Entscheidungsträger für 3 Input-Sessions in Wo 1-2 (je 60 Min) | Architektur-Phase verzögert sich, Gesamtprojekt verlängert sich |
| **Zeit** | Sales-Team für 90-Min Training-Session verfügbar | Handover kann nicht abgeschlossen werden |
| **Commitment** | Aktive CRM-Nutzung durch Sales-Team nach Go-Live | Scoring-Modell verbessert sich nicht, Retainer-Wert sinkt |
| **Budget** | Min. 3 Monate Retainer-Commitment | Ohne Laufzeit kein sinnvolles Modell-Tuning — kein Setup ohne diese Zusage |
| **Tool-Entscheidung** | Klare Entscheidung für CRM-Plattform vor Projektstart | Kein Setup auf "mal sehen" |

---

## Quality-Standards

AEVUM erklärt das Projekt erst als "Done" wenn alle folgenden Punkte erfüllt sind:

| # | Standard | Messkriterium |
|---|---|---|
| 1 | Scoring-Modell läuft auf echten Live-Daten (kein Testmodus) | 20+ Leads haben Score erhalten, Werte verteilen sich sinnvoll über Cold/Warm/Hot |
| 2 | Alle definierten Flows laufen fehlerfrei durch | End-to-End-Test dokumentiert, 0 Error-Logs in 48h nach Go-Live |
| 3 | Dashboard zeigt Echtzeit-Daten ohne manuelle Aktualisierung | Refresh-Intervall max. 4h, alle KPIs plausibel |
| 4 | Daten-Migration vollständig und validiert | Record-Count stimmt mit Quelldaten überein, Spot-Check 50 Records manuell |
| 5 | Customer-Team hat Training absolviert | Aufzeichnung vorhanden, Team kann Basis-Operationen ohne AEVUM-Support |
| 6 | Playbook übergeben | Schriftliches Dokument + min. 3 Loom-Videos (Pipeline-Nutzung, Score-Interpretation, Flow-Management) |
| 7 | Deal-Velocity-Alerts getestet | Künstlicher Test-Deal durch alle Stages geführt, Alert ausgelöst |
| 8 | Score-Threshold-Definition schriftlich bestätigt | Customer hat Cold/Warm/Hot-Kriterien in Schriftform abgenommen |

---

## Change-Request-Policy

| Szenario | Behandlung |
|---|---|
| Änderungen an Stage-Struktur während Phase 1-2 | Kostenlos wenn noch kein Build begonnen hat |
| Zusätzliche Automation-Flows über vereinbarten Scope hinaus | Change-Request: €350-600 pro Flow je nach Komplexität, Umsetzung nächster Sprint |
| Scoring-Kriterien-Anpassung nach Go-Live | Teil des Retainers (bis 2 monatliche Adjustments) |
| Wechsel der CRM-Plattform nach Setup-Beginn | Neues Projekt / neues Angebot — nicht im bestehenden Scope abbildbar |
| Migration von mehr als 5.000 Records (Tier M) | €150 pro zusätzliche 1.000 Records |
| Zusätzliche Dashboard-Views über Standard-Scope | €500-1.200 je nach Komplexität, Angebot vor Umsetzung |
| Scope-Erweiterung auf Tier L während laufendem Tier-M-Projekt | Aufpreis-Kalkulation auf Basis Delta-Aufwand, neues SOW |

---

## Pricing-Variations

| Situation | Preiseffekt |
|---|---|
| Kein bestehendes CRM vorhanden → Neu-Setup Pipedrive/HubSpot inkl. | +€800-1.500 Setup (Konfiguration, Workspace-Setup, erste Daten-Struktur) |
| Mehr als 5.000 Records Migration | +€150 pro 1.000 Records |
| ML-Layer Scoring (Tier M Add-on, min. 500 historische Deals nötig) | +€3.000-5.000 Setup |
| Lead-Enrichment-Integration (Proxycurl/Clearbit) | +€1.200-2.000 Setup (Customer stellt API-Key) |
| Mehr als 3 Flows (Tier M) | +€400-600 pro zusätzlichem Flow |
| Mehrsprachige Flows (DE + EN) | +20% auf Flow-Aufwand |
| Multi-Team-Setup (mehr als 1 Sales-Team/Region) | Tier-L-Preislogik, kein Tier-M-Add-on |
| Rushed Timeline (< 4 Wochen für Tier M) | +25% Rush-Fee auf Setup-Preis |
| Retainer-Pause nach Monat 1 (auf Customer-Wunsch) | Möglich ab Monat 4, jedoch: Scoring-Modell degradiert ohne Pflege — dokumentiert und vom Customer bestätigt |