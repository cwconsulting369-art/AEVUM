# Lead-Qualifier Pro — Install-Guide

**Blueprint:** lead-qualifier-pro
**Setup-Dauer:** 30–60 Min
**Schwierigkeit:** Mittel (n8n-Grundkenntnisse hilfreich)
**Letzter Update:** 2026-05-25

---

## Vorab-Check

### Tools die du brauchst

| Tool | Pflicht | Zweck | Kosten |
|---|---|---|---|
| n8n (Cloud oder Self-Host) | ✅ | Workflow-Engine | €0–20/Mo |
| Form-Tool (Tally / Typeform / Custom) | ✅ | Lead-Quelle | €0–29/Mo |
| CRM (Airtable / HubSpot / Notion) | ✅ | Lead-Speicher | €0–20/Mo |
| E-Mail-Provider (Resend / SMTP / Mailchimp) | ✅ | Lead-Bestätigung | €0–15/Mo |
| Telegram-Bot | ❌ | Hot-Lead-Alert | €0 |
| Cloudflare | ⚠️ | DDoS + Rate-Limit (Pflicht für Production) | €0 (Free) |

### Token & Secrets die du brauchst (sammeln vorher!)

```
# Form-Tool
FORM_WEBHOOK_TOKEN=<generieren — 32-char random>

# CRM
AIRTABLE_API_KEY=<aus Airtable Account → Developer Hub>
AIRTABLE_BASE_ID=<aus Airtable URL: airtable.com/{BASE_ID}/...>
AIRTABLE_TABLE_ID=<Tabellen-ID>

# ODER HubSpot
HUBSPOT_PRIVATE_APP_TOKEN=<aus HubSpot Settings → Integrations → Private Apps>

# E-Mail
RESEND_API_KEY=<aus resend.com → API Keys>
EMAIL_FROM=leads@deine-domain.com  # MUSS Domain-verifiziert sein

# Telegram (optional)
TELEGRAM_BOT_TOKEN=<von @BotFather>
TELEGRAM_CHAT_ID=<deine Chat-ID, ermitteln via @userinfobot>
```

**Empfehlung:** Alle Tokens in einem Passwort-Manager (1Password / Bitwarden) speichern, NICHT im Klartext.

---

## Schritt 1: n8n-Setup

### Option A: n8n Cloud (empfohlen für Start)

1. Account auf [n8n.cloud](https://n8n.cloud) erstellen
2. **EU-Region wählen** (Pflicht für DSGVO!)
3. Workspace-URL notieren: `https://<dein-workspace>.app.n8n.cloud`

### Option B: Self-Host (für >100 Workflows/Mo oder Datenschutz-Bedürfnis)

```bash
# Hetzner CX22 (€4/Mo) oder gleichwertig, Standort Falkenstein/Nürnberg
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
3. Workflow benennen: "AEVUM Lead-Qualifier"
4. **NICHT aktivieren** bevor Schritt 3–5 fertig sind!

---

## Schritt 3: Webhook konfigurieren

1. **Webhook-Node** öffnen (erstes Element)
2. Webhook-URL kopieren — format: `https://<workspace>.app.n8n.cloud/webhook/lead-qualifier`
3. **Authentication** auf "Header Auth" setzen
4. Header-Name: `X-AEVUM-Token`
5. Header-Value: dein `FORM_WEBHOOK_TOKEN` (32-char random aus Vorab-Check)

---

## Schritt 4: Form-Tool konfigurieren

### Tally (empfohlen, EU-Hosting)

1. Tally → Form → "Integrations" → "Webhook"
2. URL: deine n8n-Webhook-URL
3. Custom Header hinzufügen: `X-AEVUM-Token: <dein Token>`
4. Felder mappen (Form-Field → JSON-Key):
   - `firstName`, `lastName`, `email`, `company`, `message`, `budget`, `timing`, `role`, `companySize`, `industry`, `source`

### Typeform

1. Typeform → "Connect" → "Webhooks"
2. URL + Header eintragen
3. Field-Mapping über Typeform-Logic-Map

### Eigenes Formular

```javascript
fetch('https://<workspace>.app.n8n.cloud/webhook/lead-qualifier', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-AEVUM-Token': '<token>'
  },
  body: JSON.stringify({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    company: formData.company,
    message: formData.message,
    budget: formData.budget,
    timing: formData.timing,
    role: formData.role,
    companySize: formData.companySize,
    industry: formData.industry,
    source: 'website-form'
  })
})
```

---

## Schritt 5: CRM-Verbindung

### Airtable

1. **HTTP Request: CRM Push** Node öffnen
2. URL: `https://api.airtable.com/v0/<AIRTABLE_BASE_ID>/<AIRTABLE_TABLE_ID>`
3. Method: POST
4. Header: `Authorization: Bearer <AIRTABLE_API_KEY>`
5. Body (JSON):
```json
{
  "fields": {
    "Name": "{{ $json.firstName }} {{ $json.lastName }}",
    "Email": "{{ $json.email }}",
    "Company": "{{ $json.company }}",
    "Score": {{ $json.score }},
    "Routing": "{{ $json.routing }}",
    "Source": "{{ $json.source }}",
    "Submitted": "{{ $json.submittedAt }}"
  }
}
```

**Pflicht:** In Airtable die Tabelle "Leads" mit genau diesen Feldnamen anlegen (case-sensitive!).

### HubSpot

1. **HTTP Request: CRM Push** Node anpassen
2. URL: `https://api.hubapi.com/crm/v3/objects/contacts`
3. Header: `Authorization: Bearer <HUBSPOT_PRIVATE_APP_TOKEN>`
4. Body:
```json
{
  "properties": {
    "firstname": "{{ $json.firstName }}",
    "lastname": "{{ $json.lastName }}",
    "email": "{{ $json.email }}",
    "company": "{{ $json.company }}",
    "aevum_lead_score": "{{ $json.score }}",
    "aevum_routing": "{{ $json.routing }}"
  }
}
```

**Pflicht:** Custom-Properties `aevum_lead_score` und `aevum_routing` in HubSpot vorher anlegen.

---

## Schritt 6: E-Mail-Templates

### Hot-Lead-Alert (an dich)

In **Send Email: Hot-Lead** Node:
- From: `EMAIL_FROM`
- To: deine E-Mail
- Subject: `🔥 Hot Lead ({{ $json.score }}/100): {{ $json.firstName }} {{ $json.lastName }} ({{ $json.company }})`
- Body: Score-Breakdown + Lead-Daten + Call-to-Action

### Lead-Bestätigung (an Lead)

In **Send Email: Lead-Confirmation** Node:
- From: `EMAIL_FROM`
- To: `{{ $json.email }}`
- Subject: `Vielen Dank für deine Nachricht, {{ $json.firstName }}`
- Body: Bestätigung + Erwartungs-Management ("Wir melden uns binnen 24h")

### Cold-Lead-Nurture (an Lead, OPT-IN-Pflicht)

Nur senden wenn Marketing-Checkbox getickt war (Conditional-Node).

---

## Schritt 7: Telegram-Bot (optional)

1. @BotFather in Telegram → `/newbot` → Name + Username → Token notieren
2. @userinfobot in Telegram → `/start` → eigene Chat-ID notieren
3. **Telegram Node** im Workflow → Credentials hinzufügen mit Bot-Token
4. Chat-ID + Message-Template setzen

---

## Schritt 8: Cloudflare (Pflicht für Production)

1. Domain bei Cloudflare hinzufügen (NS auf Cloudflare zeigen lassen)
2. DNS-Eintrag für n8n-Subdomain (Self-Host) oder Page-Rule für n8n.cloud-URL
3. **Bot-Fight-Mode aktivieren** (Security → Bots → On)
4. **Rate-Limit** einrichten:
   - Path: `/webhook/lead-qualifier`
   - Limit: 30 requests/min per IP
   - Action: Block

---

## Schritt 9: Test-Run

**Vor Aktivierung 3 Test-Submissions durchspielen:**

1. **Hot-Test:**
   - Budget: "20.000€"
   - Role: "Geschäftsführer"
   - Need: "Wir brauchen sofort eine Lösung für..."
   - Erwartung: Score >70, Routing "hot", Telegram-Alert kommt

2. **Warm-Test:**
   - Budget: "5.000-15.000€"
   - Role: "Manager"
   - Need: "Wir denken über Automatisierung nach"
   - Erwartung: Score 40-70, Routing "warm"

3. **Cold-Test:**
   - Budget: "Noch unklar"
   - Role: "Assistent"
   - Need: "Mal schauen was möglich ist"
   - Erwartung: Score <40, Routing "cold"

**Jeder Test verifizieren:**
- ✅ Lead in CRM mit korrektem Score
- ✅ Score-Breakdown nachvollziehbar
- ✅ Routing korrekt
- ✅ E-Mail-Bestätigung an Test-Adresse angekommen

---

## Schritt 10: Aktivieren + Monitoring

1. Workflow in n8n auf "Active" schalten
2. **n8n-Execution-Log** → Retention auf 30 Tage setzen (Settings → Workflow History)
3. **Wöchentliches Monitoring** (5 Min/Wo):
   - Erfolgsrate (Executions: Success vs Failed)
   - Score-Verteilung (Hot/Warm/Cold-Anteil)
   - Top-Branchen / Top-Sources

---

## Troubleshooting

### Webhook empfängt keine Daten
- **Form-Tool Header korrekt?** Test mit curl:
  ```bash
  curl -X POST https://<workspace>.app.n8n.cloud/webhook/lead-qualifier \
    -H "Content-Type: application/json" \
    -H "X-AEVUM-Token: <dein-token>" \
    -d '{"firstName":"Test","email":"test@example.com","company":"AEVUM"}'
  ```
- **n8n-Execution-Log** prüfen — kommt Trigger an?
- **n8n im Test-Modus?** Webhook in Production-Mode aktivieren

### Score immer 0
- **Field-Mapping korrekt?** In Set-Node prüfen — kommen die Daten an?
- **Console.log in Code-Node aktivieren** → Execution-Log anschauen
- **JSON-Pfad korrekt?** Tally schickt `body.firstName`, Typeform manchmal `event.first_name`

### CRM-Push 401/403
- **API-Token korrekt?** In CRM neu generieren
- **Permissions?** Token braucht Schreib-Rechte auf Tabelle
- **Feldnamen case-sensitive!** "Email" ≠ "email" in Airtable

### E-Mail kommt nicht an
- **Domain verifiziert?** Resend/SES brauchen DNS-Records (SPF + DKIM + MX)
- **Spam-Filter?** Erst-Mails landen oft in Spam — Customer auf Whitelist setzen
- **Resend Rate-Limit?** Free-Plan: 3.000/Mo

### Telegram-Alert kommt nicht
- **Bot mit Chat verbunden?** Bot muss `/start` vom Chat gesehen haben
- **Chat-ID korrekt?** Bei negativem Vorzeichen für Gruppen (`-1001234567890`)

---

## Wartung

| Intervall | Task |
|---|---|
| Täglich | n8n-Execution-Log auf Fehler scannen |
| Wöchentlich | Score-Verteilung reviewen, Threshold ggf. anpassen |
| Monatlich | Vendor-DPAs prüfen, Aufbewahrungs-Cleanup (Cold-Leads >90d löschen) |
| Quartalsweise | Workflow-Audit (kein Token-Leak, alle Credentials rotiert) |

---

## Done-for-You-Variante

Wenn dir das zu viel ist: AEVUM macht das komplett für dich (~4h Setup, DSGVO + Security gehärtet, Test-Run inkl., 30 Tage Support).

→ Buchung über [aevum-system.de/shop](https://aevum-system.de/shop) (DFY-Variante wählen)
