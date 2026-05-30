# Proposal-Generator — Install-Guide

**Blueprint:** proposal-generator
**Setup-Dauer:** 45–75 Min
**Schwierigkeit:** Mittel (1 LLM-Credential + 1 PDF-Provider + Katalog-Modellierung)
**Letzter Update:** 2026-05-30

---

## Vorab-Check

### Tools die du brauchst

| Tool | Pflicht | Zweck | Kosten |
|---|---|---|---|
| n8n (Cloud-EU oder Self-Host) | ✅ | Workflow-Engine | €0–20/Mo |
| Anthropic API-Key | ✅ | KI-Strukturierung (Claude) | ~€0,01–0,03/Angebot |
| HTML-zu-PDF-API (PDFShift / html2pdf.app / Gotenberg) | ✅* | PDF-Erzeugung | PDFShift ab €9/Mo, Gotenberg self-host €0 |
| SMTP / Mail-Provider (Resend / Postmark / Mailgun) | ✅ | Versand (Review/Kunde/Fehler) | €0–15/Mo |
| CRM / Sheet / Supabase | ⚠️ | Angebots-Log | €0–20/Mo |
| Cloudflare (Webhook-Schutz) | ⚠️ | Rate-Limit + Token | €0 (Free) |

\* PDF optional: Node deaktivierbar, dann nur HTML-Mail.

### Token & Secrets die du brauchst (vorher sammeln!)

```
# n8n
N8N_WEBHOOK_BASE_URL=https://<workspace>.app.n8n.cloud
N8N_INTAKE_TOKEN=<generieren — 32-char random, fuer Webhook-Header-Auth>

# Anthropic
ANTHROPIC_API_KEY=<aus console.anthropic.com>
ANTHROPIC_SPENDING_CAP=30   # EUR/Monat, hart einstellen

# PDF-Provider (Beispiel PDFShift)
PDF_RENDER_URL=https://api.pdfshift.io/v3/convert/pdf
PDF_RENDER_KEY=<aus PDFShift-Dashboard>
# ODER self-host: PDF_RENDER_URL=http://gotenberg:3000/forms/chromium/convert/html

# Mail-Provider (Beispiel Resend)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<Resend-API-Key>

# CRM-Store (Beispiel Airtable / Supabase)
PROPOSAL_STORE_URL=https://api.airtable.com/v0/<BASE_ID>/proposals
PROPOSAL_STORE_KEY=<Airtable-/Supabase-Token>

# Vendor-Daten (fuer Angebots-Footer)
VENDOR_NAME=Vorname Nachname
VENDOR_COMPANY=Firma (Rechtsform)
VENDOR_ADDRESS=Strasse, PLZ Ort
VENDOR_EMAIL=angebote@deine-domain.de
NOTIFY_EMAIL=sales@deine-domain.de
```

**Empfehlung:** Tokens in Passwort-Manager, NICHT im Klartext.

---

## Schritt 1: n8n-Setup

### Option A: n8n Cloud (empfohlen für Start)
1. Account auf [n8n.cloud](https://n8n.cloud)
2. **EU-Region wählen** (Pflicht für DSGVO)
3. Workspace-URL notieren

### Option B: Self-Host
```bash
# Hetzner CX22 (~€4/Mo), Standort Falkenstein/Nürnberg
docker run -d --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=<strong-pw> \
  -e WEBHOOK_URL=https://n8n.deine-domain.com \
  -e EXECUTIONS_DATA_PRUNE=true \
  -e EXECUTIONS_DATA_MAX_AGE=720 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```
Cloudflare-Tunnel oder nginx + Let's Encrypt davor.

---

## Schritt 2: Workflow importieren

1. n8n → "Workflows" → "+" → "Import from File"
2. `workflow.json` hochladen
3. Benennen: "AEVUM Proposal-Generator"
4. **NICHT aktivieren** bevor Schritte 3-10 fertig sind!

---

## Schritt 3: Anthropic-Credential

1. Account auf [console.anthropic.com](https://console.anthropic.com), Credit aufladen
2. **Spending-Cap setzen** (Settings → Limits → z.B. €30/Mo, hart)
3. **Zero-Retention / EU-Optionen** prüfen und aktivieren wo verfügbar (DSGVO)
4. API-Key generieren
5. In n8n: Credentials → "Anthropic API" anlegen, Key eintragen
6. Im Node `Anthropic Chat Model` die Credential referenzieren
7. Modell-Default ist `claude-3-5-sonnet-20241022` (gute Struktur-Qualität). Budget-Alternative: ein Haiku-Modell — schneller/günstiger, etwas gröbere Struktur.

**Token NUR im Credential-Store, niemals im Node-Body.**

---

## Schritt 4: PDF-Provider einrichten

### Option A: PDFShift / html2pdf.app (gehostet, schnell)
1. Account anlegen, API-Key holen
2. In n8n: Credentials → "Header Auth" → Name `PDF-Render API`
   - PDFShift: Header `Authorization`, Value `Basic <base64(api:KEY)>` (siehe Provider-Doku)
3. Im Node `HTTP: PDF generieren` Credential referenzieren
4. `pdfRenderUrl` im Set-Node auf den Endpoint setzen
5. **JSON-Body-Felder je Provider anpassen** (Node-Default nutzt `source` wie PDFShift; html2pdf.app erwartet `html`)

### Option B: Gotenberg self-host (empfohlen für DSGVO — kein Drittland)
```bash
docker run -d --name gotenberg -p 3000:3000 gotenberg/gotenberg:8
```
- `pdfRenderUrl` = `http://gotenberg:3000/forms/chromium/convert/html`
- Gotenberg erwartet **multipart-form** (HTML als Datei `index.html`), nicht JSON → im HTTP-Node `specifyBody` auf `form-data` umstellen, Feld `files` mit dem HTML.

### PDF weglassen (nur HTML-Mail)
- `HTTP: PDF generieren` deaktivieren, Verbindung direkt von `Code: Angebots-HTML rendern` → `HTTP: Angebot ins CRM loggen` ziehen.

---

## Schritt 5: Mail-Sender-Konfiguration

1. **SMTP-Credentials** in n8n anlegen (Settings → Credentials → "SMTP")
   - Resend: Host `smtp.resend.com`, Port 465, User `resend`, Password = API-Key
   - Postmark: Host `smtp.postmarkapp.com`, Port 587
2. In allen 3 Email-Nodes (`Email: Angebot an Kunden`, `Email: Angebot zur Review (intern)`, `Email: Fehler-Alert`) die SMTP-Credential referenzieren
3. **Absender-Domain mit SPF/DKIM/DMARC** einrichten (sonst landen auch interne Reviews im Spam) — mindestens für die Vendor-Domain

---

## Schritt 6: CRM-Log-Store

### Option A: Airtable
- Base + Tabelle `proposals` anlegen, Spalten passend zum JSON-Body des Nodes `HTTP: Angebot ins CRM loggen` (`proposalId`, `clientCompany`, `grossTotal`, `status`, ...)
- Credential "Header Auth" → `Proposal-Store API`, Header `Authorization: Bearer <AIRTABLE_KEY>`
- `proposalStoreUrl` = `https://api.airtable.com/v0/<BASE_ID>/proposals`

### Option B: Supabase (EU, empfohlen)
- Tabelle `proposals` mit gleichen Spalten
- `proposalStoreUrl` = `https://<REF>.supabase.co/rest/v1/proposals`
- Header `apikey` + `Authorization: Bearer <SERVICE_KEY>`

### CRM weglassen
- Node deaktivieren, Verbindung `HTTP: PDF generieren` → `IF: Direkt an Kunden?` direkt ziehen. (Empfehlung: nicht weglassen, Nachverfolgung ist wertvoll.)

---

## Schritt 7: Konfiguration füllen (das Herzstück)

Im Set-Node `Set: Angebots-Konfiguration` alle `{{INDIVIDUELL: ...}}` ersetzen:

### 7.1 Vendor-Daten
`vendorName`, `vendorCompany`, `vendorAddress`, `vendorEmail`, `notifyEmail` mit echten Werten.

### 7.2 Leistungskatalog (`serviceCatalog`)
Das definiert, **was du verkaufst und zu welchem Preis**. Beispiel-Struktur (im Node vorbefüllt, anpassen):
```json
{
  "setup_blueprint": { "label": "Blueprint-Setup (DIY)", "basePrice": 490, "unit": "einmalig" },
  "setup_dfy":       { "label": "Done-for-You",          "basePrice": 1490, "unit": "einmalig" },
  "workshop":        { "label": "Strategie-Workshop",    "basePrice": 890, "unit": "einmalig" },
  "retainer":        { "label": "Wartung",               "basePrice": 390, "unit": "pro Monat" },
  "integration":     { "label": "Zusatz-Integration",    "basePrice": 290, "unit": "pro Integration" }
}
```
- **Der LLM kann NUR diese Keys wählen** — erfundene Positionen werden vom Code verworfen.
- Keys sprechend benennen, Labels kundenfreundlich, Preise = deine echten Preise.

### 7.3 Pricing-Regeln (`pricingRules`)
```json
{
  "currency": "EUR",
  "vatRate": 0,                          // 0 = §19-UStG-Modus; 0.19 = regelbesteuert
  "vatNote": "Gemäß §19 UStG ...",       // bei vatRate>0 leeren
  "rushSurchargePct": 0.20,              // Express-Zuschlag
  "rushThresholdDays": 14,               // ab wann Express greift
  "volumeDiscountPct": 0.10,             // Mengenrabatt
  "volumeDiscountThreshold": 3000,       // ab welcher Summe
  "validityDays": 14,                    // "gültig bis"
  "depositPct": 0.50                     // Anzahlung
}
```

### 7.4 Versand-Modus (`sendMode`)
**`internal_review` lassen** (Default). Erst nach Qualitäts-Validierung auf `direct_client`.

---

## Schritt 8: Webhook-Intake absichern

1. Node `Webhook: Discovery-Intake` öffnen, URL kopieren:
   `https://<workspace>.app.n8n.cloud/webhook/proposal-generator-intake`
2. **Header-Token-Auth** aktivieren: im Webhook-Node "Authentication" → "Header Auth" → Credential mit Token (z.B. Header `X-Intake-Token`)
3. Cloudflare-Rate-Limit auf den Pfad (z.B. 10/min/IP)
4. Discovery-Quelle (Formular / Fireflies-Transcript-Webhook / manuelles Tool) muss den Token mitsenden

**Erwartetes POST-JSON:**
```json
{
  "clientName": "Anna Schmidt",
  "clientCompany": "Schmidt & Partner GmbH",
  "clientEmail": "anna@schmidt-partner.de",
  "notes": "Discovery-Call: braucht Lead-Routing + monatliche Betreuung, 2 Systeme anzubinden (HubSpot + Slack), Deadline Ende des Monats, Budget ~3000.",
  "requestedScope": "Automatisierung Lead-Routing",
  "budgetHint": 3000,
  "deadline": "2026-06-15"
}
```

---

## Schritt 9: Test-Run mit echten Notizen

**Vor Aktivierung: mindestens 3 echte Discovery-Beispiele durchspielen.**

1. `sendMode` auf `internal_review` lassen
2. Webhook-Test-Call mit echtem Beispiel-JSON (z.B. via `curl` oder n8n "Listen for Test Event")
3. **Verifikation:**
   - ✅ Struktur passt: gewählte Positionen passen zu den Notizen
   - ✅ Pricing korrekt: Zwischensumme, Rabatt, Express-Zuschlag, USt, Anzahlung stimmen rechnerisch
   - ✅ Keine erfundene Leistung im Angebot (nur Katalog-Positionen)
   - ✅ HTML/PDF lesbar, Footer mit Impressum + USt-Hinweis korrekt
   - ✅ Review-Mail kommt an, enthält Budget-/Datenlücken-Hinweis
   - ✅ CRM-Log-Eintrag entstanden
   - ✅ Fehler-Test: ungültige Notizen (`notes` zu kurz) → Fehler-Alert, KEIN Angebot
   - ✅ PDF-Fehler-Test: falscher PDF-Endpoint → Fehler-Alert statt Workflow-Crash
4. **Edge-Cases:** leere `notes`, riesige `notes`, fehlende `deadline`, `budgetHint` weit unter Angebot (→ Budget-Warnung muss kommen)

---

## Schritt 10: Aktivierung + Monitoring

### 10.1 Scharf schalten
1. Letzte Prüfung: Vendor-Daten korrekt? Katalog-Preise aktuell? `sendMode` bewusst gewählt?
2. Workflow auf "Active"
3. Erste echte Angebote weiter im `internal_review` durchlaufen lassen, Mensch gibt frei

### 10.2 n8n-Settings
- Execution-Log-Retention: 30 Tage
- Sensitive-Field-Masking: `notes`, `html`, `clientEmail`

### 10.3 Laufendes Monitoring
- Anthropic-Spending-Cap nicht erreicht? (Dashboard)
- PDF-Provider-Quota/Fehlerrate?
- Fehler-Alerts im Postfach beachten
- Stichprobe: 1 von 10 Angeboten gegen Notizen prüfen (Qualitäts-Drift erkennen)

### 10.4 Umstellung auf `direct_client`
Erst wenn über ~20 Angebote die Struktur + Pricing konstant korrekt waren. Dann bewusst pro Kunde/Segment umschalten — nie pauschal "weil's bisher klappte".

---

## Troubleshooting

### LLM liefert kein gültiges JSON / leere lineItems
- Code-Node hat Fallback (Workshop-Position) → Angebot bricht nie ab, aber `dataGaps` in Review-Mail beachten
- Prompt zu vage? Discovery-Notizen mit mehr Substanz liefern
- Modell upgraden (Sonnet statt Haiku)

### Preise falsch
- `serviceCatalog`-Preise prüfen (Pricing kommt NUR von dort, nicht vom LLM)
- `pricingRules` prüfen (Rabatt-/Zuschlag-Schwellen, `vatRate`)
- `budgetHint`/`deadline` als Zahl/Datum gesendet? (sonst kein Express/Budget-Check)

### PDF-Fehler (Node geht in Error-Output)
- 401: PDF-Credential falsch → Provider-Doku zum Auth-Header prüfen (PDFShift nutzt Basic-Auth)
- 422/400: Body-Felder passen nicht zum Provider → `source` vs. `html` vs. multipart (Gotenberg)
- Timeout: große HTML → Timeout im Node erhöhen (aktuell 30s)

### Angebot landet im Spam (auch interne Review)
- Vendor-Domain SPF/DKIM/DMARC fehlt → setzen, mit mail-tester.com prüfen

### CRM-Write schlägt fehl (Error-Output)
- Spalten-Namen in CRM müssen zum JSON-Body passen
- Token/Permission prüfen

### Angebot geht an Kunden obwohl noch nicht gewollt
- `sendMode` steht auf `direct_client` → auf `internal_review` zurück

---

## Wartung

| Intervall | Task |
|---|---|
| Wöchentlich | Stichprobe Angebots-Qualität (1/10), Fehler-Alerts reviewen |
| Monatlich | Katalog-Preise aktualisieren, Anthropic-Spending-Review, Pricing-Regeln prüfen |
| Quartalsweise | Tokens rotieren (Anthropic/PDF/CRM/SMTP), Vendor-DPAs prüfen, DNS (SPF/DKIM/DMARC) checken |
| Halbjährlich | Workflow-Update vom AEVUM-Repo ziehen (neue Features/Mitigations) |

---

## Done-for-You-Variante

Wenn dir Katalog-Modellierung + PDF-Provider + Prompt-Kalibrierung zu viel ist: AEVUM macht das komplett.

**DFY-Scope:**
- n8n-Setup + Import + Credentials
- Katalog + Pricing-Regeln gemeinsam modelliert
- Gotenberg self-host (kein PDF-Drittland) ODER DPA-EU-Provider
- CRM-Log in Supabase-EU
- Webhook-Token-Auth + Cloudflare-Rate-Limit
- Prompt-Kalibrierung an 5-10 echten Discovery-Beispielen + Review erster Angebote
- Test-Run + Sign-Off im Customer-Portal

→ Buchung über [aevum-system.de/shop](https://aevum-system.de/shop) (DFY-Variante wählen)
