# Lead-Qualifier Pro — Security-Risk-Review

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
