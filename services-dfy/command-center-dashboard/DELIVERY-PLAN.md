# Command Center Dashboard — Delivery-Plan
### Internes Playbook für AEVUM-Team

---

## Phasen

### Phase 1: Discovery & Data-Audit (W1-2)

**Ziel:** Vollständiges Bild der Datenlandschaft, KPI-Priorisierung, technische Machbarkeits-Klärung

| Deliverable | Owner | Status-Marker |
|---|---|---|
| Kick-off-Call durchgeführt (Agenda: Tools, KPIs, Ziele, Timeline) | Founder / CS | [ ] |
| Data-Source-Inventory (alle Tools, APIs, Datenstrukturen) | Eng | [ ] |
| KPI-Workshop-Output: priorisierte KPI-Liste (Top-10-15) | Founder + Customer | [ ] |
| API-Machbarkeits-Check für alle genannten Quellen | Eng | [ ] |
| Discovery-Bericht an Customer (1-Pager: was wir verstanden haben) | CS | [ ] |

**Customer-Touchpoint:** Kick-off-Call (90 Min.), Discovery-Bericht-Review (async, 24h Feedback-Fenster)

---

### Phase 2: Architektur & Wireframes (W2-4)

**Ziel:** Datenmodell steht, Dashboard-Design ist approved, Scope ist eingefroren

| Deliverable | Owner | Status-Marker |
|---|---|---|
| Datenmodell-Schema (welche Tabellen, welche Felder, welche Relationen) | Eng | [ ] |
| Update-Frequenz-Entscheidung pro Quelle (dokumentiert) | Eng | [ ] |
| Dashboard-Wireframes (Figma oder äquivalent) für alle vereinbarten Views | Founder / Design | [ ] |
| Rollen-Matrix (wer sieht was) | Founder + Customer | [ ] |
| **Wire-Approval durch Customer (schriftlich)** | Customer | [ ] |
| Scope-Freeze-Confirmation (alle Datenquellen und KPIs eingefroren) | CS | [ ] |

**Customer-Touchpoint:** Wire-Review-Call (60 Min.), schriftlicher Approval via E-Mail

**Quality-Gate 1:** Wire-Approval + Scope-Freeze vor Phase-3-Start — kein Weiterarbeiten ohne beides.

---

### Phase 3: Daten-Pipeline-Build (W3-7)

**Ziel:** Alle Datenquellen angebunden, Normalisierung läuft, Daten landen sauber in intermediärer DB

| Deliverable | Owner | Status-Marker |
|---|---|---|
| Intermediäre Datenbank aufgesetzt (Schema deployed) | Eng | [ ] |
| Quelle 1 angebunden + getestet | Eng | [ ] |
| Quelle 2 angebunden + getestet | Eng | [ ] |
| Quelle 3 angebunden + getestet | Eng | [ ] |
| Quelle 4 angebunden + getestet | Eng | [ ] |
| *(Tier L: Quellen 5-10 analog)* | Eng | [ ] |
| Transformations-Jobs laufen stabil (24h Monitoring ohne manuelle Eingriffe) | Eng | [ ] |
| Fehler-Logging aktiv (Alerts wenn Quelle down oder Daten-Anomalie) | Eng | [ ] |
| Internes Daten-Validierungs-Protokoll (Eng prüft: sind Zahlen plausibel?) | Eng | [ ] |

**Customer-Touchpoint:** Wöchentlicher Sync (15 Min., Status-Update, Blocker-Reporting)

**Quality-Gate 2:** Internes Daten-Validierungs-Protokoll abgeschlossen vor Frontend-Start. Eng-Lead signiert ab.

---

### Phase 4: Frontend-Build (W5-8)

**Ziel:** Dashboard ist gebaut, gebrandnet, Rollen sind konfiguriert, Alerts live

| Deliverable | Owner | Status-Marker |
|---|---|---|
| Dashboard-Plattform aufgesetzt (Softr / Retool / Looker Studio / Custom — je nach Entscheidung Phase 2) | Eng | [ ] |
| View 1 gebaut und mit Daten verbunden | Eng | [ ] |
| View 2 gebaut und mit Daten verbunden *(falls in Scope)* | Eng | [ ] |
| Branding angewendet (Logo, Farben, Typografie) | Eng / Design | [ ] |
| Rollen-Setup und Access-Management konfiguriert | Eng | [ ] |
| Alerting-Konfiguration (Threshold-Alerts, Slack/Mail-Integration) | Eng | [ ] |
| Interner Review-Call (Founder + Eng: entspricht Dashboard dem Wire-Approval?) | Founder + Eng | [ ] |

**Customer-Touchpoint:** Interim-Preview-Demo (optional, 30 Min.) — Customer sieht ersten Stand vor UAT

**Quality-Gate 3:** Interner Founder-Review vor UAT-Übergabe. Dashboard muss Wire-Approval entsprechen.

---

### Phase 5: UAT & Refinement (W7-9)

**Ziel:** Customer testet, Feedback wird verarbeitet, Dashboard ist production-ready

| Deliverable | Owner | Status-Marker |
|---|---|---|
| UAT-Zugang für Customer-Ansprechpartner bereitgestellt | Eng | [ ] |
| UAT-Briefing an Customer (was testen, wie Feedback melden) | CS | [ ] |
| Feedback-Runde 1 gesammelt und priorisiert | CS | [ ] |
| Fixes und Anpassungen Runde 1 implementiert | Eng | [ ] |
| Feedback-Runde 2 *(falls nötig)* | CS | [ ] |
| Fixes und Anpassungen Runde 2 *(falls nötig)* | Eng | [ ] |
| Spot-Check-Validierung: 10 KPIs manuell gegen Quell-Tool geprüft | Eng | [ ] |
| Performance-Check: Ladezeit < 3s unter realen Bedingungen | Eng | [ ] |
| **Customer-Sign-Off nach UAT (schriftlich)** | Customer | [ ] |

**Customer-Touchpoint:** UAT-Kick-off (30 Min.), Feedback-Review-Call nach Runde 1 (45 Min.)

**Quality-Gate 4:** Schriftlicher Customer-Sign-Off + alle Quality-Standards aus Scope-Checklist erfüllt.

---

### Phase 6: Go-Live & Handover (W8-10)

**Ziel:** Dashboard live, Customer ongeboardet, Retainer-Betrieb gestartet

| Deliverable | Owner | Status-Marker |
|---|---|---|
| Production-Environment live geschaltet | Eng | [ ] |
| Alle User-Zugänge erstellt und versandt | Eng | [ ] |
| Onboarding-Session live durchgeführt (60 Min.) | Founder / CS | [ ] |
| Walkthrough-Video aufgenommen und übergeben | CS | [ ] |
| Technische Dokumentation übergeben | Eng | [ ] |
| 30-Tage-Post-Launch-Support-Fenster kommuniziert | CS | [ ] |
| Retainer-Onboarding: monatlicher Check-in-Rhythmus kommuniziert | CS | [ ] |
| Internes Projekt-Retro (Was lief gut? Was verbessern?) | Founder + Team | [ ] |

**Customer-Touchpoint:** Onboarding-Session (60 Min. live), 30-Tage-Check-in-Call (30 Min. nach Go-Live)

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|---|---|---|---|---|---|---|
| **Founder** | Lead (KPI-Workshop, Strategie) | Approval-Loop, Wire-Sign-Off | Oversight | Interner Review | Eskalation bei CRs | Onboarding-Session |
| **Engineering** | API-Machbarkeits-Check | Datenmodell, Schema | Haupt-Owner (Pipeline) | Haupt-Owner (Frontend) | Fixes, Spot-Check | Go-Live, Doku |
| **Customer Success** | Kick-off-Koordination, Discovery-Bericht | Approval-Koordination | Wöchentlicher Sync | Interim-Preview-Koordination | UAT-Begleitung, CR-Management | Handover, Retainer-Start |

---

## Customer-Onboarding-Touchpoints (Übersicht)

| Touchpoint | Zeitpunkt | Format | Owner AEVUM | Dauer |
|---|---|---|---|---|
| **Kick-off-Call** | W1 | Video-Call | Founder + CS | 90 Min. |
| **Discovery-Bericht-Review** | W1-2 | Async (Dokument) | CS | 24h Feedback-Fenster |
| **Wire-Review-Call** | W3 | Video-Call | Founder | 60 Min. |
| **Wöchentlicher Sync** | W3-W8 | Video-Call oder Slack-Update | CS | 15 Min. |
| **Interim-Preview** | W6-7 (optional) | Video-Call oder Loom | Eng + CS | 30 Min. |
| **UAT-Kick-off** | W7 | Video-Call | CS | 30 Min. |
| **Feedback-Review Runde 1** | W7-8 | Video-Call | CS | 45 Min. |
| **Onboarding-Session** | W9-10 | Video-Call (aufgezeichnet) | Founder + CS | 60 Min. |
| **30-Tage-Check-in** | W13-14 | Video-Call | CS | 30 Min. |

---

## Risk-Register

| Risk | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|
| **API-Zugang fehlt oder ist eingeschränkt** (Customer hat kein Admin-Recht, API nicht freigeschaltet, Third-Party-API erfordert kostenpflichtigen Plan) | Hoch | Hoch — blockiert Pipeline-Build | Discovery-Phase: alle API-Zugänge werden vorab geprüft; Customer bekommt technische Checkliste in W1; kein Phase-3-Start ohne verifizierten Zugang |
| **KPI-Scope-Creep nach Wire-Approval** (Customer entdeckt während UAT neue KPIs die "unbedingt" rein müssen) | Sehr hoch | Mittel — Timeline und Budget-Druck | Scope-Freeze-Confirmation in Phase 2 schriftlich; CR-Policy von Anfang an kommuniziert; UAT-Briefing enthält explizit: "Was wir jetzt testen vs. was ein CR wäre" |
| **Quell-Daten sind dirty / inkonsistent** (z.B. HubSpot-Daten ohne saubere Stage-Definitionen, Stripe mit mehreren Währungen ohne Normalisierung) | Mittel | Hoch — verfälscht Dashboard-Aussage | Data-Audit in Phase 1 identifiziert Qualitätsprobleme; Workarounds werden documented; extreme Fälle: Customer wird auf `database-system` als Vorprojekt hingewiesen |
| **Customer-Ansprechpartner wechselt mid-project** | Niedrig | Mittel — Wissenstransfer-Verlust, Approval-Verzögerung | Alle Entscheidungen schriftlich dokumentiert (E-Mail-Trails, Scope-Dokument); Kick-off-Call aufgezeichnet; bei Wechsel: 1h Re-Briefing als CR einplanen |
| **Plattform-Wahl führt zu Limitations** (z.B. Retool zu teuer für Customer im Betrieb, Looker Studio zu unflexibel für Rollen-Anforderungen) | Mittel | Hoch — kann Rebuild erfordern | Plattform-Entscheidung explizit in Phase 2 mit Pros/Cons dokumentiert und vom Customer approved; kein Rebuild ohne separates Angebot |

---

## Quality-Gates (Zusammenfassung)

| Gate | Zeitpunkt | Kriterium | Sign-Off durch |
|---|---|---|---|
| **QG1: Scope-Freeze** | Ende Phase 2 | Wire-Approval + schriftlicher Scope-Freeze | Founder + Customer |
| **QG2: Pipeline-Validation** | Ende Phase 3 | Internes Daten-Validierungs-Protokoll abgeschlossen | Eng-Lead |
| **QG3: Interner Review** | Ende Phase 4 | Dashboard entspricht Wire-Approval, Rollen korrekt | Founder |
| **QG4: UAT-Sign-Off** | Ende Phase 5 | Customer-Sign-Off + alle Quality-Standards erfüllt | Customer + CS |
| **QG5: Go-Live-Clearance** | Phase 6 Start | Production-Environment stable, alle User-Zugänge ready | Eng + CS |

---

## Handover-Package

Customer erhält am Ende folgendes Paket:

| Asset | Format | Übergabe-Methode |
|---|---|---|
| **Dashboard-Zugang (Production)** | URL + persönliche Login-Daten für alle User | Direkt-E-Mail an jeden User |
| **Data-Flow-Dokumentation** | PDF oder Notion-Seite | Übergabe in Onboarding-Session |
| **Datenmodell-Schema** | Technisches Dokument (Tabellen, Felder, Relationen) | Notion oder PDF |
| **API-Verbindungen-Übersicht** | Tabelle: Tool → API-Endpoint → Update-Frequenz → Auth-Typ | Notion oder PDF |
| **Credentials-Übergabe** | Alle AEVUM-seitig erstellten API-Keys und Service-Accounts | Passwort-Manager-Share (1Password / Bitwarden) oder sicherer E-Mail |
| **Alert-Konfiguration-Übersicht** | Welche Alerts auf welchen Schwellenwerten aktiv | Dokument |
| **Walkthrough-Video** | Aufnahme der Onboarding-Session (60 Min.) | Loom-Link oder Download |
| **CR-und-Retainer-Briefing** | Was der Retainer abdeckt, wie CRs beantragt werden | E-Mail + Dokument |