# DSGVO-Factory — Delivery-Playbook (AEVUM-intern)

## Phasen

### Phase 1: Discovery & Gap-Analyse
**Wochen 1-2**

| Deliverable | Owner | Customer-Input required |
|---|---|---|
| Tool-Inventar (vollständige Liste aller SW-Dienstleister mit Datenzugriff) | Eng + CS | Customer liefert initiale Liste, AEVUM vervollständigt |
| Datenfluss-Diagramm (visuell, Miro oder FigJam) | Eng | Kick-off-Call + Fragebogen-Response |
| Gap-Analyse-Report (DSGVO-Mindestanforderungen vs. Ist-Zustand) | CS | — |
| Bestehende Dokumente gesichtet und klassifiziert | CS | Customer stellt Zugang zu bestehenden Docs bereit |
| Priorisierungsliste: Was wird zuerst gebaut | Founder/CS | Gemeinsame Abstimmung |

**Customer-Touchpoints:** Kick-off-Call (3h, W1), Fragebogen-Deadline (W1 Ende), Gap-Analyse-Präsentation (30 Min, W2)

---

### Phase 2: VVT + AV-Register
**Wochen 2-4**

| Deliverable | Owner | Customer-Input required |
|---|---|---|
| Verarbeitungsverzeichnis in Notion/Airtable aufgebaut (Template + alle Einträge) | Eng | Customer reviewed und ergänzt Lücken (Owner-Zuweisung) |
| AV-Register aufgebaut, alle Dienstleister erfasst | Eng | Customer klärt AVV-Status ggf. direkt mit Dienstleistern |
| Automatische AVV-Reminder-Flows live | Eng | — |
| Owner-Mapping: Wer verantwortet welche Verarbeitungstätigkeit | CS | Customer entscheidet intern |

**Customer-Touchpoints:** Weekly Sync (30 Min, W3), Owner-Mapping-Workshop (45 Min, W3-4)

---

### Phase 3: Workflows + Automatisierungen
**Wochen 3-6**

| Deliverable | Owner | Customer-Input required |
|---|---|---|
| Consent-Management-System live (Tracking, Audit-Trail, DB) | Eng | Zugang zu E-Mail-Tool / Form-Builder / CRM |
| Betroffenenrechte-Ticketing (alle 4 Anfrage-Typen) live | Eng | Customer tested Flows mit echten Test-Accounts |
| Response-Templates (Art. 15/16/17/20) in System eingespielt | CS | Customer reviewed Templates auf eigenen Ton/Stil |
| 30-Tage-SLA-Tracking + Eskalations-Automation | Eng | — |
| Löschfristenregister + automatische Hooks | Eng | Customer definiert Kategorien + Fristen (CS-geführt) |
| Datenpannen-Playbook + Melde-Templates | CS | Customer reviewed, ggf. Anwalt parallel |
| TOM-Dokumentation erste Version | CS | Customer liefert technische Details (Passwort-Policy, etc.) |

**Customer-Touchpoints:** Weekly Syncs (W4, W5, W6), Workflow-Demo-Call (45 Min, W5)

---

### Phase 4: Dashboard + Awareness-Paket
**Wochen 5-7**

| Deliverable | Owner | Customer-Input required |
|---|---|---|
| DSGVO-Dashboard live (alle KPIs aggregiert) | Eng | Customer reviewed Dashboard-Layout vor Finalisierung |
| Mitarbeiter-Awareness-Paket (Loom-Videos + Quiz + Bestätigungsprotokoll) | CS | Customer reviewed Inhalte auf Richtigkeit |
| Quarterly-Review-Trigger konfiguriert (erste Benachrichtigung gesetzt) | Eng | Customer bestätigt Owner-E-Mail für Notifications |
| TOM-Dokumentation finalisiert und von Customer freigegeben | CS | Customer Sign-off |

**Customer-Touchpoints:** Weekly Sync (W6), Dashboard-Preview-Call (30 Min, W6-7)

---

### Phase 5: Testing, QA & Handover
**Wochen 7-8**

| Deliverable | Owner | Customer-Input required |
|---|---|---|
| Alle Workflows: kompletter End-to-End-Test durchgeführt | Eng + CS | Customer führt Tabletop-Test Datenpannen-Playbook durch |
| Korrekturen aus Testing eingearbeitet | Eng | — |
| Test-Mitarbeiter hat Awareness-Paket vollständig durchlaufen | Customer (mit CS-Begleitung) | Pflicht vor Handover |
| Handover-Package fertig (siehe unten) | CS | — |
| Handover-Session (2h, alle Systeme erklärt) | Founder/CS | Customer-Owner + ggf. 1-2 MA |
| Retainer-Modus aktiviert: Review-Rhythmus, Escalation-Path definiert | CS | — |

**Customer-Touchpoints:** QA-Review-Call (45 Min, W7), Handover-Session (2h, W8), Retainer-Kick-off (30 Min, W8)

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Retainer |
|---|---|---|---|---|---|---|
| **Founder** | Discovery-Oversight, Kick-off | Prüfung VVT-Struktur | Qualitätsprüfung Workflows | — | Handover-Session | Quartalsreview |
| **Engineer** | Tool-Inventar, Datenfluss-Diagramm | AV-Register-Aufbau, Reminder-Flows | Alle Automatisierungen + Consent-System | Dashboard + Review-Trigger | Testing, Bugfixes | Systemwartung, Updates |
| **Customer Success** | Fragebogen, Gap-Analyse-Report | Owner-Mapping-Workshop | Templates, Playbook, TOM | Awareness-Paket | QA, Handover-Package | Monatliche Touchpoints, Eskalation |

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Timing | Format | Owner (AEVUM) | Ziel |
|---|---|---|---|---|
| **Kick-off-Call** | W1, Tag 2-3 | Video-Call, 3h | Founder + CS | Scope finalisieren, Zugang einrichten, Fragebogen briefen |
| **Fragebogen-Deadline** | W1, Ende | Async (Notion-Form) | CS | Tool-Liste + bestehende Docs vollständig |
| **Gap-Analyse-Präsentation** | W2 | Video-Call, 30 Min | CS | Befunde und Priorisierung abstimmen |
| **Owner-Mapping-Workshop** | W3-4 | Video-Call, 45 Min | CS | Interne Verantwortlichkeiten zuweisen |
| **Weekly Syncs** | W3, W4, W5, W6 | Video-Call, 30 Min | CS | Status, Blocker, offene Fragen |
| **Workflow-Demo** | W5 | Video-Call, 45 Min | Eng + CS | Alle Automatisierungen live zeigen |
| **Dashboard-Preview** | W6-7 | Video-Call, 30 Min | CS | Feedback einholen, Korrekturen definieren |
| **QA-Review-Call** | W7 | Video-Call, 45 Min | Eng + CS | Testergebnisse besprechen, letzte Korrekturen |
| **Handover-Session** | W8 | Video-Call, 2h | Founder + CS | Vollständige Übergabe, alle Systeme walkthrough |
| **Retainer-Kick-off** | W8, Ende | Video-Call, 30 Min | CS | Retainer-Rhythmus, Escalation-Path, erste Quarterly-Review terminieren |

---

## Risk-Register

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Customer liefert Zugang zu Tools zu spät / unvollständig | Hoch | Hoch — blockiert Phase 1 + 3 | Zugang-Checkliste in Onboarding-E-Mail; Kick-off erst nach 80% Zugang; klare Deadline mit Timeline-Konsequenz kommunizieren |
| **R2** | Unbekannte Komplexität (z.B. 3x mehr Verarbeitungstätigkeiten als angegeben) | Mittel | Mittel — Scope-Creep-Risiko | Discovery-Cap explizit kommuniziert; CR-Prozess aktivieren sobald >10% Überschreitung erkennbar; Tier-Upgrade anbieten |
| **R3** | Customer-Owner wechselt während Implementation | Mittel | Hoch — Wissensverlust, Verzögerung | Alle Entscheidungen schriftlich in Notion dokumentieren; Owner-Wechsel-Protokoll: 2h Onboarding neuer Owner durch CS |
| **R4** | Technische Automatisierungs-Hooks funktionieren nicht mit altem Tool-Stack (z.B. kein API-Zugang) | Mittel | Mittel — Teilautomatisierung statt Vollautomatisierung | Früh in Phase 1 API-Verfügbarkeit prüfen; Fallback: manuelle Prozesse mit Checklisten; Communication mit Customer proaktiv |
| **R5** | Customer erwartet juristisch geprüfte Dokumente (Rechtsberatungs-Erwartung) | Mittel | Hoch — Haftungsrisiko für AEVUM | Scope explizit in Onboarding-E-Mail und Vertragsbestandteil: "AEVUM liefert keine Rechtsberatung"; bei Anzeichen früh eskalieren und Anwalt-Empfehlung aktiv wiederholen |

---

## Quality-Gates

| Gate | Zeitpunkt | Prüfung durch | Kriterium für Freigabe |
|---|---|---|---|
| **QG-1: Discovery-Vollständigkeit** | Ende W2 | CS + Founder | Tool-Inventar vollständig, Gap-Analyse vom Customer abgenommen |
| **QG-2: VVT-Vollständigkeit** | Ende W4 | CS | Alle bekannten Verarbeitungstätigkeiten erfasst, Owner-Mapping 100% |
| **QG-3: Workflow-Funktionalität** | Mitte W6 | Eng | Alle 4 Betroffenenrechte-Typen technisch getestet, Consent-Trail nachweisbar |
| **QG-4: Dashboard-Datenintegrität** | Ende W7 | Eng + CS | Dashboard-Werte stimmen mit manueller Prüfung überein (Stichprobe 5 KPIs) |
| **QG-5: End-to-End-Abnahme** | Ende W7 | Founder | Alle 10 Quality-Standards aus Scope-Checklist erfüllt — internes Sign-off vor Handover |

---

## Handover-Package

| Asset | Format | Inhalt |
|---|---|---|
| **System-Dokumentation** | Notion-Page (Customer-Zugang) | Alle Systeme erklärt: VVT, AV-Register, Dashboard, Ticket-System, Löschfristen |
| **Loom-Walkthroughs** | Video (5-8 Videos, je 5-15 Min) | Jedes System einmal vollständig erklärt: Navigation, Pflege, häufige Tasks |
| **Datenpannen-Playbook** | PDF + Notion | Schritt-für-Schritt mit Templates und Behörden-Kontaktliste |
| **TOM-Dokumentation** | PDF (finale Version) | Freigegeben und datiert — direkt verwendbar für Audits |
| **AVV-Register** | Airtable/Notion | Alle Auftragsverarbeiter, Status, letzte Prüfung, Reminder-Konfiguration |
| **Response-Templates** | Notion / Word-Export | Alle 4 Anfrage-Typen (Auskunft, Löschung, Berichtigung, Portabilität) |
| **Quarterly-Review-Checkliste** | Notion-Template | Selbst-ausfüllbar, mit Hinweisen zu jedem Punkt |
| **Mitarbeiter-Awareness-Paket** | Notion + Loom-Videos | Self-service onboardbar, Quiz + Bestätigungsprotokoll |
| **Credentials & Access-Doku** | 1Password-Shared-Vault oder Notion-verschlüsselt | Alle relevanten Zugänge, klar strukturiert |
| **Eskalations-Kontakt** | Retainer-Onboarding-Dokument | Ansprechpartner AEVUM, SLAs im Retainer, wie CRs gestellt werden |