# Content-Factory — Install-Guide

**Blueprint:** content-factory
**Setup-Dauer:** 30–60 Min
**Schwierigkeit:** Mittel (n8n-Grundkenntnisse hilfreich)
**Letzter Update:** 2026-05-25

---

## Vorab-Check

### Tools die du brauchst

| Tool | Pflicht | Zweck | Kosten |
|---|---|---|---|
| n8n (Cloud EU oder Self-Host) | ✅ | Workflow-Engine | €0–20/Mo |
| OpenRouter-Account | ✅ | LLM-Zugang | Pay-per-Use, ~€2–15/Mo bei täglichem Run |
| Notion-Workspace + Integration-Token | ✅ | Content-DB | €0 (Free-Plan reicht) |
| Telegram-Bot ODER Slack-Webhook | ⚠️ | Draft-Alert | €0 |
| Eigene Brand-Voice-Beispiele (3-5 Posts) | ⚠️ | System-Prompt-Customization | — |

### Token & Secrets sammeln

```
# OpenRouter
OPENROUTER_API_KEY=<aus openrouter.ai → Keys>
OPENROUTER_MODEL=openai/gpt-4o   # oder anthropic/claude-sonnet-4.6

# Notion
NOTION_INTEGRATION_TOKEN=<aus notion.so/my-integrations>
NOTION_DATABASE_ID=<32-stelliger Hash aus DB-URL>

# Telegram (optional)
TELEGRAM_BOT_TOKEN=<von @BotFather>
TELEGRAM_CHAT_ID=<deine Chat-ID via @userinfobot>

# ODER Slack
SLACK_WEBHOOK_URL=<aus slack.com/apps → Incoming Webhooks>
```

**Empfehlung:** Alle Tokens in einem Passwort-Manager (1Password / Bitwarden), NICHT im Klartext irgendwo speichern.

---

## Kosten-Schätzung OpenRouter

| Modell | Kosten pro Run | Bei täglich 1 Run | Bei 5 Runs/Tag |
|---|---|---|---|
| `openai/gpt-4o` | ~€0.005 | ~€0.15/Mo | ~€0.75/Mo |
| `openai/gpt-4o-mini` | ~€0.001 | ~€0.03/Mo | ~€0.15/Mo |
| `anthropic/claude-sonnet-4.6` | ~€0.008 | ~€0.24/Mo | ~€1.20/Mo |
| `anthropic/claude-haiku-4.6` | ~€0.002 | ~€0.06/Mo | ~€0.30/Mo |

**Empfehlung Startphase:** `gpt-4o-mini` für Test, dann auf `gpt-4o` oder `claude-sonnet-4.6` wechseln wenn Quality stimmt.

---

## Schritt 1: n8n-Setup

### Option A: n8n Cloud (empfohlen für Start)

1. Account auf [n8n.cloud](https://n8n.cloud) erstellen
2. **EU-Region wählen** (Pflicht für DSGVO)
3. Workspace-URL notieren: `https://<dein-workspace>.app.n8n.cloud`

### Option B: Self-Host (für mehrere Workflows / Datenschutz-Need)

```bash
# Hetzner CX22 (€4/Mo) Standort Falkenstein/Nürnberg
ssh root@your-vps
docker run -d --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=<strong-pw> \
  -e GENERIC_TIMEZONE=Europe/Berlin \
  -e WEBHOOK_URL=https://n8n.deine-domain.com \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Dann Cloudflare-Tunnel oder nginx davor + TLS via Let's Encrypt.

**Pflicht:** Timezone auf `Europe/Berlin` setzen — sonst läuft der Cron um 08:00 UTC statt 08:00 Berlin-Zeit.

---

## Schritt 2: OpenRouter-Setup

1. Account auf [openrouter.ai](https://openrouter.ai) erstellen
2. **Credits aufladen:** €10 reichen für ~1.000–5.000 Runs je nach Modell
3. **Spend-Limits setzen (Pflicht):**
   - Settings → Spending Limits
   - Daily-Limit: €5
   - Monthly-Limit: €50
   - E-Mail-Alert bei 80% Schwelle aktivieren
4. **API-Key generieren:** Settings → Keys → "Create Key" → Name: `content-factory`
5. Key kopieren (wird nur 1× angezeigt!)
6. **Modell-Wahl:** Default im Workflow ist `openai/gpt-4o`. Bei OpenRouter-Browse die ID des gewünschten Modells suchen, im Workflow-JSON in allen 3 HTTP-Nodes ersetzen.

**Privacy:** In Settings → "Privacy Mode" prüfen ob "Don't share my prompts" aktiv ist (falls verfügbar je Modell).

---

## Schritt 3: Notion-DB-Setup

### Datenbank anlegen

1. In Notion: Neue Seite → "Database" → "Table"
2. Name: "Content-Factory Drafts"
3. Spalten exakt so anlegen (Reihenfolge egal, Namen Case-sensitive):

| Spalte | Typ | Optionen |
|---|---|---|
| `Titel` | Title | — |
| `Status` | Select | Optionen: `Draft`, `Freigegeben`, `Veröffentlicht`, `Verworfen` |
| `Plattform` | Multi-Select | Optionen: `Instagram`, `LinkedIn` |
| `Hook` | Text | — |
| `Caption` | Text | — |
| `Hashtags` | Text | — |
| `Erstellt am` | Date | — |

### Integration verbinden

1. Notion → Settings → "My Connections" → "Develop or manage integrations"
2. "New Integration" → Name: `content-factory` → Workspace wählen → Submit
3. Integration-Token kopieren (`secret_...`)
4. **Wichtig:** Zur Content-Factory-DB zurück → "..."-Menü → "Connections" → `content-factory` hinzufügen

### Database-ID extrahieren

URL der DB: `https://www.notion.so/<workspace>/<DATABASE_ID>?v=...`

Den 32-stelligen Hash zwischen letztem `/` und `?v=` kopieren.

---

## Schritt 4: Workflow importieren

1. n8n öffnen → "Workflows" → "+" → "Import from File"
2. `workflow.json` aus diesem Blueprint-Folder hochladen
3. Workflow benennen: "AEVUM Content-Factory"
4. **NICHT aktivieren** bevor Schritt 5–8 fertig sind

---

## Schritt 5: Credentials anlegen

In n8n → Settings → Credentials → "+ Add Credential":

### OpenRouter (HTTP Header Auth)
- Name: `OpenRouter API`
- Header Name: `Authorization`
- Header Value: `Bearer <DEIN_OPENROUTER_KEY>` (Bearer + Leerzeichen + Key!)

### Notion
- Type: "Notion API"
- Integration Token: `secret_...` aus Schritt 3

### Telegram (optional)
- Type: "Telegram API"
- Access Token: `<DEIN_BOT_TOKEN>`

In den Workflow-Nodes dann nur Credential-Referenz wählen — NIE Tokens direkt im Body!

---

## Schritt 6: Topic-Queue befüllen

1. **Set: Topic Queue** Node öffnen
2. `topics`-Array editieren — **14 Themen Vorlauf** ist die Empfehlung (2 Wochen)
3. Themen-Auswahl-Tipps:

**Was funktioniert (Erfahrung):**
- Provokante Thesen ("Warum X scheitert")
- Konkrete Zahlen ("5 Automatisierungen die 10h sparen")
- Lessons-Learned ohne Buzzwords
- Common-Misconceptions ("Was niemand sagt über X")

**Was eher floppt:**
- Generische "How-To"-Titel ohne Spitze
- Reine Tool-Empfehlungen ohne Story
- Wiederholungen aus Branchen-Mainstream

**Topic-Queue-Hygiene (Pflicht, siehe DSGVO/Security):**
- KEINE Kunden-Namen
- KEINE konkreten Umsatzzahlen aus Projekten
- KEINE internen Codenamen
- Generische Formulierungen: "Wie wir einen Kunden 10h/Wo sparen" NICHT "Wie wir Müller GmbH 10h/Wo sparen"

4. **Topic-Rotations-Logik:** Default ist `new Date().getDay() % topics.length` → rotiert basierend auf Wochentag. Bei mehr als 7 Themen alternativen Index nutzen (siehe Wartungs-Sektion).

---

## Schritt 7: Notion-Node konfigurieren

1. **Notion: Create Page** Node öffnen
2. Database-ID einfügen (aus Schritt 3)
3. Mapping prüfen:
   - `Titel` ← `{{ $json.topic }}`
   - `Status` ← `Draft` (statisch)
   - `Plattform` ← `[{{ $json.platform }}]`
   - `Hook` ← `{{ $json.hook }}` (Spalte ggf. ergänzen im Workflow falls nicht im aktuellen JSON)
   - `Caption` ← `{{ $json.caption }}`
   - `Hashtags` ← `{{ $json.hashtags }}`
   - `Erstellt am` ← `{{ new Date().toISOString() }}`

---

## Schritt 8: Telegram/Slack-Alert konfigurieren

### Telegram

1. **Telegram: Notify** Node öffnen
2. Chat-ID einfügen (deine eigene, ermitteln via @userinfobot in Telegram)
3. Message-Template prüfen — sollte enthalten:
   - Thema
   - Plattform
   - Hook (komplett)
   - Caption-Vorschau (erste 200 Zeichen)
   - Link zur Notion-Seite

### Slack (Alternative)

1. Telegram-Node deaktivieren / löschen
2. Slack-Node hinzufügen ("Slack" → "Send Message")
3. Webhook-URL aus Slack-App-Settings einfügen
4. Channel: `#content-drafts` (vorher anlegen)
5. Message-Template ähnlich Telegram

---

## Schritt 9: Cron-Schedule prüfen

1. **Schedule Trigger** Node öffnen
2. Cron-Expression: `0 8 * * *` = täglich 08:00
3. Timezone des n8n-Servers checken (n8n Settings → "Timezone": `Europe/Berlin`)
4. Anpassungen je nach Use-Case:
   - Werktäglich: `0 8 * * 1-5`
   - 3× pro Woche: `0 8 * * 1,3,5`
   - 2× täglich: `0 8,16 * * *`

---

## Schritt 10: Test-Run

**Vor Aktivierung manuell testen:**

1. Im Workflow oben rechts: "Execute Workflow"
2. Schritt für Schritt durchgehen:
   - **Set: Topic Queue** → Topic-String sichtbar?
   - **HTTP: Generate Hook** → Response enthält `choices[0].message.content`?
   - **Set: Extract Hook** → Hook lesbar (1-2 Sätze)?
   - **HTTP: Write Caption** → Caption 300-600 Zeichen?
   - **IF: Quality Check** → Branch grün (>100 Zeichen)?
   - **HTTP: Build Hashtags** → 10-15 Hashtags?
   - **Notion: Create Page** → Page in DB sichtbar?
   - **Telegram: Notify** → Nachricht angekommen?

**Qualitäts-Sanity-Check Output:**
- Hook nicht generisch ("Hier sind 5 Tipps...")
- Caption hat klare Struktur (Hook → Substanz → CTA)
- Hashtags nicht alle "#marketing #business" — Mix aus großen/mittleren/Nischen

---

## Schritt 11: Aktivieren + Monitoring

1. Toggle oben rechts auf "Active"
2. **n8n-Execution-Log** → Retention auf 30 Tage setzen (Settings → Workflow History)
3. **Tägliches Monitoring (1 Min):**
   - Notion: Ist neuer Draft da? Quality OK?
   - Telegram-Alert kam an?
4. **Wöchentliches Monitoring (5 Min):**
   - Execution-Log: Success vs Failed Rate
   - OpenRouter-Dashboard: Cost-Trend
   - Notion: wie viele Drafts wurden tatsächlich freigegeben? (Hit-Rate)

---

## Troubleshooting

### KI-Output-Quality schlecht (zu generisch, leere Floskeln)

**Ursache:** System-Prompt zu generisch, Modell zu klein, oder Topic zu vage.

**Fixes:**
1. Modell wechseln: `gpt-4o-mini` → `gpt-4o` oder `claude-sonnet-4.6`
2. System-Prompt mit Brand-Voice-Beispielen erweitern:
   ```
   Beispiel-Posts in meiner Voice:
   "[Post 1]"
   "[Post 2]"
   Schreibe im gleichen Stil.
   ```
3. Topics spitzer formulieren (statt "Marketing-Tipps" → "Warum 80% der Agenturen nach 2 Jahren scheitern")
4. `temperature` runtersetzen (0.5–0.7 für konsistenter, 0.8–1.0 für variabler)

### Notion-Permission-Fehler (401/403)

**Ursache:** Integration nicht zur DB connected.

**Fix:**
1. Notion → DB öffnen → "..." (oben rechts) → "Connections"
2. `content-factory`-Integration auswählen → "Confirm"
3. Test-Run erneut

### OpenRouter-Rate-Limit / 429

**Ursache:** Zu viele Calls in kurzer Zeit (selten bei diesem Workflow), oder Spend-Limit erreicht.

**Fix:**
1. OpenRouter-Dashboard → Usage prüfen (Daily/Monthly-Limit?)
2. Credits aufladen wenn aufgebraucht
3. Bei Rate-Limit: niedrigeres Modell oder weniger frequente Schedule

### Caption immer unter 100 Zeichen → Error-Branch

**Ursache:** OpenRouter-Response leer oder Falsche JSON-Pfad-Extraktion.

**Fix:**
1. HTTP-Response inspecten (Execute Workflow → Node-Output)
2. JSON-Pfad prüfen: `{{ $json.choices[0].message.content }}` — bei manchen Modellen anders
3. `max_tokens` im JSON-Body checken (sollte 600 sein für Caption)

### Topic-Queue erschöpft / wiederholt sich

**Ursache:** Standard-Rotation `getDay() % length` zyklisch über 7 Tage.

**Fix:** Bessere Rotation mit Tagesindex über Monat hinweg:
```javascript
Math.floor(Date.now() / 86400000) % topics.length
```

Oder Index in Notion-DB tracken und im Workflow ausgelesen + inkrementiert.

### Workflow läuft, aber zur falschen Zeit

**Ursache:** n8n-Timezone nicht gesetzt.

**Fix:** Self-Host: `-e GENERIC_TIMEZONE=Europe/Berlin`. Cloud: Settings → Workspace Settings → Timezone.

---

## Wartung

| Intervall | Task |
|---|---|
| Täglich | 1 Min: Draft-Review + Personalisierung + Publish-Entscheidung |
| Wöchentlich | 5 Min: Execution-Log Fehler scannen, Hit-Rate (freigegeben/total) tracken |
| Monatlich | 30 Min: Topic-Queue auffüllen (14 neue Themen), OpenRouter-Cost-Review, Hit-Rate-Analyse → Prompt-Refinement falls Quality drops |
| Quartalsweise | 60 Min: Voice-Audit (haben sich Posts verflacht?), Modell-Update prüfen, Vendor-DPAs Check |

---

## Done-for-You-Variante

Wenn dir das zu viel Setup ist: AEVUM macht das komplett für dich (~4h Setup, Brand-Voice-Workshop, 30 Themen-Initial-Queue, Test-Run, 30 Tage Support).

→ Buchung über [aevum-system.de/shop](https://aevum-system.de/shop) (DFY-Variante wählen)
