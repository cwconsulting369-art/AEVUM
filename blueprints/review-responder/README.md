# Review-Responder Blueprint

## Was das Blueprint löst

**Problem:** Du bekommst täglich neue Google- und Trustpilot-Bewertungen. Jede unbeantworte Review kostet dich Sichtbarkeit, Vertrauen und potenziell Kunden. Manuell antworten dauert, wird vergessen, ist inkonsistent – und wenn der Ton mal nicht stimmt, schadet es mehr als es nützt.

**Lösung:** Dieses Blueprint pollt neue Reviews über Webhooks/APIs, generiert mit Claude eine brand-konforme Antwort, legt sie zur menschlichen Freigabe vor (Approve-Gate per E-Mail), und veröffentlicht nach Freigabe automatisch die Antwort. Parallel baut sich ein Sentiment-Report auf, der täglich/wöchentlich als Zusammenfassung rausgeht.

---

## Features

- **Automatisches Polling** neuer Reviews von Trustpilot (API) und Google (via Webhook-Eingang oder Zapier-Bridge)
- **KI-Antwortgenerierung** mit Claude – Ton, Länge und Sprache konfigurierbar per System-Prompt
- **Approve-Gate** – Antwort geht per E-Mail an dein Team; ein Klick auf "Freigeben" oder "Ablehnen" triggert den nächsten Schritt
- **Automatische Veröffentlichung** der freigegebenen Antwort via Trustpilot API
- **Sentiment-Klassifikation** jeder Review (positiv / neutral / negativ) mit Scoring
- **Täglicher Sentiment-Report** per E-Mail: Durchschnittsscore, Verteilung, Auffälligkeiten
- **Error-Handling** – fehlgeschlagene API-Calls landen in einem Slack/E-Mail-Alert
- **Review-Log** in Google Sheets (Review-Text, Sentiment, generierte Antwort, Freigabe-Status, Timestamp)

---

## Ziel-Segmente

| Segment | Fit | Warum |
|---|---|---|
| **AG – Agenturen** | ★★★★★ | Betreuen mehrere Kunden, Review-Management ist Standardleistung, White-Label-fähig |
| **PB – Personal Brands** | ★★★☆☆ | Sinnvoll ab ~10 Reviews/Monat; Approve-Gate passt gut für Solo-Unternehmer |
| **FI – Mittelstand** | ★★★★☆ | Mehrere Standorte, Compliance-relevant, Brand-Voice-Konsistenz kritisch |

---

## Was du eintragen musst

| Platzhalter in workflow.json | Was rein muss | Woher |
|---|---|---|
| `{{INDIVIDUELL: deine-brand-domain.de}}` | Deine Website-Domain für den Webhook-Endpunkt | Deine n8n-Instanz-URL |
| `{{INDIVIDUELL: TRUSTPILOT_API_KEY}}` | Trustpilot Business API Key | [business.trustpilot.com](https://business.trustpilot.com) → Integrations → API |
| `{{INDIVIDUELL: TRUSTPILOT_BUSINESS_UNIT_ID}}` | Deine Trustpilot Business Unit ID | Trustpilot Dashboard → URL oder API-Antwort |
| `{{INDIVIDUELL: ANTHROPIC_API_KEY_CREDENTIAL}}` | Name des Anthropic-Credentials in n8n | n8n → Credentials → New → Anthropic |
| `{{INDIVIDUELL: APPROVE_EMAIL_ADDRESS}}` | E-Mail-Adresse des Freigabe-Verantwortlichen | Intern festlegen |
| `{{INDIVIDUELL: REPORT_EMAIL_ADDRESS}}` | Empfänger des täglichen Sentiment-Reports | Intern festlegen |
| `{{INDIVIDUELL: SMTP_CREDENTIAL}}` | Name des E-Mail-/SMTP-Credentials in n8n | n8n → Credentials → SMTP oder Gmail |
| `{{INDIVIDUELL: GOOGLE_SHEETS_CREDENTIAL}}` | Name des Google Sheets Credentials in n8n | n8n → Credentials → Google Sheets OAuth2 |
| `{{INDIVIDUELL: GOOGLE_SHEETS_ID}}` | ID des Google Sheets (aus der URL) | Google Sheets URL: `/d/HIER-IST-DIE-ID/edit` |
| `{{INDIVIDUELL: SLACK_WEBHOOK_URL}}` | Slack Incoming Webhook URL für Error-Alerts | Slack → Apps → Incoming Webhooks |
| `{{INDIVIDUELL: BRAND_NAME}}` | Dein Markenname | Intern |
| `{{INDIVIDUELL: BRAND_VOICE_PROMPT}}` | Beschreibung eures Markentones (2-4 Sätze) | Euer Brand-Guide |
| `{{INDIVIDUELL: APPROVE_WEBHOOK_PATH}}` | URL-Pfad für den Freigabe-Webhook (z.B. `approve-review`) | Frei wählbar, muss eindeutig sein |

---

## Voraussetzungen

- **n8n Version:** ≥ 1.40.0 (LangChain-Nodes stabil verfügbar)
- **Credentials in n8n anlegen:**
  - Anthropic API (Claude)
  - SMTP oder Gmail
  - Google Sheets OAuth2
  - HTTP Header Auth (für Trustpilot API Key)
- **Externe Accounts:**
  - Trustpilot Business Account mit API-Zugang (kostenpflichtig ab Business-Plan)
  - Google Business Profile (für Google Reviews – direktes API-Publishing nur über Google My Business API, erfordert OAuth-App-Verifizierung; alternativ: manueller Schritt oder Zapier-Bridge)
  - Slack Workspace (optional, für Error-Alerts)
  - Google Sheets (kostenlos)

---

## Setup-Schritte

1. **Importieren:** workflow.json in n8n importieren (Menu → Import from File)
2. **Credentials anlegen:** Alle oben genannten Credentials in n8n erstellen und benennen exakt wie in den Platzhaltern angegeben
3. **Platzhalter ersetzen:** Alle `{{INDIVIDUELL: ...}}`-Felder in den Node-Parametern ausfüllen (Node anklicken → Parameter bearbeiten)
4. **Google Sheet vorbereiten:** Sheet mit Spalten anlegen: `timestamp | platform | reviewer | rating | review_text | sentiment | sentiment_score | ai_response | status | published_at`
5. **Brand-Voice-Prompt testen:** Den "Generate Response"-Node mit einer Beispiel-Review manuell ausführen und Output prüfen
6. **Approve-Gate testen:** Test-Review durchlaufen lassen, Freigabe-E-Mail prüfen, Approve-Link klicken
7. **Trustpilot Webhook registrieren:** In Trustpilot Business Dashboard den n8n-Webhook-URL als Notification-Endpoint eintragen
8. **Aktivieren:** Workflow auf "Active" stellen

---

## Limits / Known Issues

- **Google Reviews Publishing:** Google My Business API erlaubt kein direktes API-Antwort-Posting ohne verifizierten OAuth-App-Status (Review durch Google erforderlich). Als Workaround ist im Blueprint ein manueller Hinweis-Schritt eingebaut – vollautomatisches Posting nur für Trustpilot out-of-the-box.
- **Trustpilot Rate Limits:** 100 Requests/Minute auf Business API. Bei hohem Review-Volumen (>50/Tag) Polling-Intervall anpassen.
- **Approve-Gate Timeout:** Es gibt keinen eingebauten Timeout – wenn nach 48h keine Freigabe kommt, bleibt die Review unbeantwortet. Reminder-Logik muss manuell ergänzt werden.
- **Sentiment ist KI-basiert:** Kein deterministischer Algorithmus. Bei Grenzfällen (ironische Reviews, Fremdsprachen) kann die Klassifikation ungenau sein.
- **n8n Cloud vs. Self-hosted:** Webhook-URLs unterscheiden sich. Auf Self-hosted sicherstellen, dass die Instanz öffentlich erreichbar ist.
- **Keine Duplikat-Prüfung:** Falls Trustpilot denselben Event zweimal sendet, kann es zu doppelten Sheet-Einträgen kommen. Robuste Duplikat-Prüfung via Review-ID im Sheet empfohlen.

---

## Pricing-Hinweis

Dieses Blueprint ist ein AEVUM-Produkt. Die Nutzung setzt eine aktive AEVUM-Lizenz voraus. Externe Kosten fallen zusätzlich an: Anthropic Claude API (~$0.003–0.015 pro Review-Antwort je nach Modell), Trustpilot Business API (im Business-Plan inkludiert), Google Sheets (kostenlos). n8n Self-hosted ist kostenlos; n8n Cloud ab $20/Monat.