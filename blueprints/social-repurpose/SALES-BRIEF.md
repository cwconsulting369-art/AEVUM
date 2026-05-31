# Social-Repurpose — Sales-Brief

**Blueprint:** social-repurpose
**Tier:** Blueprint (DIY)
**Preis:** Siehe `apps/web/public/pricing` (€-Range nach Pricing-Model)
**Sales-Ready seit:** 2026-05-30

---

## In einem Satz

Ein Long-Form-Asset (Blogartikel oder Video-Transkript) durchläuft einen KI-Repurpose-Workflow und wird automatisch zu 5+ plattformspezifischen Posts (1× LinkedIn, 2× X/Twitter, 1× Instagram-Caption, 1× LinkedIn-Carousel-Outline) im eigenen Brand-Voice — mit Plattform-Limit-Check und Freigabe-Digest per Mail, statt blind zu posten.

---

## Wer das braucht

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur** (5–30 MA, AG) | Content wird für sich und Kunden produziert, aber Distribution über alle Kanäle ist manuelle Fleißarbeit, frisst billable Stunden, wird inkonsistent gemacht | 1 Asset → 5 Posts pro Kanal autonom. Als Service whitelabel-weiterverkaufbar (Customer-Zero-Logik: erst für sich, dann pro Kunde) |
| **Personal Brand** (Coach/Berater/Solo, PB) | Schreibt unregelmäßig lang, postet noch unregelmäßiger. Kein Team, keine Zeit, keine Disziplin für täglich Multi-Channel | Schreibt 1× lang → bekommt 5 brand-konforme Entwürfe → gibt in 2 Min frei. Distribution hängt nicht mehr an Tagesform |
| **Mittelstand / B2B-SaaS** (10–100 MA, FI) | Marketing produziert Blog/Webinare, Social macht der Praktikant „mit". Markenauftritt zerfasert, Tonalität schwankt pro Kanal | Standardisierter Brand-Voice via Prompt-Config, Freigabe-Workflow für Marketing-Lead, reproduzierbare Qualität |

---

## Was Customer bekommt

1. **n8n-Workflow (JSON-Export)** — 15 Nodes: Schedule- + optionaler Webhook-Trigger, Brand-Config-Set, CMS-Fetch, Bereinigungs-Code, OpenRouter-Repurpose, Parse/Split-Code, Limit-Check-IF, Draft-Store-HTTP, Merge + Aggregate, Digest-Builder, Freigabe-Mail, kompletter Error-Pfad (Code + Alert-Mail)
2. **5-Posts-Repurpose-Logik** — 1× LinkedIn-Text, 2× Tweets (Hook + Listicle), 1× Instagram-Caption, 1× LinkedIn-Carousel-Outline — alle aus EINEM LLM-Call (kosteneffizient)
3. **Brand-Voice-Engine** (OpenRouter) — Tonalität, Zielgruppe, CTA als editierbare Config; harte Anti-Halluzinations-Regeln im Prompt
4. **Plattform-Limit-Validierung** — jeder Post wird gegen LinkedIn/X/Instagram-Zeichenlimit geprüft, Überschreitungen als `needs_review` markiert statt stillschweigend abgeschnitten
5. **Freigabe-Digest** — HTML-Mail mit allen Posts, Status-Flags, Quell-Link. Bewusst kein Auto-Posten (Marken-Schutz)
6. **Draft-Store-Anbindung** — Airtable/Notion/Supabase-fertiger HTTP-Node mit Schema-Vorlage
7. **Error-Handling** — separater Fehler-Pfad mit Stage-Identifikation + Alert-Mail (kein halber Müll bei API-Ausfall)
8. **DSGVO-Pack** — Datenfluss-Analyse, Art. 6 lit. f, Vendor-DPA-Übersicht, EU-AI-Act-Transparenz-Pflicht für KI-Content
9. **Security-Risk-Review** — 14 Risks, OpenRouter-Token-Hygiene, Prompt-Injection, Brand-Schaden bei Auto-Post
10. **Install-Guide** — 10 Schritte, CMS-Feld-Mapping, Draft-Store-Setup, in 45-75 Min einsatzbereit
11. **Mermaid-Diagramm** — Shop-taugliche Visualisierung des Flows für Customer-Verständnis

---

## Mehrwert (konkret)

**Vorher:**
- Long-Form-Asset wird veröffentlicht → 5% der möglichen Reichweite (nur Blog-Leser)
- Repurpose manuell: 60-90 Min/Asset durch eine Person
- Wird bei Stress vergessen → Distribution unzuverlässig
- Tonalität schwankt je nachdem wer postet

**Nachher:**
- Jedes Asset wird in Minuten zu 5 Entwürfen, automatisch beim Veröffentlichen/morgens
- Repurpose-Zeit: von 60-90 Min auf ~2 Min Freigabe
- Konsistenter Brand-Voice über alle Kanäle
- Distribution passiert immer, unabhängig von Tagesform

**ROI-Schätzung (Personal Brand, 1 Asset/Woche):**
- Time-Save: ~70 Min/Asset → ~5h/Monat
- Bei Stundensatz €80-150 (Coach/Berater) → €400-750/Mo Opportunitätskosten gespart
- Reichweiten-Lift schwer zu beziffern, aber: 5 Posts statt 0 = real existierende vs. nicht-existente Social-Präsenz
- Tool-Kosten ~€10-40/Mo → Pay-Back im ersten Monat

**ROI-Schätzung (Agentur, 1 Asset/Werktag × 3 Kunden):**
- ~60 Posts/Woche statt manueller Fleißarbeit
- Repurpose als Retainer-Leistung weiterverkaufbar (€300-800/Kunde/Mo realistisch)

**Realistic-Caveat:** Das Blueprint verteilt und verdichtet — es erfindet keine Qualität. Schwaches Long-Form = schwache Posts. Der Brand-Voice-Prompt braucht 2-3 Iterationen, bis er sitzt. Und: Freigabe bleibt menschlich, das ist kein „schalt ein und vergiss".

---

## Pricing-Logic

| Variante | Was | Preis-Range |
|---|---|---|
| **Blueprint-Only** | JSON + Docs + Install-Guide + Diagramm | €X (siehe Pricing-Page) |
| **Done-for-You** | Wir installieren + Brand-Voice-Prompt-Engineering (3-5 Iterationen) + CMS-Anbindung + Draft-Store-Setup + erster Live-Lauf | €X × 2.5 |
| **Done-with-You** | Setup gemeinsam, Customer lernt Prompt-Tuning + Feld-Mapping + Plattform-Optimierung | €X × 1.75 |

→ Conversion-Pfad zu Tier S/M Audit wenn Customer „ich brauche eine ganze Content-Maschine, nicht nur Repurpose" → wird Content-Factory-Anbindung (Idee → Long-Form → Repurpose → Distribution).

---

## Voraussetzungen Customer

- n8n laufend (Cloud-EU €20/Mo oder Self-Hosted)
- OpenRouter-Account + API-Key (~€2-8/Mo bei 1 Asset/Werktag)
- Long-Form-Quelle mit API/Feed (WordPress/Ghost/Webflow CMS-API oder RSS-to-JSON) — ODER manueller Text-Input
- Draft-Store (Airtable Free / Notion / Supabase)
- SMTP / Mail-Provider für Digest + Alerts (eigene Domain, kein Freemail)
- **Definierter Brand-Voice** — 2-3 Sätze Tonalität. Wer den nicht hat, muss ihn erst definieren (DFY macht das)

**Total monatliche Tool-Kosten:** €10–60 (n8n + OpenRouter + Draft-Store + Mail).

---

## Nicht-Ziele (explizit)

- ❌ Auto-Posten auf Social-Plattformen (bewusst nicht im Default — Marken-Risiko; DFY-Addon via Buffer/Ayrshare)
- ❌ Content-Generierung aus dem Nichts (braucht ein Long-Form-Asset als Input)
- ❌ Video-/Audio-Transkription (erwartet fertigen Text; Whisper-Vorstep separat)
- ❌ Bild-/Carousel-Grafik-Rendering (liefert Slide-Outline als Text, nicht fertige Grafik)
- ❌ Engagement-/Performance-Analytics (liefert Drafts, kein Reporting — siehe Reporting-Dashboard-Blueprint)
- ❌ Echte Multi-Language-Ausspielung (1 Asset → DE+EN parallel) — Phase 2
- ❌ A/B-Testing von Hook-Varianten — Phase 2

---

## Upsell-Pfade

| Customer-Frage | Next-Step |
|---|---|
| „Woher kommt überhaupt mein Long-Form-Content?" | → Content-Factory Blueprint (Idee → Outline → Draft) |
| „Kann das auch automatisch posten?" | → DFY-Addon: Buffer/Ayrshare-Anbindung mit Approval-Gate |
| „Ich will sehen welcher Post performt" | → Reporting-Dashboard Blueprint (Social-Metrics-Pull) |
| „Die Posts klingen noch nicht ganz wie ich" | → Audit S (Brand-Voice-Engineering mit Customer-Voice-Samples) |
| „Ich will DE + EN parallel" | → Audit M (Multi-Language-Repurpose-Architektur) |
| „Aus dem Video soll auch Text kommen" | → Meeting-Summarizer / Transkriptions-Vorstep-Blueprint |

---

## Conversion-Story (Brief für Sales-Page)

> „Du hast diese Woche einen richtig guten Artikel geschrieben. Er liegt jetzt im Blog. Auf LinkedIn? Nichts. Auf X? Nichts. Instagram? Existiert dein Account überhaupt noch."
>
> „Social-Repurpose nimmt dein Asset, dreht es in 5 plattformfertige Posts in deinem Tonfall — LinkedIn-Post, zwei Tweets, Instagram-Caption, Carousel-Outline — prüft jede Plattform-Längengrenze und schickt dir alles als Freigabe-Mail."
>
> „Du klickst durch, gibst frei, fertig. Aus 90 Minuten Repurpose-Arbeit werden 2 Minuten. Dein bestes Content-Asset bekommt endlich die Reichweite, die es verdient — und deine Marke klingt überall gleich."
