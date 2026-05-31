# Churn-Radar — Install-Guide

**Blueprint:** churn-radar
**Setup-Dauer:** 60–90 Min (zzgl. Daten-Mapping je nach Quelle)
**Schwierigkeit:** Mittel (SQL + n8n-Credentials + ggf. Produkt-Instrumentierung)
**Letzter Update:** 2026-05-30

---

## Vorab-Check

### Tools die du brauchst

| Tool | Pflicht | Zweck | Kosten |
|---|---|---|---|
| n8n (Cloud-EU oder Self-Host) | ✅ | Workflow-Engine | €0–20/Mo |
| Postgres (oder Analytics-API) | ✅ | Kunden- + Aktivitätsdaten | meist vorhanden |
| OpenRouter-Account + API-Key | ✅ | KI-Analyse + Mail-Text | €2–8/Mo (nur Risiko-Fälle treffen KI) |
| Mail-Provider (Resend/Postmark/SMTP) | ✅ | Retention-Mail-Versand | €0–15/Mo |
| Slack Workspace + Bot-Token | ⚠️ Empfohlen | CS-Team-Alert (alt.: Email/Telegram) | €0 |
| Product-Analytics (PostHog/Mixpanel) | ⚠️ | Falls Aktivitätsdaten nicht in DB | €0–20/Mo |

### Token & Secrets (vorher sammeln!)

```
# n8n
N8N_BASE_URL=https://<workspace>.app.n8n.cloud

# Datenbank (Read-Only-Rolle empfohlen!)
CHURN_DB_HOST=...
CHURN_DB_NAME=...
CHURN_DB_USER=churn_radar_ro     # nur SELECT + INSERT auf churn_events
CHURN_DB_PASS=...

# OpenRouter
OPENROUTER_API_KEY=<aus openrouter.ai → Keys>
OPENROUTER_SPENDING_CAP=20       # EUR/Monat, hart einstellen!

# Mail-Provider (Beispiel Resend)
RESEND_API_KEY=<aus resend.com>
SENDER_EMAIL=success@deinefirma.de   # echtes, erreichbares Postfach
SENDER_NAME=Vorname Nachname
SENDER_COMPANY=Firma GmbH

# Slack
SLACK_BOT_TOKEN=xoxb-...             # Scope: chat:write
SLACK_CHANNEL_ID=C0123456789         # Channel-ID, nicht #name

# Ops
OPS_ALERT_EMAIL=ops@deinefirma.de    # für Workflow-Fehler
```

**Empfehlung:** Alle Tokens in Passwort-Manager, nie im Klartext.

---

## Schritt 1: n8n-Setup

### Option A: n8n Cloud (empfohlen für Start)
1. Account auf [n8n.cloud](https://n8n.cloud), **EU-Region wählen** (Pflicht für DSGVO)
2. Workspace-URL notieren

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
  -e EXECUTIONS_DATA_MAX_AGE=336 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

---

## Schritt 2: Workflow importieren

1. n8n → "Workflows" → "+" → "Import from File"
2. `workflow.json` aus diesem Blueprint-Folder hochladen
3. Workflow benennen: "AEVUM Churn-Radar"
4. **NICHT aktivieren** bevor Schritte 3–10 fertig sind!

---

## Schritt 3: Datenbank vorbereiten (KRITISCHER SCHRITT)

### 3.1 Audit-Tabelle anlegen
```sql
CREATE TABLE IF NOT EXISTS churn_events (
  id              bigserial PRIMARY KEY,
  customer_id     text NOT NULL,
  churn_score     int  NOT NULL,
  risk_band       text NOT NULL,
  reasons         jsonb,
  ai_assessment   text,
  retention_email_sent boolean DEFAULT false,
  detected_at     date NOT NULL DEFAULT current_date,
  UNIQUE (customer_id, detected_at)   -- Doppel-Alert-Schutz
);
```

### 3.2 Least-Privilege-Rolle (Security-Pflicht!)
```sql
CREATE ROLE churn_radar_ro LOGIN PASSWORD '<strong-pw>';
GRANT SELECT ON customers, customer_activity TO churn_radar_ro;
GRANT INSERT ON churn_events TO churn_radar_ro;
GRANT USAGE, SELECT ON SEQUENCE churn_events_id_seq TO churn_radar_ro;
-- KEIN UPDATE/DELETE/DROP auf Produktiv-Tabellen!
```

### 3.3 Query an dein Schema anpassen
Der Default-Query im **Postgres: Kunden-Aktivität laden**-Node erwartet `customers` + `customer_activity` mit den im README dokumentierten Spalten. Passe Tabellen-/Spaltennamen an dein Schema an.

**Keine eigene Activity-Tabelle?** Befülle `customer_activity` nächtlich aus deinen Quellen (Stripe für `failed_payments_90d` + `mrr`, PostHog/Mixpanel für `sessions_*` + `last_login_at`, Zendesk/Intercom für `open_support_tickets`). Oder ersetze den Postgres-Node durch HTTP-Request-Nodes gegen diese APIs.

---

## Schritt 4: Credentials anlegen

In n8n → Settings → Credentials:

1. **Postgres** → Name `Churn-Radar DB` → Host/DB/User (`churn_radar_ro`)/Pass, SSL aktivieren
2. **Header Auth** → Name `OpenRouter API` → Header `Authorization` = `Bearer <OPENROUTER_API_KEY>`
3. **SMTP** → Name `Churn SMTP`
   - Resend: Host `smtp.resend.com`, Port 465, User `resend`, Pass = API-Key
   - Postmark: Host `smtp.postmarkapp.com`, Port 587
4. **Slack API** → Name `Churn Slack` → Bot-Token (`xoxb-…`, Scope `chat:write`)

In den jeweiligen Nodes die Credential-Reference setzen — **niemals Token direkt in Node-Bodies**.

---

## Schritt 5: OpenRouter-Setup

1. Account auf openrouter.ai, Credit aufladen (€5–10 Start)
2. **Spending-Cap setzen!** Settings → Spending Limits → hart auf €20/Mo
3. API-Key generieren
4. **Modell-Wahl** (im HTTP-Node `jsonBody.model`):
   - **Empfohlen:** `anthropic/claude-3.5-sonnet` (gute Einschätzung, EU-routable)
   - **DSGVO-sensibel:** ein Mistral-EU-Modell
   - **Budget:** `openai/gpt-4o-mini`
5. Datenminimierung verifizieren: **keine E-Mail-Adresse** im Prompt (Default-Prompt enthält bewusst nur Vorname + Signale)

---

## Schritt 6: Set-Node "Churn-Konfiguration" ausfüllen

Alle `{{INDIVIDUELL: …}}`-Platzhalter ersetzen:
- `senderName`, `senderCompany`, `senderEmail`, `productName`
- `slackChannel` (Channel-ID `C…`)
- Schwellen: `riskThreshold` (Default 60), `inactiveDaysWarn` (14), `inactiveDaysCritical` (30)

Außerdem in einzelnen Nodes:
- **Email: Retention-Sequenz** → `{{INDIVIDUELL: Abmelde-/Präferenz-Link}}` im Footer
- **Email: Fehler-Alert** → `{{INDIVIDUELL: Ops-/Admin-Mail}}`

---

## Schritt 7: Score-Logik kalibrieren

Im **Code: Churn-Score berechnen**-Node sind Gewichtungen + Schwellen sichtbar. Sie sind ein guter Startpunkt, aber **dein Geschäftsmodell entscheidet**:
- Tool mit täglicher Nutzung → 14 Tage Inaktivität ist schon kritisch
- Tool mit monatlicher Nutzung (z.B. Reporting) → 14 Tage sind normal, Schwellen hochsetzen
- Gewichte (Punkte pro Signal) an deine Churn-Realität anpassen

Erst nach dem Trockenlauf (Schritt 8) endgültig justieren.

---

## Schritt 8: Trockenlauf (ohne Mails/Alerts)

**Vor echtem Versand: Score-Output prüfen.**

1. **Email- und Slack-Node temporär deaktivieren** (Rechtsklick → Disable) — nur bis hier soll der Flow laufen
2. Workflow manuell triggern ("Execute Workflow")
3. Output des **Code: Churn-Score berechnen**-Nodes inspizieren:
   - Sind die Scores plausibel?
   - Gibt es viele 999-Werte (= `last_login_at` fehlt → Datenproblem)?
   - Landen die richtigen Kunden in AT_RISK/CRITICAL?
4. Schwellen + Gewichte justieren, wiederholen bis plausibel

---

## Schritt 9: Mail-Review-Gate (Pflicht!)

**Eine schlechte Auto-Mail beschleunigt Churn. Erst reviewen, dann automatisieren.**

1. Slack-Node aktivieren, **Email-Node weiterhin deaktiviert**
2. Workflow auf echten Daten laufen lassen → CS bekommt Alerts, sendet manuell
3. Parallel die KI-generierten Mail-Texte (im `Code: KI-Antwort parsen`-Output) sammeln
4. **Erste 20 Mail-Texte manuell lesen:**
   - Faktentreu (keine erfundenen Details)?
   - Ton passend (hilfsbereit, nicht verzweifelt-werblich)?
   - Betreff sinnvoll?
5. Bei Problemen: System-Prompt im HTTP-Node verschärfen
6. **Erst dann** Email-Node aktivieren
7. **High-MRR-Kunden:** überlege einen IF-Branch nach `mrr` (z.B. > 500) → nur Alert, kein Auto-Mail (menschlicher Touch)

---

## Schritt 10: Aktivierung + Monitoring

### 10.1 Test mit Test-Account
1. Einen Test-Kunden in `customer_activity` mit künstlichen Risiko-Signalen anlegen (alter `last_login_at`, 0 Sessions, failed_payment)
2. Workflow manuell triggern
3. Verifikation:
   - ✅ Test-Account landet in AT_RISK/CRITICAL
   - ✅ Slack-Alert kommt im richtigen Channel an
   - ✅ Retention-Mail kommt in der Test-Inbox an (sinnvoll personalisiert)
   - ✅ `churn_events`-Zeile geschrieben
   - ✅ Zweiter Lauf am selben Tag → KEIN Doppel-Event (ON CONFLICT greift)
   - ✅ DB-Fehler simulieren (falsche Credentials) → Ops-Mail kommt an

### 10.2 Scharf schalten
1. Letzte Doppelprüfung Set-Node
2. Workflow auf "Active"
3. Globalen Error-Workflow setzen (Settings → Error Workflow)

### 10.3 n8n-Settings
- Execution-Log-Retention: 14–30 Tage
- Sensitive-Field-Masking: `customer_email`, Mail-Body-Felder

### 10.4 Tägliches/Wöchentliches Monitoring
- Täglich: Alert-Volumen ok (keine Flut)? Execution-Failures?
- Wöchentlich: Stichprobe KI-Mails, Falsch-Positiv-Quote, Schwellen-Feintuning
- Monatlich: OpenRouter-Spending, `churn_events`-Trend (sinkt Churn?), Token-Rotation prüfen

---

## Troubleshooting

### Alle Scores 0 oder 999
- `customer_activity` leer / nicht befüllt → Nightly-Sync prüfen
- Spalten-Mapping in der Query stimmt nicht mit deinem Schema überein
- `last_login_at` NULL → wird als 999 Tage gewertet (= max Inaktivität)

### KI-Mail leer oder kaputt
- `Code: KI-Antwort parsen` hat Fallback-Text — wenn der greift, ist die KI-Antwort kein valides JSON
- `response_format: json_object` im HTTP-Body gesetzt? (Default: ja)
- `max_tokens` zu niedrig? (Default 500)
- Modell unterstützt `response_format` nicht → anderes Modell wählen

### Slack postet nicht
- Bot ist nicht im Channel → `/invite @deinbot`
- `slackChannel` ist `#name` statt Channel-ID (`C…`) → ID nutzen
- Scope fehlt → `chat:write` in der Slack-App-Config

### Doppel-Alerts / Mehrfach-Mails
- `UNIQUE (customer_id, detected_at)`-Constraint fehlt auf `churn_events`
- Schedule läuft öfter als 1×/Tag

### Workflow läuft, aber niemand merkt Fehler
- Error-Pfad-Ops-Mail prüfen (`{{INDIVIDUELL: Ops-Mail}}` gesetzt?)
- Globalen Error-Workflow in n8n-Settings setzen

### Zu viele Alerts (Alert-Fatigue)
- `riskThreshold` hochsetzen
- Auf Daily-Digest umbauen (Slack-Node nach einem Aggregations-Code-Node, ein Post mit Tabelle)

### Gesunder Kunde bekommt "Wir vermissen dich"-Mail
- Daten veraltet/falsch → Activity-Sync-Freshness prüfen
- Score-Gewichte zu aggressiv → kalibrieren

---

## Wartung

| Intervall | Task |
|---|---|
| Täglich | Alert-Volumen + Execution-Failures prüfen |
| Wöchentlich | KI-Mail-Stichprobe, Falsch-Positiv-Quote, Schwellen-Tuning |
| Monatlich | OpenRouter-Spending, `churn_events`-Trend, Activity-Sync-Health |
| Quartalsweise | Tokens rotieren, DB-Rollen-Rechte auditieren, DPAs prüfen |
| Halbjährlich | Workflow-Update vom AEVUM-Repo ziehen, Score-Modell re-kalibrieren |

---

## Done-for-You-Variante

Wenn dir Daten-Mapping + Score-Kalibrierung + Template-Engineering zu viel ist: AEVUM macht das komplett.

**DFY-Scope:**
- Datenquellen-Mapping (DB / Stripe / PostHog / Intercom) inkl. Read-Only-Rollen
- Score-Kalibrierung an deine historischen Churn-Daten
- Retention-Template-Engineering (deine Voice, 3–5 Varianten getestet)
- High-MRR-Nur-Alert-Branch + Daily-Digest-Modus
- OpenRouter EU-Routing + Spending-Cap + Token-Rotation
- Globaler Error-Workflow + Monitoring 30 Tage
- Test-Account-Durchlauf + Review-Gate-Begleitung

→ Buchung über [aevum-system.de/shop](https://aevum-system.de/shop) (DFY-Variante wählen)
