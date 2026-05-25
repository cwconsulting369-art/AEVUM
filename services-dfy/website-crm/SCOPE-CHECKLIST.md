# Scope-Checklist: Custom CRM-Frontend mit Workflow-Engine

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