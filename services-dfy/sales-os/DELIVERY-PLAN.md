# Sales-OS — Delivery-Playbook (AEVUM-Intern)

> Operatives Dokument für das Delivery-Team. Nicht für Customer bestimmt (außer Touchpoint-Übersicht).

---

## Phasen

### Phase 1: Discovery & Architektur (Woche 1-2)

**Ziel**: Vollständiges Verständnis des Sales-Prozesses, technischer Stack entschieden, Scoring-Kriterien definiert.

| Deliverable | Owner | Customer-Input nötig |
|---|---|---|
| Sales-Prozess-Dokumentation (Stage-Map, Buyer-Journey-Overlay) | Founder / CS | 2x 60-Min-Call |
| CRM-Audit-Report (falls bestehendes System vorhanden) | Eng | Admin-Zugang CRM |
| Scoring-Kriterien-Dokument (15 Datenpunkte, priorisiert) | Founder | 1x 60-Min-Workshop |
| Tech-Stack-Entscheidung (CRM-Plattform, Enrichment-Tool, Automation-Layer) | Founder + Eng | Schriftliche Bestätigung |
| Daten-Export angefordert und validiert | CS | Customer liefert Export |
| Projekt-Kickoff-Protokoll verschickt | CS | — |

**Customer-Touchpoint**: Kick-off-Call (Wo 1), Architektur-Review-Call (Wo 2 Ende)

---

### Phase 2: CRM-Setup & Pipeline-Architektur (Woche 2-3)

**Ziel**: Technisch saubere CRM-Struktur steht, Pipeline-Stages konfiguriert, User ongeboardet.

| Deliverable | Owner | Abhängigkeit |
|---|---|---|
| CRM-Workspace konfiguriert (oder bestehendes bereinigt) | Eng | Phase 1 abgeschlossen |
| Pipeline-Stages mit Eintritts-/Exit-Kriterien angelegt | Eng | Scoring-Kriterien-Dokument |
| Custom-Fields + Deal-Properties implementiert | Eng | Stage-Map bestätigt |
| User-Accounts + Permissions gesetzt | Eng | User-Liste vom Customer |
| Daten-Migration vorbereitet (Mapping-Tabelle erstellt) | Eng | Daten-Export vom Customer |
| Staging-Environment für Tests aufgesetzt | Eng | — |

**Customer-Touchpoint**: Weekly Sync (Wo 3, 30 Min) — Stage-Struktur zur Abnahme zeigen

---

### Phase 3: Scoring-Modell + Enrichment-Layer (Woche 3-4)

**Ziel**: Scoring läuft auf Live- oder Staging-Daten, Enrichment-Pipeline angeschlossen.

| Deliverable | Owner | Abhängigkeit |
|---|---|---|
| Scoring-Logik implementiert (regelbasiert, Tier M) | Eng | Scoring-Kriterien-Dokument, Phase 2 done |
| Score-Felder in CRM befüllt (Test-Batch 50 Leads) | Eng | CRM-Setup done |
| Enrichment-API-Integration (falls im Scope) | Eng | Customer-API-Key vorhanden |
| Score-Thresholds kalibriert (Cold/Warm/Hot-Grenzen) | Founder + Eng | Test-Batch-Review |
| Scoring-Logik-Dokumentation erstellt | Eng | — |
| ML-Modell-Training initiiert (Tier L only) | Eng | Historische Daten validiert |

**Customer-Touchpoint**: Milestone-Review-Call (Wo 4) — Scoring-Demo auf echten Leads

---

### Phase 4: Automation-Flows + Dashboard (Woche 4-5)

**Ziel**: Alle Flows live, Dashboard zeigt Echtzeit-Daten.

| Deliverable | Owner | Abhängigkeit |
|---|---|---|
| Follow-up-Sequenzen gebaut (je Stage-Übergang, Tier M: bis 3) | Eng | Flow-Templates vom Customer |
| Deal-Velocity-Alerts konfiguriert | Eng | Threshold-Definition bestätigt |
| Score-Threshold-Trigger gebaut (Alert an Rep wenn Hot) | Eng | Scoring fertig |
| E-Mail-Domain-Check + Deliverability-Verification | Eng | DNS-Zugang Customer |
| Sales-Dashboard gebaut (Pipeline-Value, Conversion, Velocity, Forecast) | Eng | CRM-Daten fließen |
| Dashboard-Review intern abgenommen | Founder | — |

**Customer-Touchpoint**: Flow-Preview-Call (Wo 5, 45 Min) — Flows zeigen, Texte finalisieren

---

### Phase 5: Daten-Migration, Testing & Go-Live-Vorbereitung (Woche 5-6)

**Ziel**: Alle echten Daten sind drin, System vollständig getestet, Customer bereit für Go-Live.

| Deliverable | Owner | Abhängigkeit |
|---|---|---|
| Vollständige Daten-Migration (bis 5.000 Records) | Eng | Migration-Mapping bestätigt |
| Spot-Check 50 Records manuell (Founder oder CS) | CS | Migration done |
| End-to-End-QA: alle Flows, Score, Dashboard | Eng + Founder | Alle Builds abgeschlossen |
| Bug-Fix-Sprint (48h Puffer) | Eng | QA-Report |
| Playbook geschrieben (schriftlich + 3 Loom-Videos) | CS | System stable |
| Team-Training-Session geplant und durchgeführt | Founder / CS | Customer-Team verfügbar |
| Go-Live-Checkliste abgehakt | Founder | — |

**Customer-Touchpoint**: Training-Session (Wo 6), Go-Live-Bestätigung per E-Mail

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Retainer |
|---|---|---|---|---|---|---|
| **Founder** | Lead (Discovery, Architektur-Entscheidungen) | Review | Score-Kalibrierung | Dashboard-Abnahme | QA-Freigabe, Training | Monatl. Score-Review |
| **Engineer** | Support (CRM-Audit) | Lead (technischer Build) | Lead | Lead | Lead (Migration, QA) | Wartung, neue Flows |
| **Customer-Success** | Koordination, Protokoll | Weekly Sync | Daten-Koordination | Flow-Texte-Koordination | Playbook, Training-Support | Monitoring, Check-ins |

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Timing | Format | Owner | Ziel |
|---|---|---|---|---|
| **Kick-off-Call** | Woche 1, Tag 1-2 | Video-Call 60 Min | Founder | Erwartungen alignen, Daten-Anforderungen klären, Timeline bestätigen |
| **Architektur-Review** | Ende Woche 2 | Video-Call 45 Min | Founder | Stage-Map + Scoring-Kriterien abnehmen lassen vor Build-Start |
| **Weekly Sync** | Woche 3, 4, 5 | Video-Call 30 Min | CS | Status-Update, Blocker identifizieren, nächste Woche vorbesprechen |
| **Milestone-Review: Scoring-Demo** | Ende Woche 4 | Video-Call 45 Min | Founder + Eng | Live-Demo Scoring auf echten Leads, Threshold-Feedback einholen |
| **Flow-Preview** | Mitte Woche 5 | Async Loom + optional Call | CS | Flows zeigen, Customer gibt finale Texte frei |
| **Team-Training-Session** | Woche 6 | Video-Call 90 Min, aufgezeichnet | Founder / CS | Sales-Team lernt System bedienen, Fragen klären |
| **Go-Live-Handover** | Ende Woche 6 | E-Mail + kurzes Video | CS | Offizielle Übergabe, Retainer-Start-Datum bestätigen |
| **30-Tage-Retainer-Check** | Woche 10 | Video-Call 30 Min | CS | Wie läuft das System? Score-Tuning nötig? Feedback für Optimierung |

---

## Risk-Register

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Customer-Team nutzt CRM nach Go-Live nicht aktiv | Hoch | Sehr hoch — Scoring-Modell lernt nicht, Retainer-Wert sinkt | Bereits im Sales-Gespräch thematisieren. Training-Session verpflichtend. Retainer-Check in Woche 10 explizit auf Adoption fokussieren. "Adoption-Score" als Metrik einführen. |
| **R2** | Historische Deal-Daten zu spärlich für sinnvolles Scoring-Kalibrierung | Mittel | Mittel — regelbasiertes Scoring weniger präzise | Bereits in Phase 1 prüfen. Falls < 50 Deals: nur regelbasiertes Modell, Customer explizit informiert und SOW angepasst. |
| **R3** | CRM-Plattform-Wechsel während Projekt (Customer ändert Meinung) | Niedrig-Mittel | Sehr hoch — kompletter Rebuild | Tech-Stack-Entscheidung schriftlich bestätigen lassen vor Phase 2. Change-Request-Policy explizit kommunizieren. |
| **R4** | E-Mail-Deliverability-Probleme blockieren Flows | Mittel | Hoch — Flows können nicht live gehen | DNS-Check in Phase 1 als Blocker-Item. Flows werden gebaut aber erst aktiviert wenn Deliverability confirmed. Customer trägt Verantwortung für Domain-Setup. |
| **R5** | Scope-Creep: Customer will laufend mehr Flows/Features | Hoch | Mittel — Verzögerung + Ressourcen-Drain | Change-Request-Policy von Anfang an kommunizieren. Alle Requests in Backlog, nie ad-hoc gebaut. Neue Features = neues Angebot oder Retainer-Monat. |

---

## Quality-Gates

| Gate | Zeitpunkt | Wer nimmt ab | Kriterium für Freigabe |
|---|---|---|---|
| **QG-1: Architektur-Freigabe** | Ende Phase 1 | Founder + Customer (schriftlich) | Stage-Map, Scoring-Kriterien und Tech-Stack schriftlich bestätigt — kein Build ohne Freigabe |
| **QG-2: CRM-Struktur-Abnahme** | Ende Phase 2 | Founder (intern) | Alle Stages, Fields, Permissions korrekt — Stichprobe 10 manuell angelegte Test-Deals |
| **QG-3: Scoring-Validierung** | Ende Phase 3 | Founder + Customer (Demo) | Scoring läuft auf 50 Test-Leads, Verteilung plausibel, Customer hat Thresholds abgenommen |
| **QG-4: Flow-Freigabe** | Ende Phase 4 | Founder (intern) + Customer (Texte) | Alle Flows fehlerfrei getestet, Customer-Texte final freigegeben, Dashboard zeigt Echtzeit-Daten |
| **QG-5: Pre-Go-Live-Check** | Woche 6, vor Training | Founder | Migration validiert, alle QA-Punkte grün, Playbook fertig, Training-Session geplant |
| **QG-6: Go-Live-Bestätigung** | Nach Training-Session | Founder + Customer | Training absolviert und aufgezeichnet, Customer hat Playbook, schriftliche Go-Live-Bestätigung vorhanden |

---

## Handover-Package

| Asset | Format | Inhalt |
|---|---|---|
| **Schriftliches Playbook** | Notion-Page oder PDF | Pipeline-Nutzung, Score-Interpretation, Flow-Management, Troubleshooting-FAQ |
| **Loom-Video 1: Pipeline-Daily-Use** | Loom ~10 Min | Wie Sales-Rep täglich mit dem System arbeitet, Score liest, Deals updated |
| **Loom-Video 2: Score-Interpretation** | Loom ~8 Min | Was bedeuten Cold/Warm/Hot, wie entsteht der Score, wann manuell eingreifen |
| **Loom-Video 3: Admin-Ansicht** | Loom ~12 Min | Wie Flows angepasst werden, User verwaltet werden, Reports exportiert werden |
| **Training-Session-Aufzeichnung** | Video-File | Vollständige Aufzeichnung der 90-Min-Session |
| **Scoring-Kriterien-Dokument** | PDF | Alle 15 Datenpunkte, Gewichtung, Threshold-Definitionen — versioniert |
| **Migrations-Report** | Excel/CSV | Dokumentation aller migrierten Records, Mapping-Tabelle, Validierungs-Protokoll |
| **Technische Dokumentation** | Notion-Page | API-Verbindungen, verwendete Tools, Zugangsdaten-Hinweise (kein Klartext-Passwörter), Architektur-Übersicht |
| **CRM-Zugangsdaten** | 1Password Shared Vault oder sicherer Kanal | Alle Service-Accounts die AEVUM für den Customer angelegt hat |
| **Retainer-SLA-Dokument** | PDF | Was ist im Retainer enthalten, Response-Times, Change-Request-Prozess |