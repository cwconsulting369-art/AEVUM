# Business-OS — Scope-Checklist (Intern / Sales-Calls)

---

## In-Scope

| Kategorie | Item | Aufwand-Estimate |
|---|---|---|
| **Architecture** | Discovery-Workshops (2x 90 min), Prozess-Mapping, Systemarchitektur-Dokument | 8–12h |
| **Datenbank** | Design und Aufbau des relationalen Datenbankschemas (Entitäten: Contacts, Companies, Deals, Projects, Tasks, Users) | 10–16h |
| **CRM-Modul** | Kontakt-Verwaltung, Deal-Pipeline (customized Stages), Activity-Log, Kommunikationshistorie, Tags/Filter | 12–20h |
| **PM-Modul** | Projekttypen-Templates, Phasen/Meilensteine, Aufgaben-Zuweisung, Status-Tracking, Ressourcen-Übersicht | 12–18h |
| **Dashboard** | Aggregiertes KPI-Board (Revenue, Pipeline, Auslastung, Projekt-Status), automatische Daten-Feeds, mind. 2 Views (Founder / Operations) | 10–15h |
| **AI-Agent (Tier M: 1, Tier L: 2–3)** | Prompt-Design, Kontext-Anbindung an Datenbank, Testing, Deployment — Use-Cases in Discovery definiert | 15–25h pro Agent |
| **Automations-Layer** | Tier M: bis 15 Automationen / Tier L: bis 40 Automationen — konfiguriert in Make/Zapier/n8n, dokumentiert | 20–40h |
| **Onboarding-Flows** | Standardisierter Neukunden- oder Neuprojekt-Onboarding-Flow (1–2 Flows je nach Tier) | 6–10h |
| **Benutzer-Rollen** | Rollen-Design (max. 4 Rollen), Views und Berechtigungen pro Rolle | 4–8h |
| **Dokumentation** | System-Dokumentation (Datenbankstruktur, Automationen, Agent-Prompts), SOP-Templates für Kernprozesse | 8–12h |
| **Testing & QA** | End-to-End-Tests aller Module, Automations-Tests, UAT-Runde mit Customer (1 Feedback-Zyklus) | 8–15h |
| **Handover** | Übergabe-Session (90 min), Screen-Recording-Walkthroughs, 4-8 Wochen Post-Launch-Support-Kanal | 6–10h |

**Gesamtschätzung Tier M:** 120–180h | **Tier L:** 200–320h

---

## Out-of-Scope

| Was NICHT enthalten ist | Warum explizit |
|---|---|
| Buchhaltung, Invoicing, Steuer-Funktionen | Separate Tool-Kategorie (DATEV, Lexware, Stripe-native) — andere Compliance-Logik |
| Daten-Migration aus Altsystemen | Datenqualität ist Customer-Verantwortung; wir können als Add-On beraten, nicht übernehmen |
| Custom API-Entwicklung (Code, nicht Konfiguration) | Geht über No-Code/Low-Code-Scope hinaus — separates Engineering-Angebot |
| Marketing-Automation, Email-Sequences, Ad-Management | Eigenes Service-Angebot (Content-Engine, AI-Lead-Engine) |
| HR, Recruiting, Mitarbeiter-Verwaltung | Anderes Domänen-Wissen + Tool-Stack erforderlich |
| Mobile App oder native Desktop-Applikation | Kein Software-Dev im DFY-Scope |
| Mehr als 2 UAT-Feedback-Runden | Jede weitere Runde = Change-Request |
| Unbegrenzte Nutzer-Onboardings | Wir trainieren max. 2 Key-User; weiteres Team-Onboarding liegt beim Customer |
| Laufende Content-Erstellung im System | Wir bauen die Infrastruktur, Customer füllt sie |
| SLA für Uptime der genutzten SaaS-Plattformen | Plattform-Risiko liegt beim Customer (Notion/Airtable/Make) |

---

## Voraussetzungen Customer-Side

| Kategorie | Anforderung | Kritikalität |
|---|---|---|
| **Ansprechpartner** | 1 dedizierter interner Ansprechpartner mit Entscheidungsbefugnis, 2–4h/Woche verfügbar | KRITISCH |
| **Prozessdokumentation** | Grobe Beschreibung der Kernprozesse (Sales, Projektabwicklung) — muss nicht perfekt sein | HOCH |
| **Tool-Zugänge** | Admin-Zugang zu allen zu integrierenden Tools vor Kick-off | KRITISCH |
| **Bestandsdaten** | Liste der Datenquellen + Zugang (auch wenn unstrukturiert) | HOCH |
| **Team-Commitment** | Klares Management-Commitment, dass das Team das System nutzen wird | HOCH |
| **Feedback-Turnaround** | Max. 72h Feedback-Turnaround in UAT-Phase — sonst Timeline-Verschiebung | MITTEL |
| **Tool-Budget** | Customer trägt SaaS-Kosten der genutzten Plattformen selbst | KRITISCH |
| **Discovery-Zeit** | 2 x 90-min-Discovery-Calls in W1 garantiert eingeplant | KRITISCH |

---

## Quality-Standards

AEVUM erklärt ein Business-OS als **"Done"** wenn folgende Kriterien erfüllt sind:

- [ ] Alle Module (CRM, PM, Dashboard, Agent) laufen in Produktion ohne kritische Fehler
- [ ] Alle vereinbarten Automationen (Tier M: 15 / Tier L: 40) sind dokumentiert und getestet
- [ ] Dashboard zeigt korrekte Live-Daten aus allen Quellen (Abweichung <2% in Stichproben)
- [ ] AI-Agent beantwortet die definierten Use-Cases korrekt in >90% der Testfälle
- [ ] Benutzer-Rollen sind korrekt konfiguriert (Zugriffstests für alle Rollen bestanden)
- [ ] Systemdokumentation ist vollständig und von Nicht-Technikern lesbar
- [ ] Onboarding-Flow läuft erfolgreich durch einen End-to-End-Test mit echten Daten
- [ ] Customer-Ansprechpartner hat Übergabe-Session abgenommen und schriftlich bestätigt
- [ ] Kein offener Bug der Kategorie P1 (systemkritisch) oder P2 (funktional beeinträchtigend)
- [ ] Support-Kanal eingerichtet und Customer weiß, wie er ihn nutzt

---

## Change-Request-Policy

| Szenario | Handling |
|---|---|
| Kleiner Scope-Creep (<4h, innerhalb Modulrahmen) | Intern absorbiert — max. 1x pro Projekt ohne Berechnung |
| Neues Feature / neue Automation innerhalb des vereinbarten Modul-Rahmens | Einschätzung: wenn <8h → Kulanz, wenn >8h → CR mit €200/h Rate |
| Neues Modul oder zusätzliche Integration | Immer Change-Request. Schriftliches Angebot, Customer-Sign-Off vor Umsetzung |
| Prozessänderung durch Customer während Build-Phase | Stop-und-Reassess: Timeline-Impact kommunizieren, ggf. Phase-Reset mit CR |
| Zusätzliche UAT-Runde (>2 Runden) | €1.500 pauschal pro zusätzlicher Feedback-Runde + Timeline-Extension |
| Scope-Reduktion durch Customer | Kein Preis-Reduction-Anspruch nach Kick-off (Architektur-Aufwand bereits entstanden) |

---

## Pricing-Variations

| Add-On / Variation | Aufpreis Setup | Aufpreis Retainer |
|---|---|---|
| Zusätzliche Datenquelle (pro Quelle, Tier M) | +€1.500 – €3.000 | +€200–400/Mo |
| Zusätzlicher AI-Agent (konfiguriert + deployed) | +€3.000 – €6.000 | +€300–600/Mo |
| Daten-Migrations-Support (Begleitung, kein Full-Service) | +€2.000 – €5.000 | — |
| Erweiterte Nutzer-Kapazität (>15 User Tier M) | +€1.500 pro 10 User | +€150/Mo |
| Custom API-Integration (Drittanbieter mit API-Docs) | +€2.500 – €8.000 je nach Komplexität | +€300–500/Mo Wartung |
| Erweiterte Dokumentation / Prozesshandbuch | +€1.500 | — |
| Verlängerter Post-Launch-Support (je Monat zusätzlich) | — | +€800/Mo |
| Zweisprachige Systemkonfiguration (DE + EN) | +€2.000 | — |
| Tier-Upgrade M → L mid-project | Delta-Berechnung auf Aufwandsbasis | Retainer-Anpassung |