# Lead-Qualifier Pro — Sales-Brief

**Blueprint:** lead-qualifier-pro
**Tier:** Blueprint (DIY)
**Preis:** Siehe `apps/web/public/pricing` (€-Range nach Pricing-Model)
**Sales-Ready seit:** 2026-05-25

---

## In einem Satz

Eingehende Leads werden automatisch nach BANT+ bewertet (Budget/Authority/Need/Timing + Größe/Branche/Engagement), 0–100 gescored und in drei Routing-Pfade verteilt: Hot/Warm/Cold. Funktioniert mit jedem Formular-Tool und CRM.

---

## Wer das braucht

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur** (5–30 MA) | Lead-Inflation, Team verbrennt Zeit mit unqualifizierten Anfragen | Top-20% direkt sichtbar, Rest automatisch nurtured |
| **Personal Brand** (Coach/Berater) | DMs + Form-Anfragen ohne Triage, "Spam-vs-Gold"-Problem | Hot-Lead-Alert direkt aufs Handy, Cold-Leads in Newsletter-Loop |
| **B2B-Service** (10–100 MA) | Sales-Team priorisiert falsch, Hot-Leads warten zu lang | Score-basiertes Routing, SLA für Top-Leads automatisch |

---

## Was Customer bekommt

1. **n8n-Workflow (JSON-Export)** — fertig konfigurierter Workflow mit 11 Nodes
2. **BANT+-Scoring-Engine** (JS) — anpassbar in 30 Sekunden (Gewichtungen, Schwellenwerte, Ziel-Branchen)
3. **3-Pfad-Routing** — Hot (>70) / Warm (40–70) / Cold (<40), individuell konfigurierbar
4. **CRM-Anbindung** — Airtable / HubSpot / Notion / Custom-Webhook
5. **E-Mail-Templates** — 3 vorbereitete Szenarien (Hot-Alert, Lead-Bestätigung, Cold-Nurture)
6. **Telegram-Hot-Lead-Alert** (optional) — Sofort-Benachrichtigung mit Score-Breakdown
7. **DSGVO-Pack** — Konfigurations-Checkliste, Vendor-DPA-Übersicht, Löschfristen-Logik
8. **Install-Guide** — Schritt-für-Schritt in <60 Min einsatzbereit
9. **Security-Risk-Review** — bekannte Risiken + Mitigations (Webhook-Schutz, Rate-Limit, PII-Handling)

---

## Mehrwert (konkret)

**Vorher:**
- Lead kommt → Sales-MA liest → Score nach Bauchgefühl → manuell in CRM → Follow-up vergessen
- ~15 min pro Lead × 30 Leads/Wo = 7,5h/Wo Triage-Aufwand
- Hot-Leads kühlen ab (Avg-Response-Time 8h+)

**Nachher:**
- Lead kommt → Score in <2 Sek → Hot-Alert in TG → CRM-Entry mit Breakdown → Auto-Nurture für Cold
- Sales-MA sieht: "5 Hot, 12 Warm, 13 Cold" → priorisiert sofort
- Hot-Response unter 1h möglich

**ROI-Schätzung (Mittel-Agentur, 30 Leads/Wo):**
- Time-Save: ~6h/Wo MA-Zeit × 4 Wo = 24h/Mo
- Bei MA-Kosten €50/h fully-loaded → €1.200/Mo
- Plus Conversion-Lift durch schnellere Hot-Response (10-30%) → schwer zu quantifizieren, aber real

---

## Pricing-Logic

| Variante | Was | Preis-Range |
|---|---|---|
| **Blueprint-Only** | JSON + Docs + Install-Guide | €X (siehe Pricing-Page) |
| **Done-for-You** | Wir installieren + konfigurieren auf deine Tools | €X × 2 |
| **Done-with-You** | Setup gemeinsam, du lernst dabei | €X × 1.5 |

→ Conversion-Pfad zu Tier S/M Audit wenn Customer "noch mehr Automation" will.

---

## Voraussetzungen Customer

- n8n laufend (Cloud €20/Mo oder Self-Hosted)
- Formular-Tool (Typeform/Tally/eigenes)
- CRM oder Airtable-Base
- E-Mail-Versand (Resend €0/Mo bis 100 Mails/Tag, SMTP, oder Mailchimp)
- Optional: Telegram-Bot-Token

**Total monatliche Tool-Kosten:** €20–60 (abhängig vom Stack).

---

## Nicht-Ziele (explizit)

- ❌ Ersatz für vollwertiges CRM
- ❌ AI-Lead-Generation (das ist ein anderes Blueprint)
- ❌ Multi-Channel-Aggregation (LinkedIn + Email + DM zusammen — Future-Blueprint)
- ❌ Lead-Enrichment (Company-Data aus externen APIs — kommt separat)

---

## Upsell-Pfade

| Customer-Frage | Next-Step |
|---|---|
| "Wie bekomme ich überhaupt mehr Leads?" | → Cold-Outreach-System Blueprint |
| "Kann der Score smart werden über Zeit?" | → Audit M (Custom-AI-Layer + Hermes-Pattern) |
| "Wir brauchen vollständige Lead-Pipeline" | → AI-Lead-Engine DFY |
| "Wir haben spezifische Branchen-Logik" | → Audit S (Custom-BANT-Layer) |

---

## Conversion-Story (Brief für Sales-Page)

> "Du sammelst Leads. Dein Team bewertet sie nach Bauchgefühl. Die 5 Hot-Leads des Monats versinken im 30er-Stapel von Cold-Anfragen. Du verlierst Deals weil deine Response-Time zu lang ist."
>
> "Lead-Qualifier Pro löst das in unter 60 Minuten Setup. BANT+-Scoring, 3-Pfad-Routing, Hot-Lead-Alert aufs Handy. Funktioniert mit jedem Formular und CRM."
>
> "Einmal kaufen. Beliebig anpassen. Skaliert mit deinem Lead-Volumen."
