# Lead-Enrichment — Install-Guide

**Blueprint:** lead-enrichment
**Setup-Dauer:** 45–75 Min
**Schwierigkeit:** Mittel (API-Anbindung + ICP-Definition nötig, kein DNS/Domain-Setup)
**Letzter Update:** 2026-05-30

---

## Vorab-Check

### Tools die du brauchst

| Tool | Pflicht | Zweck | Kosten |
|---|---|---|---|
| n8n (Cloud-EU oder Self-Host) | ✅ | Workflow-Engine | €0–20/Mo |
| Firmendaten-API (TheCompaniesAPI / Abstract / PeopleDataLabs) | ✅ | Firmografie-Anreicherung | Pay-per-Lookup (~€0,01-0,10/Lead) |
| Socials/Domain-Intel-API | ⚠️ empfohlen | LinkedIn/Socials | optional, ähnliche Größenordnung |
| Anthropic API-Key | ✅ | KI-ICP-Scoring (Claude) | ~€0,003-0,01/Lead |
| CRM / Airtable / Google Sheets | ✅ | Ziel-Sink für angereicherte Leads | €0–20/Mo |
| SMTP / Mail-Provider | ✅ | Hot-Lead- + Fehler-Alerts | €0 |
| Cloudflare (Webhook-Schutz) | ⚠️ empfohlen | Rate-Limit / DDoS | €0 (Free) |

### Token & Secrets (vorher sammeln!)

```
# n8n
N8N_WEBHOOK_BASE_URL=https://<workspace>.app.n8n.cloud
N8N_WEBHOOK_TOKEN=<32-char random — Webhook-Absicherung, empfohlen>

# Firmendaten-API
COMPANY_ENRICH_API_KEY=<aus Provider-Dashboard>
COMPANY_ENRICH_URL=<API Base-URL, z.B. https://api.thecompaniesapi.com/v2/companies>

# Socials-API
SOCIALS_API_KEY=<aus Provider-Dashboard>
SOCIALS_URL=<Endpoint>

# Anthropic
ANTHROPIC_API_KEY=<aus console.anthropic.com>
ANTHROPIC_USAGE_LIMIT=50  # EUR/Monat, hart setzen!

# CRM-Sink (Beispiel Airtable)
CRM_SINK_API_KEY=<z.B. Airtable PAT>
CRM_SINK_URL=https://api.airtable.com/v0/<BASE_ID>/leads_enriched

# Mail (Alerts)
SMTP_HOST=<z.B. smtp.resend.com>
SMTP_USER=<...>
SMTP_PASS=<...>
NOTIFY_EMAIL=sales@deinefirma.de
FROM_EMAIL=enrichment@deinefirma.de
```

**Empfehlung:** Alle Tokens in Passwort-Manager (1Password / Bitwarden), NICHT im Klartext im Repo.

---

## Schritt 1: n8n-Setup

### Option A: n8n Cloud (empfohlen für Start)
1. Account auf [n8n.cloud](https://n8n.cloud) erstellen
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

1. n8n öffnen → "Workflows" → "+" → "Import from File"
2. `workflow.json` aus diesem Blueprint-Folder hochladen
3. Workflow benennen: "AEVUM Lead-Enrichment"
4. **NICHT aktivieren** bevor Schritte 3-9 fertig sind!

Du siehst 15 Nodes von Webhook (links) bis zu den Alert-Mails (rechts), inkl. Fehler-Pfad.

---

## Schritt 3: Enrichment-API-Credentials anlegen

### 3.1 Firmendaten-API wählen + Account

- **TheCompaniesAPI** (gute DACH-Abdeckung), **Abstract Company API**, **PeopleDataLabs** o.ä.
- Account erstellen, Spending-/Rate-Cap setzen (Hard-Stop gegen Kosten-Explosion)
- API-Key generieren, API-Doc für Endpoint + Query-Param (`domain`) notieren

### 3.2 In n8n: Credential "Company-Enrich API"
1. Settings → Credentials → New → **Header Auth**
2. Name: `Company-Enrich API`
3. Header-Name: meist `Authorization`, Header-Value: `Bearer <COMPANY_ENRICH_API_KEY>` (provider-spezifisch — manche nutzen `x-api-key`)
4. Im Node **„HTTP: Firmendaten anreichern"** dieses Credential referenzieren

### 3.3 Socials-API (optional, empfohlen)
- Analog: Account + Key + Credential `Socials-Intel API`
- Im Node **„HTTP: Socials & Domain-Intel"** referenzieren
- Wenn du keine Socials-API hast: Node deaktivieren ODER auf dieselbe Firmendaten-API zeigen lassen (Merge funktioniert trotzdem, Socials-Felder bleiben dann leer)

---

## Schritt 4: Anthropic-Credential + Modell

1. API-Key auf [console.anthropic.com](https://console.anthropic.com) erstellen
2. **Usage-Limit setzen** (Workspace → Limits → hart auf z.B. €50/Mo)
3. In n8n: Credentials → New → **Anthropic API** → Key eintragen
4. Im Node **„Anthropic Chat Model"** das Credential referenzieren
5. Modell-Wahl (im Node):
   - **Empfohlen:** `claude-3-5-sonnet-20241022` (gute Qualität, günstig genug)
   - **Budget:** `claude-3-5-haiku-...` (schneller/günstiger, weniger nuanciert)
6. `temperature` bleibt bei 0.2 (deterministisches Scoring), `maxTokensToSample` bei 600

---

## Schritt 5: CRM-Sink-Credential + Schema

### 5.1 Ziel-Tabelle anlegen (Beispiel Airtable)
Tabelle `leads_enriched` mit Spalten:
`name`, `company`, `domain`, `email`, `icpScore` (Number), `tier` (Single-Select A/B/C/D), `industry`, `employees`, `linkedin`, `isHotLead` (Checkbox), `scoredAt` (Date).

### 5.2 Credential "CRM-Sink API"
- Header Auth mit deinem CRM-Token (Airtable PAT / HubSpot-Token / …)
- Im Node **„HTTP: In CRM/Sheet schreiben"** referenzieren
- **Wichtig:** Den `jsonBody` im Node ggf. an dein CRM-Schema anpassen (Feldnamen). Default ist Airtable-`fields`-Format.

### 5.3 Dedup (empfohlen)
Default-Flow macht KEIN Dedup. In Airtable/HubSpot Upsert auf `domain` einrichten, damit derselbe Lead nicht doppelt landet.

---

## Schritt 6: SMTP-Credential für Alerts

1. Credential `SMTP` anlegen (Host/Port/User/Pass deines Mail-Providers, TLS)
2. Beide Email-Nodes (**„Email: Hot-Lead-Alert"**, **„Email: Fehler-Alert"**) referenzieren das `SMTP`-Credential
3. Absender muss zur SMTP-Domain passen (sonst Reject)

---

## Schritt 7: Set-Node „Enrichment-Konfiguration" ausfüllen

Öffne den Set-Node und ersetze ALLE `{{INDIVIDUELL: ...}}`-Werte:

| Feld | Wert |
|---|---|
| `companyEnrichUrl` | API-Endpoint der Firmendaten-API |
| `socialsLookupUrl` | Endpoint der Socials-API |
| `icpDefinition` | Dein ICP in 3-5 Sätzen — siehe Beispiel unten |
| `scoreThreshold` | Hot-Lead-Schwelle (Default 70) |
| `notifyEmail` | Sales-Postfach für Hot-Lead-Alerts |
| `fromEmail` | Absender für interne Alerts |
| `crmSinkUrl` | CRM/Sheet-Endpoint |

**ICP-Beispiel (anpassen!):**
```
B2B-SaaS oder Tech-Dienstleister in DACH, 20-200 Mitarbeiter,
Jahresumsatz 2-50 Mio EUR, Entscheider in Marketing/Sales/Geschäftsführung.
Disqualifiziert: Freelancer, Agenturen unter 5 MA, Konzerne über 1000 MA,
Privatpersonen, Branchen außerhalb B2B-Software/Dienstleistung.
```
Je schärfer das ICP, desto besser der Score. Vage ICP = vager Score.

---

## Schritt 8: Test-Run mit 3 Test-Leads

**Vor Aktivierung: per `curl` Test-Leads an den Webhook schicken.**

### 8.1 Webhook-URL holen
Node **„Webhook: Roh-Lead Intake"** öffnen → Test-URL kopieren (im Test-Mode `.../webhook-test/lead-enrichment-intake`).

### 8.2 Test-Leads senden
```bash
# Test 1: gültiger Lead (sollte angereichert + gescort werden)
curl -X POST "$N8N_WEBHOOK_BASE_URL/webhook-test/lead-enrichment-intake" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tom Berger","company":"Acme GmbH","domain":"stripe.com","email":"tom@stripe.com","source":"test"}'

# Test 2: Domain aus E-Mail ableitbar, keine domain mitgegeben
curl -X POST "$N8N_WEBHOOK_BASE_URL/webhook-test/lead-enrichment-intake" \
  -H "Content-Type: application/json" \
  -d '{"name":"Anna Schmidt","company":"Beispiel AG","email":"anna@notion.so","source":"test"}'

# Test 3: ungültig (Freemail) → muss in Fehler-Pfad
curl -X POST "$N8N_WEBHOOK_BASE_URL/webhook-test/lead-enrichment-intake" \
  -H "Content-Type: application/json" \
  -d '{"name":"Max Privat","company":"","email":"max@gmail.com","source":"test"}'
```

### 8.3 Test-Verifikation
- ✅ Test 1+2: Firmendaten + Socials werden gezogen (HTTP-Nodes grün)
- ✅ Merge + Profil-Node liefern flaches `enrichment`-Objekt
- ✅ Anthropic-Node liefert JSON, Score-Parser produziert `icpScore`/`tier`/`isHotLead`
- ✅ CRM bekommt einen neuen Eintrag mit allen Feldern
- ✅ Bei Score ≥ Threshold: Hot-Lead-Alert-Mail kommt an
- ✅ Test 3 (Freemail): landet im Fehler-Pfad → Fehler-Alert-Mail mit `validationReason: freemail_domain`
- ✅ Score-Parser crasht NICHT bei leerer API-Antwort (Tier-D-Fallback)

**Tipp:** Wenn eine Enrichment-API mal 404/leer liefert, läuft der Flow dank `onError: continueRegularOutput` trotzdem weiter — Profil hat dann Lücken, Claude scort konservativ und benennt `dataGaps`.

---

## Schritt 9: Webhook absichern (Pflicht vor Live)

**Offener Webhook = Kosten-DDoS** (jeder Fake-Lead kostet 2 API-Calls + 1 LLM-Call).

**Option A — Header-Token am Webhook:**
- Webhook-Node → Authentication → "Header Auth" → Credential mit erwartetem Token
- Lead-Quelle muss den Header mitsenden

**Option B — Cloudflare-Rate-Limit:**
- n8n hinter Cloudflare, Rate-Limit-Rule auf den Webhook-Pfad (z.B. 60/min/IP)

Mindestens eine der beiden Optionen ist Pflicht.

---

## Schritt 10: Aktivierung + Monitoring

### 10.1 Scharf schalten
1. Letzte Prüfung Set-Node (alle `{{INDIVIDUELL}}` ersetzt?)
2. Webhook-URL aus dem **Production-Mode** holen (`.../webhook/lead-enrichment-intake` — unterscheidet sich von Test-URL!)
3. Diese URL in deine Lead-Quelle eintragen (Formular / Zapier / CRM-Trigger)
4. Workflow auf "Active" schalten

### 10.2 n8n-Settings
- Execution-Log-Retention: 14-30 Tage
- Sensitive-Field-Masking für `email`, Profil-Felder

### 10.3 Tägliches Monitoring (3 Min)
- API-Verbrauch im Rahmen? (Provider-Dashboards, Anthropic-Usage)
- Execution-Failures im n8n-Log?
- Fehler-Alert-Mails eingegangen? (CRM-Write-Probleme)

### 10.4 Wöchentliches Review
- Score-Kalibrierung: 10 zufällige Scores gegen Realität prüfen — passt das Tier?
- ICP-Definition nachschärfen wenn systematisch daneben
- Threshold anpassen (zu viele/zu wenige Hot-Leads?)
- API-Kosten/Lead im Blick

---

## Troubleshooting

### Enrichment-Node liefert 401/403
- API-Key falsch oder Header-Format provider-abweichend (`Bearer` vs `x-api-key`)
- Credential im richtigen Node referenziert?

### Enrichment-Node liefert leer / 404
- Domain unbekannt beim Provider (kleine DACH-Firma) — normal, Flow läuft weiter, `dataGaps` füllt sich
- Query-Param-Name stimmt nicht mit Provider-API überein → im Node anpassen

### Anthropic-Node Fehler
- 401: Key falsch/revoked
- 429: Usage-Limit erreicht → Limit prüfen oder Volumen drosseln
- Leeres Scoring: `maxTokensToSample` erhöhen (600 → 900)

### Score immer 0 / Tier D
- LLM-Output nicht als JSON geparst → Anthropic-Node-Output prüfen, ggf. Modell wechseln
- ICP-Definition leer/zu vage → Set-Node prüfen
- Enrichment liefert nichts → Score korrekt konservativ; Provider-Abdeckung prüfen

### CRM-Write schlägt fehl
- Schema-Mismatch: `jsonBody` im CRM-Node an deine Feldnamen anpassen
- Fehler landet automatisch im Fehler-Alert (by design) — Lead nicht verloren, manuell nacharbeiten

### Hot-Lead-Alert kommt nicht
- Score unter Threshold? (Set-Node `scoreThreshold` prüfen)
- SMTP-Credential / Absender-Domain falsch
- IF-Node "Hot-Lead": nur der true-Zweig löst Mail aus

### Webhook reagiert nicht
- Production-URL vs Test-URL verwechselt
- Workflow aktiv?
- Self-Host: n8n öffentlich erreichbar (nicht localhost)?

---

## Wartung

| Intervall | Task |
|---|---|
| Täglich | API-Verbrauch + Execution-Failures + Fehler-Alerts prüfen |
| Wöchentlich | Score-Kalibrierung (10 Stichproben), Threshold/ICP nachjustieren |
| Monatlich | API-Kosten-Review, Cold/disqualifizierte Leads >90d löschen, Vendor-DPAs prüfen |
| Quartalsweise | Tokens rotieren (alle 4 API-Keys), Provider-Datenqualität neu bewerten |
| Halbjährlich | Workflow-Update vom AEVUM-Repo ziehen (neue Security-/Mitigation-Features) |

---

## Done-for-You-Variante

Wenn dir Provider-Auswahl, ICP-Kalibrierung und CRM-Mapping zu viel sind: AEVUM macht das komplett.

**DFY-Scope:**
- Provider-Auswahl (DACH-tauglich) + API-Anbindung + Spending-Caps
- ICP-Prompt-Engineering + Few-Shot mit deinen Best-Kunden
- CRM-Schema-Mapping + Upsert-Dedup
- Webhook-Absicherung (Token + Cloudflare-Rate-Limit)
- Batch-Throttle-Erweiterung (SplitInBatches + Wait) für Massen-Imports
- Test mit 50 echten Leads + Score-Kalibrierung
- DPA-Checkliste + Datenschutzerklärungs-Bausteine
- Log-Masking + Retention-Konfiguration

→ Buchung über [aevum-system.de/shop](https://aevum-system.de/shop) (DFY-Variante wählen)
