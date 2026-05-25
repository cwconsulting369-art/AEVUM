# Onboarding-Autopilot — DSGVO-Konformitäts-Check

**Blueprint:** onboarding-autopilot
**Review-Datum:** 2026-05-25
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Disclaimer:** Diese Doku ist keine Rechtsberatung. Customer bleibt rechtlich verantwortlich. Bei DSGVO-kritischen Branchen (Health/Finance) zusätzlich Anwalt konsultieren.

---

## 1. Datenfluss-Analyse

**Welche personenbezogenen Daten verarbeitet der Workflow?**

| Datum | Kategorie | Speicherort | Aufbewahrung |
|---|---|---|---|
| Vorname + Nachname | Stammdaten (Art. 4 Nr. 1 DSGVO) | n8n-Execution-Log + CRM + Email-Provider + Slack-Channel | n8n: <30d; CRM: laufende Geschäftsbeziehung; Slack: nach Customer-Retention |
| E-Mail-Adresse | Kommunikation | n8n + CRM + Email-Provider | siehe oben |
| Firma | Berufliche Daten | n8n + CRM + Slack-Ping-Text | siehe oben |
| Telefon (falls Form-Field) | Kommunikation | n8n + CRM | siehe oben |
| Produkt/Paket-Wahl | Vertragsdaten | n8n + CRM | gesetzliche Aufbewahrung (HGB 6/10 Jahre) |
| Onboarding-Start-Timestamp | Metadata | CRM + Email-History | Vertragslaufzeit |

**Datenfluss-Diagramm:**
```
Customer-Form (Tally/Typeform/CRM-Tag)
        |
        v
n8n-Webhook (EU-Region)
        |
        v
Set-Node (Normalisierung + Sanitize)
        |
        ├──> Resend/SMTP (Welcome-Mail an Customer-Email)
        ├──> Airtable/Notion (CRM-Record-Anlage)
        └──> Slack-Webhook (Team-Channel-Ping mit Name+Firma)
        |
        v
Wait-Node (3 Tage — PII im Execution-State)
        |
        v
Resend/SMTP (Follow-up Check-in-Mail)
```

**Potential für besondere Kategorien (Art. 9 DSGVO):** Bei reiner Stammdaten-Verarbeitung NEIN. Wenn Customer Health/Finance/Legal-Sektor ist → Form-Felder dürfen keine sensitive Kategorien erfragen ("Welche Krankheit hast du?" o.ä. → verbieten).

---

## 2. Rechtsgrundlage

**Welche Rechtsgrundlage trägt die Verarbeitung?**

| Kontext | Grundlage |
|---|---|
| Customer hat unterschrieben oder Formular ausgefüllt | **Art. 6 (1) lit. b** — Vertragserfüllung / vorvertragliche Maßnahmen (klar gegeben) |
| Welcome-Mail an Customer | **Art. 6 (1) lit. b** — Vertragserfüllung (Onboarding ist Teil der Leistung) |
| CRM-Anlage | **Art. 6 (1) lit. b** + **lit. f** — berechtigtes Interesse an Kundenverwaltung |
| Slack-Team-Ping (intern) | **Art. 6 (1) lit. f** — internes Tooling, kein Customer-Effekt |
| Follow-up Check-in-Mail (3 Tage) | **Art. 6 (1) lit. b** — Vertragserfüllung (Qualitätssicherung) |

**Wichtig:** Wenn Customer im Form-Submission keine explizite Einwilligung-Checkbox getickt hat, ist die Verarbeitung trotzdem rechtmäßig nach lit. b — weil das Formular **selbst** der Vertragsanbahnungs-Akt ist. Eine **separate Marketing-Einwilligung** ist nur nötig wenn nach dem Onboarding noch Newsletter/Marketing-Mails folgen sollen — diese sind NICHT Teil dieses Blueprints.

---

## 3. Pflicht-Konfiguration im Trigger

### A) Bei Form-Trigger (Tally/Typeform)
Customer hat im Form schon Einwilligung gegeben (Datenschutz-Checkbox Pflicht im Formular).

**Text-Vorschlag im Formular:**
> ☐ Ich stimme der Verarbeitung meiner Daten zur Bearbeitung meines Onboardings gemäß [Datenschutzerklärung] zu. (Pflicht)

### B) Bei CRM-Tag-Trigger (Airtable-Automation)
Vertragsgrundlage liegt bereits vor (Customer hat unterschrieben). Keine zusätzliche Einwilligung nötig — Hinweis in DS-Erklärung dass Onboarding-Automation läuft genügt.

### C) Bei manuellem Trigger
Customer ist bekannter Vertragspartner. Keine zusätzliche Einwilligung nötig.

### D) Informationspflicht über Auftragsverarbeiter
Customer MUSS in DS-Erklärung informiert werden, dass folgende Vendors involviert sind: n8n, Resend/SMTP-Provider, Notion/Airtable, Slack, Calendly.

---

## 4. Vendor-DPA-Übersicht

Welche Auftragsverarbeiter sind beteiligt? (Customer braucht DPA mit jedem.)

| Vendor | Rolle | EU-Hosting? | DPA-Link | Risiko-Level |
|---|---|---|---|---|
| **n8n.cloud** | Workflow-Engine | ✅ EU-Region wählbar | n8n.io/legal/dpa | 🟢 LOW |
| **Self-Hosted n8n** | Workflow-Engine | Customer's Choice | — (kein DPA nötig, eigener Server) | 🟢 LOW wenn EU-Server |
| **Resend** | E-Mail-Versand (Welcome+Follow-up) | ✅ EU-Region | resend.com/legal/dpa | 🟢 LOW |
| **SMTP-eigene-Domain** | E-Mail-Versand (Alternative) | abhängig vom Provider | individuell | 🟢 LOW bei EU-Provider |
| **Mailchimp** | E-Mail-Versand (Alternative, nicht empfohlen) | ❌ US (Sub-Processor) | mailchimp.com/legal/data-processing-addendum | 🟡 MEDIUM |
| **Airtable** | CRM | ❌ US (Sub-Processor) | airtable.com/legal/dpa | 🟡 MEDIUM (SCC nötig) |
| **Notion** | CRM (alternative) | ❌ US | notion.so/help/data-protection | 🟡 MEDIUM |
| **Slack** | Team-Channel-Ping | ❌ US (EU-Datacenters für Enterprise) | slack.com/legal/dpa | 🟡 MEDIUM |
| **Calendly** | Kick-off-Buchung | ❌ US | calendly.com/legal/dpa | 🟡 MEDIUM (SCC nötig) |
| **Typeform** | Form-Trigger (Option A) | ✅ EU-Option (Pro-Plan) | typeform.com/legal/dpa | 🟡 MEDIUM (Free: US) |
| **Tally** | Form-Trigger (Option A, empfohlen) | ✅ EU | tally.so/help/dpa | 🟢 LOW |

**Customer-Action:** Vor Go-Live alle aktiv genutzten Vendors als Auftragsverarbeiter in Verzeichnis aufnehmen (Art. 30 DSGVO). DPAs gegenzeichnen (meist Online-Klick-DPA).

**Besonders kritisch:** Slack + Calendly + Airtable/Notion sind US-Vendors → DS-Erklärung MUSS auf Drittland-Transfer hinweisen (Art. 13 Abs. 1 lit. f DSGVO).

---

## 5. Betroffenenrechte (Art. 15–22 DSGVO)

| Recht | Umsetzung im Blueprint |
|---|---|
| **Auskunft** (Art. 15) | CRM-Filter "Email = X" → Export aller Records → an Betroffenen senden (Customer-Prozess) |
| **Berichtigung** (Art. 16) | CRM-Record direkt editieren; bei laufendem Workflow im n8n-Wait-State: Workflow-Manual-Edit + Resend Welcome-Mail mit korrigierten Daten |
| **Löschung** (Art. 17) | CRM-Record löschen + n8n-Execution-History für diese Email löschen + Slack-Channel-Search-Delete (manuell) |
| **Einschränkung** (Art. 18) | CRM-Status auf "DSGVO-Hold" + kein weiteres Processing, laufenden Wait-Node manuell stoppen |
| **Datenübertragbarkeit** (Art. 20) | JSON-Export aus CRM |
| **Widerspruch** (Art. 21) | Wenn Onboarding-Mails als unerwünscht empfunden: sofort-Stop, manueller Workflow-Abbruch |
| **Automatisierte Einzelentscheidung** (Art. 22) | ⚠️ Nicht anwendbar — kein Scoring, keine rechtlich relevante Entscheidung, nur Sequenz-Trigger |

**Wichtig bei laufendem Wait-Node:** Wenn Customer in den 3 Tagen Löschung verlangt, MUSS der Workflow gestoppt werden bevor Follow-up-Mail rausgeht. Manueller Prozess: n8n → Executions → suchen → "Stop Execution".

---

## 6. Löschfristen-Logik

| Daten-Typ | Aufbewahrung | Grund |
|---|---|---|
| Customer-Stammdaten im CRM | Laufende Geschäftsbeziehung + gesetzliche Aufbewahrung (HGB 6/10 Jahre) | Vertrag + Steuer |
| n8n-Execution-Log | 30 Tage | Operational |
| Welcome-Mail-Versandprotokoll bei Resend | nach Resend-Policy (typ. 90d) | Email-Provider-Default |
| Slack-Channel-Message | nach Workspace-Retention-Policy | Customer-Setting (empfohlen: 1 Jahr) |
| Calendly-Booking-Data | bis Termin + 30d | Buchungsbestätigung |
| Bei Vertragsende ohne weitere Geschäftsbeziehung | Stammdaten 3 Jahre für Gewährleistung, dann Löschung | BGB §195 |

**Implementation:** Customer richtet Cron in CRM ein (Airtable-Automation / Notion-Cleanup) für Auto-Cleanup nach Vertragsende.

---

## 7. Datenschutzfolgen-Abschätzung (DSFA, Art. 35)

**Ist eine DSFA erforderlich?**

→ **Nein**, wenn:
- Keine besonderen Kategorien (Health/etc.) im Form-Field
- Keine umfangreiche systematische Überwachung
- Volumen <1000 Onboardings/Jahr

→ **Ja**, wenn Customer:
- Health-Sektor / Finanz-Sektor (besonders sensible Branchen)
- Onboarding-Form fragt Health/Bonitäts-/Religions-Daten ab (sollte vermieden werden)
- Skalierung auf >10k Onboardings/Jahr mit Multi-Channel-Tracking

---

## 8. EU-AI-Act-Kompatibilität (ab 2. Aug 2026)

| Klassifizierung | Onboarding-Autopilot |
|---|---|
| **AI-System nach EU-AI-Act?** | **Nein** — der Workflow ist deterministisch (Set + Email + HTTP + Wait). Kein LLM, kein ML-Modell, keine Inferenz. |
| **Risk-Class** | nicht anwendbar |
| **High-Risk?** | Nein |

**Customer-Action:** Keine zusätzliche AI-Act-Pflicht. Wenn Customer später LLM-basierte Welcome-Mail-Personalisierung dazwischen schaltet → muss neu eingeordnet werden.

---

## 9. Audit-Checkliste vor Go-Live

- [ ] DS-Erklärung des Customers aktualisiert (Onboarding-Automation + Vendor-Liste + Drittland-Transfer-Hinweis für Slack/Calendly/Airtable)
- [ ] Datenschutz-Checkbox im Onboarding-Formular (falls Form-Trigger genutzt)
- [ ] Vendor-DPAs gegengezeichnet und in Verzeichnis (Art. 30)
- [ ] Auftragsverarbeiter-Liste in DS-Erklärung erwähnt (mind. n8n, Resend, CRM, Slack, Calendly)
- [ ] EU-Hosting bei n8n + Form-Tool + Mail-Provider gewählt
- [ ] Slack-Workspace-Retention-Policy gesetzt (max. 1-2 Jahre für Customer-Daten in Channel-Messages)
- [ ] n8n-Execution-Log auf 30d retention
- [ ] Prozess für Customer-Löschungs-Request während laufendem Wait-Node dokumentiert
- [ ] Test-Anfrage durchgelaufen: Auskunft → Export → Löschung in unter 30 Tagen
- [ ] Carlos hat Sign-Off-Dokument (Customer + Carlos signed)

---

## 10. Quality-Gate-Sign-Off

- [x] Datenfluss-Analyse vollständig (PII durch 4 Vendors + Wait-State-Risiko benannt)
- [x] Rechtsgrundlagen pro Schritt klar (Art. 6 lit. b dominiert)
- [x] Pflicht-Konfiguration pro Trigger-Option dokumentiert
- [x] Vendor-DPA-Übersicht erstellt (10 Vendors)
- [x] Betroffenenrechte-Implementation skizziert (inkl. Wait-Node-Sonderfall)
- [x] Löschfristen-Empfehlung
- [x] DSFA-Trigger benannt (Health/Finance/Scale)
- [x] EU-AI-Act-Einordnung (nicht betroffen)
- [x] Audit-Checkliste vor Go-Live
- [ ] Anwaltliche Validierung der DS-Erklärungs-Klauseln — Customer-Action, nicht Blueprint-Block
