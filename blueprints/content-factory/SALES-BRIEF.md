# Content-Factory — Sales-Brief

**Blueprint:** content-factory
**Tier:** Blueprint (DIY)
**Preis:** Siehe `apps/web/public/pricing` (€-Range nach Pricing-Model)
**Sales-Ready seit:** 2026-05-25

---

## In einem Satz

Tägliche, voll-automatisierte Hook + Caption + Hashtag-Produktion für Instagram und LinkedIn aus einer manuell gepflegten Themen-Queue — Output landet als Notion-Draft, du bekommst eine TG/Slack-Notification zur Freigabe. **Kein Auto-Publish (bewusst, siehe Nicht-Ziele).**

---

## Wer das braucht

| Segment | Pain | Hebel |
|---|---|---|
| **Personal Brand** (Coach/Berater/Creator) — Hauptzielgruppe | 4h pro Post für Hook+Caption+Hashtags, Posting-Konsistenz bricht nach 2 Wochen weg | 15 min pro Post (nur Review+Personalisierung), tägliche Konsistenz aus Queue heraus |
| **Agentur** (5–30 MA) | Content-Operations für eigene Brand wird vernachlässigt während Customer-Content priorisiert wird | Eigene Brand läuft im Background, Team schaut nur Drafts review |
| **Mittelstand B2B** (Inhaber/Marketing-Lead) | "Wir müssten sichtbarer werden" ohne Content-Team oder Budget für Agentur | Tägliche Draft-Pipeline, Inhaber bricht Texte mit 5 Min Review final |

---

## Was Customer bekommt

1. **n8n-Workflow (JSON-Export)** — 12-Node-Workflow mit Schedule-Trigger, 3 OpenRouter-Calls, IF-Quality-Check, Notion-Create, Telegram-Alert
2. **Prompt-Library** — 3 produktionsreife System-Prompts (Hook / Caption / Hashtags), plattform-konditionierbar
3. **Topic-Queue-Logik** — Set-Node mit rotierendem Index, 14-Themen-Vorlauf-Empfehlung
4. **Notion-DB-Schema** — Fertige Spalten-Definition (Titel, Status, Plattform, Caption, Hashtags, Erstellt am)
5. **Quality-Check** — IF-Node verhindert Posts mit Caption <100 Zeichen
6. **Plattform-Differenzierung** — Instagram informell vs LinkedIn formal-strukturiert
7. **TG/Slack-Alert** — Draft-Vorschau direkt aufs Handy mit Notion-Deep-Link
8. **DSGVO-Pack** — Vendor-DPA-Übersicht (OpenRouter, Notion, Telegram), EU-AI-Act-Transparenz-Pflicht
9. **Security-Risk-Review** — Token-Schutz, KI-Hallucination-Risk, LinkedIn-AI-Penalty-Hinweis 2026
10. **Install-Guide** — Setup in <60 Min, Troubleshooting für die häufigsten 5 Fehler

---

## Mehrwert (konkret)

**Vorher:**
- Idee → 30 min recherchieren → 60 min schreiben → 30 min Hashtag-Research → 30 min Plattform-Anpassung → 30 min Publishing-Vorbereitung
- ~3-4h pro fertigen Post, realistisch 2-3 Posts/Woche
- Konsistenz-Bruch sobald operative Last steigt

**Nachher:**
- Topic-Queue 1× pro Monat befüllen (30 Min Themen sammeln)
- Täglich 08:00: Workflow läuft → Draft fertig in Notion → 5 Min Review/Personalisierung
- Konsistenz: 7 Posts/Woche möglich, ohne dass Operations darunter leiden

**ROI-Schätzung (Personal Brand, 5 Posts/Woche):**
- Time-Save: ~3,5h pro Post × 5 Posts = 17,5h/Wo → 70h/Mo
- Bei Stundensatz €100 (Coach/Consultant) → €7.000/Mo Opportunity-Cost-Save
- Plus Sichtbarkeits-Lift durch Konsistenz (qualitativ, kein hartes Multiple)

**Achtung — ehrliche Einordnung:**
- KI-Drafts sind **Rohmaterial, kein Final-Output**. Ohne Human-Review → austauschbarer Content. Mit 5-Min-Review + Personalisierung → solider Daily-Driver.
- Wer "publish raw KI-Content" erwartet, kauft das falsche Tool.

---

## Pricing-Logic

| Variante | Was | Preis-Range |
|---|---|---|
| **Blueprint-Only** | JSON + Docs + Prompt-Library | €X (siehe Pricing-Page) |
| **Done-for-You** | Wir installieren + Topic-Queue auf deine Voice trainieren | €X × 2 |
| **Done-with-You** | Setup gemeinsam, Voice-Training-Workshop | €X × 1.5 |

→ Conversion-Pfad zu Tier S/M Audit wenn Customer "Content + Distribution + Lead-Gen" als Bundle will.

---

## Voraussetzungen Customer

- n8n laufend (Cloud €20/Mo EU-Region oder Self-Hosted)
- OpenRouter-Account mit ~€10 Startguthaben (reicht für ~1.000-5.000 Runs)
- Notion-Workspace + Integration-Token
- Optional: Telegram-Bot ODER Slack-Webhook für Alerts
- 30 Min/Monat für Topic-Queue-Pflege
- 5 Min/Tag für Draft-Review

**Total monatliche Tool-Kosten:** €20–40 (n8n + OpenRouter-Usage).

---

## Nicht-Ziele (explizit)

- **Kein Auto-Publish auf Instagram/LinkedIn.** Das ist **kein Bug, das ist Feature.** Begründung:
  - LinkedIn-Algorithmus straft seit 2026 KI-Detected-Posts ab (Reach-Drop 40-70%)
  - Instagram-Auto-Publish via Graph-API ist möglich, aber Quality-Risiko bei un-reviewtem KI-Output zu hoch
  - Brand-Reputation > Convenience. Customer muss reviewen.
- **Keine Video-Generation** (Reels, Shorts) — separates Blueprint geplant
- **Keine Bild-Generation** für Posts — Customer nutzt eigene Bilder/Canva/Higgsfield
- **Keine Voice-Cloning** für Tone-of-Voice — System-Prompt mit Voice-Examples ist Workaround, kein True-Cloning
- **Keine Multi-Account-Verwaltung** (mehrere Brands gleichzeitig) — 1 Workflow = 1 Brand
- **Keine Performance-Analytics** (Reach, Engagement, etc.) — separates Blueprint geplant

---

## Upsell-Pfade

| Customer-Frage | Next-Step |
|---|---|
| "Kann das auch Reels-Scripts?" | → Script-Factory Blueprint (in Build) |
| "Wie messe ich, was funktioniert?" | → Content-Analytics-Blueprint (Phase 2) |
| "Mein Voice klingt austauschbar" | → Audit S (Custom Voice-Training mit eigenem Korpus) |
| "Ich brauche Multi-Account / White-Label" | → Audit M (Custom-Setup für Agentur-Use-Case) |
| "Verteilung Cross-Channel (X/Threads/Bluesky)" | → DFY Cross-Channel-Distribution |

---

## Conversion-Story (Brief für Sales-Page)

> "Du weißt, dass tägliches Posten deine Reichweite multipliziert. Aber 3-4 Stunden pro Post sind einfach nicht drin neben Operations, Kunden, Lieferung."
>
> "Content-Factory dreht das Problem um: Du befüllst 1× im Monat eine Themen-Queue. Jeden Morgen läuft der Workflow, produziert einen plattformspezifischen Draft, du brauchst 5 Minuten Review."
>
> "Wichtig: Wir veröffentlichen **nichts automatisch.** Du behältst die Kontrolle, weil LinkedIn 2026 ungefilterten KI-Content systematisch abstraft. Aber: 15 Minuten/Tag statt 4 Stunden für täglichen Output."
>
> "Einmal kaufen. Setup in 60 Min. Skaliert mit deiner Brand."
