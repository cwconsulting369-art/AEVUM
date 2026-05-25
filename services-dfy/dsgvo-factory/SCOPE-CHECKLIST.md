# DSGVO-Factory — Scope-Checklist (Intern / Sales-Call)

## In-Scope

| Kategorie | Item | Aufwand-Estimate |
|---|---|---|
| **Discovery** | Tool-Inventar (alle SW-Dienstleister des Customers erfassen) | 4-6h |
| **Discovery** | Datenfluss-Mapping (welche Daten fließen wohin, von wem zu wem) | 6-10h |
| **Discovery** | Gap-Analyse gegen DSGVO-Mindestanforderungen | 3-5h |
| **VVT** | Aufbau Verarbeitungsverzeichnis in Notion/Airtable (bis 20 Einträge Tier M, bis 60 Tier L) | 8-16h |
| **VVT** | Owner-Mapping pro Verarbeitungstätigkeit | 2-3h |
| **AV-Register** | Erfassung aller Auftragsverarbeiter inkl. AVV-Status | 6-10h |
| **AV-Register** | Automatische Reminder-Flows für fehlende/ablaufende AVVs | 4-6h |
| **Consent-Management** | Technische Implementierung Consent-Tracking (1 Kanal Tier M, bis 4 Kanäle Tier L) | 8-14h |
| **Consent-Management** | Audit-Trail-Datenbank (Wer hat wann was consent-et) | 4-8h |
| **Betroffenenrechte** | Ticket-System für Art. 15/16/17/20-Anfragen | 8-12h |
| **Betroffenenrechte** | Response-Templates (Auskunft, Löschung, Berichtigung, Portabilität) | 4-6h |
| **Betroffenenrechte** | 30-Tage-SLA-Tracking + Eskalations-Automation | 4-6h |
| **Löschfristen** | Regelbasiertes Löschfristenregister pro Datenkategorie | 6-10h |
| **Löschfristen** | Automatisierungs-Hooks in bestehende Tools (wo technisch möglich) | 4-8h |
| **TOM** | Dokumentation Technisch-Organisatorische Maßnahmen | 4-6h |
| **Datenpannen** | Incident-Response-Playbook nach Art. 33/34 | 4-6h |
| **Datenpannen** | Melde-Templates für Aufsichtsbehörden + Betroffene | 2-3h |
| **Dashboard** | DSGVO-Compliance-Dashboard (Notion/Airtable/Softr) | 8-14h |
| **Awareness** | Mitarbeiter-Onboarding-Flow (Video-Einheiten + Quiz + Bestätigungsprotokoll) | 6-10h |
| **Review-Trigger** | Quarterly-Compliance-Selbstprüfung (Auto-Notification + Checkliste) | 3-5h |
| **Handover** | Dokumentation, Loom-Walkthroughs, Übergabe-Session | 4-6h |

**Gesamt-Estimate Tier M:** ~95-140h  
**Gesamt-Estimate Tier L:** ~160-220h

---

## Out-of-Scope

| Was Customer NICHT bekommt | Warum explizit raus |
|---|---|
| Rechtsgutachten / anwaltliche Beratung | AEVUM = kein Rechtsdienstleister; Customer trägt juristische Verantwortung |
| Bestellung/Funktion als externer DSB (Art. 37 DSGVO) | Andere Haftungsklasse; nicht Teil des Service-Modells |
| Durchführung von Datenschutz-Folgenabschätzungen (DSFA) | Templates werden geliefert; Durchführung = Customer-Aufgabe mit ggf. Anwalt |
| Cookie-Banner / Consent-Management-Plattform (CMP) für Webseite | Technisches Website-Layer ist separater Scope (Cookiebot/Usercentrics-Setup) |
| Physische Sicherheitsmaßnahmen / Gebäudezugänge | Außerhalb des digitalen Scope |
| Archivierung physischer Dokumente | Papier-Compliance nicht Teil dieses DFY |
| Laufendes Incident-Response-Management bei Datenpannen | Playbook ja, 24/7-Notfall-Support nein |
| Live-Schulungen / Workshops mit MA-Teams | Self-Service-Awareness-Paket ja; Live-Training ist Add-on |
| Verhandlung von AVV-Inhalten mit Dienstleistern | AEVUM trackt Status und eskaliert; Verhandlung = Customer |
| Multi-Jurisdiktion (UK-GDPR, CCPA, etc.) | Scope ist DSGVO (EU); andere Jurisdiktionen auf Anfrage |
| Neue Verarbeitungstätigkeiten nach Übergabe einpflegen | Retainer deckt Monitoring; neue Einträge = Customer pflegt selbst oder Add-on |

---

## Voraussetzungen Customer-Side

| Kategorie | Requirement | Blocking? |
|---|---|---|
| **Tool-Zugang** | Read-Zugriff auf CRM, E-Mail-Tool, Cloud-Storage, HR-System | ✅ Ja — ohne geht Discovery nicht |
| **Tool-Zugang** | API-Keys / Admin-Credentials wo Automatisierung gebaut wird | ✅ Ja |
| **Dokumente** | Bestehende DSGVO-Dokumente teilen (auch wenn lückenhaft) | Nein, aber hilft |
| **Ansprechpartner** | 1 interner Owner mit ~2h/Woche Verfügbarkeit in Implementation | ✅ Ja |
| **Entscheidung** | Klärung: Wer pflegt VVT nach Übergabe? Muss benannt sein. | ✅ Ja — vor Kick-off |
| **Dienstleister-Liste** | Grobe Liste aller SW-Dienstleister (Excel reicht) | Nein, aber spart 4-6h Discovery |
| **Zeit-Commitment** | Kick-off 3h + wöchentlich 30 Min + Milestone-Reviews | ✅ Ja |
| **Rechtsberater** | Eigenen Anwalt/DSB für parallelen juristischen Review beauftragen (Empfehlung) | Nein, aber empfohlen |

---

## Quality-Standards

AEVUM definiert "Done" wenn:

1. VVT vollständig ausgefüllt (alle bekannten Verarbeitungstätigkeiten dokumentiert, Owner zugewiesen)
2. AV-Register: Alle identifizierten Auftragsverarbeiter erfasst, AVV-Status = 100% bekannt (nicht 100% abgeschlossen — aber 100% transparent)
3. Consent-Tracking läuft technisch und produziert Audit-Trail (testbarer Nachweis: Opt-in erfasst → in DB gespeichert → abrufbar)
4. Betroffenenrechte-Workflow: Testticker für alle 4 Anfrage-Typen durchgelaufen und korrekt geroutet
5. Löschfristenregister: Alle Datenkategorien mit Frist hinterlegt, mindestens 1 automatischer Hook funktioniert
6. TOM-Dokumentation: Vollständig ausgefüllt und von Customer-Owner freigegeben
7. Datenpannen-Playbook: Customer-Owner hat den Prozess einmal vollständig durchgespielt (Tabletop-Test)
8. Dashboard: Alle KPIs live und korrekt aggregiert (Daten stimmen mit manueller Prüfung überein)
9. Awareness-Paket: Mindestens 1 Test-Mitarbeiter hat den kompletten Flow durchlaufen und Bestätigung ist protokolliert
10. Quarterly-Review-Trigger: Nächster Review-Trigger ist gesetzt und Owner hat Benachrichtigung erhalten

---

## Change-Request-Policy

| Situation | Handling |
|---|---|
| Scope-Erweiterung innerhalb Phase (z.B. +5 Verarbeitungstätigkeiten) | Schriftliche CR, Aufwand-Estimate innerhalb 48h, Umsetzung nach Freigabe — €150-200/h |
| Zusätzlicher Consent-Kanal über Tier-M-Limit hinaus | Pauschal-Add-on: €1.200-2.500 je nach Komplexität |
| Live-Schulungen / MA-Workshops gewünscht | Add-on: €800-1.500/Workshop (bis 2h, bis 15 Teilnehmer) |
| Multi-Jurisdiktion (z.B. UK-GDPR zusätzlich) | Separates Angebot, Minimum €3.500 Add-on |
| Tool-Wechsel während Implementation | Bis 2 Wochen vor Abschluss: CR + €500-1.500 Re-Integration; danach: neues Projekt-Scope |
| Customer liefert Informationen zu spät (>1 Woche Verzug) | Timeline-Extension ohne Aufpreis (einmalig); bei strukturellem Delay: €200/Woche Bereitschaftspauschale |

---

## Pricing-Variations

| Variation / Add-on | Preisauswirkung |
|---|---|
| Jede zusätzliche juristische Entität (Tier L, mehrere GmbHs) | +€3.000-6.000 Setup je Entität |
| Jeder zusätzliche Consent-Kanal über Paket-Limit | +€1.200-2.500 |
| Live MA-Workshop (bis 15 TN, 2h) | +€800-1.500 |
| DSFA-Begleitung (Template + Walk-through mit Customer) | +€2.000-3.500 |
| Externe DSB-Vermittlung (Partnernetzwerk) | Vermittlungspauschale €500 |
| Priority-Incident-Response-Retainer (24h Reaktionszeit) | +€800/Mo auf Retainer |
| Multi-Jurisdiktion (UK-GDPR, CCPA) | +€3.500-8.000 Setup |
| Cookie-Banner / CMP-Integration (Cookiebot/Usercentrics) | +€2.000-4.000 Setup |
| Beschleunigter Timeline (<4 Wochen für Tier M) | +20% auf Setup-Preis |