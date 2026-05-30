# Invoice-Automation Blueprint

## Was das Blueprint löst

**Problem:** Eingangsrechnungen landen per E-Mail, als PDF-Anhang oder über ein Formular – jemand öffnet sie manuell, tippt Beträge ab, prüft Pflichtfelder, hakt Kostenstellen ab und exportiert dann irgendwie nach DATEV oder ins ERP. Das kostet pro Rechnung 5–15 Minuten und produziert Tippfehler, vergessene Rechnungen und Mahnungen.

**Lösung:** Dieser Workflow fängt eingehende Rechnungs-PDFs automatisch ab (E-Mail-Trigger oder Webhook), extrahiert alle relevanten Felder via Claude (LLM), prüft Pflichtfelder und Plausibilität, routet Ausreißer zur manuellen Freigabe, und überführt validierte Rechnungen in eine strukturierte CSV-Datei im DATEV-Buchungsstapel-Format sowie in eine Google-Tabelle zur internen Nachverfolgung.

---

## Features

- **Multi-Source-Trigger:** Webhook (Formular-Upload) oder E-Mail-Anhang als Auslöser
- **LLM-Extraktion via Claude:** Lieferant, Rechnungsnummer, Datum, Fälligkeitsdatum, Nettobetrag, MwSt-Satz, Bruttobetrag, IBAN, Verwendungszweck – aus unstrukturierten PDFs
- **Automatische Plausibilitätsprüfung:** Brutto = Netto × (1 + MwSt), Pflichtfelder vorhanden, Datum nicht in Vergangenheit (konfigurierbar), Duplikat-Check via Rechnungsnummer
- **Zwei-Wege-Routing:** Valide Rechnungen → automatischer Export; fehlerhafte/unklare Rechnungen → Slack-Alert + manuelle Freigabe-URL
- **DATEV-CSV-Export:** Erzeugt Buchungsstapel-kompatibles Format (Umsatz, Soll/Haben, Konto, Gegenkonto, Belegdatum, Belegfeld1, Buchungstext)
- **Google Sheets Protokoll:** Jede verarbeitete Rechnung (inkl. Status) wird geloggt
- **Benachrichtigung:** E-Mail-Summary an Buchhaltung nach erfolgreichem Export
- **Error-Handling:** Jeder kritische Knoten hat einen Fehler-Pfad mit Slack-Benachrichtigung

---

## Ziel-Segmente

| Segment | Nutzen |
|---|---|
| **AG – Agenturen** | Lieferantenrechnungen (Software, Freelancer, Media) automatisch verarbeiten; kein manuelles Abtippen mehr |
| **PB – Personal Brands / Solopreneure** | Kleine Rechnungsmengen vollautomatisch in DATEV-Export für Steuerberater überführen |
| **FI – Mittelstand** | Skalierbare Verarbeitung von 50–500 Rechnungen/Monat, Integration in bestehende Buchhaltungs-Workflows |

---

## Was du eintragen musst

| Platzhalter in workflow.json | Was rein muss | Woher |
|---|---|---|
| `{{INDIVIDUELL: deine-webhook-url-path}}` | Pfad für den Webhook-Endpunkt, z.B. `invoice-upload` | Frei wählbar, muss im Formular/System als Ziel eingetragen werden |
| `{{INDIVIDUELL: anthropic-credential-name}}` | Name des Anthropic-Credentials in n8n | n8n → Credentials → New → Anthropic API |
| `{{INDIVIDUELL: anthropic-api-key}}` | Dein Anthropic API-Key | console.anthropic.com |
| `{{INDIVIDUELL: google-sheets-credential-name}}` | Name des Google Sheets OAuth2-Credentials | n8n → Credentials → Google Sheets OAuth2 |
| `{{INDIVIDUELL: google-spreadsheet-id}}` | ID der Ziel-Google-Tabelle (aus der URL) | Google Sheets URL: `spreadsheets/d/HIER-DIE-ID/edit` |
| `{{INDIVIDUELL: google-sheet-name}}` | Name des Tabellenblatts, z.B. `Eingangsrechnungen` | In deiner Google-Tabelle anlegen |
| `{{INDIVIDUELL: smtp-credential-name}}` | Name des SMTP/E-Mail-Credentials | n8n → Credentials → SMTP |
| `{{INDIVIDUELL: buchhaltung-email}}` | E-Mail-Adresse der Buchhaltung für den Export-Summary | Intern |
| `{{INDIVIDUELL: absender-email}}` | Absender-E-Mail für ausgehende Mails | Deine SMTP-Absenderadresse |
| `{{INDIVIDUELL: slack-credential-name}}` | Name des Slack-Credentials | n8n → Credentials → Slack OAuth2 |
| `{{INDIVIDUELL: slack-channel-id}}` | Slack-Kanal-ID für Alerts (z.B. `C0123456789`) | Slack → Kanal → Rechtsklick → Link kopieren |
| `{{INDIVIDUELL: freigabe-basis-url}}` | Basis-URL deines n8n-Instanz für Freigabe-Links, z.B. `https://n8n.deine-domain.de` | Deine n8n-Instanz-URL |
| `{{INDIVIDUELL: datev-konto-debitor}}` | Standard-Debitorenkonto für unbekannte Lieferanten, z.B. `70000` | Mit Steuerberater abstimmen |
| `{{INDIVIDUELL: datev-gegenkonto-vorsteuer}}` | Vorsteuer-Konto, z.B. `1576` (SKR04) oder `1406` (SKR03) | Mit Steuerberater abstimmen |

---

## Voraussetzungen

- **n8n-Version:** 1.40.0 oder neuer (LangChain-Nodes stabil)
- **Credentials:**
  - Anthropic API (Claude 3 Haiku oder Sonnet – Haiku reicht für Extraktion)
  - Google Sheets OAuth2
  - SMTP (Gmail, Postfix, SendGrid – whatever du nutzt)
  - Slack OAuth2 (Bot-Token, Scope: `chat:write`)
- **Externe Accounts:**
  - Anthropic-Account mit aktivem API-Key und ausreichend Credits
  - Google-Account mit Zugriff auf die Ziel-Tabelle
  - Slack-Workspace mit installierter App
- **PDF-Handling:** n8n muss das PDF als base64-encodierten Binary-Anhang empfangen (Standard bei E-Mail-Trigger und Formular-Upload via Webhook mit `multipart/form-data`)

---

## Setup-Schritte

1. **Import:** `workflow.json` in n8n importieren (Menü → Workflows → Import from File)
2. **Credentials anlegen:**
   - Anthropic API Key → als "Anthropic API" Credential speichern
   - Google Sheets → OAuth2-Flow durchlaufen, Tabelle freigeben
   - SMTP → Host, Port, User, Passwort eintragen
   - Slack → App erstellen auf api.slack.com, Bot-Token kopieren
3. **Platzhalter ersetzen:** Alle `{{INDIVIDUELL: ...}}`-Felder in den Nodes ausfüllen (Suche im JSON-Editor nach `INDIVIDUELL`)
4. **Google Sheet vorbereiten:** Tabellenblatt mit Spalten anlegen: `Zeitstempel | Lieferant | Rechnungsnummer | Datum | Fälligkeit | Netto | MwSt% | Brutto | IBAN | Status | DATEV-Export`
5. **Test:** Workflow manuell mit einer Test-PDF triggern (Webhook-Node → "Test Webhook" aktivieren, dann PDF via curl/Postman senden)
6. **Aktivieren:** Workflow auf "Active" schalten

---

## Limits / Known Issues

- **PDF-Qualität:** Gescannte PDFs ohne OCR-Layer werden von Claude nur dann korrekt extrahiert, wenn das Modell Vision-Zugriff hat. Bei reinen Bild-PDFs ggf. vorher OCR (z.B. AWS Textract, Adobe API) schalten.
- **Duplikat-Check:** Aktuell prüft der Workflow nur gegen die Google-Tabelle der laufenden Periode – kein historischer DB-Check. Bei hohem Volumen: PostgreSQL-Node ergänzen.
- **DATEV-Format:** Der Export entspricht dem DATEV-Buchungsstapel v700. Bei abweichendem Mandantenformat Spaltenreihenfolge im Code-Node anpassen.
- **LLM-Kosten:** Bei 100 Rechnungen/Monat mit Claude 3 Haiku ca. 0,50–2,00 USD/Monat. Bei Sonnet ca. 5–15 USD/Monat.
- **Keine echte DATEV-Schnittstelle:** Der Workflow exportiert CSV, kein DATEV-SELF-TREIBER. Import in DATEV Kanzlei-Rechnungswesen erfolgt manuell oder per DATEV Belegtransfer.
- **Parallelverarbeitung:** Bei Burst-Uploads (viele PDFs gleichzeitig) kann Anthropic-Rate-Limiting triggern. Ggf. `Wait`-Node einfügen.

---

## Pricing-Hinweis

Dieses Blueprint ist Teil des **AEVUM Workflow-Katalogs**. Einmalige Lizenz, keine Abo-Falle. LLM-API-Kosten (Anthropic) und Cloud-Kosten (Google, SMTP) fallen bei dir direkt an – du hast volle Kostenkontrolle. Kein Vendor-Lock-in, kein Middleware-Aufschlag.