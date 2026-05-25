# Onboarding-Autopilot — Security-Risk-Review

**Blueprint:** onboarding-autopilot
**Review-Datum:** 2026-05-25
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Schweregrad-Skala:** 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🟢 LOW

---

## Risk-Matrix

| # | Risiko | Schwere | Mitigation | Customer-Action |
|---|---|---|---|---|
| 1 | Webhook offen (kein Token/Signatur) | 🟠 HIGH | n8n-Webhook mit Header-Token absichern (X-AEVUM-Token) | Pflicht |
| 2 | Kein Rate-Limit am Webhook → Fake-Customer-Spam | 🟠 HIGH | Cloudflare/nginx Rate-Limit (z.B. 10/min/IP für Onboarding) | Pflicht |
| 3 | PII-Verarbeitung (Vorname/Nachname/Email/Firma/Telefon) durch n8n unverschlüsselt | 🟠 HIGH | EU-Hosting Pflicht (n8n-Cloud EU oder Hetzner), TLS-only | Pflicht |
| 4 | E-Mail-Template-Injection (Customer-Name landet in Subject + Body) | 🔴 CRITICAL | HTML-Escape im Set-Node vor Email-Node (Funktion: `escapeHtml({{ $json.firstName }})`) | Pflicht |
| 5 | Welcome-Mail-Phishing-Lookalike (Angreifer fakes Welcome-Mail für gespoofte Domain) | 🟠 HIGH | SPF + DKIM + DMARC für Sending-Domain, idealerweise Resend mit verifizierter Domain | Pflicht |
| 6 | Slack-Webhook-URL im Workflow-JSON exportierbar | 🟠 HIGH | Slack-URL nur in n8n-Credentials, NIE im Workflow-Body hartcoden | Pflicht |
| 7 | Airtable/Notion-API-Token im n8n-Credential-Store | 🟡 MEDIUM | n8n-Credentials-Encryption-Key separat verwalten, Token-Rotation 90d | Empfohlen |
| 8 | Calendly-Link-Expiry / -Rotation (alter Link in Mails kursiert weiter) | 🟡 MEDIUM | Calendly-Single-Use-Links NICHT nutzen, Standard-Link bevorzugen; bei Rotation Workflow-Update dokumentieren | Empfohlen |
| 9 | Notion/Airtable-Permissions zu offen (Integration hat Workspace-weiten Zugriff) | 🟡 MEDIUM | Scoped Integration nur auf Onboarding-DB; bei Notion: Page-Sharing minimal | Empfohlen |
| 10 | SMTP-Reputation-Risiko (Onboarding-Mails landen im Spam) | 🟡 MEDIUM | Resend statt eigener SMTP, Domain-Warmup, Bounce-Monitoring | Empfohlen |
| 11 | Customer-Email-Bounce wird ignoriert (Workflow läuft trotzdem 3d weiter, Slack-Ping geht raus) | 🟡 MEDIUM | Bounce-Handler-Node nach Email-Send, bei Bounce → Workflow stoppen + Carlos benachrichtigen | Empfohlen |
| 12 | Replay-Attack auf Webhook (gleicher Customer wird mehrfach registriert) | 🟡 MEDIUM | Idempotency: vor CRM-Push prüfen ob Email schon existiert → wenn ja, skippen oder Update | Empfohlen |
| 13 | Wait-Node 3d hält Customer-PII 72h im n8n-Execution-State | 🟡 MEDIUM | n8n-Execution-Data nach 30d auto-cleanup, sicherstellen dass keine PII in Log-Files | Empfohlen |
| 14 | Slack-Channel hat zu breiten Zugriff (alle Team-Member sehen Customer-Namen) | 🟢 LOW | Private-Channel für sensitive Branchen (Health/Legal), Standard-Public-Channel ok | Empfohlen |
| 15 | DDoS auf öffentlichen Webhook | 🟠 HIGH | Cloudflare vor Webhook-Domain, Bot-Fight-Mode aktiv | Pflicht |
| 16 | Token in Workflow-Export landet bei Backup-Sharing | 🟠 HIGH | Vor Export: Credentials prüfen, kein Hardcode in Body; n8n-Export-Tool nutzt automatisch Credential-Refs | Pflicht |

---

## Pflicht-Mitigations (Customer MUSS umsetzen)

### 1. Webhook-Token-Schutz

**Problem:** Wer die Webhook-URL kennt (z.B. aus Browser-DevTools auf einer Customer-Form-Seite), kann beliebig viele Fake-Onboardings injecten — jeder davon triggert eine Welcome-Mail an die hinterlegte Email + CRM-Eintrag + Slack-Ping. Spam-Vector + möglicher Phishing-Hebel.

**Fix:** Webhook-Node in n8n öffnen → "Authentication" auf "Header Auth" setzen → Custom-Header `X-AEVUM-Token: <32-char-random>`. Im Form-Tool (Tally Pro / Typeform Pro) Custom-Header mitsenden.

### 2. Rate-Limit

**Problem:** Ungeschützter Webhook = massiver Fake-Customer-Spam in CRM + Mail-Reputation kaputt + Slack-Channel zugemüllt.

**Fix-Option A (n8n-Cloud):** Cloud-Plan inkludiert IP-basierte Rate-Limits.

**Fix-Option B (Self-Hosted):** Cloudflare vor n8n-Domain. Rule: "Rate-Limit `/webhook/onboarding-*` → 10 req/min/IP" (Onboarding ist niedrig-Volumen, deshalb strenger als Lead-Form).

### 3. EU-Hosting + TLS

**Problem:** PII (Vorname/Nachname/Email/Firma/Tel) durch US-Hoster = DSGVO-Verstoß ohne SCC.

**Fix:** n8n-Cloud-EU-Region ODER Hetzner/Scaleway-VPS für Self-Host. Domain MUSS HTTPS (Let's Encrypt). Kein HTTP-Webhook akzeptieren.

### 4. E-Mail-Template-Injection-Prevention (CRITICAL)

**Problem:** Customer-Vorname landet in **Subject** UND **HTML-Body**. Wenn Customer "<script>" oder HTML-Tags in Vorname-Feld einträgt (absichtlich oder durch Copy-Paste-Bug), kann das Mail-Client-Rendering kaputt gehen oder im schlimmsten Fall Sicherheits-Issues im Mail-Reader auslösen. Realer angesprochener Vektor: Customer schreibt im Vorname-Feld einen Phishing-Link mit HTML-Format.

**Fix:** In Set-Node nach Webhook einen Sanitize-Schritt einbauen:
```
firstName_safe = {{ $json.firstName.replace(/<[^>]*>/g, '').slice(0, 50) }}
```
Im Email-Node nur `firstName_safe` verwenden, nie raw `firstName`.

Zusätzlich Subject auf max. 100 Zeichen begrenzen.

### 5. SPF + DKIM + DMARC

**Problem:** Welcome-Mail ohne korrekte DNS-Records landet im Spam ODER Angreifer können deine Domain spoofen. Bei Onboarding-Mails besonders kritisch weil Customer "willkommen.<deine-domain>" als legit ansieht.

**Fix:** Resend.com nutzen (auto-konfiguriertes DKIM beim Domain-Verify). SPF-Record + DMARC-Policy auf "quarantine" mind., "reject" empfohlen nach 30d Monitoring.

### 6. Slack-Webhook in Credentials, nicht im Workflow

**Problem:** Workflow-JSON-Export landet im Backup, im Repo, im Team-Chat. Slack-Webhook-URL = Zugriff zum posten in deinem Channel (Phishing via internem Channel).

**Fix:** n8n-Credentials → Slack-Webhook-URL DA hinterlegen. Im HTTP-Node nur Credential-Reference nutzen.

### 7. Cloudflare DDoS-Schutz

**Problem:** Öffentlicher Webhook ist DDoS-Vector.

**Fix:** Domain hinter Cloudflare (Free reicht). Bot-Fight-Mode aktiv.

### 8. Workflow-Export Credential-Check

**Problem:** Beim Workflow-Export könnten Tokens versehentlich im Body landen wenn nicht durchgehend Credentials genutzt wurden.

**Fix:** Vor jedem Export: Workflow-JSON öffnen, mit grep nach `token`, `webhook`, `bearer`, `xoxb` suchen. Wenn Treffer → in Credentials migrieren.

---

## Empfohlene Mitigations (Best-Practice)

### 9. Bounce-Handler

In Email-Welcome-Node Response-Code prüfen. Bei 4xx/5xx → If-Node → Workflow-Branch "Bounce" → Telegram-Alert an Carlos + kein Slack-Ping + kein 3-Tages-Follow-up.

### 10. Idempotency

Vor CRM-Push: Airtable-Find by Email. Wenn Record schon existiert → skippen oder Update statt Insert. Verhindert Doppel-Records bei Re-Submit.

### 11. PII-Log-Cleanup

n8n-Settings → "Execution Data" → "Delete after X days" auf 30 setzen. Critical weil Wait-Node 3d Execution-State hält → PII bleibt 33d+ in Logs ohne Cleanup-Policy.

### 12. Calendly-Link-Stabilität

Standard-Calendly-Link nutzen (nicht Single-Use). Bei Calendly-Account-Change Workflow-Update dokumentieren, sonst senden Welcome-Mails 404-Links.

### 13. Scoped Notion/Airtable-Integration

Notion-Integration nur auf Onboarding-DB sharen, nicht Workspace-weit. Bei Airtable: Personal-Access-Token mit Scope nur auf eine Base + read+write.

---

## Was AEVUM bei DFY-Install zusätzlich macht

Wenn Customer DFY (Done-for-You) bucht, übernimmt AEVUM:
- Cloudflare-Setup vor Webhook-Domain
- HTML-Escape-Sanitizer im Set-Node (Pflicht-Fix 4)
- SPF + DKIM + DMARC für Sending-Domain
- Resend-Setup mit Domain-Verify
- Slack-Credentials sauber konfiguriert
- Bounce-Handler-Branch im Workflow
- Idempotency-Check vor CRM-Push
- Test-Run mit 3 Fake-Customers (Hot/Standard/Edge-Case mit HTML-Injection-Test)
- Security-Sign-Off in Customer-Portal

---

## Known-Limits (nicht-fixbar in diesem Blueprint)

- **Free-Form-Tools (Tally-Free):** Kein Header-Auth → Recommendation: Tally Pro (€29/Mo) oder Custom-Form
- **Notion-Integration:** Workspace-Scope kann nicht granular eingeschränkt werden auf API-Level (Notion-Limit)
- **n8n-Wait-Node:** Execution-State enthält PII für 72h — kein Workaround außer Cleanup-Policy
- **Calendly:** Kein Server-Side-Slot-Reservation, Customer kann "fake-booken" — Calendly-Limitation

---

## Sign-Off (Quality-Gate)

- [x] Risk-Matrix erstellt (16 Risks)
- [x] 8 Pflicht-Mitigations dokumentiert
- [x] Customer-Action-Liste klar
- [x] DFY-Differentiator ausgearbeitet
- [x] Template-Injection als CRITICAL benannt
- [ ] Penetration-Test (extern) — Phase 2, nicht für Sales-Ready blockierend
- [ ] HTML-Escape-Node als Workflow-Addon — Phase 2 (jetzt im Install-Guide dokumentiert)
