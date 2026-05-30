# Churn-Radar — Security-Risk-Review

**Blueprint:** churn-radar
**Review-Datum:** 2026-05-30
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Schweregrad-Skala:** 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🟢 LOW

---

## Risk-Matrix

| # | Risiko | Schwere | Mitigation | Customer-Action |
|---|---|---|---|---|
| 1 | DB-Credential mit zu weiten Rechten (Full-Write/Owner) im n8n-Credential → bei n8n-Kompromittierung Vollzugriff auf Produktiv-DB inkl. Lösch-/Änderungs-Rechte | 🔴 CRITICAL | Read-Only-Rolle für die Activity-Query, separate, eng berechtigte Rolle nur mit INSERT auf `churn_events` für das Log | Pflicht |
| 2 | Vollständige Kunden-PII (Name, Mail, MRR, Verhaltensdaten) wird pro Risiko-Kunde an OpenRouter → US-LLM-Provider übertragen → Drittland-Transfer ohne Rechtsgrundlage | 🔴 CRITICAL | EU-Routing-Modell wählen (Mistral-EU/Claude-EU), Datenminimierung (keine Mail-Adresse im Prompt — nur Vorname + Signale), DPA + SCC, in DS-Erklärung erwähnen | Pflicht |
| 3 | Auto-Retention-Mail an genervten/falsch-positiven Kunden → beschleunigt Churn statt ihn zu stoppen, Reputationsschaden | 🟠 HIGH | Erste 20 KI-Mails manuell reviewen (Email-Node anfangs deaktiviert, nur Slack-Alert). High-MRR-Kunden: nur Alert, kein Auto-Mail (IF-Branch nach MRR) | Pflicht |
| 4 | OpenRouter-API-Token hartcoded im Workflow-Body statt Credential-Store → bei Export/Backup/Bug-Report exposed, fremde LLM-Calls auf deine Rechnung | 🟠 HIGH | Token AUSSCHLIESSLICH im n8n-Credential-Store, Spending-Cap bei OpenRouter (€20/Mo hart), bei Verdacht sofort rotieren | Pflicht |
| 5 | Prompt-Injection über Kundendaten (Kundenname/Notiz = `Ignore previous instructions…`) → KI erzeugt manipulierten/peinlichen Mail-Text | 🟠 HIGH | Felder vor LLM-Call escapen (Newlines/Markdown strippen, Max-Length), `response_format: json_object` erzwingen, Output-Parsing mit Fallback (bereits im Code-Node) | Pflicht |
| 6 | KI-Halluzination in Retention-Mail ("Sie hatten letzte Woche Problem X mit Feature Y") → erfundene Fakten, Vertrauensbruch | 🟠 HIGH | System-Prompt: "Erfinde keine Fakten, nur aus gegebenen Signalen". Manueller Review der ersten 20 Mails. Faktentreue im Quality-Gate prüfen | Pflicht |
| 7 | Alert-Fatigue: Schwelle zu niedrig → CS-Team wird mit Alerts geflutet, ignoriert sie → Churn-Radar wirkungslos | 🟡 MEDIUM | Schwelle nach Test-Lauf kalibrieren, MRR-Gewichtung, nur AT_RISK/CRITICAL alerten, Daily-Digest statt Einzel-Pings bei hohem Volumen | Pflicht |
| 8 | Doppel-Alerts / Mehrfach-Mails an denselben Kunden bei mehrfachen Workflow-Läufen pro Tag | 🟡 MEDIUM | `churn_events`-Tabelle mit `UNIQUE (customer_id, detected_at)` + ON CONFLICT DO NOTHING (im Workflow enthalten), Schedule nur 1×/Tag | Pflicht |
| 9 | PII in n8n-Execution-Logs (Kundendaten + KI-Mail-Bodies) → Log-Leak = Datenschutzvorfall | 🟡 MEDIUM | Execution-Log-Retention 14–30d, Sensitive-Field-Masking für `customer_email`/Mail-Bodies, `saveDataSuccessExecution` für PII-Workflows reduzieren | Pflicht |
| 10 | Workflow stirbt still bei DB-/KI-Fehler → Risiko-Kunden werden übersehen, niemand merkt den Ausfall | 🟠 HIGH | Error-Pfad mit Ops-Mail (im Workflow enthalten via `onError: continueErrorOutput`), zusätzlich n8n-Error-Workflow global setzen | Pflicht |
| 11 | SMTP-Burst bei vielen At-Risk-Kunden gleichzeitig → Provider klassifiziert als Spam, Account-Drossel | 🟡 MEDIUM | Batch/Throttle bei >50 At-Risk-Fällen/Lauf, Mail-Provider-Tageslimit prüfen, Schedule-Spread | Empfohlen |
| 12 | Slack-Bot-Token mit zu weitem Scope (chat:write + Admin) → bei Leak Workspace-weiter Zugriff | 🟡 MEDIUM | Minimal-Scope `chat:write` für genau einen Channel, dedizierte App, Token im Credential-Store | Pflicht |
| 13 | Falscher Score durch fehlende/veraltete Aktivitätsdaten → gesunder Kunde bekommt "Wir vermissen dich"-Mail (peinlich) oder echter Risiko-Kunde wird übersehen | 🟡 MEDIUM | Daten-Freshness-Check im Code-Node (z.B. `last_login_at` NULL → eigenes Band statt Score 999), Nightly-Sync der Activity-Tabelle verifizieren | Pflicht |
| 14 | Retention-Mail ohne Bezug zur Benachrichtigungs-Präferenz → Bestandskunde empfindet es als Spam, Beschwerde | 🟢 LOW | Präferenz-/Abmelde-Link im Footer (Platzhalter im Workflow), Transaktions- vs. Marketing-Charakter sauber halten | Empfohlen |
| 15 | n8n nicht EU-gehostet → personenbezogene Kundendaten verlassen EU ohne Garantien | 🟡 MEDIUM | n8n.cloud EU-Region oder Hetzner/Scaleway-Self-Host | Pflicht |
| 16 | SQL-Injection-Risiko falls Query dynamisch aus Eingaben gebaut wird | 🟢 LOW | Parametrisierte Queries (`$1,$2…` via `queryReplacement`), keine String-Konkatenation von User-Input in SQL | Pflicht |
| 17 | Calendly/externe Links in Retention-Mail binden Reputation an US-Dienst + leaken Klick-Daten | 🟢 LOW | EU-Alternative (Cal.com) optional, in DPA aufnehmen | Empfohlen |

---

## Pflicht-Mitigations (Customer MUSS umsetzen)

### 1. Least-Privilege-DB-Zugriff (CRITICAL)

**Problem:** Ein einziges DB-Credential mit Vollrechten im n8n-Store ist ein Single-Point-of-Catastrophe. Wird n8n kompromittiert, ist die Produktiv-DB offen.

**Fix:**
- Eigene DB-Rolle `churn_radar_ro` mit **nur SELECT** auf `customers` + `customer_activity`
- Eigene DB-Rolle (oder dieselbe) mit **nur INSERT** auf `churn_events`
- Kein DROP/DELETE/UPDATE auf Produktiv-Tabellen
- Connection über TLS, kein Klartext-Port nach außen

### 2. PII-Minimierung beim LLM-Call (CRITICAL)

**Problem:** Voll-PII jedes Risiko-Kunden geht an einen US-LLM-Provider.

**Fix:**
- **Keine E-Mail-Adresse** in den OpenRouter-Prompt (im Default nur Vorname + Signale — beibehalten)
- EU-routables Modell wählen (`mistralai/…` EU oder Anthropic-EU)
- OpenRouter "no-log"/Zero-Retention-Modus aktivieren, falls verfügbar
- DPA mit OpenRouter + SCC, Drittland-Transfer in DS-Erklärung
- Alternative: LLM-Call ganz ersetzen durch statische Mail-Templates pro Risk-Band (kein PII-Transfer)

### 3. Auto-Mail-Review-Gate (HIGH)

**Problem:** Eine schlechte Auto-Mail beschleunigt Churn.

**Fix:**
- Phase 1: Email-Node deaktivieren, NUR Slack-Alert. CS reviewt + sendet manuell.
- Erste 20 KI-Mail-Texte lesen → Qualität ok?
- Erst dann Auto-Mail aktivieren — und für High-MRR-Kunden (z.B. > €500 MRR) dauerhaft auf "nur Alert, menschlicher Touch" stellen (zusätzlicher IF-Branch nach MRR)

### 4. OpenRouter-Token-Schutz + Spending-Cap (HIGH)

- Token nur im Credential-Store
- Spending-Cap hart auf €20/Mo (da nur Risiko-Fälle KI treffen, reicht das)
- Rotation quartalsweise

### 5. Prompt-Injection-Defense + Output-Fallback (HIGH)

- Kundenname/Freitext-Felder vor Call escapen (Newlines, Backticks, Markdown, Max-Length)
- `response_format: json_object` erzwingen (im Workflow gesetzt)
- Parsing mit Try/Catch + Fallback-Template (im `Code: KI-Antwort parsen`-Node enthalten)

### 6. Halluzinations-Schutz (HIGH)

- System-Prompt enthält "Erfinde keine Fakten" (gesetzt)
- Manueller Review der ersten 20 Mails
- Bei erfundenen Fakten: Hook verwerfen, Prompt verschärfen

### 7. Error-Eskalation (HIGH)

- Error-Pfad mit Ops-Mail im Workflow (`onError: continueErrorOutput` an Postgres + HTTP)
- Zusätzlich globalen n8n-Error-Workflow setzen (Settings → Error Workflow)
- Wöchentlicher Blick auf Execution-Failures

### 8. Alert-Fatigue-Kalibrierung (MEDIUM, aber Wirkungs-kritisch)

- Schwelle nach Test-Lauf justieren — lieber wenige, hochwertige Alerts
- Bei >20 Alerts/Tag: auf Daily-Digest umstellen (ein Slack-Post mit Tabelle statt 20 Pings)

### 9. Log-Hygiene (MEDIUM)

- Execution-Log-Retention 14–30d
- Sensitive-Field-Masking für `customer_email` + Mail-Bodies
- Bei strenger DSGVO-Auslegung: `saveDataSuccessExecution` reduzieren

### 10. EU-Hosting + TLS (MEDIUM)

- n8n.cloud EU oder Hetzner/Scaleway
- Alle Connections TLS

---

## Empfohlene Mitigations (Best-Practice)

### 11. Daten-Freshness-Guard
Im Code-Node prüfen, ob Activity-Daten aktuell sind (Sync-Timestamp). Bei veralteten Daten Lauf abbrechen + Ops-Alert statt falsche Scores zu produzieren.

### 12. MRR-gewichtete Alert-Priorität
CRITICAL + High-MRR zuerst im Slack-Digest. Verhindert, dass ein €30M-Account im Rauschen untergeht.

### 13. SMTP-Throttle
Bei vielen At-Risk-Fällen Batch + Delay zwischen Mails.

### 14. Statische-Template-Fallback ohne LLM
Pro Risk-Band ein vordefiniertes Template als Option — eliminiert PII-Transfer + LLM-Kosten vollständig für datenschutz-sensitive Customer.

### 15. Slack-Minimal-Scope
Dedizierte Slack-App, nur `chat:write`, nur ein Channel.

---

## Was AEVUM bei DFY-Install zusätzlich macht

- Datenquellen-Mapping (DB / Stripe / PostHog / Intercom) inkl. Read-Only-Rollen-Setup
- Score-Kalibrierung an historische Churn-Daten (Schwellen tunen, Falsch-Positiv-Rate senken)
- Retention-Template-Engineering (Voice des Customers, 3–5 Varianten testen)
- High-MRR-Branch (nur-Alert) + Daily-Digest-Modus
- OpenRouter EU-Routing + Spending-Cap + Token-Rotation-Schedule
- Sensitive-Field-Masking + Log-Retention
- Globaler Error-Workflow + Monitoring der ersten 30 Tage
- Test-Account-Durchlauf + Review-Gate-Begleitung
- Security-Sign-Off im Customer-Portal

---

## Known-Limits (nicht-fixbar in diesem Blueprint)

- **ML-Churn-Prediction:** nicht enthalten — transparente Heuristik. Phase 2 / Audit M.
- **Multi-Touch-Retention-Sequenz:** Single-Mail pro Erkennung. Phase 2.
- **Reply-Handling:** Antworten auf Retention-Mails landen im normalen Postfach.
- **In-App-/Echtzeit-Trigger:** Batch-only.
- **Auto-Rabatt/Save-Offer:** bewusst nicht automatisiert (Geld-Entscheidung = menschlich).

---

## Sign-Off (Quality-Gate)

- [x] Risk-Matrix erstellt (17 Risks, davon 2 CRITICAL + 5 HIGH)
- [x] 10 Pflicht-Mitigations dokumentiert
- [x] Customer-Action-Liste klar
- [x] DFY-Differentiator ausgearbeitet
- [ ] Pen-Test extern — Phase 2, nicht Sales-Blocker
- [ ] ML-Churn-Modell — Phase 2 / Audit M
- [ ] Multi-Touch-Retention-Sequenz — Phase 2
- [ ] Churn-Dashboard-Addon — Phase 2
