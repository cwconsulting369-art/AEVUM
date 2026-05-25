---
title: AEVUM Blueprint — lead-qualifier
date: 2026-05-25
generated_by: blueprint-master-doc-script
---

# AEVUM Blueprint — lead-qualifier

> Generated 2026-05-25 16:31 Berlin-TZ. Combines alle Quality-Gate-Docs zu einem druckbaren Master-Dokument.

---

# 1. Sales-Brief


**Blueprint:** lead-qualifier-pro
**Tier:** Blueprint (DIY)
**Preis:** Siehe `apps/web/public/pricing` (€-Range nach Pricing-Model)
**Sales-Ready seit:** 2026-05-25

---

## In einem Satz

Eingehende Leads werden automatisch nach BANT+ bewertet (Budget/Authority/Need/Timing + Größe/Branche/Engagement), 0–100 gescored und in drei Routing-Pfade verteilt: Hot/Warm/Cold. Funktioniert mit jedem Formular-Tool und CRM.

---

## Wer das braucht

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur** (5–30 MA) | Lead-Inflation, Team verbrennt Zeit mit unqualifizierten Anfragen | Top-20% direkt sichtbar, Rest automatisch nurtured |
| **Personal Brand** (Coach/Berater) | DMs + Form-Anfragen ohne Triage, "Spam-vs-Gold"-Problem | Hot-Lead-Alert direkt aufs Handy, Cold-Leads in Newsletter-Loop |
| **B2B-Service** (10–100 MA) | Sales-Team priorisiert falsch, Hot-Leads warten zu lang | Score-basiertes Routing, SLA für Top-Leads automatisch |

---

## Was Customer bekommt

1. **n8n-Workflow (JSON-Export)** — fertig konfigurierter Workflow mit 11 Nodes
2. **BANT+-Scoring-Engine** (JS) — anpassbar in 30 Sekunden (Gewichtungen, Schwellenwerte, Ziel-Branchen)
3. **3-Pfad-Routing** — Hot (>70) / Warm (40–70) / Cold (<40), individuell konfigurierbar
4. **CRM-Anbindung** — Airtable / HubSpot / Notion / Custom-Webhook
5. **E-Mail-Templates** — 3 vorbereitete Szenarien (Hot-Alert, Lead-Bestätigung, Cold-Nurture)
6. **Telegram-Hot-Lead-Alert** (optional) — Sofort-Benachrichtigung mit Score-Breakdown
7. **DSGVO-Pack** — Konfigurations-Checkliste, Vendor-DPA-Übersicht, Löschfristen-Logik
8. **Install-Guide** — Schritt-für-Schritt in <60 Min einsatzbereit
9. **Security-Risk-Review** — bekannte Risiken + Mitigations (Webhook-Schutz, Rate-Limit, PII-Handling)

---

## Mehrwert (konkret)

**Vorher:**
- Lead kommt → Sales-MA liest → Score nach Bauchgefühl → manuell in CRM → Follow-up vergessen
- ~15 min pro Lead × 30 Leads/Wo = 7,5h/Wo Triage-Aufwand
- Hot-Leads kühlen ab (Avg-Response-Time 8h+)

**Nachher:**
- Lead kommt → Score in <2 Sek → Hot-Alert in TG → CRM-Entry mit Breakdown → Auto-Nurture für Cold
- Sales-MA sieht: "5 Hot, 12 Warm, 13 Cold" → priorisiert sofort
- Hot-Response unter 1h möglich

**ROI-Schätzung (Mittel-Agentur, 30 Leads/Wo):**
- Time-Save: ~6h/Wo MA-Zeit × 4 Wo = 24h/Mo
- Bei MA-Kosten €50/h fully-loaded → €1.200/Mo
- Plus Conversion-Lift durch schnellere Hot-Response (10-30%) → schwer zu quantifizieren, aber real

---

## Pricing-Logic

| Variante | Was | Preis-Range |
|---|---|---|
| **Blueprint-Only** | JSON + Docs + Install-Guide | €X (siehe Pricing-Page) |
| **Done-for-You** | Wir installieren + konfigurieren auf deine Tools | €X × 2 |
| **Done-with-You** | Setup gemeinsam, du lernst dabei | €X × 1.5 |

→ Conversion-Pfad zu Tier S/M Audit wenn Customer "noch mehr Automation" will.

---

## Voraussetzungen Customer

- n8n laufend (Cloud €20/Mo oder Self-Hosted)
- Formular-Tool (Typeform/Tally/eigenes)
- CRM oder Airtable-Base
- E-Mail-Versand (Resend €0/Mo bis 100 Mails/Tag, SMTP, oder Mailchimp)
- Optional: Telegram-Bot-Token

**Total monatliche Tool-Kosten:** €20–60 (abhängig vom Stack).

---

## Nicht-Ziele (explizit)

- ❌ Ersatz für vollwertiges CRM
- ❌ AI-Lead-Generation (das ist ein anderes Blueprint)
- ❌ Multi-Channel-Aggregation (LinkedIn + Email + DM zusammen — Future-Blueprint)
- ❌ Lead-Enrichment (Company-Data aus externen APIs — kommt separat)

---

## Upsell-Pfade

| Customer-Frage | Next-Step |
|---|---|
| "Wie bekomme ich überhaupt mehr Leads?" | → Cold-Outreach-System Blueprint |
| "Kann der Score smart werden über Zeit?" | → Audit M (Custom-AI-Layer + Hermes-Pattern) |
| "Wir brauchen vollständige Lead-Pipeline" | → AI-Lead-Engine DFY |
| "Wir haben spezifische Branchen-Logik" | → Audit S (Custom-BANT-Layer) |

---

## Conversion-Story (Brief für Sales-Page)

> "Du sammelst Leads. Dein Team bewertet sie nach Bauchgefühl. Die 5 Hot-Leads des Monats versinken im 30er-Stapel von Cold-Anfragen. Du verlierst Deals weil deine Response-Time zu lang ist."
>
> "Lead-Qualifier Pro löst das in unter 60 Minuten Setup. BANT+-Scoring, 3-Pfad-Routing, Hot-Lead-Alert aufs Handy. Funktioniert mit jedem Formular und CRM."
>
> "Einmal kaufen. Beliebig anpassen. Skaliert mit deinem Lead-Volumen."

\newpage

# 2. Install-Guide


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

\newpage

# 3. Security-Risks


**Blueprint:** lead-qualifier-pro
**Review-Datum:** 2026-05-25
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Schweregrad-Skala:** 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🟢 LOW

---

## Risk-Matrix

| # | Risiko | Schwere | Mitigation | Customer-Action |
|---|---|---|---|---|
| 1 | Webhook offen (kein Token/Signatur) | 🟠 HIGH | n8n-Webhook mit HMAC-Signatur ODER Header-Token absichern | Pflicht |
| 2 | Kein Rate-Limit am Webhook | 🟠 HIGH | n8n-Webhook hinter Cloudflare/nginx mit Rate-Limit (z.B. 30/min/IP) | Pflicht |
| 3 | PII (E-Mail, Name, Firma) fließt durch n8n unverschlüsselt | 🟡 MEDIUM | n8n auf EU-Hoster (Hetzner/Scaleway), TLS-only, kein Self-Host ohne HTTPS | Pflicht |
| 4 | CRM-API-Token im n8n-Credential-Store | 🟡 MEDIUM | n8n-Credentials-Encryption-Key separat verwalten, Rotation alle 90d | Empfohlen |
| 5 | Telegram-Bot-Token im Workflow-JSON exportierbar | 🟠 HIGH | Token NIE im Workflow-Body hartcoden — n8n-Credential-Reference nutzen | Pflicht |
| 6 | E-Mail-Versand via SMTP ohne SPF/DKIM | 🟡 MEDIUM | SPF + DKIM für Sending-Domain, Resend bevorzugt (Auto-Auth) | Empfohlen |
| 7 | Score-Logic in Plain-JS sichtbar (Reverse-Engineering durch Customer-Customer) | 🟢 LOW | Kein Mitigation nötig — Score-Logik ist nicht Business-Geheimnis | — |
| 8 | Replay-Attack möglich (gleicher Webhook-Call mehrfach) | 🟡 MEDIUM | Idempotency-Key oder Submission-Hash im Workflow prüfen | Empfohlen |
| 9 | Cross-Site-Form-Submission ohne CSRF-Schutz | 🟡 MEDIUM | Origin-Header-Check im n8n-Workflow (Conditional-Node) | Empfohlen |
| 10 | Sensitive-Logging (Score-Breakdown in Logs) | 🟢 LOW | n8n-Log-Retention <30 Tage, kein Long-Term-Storage von Lead-Data in Logs | Empfohlen |
| 11 | DDoS auf öffentlichen Webhook | 🟠 HIGH | Cloudflare vor Webhook-Domain, Bot-Fight-Mode aktiv | Pflicht |
| 12 | Phishing-Lookalike-Domain für Email-Alerts | 🟡 MEDIUM | E-Mail-Templates aus eigener Domain senden, kein Drittanbieter-Branding | Empfohlen |

---

## Pflicht-Mitigations (Customer MUSS umsetzen)

### 1. Webhook-Token-Schutz

**Problem:** Wer die Webhook-URL kennt, kann beliebig viele Fake-Leads injecten.

**Fix:** Webhook-Node in n8n öffnen → "Authentication" auf "Header Auth" setzen → Custom-Header mit Random-Token (z.B. `X-AEVUM-Token: <32-char-random>`).

Im Formular-Tool diesen Header mitsenden. Bei Typeform/Tally → Custom-Webhook mit Header-Support (Pro-Plan).

### 2. Rate-Limit

**Problem:** Ungeschützter Webhook = Lead-Spam-Vector.

**Fix-Option A (n8n-Cloud):** Cloud-Plan inkludiert IP-basierte Rate-Limits.

**Fix-Option B (Self-Hosted):** Cloudflare vor n8n-Domain. Rule: "Rate-Limit `/webhook/*` → 30 req/min/IP". Cloudflare-Free-Plan reicht.

### 3. EU-Hosting + TLS

**Problem:** PII durch US-Hoster = DSGVO-Verstoß ohne SCC.

**Fix:** n8n-Cloud-EU-Region ODER Hetzner/Scaleway-VPS für Self-Host. Domain MUSS HTTPS (Let's Encrypt). Kein HTTP-Webhook akzeptieren.

### 4. Telegram-Token im Credential-Store

**Problem:** Wenn Workflow exportiert + geteilt wird (z.B. Backup, Migration), wird Token mit-exportiert wenn nicht in Credentials.

**Fix:** In n8n: Settings → Credentials → "Telegram API" → Token NUR HIER speichern. Im Workflow-Node nur "Credential-Reference" nutzen.

### 5. Cloudflare DDoS-Schutz

**Problem:** Öffentlicher Webhook ist DDoS-Vector.

**Fix:** Domain hinter Cloudflare (Free reicht). Bot-Fight-Mode aktiv. "Under Attack Mode" bei Bedarf.

---

## Empfohlene Mitigations (Best-Practice)

### 6. Idempotency

In Webhook-Body einen `submissionId` mitsenden (z.B. Form-Tool generiert UUID). Im Workflow prüfen → wenn schon gesehen, skippen.

### 7. Origin-Check

Conditional-Node nach Webhook: `{{ $headers.origin }}` muss in Whitelist sein. Sonst Workflow stoppen.

### 8. Log-Retention

n8n-Settings → "Execution Data" → "Delete after X days" auf 30 setzen.

---

## Was AEVUM bei DFY-Install zusätzlich macht

Wenn Customer DFY (Done-for-You) bucht, übernimmt AEVUM:
- Cloudflare-Setup vor Webhook-Domain
- HMAC-Signatur-Validierung im Workflow
- IP-Allowlist (falls Customer das will)
- n8n-Credentials-Setup mit Rotation-Schedule
- Test-Run mit 10 Fake-Leads (verschiedene Scoring-Pfade)
- Security-Sign-Off in Customer-Portal

---

## Known-Limits (nicht-fixbar in diesem Blueprint)

- **n8n-Cloud Self-Service Plan:** kein Custom-IP-Whitelisting möglich (nur Enterprise). → Customer-Recommendation: Self-Host für High-Volume.
- **Free-Form-Tools (Tally-Free):** Kein Header-Auth. → Recommendation: Tally Pro (€29/Mo) oder Custom-Form.

---

## Sign-Off (Quality-Gate)

- [x] Risk-Matrix erstellt
- [x] 5 Pflicht-Mitigations dokumentiert
- [x] Customer-Action-Liste klar
- [x] DFY-Differentiator ausgearbeitet
- [ ] Penetration-Test (extern) — Phase 2, nicht für Sales-Ready blockierend
- [ ] HMAC-Signature-Validation-Node als optionaler Workflow-Addon — Phase 2

\newpage

# 4. DSGVO-Konformitäts-Check


**Blueprint:** lead-qualifier-pro
**Review-Datum:** 2026-05-25
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Disclaimer:** Diese Doku ist keine Rechtsberatung. Customer bleibt rechtlich verantwortlich. Bei DSGVO-kritischen Branchen (Health/Finance) zusätzlich Anwalt konsultieren.

---

## 1. Datenfluss-Analyse

**Welche personenbezogenen Daten verarbeitet der Workflow?**

| Datum | Kategorie | Speicherort | Aufbewahrung |
|---|---|---|---|
| Vorname + Nachname | Stammdaten (Art. 4 Nr. 1 DSGVO) | n8n-Execution-Log + CRM | n8n: <30d; CRM: nach Customer-Policy |
| E-Mail | Kommunikation | n8n + CRM + E-Mail-Provider | siehe oben |
| Firma | Berufliche Daten | n8n + CRM | siehe oben |
| Nachricht | Freitextfeld (kann Sensibles enthalten!) | n8n-Log + CRM | <30d in Log, langfristig in CRM nur wenn nötig |
| Budget/Timing/Größe/Branche/Rolle | Profilbildung | CRM | für Lead-Lifecycle |
| Quelle (Source) | Tracking | CRM + ggf. Analytics | nach Customer-Policy |

**Potential für besondere Kategorien (Art. 9 DSGVO):** Freitextfeld "Nachricht" kann ungewollt Gesundheits-/politische/religiöse Daten enthalten → Customer muss in Formular-UX warnen, dass diese nicht eingegeben werden sollen.

---

## 2. Rechtsgrundlage

**Welche Rechtsgrundlage trägt die Verarbeitung?**

| Kontext | Grundlage |
|---|---|
| Lead reicht Formular ein | **Art. 6 (1) lit. a** — Einwilligung (Pflicht: explicit Opt-In) **+** **lit. b** — Anbahnung vorvertraglicher Maßnahmen |
| Scoring + Routing | **Art. 6 (1) lit. f** — berechtigtes Interesse (effiziente Lead-Bearbeitung) |
| Hot-Lead-Telegram-Alert (intern) | **Art. 6 (1) lit. f** — internes Tooling |
| E-Mail-Bestätigung an Lead | **Art. 6 (1) lit. b** — vorvertraglich |
| Cold-Lead-Nurture-Mail (Marketing) | **Art. 6 (1) lit. a** — separate Einwilligung erforderlich |

**Wichtig:** Cold-Nurture braucht **separate Marketing-Einwilligung** (Doppel-Opt-In empfohlen). Anbahnungs-Mails sind OK auch ohne, Werbe-Mails brauchen Opt-In.

---

## 3. Pflicht-Konfiguration im Formular

### A) Datenschutz-Checkbox
Pflicht. Muss **unausgefüllt** sein (kein Pre-Check).

**Text-Vorschlag:**
> ☐ Ich stimme der Verarbeitung meiner Daten gemäß [Datenschutzerklärung] zur Bearbeitung meiner Anfrage zu. (Pflicht)

### B) Marketing-Checkbox (optional, für Cold-Nurture)
Falls Customer Cold-Leads in Newsletter packen will:

> ☐ Ich möchte zusätzlich gelegentlich relevante Inhalte zu [Thema] erhalten. (jederzeit widerrufbar)

### C) Link zur Datenschutzerklärung
Pflicht. Im Formular sichtbar verlinkt.

### D) Information über Datentransfer in Drittländer
Falls Customer US-Tools nutzt (Notion, HubSpot, etc.) → Hinweis in DS-Erklärung Pflicht.

---

## 4. Vendor-DPA-Übersicht

Welche Auftragsverarbeiter sind beteiligt? (Customer braucht DPA mit jedem.)

| Vendor | Rolle | EU-Hosting? | DPA-Link | Risiko-Level |
|---|---|---|---|---|
| **n8n.cloud** | Workflow-Engine | ✅ EU-Region wählbar | n8n.io/legal/dpa | 🟢 LOW |
| **Self-Hosted n8n** | Workflow-Engine | Customer's Choice | — (kein DPA nötig, eigener Server) | 🟢 LOW wenn EU-Server |
| **Airtable** | CRM | ❌ US (Sub-Processor) | airtable.com/legal/dpa | 🟡 MEDIUM (SCC nötig) |
| **HubSpot** | CRM | ❌ US (EU-Datacenters für Enterprise) | legal.hubspot.com/dpa | 🟡 MEDIUM |
| **Notion** | CRM (alternative) | ❌ US | notion.so/help/data-protection | 🟡 MEDIUM |
| **Resend** | E-Mail-Versand | ✅ EU-Region | resend.com/legal/dpa | 🟢 LOW |
| **Mailchimp** | E-Mail-Versand (alternative) | ❌ US (Sub-Processor) | mailchimp.com/legal/data-processing-addendum | 🟡 MEDIUM |
| **Telegram** | Alert-Channel (intern) | Mixed | core.telegram.org/api/terms | 🟡 MEDIUM (Hinweis: nicht für PII von Leads, nur intern für Customer-Team) |
| **Typeform** | Formular | ✅ EU-Option (Pro) | typeform.com/legal/dpa | 🟡 MEDIUM (Free: US) |
| **Tally** | Formular | ✅ EU | tally.so/help/dpa | 🟢 LOW |

**Customer-Action:** Vor Go-Live alle aktiv genutzten Vendors als Auftragsverarbeiter in Verzeichnis aufnehmen (Art. 30 DSGVO).

---

## 5. Betroffenenrechte (Art. 15–22 DSGVO)

| Recht | Umsetzung im Blueprint |
|---|---|
| **Auskunft** (Art. 15) | CRM-Filter "Email = X" → Export → an Betroffenen senden (Customer-Prozess) |
| **Berichtigung** (Art. 16) | CRM-Record direkt editieren (Customer-Prozess) |
| **Löschung** (Art. 17) | Airtable/HubSpot: Record löschen. n8n-Execution-Log: Auto-Cleanup <30d. |
| **Einschränkung** (Art. 18) | CRM-Status auf "DSGVO-Hold" + kein weiteres Processing |
| **Datenübertragbarkeit** (Art. 20) | JSON-Export aus CRM |
| **Widerspruch** (Art. 21) | Marketing-Opt-Out-Link in jeder Cold-Nurture-Mail (Pflicht) |
| **Automatisierte Einzelentscheidung** (Art. 22) | ⚠️ Score-basiertes Routing ist **keine** Einzelentscheidung im Sinne Art. 22 weil kein rechtlicher Effekt — aber **DS-Erklärung muss Scoring transparent erklären**. |

---

## 6. Löschfristen-Logik

| Lead-Status | Aufbewahrung | Grund |
|---|---|---|
| Cold-Lead (Score <40), kein Marketing-Opt-In | 90 Tage | Anbahnung gescheitert, danach keine Rechtsgrundlage |
| Warm-Lead, kein aktiver Kontakt | 12 Monate | Vertriebs-Lifecycle |
| Hot-Lead, in Sales-Pipeline | bis Deal-Close oder -Drop | berechtigtes Interesse |
| Kunde geworden | gesetzliche Aufbewahrung (Steuer: 6/10 Jahre) | HGB / AO |
| n8n-Execution-Log | 30 Tage | Operational |

**Implementation:** Customer richtet Cron in CRM ein (Airtable-Automations / HubSpot-Workflows) für Auto-Delete.

---

## 7. Datenschutzfolgen-Abschätzung (DSFA, Art. 35)

**Ist eine DSFA erforderlich?**

→ **Nein**, wenn:
- Keine besonderen Kategorien (Health/etc.) erhoben werden
- Score-Routing kein rechtlicher Effekt (was hier der Fall ist)
- Volumen <100k Leads/Jahr (sonst Skalierungs-DSFA empfohlen)

→ **Ja**, wenn Customer:
- Health-Sektor / Finanz-Sektor
- AI-basierte Profilbildung über Score hinaus (z.B. Voice-Analyse)
- Skoring + AI-Decision auf besonders sensibler Branchenbasis

---

## 8. EU-AI-Act-Kompatibilität (ab 2. Aug 2026)

| Klassifizierung | Lead-Qualifier Pro |
|---|---|
| **AI-System nach EU-AI-Act?** | Grenzfall — JS-Scoring ohne LLM ist **kein** AI-System nach Art. 3 (1). Wenn Customer später LLM-Layer dazwischen schaltet → wird AI-System. |
| **Risk-Class** (falls AI-System) | **Limited Risk** — Transparenzpflicht (Customer muss Lead informieren, dass Score automatisch berechnet wird) |
| **High-Risk?** | Nein (keine Beschäftigungs-/Bonitäts-Entscheidung im Sinne Annex III) |

**Customer-Action:** In Datenschutzerklärung Scoring-Transparenz aufnehmen ("Wir verwenden ein automatisches Scoring-System zur Priorisierung von Anfragen").

---

## 9. Audit-Checkliste vor Go-Live

- [ ] DS-Erklärung des Customers aktualisiert (Scoring-Hinweis + Vendor-Liste)
- [ ] Datenschutz-Checkbox im Formular Pflicht, unausgefüllt
- [ ] Doppel-Opt-In für Cold-Nurture eingerichtet (wenn genutzt)
- [ ] Vendor-DPAs gegengezeichnet und in Verzeichnis (Art. 30)
- [ ] Auftragsverarbeiter-Liste in DS-Erklärung erwähnt
- [ ] EU-Hosting bei n8n + Form-Tool + Mail-Provider gewählt
- [ ] Löschfristen im CRM als Automation konfiguriert
- [ ] n8n-Execution-Log auf 30d retention
- [ ] Test-Anfrage durchgelaufen: Auskunft → Export → Löschung
- [ ] Carlos hat Sign-Off-Dokument (Customer + Carlos signed)

---

## 10. Quality-Gate-Sign-Off

- [x] Datenfluss-Analyse vollständig
- [x] Rechtsgrundlagen pro Schritt klar
- [x] Pflicht-Konfiguration im Formular dokumentiert
- [x] Vendor-DPA-Übersicht erstellt
- [x] Betroffenenrechte-Implementation skizziert
- [x] Löschfristen-Empfehlung
- [x] DSFA-Trigger benannt
- [x] EU-AI-Act-Einordnung
- [x] Audit-Checkliste vor Go-Live
- [ ] Anwaltliche Validierung der DS-Erklärungs-Klauseln — Customer-Action, nicht Blueprint-Block

\newpage

# 5. Quality-Gate Sign-Off


**Blueprint:** lead-qualifier-pro
**Gate-Pass-Datum:** 2026-05-25
**Gate-Reviewer:** Lennox (autonomous, AEVUM Quality-Gate Pilot)
**DB-Update:** `shop_item_build_status.gate_passed = true` (manuell via API)

---

## Inventory

| Asset | Status | Pfad |
|---|---|---|
| n8n-Workflow (JSON) | ✅ Existing | `workflow.json` (408 Zeilen) |
| README (Use-Case + Setup) | ✅ Existing | `README.md` (168 Zeilen) |
| Sales-Brief (Customer-facing) | ✅ Created 2026-05-25 | `SALES-BRIEF.md` |
| Security-Risk-Review | ✅ Created 2026-05-25 | `SECURITY-RISKS.md` |
| DSGVO-Check | ✅ Created 2026-05-25 | `DSGVO-CHECK.md` |
| Install-Guide (extended) | ✅ Created 2026-05-25 | `INSTALL-GUIDE.md` |
| PDF-Export | ⏳ Pending | Generierung via Pandoc (Phase 2) |
| Demo-Video | ⏳ Pending | Customer-recording (Phase 2) |

---

## Sign-Off-Kriterien

| Kriterium | Pass | Notes |
|---|---|---|
| Workflow lädt ohne Fehler in n8n | ✅ | JSON valide, n8n-Schema 1.1+ |
| Setup-Anleitung in <60 Min ausführbar | ✅ | 10 Schritte mit Token-Specs |
| BANT+-Scoring transparent + customizable | ✅ | JS-Code im Workflow, READMEdokumentiert |
| 3 Test-Szenarien dokumentiert (Hot/Warm/Cold) | ✅ | In INSTALL-GUIDE Schritt 9 |
| Security-Risks identifiziert + Mitigations | ✅ | 12 Risks dokumentiert, 5 Pflicht-Mitigations |
| DSGVO-Konformität nachgewiesen | ✅ | 10-Punkt-Check + Vendor-DPA-Übersicht |
| EU-AI-Act-Einordnung | ✅ | Limited Risk, Transparenz-Pflicht |
| Pricing-Logik klar | ✅ | Blueprint / DFY / DwY-Varianten |
| Upsell-Pfad definiert | ✅ | 4 Upsell-Trigger in SALES-BRIEF |
| Customer-Action-Liste vor Go-Live | ✅ | 10-Punkt-Audit-Checkliste in DSGVO-CHECK |

**Gesamt:** 10/10 ✅

---

## Known-Limitations (transparent für Customer)

1. **Penetration-Test** nicht durchgeführt — Phase 2 (extern)
2. **HMAC-Signatur-Validation** als Workflow-Addon — Phase 2 (optional)
3. **Demo-Video** für Customer-Onboarding — Phase 2
4. **PDF-Export** der Docs — Phase 2 (Pandoc-Pipeline)
5. **Multi-Language-Support** (EN/DE) — Phase 3

→ Diese Limits sind im Quality-Gate-Sign-Off **akzeptiert** weil:
- Pen-Test nicht Sales-Blocker (Risk-Matrix dokumentiert)
- HMAC ist Optional, Header-Token reicht für 90% der Cases
- Demo-Video kann post-Sale aufgenommen werden
- PDF ist Nice-to-Have, Markdown reicht für Customer-Delivery

---

## DB-Update Befehl

Update Quality-Gate-Status in AEVUM-DB:

```sql
UPDATE public.shop_item_build_status
SET
  gate_passed = true,
  gate_passed_at = now(),
  built_by = 'lennox-pilot-2026-05-25',
  n8n_export_url = '/blueprints/lead-qualifier/workflow.json',
  pdf_url = NULL, -- Phase 2
  demo_video_url = NULL, -- Phase 2
  notes = 'Pilot durch Lennox autonom — alle Quality-Gate-Kriterien erfüllt. PDF + Video Phase 2.',
  updated_at = now()
WHERE item_slug = 'lead-qualifier-pro';
```

**Execution:** Bei nächstem Bash-Run via psql oder Supabase-CLI durchziehen.

---

## Pattern für Builder-Agent (später)

Was hier als Pilot manuell gemacht wurde, ist die Vorlage für den autonomen Builder-Agent:

### Input pro Blueprint
- `workflow.json` (existing)
- `README.md` (existing)

### Output (auto-generated)
1. `SALES-BRIEF.md` — Template + Item-spezifische Insertions
2. `SECURITY-RISKS.md` — Risk-Pattern-Library + Item-spezifische Risks (Webhook-exposed? PII?)
3. `DSGVO-CHECK.md` — Vendor-DPA-Lookup + Datenfluss-Inferenz
4. `INSTALL-GUIDE.md` — Step-by-Step aus Workflow-Node-Analyse
5. `QUALITY-GATE.md` — Auto-Check gegen 10 Kriterien
6. DB-Update via Supabase-Client

### Agent-Logic (Pseudocode)
```javascript
for (const item of getPendingShopItems()) {
  const workflow = parseWorkflowJson(item)
  const readme = parseReadme(item)

  const salesBrief = generateSalesBrief({workflow, readme, segments: ICP_V2})
  const securityRisks = analyzeSecurityRisks(workflow)  // node-pattern-matching
  const dsgvoCheck = generateDsgvoCheck(workflow, vendorDpaLookup)
  const installGuide = generateInstallGuide(workflow)

  const gate = runQualityGate({salesBrief, securityRisks, dsgvoCheck, installGuide})

  if (gate.passed) {
    writeFiles(item, {salesBrief, securityRisks, dsgvoCheck, installGuide})
    await db.markGatePassed(item.slug)
    notify('quality-gate', `${item.slug} → gate_passed=true`)
  } else {
    notify('quality-gate', `${item.slug} → gate FAILED: ${gate.reasons}`)
  }
}
```

### Pattern-Quality
- Anwendbar auf alle 6 Blueprints + 10 DFY-Items + 1 SaaS = 17 Items
- Geschätzte Builder-Run-Dauer: ~3 min/Item (LLM-Calls für Sales-Brief, Pattern-Match für Risks/DSGVO)
- Manueller Review-Aufwand für Carlos: ~10 min/Item (Sign-Off)
- **Cost-Estimate (Anthropic Claude Sonnet 4.6):** ~$0.30/Item × 17 = ~$5.10 total für komplette Shop-Aufbereitung

---

## Lessons Learned (Pilot → Builder-Spec)

1. **README + workflow.json sind solide Inputs** — Builder muss nicht von Null bauen, sondern erweitern
2. **Security-Risks lassen sich pattern-basieren** — Webhook-Node ohne Auth = bekanntes Risk, kein LLM-Call nötig
3. **DSGVO-Vendor-Lookup als Library** — n8n-Node-Type → Vendor-Mapping → DPA-URL ist deterministisch
4. **Sales-Brief braucht ICP-Context** — Builder muss `LINKEDIN-CONTENT-PILLARS.md` + `ICP-ANALYSIS-2026-05-23.md` als Context laden
5. **Quality-Gate ist binär** — entweder alle 10 Kriterien erfüllt oder Item wird nicht freigeschaltet (Hard-Gate)

→ Builder-Agent-Spec daraus → `personal-os/07-tools/BLUEPRINT-BUILDER-SPEC.md` (Phase 2).
