# Install Guide: newsletter-growth-machine

**Zielgruppe:** Technisch affine Nutzer mit Basis-n8n-Erfahrung
**Geschätzte Setup-Zeit:** 45–90 Minuten (inkl. Test-Run)
**n8n-Version:** Getestet ab 1.30.0

---

## Vorab-Check: Alle Tools und Tokens bereit?

| Tool / Credential | Zweck im Workflow | Wo besorgen | Pflicht |
|---|---|---|---|
| n8n Instanz (Self-Hosted oder Cloud Pro+) | Workflow-Runtime, Webhook-Wait-Node | [n8n.io](https://n8n.io) — Cloud: mind. "Pro"-Plan wegen Wait-Webhook | Ja |
| OpenRouter API Key | LLM-Generierung (Themen, Outline, Draft) | [openrouter.ai](https://openrouter.ai) → Keys → Create Key; Budget min. 10 EUR | Ja |
| Beehiiv API Key + Publication ID | Newsletter-Draft pushen | Beehiiv Dashboard → Settings → API | Ja (oder Mailchimp) |
| Resend API Key (oder SMTP) | Review-Mail an Operator | [resend.com](https://resend.com) → API Keys → Create; Free Tier reicht | Ja |
| Eigene Domain verifiziert in Resend/SMTP | Sender-Reputation | Resend: Domains → Add → DNS-Records setzen | Empfohlen |

**Token-Specs:**
- OpenRouter Key: Format `sk-or-v1-[64 Hex-Chars]`
- Beehiiv API Key: Format `Bearer [Token]` — aus Settings → API → Generate New Key
- Beehiiv Publication ID: Format `pub_[alphanumeric]` — aus URL: `app.beehiiv.com/publications/pub_XXXXX`
- Resend API Key: Format `re_[alphanumeric]`

**n8n-Plan-Check:**
```
n8n Free (Cloud): Wait-Webhook nur begrenzt supported → NICHT ausreichend
n8n Pro (Cloud): Wait-Webhook unterstützt → OK
n8n Self-Hosted: Alle Features verfügbar → OK (empfohlen für DSGVO)
```

---

## Schritt 1: n8n-Instanz vorbereiten

**1a. Self-Hosted (empfohlen):**
```bash
# Docker-Compose Minimal-Setup
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=SICHERES_PASSWORT
      - EXECUTIONS_DATA_MAX_AGE=7
      - EXECUTIONS_DATA_PRUNE=true
      - N8N_HOST=your-domain.com
      - WEBHOOK_URL=https://your-domain.com/
    volumes:
      - n8n_data:/home/node/.n8n
```

**1b. n8n Cloud:**
- Account unter n8n.io erstellen, Pro-Plan aktivieren
- Settings → Region: EU (Frankfurt) auswählen
- Settings → Executions: Save Data = "Error only" oder "None"

---

## Schritt 2: Credentials in n8n anlegen

Credentials **immer** über n8n Credential Manager anlegen — niemals als Plaintext in Nodes.

**Credential 1: OpenRouter**
```
Credentials → New → HTTP Header Auth
Name: OpenRouter API
Header Name: Authorization
Header Value: Bearer sk-or-v1-DEIN_KEY
```

**Credential 2: Beehiiv API**
```
Credentials → New → HTTP Header Auth
Name: Beehiiv API
Header Name: Authorization
Header Value: Bearer DEIN_BEEHIIV_KEY
```

**Credential 3: Resend (Mail)**
```
Credentials → New → HTTP Header Auth (wenn HTTP-Node verwendet)
Name: Resend API
Header Name: Authorization
Header Value: Bearer re_DEIN_RESEND_KEY

-- ODER --

Credentials → New → SMTP
Host: smtp.resend.com
Port: 587
User: resend
Password: re_DEIN_RESEND_KEY
SSL/TLS: STARTTLS
```

---

## Schritt 3: Workflow importieren

1. In n8n: **Workflows → New → Import from File**
2. `workflow.json` (aus Blueprint-Package) auswählen
3. Import bestätigen
4. Workflow öffnet sich mit 11 Nodes
5. Prüfen: Alle Nodes sichtbar, keine roten Fehler-Icons
6. Workflow noch **nicht aktivieren** — erst nach vollständiger Konfiguration

---

## Schritt 4: Set: Konfiguration Node befüllen

Node öffnen → Folgende Felder anpassen:

| Feld | Beispielwert | Hinweis |
|---|---|---|
| `reviewEmail` | `du@deinedomain.com` | Deine E-Mail für den Draft |
| `beehiivPublicationId` | `pub_abc123def456` | Aus Beehiiv URL kopieren |
| `newsletterTopic` | `B2B SaaS Marketing für Startups` | Deine Nische, spezifisch |
| `targetAudience` | `Marketing-Leads in B2B-SaaS-Unternehmen, 20–200 MA` | Kein PII, generische Beschreibung |
| `toneOfVoice` | `Direkt, praxisorientiert, keine Buzzwords` | Wie du schreiben würdest |
| `newsletterWordCount` | `1000` | Zielwert zwischen 800–1.200 |

---

## Schritt 5: HTTP-Nodes mit Credentials verknüpfen

Jeden der drei HTTP-Nodes öffnen und Credential zuweisen:

```
Node "HTTP: Themen-Ideen":
→ Authentication: Predefined Credential Type = HTTP Header Auth
→ Credential: OpenRouter API (aus Schritt 2)

Node "HTTP: Outline bauen":
→ Gleiche Einstellung

Node "HTTP: Full Draft schreiben":
→ Gleiche Einstellung

Node "HTTP: Beehiiv Push":
→ Authentication: Predefined Credential Type = HTTP Header Auth
→ Credential: Beehiiv API (aus Schritt 2)
```

---

## Schritt 6: Email-Node konfigurieren

**Wenn SMTP:**
```
Node "Email: Draft zur Review"
→ Credential: SMTP (aus Schritt 2)
→ From: newsletter-bot@deinedomain.com
→ To: {{ $vars.reviewEmail }} (oder direkt hardcoded)
→ Subject: Newsletter Draft KW{{ $now.weekNumber }} — Bitte freigeben
```

**Wenn Resend via HTTP:**
```
Node durch HTTP Request Node ersetzen:
URL: https://api.resend.com/emails
Method: POST
Authentication: HTTP Header Auth → Resend API
Body (JSON):
{
  "from": "Newsletter Bot <bot@deinedomain.com>",
  "to": ["{{ $json.reviewEmail }}"],
  "subject": "Newsletter Draft zur Freigabe",
  "html": "{{ $json.emailBody }}"
}
```

---

## Schritt 7: Approval-Webhook absichern und URL notieren

1. Node **"Wait for Webhook: Approval"** öffnen
2. Webhook-URL kopieren (Format: `https://your-n8n.com/webhook-waiting/[UUID]`)
3. Timeout prüfen: Standard = 1 Woche; anpassen nach Bedarf
4. Security-Token in Review-Mail-Template einbauen:

```
URL in Mail-Body:
https://your-n8n.com/webhook-waiting/[UUID]?token=DEIN_SECRET_TOKEN&approved=true

Im IF-Node nach Wait (neu anlegen):
Condition: {{ $json.query.token }} equals DEIN_SECRET_TOKEN
→ true: Weiter
→ false: Execution stoppen
```

Token generieren:
```bash
openssl rand -hex 16
```

---

## Schritt 8: Cron-Schedule prüfen

Node **"Schedule: Mittwoch 09:00"** öffnen:
```
Trigger: Cron
Cron Expression: 0 9 * * 3
(= Jeden Mittwoch um 09:00 Uhr Serverzeit)

WICHTIG: Serverzeit-Zone prüfen!
n8n Self-Hosted: TZ=Europe/Berlin in Docker-Compose setzen
n8n Cloud: Timezone in Schedule-Node auf Europe/Berlin setzen
```

---

## Schritt 9: Test-Run (3 Szenarien)

**Szenario A: Vollständiger Happy Path**
1. Workflow manuell starten (Execute Workflow Button)
2. Prüfen: Execution-Log zeigt grüne Nodes bis "Email: Draft zur Review"
3. Prüfen: Review-Mail landet in Inbox (max. 2 Minuten warten)
4. Approval-Link klicken
5. Prüfen: Beehiiv-Dashboard → Posts → Draft erscheint
6. Ergebnis: ✅ Alle 11 Nodes grün

**Szenario B: Timeout-Test**
1. Workflow starten
2. Review-Mail öffnen, Approval-Link NICHT klicken
3. Warten bis Timeout (für Test: im Wait-Node temporär auf 2 Minuten reduzieren)
4. Prüfen: Execution läuft ab, kein Beehiiv-Push, keine Fehlermeldung
5. Ergebnis: ✅ Kein ungewollter Versand

**Szenario C: Fehlerhafter API Key (Negative Test)**
1. OpenRouter-Credential temporär mit falschem Key befüllen
2. Workflow starten
3. Prüfen: Node "HTTP: Themen-Ideen" zeigt roten Fehler mit 401-Status
4. Prüfen: Kein weiterer Node wird ausgeführt
5. Credential reparieren
6. Ergebnis: ✅ Fehler-Handling funktioniert, kein Silent Fail

---

## Schritt 10: Aktivierung und Monitoring

**Aktivierung:**
```
Workflow-Toggle oben rechts: OFF → ON
Status-Badge: "Active" (grün)
Nächster Run: Kommenden Mittwoch 09:00
```

**Monitoring-Setup (empfohlen):**
```
n8n Settings → Workflow Settings → Error Workflow:
→ Separaten Error-Notification-Workflow anlegen
→ Bei Fehler: Mail an dich mit Execution-ID + Error-Message

Minimaler Error-Workflow:
Trigger: n8n Error Trigger
→ HTTP: Resend-Mail mit {{ $json.execution.error.message }}
```

**Wöchentliche Checks:**
- Mittwoch 09:30: Review-Mail angekommen?
- Mittwoch bis Donnerstag: Draft freigeben oder Skip notieren
- Monatlich: Execution-Logs prüfen, API-Kosten kontrollieren (OpenRouter Dashboard)

---

## Troubleshooting

### Problem 1: Review-Mail kommt nicht an

```
Diagnose:
1. n8n Execution-Log → Node "Email: Draft zur Review" → Output prüfen
2. Status 200? → Mail wurde gesendet, Spam-Ordner prüfen
3. Status 4xx/5xx? → SMTP-Credential prüfen

Fix SMTP:
→ n8n → Credentials → SMTP → Test Connection
→ Port 587 statt 465 probieren
→ SMTP-Provider: Google Workspace braucht App-Passwort, nicht Account-Passwort

Fix Resend:
→ Domain-Verifizierung in Resend Dashboard prüfen (DNS-Records gesetzt?)
→ API Key aktiv und nicht expired?
```

### Problem 2: Beehiiv Push schlägt fehl (401/403)

```
Diagnose:
→ Execution-Log → Node "HTTP: Beehiiv Push" → Error-Body lesen

401 = API Key ungültig oder abgelaufen
→ Beehiiv: Settings → API → Neuen Key generieren → In n8n Credential aktualisieren

403 = Falscher Scope oder falsche Publication ID
→ Publication ID aus URL nochmal kopieren (pub_XXXXX exakt)
→ API Key Permissions prüfen

404 = Endpoint-URL veraltet
→ Beehiiv API-Dokumentation prüfen: aktuelle Version v2
→ Endpoint: https://api.beehiiv.com/v2/publications/{pub_id}/posts
```

### Problem 3: OpenRouter antwortet mit leerem Content

```
Symptom: Set: Thema extrahieren zeigt leeren String
Diagnose:
→ HTTP: Themen-Ideen → Output → Response Body prüfen
→ Ist choices[0].message.content vorhanden?

Häufige Ursachen:
1. Modell-Name falsch geschrieben (Case-sensitiv)
   Fix: openrouter.ai/models → korrekten Model-Slug kopieren
   
2. Budget aufgebraucht
   Fix: OpenRouter Dashboard → Billing → Guthaben prüfen
   
3. Content-Filter des Modells hat geblockt
   Fix: Prompt auf aggressive Sprache prüfen; anderes Modell testen
```

### Problem 4: Wait-Node verliert State nach n8n-Restart

```
Symptom: Nach n8n-Neustart ist Approval-Link tot
Ursache: n8n Cloud Outage oder Self-Hosted Neustart während Wait

Verhalten: Execution ist "Unknown"-Status
Fix: Workflow neu starten, neuen Draft generieren

Prevention (Self-Hosted):
→ Docker volume für n8n_data persistent mounten (nicht tmpfs)
→ Kein Container-Neustart während laufender Executions (Maintenance-Window Dienstag Nacht)
```

### Problem 5: KI-Output nicht auf Deutsch / falscher Stil

```
Symptom: Draft auf Englisch oder generisch
Fix im Prompt (Node "HTTP: Full Draft schreiben"):
System-Prompt ergänzen:
"Schreibe ausschließlich auf Deutsch. 
Dein Schreibstil: [TON aus Konfiguration].
Vermeide folgende Phrasen: [LISTE].
Nutze folgende Struktur: Hook (2-3 Sätze), ..."

Qualitäts-Tipp: Erst 3 Ausgaben manuell editieren, dann 
diese Edits als "Gutes Beispiel"-Section in den System-Prompt aufnehmen.
```

---

## Wartungs-Schedule

| Aufgabe | Frequenz | Aufwand |
|---|---|---|
| API-Keys rotieren (OpenRouter, Beehiiv, Resend) | Alle 90 Tage | 10 Min |
| OpenRouter-Budget prüfen | Monatlich | 2 Min |
| n8n auf neue Version updaten (Self-Hosted) | Monatlich | 15 Min (Docker pull) |
| Execution-Logs auf Fehler reviewen | Wöchentlich | 5 Min |
| Beehiiv API-Dokumentation auf Breaking Changes prüfen | Quartalsweise | 15 Min |
| Modell-Performance evaluieren (Draft-Qualität) | Quartalsweise | 30 Min |
| Prompts anpassen (Saisonale Themen, neue Nischen-Insights) | Nach Bedarf | 20 Min |

---

## DFY-Alternative: AEVUM übernimmt Setup

Wenn Setup-Zeit, Credential-Management oder Troubleshooting nicht selbst handelbar:

**DFY S umfasst:**
- Alle obigen Schritte durch AEVUM
- Test-Run mit allen 3 Szenarien dokumentiert
- Security-Härtung (Webhook-Token, Execution-Retention)
- 30 Tage Support-Chat für Troubleshooting
- Übergabe-Call (45 Min): wie Review-Prozess funktioniert, wie Prompts angepasst werden

**Nächster Schritt:** [calendly-link oder Kontaktformular]