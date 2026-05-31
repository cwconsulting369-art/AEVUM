# Meeting-Summarizer — Install-Guide

**Blueprint:** meeting-summarizer
**Setup-Dauer:** 45–75 Min
**Schwierigkeit:** Mittel (API-Keys + CRM-Mapping nötig, kein DNS)
**Letzter Update:** 2026-05-30

---

## Vorab-Check

### Tools die du brauchst

| Tool | Pflicht | Zweck | Kosten |
|---|---|---|---|
| n8n (Cloud-EU oder Self-Host) | ✅ | Workflow-Engine | €0–20/Mo |
| Fireflies.ai (Pro, API) **oder** Zoom (Transkription aktiv) | ✅ | Transkript-Quelle | Fireflies ab ~€10/Seat |
| Anthropic-API-Key (oder OpenRouter/Mistral-EU) | ✅ | KI-Summary | ~€0,01–0,03/Meeting |
| CRM mit API (Airtable/HubSpot/Pipedrive) | ⚠️ | Summary-Ablage | €0–20/Mo |
| Slack/Teams Incoming-Webhook | ⚠️ | Team-Benachrichtigung | €0 |
| SMTP/Resend/Postmark | ⚠️ | Summary per Mail | €0–15/Mo |

⚠️ = mindestens **eines** der drei Outputs (CRM/Slack/Mail) ist Pflicht, sonst landet die Summary nirgends.

### Token & Secrets die du brauchst (sammeln vorher!)

```
# Fireflies
FIREFLIES_API_KEY=<Fireflies → Settings → Developer Settings → API Key>

# Anthropic (oder OpenRouter / Mistral-EU)
ANTHROPIC_API_KEY=<console.anthropic.com → API Keys>
ANTHROPIC_SPENDING_CAP=50   # EUR/Monat, hart einstellen!
LLM_MODEL=claude-3-5-sonnet-20241022

# CRM (Beispiel Airtable)
CRM_API_KEY=<Airtable PAT / HubSpot Private-App-Token / Pipedrive API-Token>
CRM_BASE_URL=https://api.airtable.com/v0/<BASE_ID>/meetings

# Output-Kanäle
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SUMMARY_RECIPIENT_EMAIL=team@deinefirma.de
SENDER_EMAIL=meetings@deinefirma.de
ERROR_CHANNEL_WEBHOOK=https://hooks.slack.com/services/...   # darf = SLACK_WEBHOOK_URL sein

# SMTP (Beispiel Resend)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<Resend API Key>
```

**Empfehlung:** Tokens in Passwort-Manager, NICHT im Klartext herumliegen lassen.

---

## Schritt 1: n8n-Setup

### Option A: n8n Cloud (empfohlen für Start)
1. Account auf [n8n.cloud](https://n8n.cloud)
2. **EU-Region wählen** (Pflicht für DSGVO)
3. Workspace-URL notieren (für Webhook-Variante)

### Option B: Self-Host
```bash
# Hetzner CX22 (€4/Mo), Standort Falkenstein/Nürnberg
docker run -d --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=<strong-pw> \
  -e WEBHOOK_URL=https://n8n.deine-domain.com \
  -e EXECUTIONS_DATA_PRUNE=true \
  -e EXECUTIONS_DATA_MAX_AGE=336 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```
`EXECUTIONS_DATA_MAX_AGE=336` = 14 Tage Log-Retention (DSGVO-Minimal). Cloudflare-Tunnel oder nginx + Let's Encrypt davor.

---

## Schritt 2: Workflow importieren

1. n8n → Workflows → „+" → „Import from File"
2. `workflow.json` aus diesem Blueprint-Folder hochladen
3. Benennen: „AEVUM Meeting-Summarizer"
4. **NICHT aktivieren**, bevor Schritte 3–9 fertig sind.

---

## Schritt 3: Fireflies-Credential + Transkript-Fetch

### 3.1 API-Key holen
Fireflies → Settings → Developer Settings → API Key kopieren.

### 3.2 Credential anlegen
n8n → Credentials → „Header Auth" → Name `Fireflies API (Bearer)`:
- Header-Name: `Authorization`
- Header-Value: `Bearer <FIREFLIES_API_KEY>`

Im Node „HTTP: Fireflies Transkripte holen" dieses Credential referenzieren.

### 3.3 Zoom statt Fireflies?
- Node-URL auf Zoom-REST umbauen: `GET https://api.zoom.us/v2/meetings/{meetingId}/recordings` + Transcript-Datei (VTT) laden.
- Auth: OAuth-Bearer (Zoom Server-to-Server-App).
- Im Node „Code: Transkript aufbereiten" die Feld-Namen (`sentences`, `speaker_name`, `text`) auf das VTT-Parsing anpassen.
- Rest des Flows bleibt identisch.

---

## Schritt 4: Trigger wählen (Schedule ODER Webhook)

**Wichtig: nur EINEN Trigger aktiv lassen.**

### Option A: Schedule (Polling) — einfacher Start
- Node „Schedule: Alle 15 Min" ist Default aktiv (`*/15 * * * *`).
- **Dedup beachten:** Polling kann dasselbe Meeting mehrfach ziehen. Entweder Lookback exakt aufs Intervall einstellen oder einen `meetingId`-Check ergänzen (siehe Schritt 8).
- Webhook-Node deaktivieren (Node → Disable).

### Option B: Webhook (Push) — sauberer, kein Dedup-Problem
1. Node „Webhook: Fireflies/Zoom Push" öffnen, Production-URL kopieren.
2. In Fireflies: Settings → Webhooks → Event „Transcription completed" → diese URL eintragen.
   (Zoom: Event-Subscription `recording.transcript_completed`.)
3. **Signing-Secret verifizieren** (Sicherheit, siehe SECURITY-RISKS Punkt 3).
4. Schedule-Node deaktivieren.

---

## Schritt 5: Anthropic-/LLM-Setup

1. Account auf console.anthropic.com, Credit aufladen.
2. **Spending-Cap setzen!** → Settings → Limits → hart auf €50/Mo.
3. API-Key generieren.
4. n8n → Credentials → „Header Auth" → Name `Anthropic API (x-api-key)`:
   - Header-Name: `x-api-key`
   - Header-Value: `<ANTHROPIC_API_KEY>`
5. Im Node „HTTP: KI-Summary (Claude)" Credential referenzieren.
6. **Modell-Wahl** (Set-Node `llmModel`):
   - Default: `claude-3-5-sonnet-20241022` (gute Struktur-Treue)
   - Budget: `claude-3-5-haiku-20241022`
   - **DSGVO-strikt:** OpenRouter-Endpoint + EU-Modell ODER Mistral-EU (URL + Body anpassen)
7. Token NIE direkt im Node-Body — immer Credential.

---

## Schritt 6: Konfiguration ausfüllen (Set-Node)

Set-Node „Konfiguration" öffnen, alle `{{INDIVIDUELL: ...}}` ersetzen:

- `crmBaseUrl` → dein CRM-Endpoint
- `notifyChannel` → Slack/Teams-Webhook
- `errorChannel` → Webhook für Fehler-Alerts (darf = notifyChannel)
- `summaryRecipientEmail` → interner Verteiler
- `senderEmail` → Versand-Adresse
- `llmModel` → falls anderes Modell

`firefliesGraphqlUrl` und `lookbackMinutes` nur bei Bedarf ändern.

---

## Schritt 7: Output-Kanäle konfigurieren

### 7.1 CRM-Sync
1. Credential `CRM API (Bearer)` anlegen (Auth-Header deines CRM).
2. Node „HTTP: CRM-Sync" — Body ist im **Airtable-Format** als Default.
   - **Airtable:** Feldnamen (`Meeting`, `Datum`, `Summary`, `Entscheidungen`, `ActionItems`, `Sentiment`, `TranskriptLink`) müssen in deiner Tabelle existieren.
   - **HubSpot/Pipedrive:** Body-Schema + URL auf Ziel-API anpassen (z.B. HubSpot `/crm/v3/objects/notes`).
3. CRM-Token mit **Minimal-Scope** (nur Insert in eine Tabelle).

### 7.2 Slack/Teams-Notify
1. Slack: App → Incoming Webhooks → Webhook-URL → in `notifyChannel`.
2. Teams: Channel → Connectors → Incoming Webhook → URL.
   (Bei Teams ggf. Payload von Slack-`text` auf MessageCard-Schema anpassen.)
3. Channel **restricted/privat** wählen (vertrauliche Call-Inhalte).

### 7.3 Mail
1. SMTP-Credential anlegen (Resend: Host `smtp.resend.com`, Port 465, User `resend`, Pass = API-Key).
2. Node „Email: Summary versenden" referenziert SMTP-Credential.
3. Nicht genutzte Output-Nodes deaktivieren (Node → Disable).

---

## Schritt 8: Dedup-Erweiterung (empfohlen bei Polling)

**Bei Schedule-Trigger Pflicht, sonst doppelte Einträge/Mails.**

Vor „Code: Transkript aufbereiten" einbauen:
```
[Filter: Nur echte Transkripte]
   → [HTTP/DB: meetingId schon im CRM?]
   → [IF: gefunden === true]
       → [No-Op (skip)]
       → [Code: Transkript aufbereiten] → ...
```
Alternativ n8n-Static-Data nutzen: in einem Code-Node `$workflow.staticData.seen[meetingId]` prüfen/setzen. AEVUM-DFY baut das als Default ein. Bei Webhook-Trigger ist Dedup nicht nötig.

---

## Schritt 9: Test-Run

**Vor Aktivierung: 1 echtes, kurzes Test-Meeting durchspielen.**

1. Kurzen Test-Call in Fireflies transkribieren lassen (oder bestehendes nehmen).
2. Schedule-Node temporär durch Manual-Trigger ersetzen (oder „Execute Workflow").
3. Manuell ausführen.

### Test-Verifikation
- ✅ Transkript wird geholt (Fireflies-Node liefert Daten)
- ✅ Filter lässt das echte Meeting durch
- ✅ Summary-JSON ist sinnvoll, **kein erfundener Owner/Termin**
- ✅ CRM-Datensatz erscheint korrekt befüllt
- ✅ Slack/Teams-Nachricht kommt an
- ✅ Mail kommt an, HTML rendert sauber
- ✅ **Fehler-Pfad:** Fireflies-Credential kurz auf falsch setzen → Lauf → Fehler-Alert muss im `errorChannel` landen → danach Credential korrigieren
- ✅ Bei Polling: zweiter Lauf erzeugt KEINEN Duplikat (Dedup greift)

---

## Schritt 10: Aktivierung + Monitoring

### 10.1 Scharf schalten
1. Letzte Prüfung Set-Node (URLs/Adressen real?).
2. Nur ein Trigger aktiv (Schedule oder Webhook).
3. Workflow auf „Active".

### 10.2 n8n-Settings
- Execution-Log-Retention: 14–30 Tage.
- Sensitive-Field-Masking für `transcriptText`, `summary`.

### 10.3 Erste Tage (täglich 5 Min)
- 3–5 Summaries gegen die echten Calls gegenlesen (Halluzination-Check).
- n8n-Execution-Failures scannen.
- Anthropic-Cost-Check (Spending-Cap nicht erreicht?).

### 10.4 Wöchentlich
- Stichprobe Summary-Qualität (Action-Item-Treffsicherheit).
- Doppel-Einträge im CRM? → Dedup prüfen.
- Token-Cost-Review.

---

## Troubleshooting

### Fireflies-Node liefert leer / Fehler
- API-Key gültig? (401 → Key falsch/revoked)
- GraphQL-Query-Felder vom Fireflies-Plan abgedeckt? (manche Felder Pro-only)
- `data.transcripts`-Pfad im Split-Node korrekt? (bei Fehler Response-Struktur prüfen)

### Summary leer / kein valides JSON
- LLM hat Markdown drumrum geschrieben → Parser-Fallback greift normalerweise; bei Hard-Fail → Error-Alert
- `max_tokens` zu niedrig? (Default 1500, bei langen Action-Item-Listen erhöhen)
- Modell-ID korrekt? (Tippfehler in `llmModel` → 404)

### Erfundene Owner/Fristen
- Anti-Halluzination-Prompt ist drin — bei wiederholten Problemen Prompt verschärfen + `temperature` senken (Default 0.2)
- Transkript-Qualität schlecht (Sprecher-Verwechslung in Fireflies)? → Diarization in Fireflies prüfen

### Doppelte CRM-Einträge / Mails
- Polling ohne Dedup → Schritt 8 umsetzen oder auf Webhook-Trigger wechseln
- Lookback > Poll-Intervall → Lookback reduzieren

### LLM-Kosten zu hoch
- Filter greift nicht (Müll-Calls gehen durch)? → Schwellwert in „Filter" erhöhen
- Transkript-Cut zu hoch? → MAX im Code-Node senken
- Spending-Cap setzen!

### CRM-Sync 422 / falsches Feld
- Feldnamen im Body ≠ CRM-Schema → exakt angleichen
- Bei HubSpot/Pipedrive: Body-Schema komplett anpassen (Airtable ist nur Default)

### Slack/Teams-Notify schlägt fehl
- Webhook-URL gültig? Teams braucht MessageCard-Schema statt Slack-`text`
- Channel existiert / Webhook nicht widerrufen?

### Fehler-Alert kommt nicht
- `errorChannel`-Webhook gesetzt?
- `onError`-Routing der HTTP-Nodes auf „continueErrorOutput"? (im Default so)

---

## Wartung

| Intervall | Task |
|---|---|
| Täglich (erste Woche) | Summary-Stichprobe gegen Calls, Execution-Failures scannen |
| Wöchentlich | Hook-/Action-Item-Qualität prüfen, CRM-Duplikate checken, Token-Cost |
| Monatlich | Vendor-DPAs prüfen, Log-Retention verifizieren, alte Transkripte in Fireflies/Zoom bereinigen |
| Quartalsweise | API-Keys rotieren, Modell-Update prüfen, DSFA-Status reviewen |
| Halbjährlich | Workflow-Update vom AEVUM-Repo ziehen (neue Mitigations/Features) |

---

## Done-for-You-Variante

Wenn dir CRM-Mapping, Dedup-Logik und DSGVO-konformes LLM-Setup zu fummelig sind: AEVUM macht das komplett.

**DFY-Scope:**
- Fireflies/Zoom + CRM + Channel verbunden + getestet
- Dedup-Node (`meetingId`-Check) als Default
- Webhook-Signatur-Verifizierung
- OpenRouter-EU / Mistral-EU-Setup für DSGVO-strikte Customer
- CRM-Schema-Mapping (HubSpot/Pipedrive/Salesforce)
- Prompt-Tuning auf Customer-Vokabular
- Spending-Cap + Token-Rotation
- 5 Live-Test-Calls mit Output-Review

→ Buchung über [aevum-system.de/shop](https://aevum-system.de/shop) (DFY-Variante wählen).
