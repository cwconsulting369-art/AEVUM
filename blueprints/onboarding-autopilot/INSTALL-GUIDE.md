# Onboarding-Autopilot — Install-Guide

**Blueprint:** onboarding-autopilot
**Setup-Dauer:** 30–45 Min
**Schwierigkeit:** Mittel (n8n-Grundkenntnisse hilfreich)
**Letzter Update:** 2026-05-25

---

## Vorab-Check

### Tools die du brauchst

| Tool | Pflicht | Zweck | Kosten |
|---|---|---|---|
| n8n (Cloud-EU oder Self-Host) | ✅ | Workflow-Engine | €0–20/Mo |
| Trigger-Quelle (Tally / Typeform / Airtable-Automation / Manual) | ✅ | Onboarding-Start | €0–29/Mo |
| E-Mail-Provider (Resend empfohlen / SMTP / Mailchimp) | ✅ | Welcome + Follow-up | €0–15/Mo |
| CRM (Airtable oder Notion) | ✅ | Customer-Record | €0–20/Mo |
| Slack-Workspace | ❌ | Team-Ping | €0–8/Mo |
| Calendly | ❌ | Kick-off-Buchung | €0–10/Mo |
| Cloudflare | ⚠️ | DDoS + Rate-Limit (Pflicht für Production) | €0 (Free) |

### Token & Secrets die du brauchst (vorher sammeln!)

```
# Webhook-Schutz
WEBHOOK_TOKEN=<generieren — 32-char random, openssl rand -hex 16>

# E-Mail
RESEND_API_KEY=<aus resend.com → API Keys>
EMAIL_FROM=willkommen@deine-domain.com  # MUSS Domain-verifiziert sein

# CRM (Airtable ODER Notion)
AIRTABLE_API_KEY=<aus Airtable Account → Developer Hub → Personal Access Token, Scope: data.records:read+write, Base-only>
AIRTABLE_BASE_ID=<aus URL: airtable.com/{BASE_ID}/...>
AIRTABLE_TABLE_NAME=Kunden   # oder anderer Tabellenname

# ODER Notion
NOTION_INTEGRATION_TOKEN=<aus notion.so/my-integrations>
NOTION_DATABASE_ID=<aus DB-URL>

# Slack (optional)
SLACK_WEBHOOK_URL=<aus api.slack.com/apps → Incoming Webhooks für Channel #neue-kunden>

# Calendly (optional)
CALENDLY_LINK=https://calendly.com/<dein-handle>/kick-off
```

**Empfehlung:** Alle Tokens in Passwort-Manager (1Password / Bitwarden), NICHT im Klartext.

---

## Schritt 1: n8n-Setup

### Option A: n8n Cloud (empfohlen für Start)

1. Account auf [n8n.cloud](https://n8n.cloud) erstellen
2. **EU-Region wählen** (Pflicht für DSGVO!)
3. Workspace-URL notieren: `https://<dein-workspace>.app.n8n.cloud`

### Option B: Self-Host (für Datenschutz-Bedürfnis / High-Volume)

```bash
# Hetzner CX22 (€4/Mo), Standort Falkenstein/Nürnberg
ssh root@your-vps
docker run -d --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=<strong-pw> \
  -e WEBHOOK_URL=https://n8n.deine-domain.com \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Dann Cloudflare-Tunnel oder nginx davor + TLS via Let's Encrypt.

---

## Schritt 2: Workflow importieren

1. n8n öffnen → "Workflows" → "+" → "Import from File"
2. `workflow.json` aus diesem Blueprint-Folder hochladen
3. Workflow benennen: "AEVUM Onboarding-Autopilot"
4. **NICHT aktivieren** bevor Schritt 3–9 fertig sind!

---

## Schritt 3: Trigger-Option wählen

Onboarding-Autopilot unterstützt 3 Trigger-Varianten. Eine wählen:

### Option A: Formular-Trigger (Tally / Typeform)

**Wann nutzen:** Du hast eine Onboarding-Form-Seite, die Neukunden nach Sign-Off ausfüllen ("Willkommen, hier deine Daten").

1. **Webhook-Node** öffnen (erster Node)
2. Webhook-URL kopieren: `https://<workspace>.app.n8n.cloud/webhook/onboarding-new-customer`
3. **Authentication** auf "Header Auth" setzen
4. Header-Name: `X-AEVUM-Token`
5. Header-Value: dein `WEBHOOK_TOKEN`

**In Tally Pro:**
- Form → "Integrations" → "Webhook"
- URL eintragen, Custom Header `X-AEVUM-Token: <Token>` hinzufügen
- Felder mappen: `firstName`, `lastName`, `email`, `company`, `product`

**In Typeform:**
- "Connect" → "Webhooks" → URL + Header
- Field-Mapping über Typeform-Logic-Map

### Option B: CRM-Tag-Trigger (Airtable-Automation)

**Wann nutzen:** Du hast Customer schon in Airtable und setzt manuell Status "Neukunde" wenn Vertrag unterschrieben.

1. In Airtable → "Automations" → "+ Create automation"
2. Trigger: "When record matches conditions"
3. Conditions: `Status` = `Neukunde`
4. Action: "Send HTTP Request"
5. URL: deine n8n-Webhook-URL
6. Method: POST
7. Headers: `X-AEVUM-Token: <Token>`, `Content-Type: application/json`
8. Body:
```json
{
  "body": {
    "firstName": "{{ Name }}",
    "lastName": "",
    "email": "{{ Email }}",
    "company": "{{ Unternehmen }}",
    "product": "{{ Produkt }}"
  }
}
```

### Option C: Manueller Trigger

**Wann nutzen:** Für Tests oder selten-genutzte Onboardings.

- Webhook-Node bleibt aktiv, du triggerst manuell via curl:
```bash
curl -X POST https://<workspace>.app.n8n.cloud/webhook/onboarding-new-customer \
  -H "Content-Type: application/json" \
  -H "X-AEVUM-Token: <token>" \
  -d '{"body":{"firstName":"Max","lastName":"Mustermann","email":"max@example.com","company":"Muster GmbH","product":"Standard"}}'
```

---

## Schritt 4: Welcome-Mail anpassen

Im **Email: Welcome** Node:

1. **From-Email** auf deine verifizierte Domain setzen:
   - Resend: `willkommen@deine-domain.com` (Domain muss in Resend verifiziert sein)
   - SMTP: gleiche Domain wie SMTP-Account
2. **HTML-Template anpassen** (Zeile `message`):
   - `[DEIN TEAM]` → dein Name
   - `[DEIN UNTERNEHMEN]` → Firmenname
   - `[DEINE ADRESSE]` → Impressums-Adresse
   - `[DEINE_WEBSITE]` → URL
   - Optional: Logo als `<img src="https://...">` einfügen
3. **Calendly-Link** im Set-Node "Daten normalisieren":
   - Value `calendlyLink` auf deinen echten Calendly-Link setzen (z.B. `https://calendly.com/dein-handle/kick-off`)
4. **Subject prüfen:** `Willkommen an Bord, {{ $json.firstName }} — deine nächsten Schritte` — passt für die meisten

**Pflicht-Sanitize (Security-Fix):** Im Set-Node nach Webhook eine weitere Assignment hinzufügen:
```
name: firstName_safe
value: ={{ ($json.body.firstName || 'Kunde').replace(/<[^>]*>/g, '').slice(0, 50) }}
```
Im Email-Node `{{ $json.firstName_safe }}` statt `{{ $json.firstName }}` im Subject + Body verwenden. Verhindert HTML-Injection.

---

## Schritt 5: CRM-Verbindung

### Option Airtable

1. In Airtable Base anlegen: Tabelle `Kunden` mit Feldern:
   - `Name` (Single Line)
   - `E-Mail` (Email)
   - `Unternehmen` (Single Line)
   - `Produkt` (Single Line)
   - `Status` (Single Select: Onboarding / Aktiv / Pausiert)
   - `Onboarding Start` (Date/Time)
2. **HTTP: Datensatz anlegen** Node öffnen
3. URL: `https://api.airtable.com/v0/<AIRTABLE_BASE_ID>/Kunden`
4. Header: `Authorization: Bearer <AIRTABLE_API_KEY>` (in n8n als httpHeaderAuth-Credential)
5. Body-JSON-Template bleibt aus Workflow

**Pflicht:** Feldnamen in Airtable sind case-sensitive. "E-Mail" ≠ "email".

### Option Notion

1. In Notion DB anlegen mit Properties: `Name` (Title), `Email`, `Company`, `Product`, `Status` (Select), `Onboarding Start` (Date)
2. Notion-Integration auf DB sharen: DB-Seite → "..." → "Add connections" → deine Integration
3. **HTTP-Node ersetzen** durch n8n's nativen **Notion Node** (einfacher):
   - Operation: "Create Database Page"
   - Database: deine DB
   - Properties mappen aus `$('Set: Daten normalisieren').item.json`
4. ODER HTTP-Variante: URL `https://api.notion.com/v1/pages`, Header `Authorization: Bearer <NOTION_INTEGRATION_TOKEN>` + `Notion-Version: 2022-06-28`

**Scope-Pflicht:** Integration NUR auf Onboarding-DB sharen, nicht Workspace-weit.

---

## Schritt 6: Slack konfigurieren (optional)

1. **Slack-Webhook-URL erstellen:** api.slack.com/apps → "Create New App" → "From scratch" → "Incoming Webhooks" → "Add New Webhook to Workspace" → Channel `#neue-kunden` wählen → URL kopieren
2. In n8n **Credentials** anlegen: Type "HTTP Request - Header Auth" mit Slack-URL-Hosting, ODER direkt im HTTP-Node die URL setzen (siehe Security-Fix unten)
3. **HTTP: Slack Ping** Node öffnen → URL ersetzen
4. Channel ggf. anpassen (`#neue-kunden` → dein Channel)

**Security-Fix (Pflicht):** Slack-URL NICHT im Workflow-Body hardcoden. Stattdessen:
- n8n → Credentials → "+ Add Credential" → "HTTP Header Auth" → Name `slack-webhook`, Header `X-Slack-Webhook-URL` mit Wert
- Im HTTP-Node Credential-Reference nutzen
- ODER: n8n's nativen Slack-Node verwenden mit Slack-API-Token statt Webhook

---

## Schritt 7: Calendly-Link einfügen

1. In Calendly: Dein "Kick-off Call"-Event-Type öffnen → URL kopieren
2. Im **Set: Daten normalisieren** Node → Assignment `calendlyLink` → Value auf echten Link setzen
3. **NICHT Single-Use-Links verwenden** — Standard-Link bevorzugen (stabil über Zeit)

Falls du kein Calendly nutzt: Cal.com / Doodle / direktes Mail-Antwort-Modell:
- Mail-Template anpassen: "Antworte einfach auf diese Mail mit 2-3 Terminvorschlägen"
- `calendlyLink`-Block in HTML-Template entfernen

---

## Schritt 8: 3-Tages-Check-in-Trigger verifizieren

Der **Wait: 3 Tage** Node hält den Workflow 72h offen. Wichtige Punkte:

1. **n8n-Modus:** Wait-Nodes funktionieren NUR in n8n-Cloud oder Self-Host mit Worker-Mode. Single-Process-Mode kann Wait-States verlieren bei Restart.
2. **Dauer anpassen:** Wait-Node öffnen → `amount: 3, unit: days` → bei Bedarf ändern (1 Tag für kurze Projekte, 5-7 Tage für Enterprise)
3. **Check nach Restart:** Bei n8n-Update Workflow-Executions prüfen, ob Wait-States überlebt haben (Executions → "Waiting" Filter)

**Bounce-Handler (Empfohlen):** Nach **Email: Welcome** Node einen If-Node einfügen:
- Condition: `{{ $json.responseStatus }} >= 400`
- True-Branch: Telegram/Slack-Alert an Carlos + Workflow stoppen
- False-Branch: weiter zu Wait-Node

---

## Schritt 9: Test-Run mit Fake-Customer

**Vor Aktivierung 1-2 Test-Submissions durchspielen:**

```bash
# Standard-Test
curl -X POST https://<workspace>.app.n8n.cloud/webhook/onboarding-new-customer \
  -H "Content-Type: application/json" \
  -H "X-AEVUM-Token: <token>" \
  -d '{"body":{"firstName":"Max","lastName":"Tester","email":"DEINE-TEST-EMAIL@gmail.com","company":"Test GmbH","product":"Standard"}}'

# Edge-Case-Test: HTML-Injection im Vornamen (sollte sanitized werden)
curl -X POST https://<workspace>.app.n8n.cloud/webhook/onboarding-new-customer \
  -H "Content-Type: application/json" \
  -H "X-AEVUM-Token: <token>" \
  -d '{"body":{"firstName":"<script>alert(1)</script>Hack","lastName":"Test","email":"test2@example.com","company":"Inject Inc","product":"Standard"}}'
```

**Verifizieren:**
- Welcome-Mail kommt an Test-Adresse mit korrektem Vornamen (kein HTML-Code sichtbar)
- CRM-Record in Airtable/Notion korrekt angelegt
- Slack-Channel hat Ping bekommen
- Subject hat saubere Anzeige
- Nach 3 Tagen (oder Test-mit-`wait: 1 minute`): Follow-up kommt

**Wait-Test-Trick:** Wait-Node temporär auf `1 minute` setzen für Test, dann zurück auf `3 days`.

---

## Schritt 10: Cloudflare + Aktivierung + Monitoring

### Cloudflare (Pflicht für Production)

1. Domain bei Cloudflare hinzufügen (NS zeigen lassen)
2. **Bot-Fight-Mode aktivieren** (Security → Bots → On)
3. **Rate-Limit** einrichten:
   - Path: `/webhook/onboarding-*`
   - Limit: 10 requests/min per IP (Onboarding ist Low-Volume)
   - Action: Block

### Aktivieren

1. Workflow in n8n auf "Active" schalten
2. **n8n-Execution-Log** → Retention auf 30 Tage (Settings → Workflow History → Delete after)

### Wöchentliches Monitoring (5 Min/Wo)

- Erfolgsrate: Executions → Success vs Failed
- Bounce-Rate: Wie viele Mails kommen zurück?
- Wait-State-Health: Wie viele "Waiting" Executions, welche länger als erwartet?
- CRM-Record-Sanity: Stichprobe in Airtable/Notion auf vollständige Records

---

## Troubleshooting

### Webhook empfängt keine Daten
- **Token korrekt im Header?** Test mit curl:
  ```bash
  curl -X POST https://<workspace>.app.n8n.cloud/webhook/onboarding-new-customer \
    -H "Content-Type: application/json" \
    -H "X-AEVUM-Token: <token>" \
    -d '{"body":{"firstName":"Test","email":"test@example.com","company":"AEVUM","product":"X"}}'
  ```
- **n8n-Execution-Log** prüfen — kommt Trigger an?
- **n8n im Test-Modus?** Webhook in Production-Mode aktivieren (Toggle in Webhook-Node)

### Welcome-Mail landet im Spam
- **SPF + DKIM gesetzt?** Resend zeigt im Dashboard ob DNS korrekt
- **DMARC-Policy?** Mindestens `p=quarantine`, besser `p=reject` nach 30d Monitoring
- **Domain-Reputation:** Neue Domain braucht Warmup (erst kleine Volumen, dann hochfahren)
- **Spam-Trigger-Wörter:** "Willkommen" + "Onboarding" ist meist OK, "Kostenlos" / "Garantie" / Caps vermeiden

### CRM-Push 401/403
- **API-Token korrekt?** In Airtable/Notion neu generieren
- **Permissions:** Token braucht write-Rechte auf Tabelle/DB
- **Notion-Integration auf DB shared?** "..." → "Add connections" am DB-Header
- **Airtable Feldnamen case-sensitive!** "Name" ≠ "name"

### Slack-Ping kommt nicht
- **Webhook-URL korrekt?** Slack-App-Settings → Incoming Webhooks → URL kopieren neu
- **Channel existiert?** `#neue-kunden` muss als public oder Bot-Member-of-private vorhanden sein
- **Bot in private Channel hinzufügen:** Im Channel `/invite @AEVUM-Onboarding-Bot`
- **Webhook revoked?** Slack-Admin kann revoke'n, dann neue URL ziehen

### Wait-3d-Trigger feuert nicht
- **n8n-Modus prüfen:** Self-Host braucht Worker-Mode für reliable Wait-States. Single-Process kann States verlieren bei Restart.
- **Execution noch in "Waiting"?** Executions → Filter "Waiting" → suchen
- **n8n neugestartet?** Wait-States überleben Standard-Restarts, ABER nicht Worker-Crashs ohne Persistent-Queue
- **Datum/Zeit korrekt?** Server-Time prüfen, Drift kann Wait verzögern

### Customer-Daten enthält HTML/Script (Injection-Attempt)
- **Sanitize-Step im Set-Node?** Siehe Schritt 4 — `firstName_safe = firstName.replace(/<[^>]*>/g, '')`
- **Subject + Body nur `_safe`-Variante nutzen**
- Bei wiederkehrenden Injection-Attempts: Origin-Check im Webhook + Cloudflare-WAF-Rule

---

## Wartung

| Intervall | Task |
|---|---|
| Täglich | n8n-Execution-Log auf Fehler scannen, Bounce-Rate prüfen |
| Wöchentlich | Sample-Welcome-Mail an Test-Account senden um Reputation zu checken; CRM-Records auf Vollständigkeit |
| Monatlich | Vendor-DPAs prüfen, Calendly-Link-Health, Slack-Channel-Cleanup |
| Quartalsweise | Workflow-Audit (kein Token-Leak, alle Credentials rotiert), Welcome-Mail-Template auf Aktualität (Adresse/Impressum) |

---

## Done-for-You-Variante

Wenn dir das zu viel ist: AEVUM macht das komplett für dich (~3h Setup, DSGVO + Security gehärtet, HTML-Sanitize-Node + Bounce-Handler inkl., Test-Run + 30 Tage Support).

→ Buchung über [aevum-system.de/shop](https://aevum-system.de/shop) (DFY-Variante wählen)
