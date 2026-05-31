# Social-Repurpose — Install-Guide

**Blueprint:** social-repurpose
**Setup-Dauer:** 45–75 Min
**Schwierigkeit:** Mittel (1 LLM-API + CMS-Feld-Mapping + Draft-Store)
**Letzter Update:** 2026-05-30

---

## Vorab-Check

### Tools die du brauchst

| Tool | Pflicht | Zweck | Kosten |
|---|---|---|---|
| n8n (Cloud-EU oder Self-Host) | ✅ | Workflow-Engine | €0–20/Mo |
| OpenRouter-Account + API-Key | ✅ | KI-Repurpose | €2–8/Mo (1 Asset/Werktag) |
| Long-Form-Quelle mit API/Feed | ✅ | Asset-Input | abhängig vom CMS |
| Draft-Store (Airtable/Notion/Supabase) | ✅ | Entwürfe ablegen + freigeben | €0–20/Mo |
| Mail-Provider (SMTP/Resend/Postmark) | ✅ | Digest + Fehler-Mail | €0–15/Mo |
| Cloudflare (nur bei Webhook-Trigger) | ⚠️ | DDoS + Rate-Limit | €0 (Free) |

### Token & Secrets (vorher sammeln!)

```
# n8n
N8N_WEBHOOK_BASE_URL=https://<workspace>.app.n8n.cloud

# OpenRouter
OPENROUTER_API_KEY=<aus openrouter.ai → Keys>
OPENROUTER_SPENDING_CAP=20   # EUR/Monat, hart einstellen!

# CMS / Quelle (Beispiel WordPress)
CMS_API_URL=https://deinblog.de/wp-json/wp/v2/posts?status=publish&per_page=1&orderby=date
CMS_READ_TOKEN=<read-only Application Password / Content-API-Key>

# Draft-Store (Beispiel Airtable)
AIRTABLE_PAT=<scoped Personal Access Token, nur die eine Table, data.records:write>
AIRTABLE_BASE_ID=<appXXXXXXXX>
DRAFT_STORE_URL=https://api.airtable.com/v0/<AIRTABLE_BASE_ID>/social_drafts

# Mail
SENDER_EMAIL=no-reply@deinefirma.de
APPROVAL_EMAIL=social@deinefirma.de
ALERT_EMAIL=ops@deinefirma.de
```

**Empfehlung:** Alle Tokens in Passwort-Manager (1Password / Bitwarden), NICHT im Klartext.

---

## Schritt 1: n8n-Setup

### Option A: n8n Cloud (empfohlen für Start)
1. Account auf [n8n.cloud](https://n8n.cloud)
2. **EU-Region wählen** (Pflicht für DSGVO)
3. Workspace-URL notieren

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
  -e EXECUTIONS_DATA_MAX_AGE=720 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```
Cloudflare-Tunnel oder nginx + Let's Encrypt davor.

---

## Schritt 2: Workflow importieren

1. n8n → „Workflows" → „+" → „Import from File"
2. `workflow.json` aus diesem Blueprint-Folder hochladen
3. Workflow benennen: „AEVUM Social-Repurpose"
4. **NICHT aktivieren** bevor Schritte 3-10 fertig sind!

---

## Schritt 3: OpenRouter-Setup

1. Account auf openrouter.ai, Credit aufladen (€5-10 Start)
2. **Spending-Cap setzen!** Dashboard → Settings → Limits → hart auf €20/Mo
3. API-Key generieren (Settings → Keys)
4. **Modell-Wahl** (im Node „HTTP: KI-Repurpose" im `jsonBody` editierbar):
   - **Empfohlen:** `anthropic/claude-3.5-sonnet` (beste Brand-Voice-Treue)
   - **Budget:** `openai/gpt-4o-mini` (~€0,002/Asset)
   - **EU-Routing:** `mistralai/mistral-large` (EU-Provider)
5. In n8n: Credentials → „Header Auth" anlegen
   - Name: `OpenRouter API`
   - Header-Name: `Authorization`
   - Header-Value: `Bearer <OPENROUTER_API_KEY>`
6. Im Node „HTTP: KI-Repurpose" Credential-Reference auf `OpenRouter API` setzen — NICHT Token im Body!

---

## Schritt 4: Quell-CMS anbinden + Credential

1. **Credential anlegen:** Credentials → „Header Auth"
   - Name: `Source-CMS API Auth`
   - WordPress: Header `Authorization`, Value `Basic <base64(user:app-password)>`
   - Ghost: per Query-Param `?key=<content-api-key>` (dann am Node Auth = None und Key in URL)
   - **Öffentliches RSS/Feed:** Auth am Node auf „None" stellen, Credential entfällt
2. Im Node „HTTP: Long-Form-Asset laden" die Credential setzen
3. Quell-URL kommt aus dem Set-Node (`sourceApiUrl`, Schritt 6)

**Feed-Beispiele:**
- WordPress: `https://blog.de/wp-json/wp/v2/posts?status=publish&per_page=1&orderby=date`
- Ghost: `https://blog.de/ghost/api/content/posts/?key=<KEY>&limit=1&order=published_at%20desc`
- Webflow CMS: `https://api.webflow.com/v2/collections/<id>/items?limit=1&sortBy=lastPublished`
- RSS → JSON: `https://api.rss2json.com/v1/api.json?rss_url=<deinfeed>`

---

## Schritt 5: Draft-Store vorbereiten

### Option A: Airtable
1. Base anlegen, Tabelle `social_drafts` mit Spalten:
   - `platform` (Single line text), `format` (Single line text), `body` (Long text), `hashtags` (Long text), `charCount` (Number), `status` (Single select: draft/needs_review/approved/rejected), `sourceTitle` (Single line), `sourceUrl` (URL), `assetHash` (Single line), `createdAt` (Date/time)
2. Scoped PAT erstellen (nur diese Table, `data.records:write`)
3. Credential in n8n: „Header Auth", Name `Draft-Store API Auth`, Header `Authorization`, Value `Bearer <AIRTABLE_PAT>`

### Option B: Supabase
1. Tabelle `social_drafts` (entsprechende Spalten) + RLS-Policy nur INSERT
2. Node-URL: `https://<ref>.supabase.co/rest/v1/social_drafts`
3. Header `apikey` + `Authorization: Bearer <service-or-scoped-key>`
4. **Achtung:** Der Default-Body im Node ist Airtable-Format (`{"fields": {...}}`). Für Supabase den `jsonBody` auf flaches Objekt umstellen (`{ "platform": ..., "body": ... }`).

### Option C: Notion
- Database mit passenden Properties anlegen, Integration teilen, Body auf Notion-`/pages`-Schema umstellen.

→ Im Node „HTTP: Draft speichern" Credential + ggf. Body-Schema anpassen.

---

## Schritt 6: Brand-Konfiguration füllen

Node „Set: Brand-Konfiguration" öffnen, alle `{{INDIVIDUELL: ...}}` ersetzen:

| Feld | Beispielwert |
|---|---|
| `brandName` | `AEVUM` / `Carlos Wrusch` |
| `brandVoice` | `Direkt, brutal-ehrlich, kein Buzzword-Bingo, technisch fundiert, auf Augenhöhe.` |
| `targetAudience` | `Agentur-Inhaber und B2B-SaaS-Gründer, 5-50 MA` |
| `ctaDefault` | `Ganzen Artikel lesen: ` |
| `platforms` | `linkedin,twitter,instagram` (Default lassen) |
| `sourceApiUrl` | URL aus Schritt 4 |
| `draftStoreUrl` | URL aus Schritt 5 |
| `approvalEmail` | `social@deinefirma.de` |
| `senderEmail` | `no-reply@deinefirma.de` |

**Brand-Voice-Tipp:** Wenn du keinen Voice-Guide hast — nimm 3 deiner besten eigenen Posts und beschreibe in 2-3 Sätzen, was sie auszeichnet. Genau das gehört in `brandVoice`.

---

## Schritt 7: Mail-Sender + Fehler-Handler konfigurieren

1. **SMTP-Credentials** in n8n (Settings → Credentials → „SMTP")
   - Resend: Host `smtp.resend.com`, Port 465, User `resend`, Password = API-Key
   - Postmark: Host `smtp.postmarkapp.com`, Port 587
2. In beiden Email-Nodes (`Email: Freigabe-Digest`, `Email: Fehler-Alert`) Credential-Reference setzen
3. **Fehler-Handler-Node** „Code: Fehler aufbereiten" öffnen — die zwei Platzhalter ersetzen:
   - `senderEmail` → dein Absender (z.B. `no-reply@deinefirma.de`)
   - `alertEmail` → wer Fehler-Alerts bekommt (z.B. `ops@deinefirma.de`)
4. Absender über **eigene Domain mit SPF/DKIM**, kein Freemail (sonst Digest im Spam → niemand gibt frei)

---

## Schritt 8: Feld-Mapping + Dedupe prüfen (KRITISCH)

### 8.1 Feld-Mapping
Node „Code: Asset bereinigen & normalisieren" öffnen. Der Code mappt generisch (`title || name || headline`, `body || content || description`). **Prüfe gegen deine echte CMS-Antwort:**

1. Test-Abruf machen (Schritt 9), reale JSON-Antwort ansehen
2. Falls deine Felder anders heißen (WordPress: `title.rendered`, `content.rendered`!), die Mapping-Zeilen anpassen:
   ```js
   const title = asset.title?.rendered || asset.title || '';
   const rawBody = asset.content?.rendered || asset.body || '';
   const url = asset.link || asset.url || '';
   ```

### 8.2 Dedupe (Pflicht bei Schedule-Polling!)
**Problem:** Der Schedule-Trigger holt täglich „das neueste Asset". Erscheint nichts Neues, wird dasselbe Asset erneut (kostenpflichtig) repurposed.

**Fix-Optionen:**
- **A (sauber):** CMS-Query mit Zeit-Filter (`published_after`/`after`) auf den letzten Lauf einschränken
- **B:** `assetHash`-Lookup im Draft-Store vor dem LLM-Call (existiert → abbrechen). Einfacher IF-Node nach „Code: bereinigen" mit HTTP-Lookup
- **C:** Statt Schedule den **Webhook-Trigger** nutzen — feuert nur beim Veröffentlichen. Dazu Webhook-Node aktivieren, Schedule deaktivieren, CMS-Publish-Hook auf die Webhook-URL zeigen lassen

---

## Schritt 9: Test-Run

1. Workflow **manuell ausführen** (Schedule-Trigger erlaubt „Execute Workflow" / oder temporär einen Manual-Trigger davorhängen)
2. **Verifikation:**
   - ✅ „HTTP: Asset laden" liefert ein Asset (kein Error-Pfad)
   - ✅ „Code: bereinigen" gibt sauberen `assetBody` aus (HTML weg, >200 Zeichen)
   - ✅ „HTTP: KI-Repurpose" liefert JSON mit `posts`-Array
   - ✅ „Code: parsen" erzeugt ≥5 Items, `overLimit`-Flags plausibel
   - ✅ Saubere Posts landen im Draft-Store (Airtable/Supabase prüfen)
   - ✅ Digest-Mail kommt an, alle Posts lesbar, Status-Flags korrekt
3. **Halluzinations-Check:** Posts gegen das Quell-Asset lesen — stimmen Zahlen/Aussagen? Keine erfundenen Fakten?
4. **Fehler-Pfad testen:** OpenRouter-Credential kurz auf falschen Key setzen → manueller Lauf → Fehler-Alert-Mail muss kommen. Danach Key zurücksetzen.

---

## Schritt 10: Aktivierung + Monitoring

### 10.1 Scharf schalten
1. Trigger prüfen: Schedule (Default werktags 08:00) ODER Webhook (dann Schedule deaktivieren)
2. Letzte Doppelprüfung Set-Node (alle Platzhalter ersetzt? Keine `{{INDIVIDUELL...}}` mehr übrig?)
3. Workflow auf „Active"

### 10.2 n8n-Settings
- Execution-Log-Retention: 30 Tage (Settings → Workflow History)
- Sensitive-Field-Masking für `assetBody`, `body`, `html`

### 10.3 Tägliches/Wöchentliches Monitoring
- Kommt der Digest wie erwartet? (täglich kurz)
- OpenRouter-Spending im Rahmen? (wöchentlich, Spending-Cap nicht erreicht)
- Hook-/Post-Qualität: 5 zufällige Posts lesen — generisch oder gut? Brand-Voice getroffen?
- n8n-Execution-Failures? Fehler-Alerts angekommen?

---

## Troubleshooting

### „Asset zu kurz" / „Kein Asset gefunden"
- Feld-Mapping im Code-Node stimmt nicht (Schritt 8.1). WordPress nutzt `title.rendered` / `content.rendered`.
- CMS-Query liefert leer → URL/Filter prüfen

### LLM-Output kein valides JSON
- `response_format: json_object` ist gesetzt, aber manche Modelle ignorieren es → stärkeres Modell (`claude-3.5-sonnet`) wählen
- Parse-Node bricht sauber ab + Fehler-Alert kommt — der Lauf produziert dann keinen Müll

### Weniger als 5 Posts
- Modell zu schwach / max_tokens zu klein → max_tokens (Default 2000) erhöhen oder Modell upgraden

### Posts „über Limit" (needs_review)
- Erwartetes Verhalten: lange Posts werden markiert, nicht abgeschnitten. Im Prompt die Längenvorgaben schärfen oder manuell kürzen

### Digest-Mail kommt nicht
- SMTP-Credential falsch / Absender im Spam → eigene Domain mit SPF/DKIM, mail-tester.com prüfen

### OpenRouter-Fehler
- 401: Key falsch/revoked → neu generieren
- 429: Rate-Limit / Spending-Cap erreicht → Cap prüfen, Modell wechseln
- 5xx: Modell down → Fallback-Modell im Body setzen

### Dasselbe Asset wird mehrfach verarbeitet
- Dedupe fehlt (Schritt 8.2) → Zeit-Filter, assetHash-Check oder Webhook-Trigger

### Webhook-Trigger reagiert nicht
- Node ist im Default `disabled` → aktivieren
- n8n öffentlich erreichbar? (nicht localhost) → Cloudflare-Tunnel/ngrok
- Production- vs. Test-URL beachten (unterscheiden sich!)

---

## Wartung

| Intervall | Task |
|---|---|
| Täglich | Digest angekommen? Fehler-Alerts? |
| Wöchentlich | Post-Qualitäts-Stichprobe (5 Posts), OpenRouter-Spending-Check |
| Monatlich | Vendor-DPAs prüfen, Draft-Store-Cleanup (verworfene Drafts), Brand-Voice-Prompt nachjustieren |
| Quartalsweise | Tokens rotieren (OpenRouter, CMS, Draft-Store), Modell-Wahl re-evaluieren |
| Halbjährlich | Workflow-Update vom AEVUM-Repo ziehen |

---

## Done-for-You-Variante

Wenn dir Feld-Mapping, Prompt-Tuning und Draft-Store-Setup zu fummelig sind: AEVUM macht das komplett.

**DFY-Scope:**
- OpenRouter + Spending-Cap + Token-Rotation
- Brand-Voice-Prompt-Engineering (3-5 Iterationen gegen deine echten Posts)
- CMS-Anbindung + verifiziertes Feld-Mapping
- Draft-Store mit scoped Token + RLS
- Dedupe-Logik eingebaut
- Optional: Approval-Gate + Buffer/Ayrshare-Auto-Post
- Test-Lauf mit 3 echten Assets + Halluzinations-Check
- Monitoring-Begleitung erste 30 Tage

→ Buchung über [aevum-system.de/shop](https://aevum-system.de/shop) (DFY-Variante wählen)
