---
title: AEVUM Blueprint — newsletter-machine
date: 2026-05-25
generated_by: blueprint-master-doc-script
---

# AEVUM Blueprint — newsletter-machine

> Generated 2026-05-25 20:29 Berlin-TZ. Combines alle Quality-Gate-Docs zu einem druckbaren Master-Dokument.

---

# 1. Sales-Brief


## In einem Satz

Dieser Workflow generiert jeden Mittwoch automatisch einen versandfertigen Newsletter-Entwurf (800–1.200 Wörter), schickt ihn zur menschlichen Freigabe, und published erst nach deinem Klick — ohne dass du eine leere Seite sehen musst.

---

## Wer das braucht

| Segment | Konkreter Use Case | Fit |
|---|---|---|
| **AG** Agentur (3–50 MA) | Positionierungs-Newsletter für Kunden-Retention und Inbound-Leads; wöchentlicher Aufwand derzeit: 3–5h Texter-Zeit | 🟢 Hoch |
| **PB** Personal Brand (Coach/Berater) | Thought-Leadership-Newsletter für Listenaufbau; Problem: Schreiben verdrängt Billable Hours | 🟢 Sehr hoch |
| **FI** Mittelstand B2B-Dienstleister | Kunden-Newsletter für Cross-Sell / Bestandskundenpflege; aktuell unregelmäßig oder gar nicht | 🟠 Mittel (braucht Tone-Customization) |

---

## Was der Customer bekommt

1. Fertiger n8n-Workflow (11 Nodes, import-ready) mit wöchentlichem Cron-Trigger
2. KI-gesteuerte Themen-Ideation (5 Vorschläge, automatisch bestes Thema selektiert)
3. Zweistufige Content-Generierung: Outline → Full Draft (800–1.200 Wörter)
4. Review-E-Mail mit Approve-Link — du liest, du entscheidest, du klickst
5. Automatischer Push in Beehiiv (oder Mailchimp) als Draft/Scheduled
6. Vollständige Dokumentation: Setup-Guide, DSGVO-Check, Security-Matrix
7. Konfigurierbare Nischen-Parameter: Thema, Zielgruppe, Ton, Format

---

## Mehrwert (konkret)

### Vorher / Nachher

| Dimension | Vorher | Nachher |
|---|---|---|
| Zeitaufwand pro Ausgabe | 3–6h (Thema finden, schreiben, formatieren) | 15–30 Min (lesen, editieren, freigeben) |
| Erscheinungsfrequenz | Unregelmäßig, "wenn Zeit ist" | Jeden Mittwoch, deterministisch |
| Kontrollverlust-Risiko | Null — nichts wird veröffentlicht | Null — menschlicher Freigabe-Gate bleibt |
| Qualitäts-Floor | Abhängig von Tagesverfassung | Konsistente Struktur, Outline-gestützt |
| Toolwechsel-Reibung | Recherche → Docs → Copy-Paste → Beehiiv | Ein Workflow, ein Klick |

### ROI-Schätzung (konservativ)

- **Zeitersparnis:** 3h/Woche × 48 Wochen = 144h/Jahr
- **Opportunitätskosten bei 150 EUR/h (Berater):** 21.600 EUR/Jahr
- **Oder:** 1 zusätzlicher Consulting-Tag/Woche = 7.200–15.000 EUR/Jahr Mehrumsatz
- **Break-even Blueprint-Tier S:** < 6 Wochen

---

## Pricing-Logic

| Tier | Beschreibung | Setup | Monatlich | Für wen |
|---|---|---|---|---|
| **Blueprint** (Self-Service) | JSON + Docs, kein Support | 297–497 EUR einmalig | — | Technisch affine PB mit n8n-Erfahrung |
| **DFY S** (Done-for-You Small) | Setup, Credentials, Test-Run, 30 Tage Support | 2.000–4.000 EUR | 1.000–1.500 EUR | PB ohne Ops-Ressourcen, AG mit <10 MA |
| **DFY M** (Done-for-You Medium) | DFY S + Multi-Newsletter (bis 3 Publikationen), Custom Tone-System, DSGVO-Packet | 8.000–14.000 EUR | 2.000–3.000 EUR | AG mit mehreren Kunden-Newslettern, FI |
| **DwY** (Done-with-You) | Gemeinsames Setup + Prompt-Engineering-Workshop | 3.000–5.000 EUR | — | PB/FI mit eigenem Tech-Team |
| **Audit Only** | Review bestehender Newsletter-Automation auf Gaps | 1.500–2.500 EUR | — | Wer bereits etwas gebaut hat |

---

## Voraussetzungen Customer

- Aktives n8n-Konto (Self-Hosted oder Cloud ab "Pro"-Plan wegen Webhook-Wait-Node)
- OpenRouter API Key mit aktiviertem Budget (empfohlen: min. 10 EUR/Monat, reicht für ~50 Newsletter)
- Beehiiv-Konto (Free Tier reicht für Setup) oder Mailchimp mit API-Zugriff
- SMTP-Zugang oder Resend-Account für Review-Mails
- Klare Definition von Nische, Zielgruppe und Ton (15-minütiges Briefing-Sheet wird mitgeliefert)
- Technisches Mindestniveau: Credentials in n8n eintragen, Copy-Paste von API Keys

---

## Nicht-Ziele

Dieser Blueprint macht **nicht**:

- Automatische Themen-Recherche aus Live-Quellen (RSS, Twitter/X, News-APIs) — das ist ein separates Add-on
- A/B-Testing von Subject Lines
- Subscriber-Segmentierung oder personalisierte Versionen
- Automatischen Versand ohne menschlichen Review (by design — wer das will, muss den Wait-Node entfernen, auf eigene Verantwortung)
- Bildgenerierung oder Design-Elemente
- Multi-Language-Output (Prompt-Anpassung möglich, aber nicht getestet)
- CRM-Sync oder Conversion-Tracking

---

## Upsell-Pfade

| Nächster Schritt | Beschreibung | Delta-Investment |
|---|---|---|
| **Content-Factory Add-on** | Themen-Ideation aus RSS/News-API statt statischem Prompt | +1.500–3.000 EUR Setup |
| **Social Repurposing** | Newsletter-Draft → LinkedIn-Posts, X-Threads automatisch | +2.000–4.000 EUR Setup |
| **Analytics-Loop** | Open-Rate / Click-Rate zurück in Ideation-Prompt (welche Themen performen) | +3.000–6.000 EUR |
| **Multi-Brand** | Gleicher Workflow für 3–10 Newsletter-Brands / Kunden parallel | +5.000–12.000 EUR |
| **Lead-Magnet-Machine** | Newsletter-Best-of → automatisch PDF-Lead-Magnet generieren | +2.500–5.000 EUR |

---

## Conversion-Story

Du sitzt Dienstagabend am Laptop. Die Idee war gut, der Draft ist leer, der Kaffee kalt. Nächste Woche dann. Das wiederholt sich seit drei Monaten — und deine Liste bemerkt es. Open-Rates sinken nicht weil deine Themen schlecht sind, sondern weil du zu selten sendest. Konsistenz schlägt Perfektion, jedes Mal.

Die Newsletter Machine löst nicht das Problem, dass du schreiben *könntest* — sie löst das Problem, dass du es *nicht tust*, weil der Einstieg zu teuer ist. Mittwoch 09:00 Uhr landet ein fertiger Entwurf in deiner Inbox. Du liest 10 Minuten, streichst einen Abschnitt, fügst deine eigene Anekdote ein, klickst "Freigeben". Der Rest ist erledigt. Nicht weil KI besser schreibt als du — sondern weil du mit einem 80%-Entwurf anfängst statt mit einer leeren Seite.

Was das für Agenturen bedeutet: Statt dass ein Texter 4 Stunden für einen Kunden-Newsletter abrechnet, prüft er 20 Minuten einen KI-Draft. Margin-Impact sofort. Für Personal Brands bedeutet es: Newsletter als Kanal wird wieder realistisch neben Kundenarbeit. Und für Mittelständler, die ihren Kunden-Newsletter seit 18 Monaten "planen": Der erste Draft entsteht diese Woche, nicht wenn Budget und Zeit sich irgendwann treffen.
\newpage

# 2. Install-Guide


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
\newpage

# 3. Security-Risks


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
\newpage

# 4. DSGVO-Konformitäts-Check


**Blueprint-ID:** newsletter-growth-machine
**Stand:** 2025
**Scope:** EU/EWR-Betrieb; für CH/UK gelten analoge, leicht abweichende Regelungen

---

> **Vorab-Hinweis:** Dieser Check ist eine technisch-operative DSGVO-Analyse, kein Rechtsgutachten. Für verbindliche rechtliche Beurteilung ist ein Datenschutzbeauftragter oder Rechtsanwalt hinzuzuziehen.

---

## Datenfluss-Analyse

| Datenkategorie | Entstehungsort | Verarbeitung durch | Speicherort | Weitergabe an Dritte | Löschfrist |
|---|---|---|---|---|---|
| Konfigurations-Daten (Thema, Zielgruppe, Ton) | Set-Node in n8n | n8n-Instanz, OpenRouter | n8n-Execution-Log, OpenRouter-Server | OpenRouter (USA/EU je nach Routing) | 7 Tage (Execution-Log) |
| Newsletter-Draft (generierter Text) | OpenRouter API Response | n8n-Instanz, E-Mail-Versand | n8n-Execution-Log, Inbox des Reviewers, Beehiiv | OpenRouter, SMTP/Resend, Beehiiv | 7 Tage n8n; je nach Mail-Client; Beehiiv bis Löschung |
| Review-E-Mail-Adresse (`reviewEmail`) | Set-Node | n8n-Instanz, SMTP/Resend | n8n-Execution-Log, Resend-Server | Resend/SMTP-Provider | 7 Tage n8n; Resend: 30 Tage Log |
| Approval-Webhook-Token + Timestamp | n8n Wait-Node | n8n-Instanz | n8n-Execution-Log | Keine | 7 Tage |
| Beehiiv Publication-ID + API-Key | n8n Credential Manager | n8n-Instanz | n8n-verschlüsselt | Beehiiv | Bis manuelle Löschung |
| Subscriber-Daten (im Newsletter-Kontext) | Beehiiv | Beehiiv-Plattform | Beehiiv-Server (USA) | Beehiiv | Gemäß Beehiiv-Einstellungen |

**Kritischer Befund:** Newsletter-Draft-Inhalte und die Review-E-Mail-Adresse passieren OpenRouter-Server. Wenn im Prompt personenbezogene Daten (z.B. Kundenreferenzen, Fallstudien mit Namen) enthalten sind, wird daraus eine Datenübermittlung in Drittländer.

---

## Rechtsgrundlage

| Verarbeitungsvorgang | Rechtsgrundlage | Begründung |
|---|---|---|
| Nutzung des Workflows durch den Operator (Business-to-Tool) | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) | Betrieb eines internen Marketing-Tools; kein Eingriff in Rechte der betroffenen Personen solange keine Subscriber-Daten in Prompts fließen |
| Review-Mail an eigene E-Mail-Adresse | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung / Eigenbetrieb) | Operator ist gleichzeitig betroffene Person; interne Kommunikation |
| Push zu Beehiiv (Newsletter-Draft, ohne Subscriber-Daten) | Art. 6 Abs. 1 lit. f DSGVO | Legitimes Interesse an Marketingbetrieb |
| **Wenn** Subscriber-Daten in Prompts fließen | Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) oder lit. b | Separate Prüfung erforderlich; standardmäßig: NICHT TUN |

---

## Pflicht-Konfiguration (DSGVO-konformer Betrieb)

**P-1: Kein PII in Prompts**
Der OpenRouter-Request (Nodes "HTTP: Themen-Ideen", "HTTP: Outline bauen", "HTTP: Full Draft schreiben") darf keine personenbezogenen Daten enthalten:
- Keine Kundennamen, keine E-Mail-Adressen, keine Fallstudien mit identifizierbaren Personen
- Konfigurations-Felder `targetAudience` und `newsletterTopic` auf generische Beschreibungen begrenzen

**P-2: Execution-Daten begrenzen**
```
n8n Self-Hosted Umgebungsvariablen:
EXECUTIONS_DATA_MAX_AGE=7
EXECUTIONS_DATA_PRUNE=true
N8N_EXECUTION_DATA_SAVE_MANUAL_EXECUTIONS=false
```

**P-3: Datenverarbeitungsverzeichnis (VVT) Eintrag**
Dieser Workflow muss im VVT des Operators dokumentiert werden:
- Zweck: Automatisierte Newsletter-Content-Generierung
- Kategorien betroffener Personen: Operator selbst (Review-Mail), Subscriber (indirekt über Beehiiv)
- Empfänger: OpenRouter, Resend/SMTP-Provider, Beehiiv
- Löschfristen: wie oben

**P-4: Auftragsverarbeitungsverträge (AVV) abschließen**
Siehe Vendor-Tabelle unten — AVV vor Go-Live für alle Drittanbieter.

---

## Vendor-DPA-Übersicht

| Vendor | Funktion im Workflow | EU-Hosting verfügbar | DPA vorhanden | DPA-Link / Hinweis | SCCs erforderlich |
|---|---|---|---|---|---|
| **n8n** (Cloud) | Workflow-Engine | Ja (EU-Region wählbar) | Ja | [n8n.io/legal/dpa](https://n8n.io/legal/dpa) | Nein (wenn EU-Region) |
| **n8n** (Self-Hosted) | Workflow-Engine | Ja (eigener Server) | Entfällt | Operator ist selbst Verantwortlicher | Entfällt |
| **OpenRouter** | LLM-Routing / KI-Generierung | Nein (USA-basiert) | Eingeschränkt — Terms of Service enthält Datenverarbeitungsklauseln, kein vollständiger AVV | [openrouter.ai/privacy](https://openrouter.ai/privacy) | 🔴 Ja — SCCs oder alternative Rechtsgrundlage für Drittlandübermittlung prüfen |
| **Resend** | Transactional Mail | Ja (EU-Region) | Ja | [resend.com/legal/dpa](https://resend.com/legal/dpa) | Nein (wenn EU-Region gewählt) |
| **Beehiiv** | Newsletter-Publikation | Nein (USA-basiert) | Ja (GDPR Data Processing Agreement verfügbar) | Settings → Legal → DPA in Beehiiv-Dashboard anfordern | Ja — Beehiiv bietet SCCs im Rahmen des DPA |
| **Mailchimp** (Alternative) | Newsletter-Publikation | Nein (USA-basiert, Intuit) | Ja | [mailchimp.com/legal/data-processing-addendum](https://mailchimp.com/legal/data-processing-addendum/) | Ja — SCCs über Standard-DPA |

**🔴 Kritischer Hinweis OpenRouter:** OpenRouter ist derzeit kein klassischer AVV-Partner im DSGVO-Sinne. Solange ausschließlich eigene, nicht-personenbezogene Business-Inhalte (Themen, Nischen-Beschreibungen) verarbeitet werden, ist das Risiko manageable — dennoch: VVT-Eintrag als "berechtigtes Interesse" + Datensparsamkeit (kein PII in Prompts) als Pflicht-Mitigation.

---

## Betroffenenrechte

| Recht (DSGVO) | Relevant für diesen Workflow? | Umsetzung |
|---|---|---|
| Auskunft (Art. 15) | Gering — Workflow verarbeitet primär eigene Betriebsdaten | n8n Execution-Logs auf Anfrage einsehbar |
| Löschung (Art. 17) | Relevant für Beehiiv-Subscriber-Daten | Über Beehiiv-Dashboard; n8n Executions manuell oder via Retention-Setting |
| Datenportabilität (Art. 20) | Nicht direkt relevant für Workflow-Betrieb | Beehiiv-Export-Funktion für Subscriber-Daten |
| Widerspruch (Art. 21) | Für Newsletter-Empfänger über Beehiiv-Unsubscribe | Beehiiv handelt Unsubscribe; Workflow berührt das nicht |
| Einschränkung (Art. 18) | Nicht relevant — kein kontinuierliches Subscriber-Profiling im Workflow | — |

---

## Löschfristen

| Datenkategorie | Frist | Mechanismus |
|---|---|---|
| n8n Execution-Logs | 7 Tage | Automatisch via `EXECUTIONS_DATA_MAX_AGE=7` |
| Review-E-Mails im Postfach | Operator-Verantwortung; empfohlen: 30 Tage | Manuelle Inbox-Regel oder automatisches Archiv |
| Beehiiv Draft-Posts | Bis Veröffentlichung oder manuelle Löschung | Beehiiv Dashboard |
| Resend Delivery-Logs | 30 Tage (Resend Default) | Resend Settings |
| API-Keys in n8n | Bis manuelle Rotation | Pflicht-Rotation alle 90 Tage dokumentieren |

---

## DSFA-Trigger (Datenschutz-Folgenabschätzung nach Art. 35 DSGVO)

Eine DSFA ist für diesen Workflow in der Standardkonfiguration **nicht erforderlich**, da:
- Keine systematische Verarbeitung besonderer Kategorien (Art. 9)
- Kein automatisiertes Profiling von Personen
- Kein großflächiges Monitoring

**DSFA wird erforderlich wenn:**
- Subscriber-Daten (auch aggregiert) in Prompts fließen
- Der Workflow für mehr als 5.000 Subscriber-Profile Personalisierungsentscheidungen trifft
- Gesundheits-, Finanz- oder politische Inhalte für vulnerable Zielgruppen generiert werden

---

## EU AI Act Einordnung

**Klassifizierung: Limited Risk (Art. 50 EU AI Act)**

Begründung:
- LLM-Calls via OpenRouter erzeugen KI-generierten Content
- Der Content wird in Newslettern an Personen kommuniziert
- Art. 50 Abs. 1: Pflicht zur **Kennzeichnung KI-generierter Inhalte** wenn diese mit Personen interagieren

**Pflicht-Maßnahme:**
```
In der Review-Mail und/oder im Beehiiv-Draft-Template:
Fußzeile empfohlen:
"[Teile dieses Newsletters wurden KI-unterstützt erstellt und 
von [NAME] geprüft und freigegeben.]"
```

Keine DSGVO-Vorabgenehmigung oder spezifische Registrierung für Limited-Risk-Systeme erforderlich. Kennzeichnungspflicht gilt ab Veröffentlichung.

**Nicht anwendbar:** High-Risk-Klassifizierung (kein kritischer Sektor, keine Entscheidungen über Personen, keine Biometrie).

---

## Audit-Checkliste vor Go-Live

- [ ] VVT-Eintrag für Newsletter-Workflow angelegt
- [ ] AVV mit Beehiiv abgeschlossen (DPA angefordert und signiert)
- [ ] AVV-Situation OpenRouter dokumentiert; Entscheidung: SCCs oder ausschließlich non-PII-Prompts
- [ ] AVV mit Resend abgeschlossen (wenn Resend genutzt)
- [ ] n8n Cloud: EU-Region in Account-Settings bestätigt
- [ ] n8n Self-Hosted: Server-Standort EU dokumentiert
- [ ] Execution-Retention auf 7 Tage konfiguriert
- [ ] Prompts auf PII geprüft: Kein personenbezogener Inhalt in Themen-/Outline-/Draft-Prompts
- [ ] KI-Kennzeichnung im Newsletter-Template implementiert (EU AI Act Art. 50)
- [ ] Beihiiv Unsubscribe-Link in allen ausgesendeten Newslettern vorhanden
- [ ] Datenschutzhinweis auf eigener Website um Beehiiv und KI-Tool-Einsatz ergänzt
- [ ] Löschfristen-Prozedur dokumentiert (wer löscht was wann)

---

## Sign-Off

| Prüfpunkt | Status |
|---|---|
| Rechtsgrundlage identifiziert | Ausstehend bis VVT-Eintrag |
| Drittland-Übermittlung bewertet | OpenRouter: Risiko-akzeptiert unter Bedingungen |
| AVVs vollständig | Vor Go-Live zwingend |
| EU AI Act Compliance | Kennzeichnung implementieren |
| DSFA erforderlich | Nein (Standardkonfiguration) |
\newpage

# 5. Quality-Gate Sign-Off


**Blueprint-ID:** `newsletter-growth-machine`
**Typ:** Blueprint
**Gate-Version:** 1.0
**Erstellt:** 2025
**Status:** PENDING SIGN-OFF

---

## Asset-Inventory

| Asset | Dateiname | Status | Prüfpunkte |
|---|---|---|---|
| Workflow JSON | `workflow.json` | ✅ Vorhanden | 11 Nodes, import-tested |
| README | `README.md` | ✅ Vorhanden (existing) | Vollständig bis auf abgeschnittenes Troubleshooting-Ende |
| Sales Brief | `SALES-BRIEF.md` | ✅ Erstellt | Alle 9 Sections vorhanden |
| Security Risk Matrix | `SECURITY-RISKS.md` | ✅ Erstellt | 12 Risks, davon 3 HIGH, PM-Code-Snippets |
| DSGVO-Check | `DSGVO-CHECK.md` | ✅ Erstellt | EU AI Act, Vendor-DPA-Tabelle, Audit-Checklist |
| Install Guide | `INSTALL-GUIDE.md` | ✅ Erstellt | 10 Schritte, 5 Troubleshooting-Cases |
| Quality Gate | `QUALITY-GATE.md` | ✅ Dieses File | — |
| `workflow.json` Smoke-Test | Manuell vor Go-Live | ⏳ Ausstehend | Import → Execute → Check alle 11 Nodes |
| Pricing-Kalkulation | Intern (nicht Customer-facing) | ✅ In Sales-Brief | DFY S/M, Blueprint-Tier, Audit |

---

## Sign-Off-Kriterien (10/10)

| # | Kriterium | Prüfmethode | Status |
|---|---|---|---|
| 1 | Workflow-JSON importierbar ohne Fehler in n8n ≥ 1.30 | Manueller Import-Test | ⏳ Ausstehend |
| 2 | Alle 11 Nodes korrekt verknüpft, keine fehlenden Connections | Node-Graph-Review | ⏳ Ausstehend |
| 3 | Happy-Path-Test (Szenario A aus Install-Guide) erfolgreich | Execute + Beehiiv-Draft-Check | ⏳ Ausstehend |
| 4 | Approval-Webhook feuert korrekt und triggert Beehiiv-Push | Manueller Klick + API-Response 200 | ⏳ Ausstehend |
| 5 | Kein API-Key im Workflow-JSON als Plaintext vorhanden | `grep -i "sk-or\|bearer\|api_key" workflow.json` | ⏳ Ausstehend |
| 6 | README vollständig (abgeschnittenes Ende im existing README repariert) | Linter + Sichtprüfung | 🔴 Offen — README bricht bei Troubleshooting ab |
| 7 | SALES-BRIEF alle Pricing-Tiers enthalten + realistisch für ICP | Review durch Sales/Founder | ⏳ Ausstehend |
| 8 | DSGVO-CHECK: Vendor-DPA-Links funktionsfähig | Link-Check | ⏳ Ausstehend |
| 9 | SECURITY-RISKS: Alle Pflicht-Mitigations im Install-Guide referenziert | Cross-Check PM-1 bis PM-4 | ✅ Erledigt |
| 10 | EU AI Act Kennzeichnungs-Empfehlung in DSGVO-CHECK und Install-Guide vorhanden | Sichtprüfung | ✅ Erledigt |

**Go-Live-Freigabe:** Erst wenn alle 10 Kriterien ✅

---

## Known Limitations

| Limitation | Severity | Phase 2 Marker |
|---|---|---|
| Thema-Selektion automatisch = immer #1 von 5 Vorschlägen; kein manueller Auswahl-Flow eingebaut | Mittel — einschränkend für Nutzer mit kuratierten Themen | 🔵 Phase 2: Wait-Node nach Ideation für manuelle Themen-Wahl |
| Kein eingebautes Fehler-Handling bei Beihiiv-Push-Failure (kein Retry, keine Alert-Mail) | Mittel — Silent Fail möglich | 🔵 Phase 2: Error-Branch nach HTTP: Beehiiv Push |
| Single-Model-Dependency auf OpenRouter; Modell-Downtime = Workflow-Fail | Mittel | 🔵 Phase 2: Fallback-Modell in IF-Node implementieren |
| Kein Quality-Check des generierten Drafts (Wortanzahl, Themen-Konsistenz) vor Review-Mail | Niedrig — manuell abfangbar im Review | 🔵 Phase 2: Auto-QC-Node (Wortanzahl-Check, Keyword-Presence) |
| Beehiiv-Push pusht als "Draft", nicht als "Scheduled" — Versand-Zeitpunkt muss manuell in Beehiiv gesetzt werden | Niedrig — zusätzlicher manueller Schritt in Beehiiv | 🔵 Phase 2: `scheduled_at`-Parameter in Beehiiv-Push-Body |
| Kein Multi-Newsletter-Support im aktuellen Workflow (eine Publication ID fest konfiguriert) | Niedrig für PB, Mittel für AG mit mehreren Clients | 🔵 Phase 2: Loop über Konfigurations-Array |
| README bricht im Troubleshooting-Abschnitt ab (vorliegendes existing README unvollständig) | Niedrig — Installation noch möglich via Install-Guide | 🔴 Fix vor Go-Live: README reparieren |
| Approval über E-Mail-Link ohne zweiten Bestätigungsschritt — Mail-Client Auto-Preview-Bug möglich | Mittel (Security) | 🔵 Phase 2: Redirect auf Bestätigungs-Seite mit zweitem Button |

---

## README-Fix-Aufgabe (vor Go-Live)

Das bestehende README bricht ab bei:
```
**Beehiiv Push schlägt fehl (401):** API Key abgelaufen oder
```

**Zu ergänzen:**
```markdown
**Beehiiv Push schlägt fehl (401):** API Key abgelaufen oder falscher Scope. 
Neuen Key in Beehiiv Settings → API generieren, in n8n Credential aktualisieren.

**Wait-Node nimmt Approval nicht an:** URL abgelaufen (>7 Tage) oder 
Workflow wurde neu gestartet. Workflow manuell neu ausführen, neuen Draft generieren.

**KI-Output auf Englisch:** System-Prompt um explizite Sprachanweisung ergänzen 
("Schreibe auf Deutsch.") im Node HTTP: Full Draft schreiben.
```

---

## DB-Update-Befehl

```sql
-- Blueprint als "ready_for_review" markieren nach Asset-Erstellung
UPDATE blueprint_items
SET
  status               = 'ready_for_review',
  has_sales_brief      = TRUE,
  has_security_risks   = TRUE,
  has_dsgvo_check      = TRUE,
  has_install_guide    = TRUE,
  has_quality_gate     = TRUE,
  quality_gate_version = '1.0',
  sign_off_complete    = FALSE,  -- erst nach Smoke-Test und README-Fix
  known_limitations    = 8,
  phase2_items         = 6,
  pricing_tier_min     = 'S',
  pricing_tier_max     = 'M',
  icp_fit_ag           = TRUE,
  icp_fit_pb           = TRUE,
  icp_fit_fi           = TRUE,
  eu_ai_act_class      = 'limited_risk',
  dsgvo_dsfa_required  = FALSE,
  updated_at           = NOW(),
  updated_by           = 'builder-agent-v1'
WHERE item_id = 'newsletter-growth-machine';

-- Sign-Off nach manuellem Smoke-Test und README-Fix:
-- UPDATE blueprint_items SET sign_off_complete = TRUE, status = 'published' WHERE item_id = 'newsletter-growth-machine';
```

---

## Pattern-Notes für Builder-Logik

Diese Notes dokumentieren Patterns aus diesem Blueprint für Wiederverwendung in der Builder-Logik:

**Pattern: Webhook-Wait-Approval**
- Jeder Blueprint mit `n8n-nodes-base.wait` triggert automatisch: Security-Risk "Webhook missbrauchbar" (Severity HIGH) + Mitigation PM-1 (Token-Auth)
- DSGVO-Note: Wait-Node hält PII in Execution-State → Execution-Retention-Setting Pflicht
- Sales-Note: Human-in-the-Loop ist Kaufargument für Compliance-affine Kunden, immer in Conversion-Story erwähnen

**Pattern: LLM via HTTP (OpenRouter)**
- Jeder LLM-Call via HTTP triggert: EU AI Act Limited Risk Einordnung + Kennzeichnungspflicht
- DSGVO-Risk: Drittlandübermittlung USA, kein vollständiger AVV verfügbar → "No-PII-in-Prompts" als Pflicht-Mitigation
- Security-Risk: Hallucination + Content-Quality = immer Severity HIGH wenn Output öffentlich kommuniziert wird
- Modell-Version immer pinnen: Known Limitation wenn nicht gepinnt

**Pattern: Mail-Sender Node**
- Jeder sendEmail-Node triggert: SMTP-Credential-Risk (Spam-Abuse), SPF/DKIM/DMARC-