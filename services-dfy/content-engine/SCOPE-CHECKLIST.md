# Content Engine — Scope-Checklist (Intern / Sales-Calls)

## In-Scope

| Kategorie | Item | Aufwand-Estimate |
|---|---|---|
| **Discovery** | Brand-Voice-Workshop (1× 90-Min-Call + Dokumentation) | 4h |
| **Discovery** | Content-Typen-Definition (max. 4 Typen, je Briefing-Dokument) | 3h |
| **Discovery** | Publishing-Stack-Audit (Zugang, API-Verfügbarkeit, Limits prüfen) | 2h |
| **Intake-Layer** | Input-Form oder Webhook für strukturierten Ideen-Intake | 6h |
| **Intake-Layer** | Voice-Memo-Transkriptions-Flow (Whisper-API oder nativ) | 4h |
| **Intake-Layer** | URL/RSS-Import-Flow für externe Content-Quellen | 4h |
| **AI-Drafting** | Prompt-Chain Entwicklung pro Content-Typ (je 2–4h) | 8–16h |
| **AI-Drafting** | Brand-Voice-Profil in Prompt-System integrieren | 3h |
| **AI-Drafting** | Test-Drafts produzieren + mit Customer reviewen (2 Runden) | 4h |
| **Review-Workflow** | Status-Tracking (Draft/Review/Approved/Scheduled) im Board | 4h |
| **Review-Workflow** | Notification-System (Slack oder E-Mail bei neuem Draft) | 2h |
| **Publishing** | Connector zu 2 (M) / 4 (L) Publishing-Destinations | 6–12h |
| **Publishing** | Scheduled-Post-Handling + Error-Notification | 3h |
| **Repurposing** | 1 Repurposing-Flow (z. B. Blog → LinkedIn + Newsletter-Snippet) | 6h |
| **Content-Kalender** | Board-Setup in Notion oder Airtable mit Filter-Views | 4h |
| **Analytics** | Daten-Pull aus verbundenen Plattformen (max. 4 Sources) | 8h |
| **Analytics** | Wöchentlicher automatisierter Performance-Report | 5h |
| **Dokumentation** | SOPs für Intake, Review, Publishing (Schriftform + Video) | 6h |
| **Post-Launch** | 30-Tage-Bug-Fix + Prompt-Adjustment-Support | 8h Budget |

**Total-Estimate Tier M:** 90–110h  
**Total-Estimate Tier L:** 140–180h

---

## Out-of-Scope

| Was NICHT enthalten ist | Warum explizit erwähnenswert |
|---|---|
| Content-Strategie-Entwicklung (Themen, Positionierung, Zielgruppen-Definition) | Customers erwarten das oft implizit — muss im Sales-Call geklärt werden |
| Foto-/Video-/Grafik-Produktion oder Design-Templates | "Content-Engine" klingt für manche nach Full-Service-Content-Agentur |
| SEO-Keyword-Research, On-Page-Optimierung, SERP-Tracking | Technisch separates Feld, anderer Tool-Stack |
| Social-Listening, Community-Management, Kommentar-Antworten | Automatisiertes Community-Management ist eigener Scope |
| Paid-Ad-Copy oder Performance-Creative-Produktion | Separates Offering: script-factory-dfy |
| CRM-Integration / Lead-Attribution von Content-Pieces | Braucht sales-os oder ai-lead-engine als Basis |
| Mehr Content-Typen als vereinbart ohne Change-Request | Jeder zusätzliche Typ = 2–4h Prompt-Chain-Aufwand |
| Mehr als vereinbarte Publishing-Destinations | API-Limits, Auth-Handling, Error-Handling = messbarer Zusatz-Aufwand |
| Laufendes Content-Ghostwriting durch AEVUM-Team | Wir bauen die Maschine, wir sind nicht die Autoren im Retainer |
| Training neuer Mitarbeiter beim Customer | Dokumentation ja, Onboarding-Schulungen über Handover hinaus nein |

---

## Voraussetzungen Customer-Side

| Anforderung | Format | Wer | Wann benötigt |
|---|---|---|---|
| Admin-Zugang zu Publishing-Accounts | Login-Credentials oder API-Keys | Customer-Admin | Woche 1 |
| Mind. 10 Content-Samples (bestehende Texte) | Google-Doc-Folder, Notion-Seite oder PDF | Customer | Vor Brand-Voice-Workshop |
| Brand-Voice-Workshop Teilnahme | 90-Min-Video-Call | Entscheidungsträger | Woche 1 |
| Klare Content-Typen-Briefings | Ausgefülltes AEVUM-Briefing-Template | Customer | Nach Workshop, vor Woche 3 |
| Review-Person festgelegt + verfügbar | Min. 2h/Woche für Draft-Approval | Customer intern | Während gesamter Implementation |
| Tool-Entscheidung Notion vs. Airtable | Schriftliche Bestätigung | Customer | Woche 1 |
| Publishing-Frequenz-Ziel definiert | Schriftlich dokumentiert | Customer | Woche 1 |
| Access für Analytics-Quellen (Plattform-APIs) | API-Keys oder oAuth-Zugang | Customer-Admin | Woche 6 spätestens |

---

## Quality-Standards

| Bereich | Standard für "Done" |
|---|---|
| **Brand Voice** | 3 unabhängige Test-Drafts werden vom Customer ohne wesentliche Nachbearbeitung als "authentisch" eingestuft |
| **Intake-Flow** | Jede Input-Methode (Formular, Voice, URL) erzeugt zuverlässig einen strukturierten Backlog-Eintrag ohne manuelle Korrektur |
| **Drafting-Engine** | Drafts entsprechen definiertem Content-Typ-Format; max. 20% strukturelle Nachbearbeitung notwendig laut Customer-Feedback |
| **Review-Workflow** | Status-Transitions funktionieren fehlerfrei; Notifications kommen innerhalb 5 Min an |
| **Publishing-Connector** | Testposts landen korrekt auf Ziel-Plattformen; Fehler werden notifiziert; kein Silent-Fail |
| **Repurposing-Modul** | Output aus Repurposing entspricht Zielformat-Anforderungen ohne manuelles Reformatieren |
| **Analytics-Report** | Report enthält Daten aus allen verbundenen Quellen; ist wöchentlich automatisch verfügbar; keine manuellen Schritte nötig |
| **Dokumentation** | SOPs decken alle 3 Kernflows ab; Video-Walkthroughs vollständig aufgezeichnet |
| **Stabilität** | System läuft 7 Tage ohne kritische Fehler in UAT-Phase bevor Go-Live |

---

## Change-Request-Policy

**Was als Change-Request gilt:**
- Jeder neue Content-Typ über vereinbarte Anzahl hinaus
- Jede neue Publishing-Destination über vereinbarte Anzahl hinaus
- Grundlegende Änderung der Brand-Voice-Definition nach Abschluss Phase 2
- Integration neuer Input-Quellen die nicht in Discovery definiert wurden
- Neue Analytics-Quellen oder Reporting-Dimensionen

**Prozess:**
1. Customer stellt Anfrage schriftlich (Slack / E-Mail)
2. AEVUM schätzt Aufwand innerhalb 48h
3. Schriftliche Freigabe durch Customer vor Umsetzung
4. Abrechnung: €150/h oder als Paket wenn Aufwand >8h

**Was KEIN Change-Request ist:**
- Bug-Fixes innerhalb des definierten Scopes
- Prompt-Adjustments innerhalb des bestehenden Content-Typs
- Kleinere UI/Formatting-Änderungen im Board (<1h)

---

## Pricing-Variations

| Add-On / Variation | Auswirkung auf Setup | Auswirkung auf Retainer |
|---|---|---|
| +1 zusätzlicher Content-Typ | +€1.200 – €1.800 | +€200/Mo (Prompt-Maintenance) |
| +1 zusätzliche Publishing-Destination | +€800 – €1.500 | +€100/Mo |
| +1 zusätzliche Marke/Brand (Agentur) | +€3.000 – €5.000 | +€500–€800/Mo |
| Voice-Memo-Flow (falls nicht in Base) | +€600 | — |
| Custom Analytics-Dashboard (statt Standard-Report) | +€2.500 – €4.000 | +€300/Mo |
| SEO-Layer (Keyword-Mapping auf Content-Typen) | +€2.000 | +€400/Mo |
| White-Label für Agentur-Clients | +€1.500 Setup | +€300/Mo Lizenz-Handling |
| Onboarding neuer Agentur-Client in bestehendem System | Nicht im Setup | €800/Client (Retainer-Add-On) |