# Content-Factory — DSGVO-Konformitäts-Check

**Blueprint:** content-factory
**Review-Datum:** 2026-05-25
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Disclaimer:** Diese Doku ist keine Rechtsberatung. Customer bleibt rechtlich verantwortlich. Bei rechtlich sensiblen Branchen (Health/Finance) zusätzlich Anwalt konsultieren.

---

## 1. Datenfluss-Analyse

**Welche personenbezogenen Daten verarbeitet der Workflow?**

Anders als beim Lead-Qualifier verarbeitet die Content-Factory **primär keine Drittpersonen-PII**. Es geht um eigene Brand-Content-Produktion. Datenflüsse sind:

| Datum | Kategorie | Speicherort | Aufbewahrung |
|---|---|---|---|
| Topic-String (selbst gewählt) | Brand-Content-Input | n8n-Workflow + OpenRouter-Request | n8n-Log <30d, OpenRouter-Logs lt. deren Policy |
| Generierter Hook/Caption/Hashtags | Brand-Output | Notion-DB + n8n-Log + Telegram-Channel | unbefristet (Customer-Asset) |
| Notion-User-Identität (wer hat erstellt) | Customer-eigene Daten | Notion-Workspace | Workspace-Policy |
| Telegram-Chat-ID (Customer's Channel) | Customer-eigene Daten | n8n-Credential-Store + Telegram | bis Bot-Löschung |

**Kritischer Hinweis:** Wenn Customer **versehentlich** PII in Topic-Queue schreibt ("Wie wir Kunde Max Müller geholfen haben") → wird an OpenRouter (US-Sub-Processors) gesendet → DSGVO-Verstoß. **Topic-Queue muss PII-frei bleiben.**

---

## 2. Rechtsgrundlage

| Kontext | Grundlage |
|---|---|
| Content-Generierung für eigene Brand | **Art. 6 (1) lit. f** — berechtigtes Interesse (Marketing eigene Brand) |
| Verarbeitung in OpenRouter (US) | **Art. 49 (1) lit. a** — explizite Einwilligung Customer ggü. OpenRouter (T&Cs) |
| Speicherung in Notion (US) | **Art. 28 + SCC** — Notion DPA + Standard Contractual Clauses |
| Telegram-Alert (intern) | **Art. 6 (1) lit. f** — internes Tooling |

**Wichtig:** Sobald Posts veröffentlicht werden und Drittpersonen darin erwähnt sind (Testimonials, Quotes von Kunden, etc.) → separate Rechtsgrundlage (Einwilligung) notwendig.

---

## 3. KI-Training-Data-Concerns

**OpenRouter ist Router, nicht LLM-Provider.** Requests werden an Anthropic, OpenAI, Mistral, Together-AI, etc. weitergegeben — abhängig vom gewählten Modell.

| Provider | Default-Training-Opt-Out | Customer-Action |
|---|---|---|
| **Anthropic (Claude)** | API-Calls werden NICHT zum Training genutzt | Kein Opt-Out nötig |
| **OpenAI (GPT-4o)** | API-Calls (ohne Opt-In) NICHT zum Training | OpenAI-Account-Setting prüfen ("Improve the model" deaktiviert) |
| **Mistral** | Variabel je nach Plan | Plan-Specs prüfen |
| **Together-AI / Open-Source-Modelle** | Meist hosted, kein Training | Provider-Policy prüfen |

**Empfehlung:** In OpenRouter-Settings auf "Privacy-First Routing" stellen falls verfügbar, sonst gezielt Modelle wählen die explizit nicht trainieren (Claude Sonnet 4.6, GPT-4o via API).

---

## 4. Pflicht-Konfiguration

### A) Topic-Queue PII-frei

**Hard-Rule:** Topic-Strings dürfen NIEMALS enthalten:
- Echte Kunden-Namen
- Echte E-Mail-Adressen
- Echte Firmennamen (außer eigene Brand)
- Interne Projekt-Codenamen mit Geheimhaltungswert
- Konkrete Vertrags-/Umsatzzahlen

### B) Output-Review vor Publish

Customer prüft jeden Draft auf:
- Keine erfundenen Statistiken (siehe Security-Risks)
- Keine Drittpersonen-Erwähnungen ohne Einwilligung
- Keine vertraulichen Brancheninfos

### C) Transparenz im Posting-Kontext

Falls Customer Posts als "Geschrieben mit KI-Unterstützung" labeln will → Footer-Pattern empfohlen. Nicht pflicht nach aktuellem DSGVO/UWG-Stand (Mai 2026), aber **EU-AI-Act Limited-Risk-Transparency-Pflicht ab August 2026** macht das implizit nötig (siehe Punkt 8).

---

## 5. Vendor-DPA-Übersicht

Welche Auftragsverarbeiter sind beteiligt?

| Vendor | Rolle | EU-Hosting? | DPA-Link | Risiko-Level |
|---|---|---|---|---|
| **n8n.cloud** | Workflow-Engine | ✅ EU-Region wählbar | n8n.io/legal/dpa | 🟢 LOW |
| **Self-Hosted n8n** | Workflow-Engine | Customer's Choice | — (eigener Server) | 🟢 LOW wenn EU-Server |
| **OpenRouter** | LLM-Router | ❌ US (mit Sub-Processors variabel) | openrouter.ai/terms | 🟡 MEDIUM (SCC + Sub-Processor-Risk) |
| **Anthropic (via OpenRouter)** | LLM-Provider | ❌ US (EU-Datacenters Enterprise) | anthropic.com/legal/dpa | 🟡 MEDIUM |
| **OpenAI (via OpenRouter)** | LLM-Provider | ❌ US (EU-Datacenters Enterprise) | openai.com/policies/dpa | 🟡 MEDIUM |
| **Notion** | Content-DB | ❌ US | notion.so/help/data-protection | 🟡 MEDIUM (SCC nötig) |
| **Telegram** | Alert-Channel (intern) | Mixed (DE-Server-Reports inkonsistent) | core.telegram.org/api/terms | 🟡 MEDIUM (nur für eigene Alerts, keine PII) |
| **Slack** (Alternative) | Alert-Channel (intern) | ✅ EU-Region (Enterprise) | slack.com/trust/compliance/data-protection-agreement | 🟢 LOW (mit EU-Plan) |

**Customer-Action:**
- Vor Go-Live alle aktiv genutzten Vendors als Auftragsverarbeiter in Art. 30-Verzeichnis aufnehmen
- OpenRouter-DPA + Anthropic/OpenAI-DPA gegenzeichnen (kaskadiert)
- SCC für US-Vendors als Schrems-II-Compliance dokumentieren

---

## 6. Betroffenenrechte (Art. 15–22 DSGVO)

Bei diesem Blueprint **gering relevant**, weil keine Drittpersonen-PII systematisch verarbeitet wird. Falls dennoch Anfragen kommen (z.B. weil Drittperson in einem Post namentlich erwähnt wurde):

| Recht | Umsetzung |
|---|---|
| **Auskunft** (Art. 15) | Notion-Filter "Caption contains '<Name>'" → Export an Betroffenen |
| **Berichtigung** (Art. 16) | Post-Draft editieren / Veröffentlichten Post updaten oder löschen |
| **Löschung** (Art. 17) | Notion-Page löschen, OpenRouter-Logs nach deren Policy (kein Customer-Zugriff), n8n-Log nach Retention |
| **Widerspruch** (Art. 21) | Drittpersonen-Erwähnung aus zukünftigen Posts entfernen |

---

## 7. Löschfristen-Logik

| Daten-Typ | Aufbewahrung | Grund |
|---|---|---|
| n8n-Execution-Log (mit Topic + Generated-Content) | 30 Tage | Operational, Debug |
| Notion-Drafts (Status="Draft") | 90 Tage Auto-Archive | Backlog-Hygiene |
| Notion-Veröffentlicht | unbefristet (Customer-Asset) | Brand-Archiv |
| OpenRouter-Request-Logs | nach OpenRouter-Policy (typisch 30d) | Provider-Side |

**Implementation:** Customer richtet zusätzlichen n8n-Cron ein der wöchentlich Drafts >90d archiviert.

---

## 8. EU-AI-Act-Kompatibilität (ab 2. August 2026)

**Klassifizierung:**

| Aspekt | Content-Factory |
|---|---|
| **AI-System nach EU-AI-Act?** | **Ja** — Workflow nutzt LLMs (Generative AI) |
| **Risk-Class** | **Limited Risk** — Generative AI für Content-Erstellung |
| **High-Risk?** | Nein (keine Beschäftigungs-/Bonitäts-/Justiz-Entscheidung) |
| **Transparenzpflicht (Art. 50 AI-Act)** | **JA** — Content der mit Generative-AI erstellt wurde muss als solcher erkennbar sein wenn er an Öffentlichkeit gerichtet ist |

**Customer-Pflichten:**

1. **Transparenz gegenüber Lesern (ab August 2026):** Posts die im Wesentlichen KI-generiert sind, sollten als solche kenntlich gemacht werden. Genaue Form noch nicht final geklärt (Hinweis im Post-Text, in Bio, separates Label).
2. **NICHT behaupten "100% authentic human writing"** wenn KI-Anteil substantiell ist.
3. **Substantielle Human-Review + Personalisierung** als Default → kann Argument sein dass Final-Output "human-augmented" statt "AI-generated" ist (Graustufe, juristisch noch nicht final ausjudiziert).

**Empfehlung Carlos/AEVUM-Position:**
- Personalisierungs-Anteil >30% (eigene Erfahrungen, eigene Wording-Patches) → de-facto Hybrid-Authoring
- Kein Pflicht-Label, aber kein "100% human"-Claim
- Bei Pure-Raw-KI-Posts (kein Review): Label setzen

---

## 9. Audit-Checkliste vor Go-Live

- [ ] Topic-Queue durchgescannt → keine PII drin
- [ ] OpenRouter-DPA + Sub-Processor-Liste in Art. 30-Verzeichnis
- [ ] Notion-DPA gegengezeichnet
- [ ] Telegram/Slack-DPA gegengezeichnet
- [ ] n8n EU-Hosting bestätigt
- [ ] OpenRouter Spend-Limit gesetzt (€5/Tag)
- [ ] OpenAI-Training-Opt-Out in OpenRouter-Settings geprüft
- [ ] Review-Prozess dokumentiert (jeder Draft wird vor Publish gereviewed)
- [ ] EU-AI-Act-Position für eigene Brand intern geklärt (ab Aug 2026)
- [ ] DS-Erklärung erwähnt Marketing-Tools (KI-Content-Generierung)

---

## 10. Quality-Gate-Sign-Off

- [x] Datenfluss-Analyse vollständig
- [x] Rechtsgrundlagen pro Schritt klar
- [x] KI-Training-Concerns dokumentiert
- [x] PII-Free-Topic-Queue als Hard-Rule
- [x] Vendor-DPA-Übersicht (8 Vendors)
- [x] Betroffenenrechte-Implementation
- [x] Löschfristen-Empfehlung
- [x] EU-AI-Act-Limited-Risk + Transparenzpflicht
- [x] Audit-Checkliste vor Go-Live
- [ ] Anwaltliche Validierung des Transparenz-Disclaimer-Patterns — Customer-Action, nicht Blueprint-Block
