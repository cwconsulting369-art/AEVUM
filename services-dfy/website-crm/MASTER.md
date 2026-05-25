---
title: AEVUM DFY — website-crm
date: 2026-05-25
---

# AEVUM Done-for-You — website-crm

> Generated 2026-05-25. Combined Master-Doc.

---

# 1. Sales-Brief


## In einem Satz

Ein vollständig auf dein Business zugeschnittenes CRM-System — gebaut direkt in deiner bestehenden Infrastruktur, mit automatisierten Workflows, die dein Team entlasten, statt es zu verwalten.

---

## Wer das braucht

| Segment | Konkreter Use-Case | Fit-Rating |
|---|---|---|
| **AG** (Agenturen 3-50 MA) | Kein generisches HubSpot mehr: Agentur braucht Deal-Tracking pro Kunde, Retainer-Status, automatische Follow-Up-Chains und Briefing-Templates direkt im CRM-Flow | ★★★★★ |
| **PB** (Personal Brands) | Coaching-Anfragen, Wartelisten, Launch-Sequenzen und Community-Mitglieder in einem System verwalten statt 4 Tools zu jonglieren | ★★★★☆ |
| **FI** (Mittelstand B2B 10-100 MA) | Sales-Team nutzt Excel und Outlook — Übergang zu strukturiertem Pipeline-Management mit automatischen Übergaben zwischen Vertrieb und Projektteam | ★★★★★ |

---

## Was Customer bekommt

1. **Custom CRM-Datenmodell** — Felder, Entitäten und Beziehungen exakt nach Business-Logik (keine Standard-Objekte, die nicht passen)
2. **Frontend-Interface** — Web-basiertes UI für Deal/Kontakt/Kunden-Verwaltung, rollenbasiert (Sales, PM, Management)
3. **Workflow-Engine mit min. 5 Automatisierungen** — z. B. Status-Trigger, Reminder-Chains, interne Benachrichtigungen, Task-Erstellung bei Stage-Wechsel
4. **Formular-Integration** — Eingehende Leads aus Website/Typeform/Tally landen direkt strukturiert im CRM
5. **Pipeline-Views** — Kanban + Listenansicht pro Team/Rolle, filterbar und sortierbar
6. **E-Mail-Templates + Sequenz-Logik** — Vorgefertigte Templates mit Variablen, semi-automatische Outreach-Sequenzen
7. **Aktivitäts-Log** — Vollständige Timeline pro Kontakt/Deal (Calls, Mails, Stage-Wechsel, Notizen)
8. **Rollen & Permissions** — Min. 3 definierte Rollen mit differenzierten Zugriffsrechten
9. **Reporting-Dashboard** — Live-Übersicht: Pipeline-Volumen, Conversion-Rates, Aktivitäts-KPIs
10. **Migrations-Support** — Import bestehender Kontakte/Deals aus CSV, Excel oder altem Tool (bis 10k Records)
11. **Dokumentation + Video-Walkthroughs** — System-Doku, SOPs für häufige Workflows, Onboarding-Video für neue Mitarbeiter
12. **4-Wochen Post-Launch-Support** — Bug-Fixes und kleinere Anpassungen nach Go-Live

---

## Mehrwert (konkret)

| Dimension | Vorher | Nachher | Schätzwert |
|---|---|---|---|
| **Zeit für Lead-Follow-Up** | Manuell, unstrukturiert, geht unter | Automatisiert + getriggert | -70% manueller Follow-Up-Aufwand |
| **Deal-Übersicht** | Excel, Slack-Nachrichten, Notizen | Single Source of Truth | 0 verlorene Deals durch fehlende Sichtbarkeit |
| **Onboarding neuer Vertriebler** | Wochen, Wissenstransfer informal | System + SOPs vorhanden | -60% Onboarding-Zeit |
| **Reporting** | Manuell zusammengebaut, monatlich | Live, on-demand | 4-6h/Monat gespart pro Manager |
| **Tool-Kosten** | Mehrfach-Subscriptions (HubSpot, Pipedrive etc.) | Eigenes System, kein Per-Seat-Pricing | €200-€1.500/Mo gespart je nach Tool |
| **Revenue-Impact** | ~20-30% Leads ohne Follow-Up verloren | Automatische Wiedervorlage | Konservativ +10-15% Close-Rate |

---

## Pricing-Logic

| | **Tier M** | **Tier L** |
|---|---|---|
| **Setup** | €8.000 – €14.000 | €18.000 – €35.000 |
| **Monthly Retainer** | €1.800 – €2.800 | €3.000 – €4.500 |
| **Scope** | 1 Pipeline, bis 5 Workflows, 1 Team (bis 10 User), Standard-Reporting, 1 Formular-Integration | 2-4 Pipelines, 10-20 Workflows, Multi-Team, Custom Reporting, mehrere Integrationen, komplexe Rollen-Logik |
| **Datenmigration** | Bis 10k Records, 1 Source | Bis 50k Records, Multi-Source |
| **Implementierung** | 6-8 Wochen | 10-14 Wochen |
| **Typischer Customer** | Agentur 5-15 MA, PB mit aktivem Sales | Mittelstand 20-100 MA, Agentur mit mehreren Teams |

Setup-to-Retainer-Ratio: ~4:1 (Tier M) / ~6:1 (Tier L)

---

## Timeline

| Phase | Dauer | Inhalt |
|---|---|---|
| **Phase 1: Discovery & Architecture** | Woche 1-2 | Anforderungsworkshop, Datenmodell-Design, Tech-Stack-Entscheidung, Workflow-Mapping |
| **Phase 2: Core Build** | Woche 3-5 | Datenbank + CRM-Struktur, Frontend-UI, Basis-Pipeline-Views |
| **Phase 3: Workflow-Engine** | Woche 5-7 | Automatisierungen, Formular-Integration, E-Mail-Templates, Notification-Logic |
| **Phase 4: Migration & Testing** | Woche 7-8 | Daten-Import, UAT mit Customer-Team, Bug-Fixing |
| **Phase 5: Launch & Handover** | Woche 8-9 | Go-Live, Training, Dokumentation, Video-Walkthroughs |
| **Phase 6: Post-Launch-Support** | Woche 9-13 | 4-Wochen aktiver Support-Window, Retainer-Start |

---

## Voraussetzungen Customer

- Klare Vorstellung der Sales-/Deal-Stages (oder Bereitschaft, diese in Workshop zu definieren)
- Bestehende Kontakt-/Deal-Daten exportierbar (CSV, Excel, API)
- Min. 1 interner Ansprechpartner mit Entscheidungskompetenz (2-4h/Woche Verfügbarkeit während Build)
- Domain + Hosting-Zugang (falls Self-Hosted-Option gewählt)
- E-Mail-Provider-Zugangsdaten (für Sequenz-Integration: GSuite, Outlook, SMTP)
- Klare User-Liste mit Rollen vor Kick-off

---

## Nicht-Ziele (explizite Out-of-Scope-Liste)

- **Kein ERP-System** — Buchhaltung, Rechnungsstellung, Lohnbuchhaltung sind nicht Teil dieses Services
- **Kein Marketing-Automation-Stack** — Kein Aufbau von Newsletter-Systemen, Broadcast-Campaigns oder Ad-Tracking
- **Keine Custom Mobile App** — Das System ist Web-responsive, aber keine native iOS/Android-App
- **Kein Outbound-Scraping/Lead-Generation** — Kontakte werden nicht beschafft, nur verwaltet (→ ai-lead-engine)
- **Kein laufendes Content-/Copywriting** — E-Mail-Templates werden strukturiert, nicht dauerhaft getextet
- **Keine IT-Infrastruktur-Verwaltung** — Server-Setup ist einmalig, kein DevOps-Retainer inbegriffen
- **Kein Change-Management** — AEVUM baut und übergibt; Team-Adoption liegt beim Customer

---

## Upsell-Pfade

| Trigger | Next Service |
|---|---|
| CRM läuft, aber Sales-Team hat kein strukturiertes Scoring | **sales-os** — AI-Scoring-Layer on top des CRM |
| Customer will Leads automatisch ins CRM befüllen | **ai-lead-engine** — Full-Stack Lead-Gen mit direkter CRM-Anbindung |
| Management will übergreifende KPI-Sichtbarkeit | **command-center-dashboard** — Cross-Tool-Dashboard über CRM + andere Systeme |
| CRM ist Kern, aber auch PM, Finanzen, HR nötig | **business-os** — Erweiterung zum vollständigen Business-OS |
| Customer will wissen, was sonst noch automatisierbar ist | **automation-audit** — 90-Tage-Roadmap auf Basis des bestehenden Systems |
| CRM läuft, aber Reporting ist noch manuell | **database-system** — Multi-Source Data-Pipeline + Reporting-Layer |

---

## Conversion-Story

Die meisten Unternehmen wissen genau, was ihnen fehlt: Sie verlieren Deals nicht weil ihr Angebot schlecht ist, sondern weil die Follow-Up-Mail drei Tage zu spät kommt. Weil der neue Vertriebler nicht weiß, was mit dem Kontakt letztes Quartal besprochen wurde. Weil der Status eines Deals in Slack, in der Notiz-App und im Kopf von drei verschiedenen Personen existiert — aber nirgendwo in einem System, das automatisch erinnert, priorisiert und eskaliert. Das ist kein Disziplin-Problem. Das ist ein Infrastruktur-Problem.

Generische CRMs lösen das nicht — sie verschieben es. HubSpot, Pipedrive, Salesforce: Alle wurden für den Durchschnitt gebaut. Dein Business ist nicht durchschnittlich. Deine Deal-Stages heißen anders. Dein Übergabeprozess zwischen Sales und Delivery ist spezifisch. Deine Kunden haben unterschiedliche Vertragstypen. Ein Standard-Tool zwingt dich, dich an das Tool anzupassen. Ein Custom CRM passt sich an dich an — und hört nicht auf zu funktionieren, wenn dein Prozess sich weiterentwickelt.

Was AEVUM baut ist kein weiteres Tool in deinem Stack. Es ist das Zentralsystem, das alle losen Enden zusammenzieht. Nach dem Launch läuft dein Team in einem System, nicht in fünf. Follow-Ups passieren automatisch. Manager sehen den Pipeline-Status in Echtzeit. Neue Mitarbeiter werden durch das System geführt, nicht durch den Gründer. Das ist der Unterschied zwischen einem Business, das von seinen Tools abhängt, und einem, das sie kontrolliert.
\newpage

# 2. Scope-Checklist


## In-Scope

| Kategorie | Item | Aufwand-Estimate |
|---|---|---|
| **Discovery** | Anforderungsworkshop (2x 90 Min Sessions) | 3h |
| **Discovery** | Datenmodell-Design (Entitäten, Felder, Beziehungen) | 4-6h |
| **Discovery** | Workflow-Mapping aller gewünschten Automatisierungen | 3-4h |
| **Architecture** | Tech-Stack-Entscheidung + Infrastruktur-Plan | 2h |
| **Architecture** | Datenbankschema-Erstellung | 4-8h |
| **Frontend** | CRM-Interface (Kontakte, Deals, Companies) | 15-25h |
| **Frontend** | Pipeline-Views (Kanban + Liste) | 8-12h |
| **Frontend** | Rollenbasierte Zugriffslogik (min. 3 Rollen) | 6-10h |
| **Frontend** | Aktivitäts-Log + Timeline pro Record | 5-8h |
| **Frontend** | Suchfunktion + Filterlogik | 4-6h |
| **Workflow-Engine** | Bis 5 Automatisierungen (Tier M) / Bis 15 (Tier L) | 10-30h |
| **Workflow-Engine** | Status-Trigger + Stage-Wechsel-Logik | 4-6h |
| **Workflow-Engine** | Reminder + Wiedervorlage-Chains | 4-6h |
| **Workflow-Engine** | Interne Benachrichtigungen (E-Mail/Slack) | 3-5h |
| **Integration** | Formular-Integration (1x Typeform/Tally/Website-Form) | 4-6h |
| **Integration** | E-Mail-Provider-Anbindung (GSuite/Outlook/SMTP) | 4-8h |
| **Integration** | Webhook-Empfang für externe Trigger | 3-5h |
| **E-Mail** | Bis 5 E-Mail-Templates mit Variablen-Logik | 4-6h |
| **E-Mail** | Semi-automatische Sequenz-Logik (1-3 Steps) | 4-8h |
| **Reporting** | Pipeline-Dashboard (Volumen, Conversion, Aktivität) | 6-10h |
| **Migration** | CSV/Excel-Import bis 10k Records (Tier M) | 4-8h |
| **Migration** | Daten-Mapping + Bereinigung | 3-6h |
| **Testing** | UAT-Vorbereitung + Bug-Tracking | 4-6h |
| **Testing** | Internes QA vor UAT-Übergabe | 3-4h |
| **Handover** | System-Dokumentation (schriftlich) | 4-6h |
| **Handover** | Video-Walkthroughs (3-5 Loom-Videos, ~5 Min/Stück) | 3-5h |
| **Handover** | Go-Live-Support-Call | 1h |
| **Post-Launch** | 4-Wochen Bug-Fix + Minor-Adjustments-Window | 8-12h |

---

## Out-of-Scope

| Was Customer NICHT bekommt | Warum explizit ausgeschlossen |
|---|---|
| Rechnungsstellung / Buchhaltungs-Integration | ERP-Logik ist eigener Service-Track |
| Automatisierter Outbound-Scraping/Lead-Beschaffung | → ai-lead-engine |
| Native Mobile App (iOS/Android) | Separater Build-Aufwand, anderer Tech-Stack |
| Newsletter / Broadcast-Marketing | → content-engine oder separater Marketing-Stack |
| Laufendes Copywriting für E-Mail-Templates | Templates werden strukturiert, nicht dauerhaft befüllt |
| DevOps / Server-Wartung im Retainer (über Standard hinaus) | Infrastruktur-Incidents außerhalb Retainer-Scope = CR |
| AI-basiertes Deal-Scoring | → sales-os Add-on |
| Custom API-Entwicklung für Drittanbieter (über 1 Standard-Integration hinaus) | Jede weitere API-Integration = Change Request |
| Unbegrenzte Workflow-Erstellung im Retainer | Retainer deckt 2 neue Workflows/Mo — darüber CR |
| Schulung des gesamten Teams (Training > 2h) | 1x Onboarding-Session inbegriffen, weitere = separat |
| Datenschutz-/DSGVO-Beratung | Customer ist verantwortlich für Compliance-Setup |

---

## Voraussetzungen Customer-Side

| Kategorie | Requirement | Konsequenz wenn fehlt |
|---|---|---|
| **Access** | Domain + Hosting-Credentials (bei Self-Hosted) | Verzögerung Woche 2-3 |
| **Access** | E-Mail-Provider-Zugang (OAuth oder SMTP-Credentials) | E-Mail-Feature verzögert |
| **Access** | Admin-Zugang zum bestehenden Tool (für Migration) | Migration-Phase verschiebt sich |
| **Daten** | Exportierbarer Kontakt-/Deal-Datensatz (CSV/Excel/JSON) | Manuelle Bereinigung = CR |
| **Daten** | Definierte Felder-Liste + Deal-Stages vor Kick-off | Discovery-Phase verlängert sich |
| **Daten** | User-Liste mit Rollen (Name, E-Mail, Rolle) | Rollout verzögert sich |
| **Zeit** | 1 interner POC mit 2-4h/Woche Verfügbarkeit | UAT kann nicht stattfinden → Verzögerung |
| **Zeit** | Review-Turnaround für Deliverables max. 48h | Phasen-Verschiebung wenn länger |
| **Entscheidung** | Klare Priorisierung der Top-5-Workflows vor Build-Start | Scope-Creep-Risiko steigt |

---

## Quality-Standards

Was muss erfüllt sein, damit AEVUM "Done" sagt:

| Standard | Kriterium |
|---|---|
| **Funktionalität** | Alle vereinbarten Features in Acceptance-Criteria-Liste bestätigt und getestet |
| **Performance** | Seiten-Ladezeit < 2s bei 1.000 Records; API-Response < 500ms |
| **Datenintegrität** | Migration-Prüfung: 100% Record-Count stimmt, Pflichtfelder befüllt, keine Duplikate > 2% |
| **Workflows** | Jede Automatisierung mit min. 3 Test-Durchläufen validiert (inkl. Edge-Cases) |
| **Rollen & Permissions** | Jede Rolle: separater Test-User, Zugriffsrechte manuell verifiziert |
| **Formular-Integration** | End-to-End-Test: Submission → CRM-Record sichtbar < 60s |
| **E-Mail** | Templates mit Variablen in min. 3 verschiedenen Szenarien getestet |
| **Reporting** | Dashboard-Daten stimmen mit rohem Datenbestand überein (Stichprobe 20 Records) |
| **Dokumentation** | Alle Workflows, Felder und Rollen schriftlich dokumentiert; Video-Walkthroughs aufgezeichnet |
| **Customer-Sign-Off** | Schriftliche UAT-Bestätigung vom Customer-POC vor Go-Live |

---

## Change-Request-Policy

| Situation | Prozess | Pricing |
|---|---|---|
| Neues Feature nach Discovery-Sign-Off | Schriftlicher CR-Request → Aufwands-Estimate → Customer-Approval → Umsetzung | €120-180/h nach Aufwand |
| Zusätzliche Workflow (über vereinbarte Anzahl) | CR-Assessment: < 2h = Kulanz im Support-Window; > 2h = CR | €120-180/h |
| Neue Drittanbieter-Integration (über 1 Standard) | Immer CR, kein Kulanz-Spielraum | Ab €500 pauschal, je nach Komplexität |
| Scope-Erweiterung (neue Pipeline, neue Entität) | Separates Angebot, ggf. Phase-2-Projekt | Eigenes Angebot |
| Bug-Fix innerhalb Post-Launch-Window | Inbegriffen, keine CR | Kostenfrei |
| Bug-Fix nach Post-Launch-Window | Retainer-Stunden oder CR | Im Retainer oder €120-180/h |

**Regel:** Jeder CR braucht schriftliche Bestätigung bevor Arbeit beginnt. Keine Ausnahmen.

---

## Pricing-Variations

| Add-On / Variation | Preis-Impact |
|---|---|
| Jede zusätzliche Integration (über 1 Standard-Integration) | +€800 – €2.500 Setup je nach Komplexität |
| Migration > 10k Records (bis 50k) | +€1.500 – €3.000 Setup |
| Multi-Source-Migration (> 1 Herkunftssystem) | +€1.000 – €2.000 Setup |
| AI-Deal-Scoring-Layer (→ sales-os Modul) | +€4.000 – €8.000 Setup |
| Zweite Pipeline (separates Produkt/Team) | +€2.500 – €5.000 Setup |
| Erweiterte Workflow-Engine (> 10 Workflows) | +€1.500 – €3.000 Setup |
| Dediziertes Onboarding-Training (> 2h) | +€500/halber Tag |
| Laufende Workflow-Erstellung im Retainer (> 2/Mo) | +€400 – €800/Mo |
| Custom Reporting-Layer (über Standard-Dashboard) | +€2.000 – €5.000 Setup (→ database-system Modul) |
| Self-Hosted-Infrastruktur-Setup (VPS, eigene Domain) | +€500 – €1.500 Setup einmalig |
\newpage

# 3. Delivery-Plan


## Phasen

### Phase 1 — Discovery & Architecture (Woche 1-2)

| Deliverable | Verantwortlich | Customer-Touchpoint |
|---|---|---|
| Kick-off Call (90 Min, Anforderungen + Erwartungen) | Founder + Customer-Success | ✅ Kick-off Call |
| Requirements-Doc (Felder, Entitäten, Rollen, Stages) | Founder | Review durch POC — 48h Feedback-Fenster |
| Workflow-Mapping-Doc (alle Automatisierungen priorisiert) | Founder + Engineering | Async Review via Notion/Loom |
| Tech-Stack-Entscheidung + Infrastruktur-Plan | Engineering | Schriftliche Bestätigung vor Build-Start |
| Datenbankschema v1 | Engineering | Keine Customer-Review (intern) |
| Discovery-Sign-Off (schriftlich) | Customer-POC | ✅ Sign-Off-Call oder schriftlich |

**Quality-Gate Ende Phase 1:** Requirements-Doc + Workflow-Map unterschrieben. Kein Build ohne dieses Gate.

---

### Phase 2 — Core Build (Woche 3-5)

| Deliverable | Verantwortlich | Customer-Touchpoint |
|---|---|---|
| Datenbankschema final + deployed | Engineering | Keine |
| CRM-Interface v1 (Kontakte, Deals, Companies) | Engineering | Interner Review |
| Pipeline-Views (Kanban + Liste) | Engineering | Interner Review |
| Rollenbasierte Zugriffslogik (min. 3 Rollen) | Engineering | Keine |
| Aktivitäts-Log + Timeline | Engineering | Keine |
| Suchfunktion + Filterlogik | Engineering | Keine |
| Wöchentlicher Status-Update (async, Loom oder Notion) | Customer-Success | ✅ Weekly Async-Update |

**Quality-Gate Ende Phase 2:** Interner QA-Durchlauf — Core-Features funktional ohne Crashs. Demo-Ready für Customer-Preview.

---

### Phase 3 — Workflow-Engine & Integrationen (Woche 5-7)

| Deliverable | Verantwortlich | Customer-Touchpoint |
|---|---|---|
| Workflow-Engine-Setup (Trigger-Logik) | Engineering | Keine |
| Automatisierungen 1-5 (Tier M) / 1-15 (Tier L) gebaut und intern getestet | Engineering | Keine |
| Formular-Integration (Typeform/Tally/Website) | Engineering | Customer liefert Form-Credentials |
| E-Mail-Provider-Anbindung | Engineering | Customer liefert OAuth/SMTP |
| E-Mail-Templates + Variablen-Logik | Engineering + Customer-Success | ✅ Template-Review mit Customer-POC |
| Notification-Logic (Slack/E-Mail intern) | Engineering | Keine |
| Milestone-Review Call (Demo der Workflows live) | Founder + Engineering | ✅ Milestone-Review Call |

**Quality-Gate Ende Phase 3:** Jeder Workflow mit min. 3 Test-Durchläufen durch Engineering — inkl. Edge-Cases. Formular-to-CRM End-to-End getestet.

---

### Phase 4 — Migration & UAT (Woche 7-8)

| Deliverable | Verantwortlich | Customer-Touchpoint |
|---|---|---|
| Daten-Mapping-Sheet (Customer befüllt Spalten-Zuordnung) | Customer-Success (Template) + Customer-POC | Customer-Action required |
| Daten-Import + Bereinigung | Engineering | Keine |
| Duplikats-Check + Record-Count-Validation | Engineering | Keine |
| UAT-Testplan-Erstellung | Customer-Success | ✅ UAT-Briefing-Call |
| UAT durch Customer-Team (5-7 Werktage) | Customer-POC + Team | Customer-Action required |
| Bug-Liste consolidiert + priorisiert | Customer-Success | Async |
| Bug-Fixes aus UAT | Engineering | Keine |
| UAT-Sign-Off | Customer-POC | ✅ Schriftlicher Sign-Off |

**Quality-Gate Ende Phase 4:** UAT-Sign-Off liegt vor. Migration-Validation-Report erstellt. Keine offenen P0/P1-Bugs.

---

### Phase 5 — Launch & Handover (Woche 8-9)

| Deliverable | Verantwortlich | Customer-Touchpoint |
|---|---|---|
| Go-Live-Deployment | Engineering | Keine |
| Onboarding-Session (max. 2h, User-Training) | Customer-Success | ✅ Onboarding-Call |
| System-Dokumentation (schriftlich, Notion/PDF) | Customer-Success | Übergabe |
| Video-Walkthroughs (3-5 Loom-Videos) | Customer-Success | Übergabe |
| Access-Übergabe (Admin-Credentials, alle Zugänge) | Engineering + Customer-Success | ✅ Handover-Call |
| Retainer-Start-Briefing (was ist im Retainer, was nicht) | Founder | ✅ Retainer-Kick-off |

**Quality-Gate Ende Phase 5:** Alle Zugänge übergeben. Doku vollständig. Onboarding durchgeführt. Retainer gestartet.

---

### Phase 6 — Post-Launch-Support (Woche 9-13)

| Aktivität | Verantwortlich | Touchpoint |
|---|---|---|
| 4-Wochen aktives Bug-Monitoring | Engineering | Keine (reaktiv) |
| Wöchentlicher kurzer Check-In (15 Min) | Customer-Success | ✅ Weekly Check-In |
| Bug-Fix-Requests bearbeitet < 48h | Engineering | Async Ticket-System |
| Minor-Adjustment-Requests (< 2h) im Rahmen bearbeitet | Engineering | Nach Absprache |
| Retainer-Review nach 4 Wochen (was kommt als nächstes) | Founder | ✅ Retainer-Review-Call |

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|---|---|---|---|---|---|---|
| **Founder** | Lead (Discovery, Architektur) | Review | Milestone-Review | Eskalation | Retainer-Briefing | Retainer-Review |
| **Engineering** | Datenbankschema | Core Build (Hauptlast) | Workflow + Integration (Hauptlast) | Migration + Bugs | Deployment | Bug-Fixes (reaktiv) |
| **Customer-Success** | Kick-off, Doku | Weekly Updates | Template-Review | UAT-Begleitung, Bug-Liste | Onboarding, Doku, Handover | Weekly Check-Ins |

**Hinweis:** Bei Tier L empfehlen sich 2 Engineering-Ressourcen ab Phase 2 (Core + Workflow parallel).

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Wann | Format | Ziel | Dauer |
|---|---|---|---|---|
| **Kick-off Call** | Woche 1 | Video-Call | Anforderungen klären, Erwartungen alignen, Prozess erklären | 90 Min |
| **Discovery-Sign-Off** | Ende Woche 2 | Call oder async schriftlich | Requirements-Doc + Workflow-Map bestätigen | 30 Min |
| **Weekly Async-Updates** | Woche 3-7 | Loom-Video oder Notion-Update | Fortschritt transparent halten, Blocker früh identifizieren | 5-10 Min/Woche |
| **Template-Review** | Woche 6 | Async oder kurzer Call | E-Mail-Templates, Workflow-Texte reviewen | 30 Min |
| **Milestone-Review Call** | Ende Woche 7 | Video-Call, Live-Demo | Workflows live demonstrieren, Feedback einholen | 60 Min |
| **UAT-Briefing** | Start Woche 7-8 | Video-Call | Testplan erklären, UAT-Prozess walkthrough | 30 Min |
| **UAT-Sign-Off** | Ende Woche 8 | Schriftlich | Formale Abnahme vor Go-Live | Async |
| **Onboarding-Call** | Woche 9 | Video-Call | User-Training, Fragen klären | 90-120 Min |
| **Handover-Call** | Woche 9 | Video-Call | Access, Doku, nächste Schritte | 30 Min |
| **Retainer-Kick-off** | Woche 9 | Video-Call | Retainer-Scope, Kommunikationskanäle, SLAs | 30 Min |
| **Post-Launch Check-Ins** | Woche 10-13 | kurzer Call oder async | Offene Punkte, Bugs, Optimierungen | 15 Min/Woche |
| **Retainer-Review** | Ende Woche 13 | Video-Call | Nächste Entwicklungsschritte, Upsell-Opportunitäten | 45 Min |

---

## Risk-Register

| # | Risk | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Customer-POC nicht verfügbar für UAT → Verzögerung Go-Live | Hoch | Hoch | UAT-Zeitfenster vertraglich festlegen; UAT-Start-Date 2 Wochen vorab bestätigen; Eskalationspfad zu Entscheider definieren |
| **R2** | Daten-Export aus altem Tool unmöglich/inkonsistent | Mittel | Mittel | Pre-Migration-Assessment in Woche 1; Customer liefert Test-Export vor Phase 4; Bereinigungsaufwand als möglichen CR kommunizieren |
| **R3** | Scope-Creep durch "ach, eigentlich wollte ich noch..." nach Discovery-Sign-Off | Hoch | Hoch | Schriftlicher Discovery-Sign-Off als harter Gate; CR-Policy transparent kommuniziert vor Kick-off; Requirements-Doc versioniert |
| **R4** | E-Mail-Provider-Integration blockiert durch IT-/Security-Policies des Customers | Mittel | Mittel | Credentials-/Access-Anfrage in Woche 1 anstoßen; Fallback (SMTP statt OAuth) in Architecture-Plan vorsehen |
| **R5** | Workflows funktionieren in Test, versagen bei realen Daten-Variationen | Mittel | Hoch | Edge-Case-Testing mit realen (anonymisierten) Customer-Daten in Phase 3; UAT explizit auf Rand-Szenarien ausgelegt |

---

## Quality-Gates

| Gate | Wann | Wer nimmt ab | Kriterium | Konsequenz bei Fail |
|---|---|---|---|---|
| **QG-1: Discovery-Sign-Off** | Ende Woche 2 | Founder + Customer-POC | Requirements-Doc + Workflow-Map unterschrieben | Build startet nicht |
| **QG-2: Core-Build-Ready** | Ende Woche 5 | Engineering Lead | Core-Features ohne Crash, Demo-Ready | Keine Phase-3-Start |
| **QG-3: Workflow-Validation** | Ende Woche 7 | Engineering + Customer-Success | Alle Workflows 3x getestet, Formular-to-CRM end-to-end ok | Milestone-Review verschoben |
| **QG-4: UAT-Sign-Off** | Ende Woche 8 | Customer-POC schriftlich | Kein offener P0/P1-Bug, Migration validiert | Go-Live blockiert |
| **QG-5: Handover-Complete** | Ende Woche 9 | Customer-Success | Alle Zugänge übergeben, Doku fertig, Onboarding durchgeführt | Retainer startet nicht |

---

## Handover-Package

| Asset | Format | Wo übergeben |
|---|---|---|
| System-Dokumentation (Felder, Workflows, Rollen, Integrationen) | Notion oder PDF | Shared Notion Space oder Google Drive |
| Video-Walkthrough: CRM-Grundfunktionen (Kontakte, Deals, Pipeline) | Loom, ~5 Min | Notion oder Google Drive |
| Video-Walkthrough: Workflow-Engine-Übersicht (was läuft automatisch) | Loom, ~5 Min | Notion oder Google Drive |
| Video-Walkthrough: Reporting-Dashboard | Loom, ~3 Min | Notion oder Google Drive |
| Video-Walkthrough: Admin-Bereich (User-Management, Rollen) | Loom, ~3 Min | Notion oder Google Drive |
| Workflow-Map (visuelle Übersicht aller Automatisierungen) | Miro/Figma/PDF | Shared Notion Space |
| Migration-Validation-Report (Record-Count, Duplikats-Check) | PDF | Google Drive |
| Admin-Credentials + Access-Übersicht | 1Password Shared Vault oder schriftlich gesichert | Direktübergabe |
| Change-Request-Prozess-Erklärer (was tun wenn mehr gebraucht wird) | Notion-Page, 1 Seite | Shared Notion Space |
| Retainer-Scope-Übersicht (was ist included, was ist CR) | Notion-Page, 1 Seite | Shared Notion Space |
\newpage

# 4. Quality-Gate


## Asset-Inventory

| # | Asset | Typ | Status | Wo |
|---|---|---|---|---|
| 1 | CRM-Frontend (deployed, produktiv) | Software | ☐ | Produktiv-URL |
| 2 | Workflow-Engine (alle vereinbarten Automatisierungen aktiv) | Software | ☐ | Backend/Automations-Layer |
| 3 | Formular-Integration (end-to-end aktiv) | Integration | ☐ | CRM + Formular-Tool |
| 4 | E-Mail-Provider-Anbindung (aktiv) | Integration | ☐ | CRM + E-Mail-Provider |
| 5 | E-Mail-Templates (deployed im System) | Content/Config | ☐ | CRM-Template-Library |
| 6 | Rollenbasierte Zugriffslogik (min. 3 Rollen aktiv) | Config | ☐ | User-Management |
| 7 | Reporting-Dashboard (live Daten) | Software | ☐ | CRM-Dashboard |
| 8 | Datenmigration (validierter Import) | Daten | ☐ | CRM-Datenbank |
| 9 | System-Dokumentation (schriftlich) | Dokument | ☐ | Notion/PDF |
| 10 | Video-Walkthroughs (3-5 Videos) | Media | ☐ | Notion/Drive |
| 11 | Workflow-Map (visuell) | Dokument | ☐ | Miro/Figma/PDF |
| 12 | Migration-Validation-Report | Dokument | ☐ | Google Drive/PDF |
| 13 | Admin-Credentials übergeben | Access | ☐ | 1Password/Direktübergabe |
| 14 | UAT-Sign-Off (schriftlich, Customer-POC) | Dokument | ☐ | E-Mail/Notion |
| 15 | Retainer-Scope-Dokument übergeben | Dokument | ☐ | Shared Notion Space |

---

## Sign-Off-Kriterien

| # | Kriterium | Status |
|---|---|---|
| 1 | Alle im Requirements-Doc vereinbarten Features sind deployed und funktional getestet | ☐ |
| 2 | Alle vereinbarten Workflows mit min. 3 Test-Durchläufen validiert, inkl. Edge-Cases | ☐ |
| 3 | Formular-to-CRM End-to-End < 60s Latenz getestet und bestätigt | ☐ |
| 4 | Rollenbasierte Zugriffsrechte: Jede Rolle mit separatem Test-User manuell verifiziert | ☐ |
| 5 | Datenmigration: Record-Count 100% korrekt, Duplikate < 2%, Pflichtfelder befüllt | ☐ |
| 6 | Reporting-Dashboard-Daten mit Rohdaten abgestimmt (Stichprobe min. 20 Records) | ☐ |
| 7 | Performance: Seitenladezeit < 2s bei 1.000 Records; API-Response < 500ms (getestet) | ☐ |
| 8 | Alle Zugänge (Admin, Integrationen, Datenbank) an Customer übergeben und bestätigt | ☐ |
| 9 | Komplettes Handover-Package (Doku, Videos, Workflow-Map, Validation-Report) übergeben | ☐ |
| 10 | Schriftlicher UAT-Sign-Off von Customer-POC vor Go-Live liegt vor | ☐ |

**Delivery gilt erst dann als abgeschlossen, wenn alle 10 Punkte auf ✅ stehen. Kein Retainer-Start ohne vollständigen Sign-Off.**

---

## Known-Limitations (Phase-2-Items)

Diese Items sind bewusst aus dem aktuellen Scope ausgeschlossen und als potenzielle Phase-2-Erweiterungen dokumentiert:

| Item | Warum nicht jetzt | Empfohlener Next-Step |
|---|---|---|
| AI-Deal-Scoring / Lead-Qualifizierung | Erfordert Trainings-Datensatz + ML-Layer — separater Aufbau | → sales-os Modul |
| Automatisierter Outbound (Sequences ohne manuellen Trigger) | Deliverability-Risiko ohne separates Warming-Setup | → ai-lead-engine |
| Native Mobile App | Anderer Tech-Stack, separates Projekt | Separates Angebot auf Anfrage |
| Erweiterte Multi-Source-Reporting-Pipeline | Datenbankarchitektur müsste erweitert werden | → database-system Modul |
| Mehrsprachiges Interface | Lokalisierungs-Layer nicht im aktuellen Build | Phase-2-CR bei Bedarf |
| Vollautomatisierte Rechnungsstellung | ERP-Logik außerhalb CRM-Scope | Separater ERP-Track |

---

## DB-Update-Befehl

```sql
-- AEVUM Service-Delivery-Tracking
UPDATE service_deliveries
SET
  status                = 'completed',
  sign_off_date         = CURRENT_DATE,
  handover_complete     = TRUE,
  retainer_active       = TRUE,
  phase2_items_logged   = TRUE,
  notes                 = 'website-crm DFY delivery complete. All 10 sign-off criteria met. Phase-2 items documented: AI-scoring, outbound-sequences, mobile-app, multi-source-reporting. Retainer started post-handover.'
WHERE
  item_slug             = 'website-crm'
  AND customer_id       = :customer_id
  AND delivery_phase    = 'phase-5-handover';

-- Upsell-Tracking eintragen
INSERT INTO upsell_pipeline (customer_id, source_item_slug, target_item_slug, trigger_condition, status, created_at)
VALUES
  (:customer_id, 'website-crm', 'sales-os',                'deal-scoring-request',           'open', NOW()),
  (:customer_id, 'website-crm', 'ai-lead-engine',           'outbound-automation-request',    'open', NOW()),
  (:customer_id, 'website-crm', 'command-center-dashboard', 'cross-tool-visibility-request',  'open', NOW()),
  (:customer_id, 'website-crm', 'database-system',          'advanced-reporting-request',     'open', NOW());
```

---

## Pattern-Notes für DFY-Builder-Pattern

**Service-Kern:** `website-crm` ist der Interface-Layer-Service. Das Differenzierungsmerkmal gegenüber generischen CRM-Tools ist die vollständige Anpassung an die Kunden-Logik — kein Mapping des Kunden auf ein Standard-Datenmodell, sondern Bau des Datenmodells nach Kunden-Prozess.

**Kritische Design-Entscheidungen:**
- Discovery-Sign-Off als hartes Gate ist nicht verhandelbar — Scope-Creep bei CRMs ist der häufigste Delivery-Killer
- Workflow-Anzahl muss im Vertrag fixiert sein (nicht "alle die wir brauchen") — klare Zahl, klare CR-Policy
- Migration ist immer ein Risikopunkt — Pre-Assessment in Woche 1 ist Pflicht, nicht optional
- UAT muss vom Customer-Team durchgeführt werden, nicht nur vom POC — echter User-Acceptance-Test

**Upsell-Logik:** Das CRM ist naturgemäß der Einstiegspunkt für weitere Systeme. Nach 2-3 Monaten entstehen typisch zwei Bedürfnisse: (a) Daten rein bekommen (→ ai-lead-engine) und (b) Daten auswerten (→ database-system / command-center-dashboard). Diese Trigger aktiv im Retainer-Review beobachten.

**Pricing-Anker:** Setup-Kosten sind bei CRMs höher gerechtfertigt als bei anderen Services, weil der Wechselkosten-Effekt nach Go-Live hoch ist. Customer verlässt selten ein gut gebautes Custom-CRM — Retainer-Churn ist niedrig wenn Delivery sauber.

**Anti-Pattern vermeiden:** Kein Feature-Bau ohne schriftliche Anforderung. Mündliche Absprachen in CRM-Projekten erzeugen garantiert Konflikte in Phase 4. Jedes Feature muss im Requirements-Doc stehen.