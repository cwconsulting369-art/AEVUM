# Support-Triage — DSGVO-Konformitäts-Check

**Blueprint:** support-triage
**Review-Datum:** 2026-05-30
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Disclaimer:** Diese Doku ist keine Rechtsberatung. Customer bleibt rechtlich Verantwortlicher. Bei sensiblen Branchen (Health, Legal, Finance) oder besonderen Datenkategorien: Anwalt/Datenschutzbeauftragten konsultieren.

---

## 0. Einordnung

Support-Triage verarbeitet **eingehende Kunden-Kommunikation**. Anders als bei Cold-Outreach besteht hier in der Regel bereits eine Geschäftsbeziehung oder ein eigeninitiierter Kontakt des Betroffenen (der Kunde schreibt von sich aus an `support@`). Die Verarbeitung dient der **Vertragserfüllung bzw. dem berechtigten Interesse** an effizienter Bearbeitung. Der sensible Punkt ist der **KI-Einsatz + der Transfer an einen US-LLM-Provider (Anthropic)**.

---

## 1. Datenfluss-Analyse

**Welche personenbezogenen Daten verarbeitet der Workflow?**

| Datum | Kategorie | Speicherort | Aufbewahrung |
|---|---|---|---|
| Absender-Name / E-Mail | Stammdaten (Art. 4 Nr. 1) | Postfach + n8n-Execution-Log + Anthropic-Call | Postfach: Customer-Policy; n8n: ≤30d; Anthropic: laut DPA/Retention-Setting |
| Mail-Betreff + Body (Freitext) | Kommunikationsinhalt — **kann Art. 9 Daten enthalten** (Gesundheit, Religion etc., falls Kunde sie schreibt) | Postfach + n8n + Anthropic | wie oben |
| Abgeleitete Klassifizierung (Kategorie/Priorität/Stimmung) | abgeleitetes Personenmerkmal | n8n-Execution + interne Ticket-Mail | wie n8n / Mail-Provider |
| KI-Antwort-Entwurf | abgeleiteter Output | n8n + interne Ticket-Mail (Team-Postfach) | wie n8n / Mail-Provider |
| Message-ID / Zeitstempel | Metadaten | n8n + Logs | wie n8n |

**Besondere Kategorien (Art. 9 DSGVO):** Der Kunde kann unaufgefordert Gesundheits-/religiöse/politische Angaben in den Fließtext schreiben. Diese fließen ungefiltert an den US-LLM. → DS-Erklärungs-Hinweis Pflicht; bei einschlägigen Branchen DSFA + PII-Maskierung evaluieren.

---

## 2. Rechtsgrundlage

| Kontext | Grundlage |
|---|---|
| Empfang + Verarbeitung der Support-Mail | **Art. 6 (1) lit. b** (Vertragserfüllung/-anbahnung, wenn Kunde) **ODER lit. f** (berechtigtes Interesse an effizientem Support) |
| KI-Klassifizierung + Draft-Erstellung | **Art. 6 (1) lit. f** — berechtigtes Interesse an effizienter, schneller Bearbeitung; **+ Art. 28** (Auftragsverarbeitung) ggü. Anthropic |
| Transfer an Anthropic (US) | **Art. 6 (1) lit. f + Art. 44 ff.** (Drittlandtransfer) — SCC / DPA erforderlich |
| Interne Weiterleitung ans Team | gleiche Grundlage (organisatorisch, gleicher Verantwortlicher) |

**Interessenabwägung (lit. f):** Effizienter Support liegt im berechtigten Interesse des Unternehmens UND im Interesse des Betroffenen (schnelle Antwort). Kein Auto-Versand → kein Eingriff durch automatisierte Außenkommunikation. Abwägung fällt zugunsten der Verarbeitung aus, solange Mensch-im-Loop + Transparenz gewahrt sind.

---

## 3. Pflicht-Konfiguration

### A) Transparenz / Datenschutzerklärung
Pflicht-Hinweis aufnehmen, z.B.:
> „Zur Bearbeitung Ihrer Support-Anfragen setzen wir KI-gestützte Klassifizierung und Antwort-Vorschläge ein. Dabei werden Inhalt und Absenderdaten Ihrer Nachricht an unseren Dienstleister Anthropic (USA) übermittelt. Die finale Antwort wird von einem Mitarbeiter geprüft und versendet."

### B) Auto-Submitted-Schutz / Schleifenvermeidung
Das überwachte Eingangspostfach darf NICHT identisch mit dem Versand-Postfach der Fehler-/Ticket-Mails sein → sonst Mail-Schleife + unnötige Verarbeitung. Separates Eingangs- vs. Versand-Postfach Pflicht.

### C) Kein automatischer Kunden-Versand
Der Workflow sendet ausschließlich intern. Eine Umkonfiguration auf Auto-Reply an den Kunden würde die Interessenabwägung verschieben (automatisierte Außenkommunikation, Art.-22-Nähe) und ist ohne zusätzliche Guardrails nicht freigegeben.

### D) Datenminimierung
- Kein Anhang-Download (Default aus)
- Body-Kappung (6000 Zeichen) im Sanitize-Node
- Keine Speicherung über die operativ nötige Dauer hinaus

---

## 4. Vendor-DPA-Übersicht

| Vendor | Rolle | EU-Hosting? | DPA-Link | Risiko-Level |
|---|---|---|---|---|
| **n8n.cloud** | Workflow-Engine | ✅ EU-Region wählbar | n8n.io/legal/dpa | 🟢 LOW |
| **Self-Hosted n8n** | Workflow-Engine | Customer's Choice | — | 🟢 LOW wenn EU-Server |
| **Anthropic** | KI-Klassifizierung + Draft | ❌ US | anthropic.com/legal/commercial-terms (+ DPA) | 🟠 HIGH (PII-Transfer Drittland, SCC + Hinweis Pflicht, Zero-Retention prüfen) |
| **Mail-Hoster (IMAP/SMTP)** | Ein-/Ausgang | Customer-Choice | provider-spezifisch | 🟢 LOW wenn EU (z.B. IONOS, mailbox.org) / 🟡 bei US (Google Workspace) |
| **Slack** | Urgent-Alerts (enthält Absender + Zusammenfassung) | ❌ US (EU-Datenresidenz teilw. wählbar) | slack.com/trust/compliance/data-processing-addendum | 🟡 MEDIUM (PII im Channel → DPA + Zugriffskontrolle) |

**Customer-Action vor Go-Live:**
1. Alle aktiv genutzten Vendors ins Verarbeitungsverzeichnis (Art. 30)
2. SCCs / DPAs bei US-Vendors (Anthropic, ggf. Slack, ggf. Google) abschließen + prüfen
3. Anthropic-Retention-Setting prüfen (Zero-Retention / kein Training auf Daten)

---

## 5. Betroffenenrechte (Art. 15–22 DSGVO)

| Recht | Umsetzung |
|---|---|
| **Auskunft** (Art. 15) | Customer-Prozess: Postfach + Ticketsystem nach Betroffenen-Mail durchsuchen, Daten exportieren binnen 30 Tagen |
| **Berichtigung** (Art. 16) | im Ticketsystem/CRM korrigieren |
| **Löschung** (Art. 17) | n8n-Log: Auto-Cleanup ≤30d. Postfach/Ticket: Customer-Policy. Anthropic: laut Retention-Setting (Zero-Retention empfohlen) |
| **Einschränkung** (Art. 18) | Ticket markieren, keine weitere Verarbeitung |
| **Datenübertragbarkeit** (Art. 20) | Export aus Postfach/Ticketsystem |
| **Widerspruch** (Art. 21) | gegen lit.-f-Verarbeitung: Customer kann KI-Triage für Betroffenen deaktivieren (manuelle Bearbeitung) |
| **Automatisierte Einzelentscheidung** (Art. 22) | **Nicht einschlägig** — die Triage hat keine rechtliche Wirkung; der Draft wird von einem Menschen geprüft + versendet (kein Auto-Reply). Genau deshalb ist Mensch-im-Loop wichtig. |

---

## 6. Löschfristen-Logik

| Daten | Aufbewahrung | Grund |
|---|---|---|
| n8n-Execution-Log (inkl. Body + Draft) | 14–30 Tage | Operational; PII → kurz halten |
| Interne Ticket-Mail (Team-Postfach) | nach Support-/Aufbewahrungs-Policy des Customers | Vertrags-/Geschäftskorrespondenz |
| Original-Support-Mail (Eingangspostfach) | Customer-Policy (oft 6 Monate – Jahre als Geschäftskorrespondenz) | berechtigtes Interesse / handelsrechtlich |
| Anthropic-API-Daten | Zero-Retention bzw. laut DPA | Datenminimierung |

**Implementation:** n8n Execution-Data-Pruning aktivieren (`EXECUTIONS_DATA_MAX_AGE`), Anthropic-Zero-Retention prüfen.

---

## 7. Datenschutzfolgen-Abschätzung (DSFA, Art. 35)

**Ist eine DSFA erforderlich?**

→ **Grenzfall / branchenabhängig:**
- Standard-B2B-Support, kein systematisches Profiling, keine besonderen Kategorien: **eher nein**, Risiko-Analyse empfohlen
- Branchen mit regelmäßig Art.-9-Daten (Health, Legal, Versicherung, Soziales): **ja**
- Hohes Volumen + systematische KI-Auswertung von Kundenkommunikation: **ja** (umfangreiche Verarbeitung von Kommunikationsinhalten)

**Bei DSFA-Pflicht:** Zweck, Notwendigkeit, Risiko-Matrix (siehe SECURITY-RISKS.md), Mitigations, ggf. Konsultation Aufsichtsbehörde.

---

## 8. EU-AI-Act-Kompatibilität (ab 2. Aug 2026)

| Klassifizierung | Support-Triage |
|---|---|
| **AI-System nach EU-AI-Act?** | **Ja** — LLM-Klassifizierung + Textgenerierung ist AI-System nach Art. 3 (1) |
| **Risk-Class** | **Limited Risk** — KI-gestützte Verarbeitung + KI-generierter Textentwurf. Transparenzpflicht (Art. 50): Betroffene müssen wissen, dass KI im Spiel ist |
| **High-Risk?** | Nein — kein Annex-III-Fall (keine Bonitäts-/Recruiting-/Strafverfolgungs-Entscheidung). Triage steuert interne Bearbeitung, keine rechtlich relevante Entscheidung über den Betroffenen |
| **Prohibited?** | Nein — kein Social-Scoring, keine Manipulation |

**Customer-Action für AI-Act-Compliance:**
- DS-Erklärungs-Hinweis: „Wir nutzen KI-gestützte Klassifizierung und Antwort-Vorschläge im Support."
- Mensch-im-Loop beibehalten (kein Auto-Reply) → hält die Einordnung sauber bei Limited Risk
- Wenn später Auto-Reply: Transparenzpflicht Art. 50 — Kunde muss erkennen, dass er mit/über KI kommuniziert

---

## 9. Audit-Checkliste vor Go-Live

- [ ] DS-Erklärung aktualisiert (KI-Hinweis + Anthropic-US-Transfer + Mensch-prüft-Hinweis)
- [ ] DPA mit Anthropic abgeschlossen, Zero-Retention geprüft
- [ ] DPA mit Slack (falls Urgent-Alerts genutzt) + Mail-Hoster geprüft
- [ ] Vendors im Verarbeitungsverzeichnis (Art. 30)
- [ ] SCCs bei US-Vendors bestätigt
- [ ] n8n EU-Hosting gewählt
- [ ] Eingangs-Postfach ≠ Versand-Postfach (Schleifenschutz)
- [ ] Kein Auto-Send-Pfad an Kunden verdrahtet (nur intern)
- [ ] n8n-Execution-Log-Retention ≤30d + Field-Masking für Body/Draft
- [ ] Anthropic-Spending-Cap gesetzt
- [ ] DSFA-Bedarf je Branche geprüft (Health/Legal → ja)
- [ ] Erste 20-50 Klassifizierungen + Drafts manuell reviewt
- [ ] Carlos hat Sign-Off-Dokument (Customer + Carlos signed)

---

## 10. Quality-Gate-Sign-Off

- [x] Datenfluss-Analyse vollständig
- [x] Rechtsgrundlagen pro Schritt (lit. b / lit. f + Art. 28 + Drittlandtransfer)
- [x] Art.-9-Risiko (Freitext) benannt
- [x] Pflicht-Konfiguration (Transparenz, Schleifenschutz, kein Auto-Send, Minimierung)
- [x] Vendor-DPA-Übersicht (5 Vendors)
- [x] Betroffenenrechte inkl. Art.-22-Einordnung (nicht einschlägig dank Mensch-im-Loop)
- [x] Löschfristen
- [x] DSFA-Trigger benannt (branchenabhängig)
- [x] EU-AI-Act-Einordnung (Limited Risk + Transparenzpflicht)
- [x] Audit-Checkliste vor Go-Live (13 Punkte)
- [ ] Anwaltliche Validierung DS-Erklärungs-Klauseln + lit.-f-Abwägung — Customer-Action
- [ ] PII-Maskierung vor LLM als Default — Phase 2
