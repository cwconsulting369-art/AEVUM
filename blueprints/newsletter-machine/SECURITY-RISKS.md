# Security Risk Matrix: newsletter-growth-machine

**Blueprint-ID:** newsletter-growth-machine
**Workflow-Nodes:** 11
**Kritische Patterns:** LLM-Call via HTTP, Mail-Sender, Webhook-Wait mit State-Haltung, API-Push zu Drittsystem

---

## Risk-Matrix

| # | Risiko | Schwere | Mitigation | Customer-Action |
|---|---|---|---|---|
| 1 | **KI-Hallucination / Falschaussagen im Draft** — LLM generiert faktisch falsche, markenunpassende oder rechtlich problematische Inhalte (Gesundheitsversprechen, Wettbewerber-Aussagen, erfundene Statistiken) | 🔴 HIGH | Pflicht-Review vor Freigabe (by design); Fact-Check-Hinweis in Review-Mail einbauen | Customer klickt niemals "Freigeben" ohne tatsächlich zu lesen; Pflicht: mind. 1 Fact-Check pro Draft |
| 2 | **API-Key Exposition im n8n-Set-Node** — OpenRouter, Beehiiv, SMTP-Credentials landen als Plaintext in Workflow-JSON wenn exportiert oder geteilt | 🔴 HIGH | Credentials NUR über n8n Credential Manager speichern, niemals in Set-Node-Felder eintragen; Workflow-JSON vor Weitergabe auf Plaintext-Secrets scannen | Workflow-JSON niemals in GitHub/Notion ohne Secret-Scan hochladen |
| 3 | **Webhook-Approval-URL missbrauchbar** — Die Wait-Webhook-URL ist eine ungescützte GET-URL; wer sie kennt, kann Newsletter-Drafts ohne Wissen des Owners freigeben | 🔴 HIGH | URL in E-Mail nicht öffentlich posten; Token-Parameter zur Verifikation hinzufügen (siehe Mitigation-Sektion); n8n Webhook-Auth aktivieren | URL wie ein Passwort behandeln; URL-basierte Approval nur in verschlüsselten Mail-Kanälen |
| 4 | **Newsletter-Versand ohne Lesen** — Workflow-Design erlaubt Freigabe ohne Content-Review wenn Approval-Link automatisch aufgerufen wird (z.B. Mail-Client-Preview lädt URLs) | 🟠 MEDIUM | Approval-URL per POST statt GET implementieren; Bestätigungs-Seite mit explizitem zweiten Klick | Mail-Client auf Auto-Link-Preview prüfen (insb. Apple Mail, Outlook) |
| 5 | **SMTP-Credential-Kompromittierung → Spam-Abuse** — Gestohlene SMTP-Credentials ermöglichen Spam-Versand über eigene Domain | 🟠 MEDIUM | Dediziertes Transactional-Mail-Konto (Resend empfohlen); SPF/DKIM/DMARC korrekt setzen; API-Key statt Username/Passwort | Resend oder Postmark statt SMTP-Passwort verwenden; API-Key rotieren alle 90 Tage |
| 6 | **Beehiiv-API-Key Vollzugriff** — Default API Keys in Beehiiv haben Schreib- und Lesezugriff auf alle Subscriber-Daten, nicht nur Draft-Push | 🟠 MEDIUM | Scoped API Keys nutzen (Beehiiv unterstützt Permission-Scoping); Key auf "Posts: Write" beschränken | In Beehiiv Settings API-Key-Scope prüfen und einschränken |
| 7 | **Workflow-State enthält PII** — Der Wait-Node hält Workflow-Execution am Leben; in dieser Execution sind Newsletter-Draft und potenziell Subscriber-Daten aus vorherigen Runs im n8n-Speicher | 🟠 MEDIUM | n8n Execution-History auf 7 Tage begrenzen; n8n-Instanz access-geschützt (kein Public Access ohne Auth) | n8n Settings → Executions → "Save Data" auf Minimum setzen |
| 8 | **LLM-Prompt-Injection via Konfigurations-Felder** — Wenn `newsletterTopic` oder `targetAudience` aus externen Quellen befüllt werden, kann Prompt-Injection den Output manipulieren | 🟡 LOW-MEDIUM | Konfigurations-Felder manuell befüllen, niemals aus unvalidierten externen Inputs speisen; Input-Sanitization wenn dynamisch | Konfiguration nur manuell ändern, niemals aus Web-Formular ohne Sanitization |
| 9 | **OpenRouter als Single Point of Failure + Datenweitergabe** — Alle Draft-Inhalte (Thema, Outline, Full Text) passieren OpenRouter-Server; bei Breach sind Inhalte exponiert | 🟡 LOW-MEDIUM | Sensible Inhalte nicht in Prompts aufnehmen (kein Firmen-IP, keine Kundennamen); OpenRouter DPA prüfen | Kein PII von Kunden, Mandanten oder Dritten in Prompts einfügen |
| 10 | **n8n-Instanz ohne Rate-Limiting** — Webhook-Endpoint kann theoretisch geflutet werden (DoS gegen Wait-Webhook); fehlendes Rate-Limiting auf n8n-Cloud oder Self-Hosted | 🟡 LOW | Reverse Proxy (nginx/Caddy) mit Rate-Limit vor n8n-Instanz; n8n-Cloud: Vendor-seitiges Rate-Limiting vorhanden | Self-Hosted: nginx Rate-Limit konfigurieren (5 req/min auf Webhook-Pfad) |
| 11 | **Timeout-Verhalten des Wait-Node unklar kommuniziert** — Nach 7 Tagen Timeout läuft Execution ab; Customer könnte denken der Draft wird automatisch versendet | 🟡 LOW | Timeout-Verhalten explizit in Review-Mail kommunizieren ("Läuft ab am [Datum], wird NICHT automatisch versendet") | Timeout-Wert im Wait-Node dokumentieren und in Mail-Template erklären |
| 12 | **Brand-Voice-Drift durch Modell-Updates** — OpenRouter-Modell-Updates können Output-Qualität und -Stil verändern ohne Vorankündigung | 🟡 LOW | Modell-Version explizit pinnen (z.B. `claude-3-5-sonnet-20241022` statt `claude-3-5-sonnet`); Versionierung im Konfig-Node | Modell-Version nach Updates im Workflow prüfen |

---

## Pflicht-Mitigations (Nummeriert)

### PM-1: Approval-Webhook absichern

Token-basierte Verifikation im Wait-Node:

```
Webhook-URL erweitern um Secret-Token:
https://your-n8n.com/webhook/approval?token=RANDOM_SECRET_32CHARS&approved=true

Im n8n IF-Node nach dem Wait-Node:
Condition: {{ $json.query.token }} === {{ $vars.approvalToken }}
→ true: Weiter zu Beehiiv Push
→ false: Stop + Alert-Mail
```

Token generieren (Terminal):
```bash
openssl rand -hex 16
# Beispiel-Output: a3f9b2c1d4e5f6a7b8c9d0e1f2a3b4c5
```

### PM-2: API-Keys korrekt speichern

```
❌ FALSCH: Set-Node → Field "openrouterKey" = "sk-or-v1-abc123..."
✅ RICHTIG: n8n → Credentials → New → HTTP Header Auth
   Header Name: Authorization
   Header Value: Bearer sk-or-v1-abc123...
   → Credential im HTTP-Node referenzieren, NICHT als Set-Field
```

### PM-3: n8n Execution-Retention begrenzen

```
n8n Settings → (Umgebungsvariable für Self-Hosted):
EXECUTIONS_DATA_MAX_AGE=7          # Tage
EXECUTIONS_DATA_PRUNE=true
N8N_LOG_LEVEL=warn                  # Kein verbose Logging mit Draft-Content
```

### PM-4: SMTP durch Resend ersetzen

```javascript
// Resend API statt SMTP-Credentials:
// HTTP Request Node statt Email Node
POST https://api.resend.com/emails
Header: Authorization: Bearer re_XXXX

Body:
{
  "from": "newsletter@yourdomain.com",
  "to": ["{{ $vars.reviewEmail }}"],
  "subject": "Newsletter Draft zur Freigabe — {{ $json.subject }}",
  "html": "{{ $json.emailBody }}"
}
// Vorteil: API-Key statt SMTP-Passwort, besseres Rate-Limiting, Delivery-Logs
```

---

## Empfohlene Mitigations (nicht Pflicht, aber stark empfohlen)

- **EM-1:** Fact-Check-Checkliste in Review-Mail einbauen (3 Punkte: Statistiken überprüft? Markenaussagen korrekt? Keine Versprechen die nicht haltbar sind?)
- **EM-2:** Modell-Version im Set-Konfiguration-Node pinnen, nicht dynamisch
- **EM-3:** Beihiiv-Push-Response loggen und bei non-2xx eine Alert-Mail senden
- **EM-4:** Draft-Content in Review-Mail als HTML mit `<blockquote>` formatieren, sodass klar ist "das ist KI-Output, noch nicht final"
- **EM-5:** Separates n8n-Service-Konto (nicht Admin) für Newsletter-Workflow anlegen

---

## Was AEVUM bei DFY zusätzlich macht

- Approval-Webhook mit Token-Auth implementieren und testen
- Credentials-Audit: Kein Plaintext in exportierten JSONs
- Beehiiv API-Key Scope prüfen und dokumentieren
- n8n-Instanz-Härtung: Rate-Limiting, Execution-Retention, Log-Level
- Review-Mail-Template mit Fact-Check-Hinweisen und klarem Timeout-Datum
- Erste 4 Newsletter-Runs begleiten und Output-Qualität evaluieren
- Schriftliches Security-Briefing für Customer (1-Pager)

---

## Known Limits

- n8n Wait-Node State-Persistenz: Bei n8n-Cloud-Outage (>24h) kann Execution-State verloren gehen — kein automatisches Recovery
- OpenRouter bietet keine garantierte Output-Determinismus: gleicher Prompt, unterschiedliche Ergebnisse
- Beehiiv-API v2 limitiert auf 60 Requests/Minute — bei Multi-Newsletter-Setup relevant
- Kein eingebautes Rollback wenn Beehiiv-Push partial failed (Draft landet defekt)
- Approval via E-Mail-Link: Bei kompromittierter E-Mail-Inbox ist der gesamte Approval-Flow kompromittiert

---

## Sign-Off-Checkliste Security

- [ ] Alle API-Keys ausschließlich in n8n Credential Manager gespeichert
- [ ] Approval-Webhook-URL mit Token-Parameter gesichert (PM-1)
- [ ] n8n Execution-Retention auf max. 7 Tage gesetzt (PM-3)
- [ ] SMTP-Credentials durch API-Key-basiertes System ersetzt (PM-4)
- [ ] Beehiiv API-Key Scope auf "Posts: Write" eingeschränkt
- [ ] n8n-Instanz nicht öffentlich ohne Authentifizierung erreichbar
- [ ] Workflow-JSON auf Plaintext-Secrets geprüft vor Backup/Share
- [ ] Modell-Version in OpenRouter-Calls explizit gepinnt
- [ ] Review-Mail enthält Fact-Check-Hinweis und Timeout-Datum
- [ ] Mail-Client auf Auto-URL-Preview getestet (kein ungewolltes Approve)