# Review-Responder — DSGVO-Check

> **Disclaimer:** Dieses Dokument ist eine technische Compliance-Orientierungshilfe, kein Rechtsgutachten. Vor Produktivbetrieb Abstimmung mit Datenschutzbeauftragtem oder Rechtsberatung.

---

## Datenfluss-Analyse

| Schritt | Daten | System/Node | Personenbezug | Zweck |
|---|---|---|---|---|
| 1. Review-Eingang via Webhook | Reviewer-Name, Rating, Review-Text, Reviewer-ID, Timestamp, Plattform | `Trustpilot Review Webhook` | Ja — Name + Text können PII sein | Review-Verarbeitung |
| 2. Normalisierung | Extrahierte Felder aus Schritt 1 | `Extract & Normalize Review` | Ja | Datenvorbereitung |
| 3. KI-Verarbeitung | Review-Text + Reviewer-Kontext → Anthropic API (USA/EU) | `AI: Sentiment + Antwort generieren` | Ja — Review-Text an Drittanbieter | Antwort-Generierung + Sentiment |
| 4. Log in Google Sheets | Alle Felder inkl. KI-Antwort, Status, Timestamps | `Log Review to Google Sheets` | Ja | Audit-Trail, Reporting |
| 5. Approve-E-Mail | Review-Text + KI-Antwort im E-Mail-Body | `Send Approval Email` | Ja | Freigabe-Prozess |
| 6. Trustpilot-Publishing | Finale Antwort (kein Reviewer-PII, nur eigener Text) | `Post Reply to Trustpilot` | Nein (eigene Antwort) | Öffentliche Antwort |
| 7. Sentiment-Report | Aggregierte Scores, keine Review-Texte im Standard-Report | `Build Sentiment Report` | Gering (aggregiert) | Business-Intelligence |
| 8. Slack-Alert (negativ) | Rating + ggf. Reviewer-Name im Alert | `Sofort-Alert: Negative Review` | Ja (möglicherweise) | Eskalation |
| 9. n8n Execution-Log | Alle Workflow-Daten für konfigurierbare Retention | n8n intern | Ja | Debugging |

---

## Rechtsgrundlage

**Art. 6 Abs. 1 lit. f DSGVO** — Berechtigtes Interesse ist die primär anwendbare Rechtsgrundlage:

- Berechtigtes Interesse des Verantwortlichen: Professionelle, zeitnahe Reaktion auf öffentliche Bewertungen; Schutz der eigenen Reputation; Qualitätssicherung.
- Reviewer haben ihre Bewertung freiwillig öffentlich auf einer Plattform veröffentlicht; die Verarbeitung zum Zweck der Antwort-Erstellung ist eine vorhersehbare Konsequenz dieser öffentlichen Handlung.
- Interessenabwägung: Verarbeitungszweck (Antwort auf eigene Plattform-Präsenz) ist verhältnismäßig; keine sensiblen Kategorien nach Art. 9; keine Profile-Building-Funktion.

**Wichtig:** Falls Review-Texte besondere Kategorien nach Art. 9 DSGVO enthalten können (z. B. Gesundheitsdienstleister, der Patienten-Feedback erhält), ist die Rechtsgrundlage separat zu prüfen — dann ggf. Art. 9 Abs. 2 lit. f + explizite DSFA erforderlich.

---

## Pflicht-Konfiguration (DSGVO)

| Maßnahme | Node/Bereich | Umsetzung |
|---|---|---|
| Execution-Log-Retention begrenzen | n8n-Instanz global | `EXECUTIONS_DATA_MAX_AGE=7` (Tage); siehe Security-Risks |
| Google-Sheets-Löschroutine | Google Sheets | Automatisierte Löschroutine für Einträge >90 Tage einrichten (separater Workflow oder Script) |
| Anthropic Data-Processing-Modus | Anthropic API | API-Calls dürfen NICHT für Model-Training genutzt werden — Anthropic Business/Enterprise oder explizites Opt-Out erforderlich |
| Approve-E-Mail-Inhalt minimieren | `Send Approval Email` | Review-Text auf 500 Zeichen kürzen im E-Mail-Body; voller Text nur im Sheet abrufbar |
| Slack-Alert PII reduzieren | `Sofort-Alert: Negative Review` | Im Alert nur Rating + Platform ausgeben, nicht Review-Text oder Reviewer-Name |
| Datenschutzhinweis auf eigener Website | Außerhalb Workflow | Verarbeitungsaktivität "Review-Beantwortung via KI" in Datenschutzerklärung aufnehmen |

---

## Vendor-DPA-Übersicht

| Anbieter | Rolle | EU-Hosting verfügbar | DPA vorhanden | Link | Anmerkung |
|---|---|---|---|---|---|
| **Anthropic** | Auftragsverarbeiter (KI-Verarbeitung) | Nein (USA) | Ja (Enterprise) | [anthropic.com/legal/dpa](https://anthropic.com/legal/dpa) | SCCs erforderlich; kein EU-Hosting; Daten-Retention-Policy prüfen; kein Training auf Daten mit Enterprise-Agreement |
| **Google Sheets / Google Workspace** | Auftragsverarbeiter (Datenspeicher) | Ja (EU-Region wählbar) | Ja | [workspace.google.com/terms/dpa_terms.html](https://workspace.google.com/terms/dpa_terms.html) | EU-Region in Google Workspace Admin einstellen |
| **Trustpilot** | Gemeinsam Verantwortlicher (Plattform) | Ja (EU) | Eigene AGB + DPA | [legal.trustpilot.com](https://legal.trustpilot.com) | Trustpilot ist selbst Verantwortlicher für Review-Daten; API-Nutzung unter deren Developer-Terms |
| **n8n (Cloud)** | Auftragsverarbeiter (Workflow-Execution) | Ja (EU) | Ja | [n8n.io/legal/dpa](https://n8n.io/legal/dpa) | Self-hosted: eigene Verantwortung für Hosting-Infra-DPA |
| **E-Mail-Provider (SMTP/Gmail)** | Auftragsverarbeiter (E-Mail-Transport) | Variiert | Variiert | Anbieter-spezifisch | Gmail: Google Workspace DPA; eigener SMTP: Hosting-Provider-DPA prüfen |
| **Slack** | Auftragsverarbeiter (Alert-Kanal) | Ja (EU-Hosting Option) | Ja | [slack.com/intl/de-de/terms-of-service/data-processing](https://slack.com/intl/de-de/terms-of-service/data-processing) | EU-Residency in Slack Enterprise Grid aktivierbar; Standard: USA |

> **Pflicht:** Vor Produktivbetrieb DPA mit Anthropic abschließen (Enterprise erforderlich für DPA + No-Training-Garantie). SCCs (Standard Contractual Clauses) für US-Transfer dokumentieren.

---

## Betroffenenrechte

| Recht (DSGVO) | Umsetzung im Blueprint | Aufwand |
|---|---|---|
| Auskunft (Art. 15) | Manuell: Sheet-Suche nach Reviewer-Name/ID | Gering |
| Berichtigung (Art. 16) | Manuell: Sheet-Eintrag editieren | Gering |
| Löschung (Art. 17) | Manuell: Zeile im Sheet löschen + n8n-Execution-Logs löschen | Mittel |
| Einschränkung (Art. 18) | Manuell: Status-Feld auf "eingeschränkt" setzen, Publishing stoppen | Mittel |
| Widerspruch (Art. 21) | Prozess dokumentieren: Review nicht antworten, Eintrag löschen | Mittel |
| Portabilität (Art. 20) | Sheet-Export als CSV möglich | Gering |

**Empfehlung:** Internen SOP für Betroffenenanfragen erstellen (Kontakt → Sheet-Suche → Löschroutine → Bestätigung). Responsezeit-Ziel: ≤ 30 Tage per DSGVO-Anforderung.

---

## Löschfristen

| Datenkategorie | Speicherort | Empfohlene Löschfrist | Begründung |
|---|---|---|---|
| Review-Rohdaten + KI-Antworten | Google Sheets | 90 Tage nach Veröffentlichung | Ausreichend für Audit, danach kein Zweck |
| Execution-Logs (inkl. PII) | n8n-DB | 7 Tage | Debugging-Zweck, minimale Retention |
| Approve-E-Mails | E-Mail-Postfach | 30 Tage | Freigabe-Nachweis |
| Sentiment-Reports (aggregiert) | E-Mail-Archiv | 12 Monate | Business-Reporting, kein Personenbezug |
| Slack-Alerts | Slack-Channel | Slack-Retention-Policy (Standard 90 Tage) | Kein aktiver Handlungsbedarf |

---

## DSFA-Trigger (Datenschutz-Folgenabschätzung)

Eine DSFA nach Art. 35 DSGVO ist **wahrscheinlich nicht erforderlich** für Standard-Einsatz, jedoch **erforderlich oder zu prüfen** bei:

- 🔴 Gesundheitsdienstleister (Patientenbewertungen enthalten Art.-9-Daten)
- 🔴 Vollautomatische Entscheidungen über Reviewer (nicht im Blueprint, aber bei Erweiterungen prüfen)
- 🟠 Sehr hohes Review-Volumen (>1.000 Reviews/Monat = umfangreiche Verarbeitung)
- 🟠 Einsatz in Branchen mit erhöhtem Schutzbedarf (Finanzdienstleistungen, Rechtsberatung)

---

## EU AI Act-Einordnung

**Einordnung: Limitiertes Risiko (Art. 50 EU AI Act)**

- Das Blueprint nutzt ein LLM (Claude via Anthropic API) zur Generierung von Text, der im Namen des Unternehmens veröffentlicht wird.
- **Transparenzpflicht:** Empfänger (Reviewer auf Trustpilot) können nicht erkennen, dass die Antwort KI-generiert ist. Nach EU AI Act Art. 50 Abs. 2 besteht eine Offenlegungspflicht für KI-generierten Text, der mit natürlichen Personen interagiert.
- **Empfehlung:** Einen standardisierten Hinweis in jede KI-generierte Antwort einfügen (z. B. als letzter Satz oder Fußnote): *"Diese Antwort wurde mit KI-Unterstützung verfasst und von unserem Team freigegeben."* — dies erfüllt die Transparenzpflicht und ist gleichzeitig vertrieblich neutral.
- **Nicht**: Hochrisiko-KI-System (kein Einsatz in Bereichen nach Annex III EU AI Act).

---

## Audit-Checkliste vor Go-Live

- [ ] DPA mit Anthropic abgeschlossen (Enterprise oder Business mit No-Training-Opt-Out)
- [ ] SCCs für Drittland-Transfer (USA → Anthropic) dokumentiert
- [ ] Google-Workspace-Region auf EU gesetzt
- [ ] Google Sheets DPA aktiv (über Google Workspace Admin)
- [ ] n8n DPA abgeschlossen (Cloud) oder Hosting-Provider-DPA vorhanden (Self-hosted)
- [ ] Execution-Log-Retention auf ≤ 7 Tage konfiguriert
- [ ] Löschfristen-Routine für Google Sheets (90 Tage) geplant oder implementiert
- [ ] Datenschutzerklärung aktualisiert (KI-gestützte Review-Beantwortung erwähnt)
- [ ] EU AI Act Transparenzhinweis im Brand-Voice-Prompt / Response-Template integriert
- [ ] Betroffenenrechte-SOP intern dokumentiert
- [ ] Slack-Alert-Node: nur Rating + Platform, kein Review-Text
- [ ] Approve-E-Mail-Node: Review-Text auf ≤ 500 Zeichen gekürzt
- [ ] DSFA-Trigger geprüft und ggf. DSFA erstellt
- [ ] Verantwortliche Person für DSGVO-Anfragen im Team benannt

---

## Sign-Off DSGVO

**Technische Freigabe durch:** _________________________ (AEVUM Builder)

**Datenschutzrechtliche Freigabe durch:** _________________________ (DSB / Rechtsberatung Customer)

**Datum:** _________________________

> Dieses Dokument ersetzt keine rechtliche Beratung. Änderungen an Vendor-Verträgen, Datenflüssen oder Einsatzbereichen erfordern erneute Prüfung.