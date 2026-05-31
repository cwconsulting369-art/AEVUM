# Meeting-Summarizer — Sales-Brief

**Blueprint:** meeting-summarizer
**Tier:** Blueprint (DIY)
**Preis:** Siehe `apps/web/public/pricing` (€-Range nach Pricing-Model)
**Sales-Ready seit:** 2026-05-30

---

## In einem Satz

Abgeschlossene Calls aus Fireflies/Zoom werden automatisch transkript-basiert per KI zusammengefasst — strukturierte Summary + Entscheidungen + Action-Items (mit Owner & Frist) + Sentiment — und landen vollautomatisch im CRM, im Team-Channel und als E-Mail. Kein Mitschreiben, kein vergessenes Follow-up, kein leeres CRM.

---

## Wer das braucht

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur** (5–30 MA, AG) | 10+ Kunden-Calls/Wo, Protokolle werden nie geschrieben, Action-Items verschwinden, „das hatten wir doch besprochen"-Konflikte mit Kunden | Jeder Call automatisch protokolliert + Action-Items im Board + durchsuchbare CRM-Historie pro Kunde |
| **Personal Brand / Coach / Berater** (PB) | Discovery- & Coaching-Calls, Mitschreiben raubt Präsenz, Follow-up-Mails kosten abends 30 Min/Call | Voll präsent im Call, Summary + Follow-up-Bausteine sind 5 Min nach Call-Ende fertig |
| **Mittelstand B2B / Sales** (FI) | Sales-Calls landen nie im CRM, Vertriebsleitung sieht keine Pipeline-Realität, Deal-Risiken werden zu spät erkannt | Auto-CRM-Eintrag pro Call + Sentiment-Flag (kritisch) als Frühwarnung an Vertriebsleitung |

---

## Was Customer bekommt

1. **n8n-Workflow (JSON-Export)** — 14 Nodes, end-to-end: Trigger (Schedule + Webhook-Alternative), Config, Fireflies-Fetch, Filter, 2× Code (Aufbereitung + Parsing), Claude-Summary, CRM-Sync, Slack/Teams-Notify, Mail, kompletter Fehler-Pfad
2. **Dual-Trigger** — Polling (Schedule) ODER Push (Fireflies/Zoom-Webhook) je nach Setup-Präferenz
3. **Anti-Halluzination-Prompt** — die KI erfindet keine Owner/Fristen; unklar = `null`. Verhindert peinliche „Max macht XY bis Freitag"-Falschaussagen
4. **Robuster JSON-Parser** mit Fallback — kein Workflow-Crash wenn das LLM mal Markdown drumrum schreibt
5. **3 Output-Kanäle** — CRM-Datensatz + Chat-Nachricht + HTML-Mail, einzeln abschaltbar
6. **Strukturiertes Schema** — Summary / Entscheidungen / Action-Items (task+owner+due) / Sentiment / Next-Meeting
7. **Müll-Filter** — abgebrochene/leere Calls werden vor dem LLM-Call aussortiert (Kosten-Schutz)
8. **Token- & Injection-Schutz** — Transkript-Kürzung + Steuerzeichen-Entschärfung + „Transkript ist Daten, keine Anweisung"-Prompt
9. **Fehler-Alerting** — gescheiterte Schritte feuern einen Alert in Slack/Teams statt still zu sterben
10. **DSGVO-Pack** — Datenfluss-Analyse, Art. 6, Vendor-DPA-Übersicht, EU-AI-Act-Einordnung, Aufbewahrungs-Logik
11. **Security-Risk-Review** — 14 Risks inkl. PII-zu-US-LLM, Prompt-Injection, Webhook-Härtung
12. **Install-Guide** — Schritt-für-Schritt in 45–75 Min einsatzbereit

---

## Mehrwert (konkret)

**Vorher:**
- 40-Min-Transkript pro Call → niemand liest es
- Manuelles Protokoll: 15–25 Min/Call (wenn überhaupt) → wird meist gar nicht gemacht
- Action-Items werden vergessen → Re-Work + Vertrauensverlust beim Kunden
- CRM-Historie pro Kontakt = leer oder „hatten Call, lief gut"

**Nachher:**
- 5 Min nach Call-Ende: strukturierte Summary im CRM + Channel + Mail
- Action-Items mit Owner & Frist, direkt weiterverwertbar
- Durchsuchbare Call-Historie pro Kunde im CRM
- Sentiment-Flag „kritisch" als Pipeline-Frühwarnung

**ROI-Schätzung (Agentur, 10 Calls/Wo):**
- Time-Save: 15 Min Protokoll-Arbeit × 10 Calls = 2,5h/Wo → 10h/Mo
- Bei MA-Kosten €50/h fully-loaded → €500/Mo gespart
- Tool-Kosten: n8n + ~€0,02/Meeting LLM + Fireflies (hat der Kunde meist eh) → €20–40/Mo
- Plus: vermiedene Re-Work-Kosten durch nicht-vergessene Action-Items (schwer beziffert, real spürbar)
- **Pay-Back: < 1 Monat**, danach reiner Zeit- und Qualitätsgewinn

**Realistic-Caveat:** Die KI-Summary ist eine Arbeitserleichterung, kein verbindliches Rechtsdokument. Sie ist nur so gut wie das Transkript (Audio-Qualität, Sprecher-Trennung). Bei sehr langen Calls geht Detail durch Kürzung verloren. Der Customer sollte bei kritischen Calls die Summary einmal gegenlesen — der Footer weist darauf hin.

---

## Pricing-Logic

| Variante | Was | Preis-Range |
|---|---|---|
| **Blueprint-Only** | JSON + Docs + Install-Guide | €X (siehe Pricing-Page) |
| **Done-for-You** | Wir verbinden Fireflies/Zoom + CRM + Channel, bauen Dedup + tunen Prompt auf Customer-Vokabular, 5 Live-Test-Calls | €X × 2.5 |
| **Done-with-You** | Setup gemeinsam, Customer lernt Prompt-Tuning + CRM-Mapping | €X × 1.75 |

→ Conversion-Pfad zu Tier S/M Audit wenn Customer „ich will dass aus jeder Call-Summary automatisch Folge-Tasks/Angebote/Mails entstehen" → wird Post-Meeting-Automation-Engine (Action-Items → Task-Tool, Follow-up-Mail-Draft, Angebots-Trigger).

---

## Voraussetzungen Customer

- n8n laufend (Cloud-EU €20/Mo oder Self-Hosted)
- Fireflies.ai (Pro, API-Zugang) **oder** Zoom mit aktivierter Transkription
- Anthropic-API-Key (oder OpenRouter) — ~€0,01–0,03/Meeting
- CRM mit API (Airtable/HubSpot/Pipedrive) — optional aber empfohlen
- Slack/Teams-Webhook und/oder SMTP für Output
- **Total monatliche Tool-Kosten:** €20–60 (n8n + LLM + ggf. CRM), Fireflies/Zoom meist bereits vorhanden

---

## Nicht-Ziele (explizit)

- ❌ Eigene Aufnahme/Transkription — wir konsumieren Fireflies/Zoom-Transkripte, transkribieren nicht selbst
- ❌ Echtzeit-Live-Summary während des Calls — Post-Call-Batch, kein In-Call-Overlay
- ❌ Automatisches Versenden von Follow-up-Mails AN KUNDEN — Summary geht ans interne Team; Customer-Outreach ist Cold-Outreach-Blueprint
- ❌ Task-Tool-Sync (Asana/Jira/ClickUp) out-of-the-box — CRM-Sync ist drin, Task-Sync ist Erweiterung (Upsell)
- ❌ Dedup über mehrere Läufe als Default — Webhook-Trigger oder Phase-2-Erweiterung
- ❌ Multi-Language-Summary-Routing — Default Deutsch; andere Sprache = Prompt-Anpassung
- ❌ Map-Reduce für sehr lange Calls (>60 Min volle Tiefe) — Phase 2

---

## Upsell-Pfade

| Customer-Frage | Next-Step |
|---|---|
| „Action-Items sollen automatisch als Tasks in Asana/Jira/ClickUp" | → Post-Meeting-Automation-Engine (DwY-Addon, Task-Tool-Integration) |
| „Aus jedem Sales-Call soll ein Follow-up-Mail-Entwurf entstehen" | → Audit S (Follow-up-Draft-Generator, kombiniert mit Cold-Outreach-Templates) |
| „Wir wollen Deal-Sentiment über Zeit als Dashboard" | → Reporting-Dashboard-Blueprint (Sentiment-Trend pro Account) |
| „Sehr lange Workshops/Trainings vollständig zusammenfassen" | → Audit M (Map-Reduce-Summary-Pipeline) |
| „CRM-Mapping ist kompliziert (HubSpot Deal-Stages etc.)" | → DFY-Variante mit CRM-Schema-Mapping |
| „Strikte DSGVO, kein US-LLM erlaubt" | → DFY mit OpenRouter-EU / Mistral-EU-Setup + DPA-Paket |

---

## Conversion-Story (Brief für Sales-Page)

> „Dein Team hat heute 8 Calls. Fireflies hat alle transkribiert. Frage: Wer liest die 8 Transkripte? Niemand. Wer trägt die Action-Items ins CRM? Niemand. Wer erinnert sich nächste Woche, was mit Kunde X besprochen wurde? Niemand."
>
> „Der Meeting-Summarizer zieht jedes Transkript automatisch, macht eine saubere Summary mit Entscheidungen und Action-Items (Owner + Frist), schreibt sie ins CRM, postet sie im Channel und mailt sie ans Team. 5 Minuten nach Call-Ende — ohne dass jemand etwas tut."
>
> „Die KI erfindet dabei nichts: Was im Call nicht gesagt wurde, bleibt leer. Einmal eingerichtet, läuft es für jeden Call — automatisch, durchsuchbar, im CRM."
