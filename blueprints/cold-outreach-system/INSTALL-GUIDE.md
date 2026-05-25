# Cold-Outreach-System — Install-Guide

**Blueprint:** cold-outreach-system
**Setup-Dauer:** 60–90 Min (zzgl. 2-4 Wochen Domain-Warm-Up)
**Schwierigkeit:** Mittel-Hoch (DNS + Sender-Reputation-Verständnis nötig)
**Letzter Update:** 2026-05-25

---

## Vorab-Check

### Tools die du brauchst

| Tool | Pflicht | Zweck | Kosten |
|---|---|---|---|
| n8n (Cloud-EU oder Self-Host) | ✅ | Workflow-Engine | €0–20/Mo |
| OpenRouter-Account + API-Key | ✅ | KI-Hook-Personalisierung | €5–20/Mo nach Volumen |
| Eigene Sub-Domain (z.B. `kontakt.firma.de`) | ✅ | Sender-Reputation isolieren | €10/Jahr |
| Mail-Provider (Resend / Postmark / Mailgun / SMTP) | ✅ | Mail-Versand mit Auth-Records | €0–15/Mo |
| Liste-Verifier (NeverBounce / ZeroBounce / hunter.io) | ✅ | Bounce-Schutz | €0,01-0,05/Adresse |
| Kontakt-Quelle (Apollo / LinkedIn / Eigenrecherche) | ✅ | Lead-Daten | Apollo €49/Mo+ |
| Blocklist-Storage (Airtable / Supabase / n8n-Static) | ✅ | DSGVO-Opt-Out-Pflicht | €0–20/Mo |
| Cloudflare (für Opt-Out-Webhook-Schutz) | ⚠️ | DDoS + Rate-Limit | €0 (Free) |
| CRM (Airtable / HubSpot / Notion) | ❌ | Reply-Tracking | €0–20/Mo |
| mail-tester.com | ✅ | Deliverability-Score | €0 (3 Tests/Tag free) |

### Token & Secrets die du brauchst (sammeln vorher!)

```
# n8n
N8N_WEBHOOK_BASE_URL=https://<workspace>.app.n8n.cloud
N8N_OPTOUT_TOKEN=<generieren — 32-char random für Opt-Out-Webhook>

# OpenRouter
OPENROUTER_API_KEY=<aus openrouter.ai → Keys>
OPENROUTER_SPENDING_CAP=50  # EUR/Monat, hart einstellen!

# Mail-Provider (Beispiel Resend)
RESEND_API_KEY=<aus resend.com → API Keys>
SENDER_DOMAIN=kontakt.firma.de
SENDER_EMAIL=vorname.nachname@kontakt.firma.de  # echte Person, kein noreply
SENDER_NAME=Vorname Nachname
SENDER_COMPANY=Firma GmbH

# DNS bei deinem Domain-Registrar
# (kommen aus Resend/Postmark-Dashboard, müssen gesetzt werden)
SPF_RECORD=<wird im Schritt 3 generiert>
DKIM_RECORD=<wird im Schritt 3 generiert>
DMARC_RECORD=<wird im Schritt 3 generiert>

# Optional
CALENDLY_LINK=https://calendly.com/<handle>/15min
TELEGRAM_BOT_TOKEN=<von @BotFather, falls Hot-Lead-Alert bei Antwort>
```

**Empfehlung:** Alle Tokens in Passwort-Manager (1Password / Bitwarden), NICHT im Klartext.

---

## Schritt 1: n8n-Setup

### Option A: n8n Cloud (empfohlen für Start)

1. Account auf [n8n.cloud](https://n8n.cloud) erstellen
2. **EU-Region wählen** (Pflicht für DSGVO)
3. Workspace-URL notieren

### Option B: Self-Host

```bash
# Hetzner CX22 (€4/Mo), Standort Falkenstein/Nürnberg
ssh root@your-vps
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
3. Workflow benennen: "AEVUM Cold-Outreach"
4. **NICHT aktivieren** bevor Schritte 3-10 fertig sind!

---

## Schritt 3: Sender-Domain einrichten + Auth-Records (KRITISCHER SCHRITT)

**Das ist der Schritt, an dem 80% der Cold-Outreach-Setups scheitern. Sorgfältig durchgehen.**

### 3.1 Sub-Domain anlegen

- Hauptdomain: `firma.de`
- Sender-Sub-Domain: `kontakt.firma.de` (oder `outreach.firma.de`, `mail.firma.de`)
- **NIE Hauptdomain für Cold-Outreach nutzen** — sonst trifft Spam-Markierung deine Geschäfts-Mails

### 3.2 Mail-Provider-Setup (Beispiel Resend)

1. resend.com Account erstellen, EU-Region wählen
2. "Domains" → "Add Domain" → `kontakt.firma.de` eintragen
3. Resend zeigt 3 DNS-Records: SPF + DKIM (oft 2-3 CNAME-Einträge) + optional MX

### 3.3 DNS-Records setzen (bei Domain-Registrar)

Beispiel-Records (musst du durch echte aus Resend-Dashboard ersetzen):

```
# SPF (TXT-Record auf kontakt.firma.de)
v=spf1 include:spf.resend.com -all

# DKIM (CNAME-Records, von Resend generiert)
resend._domainkey.kontakt.firma.de  CNAME  resend._domainkey.resend.com

# DMARC (TXT-Record auf _dmarc.kontakt.firma.de)
v=DMARC1; p=quarantine; rua=mailto:dmarc@firma.de; pct=100
```

**DNS-Propagation:** 5 Min bis 24h. Mit `dig TXT kontakt.firma.de` prüfen.

### 3.4 Verifikation in Resend

- Im Resend-Dashboard "Verify" klicken
- Status muss "Verified" werden (kann 30 Min dauern)

### 3.5 Deliverability-Test via mail-tester.com

1. mail-tester.com öffnen → erhalte Test-Adresse (z.B. `test-xyz@srv1.mail-tester.com`)
2. Test-Mail an diese Adresse über Resend versenden (manuell oder via Workflow-Test)
3. Score abrufen → **mindestens 9/10** erforderlich
4. Bei niedrigem Score:
   - SPF/DKIM/DMARC nochmal prüfen
   - Reverse-DNS-Eintrag beim Hoster anfordern
   - Mail-Inhalt entschärfen (keine Spam-Trigger-Wörter)

---

## Schritt 4: Domain-Warm-Up-Phase (2-4 Wochen, KEIN SHORTCUT)

**Neue Domain = 0 Reputation. Sofortiges Cold-Volume = sofortige Spam-Quarantäne.**

### Warm-Up-Plan

| Woche | Mails/Tag | Empfänger | Open-Rate-Ziel |
|---|---|---|---|
| 1 | 5-10 | Eigene Accounts, Team, warme Kunden | >80% |
| 2 | 15-20 | LinkedIn-Verbindungen, Newsletter-Subscribers | >50% |
| 3 | 20-30 | Lauwarm-Kontakte mit Vorgeschichte | >40% |
| 4 | 30-50 | Erste Cold-Tests mit Top-Recherche-Adressen | >30% |
| Ab Woche 5 | Voll | Volle Cold-Outreach-Kampagne | >25% |

**Praktisch:** In Woche 1-4 normale Konversations-Mails über diese Sub-Domain schicken (auch interne Tests reichen). Wichtig: Mails werden GEÖFFNET (Tracking-Pixel ok) und teilweise BEANTWORTET.

---

## Schritt 5: OpenRouter-Setup

1. Account auf openrouter.ai erstellen
2. Credit aufladen (€10-20 Start)
3. **Spending-Cap setzen!** Dashboard → Settings → Spending Limits → hart auf €50/Mo
4. API-Key generieren (Settings → Keys)
5. **Modell-Wahl:**
   - **Empfohlen:** `anthropic/claude-3.5-sonnet` (gute Personalisierung, EU-routable)
   - **Budget:** `openai/gpt-4o-mini` (~€0,005/Hook)
   - **Premium:** `openai/gpt-4o` (~€0,02/Hook)
6. In n8n: Credentials → "Header Auth" hinzufügen
   - Name: `OpenRouter API`
   - Header-Name: `Authorization`
   - Header-Value: `Bearer <OPENROUTER_API_KEY>`
7. Im HTTP-Node "KI-Hook generieren" Credential-Reference setzen — NICHT Token direkt im Body!

---

## Schritt 6: Mail-Sender-Konfiguration in n8n

1. **SMTP-Credentials** in n8n anlegen (Settings → Credentials → "SMTP")
   - Für Resend: Host `smtp.resend.com`, Port 465, User `resend`, Password = API-Key
   - Für Postmark: Host `smtp.postmarkapp.com`, Port 587
2. In allen 3 Email-Nodes (`Email: Mail 1`, `Email: Follow-up 1`, `Email: Letzte Chance`) die Credential-Reference setzen
3. **Set-Node "Kampagnen-Konfiguration"** ausfüllen:
   - `senderName`, `senderCompany`, `senderEmail`, `offerDescription`, `optoutBaseUrl`, `calendlyLink`
4. **Mail-Footer prüfen** — Pflicht-Elemente in HTML:
   - Vollständiger Absender (Name + Firma + Anschrift)
   - Opt-Out-Link (`{{ optoutBaseUrl }}?email={{ contact.email }}`)
   - Optional: AI-Hinweis ("Diese Nachricht wurde KI-gestützt personalisiert")

---

## Schritt 7: Opt-Out-Webhook + Blocklist-Storage

### 7.1 Webhook-Node konfigurieren

1. `Webhook: Opt-out` Node öffnen
2. Webhook-URL kopieren: `https://<workspace>.app.n8n.cloud/webhook/outreach-optout`
3. Diese URL ist der Wert für `optoutBaseUrl` im Set-Node (Schritt 6)

### 7.2 Blocklist-Storage einrichten (Customer-Erweiterung — Pflicht!)

**Der Default-Workflow speichert Opt-Outs NICHT.** Customer muss erweitern:

**Option A: Airtable-Blocklist**
- Airtable-Base anlegen, Tabelle `optout_blocklist`, Spalten: `email`, `optedOutAt`, `source`
- Im Opt-Out-Webhook-Workflow nach Webhook-Node einen HTTP-Request-Node hinzufügen:
  ```
  POST https://api.airtable.com/v0/<BASE_ID>/optout_blocklist
  Header: Authorization: Bearer <AIRTABLE_KEY>
  Body: {"fields": {"email": "{{ $json.query.email }}", "optedOutAt": "{{ $now.toISO() }}", "source": "cold-outreach"}}
  ```

**Option B: Supabase / Postgres**
- Tabelle `optout_blocklist (email text primary key, opted_out_at timestamptz default now())`
- Im Workflow Postgres-Node mit INSERT ON CONFLICT DO NOTHING

**Option C: n8n-Static-Data** (für kleine Volumen)
- Im Webhook-Workflow: Function-Node der `$workflow.staticData.blocklist[email] = Date.now()` setzt
- Limit: ~1000 Einträge sauber, danach Performance-Problem

### 7.3 Blocklist-Check vor jedem Send (PFLICHT-ERWEITERUNG)

Default-Workflow prüft Blocklist NICHT — du MUSST einen IF-Node vor jeden Send-Node einbauen:

```
[Batch: 10 pro Tag]
  → [Set: Hook extrahieren]
  → [HTTP/DB: Blocklist-Lookup (email)]
  → [IF: blocklist.found === true]
      → [No-Op (skip)]
      → [HTTP: KI-Hook] → [Email: Mail 1]
```

**Ohne diese Erweiterung: DSGVO-Verstoß** weil abgemeldete Adressen erneut kontaktiert werden.

### 7.4 Opt-Out-Bestätigungsmail (Empfohlen)

Nach Webhook-Trigger eine kurze Bestätigung an den Opt-Out-Klick-Initiator senden:
```
Hallo,
deine Adresse wurde auf unsere Blocklist gesetzt. Du wirst keine weiteren Nachrichten von uns erhalten.
Falls du das versehentlich gemacht hast, melde dich.
```

---

## Schritt 8: Kontaktliste vorbereiten + verifizieren

### 8.1 Apollo-Export

1. Apollo-Filter setzen: Branche / Position / Land / Unternehmensgröße
2. Export als CSV (max 10k pro Export bei Apollo Pro)
3. Spalten umbenennen auf Blueprint-Schema:
   ```csv
   firstName,lastName,email,company,position,linkedinUrl,note
   ```

### 8.2 Verifier-Lauf (Pflicht!)

1. CSV in NeverBounce / ZeroBounce / hunter.io hochladen
2. Verifier-Lauf abwarten (1-5 Min)
3. Nur Ergebnisse mit Status `valid` / `verified` exportieren
4. Bounce-Risk-Adressen (`risky`, `unknown`, `disposable`) RAUS
5. Role-Mails (`info@`, `contact@`, `noreply@`) RAUS

### 8.3 Honeypot-Filter

Spam-Trap-Adressen-Patterns prüfen:
- `abuse@*`, `postmaster@*`, `spam@*`
- Bekannte Honeypot-Domains (z.B. `*.honeypot.io`, `*.spamtrap.*`)
- → Aus Liste entfernen

### 8.4 In n8n laden

**Option A:** CSV direkt in Set-Node `Set: Kampagnen-Konfiguration` einfügen (für <50 Kontakte)

**Option B:** Google Sheets / Airtable als Datenquelle — Sheet-Node vor Split-Node einbauen

---

## Schritt 9: Test-Run mit 3 Test-Adressen

**Vor Aktivierung mit echten Kontakten: 3 Test-Adressen durchspielen.**

### Test-Setup

1. Set-Node `contacts`-Array auf 3 Test-Adressen anpassen:
   - Test 1: eigene Mail (`du+test1@firma.de`)
   - Test 2: zweite eigene Mail / Kollege mit OK
   - Test 3: Spam-Tester-Adresse (mail-tester.com)
2. Wait-Nodes temporär auf `1 minute` setzen (statt 3/5 Tage)
3. Workflow manuell triggern

### Test-Verifikation

- ✅ Mail 1 kommt an in allen 3 Test-Inboxes
- ✅ Mail 1 landet im Posteingang (NICHT Spam)
- ✅ Hook ist sinnvoll personalisiert (kein "Sehr geehrte/r {{firstName}}"-Bug)
- ✅ Opt-Out-Link funktioniert → führt zu Blocklist-Eintrag
- ✅ Wait-Nodes lösen Mail 2 + Mail 3 aus
- ✅ Manueller `replied=true` Flag stoppt Sequenz korrekt
- ✅ mail-tester-Adresse-Score ≥9/10

**Nach Test:** Wait-Nodes auf produktive Werte (3d / 5d) zurücksetzen!

---

## Schritt 10: Aktivierung + Monitoring

### 10.1 Workflow scharf schalten

1. Letzte Doppelprüfung Set-Node (Sender-Daten korrekt? Opt-Out-URL real?)
2. Workflow auf "Active" schalten
3. Erste Kampagne mit max 30-50 Mails/Tag starten (auch nach Warm-Up nicht direkt 200/Tag)

### 10.2 n8n-Settings

- Execution-Log-Retention: 30 Tage (Settings → Workflow History)
- Sensitive-Field-Masking: für `email`, `personalizedHook`, Mail-Body-Felder

### 10.3 Tägliches Monitoring (5 Min)

- Bounce-Rate < 2%? (Resend-Dashboard / Postmark-Dashboard)
- Spam-Complaint-Rate < 0,1%? (über Postmark `complaints`-Feed oder Resend)
- Opt-Out-Rate < 5%? (Blocklist-Wachstum/Tag)
- n8n-Execution-Failures? (Log scannen)

### 10.4 Wöchentliches Review

- Response-Rate (manuell tracken oder via CRM-Integration)
- Hook-Quality-Review: 10 zufällige Hooks lesen, generisch oder gut?
- Liste-Restbestand prüfen, neue Kampagne planen
- OpenRouter-Cost-Check (Spending-Cap nicht erreicht?)

---

## Troubleshooting

### Bounce-Rate >5%

- Listen-Verifier nochmal laufen lassen, alte CSV ist verbrannt
- Apollo-Export-Filter verschärfen (`verified email`-Flag)
- Falsche Domain in Sender-Setting? `from`-Adresse prüfen
- Mail-Provider gedrosselt? → Postmark / Resend kontaktieren

### Mails landen im Spam

- mail-tester.com Score neu testen → wenn <9/10 erst SPF/DKIM/DMARC fixen
- Domain-Warm-Up nicht abgeschlossen? → 2 Wochen pausieren, normale Mails senden
- Spam-Trigger-Wörter in Templates? ("Gratis", "Garantie", "100%", übermäßige Großbuchstaben)
- HTML zu komplex? → Plaintext-Fallback testen
- Bild-Anhang? → kein Bild-Hosting in Mail
- Reverse-DNS-Eintrag fehlt? → Hoster bitten zu setzen
- Tool: GlockApps Inbox-Placement-Test (€20)

### OpenRouter-Fehler

- 401: API-Key falsch oder revoked → neu generieren
- 429: Rate-Limit → Spending-Cap erreicht? Plan upgraden oder Batch-Size reduzieren
- 500: Model temporär down → Fallback-Model definieren (z.B. `openai/gpt-4o-mini` als Backup)
- Hook leer/abgeschnitten: `max_tokens` erhöhen (aktuell 200, kann auf 300)

### Opt-Out-Webhook funktioniert nicht

- n8n öffentlich erreichbar? (nicht localhost)
- Self-Hosted: Cloudflare-Tunnel / ngrok davor
- Workflow im Production-Mode (nicht Test-Mode)? Webhook-URL unterscheidet sich!
- Rate-Limit / Cloudflare blockt legitime Klicks? → IP-Whitelist für Mail-Klick-Trackers

### Hook-Qualität schlecht / zu generisch

- Mehr Kontext im CSV (`note`-Spalte ausfüllen mit LinkedIn-Snippet, Posting, News)
- Prompt verschärfen: "Beziehe dich konkret auf die Branche und eine spezifische Herausforderung in dieser Branche"
- Temperature von 0.85 auf 0.95 (mehr Variation)
- Modell upgraden auf `claude-3.5-sonnet` oder `gpt-4o`

### Wait-Nodes lösen nicht aus

- n8n braucht aktive Verbindung — bei Self-Host: Container darf nicht restarten während Wait läuft
- Bei n8n.cloud: gewährleistet
- Self-Hosted-Tipp: persistent Wait-Webhooks aktivieren

### Antwort kam aber Sequenz läuft weiter

- `contact.replied`-Flag wird nicht automatisch gesetzt im Default-Workflow
- DwY-Lösung: IMAP-Trigger-Workflow (Phase 2) der Inbox checkt + Flag setzt
- DIY-Lösung: Customer muss vor 3d/5d-Wait-Ablauf manuell in CRM `replied=true` setzen

---

## Wartung

| Intervall | Task |
|---|---|
| Täglich | Bounce + Spam-Complaint-Rate prüfen, n8n-Execution-Failures scannen |
| Wöchentlich | Hook-Quality-Stichprobe (10 Hooks lesen), Liste-Restbestand reviewen |
| Monatlich | Vendor-DPAs prüfen, Cold-Leads >90d löschen, Blocklist-Backup, OpenRouter-Spending-Review |
| Quartalsweise | Sender-Reputation-Audit (mail-tester, Postmaster-Tools von Google), DNS-Records (SPF/DKIM/DMARC) prüfen, Tokens rotieren |
| Halbjährlich | Workflow-Update vom AEVUM-Repo ziehen (neue Sicherheits-Features, Mitigation-Updates) |

---

## Done-for-You-Variante

Wenn dir das zu viel ist (insbesondere Domain-Warm-Up + DNS-Setup + Listen-Hygiene): AEVUM macht das komplett für dich.

**DFY-Scope (~12h Setup, 4 Wochen Begleitung):**
- Sub-Domain + SPF/DKIM/DMARC inkl. mail-tester-Verifikation
- 4-Wochen-Warm-Up-Plan mit Mail-Send-Cron
- OpenRouter + Spending-Cap + Token-Rotation
- Listen-Verifikation der ersten 200 Adressen
- Prompt-Engineering für 3-5 Hook-Varianten + A/B-Test
- Blocklist-Storage in Supabase + Blocklist-Check-Node
- Cloudflare vor Opt-Out-Webhook
- Test-Run + Inbox-Placement-Test (GlockApps)
- Erste Kampagne live mit Customer-Monitoring 30 Tage
- IMAP-Reply-Detection-Addon (optional)

→ Buchung über [aevum-system.de/shop](https://aevum-system.de/shop) (DFY-Variante wählen)
