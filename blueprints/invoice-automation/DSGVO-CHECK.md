# Invoice-Automation Blueprint — DSGVO-Compliance-Check

> Gilt für: `invoice-automation` Blueprint v1.x  
> Stand: 2025 | Rechtshinweis: Dieses Dokument ersetzt keine Rechtsberatung. Für verbindliche Einschätzungen ist ein Datenschutzbeauftragter oder Anwalt hinzuzuziehen.

---

## Datenfluss-Analyse

| Schritt | Datenart | Personenbezug | Verarbeitungsort | Externe Übermittlung |
|---|---|---|---|---|
| Webhook / E-Mail-Trigger empfängt PDF | Rechnungs-PDF mit Name, Adresse, IBAN des Lieferanten (natürl. Person möglich), Betrag | Ja — wenn Lieferant natürliche Person (Freelancer, Kleinunternehmer) | n8n-Instanz (Server des Customers) | Nein |
| Set-Node: Eingangsmetadaten | Timestamp, Source, Dateiname | Indirekt (Dateiname kann Personenname enthalten) | n8n-Instanz | Nein |
| Code-Node: PDF → Base64 | Vollständiger PDF-Inhalt als Base64 | Ja | n8n-Instanz | Nein |
| HTTP-Request an Anthropic Claude API | PDF-Inhalt (Base64) + Prompt — enthält alle Rechnungsfelder inkl. PII | **Ja — kritisch** | Anthropic-Server (USA) | **Ja — Drittland** |
| Code-Node: Extraktion parsen | Extrahierte Felder (Name, IBAN, Beträge, Rechnungsnummer) | Ja | n8n-Instanz | Nein |
| IF-Node: Routing | Validierungsstatus + extrahierte Felder | Ja | n8n-Instanz | Nein |
| Slack-Alert (bei Fehler) | Rechnungsnummer, ggf. Lieferantenname | Ja (wenn Lieferant nat. Person) | Slack (USA) | **Ja — Drittland** |
| Google Sheets: Protokoll | Alle extrahierten Felder inkl. Name, Betrag, IBAN | Ja | Google (USA/EU je nach Konfiguration) | **Ja — ggf. Drittland** |
| E-Mail-Summary an Buchhaltung | Zusammenfassung mit Rechnungsdaten | Ja | SMTP-Provider | Ja (je nach Provider) |
| DATEV-CSV | Buchungsdaten inkl. Lieferantenname, Betrag | Ja | Lokaler Download / DATEV | Intern / DATEV-System |

---

## Rechtsgrundlage

**Primäre Rechtsgrundlage:** Art. 6 Abs. 1 lit. **c** DSGVO — Verarbeitung zur Erfüllung einer rechtlichen Verpflichtung (§ 238 HGB, § 147 AO: Pflicht zur Aufzeichnung und Aufbewahrung von Geschäftsvorfällen, Buchführungspflicht).

**Sekundäre Rechtsgrundlage:** Art. 6 Abs. 1 lit. **f** DSGVO — Berechtigtes Interesse des Verantwortlichen an effizienter Buchführung und Vermeidung von Zahlungsausfällen, sofern die Interessen der betroffenen Person (Lieferant als natürliche Person) nicht überwiegen.

> 🟡 **Hinweis:** Bei Lieferanten als juristische Personen (GmbH, AG, UG) ist kein Personenbezug gegeben — DSGVO nicht anwendbar auf Unternehmensdaten. Bei Freelancern, Einzelunternehmern und Kleinunternehmern (natürliche Personen) gilt DSGVO vollumfänglich.

---

## Pflicht-Konfiguration (DSGVO)

| Maßnahme | Konkrete Umsetzung | Priorität |
|---|---|---|
| **Verzeichnis von Verarbeitungstätigkeiten (VVT)** | Diesen Workflow als Verarbeitungstätigkeit im VVT dokumentieren (Zweck, Kategorien, Empfänger, Löschfristen) | Pflicht |
| **DPA mit Anthropic abschließen** | Anthropic Data Processing Agreement unterzeichnen (siehe unten) | Pflicht |
| **DPA mit Google abschließen** | Google Workspace DPA aktivieren (bei Nutzung von Google Sheets) | Pflicht |
| **DPA mit Slack abschließen** | Slack DPA aktivieren, sofern Slack für Alerts genutzt wird | Pflicht |
| **Execution-History-Löschung** | PII in n8n-Execution-Logs max. 7 Tage; danach automatisch löschen | Pflicht |
| **Google Sheets Löschfrist** | Rechnungsdaten nach steuerlicher Aufbewahrungsfrist löschen (10 Jahre gemäß § 147 AO) — aber: Sheets nicht als Primärarchiv nutzen | Pflicht |
| **Anthropic: "Do Not Train"-Option prüfen** | In Anthropic API-Nutzungsbedingungen prüfen, ob Daten für Modelltraining genutzt werden; Business-API schließt das i.d.R. aus | Pflicht |
| **IBAN-Daten minimieren** | Wenn IBAN für DATEV nicht benötigt wird, aus Extraktion-Prompt und Google-Sheets-Export ausschließen | Empfohlen |
| **Löschkonzept für Google Sheets** | Automatisierte oder kalender-gestützte Löschung nach Ablauf der Aufbewahrungspflicht | Pflicht |

---

## Vendor-DPA-Übersicht

| Vendor | Rolle | EU-Hosting verfügbar | SCCs vorhanden | DPA-Link | Besonderheit |
|---|---|---|---|---|---|
| **Anthropic** | Auftragsverarbeiter (LLM-Inferenz) | Nein (USA-only) | Ja (SCCs im DPA) | [anthropic.com/legal/data-processing-addendum](https://www.anthropic.com/legal/data-processing-addendum) | API-Kunden: DPA über Konsole aktivierbar; Daten werden laut DPA nicht für Training genutzt |
| **Google (Sheets)** | Auftragsverarbeiter | Ja (EU-Region wählbar) | Ja | [cloud.google.com/terms/data-processing-addendum](https://cloud.google.com/terms/data-processing-addendum) | Google Workspace: DPA in Admin-Konsole aktivieren; Speicherregion auf EU setzen |
| **Slack** | Auftragsverarbeiter | Ja (EU-Region für Paid-Plans) | Ja | [slack.com/terms-of-service/data-processing](https://slack.com/terms-of-service/data-processing) | DPA in Slack-Admin aktivieren; bei Free-Plan keine EU-Region; PII in Slack minimieren |
| **SMTP-Provider** (variabel) | Auftragsverarbeiter | Abhängig von Provider | Zu prüfen | Providerspezifisch | Bei SendGrid/Mailgun: eigene DPAs prüfen; bei eigenem Postfix: intern |
| **n8n (Self-Hosted)** | Keine Drittübermittlung | Customer-kontrolliert | n/a | n/a | Bei n8n Cloud: n8n DPA prüfen |

---

## Betroffenenrechte

Betroffene Personen sind primär **Lieferanten als natürliche Personen** (Freelancer, Einzelunternehmer).

| Recht | Umsetzung im Workflow-Kontext |
|---|---|
| **Auskunft (Art. 15)** | Customer muss Auskunft über gespeicherte Daten geben können — Google Sheets und DATEV-Exporte sind Quellen; Prozess dokumentieren |
| **Berichtigung (Art. 16)** | Fehlerhafte Einträge in Google Sheets manuell korrigierbar; DATEV-Buchungen über Steuerberater/DATEV-Storno |
| **Löschung (Art. 17)** | Einschränkung durch § 147 AO (10 Jahre Aufbewahrungspflicht für Buchungsbelege); Löschung nach Ablauf, nicht vorher möglich |
| **Einschränkung der Verarbeitung (Art. 18)** | Praktisch schwierig bei Buchungspflicht; dokumentieren und Rechtsberater konsultieren |
| **Datenübertragbarkeit (Art. 20)** | Rechnungsdaten in strukturierter Form (CSV) aus Google Sheets exportierbar |
| **Widerspruch (Art. 21)** | Bei Rechtsgrundlage Art. 6 lit. c (gesetzliche Pflicht) kein Widerspruchsrecht; bei lit. f abzuwägen |

---

## Löschfristen

| Datenkategorie | Aufbewahrungspflicht | Löschfrist nach Ablauf | Speicherort |
|---|---|---|---|
| Rechnungsbelege (Original-PDF) | 10 Jahre (§ 147 Abs. 1 AO) | Nach 10 Jahren | Primär-Archiv (nicht Google Sheets) |
| DATEV-Buchungsdaten | 10 Jahre (§ 147 Abs. 1 AO) | Nach 10 Jahren | DATEV-System |
| Google-Sheets-Protokoll | Nicht Primärarchiv; max. 10 Jahre als Hilfsdokumentation | Spätestens nach 10 Jahren oder früher wenn möglich | Google Sheets |
| n8n-Execution-Logs (mit PII) | Keine Aufbewahrungspflicht | Max. 7 Tage (DSGVO-Datenminimierung) | n8n-Instanz |
| Slack-Alert-Daten | Keine Aufbewahrungspflicht | Slack-Retention-Policy: max. 90 Tage empfohlen | Slack |
| E-Mail-Summaries | Abhängig von Mail-Archivierungs-Policy | Max. 1 Jahr wenn kein buchführungsrelevanter Inhalt | SMTP-Postfach |

---

## DSFA-Trigger (Datenschutz-Folgenabschätzung)

Eine DSFA gemäß Art. 35 DSGVO ist **wahrscheinlich nicht erforderlich** für Standard-Nutzung dieses Workflows, **sofern**:
- Keine systematische Verarbeitung von besonderen Kategorien (Art. 9) — Rechnungsdaten sind keine sensiblen Kategorien
- Volumen bleibt unter "umfangreicher" Verarbeitung (Orientierung: <500 betroffene natürliche Personen/Jahr)
- Kein Profiling oder automatisierte Entscheidungsfindung mit Rechtswirkung

**DSFA wird erforderlich wenn:**
- 🟠 Workflow verarbeitet Rechnungen von >500 verschiedenen Privatpersonen/Jahr (unwahrscheinlich für B2B-Kontext, aber zu prüfen)
- 🟠 Zusätzlich Bonitätsdaten oder Kontodaten für automatisierte Freigabe-/Ablehnungsentscheidungen genutzt werden (Erweiterung)
- 🟠 Verarbeitung in Hochrisikobranchen (Gesundheit, Soziales) mit besonderen Lieferantenkategorien

---

## EU-AI-Act-Einordnung

**Einordnung: Limited Risk (Art. 52 EU AI Act)**

| Kriterium | Bewertung |
|---|---|
| System-Kategorie | KI-System für Dokumentenverarbeitung (Textextraktion aus PDFs) |
| Hochrisiko-Kategorie (Annex III) | Nein — keine Verwendung in Kritischer Infrastruktur, Bildung, Beschäftigung, wesentlichen Dienstleistungen, Strafverfolgung |
| Automatisierte Entscheidung mit Rechtswirkung | Nein — LLM liefert Daten-Extraktion; Buchung erfolgt durch Buchhaltungssoftware nach manueller/automatischer Freigabe |
| Transparenzpflicht | 🟡 Empfohlen: Lieferanten (als natürliche Personen) sollten informiert werden, dass eingehende Rechnungen KI-gestützt verarbeitet werden (Datenschutzhinweis/AGB) |
| Verbotene Praktiken | Keine |

**Handlungsempfehlung:** Datenschutzhinweis / AGB des Customers um Hinweis auf KI-gestützte Rechnungsverarbeitung ergänzen. Formulierungsbeispiel: *"Eingehende Rechnungen werden mit Unterstützung automatisierter Systeme (KI-gestützte Textextraktion) verarbeitet. Die Buchungsentscheidung erfolgt durch menschliche Buchhaltungsmitarbeiter."*

---

## Audit-Checkliste vor Go-Live (DSGVO)

| # | Prüfpunkt | Status |
|---|---|---|
| D-01 | VVT-Eintrag für diesen Workflow erstellt | ☐ |
| D-02 | DPA mit Anthropic abgeschlossen und dokumentiert | ☐ |
| D-03 | DPA mit Google aktiviert; Speicherregion EU gesetzt | ☐ |
| D-04 | DPA mit Slack aktiviert (oder Slack-Nutzung durch E-Mail-Fallback ersetzt) | ☐ |
| D-05 | Execution-History-Pruning auf max. 7 Tage konfiguriert | ☐ |
| D-06 | Google-Sheets-Löschkonzept dokumentiert (wann, wer, wie) | ☐ |
| D-07 | IBAN-Daten nur wenn für DATEV benötigt — sonst aus Sheets ausschließen | ☐ |
| D-08 | Datenschutzhinweis des Customers auf KI-Verarbeitung aktualisiert | ☐ |
| D-09 | Betroffenenrechte-Prozess dokumentiert (wer antwortet auf Auskunftsersuchen?) | ☐ |
| D-10 | DSFA-Notwendigkeit geprüft und Entscheidung dokumentiert | ☐ |

---

## Sign-Off

> Dieses Dokument wurde auf Basis des vorliegenden Workflow-Designs erstellt. Es ersetzt keine individuelle Datenschutzberatung. Customer ist als Verantwortlicher im Sinne von Art. 4 Nr. 7 DSGVO für die rechtskonforme Umsetzung verantwortlich. AEVUM agiert — sofern DFY-Setup — als Auftragsverarbeiter gemäß Art. 28 DSGVO; entsprechender AV-Vertrag ist abzuschließen.