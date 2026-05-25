# AEVUM DSGVO-Check — Reporting Dashboard Blueprint

**Workflow-ID:** `reporting-dashboard-setup`
**Rechtsraum:** EU / DSGVO (GDPR)
**Stand:** 2025
**Hinweis:** Dieses Dokument ist eine technische Einschätzung, keine Rechtsberatung. Im Zweifel: Datenschutzbeauftragten hinzuziehen.

---

## Datenfluss-Analyse

| # | Datenquelle | Datentyp | Personenbezug | Empfänger | Speicherung in n8n | Retention |
|---|---|---|---|---|---|---|
| D-01 | Google Analytics 4 API | Aggregierte Sessions, Conversion Rate, Top-Seiten, Traffic-Zahlen | Kein direkter Personenbezug wenn korrekt konfiguriert (keine User-IDs, keine Client-IDs in Abfrage) | n8n Workflow → E-Mail-Empfänger | Nur in Execution-Log (temporär) | Execution-Log: siehe Konfiguration |
| D-02 | Meta Marketing API (optional) | Ad Spend, CPL, ROAS — kampagnenbezogen | Kein Personenbezug (aggregierte Kampagnendaten) | n8n Workflow → E-Mail-Empfänger | Nur in Execution-Log (temporär) | Execution-Log |
| D-03 | Google Sheets | Manuelle KPIs, Kommentarfeld | Potenziell personenbezogen wenn Kommentar Mitarbeiterbewertungen oder Namen enthält | n8n Workflow → E-Mail-Empfänger | Nur in Execution-Log (temporär) | Execution-Log |
| D-04 | E-Mail-Empfänger-Adressen | E-Mail-Adressen der Report-Empfänger | Personenbezogen (DSGVO-relevant) | n8n Konfiguration (Set Node) | Im Workflow-JSON + Execution-Log | Bis Workflow-Änderung |
| D-05 | Report-HTML (generiert) | Zusammengestellte KPI-Daten aus D-01 bis D-03 | Abhängig von Inhalt (s. D-03) | E-Mail-System (SMTP/Resend), E-Mail-Postfächer der Empfänger | Beim E-Mail-Provider | Gemäß Mail-Retention des Unternehmens |

---

## Rechtsgrundlage

**Primär: Art. 6 Abs. 1 lit. f DSGVO — Berechtigtes Interesse**

Begründung: Der Workflow verarbeitet aggregierte Unternehmens-KPIs zur internen Berichterstattung. Die Verarbeitung dient dem berechtigten Interesse des Unternehmens an der Steuerung seiner Marketing-Performance. Solange keine personenbezogenen Nutzerdaten (User-IDs, IPs) aus GA4 abgefragt werden, überwiegt das berechtigte Interesse.

**Für E-Mail-Empfänger (D-04):**
Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung / arbeitsvertragliche Grundlage bei Mitarbeitern) oder Art. 6 Abs. 1 lit. f (internes Reporting).

**Achtung:** Wenn Kommentarfeld in Google Sheets (D-03) Bewertungen oder Aussagen über einzelne Mitarbeiter enthält → Art. 6 Abs. 1 lit. c oder b erforderlich, oder Einwilligung. Kommentarfeld ausschließlich für sachliche KPI-Notizen nutzen.

---

## Pflicht-Konfiguration für DSGVO-Konformität

1. **GA4 IP-Anonymisierung:** In GA4 muss "IP-Anonymisierung" aktiv sein (in GA4 per Default für EU-Properties, prüfen). GA4 Admin > Dateneinstellungen > Datenerfassung.

2. **Keine User-Level-Dimensionen in API-Query:** Die GA4 API-Abfrage darf keine Dimensionen wie `userId`, `clientId`, `deviceCategory + city` (re-identifizierbar) enthalten. Nur: `sessions`, `conversions`, `pagePath` (aggregiert).

3. **Google Sheets Kommentarfeld:** Keine personenbezogenen Daten (Mitarbeiternamen, Kundennamen, E-Mails) im Kommentarfeld. Nur sachliche Notizen.

4. **E-Mail-Empfänger-Liste:** Nur Personen, die einen legitimen Geschäftsbedarf für diese KPI-Daten haben. Keine externen Dritten ohne Auftragsdatenverarbeitungsvertrag.

5. **Execution-Log-Retention begrenzen:** Execution-Logs in n8n dürfen keine personenbezogenen Daten länger als nötig halten. Retention auf max. 30 Tage begrenzen (empfohlen: 7 Tage).

6. **n8n selbst-hosted in der EU:** Wenn n8n Cloud genutzt wird → Prüfen ob EU-Region gewählt (n8n Cloud Europa). Keine US-Region ohne Standardvertragsklauseln.

---

## Vendor-DPA-Übersicht

| Vendor | Zweck im Workflow | EU-Hosting verfügbar | DPA vorhanden | DPA-Link / Hinweis |
|---|---|---|---|---|
| **Google (GA4 API)** | Traffic-Daten abrufen | Ja (EU-Rechenzentren, Daten-Residency konfigurierbar) | Ja | [Google Ads Data Processing Terms](https://business.safety.google/adsprocessorterms/) / GA4 Einstellungen: Datenverarbeitung in EU |
| **Google (Sheets)** | Manuelle KPI-Eingabe | Ja | Ja | Google Workspace DPA in Admin-Konsole |
| **Meta (Marketing API)** | Ad-Spend-Daten | Primär US, EU-Datenlokalisierung eingeschränkt | Ja | [Meta Data Processing Terms](https://www.facebook.com/legal/terms/dataprocessing) — Prüfen ob Kampagnendaten als personenbezogen gelten |
| **n8n Cloud** | Workflow-Engine | Ja (EU-Region wählbar) | Ja | [n8n DPA](https://n8n.io/legal/dpa/) |
| **Resend.com** | E-Mail-Versand | US-basiert, EU-Kunden über SCCs | Ja | [Resend Privacy & DPA](https://resend.com/legal/dpa) — SCCs prüfen |
| **SMTP (eigener Provider)** | E-Mail-Versand | Abhängig vom Provider | Abhängig | Eigenen Mail-Provider-DPA prüfen |

> **Hinweis Meta:** Wenn Meta Ads-Daten ausschließlich aggregierte Kampagnen-Metriken sind (kein Custom Audience Upload, kein Pixel-Daten-Abruf), ist Personenbezug in der Regel nicht gegeben. Im Zweifel: Meta DPA abschließen.

---

## Betroffenenrechte

**Betroffene in diesem Workflow:** Primär keine Endnutzer-Daten, da nur aggregierte Metriken.

Ausnahme: E-Mail-Empfänger (D-04) haben Rechte als Betroffene.

| Recht | Umsetzung im Workflow-Kontext |
|---|---|
| Auskunft (Art. 15) | E-Mail-Adressen im Set-Node auf Anfrage offenlegen |
| Löschung (Art. 17) | E-Mail-Adresse aus Empfänger-Array entfernen |
| Widerspruch (Art. 21) | Empfänger kann jederzeit aus Report-Verteilung entfernt werden — Prozess intern dokumentieren |
| Datenportabilität (Art. 20) | Report-HTML ist bereits die "portable" Ausgabe |

---

## Löschfristen

| Datenkategorie | Speicherort | Empfohlene Retention | Maßnahme |
|---|---|---|---|
| Execution-Logs (inkl. API-Responses) | n8n Datenbank | 7–14 Tage | `EXECUTIONS_DATA_PRUNE=true` setzen |
| Generierte Report-E-Mails | E-Mail-Postfächer der Empfänger | Gemäß Unternehmens-E-Mail-Policy (typ. 1–3 Jahre) | In E-Mail-Archivierungsrichtlinie aufnehmen |
| Google Sheets Kommentarfeld | Google Drive | Laufend; bei Projektende löschen | Sheet in Projekt-Ablage-Prozess einbinden |
| Service Account JSON Key | n8n Credentials | Bis Rotation (max. 90 Tage) | Key-Rotation-Reminder setzen |

---

## DSFA-Trigger (Datenschutz-Folgenabschätzung)

Eine DSFA nach Art. 35 DSGVO ist für diesen Workflow in der Standardkonfiguration **nicht erforderlich**, da:
- Keine systematische Verarbeitung von Nutzerprofilen
- Keine sensiblen Datenkategorien (Art. 9 DSGVO)
- Keine Verarbeitung im großen Maßstab personenbezogener Daten

**DSFA wird erforderlich wenn:**
- User-Level-Daten aus GA4 abgefragt werden (User-IDs, demographische Profile)
- Der Report für externe Kunden generiert wird und Kundendaten enthält
- Das Kommentarfeld für HR-Daten (Mitarbeiterleistung) genutzt wird
- Der Workflow in Gesundheits-, Finanz- oder Behörden-Kontext eingesetzt wird

---

## EU AI Act Einordnung

**Kein LLM-Call im Workflow** — der `Code: HTML Report bauen` Node ist deterministischer JavaScript-Code ohne KI-Komponente.

**EU AI Act: Nicht anwendbar** für diesen Workflow in der Standardkonfiguration.

Sollte der Workflow erweitert werden um automatische Kommentar-Generierung via OpenAI/GPT → Neubewertung erforderlich (wahrscheinlich: Limited Risk, Transparenzpflicht gegenüber Empfängern).

---

## Audit-Checkliste vor Go-Live

| # | Prüfpunkt | Verantwortlich | Status |
|---|---|---|---|
| 1 | GA4 IP-Anonymisierung aktiv | Customer | [ ] |
| 2 | GA4 API-Query enthält keine User-Level-Dimensionen | AEVUM / Customer | [ ] |
| 3 | Google Sheets Kommentarfeld-Nutzungsrichtlinie kommuniziert | Customer | [ ] |
| 4 | DPA mit Google (GA4, Sheets) abgeschlossen / geprüft | Customer | [ ] |
| 5 | DPA mit Mail-Provider (Resend oder SMTP) abgeschlossen | Customer | [ ] |
| 6 | n8n in EU-Region gehostet (Cloud) oder EU-Server (self-hosted) | Customer | [ ] |
| 7 | Execution-Log-Retention auf max. 30 Tage begrenzt | Customer / AEVUM | [ ] |
| 8 | E-Mail-Empfänger-Liste dokumentiert und begründet | Customer | [ ] |
| 9 | Verarbeitungsverzeichnis (Art. 30 DSGVO) aktualisiert | Customer | [ ] |
| 10 | Meta DPA geprüft falls Meta Ads Modul aktiv | Customer | [ ] |

---

## Sign-Off

> Dieses DSGVO-Check-Dokument wurde auf Basis des vorliegenden Workflow-Summaries erstellt. Es ersetzt keine Rechtsberatung und keine individuelle Datenschutzprüfung durch einen qualifizierten Datenschutzbeauftragten. Bei Unklarheiten zur konkreten Rechtsgrundlage oder bei Einsatz in regulierten Branchen ist externe Rechtsberatung hinzuzuziehen.

**Erstellungsdatum:** 2025 | **Blueprint-Version:** 1.0 | **Nächste Überprüfung:** bei Workflow-Änderung oder spätestens nach 12 Monaten