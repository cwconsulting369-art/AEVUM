# Cold-Outreach-System — Security-Risk-Review

**Blueprint:** cold-outreach-system
**Review-Datum:** 2026-05-25
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Schweregrad-Skala:** 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🟢 LOW

---

## Risk-Matrix

| # | Risiko | Schwere | Mitigation | Customer-Action |
|---|---|---|---|---|
| 1 | Sender-Domain ohne SPF/DKIM/DMARC → Spam-Quarantäne + Domain-Blacklisting | 🔴 CRITICAL | SPF + DKIM + DMARC vor erstem Versand, mail-tester.com-Score ≥9/10 | Pflicht |
| 2 | Domain nicht aufgewärmt → erste 50 Mails landen sofort in Spam, Reputation kaputt | 🔴 CRITICAL | 2-4 Wochen Warm-Up (10-20 normale Mails/Tag) vor Cold-Volume | Pflicht |
| 3 | Hauptdomain für Outreach genutzt → bei Spam-Markierung Geschäfts-Mails betroffen | 🔴 CRITICAL | Separate Sub-Domain (z.B. `kontakt.firma.de`), niemals Hauptdomain | Pflicht |
| 4 | Gekaufte / nicht-recherchierte Liste → hohe Bounce-Rate + Spam-Complaints → Provider-Sperre | 🟠 HIGH | Verifier (NeverBounce / ZeroBounce / hunter.io) vor jeder Kampagne, Apollo-Only-Adressen | Pflicht |
| 5 | Opt-Out-Webhook offen (kein Token) → Trolle können Adressen auf Blocklist setzen oder DDoS | 🟠 HIGH | Webhook mit Header-Token ODER nur via Mail-Link (Signed-URL mit Email-Hash) | Pflicht |
| 6 | Bulk-Mail-DDoS gegen eigenes SMTP → Provider sperrt Account | 🟠 HIGH | Rate-Limit am SMTP-Sender (max 30-50/h), n8n-Batch-Size auf 10/Tag stellen | Pflicht |
| 7 | OpenRouter-API-Token im Workflow-JSON hartcoded → bei Export-Leak komplette Personalisierung gekapert + Rechnung explodiert | 🟠 HIGH | Token NUR in n8n-Credential-Store, niemals im Node-Body. Spending-Cap bei OpenRouter setzen | Pflicht |
| 8 | OpenRouter-Prompt-Injection durch Kontakt-Daten (Name = `Ignore previous instructions...`) | 🟡 MEDIUM | User-Input in Prompt escapen, max_tokens 200, Output-Sanitization vor Mail-Insert | Empfohlen |
| 9 | KI-Hook erzeugt Halluzinationen ("Sie haben letzte Woche bei XY gesprochen") → Vertrauensbruch + DSGVO-Vorwurf | 🟡 MEDIUM | Prompt explizit: "keine Fakten erfinden, nur aus gegebener Notiz/Position arbeiten", manueller Review erster 20 Hooks | Pflicht |
| 10 | PII (Vorname/Nachname/Mail/Firma) fließt via OpenRouter zu US-LLM-Provider | 🟡 MEDIUM | OpenRouter EU-Routing wählen (Claude/Mistral-EU) ODER explizit in DS-Erklärung erwähnen + DPA | Pflicht |
| 11 | Listen-Vergiftung: Konkurrent setzt sich + Beschwerde-Adressen auf deine Liste → gezielte Spam-Reports | 🟡 MEDIUM | Quell-Check + Honeypot-Adressen-Filter (z.B. `abuse@`, `postmaster@`, Spam-Trap-Domains) | Empfohlen |
| 12 | Mail-Templates ohne Plaintext-Fallback → Mail-Clients ohne HTML zeigen leeren Body, Spam-Score steigt | 🟡 MEDIUM | Plaintext-Version in Email-Node generieren (n8n unterstützt multi-part) | Empfohlen |
| 13 | Wait-Nodes nutzen n8n-Webhook-Resume → Webhook-URLs werden bei Workflow-Export sichtbar | 🟢 LOW | Production-Mode nutzen (statt Trigger-Mode), kein Workflow-Export an Externe | Empfohlen |
| 14 | Antwort-Detection nur via `contact.replied`-Flag → Customer muss manuell Flag setzen oder hat keine Inbox-Integration → Mails gehen raus obwohl geantwortet wurde | 🟠 HIGH | DwY: IMAP-Reply-Detection als Addon. Sonst: Customer-Pflicht, vor jedem Sequenz-Step CRM-Status zu prüfen | Pflicht |
| 15 | Logs enthalten alle Kontakt-PII + KI-generierte Personalisierung → Log-Leak = großer Datenschutz-Vorfall | 🟡 MEDIUM | n8n-Execution-Log-Retention auf 30d, keine Mail-Bodies in Logs, sensitive-Field-Masking aktivieren | Pflicht |
| 16 | EU-Hosting n8n nicht gewährleistet → DSGVO-Verstoß ohne SCC | 🟡 MEDIUM | n8n.cloud EU-Region oder Hetzner/Scaleway-Self-Host | Pflicht |
| 17 | Calendly-Link in jeder Mail = Reputation an externen US-Dienst gebunden | 🟢 LOW | EU-Alternative (Cal.com / SimpleBooking) optional anbieten, sonst in DPA aufnehmen | Empfohlen |

---

## Pflicht-Mitigations (Customer MUSS umsetzen)

### 1. Sender-Domain-Setup (SPF/DKIM/DMARC)

**Problem:** Ohne Auth-Records geht jede Cold-Mail direkt in Spam. Spam-Markierung führt zu Domain-Blacklisting auf Listen wie Spamhaus → kein Versand mehr möglich.

**Fix:**
- Sub-Domain anlegen (z.B. `kontakt.firma.de`), NICHT Hauptdomain
- Bei Mail-Provider (Resend / Postmark / Mailgun) Domain hinzufügen
- DNS-Records setzen:
  - **SPF** TXT: `v=spf1 include:spf.resend.com -all`
  - **DKIM** CNAME: Provider-spezifisch
  - **DMARC** TXT: `v=DMARC1; p=quarantine; rua=mailto:dmarc@firma.de`
- Verifikation via mail-tester.com → mindestens 9/10

### 2. Domain-Warm-Up (Pflicht vor erstem Cold-Send)

**Problem:** Neue Domain = 0 Reputation. Sofort 50 Cold-Mails → Spam-Quarantäne.

**Fix-Plan (4 Wochen):**
- Woche 1: 5-10 normale Mails/Tag an warme Kontakte (interne Tests, eigene Kunden) — alle müssen geöffnet werden
- Woche 2: 15-20 Mails/Tag, weiterhin warme Kontakte mit Antwort
- Woche 3: 20-30 Mails/Tag, erste Lauwarm-Kontakte (LinkedIn-Verbindungen)
- Woche 4: 30-50 Mails/Tag, erste Cold-Tests mit hochwertigen Adressen
- Ab Woche 5: Volle Cold-Outreach-Volumen

### 3. Sender-Hauptdomain-Schutz

**Problem:** Wenn `info@firma.de` für Cold-Outreach genutzt wird und auf Blacklist landet → reguläre Geschäfts-Mails kommen nicht mehr durch.

**Fix:** Separate Sub-Domain. Reputation isoliert. Bei Problem kann Sub-Domain "weggeworfen" werden, Hauptdomain bleibt sauber.

### 4. Liste-Hygiene + Verifier

**Problem:** Bounce-Rate >5% → Mail-Provider drosselt / sperrt Account. Spam-Trap-Adressen in Liste → automatische Blacklist.

**Fix:**
- Jede Liste vor Kampagnen-Start durch NeverBounce / ZeroBounce / hunter.io Verifier
- Bounce-Rate-Ziel: <2%
- Adressen mit `info@`, `contact@`, `noreply@` aus Liste filtern (B2B-Role-Mails generieren oft Beschwerden)
- Apollo-Listen nur mit `verified`-Flag exportieren

### 5. Opt-Out-Webhook absichern

**Problem:** Offener Webhook → DDoS oder gezielte Blocklist-Vergiftung möglich.

**Fix-Optionen:**
- **Option A:** Signed-URL — Email-Hash als Token (`?email=x&sig=hmac(email, secret)`)
- **Option B:** n8n-Webhook mit Header-Token + Cloudflare-Rate-Limit (30/min/IP)
- Rate-Limit auf Opt-Out-Endpoint (Cloudflare-Rule)

### 6. SMTP-Sending-Rate-Limit

**Problem:** n8n-Workflow schickt Burst von 200 Mails in 5 Min → Provider klassifiziert als Spam-Bot → Account-Sperre.

**Fix:**
- Batch-Size 10/Tag im Workflow lassen (default-Setting)
- Bei Resend / Postmark / Mailgun: Tageslimit checken (Resend Free: 100/Tag)
- Throttle-Delay zwischen einzelnen Mails: 30-60 Sekunden (Wait-Node in n8n)

### 7. OpenRouter-Token-Schutz

**Problem:** Token im Workflow-JSON → bei Backup / Migration / Bug-Report-Anhang exposed. OpenRouter-Account abgegriffen, fremde GPT-4-Calls auf deine Rechnung.

**Fix:**
- Token AUSSCHLIESSLICH in n8n-Credential-Store ("OpenRouter API")
- Im HTTP-Node nur Credential-Reference nutzen
- OpenRouter-Dashboard: Spending-Cap auf €50/Mo setzen (Hard-Stop)
- Bei Verdacht: Token sofort revoken + rotieren

### 8. Hallucination-Schutz im Hook-Prompt

**Problem:** KI erfindet Fakten ("Letzte Woche im Webinar gesehen...") → Empfänger erkennt, verliert Vertrauen, schreibt Beschwerde, beschuldigt DSGVO-Manipulation.

**Fix:**
- Prompt explizit:
  ```
  WICHTIG: Erfinde keine Fakten. Wenn Notiz leer ist, beziehe dich nur auf Position oder Branche.
  Niemals erfundene Treffen, Webinare, Veröffentlichungen erwähnen.
  ```
- Erste 20 Hooks manuell reviewen
- Bei Fehlinformation: Hook verwerfen, manuell schreiben

### 9. Antwort-Detection-Discipline

**Problem:** Workflow nutzt `contact.replied`-Flag — ohne IMAP-Integration weiß n8n nicht, ob jemand geantwortet hat. Mail 2 + Mail 3 gehen raus obwohl Antwort kam → Empfänger genervt, Spam-Report.

**Fix-Optionen:**
- **Option A (DIY):** Customer muss bei jeder Antwort manuell in CRM `replied=true` setzen bevor 3d-Wait abläuft
- **Option B (DwY):** IMAP-Trigger-Workflow als Addon — checkt Inbox, matcht Sender, setzt Flag automatisch
- **Option C (Enterprise):** Reply-Detection-Provider (Postmark Inbound, Mailgun Routes) → Webhook-Trigger an n8n

### 10. EU-Hosting + TLS

Wie Standard. n8n.cloud EU-Region oder Hetzner/Scaleway.

---

## Empfohlene Mitigations (Best-Practice)

### 11. Prompt-Injection-Defense

User-Input (Name, Firma, Notiz) vor OpenRouter-Call escapen:
- Newlines stripping
- Backticks/Markdown-Steuerzeichen entfernen
- Max-Length pro Feld (Name 100, Firma 200, Notiz 500)

### 12. Plaintext-Fallback in Mails

n8n-Send-Email-Node unterstützt `htmlBody` + `textBody`. Beide ausfüllen → Spam-Score verbessert sich.

### 13. Honeypot-Adressen-Filter

Vor Versand prüfen ob Adresse zu bekannten Spam-Trap-Domains gehört. Liste pflegen (z.B. `*.honeypot.io`, `spam-trap@*`).

### 14. Log-Retention 30 Tage

n8n-Settings → Execution-Data → 30d.

### 15. Sensitive-Field-Masking in Logs

n8n unterstützt Field-Masking. Mail-Bodies und vollständige Kontakt-PII maskieren.

---

## Was AEVUM bei DFY-Install zusätzlich macht

Wenn Customer DFY bucht, übernimmt AEVUM:
- Sub-Domain-Setup + SPF/DKIM/DMARC + mail-tester-Verifikation
- 4-Wochen-Domain-Warm-Up-Plan (Cron + Test-Inbox-Network)
- OpenRouter-Account-Setup + Spending-Cap + Token-Rotation-Schedule
- Liste-Verifizierung der ersten 200 Adressen via NeverBounce
- Prompt-Engineering für Customer-spezifisches Angebot (3-5 Hook-Varianten testen)
- IMAP-Reply-Detection-Addon (falls Customer das will)
- Cloudflare vor Opt-Out-Webhook + Rate-Limit
- Test-Run mit 10 Adressen (Inbox-Placement-Test) vor Live-Versand
- Security-Sign-Off in Customer-Portal
- Bounce-Monitoring-Dashboard für erste 30 Tage

---

## Known-Limits (nicht-fixbar in diesem Blueprint)

- **Reply-Detection ohne IMAP/Mail-Provider-Webhook:** Manueller CRM-Flag-Workflow Pflicht. Phase 2: IMAP-Reply-Detection-Addon.
- **A/B-Testing von Hooks:** nicht im Blueprint. Customer kann manuell verschiedene Prompts in Workflow-Kopien testen. Phase 2: A/B-Engine.
- **Inbox-Placement-Test:** Tools wie GlockApps / Mailgenius nicht integriert. Customer kann manuell vor Kampagne nutzen.
- **Multi-Inbox-Rotation:** Bei >100 Mails/Tag besser auf 3-5 Sender-Inboxes verteilen. Aktuell single-Sender im Blueprint. Phase 2.
- **OpenRouter-EU-Routing:** abhängig von Provider-Verfügbarkeit. Aktuell muss Customer aktiv EU-Modelle wählen.

---

## Sign-Off (Quality-Gate)

- [x] Risk-Matrix erstellt (17 Risks)
- [x] 10 Pflicht-Mitigations dokumentiert
- [x] Customer-Action-Liste klar
- [x] DFY-Differentiator ausgearbeitet
- [ ] Pen-Test extern — Phase 2, nicht Sales-Blocker
- [ ] IMAP-Reply-Detection-Addon — Phase 2
- [ ] Inbox-Placement-Test-Integration — Phase 2
- [ ] Multi-Inbox-Rotation-Workflow — Phase 2
