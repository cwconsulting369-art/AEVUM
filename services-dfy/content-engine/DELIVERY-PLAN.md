# Content Engine — Delivery-Plan (Intern)

## Phasen

### Phase 1: Discovery & Foundation (W1–W2)

**Deliverables:**
- Brand-Voice-Workshop durchgeführt + Dokumentation abgeschlossen
- Brand-Voice-Profil v1 (Dokument: Tonalität, Sprach-Muster, Tabus, Beispiele)
- Content-Typen-Briefings (je 1 Seite pro Typ: Format, Länge, CTA, Zielgruppe)
- Stack-Entscheidung dokumentiert (Notion vs. Airtable, Publishing-Tools bestätigt)
- API-Verfügbarkeit der Publishing-Destinations bestätigt
- Publishing-Frequenz + Ziel-Plattformen dokumentiert

**Customer-Touchpoints:**
- Kick-off Call (60 Min): Ziele, Timelines, Voraussetzungen
- Brand-Voice-Workshop (90 Min): Tone, Beispiele, Anti-Patterns
- Discovery-Summary per E-Mail nach W2

---

### Phase 2: Intake-Layer & Drafting-Engine (W3–W4)

**Deliverables:**
- Intake-Pipeline live (Formular + mind. eine weitere Input-Methode je nach Setup)
- Ideen-Backlog im Board eingerichtet
- Prompt-Chain v1 für alle vereinbarten Content-Typen
- 5–10 Test-Drafts produziert und mit Customer reviewt
- Prompt-Adjustments auf Basis Feedback (max. 2 Feedback-Runden)
- Repurposing-Prompt-Chain v1

**Customer-Touchpoints:**
- Weekly Sync W3 (30 Min): Intake-Demo, offene Fragen
- Draft-Review-Session W4 (45 Min): Customer reviewed Test-Drafts live, gibt strukturiertes Feedback
- Schriftliches Feedback-Formular nach Draft-Review

---

### Phase 3: Workflow, Publishing & Repurposing (W5–W6)

**Deliverables:**
- Review-Workflow live (Status-Tracking, Notifications)
- Publishing-Connectors zu allen vereinbarten Destinations
- Test-Posts erfolgreich gepublisht auf allen Destinations
- Repurposing-Modul live und getestet
- Content-Kalender-View eingerichtet mit Filter-Views
- Error-Handling und Notification-System aktiv

**Customer-Touchpoints:**
- Weekly Sync W5 (30 Min): Workflow-Demo, Publishing-Test-Walk
- Milestone-Review W6 (60 Min): Live-Demo gesamtes System bis Publishing; Customer-Freigabe für Phase 4

---

### Phase 4: Analytics, Hardening & Documentation (W7–W8)

**Deliverables:**
- Analytics-Daten-Pull aus allen vereinbarten Quellen live
- Wöchentlicher automatisierter Performance-Report konfiguriert
- Erster automatischer Report manuell verifiziert
- SOPs für Intake, Review, Publishing (Schriftform)
- Video-Walkthroughs für alle 3 Kernflows (Loom oder gleichwertig)
- UAT-Phase: System läuft 5 Werktage ohne kritischen Fehler
- Go-Live-Freigabe

**Customer-Touchpoints:**
- Weekly Sync W7 (30 Min): Analytics-Demo
- UAT-Review W8 (45 Min): Customer testet selbst, gibt formales Go-Live-Feedback
- Go-Live-Bestätigung schriftlich

---

### Phase 5: Go-Live & 30-Tage-Support (W9–W12)

**Deliverables:**
- Offizieller Go-Live
- Retainer-Onboarding-Dokument übergeben
- Handover-Package vollständig (siehe unten)
- Prompt-Finetuning auf Basis erster Live-Produktions-Daten
- Bug-Fixes innerhalb 48h (kritisch) / 5 Werktage (minor)
- Retainer-Scope und SLAs schriftlich bestätigt

**Customer-Touchpoints:**
- Go-Live-Call (30 Min): Gratulation, Handover-Walk, Retainer-Erklärung
- Check-in W10 (20 Min): Erste Woche Live — wie läuft's?
- 30-Tage-Retro W12 (45 Min): Performance-Review, offene Punkte, Retainer-Start-Bestätigung

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|---|---|---|---|---|---|
| **Founder / Lead Stratege** | 60% — Brand-Voice-Workshop, Content-Strategie-Input, Customer-Alignment | 20% — Prompt-Strategy-Review | 10% — Milestone-Freigabe | 10% — Final-Sign-Off | 10% — Retainer-Übergabe |
| **Senior Automation Engineer** | 20% — Stack-Audit, Tech-Entscheidungen | 70% — Intake-Pipeline, Prompt-Chain-Build | 80% — Workflow, Connectors, Repurposing | 60% — Analytics-Layer, Hardening | 40% — Bug-Fixing, Prompt-Finetuning |
| **Junior Automation Engineer** | — | 30% — Intake-Formular, Board-Setup | 20% — Test-Posts, Error-Handling | 30% — SOP-Dokumentation-Support, UAT-Tests | 20% — Support-Tickets |
| **Customer Success** | 20% — Kick-off Call, Onboarding-Koordination | 10% — Weekly Syncs | 10% — Weekly Syncs, Milestone-Review | 20% — UAT-Koordination, Docs-Review | 30% — Go-Live, 30-Tage-Support, Retainer-Übergabe |

---

## Customer-Onboarding-Touchpoints (Übersicht)

| Touchpoint | Zeitpunkt | Format | Dauer | Owner |
|---|---|---|---|---|
| Kick-off Call | W1 Tag 1–2 | Video-Call | 60 Min | Founder + CS |
| Brand-Voice-Workshop | W1–W2 | Video-Call | 90 Min | Founder |
| Discovery-Summary | W2 Ende | E-Mail + Dokument | — | CS |
| Weekly Sync | W3, W5, W7 | Video-Call | 30 Min | CS + Eng |
| Draft-Review-Session | W4 | Video-Call | 45 Min | Eng + CS |
| Milestone-Review (Phase 3 Abschluss) | W6 | Video-Call | 60 Min | Founder + Eng + CS |
| UAT-Review | W8 | Video-Call | 45 Min | CS + Eng |
| Go-Live-Call | W9 | Video-Call | 30 Min | CS |
| W10-Check-in | W10 | Video-Call oder Async | 20 Min | CS |
| 30-Tage-Retro | W12 | Video-Call | 45 Min | Founder + CS |

---

## Risk-Register

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|
| **Brand-Voice-Profil unscharf** — Customer kann nicht klar artikulieren was "seine Stimme" ist; Drafts passen nicht, Feedback-Loops eskalieren | Hoch (60%) | Hoch — verzögert Phase 2 und 3 erheblich | Vor Workshop: Customer bekommt Voice-Profil-Template zum Ausfüllen + muss 10 "Best-of"-Texte einreichen. Workshop mit konkrete Beispiel-Drafts live reviewen statt abstrakt diskutieren. |
| **API-Probleme bei Publishing-Destinations** — Plattform-APIs ändern sich, limitieren Zugang oder erfordern Verifizierungen (z. B. LinkedIn API Restrictions, Meta Business-Verifizierung) | Mittel (40%) | Mittel — einzelne Destinations können nicht automatisch angebunden werden | Stack-Audit in W1 explizit als Go/No-Go Gate. Fallback: Buffer/Taplio als Middleware. Customer-Kommunikation sofort wenn Blocker identifiziert. |
| **Review-Disziplin beim Customer bricht ein** — Draft-Backlog akkumuliert, Customer reviewed nicht rechtzeitig, System "hängt" | Hoch (50%) | Mittel — kein direkter Build-Blocker, aber Retainer-Wert sinkt | Wöchentliche Reminder-Automation im Board. In Retainer-Onboarding klare Erwartung: Review-Backlog >7 Tage = CS-Eskalation. |
| **Prompt-Chain-Output qualitativ nicht ausreichend** — AI-Output entspricht nicht Brand-Voice, Nachbearbeitungsaufwand höher als 20% | Mittel (35%) | Hoch — Customer-Zufriedenheit und Retainer-Risk | Max. 2 Feedback-Runden in Phase 2 geplant + budgetiert. Nach Runde 2: explizites Alignment ob Erwartung realistisch ist. Notfall-Option: Manual-Assist-Flow einbauen (AI-Entwurf + kurze Human-Veredelung). |
| **Scope-Creep durch "noch eine Plattform"** — Customer sieht das System laufen und will sofort 3 weitere Destinations und 2 neue Content-Typen | Sehr hoch (70%) | Mittel — Margin-Erosion, Team-Überlastung | Change-Request-Policy in W1-Kick-off explizit erklären. Schriftlich bestätigen lassen. CS-Rolle: freundlich aber konsequent blockieren ohne schriftliche Freigabe + Budget. |

---

## Quality-Gates

| Gate | Zeitpunkt | Kriterium | Wer nimmt ab |
|---|---|---|---|
| **QG-1: Discovery-Abschluss** | Ende W2 | Brand-Voice-Profil vom Customer als "korrekt" bestätigt; Stack-Entscheidung dokumentiert; alle Zugänge vorhanden | Founder |
| **QG-2: Draft-Quality** | Ende W4 | Customer bewertet min. 3 Test-Drafts pro Content-Typ als "verwendbar ohne wesentliche Überarbeitung" | Senior Eng + Founder |
| **QG-3: Publishing-Live** | Ende W6 | Test-Posts auf allen Destinations erfolgreich; Milestone-Review vom Customer freigegeben | Senior Eng + CS |
| **QG-4: Analytics-Verifizierung** | W7 | Erster automatischer Report manuell gegen Plattform-Zahlen gegengeprüft; keine Diskrepanz >5% | Senior Eng |
| **QG-5: UAT-Clearance** | Ende W8 | 5 Werktage stabiler Betrieb; Customer hat UAT-Feedback gegeben; alle kritischen Issues geschlossen | CS + Founder |
| **QG-6: Handover-Complete** | W9 | Alle Handover-Package-Items übergeben und vom Customer bestätigt | CS |

---

## Handover-Package

| Item | Format | Inhalt |
|---|---|---|
| **System-Dokumentation** | Notion-Seite oder PDF | Vollständige Architektur-Übersicht: alle Flows, Tools, Verbindungen, API-Keys-Ablage-Hinweise |
| **Brand-Voice-Profil v1.0** | Google-Doc / Notion | Finales Profil inkl. Beispiel-Prompts, Anti-Patterns, Revision-History |
| **SOP: Content-Intake** | Schrift + Loom-Video | Schritt-für-Schritt wie Ideen ins System kommen |
| **SOP: Draft-Review & Approval** | Schrift + Loom-Video | Review-Flow, Status-Transitions, wo Feedback hinterlegt wird |
| **SOP: Publishing & Monitoring** | Schrift + Loom-Video | Publishing-Check, Fehler-Erkennung, was bei Fehler zu tun ist |
| **Prompt-Library** | Notion-Tabelle oder Google-Doc | Alle Prompts mit Version, Datum, Änderungshistorie |
| **Analytics-Report-Vorlage** | Automatisiert / Link | Wöchentlicher Report — Link + Erklärung wie zu lesen |
| **Retainer-Scope-Dokument** | PDF | Was der Retainer abdeckt, SLAs, Eskalationswege, Ansprechpartner |
| **Emergency-Runbook** | Einfaches Dokument | Was tun wenn: Publishing-Fehler / API-Key abgelaufen / Report kommt nicht an |
| **Access-Inventory** | Tabelle | Alle Tools + Zugangswege + wer beim Customer Admin ist |