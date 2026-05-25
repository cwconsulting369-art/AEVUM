# Delivery-Plan: Custom CRM-Frontend mit Workflow-Engine

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