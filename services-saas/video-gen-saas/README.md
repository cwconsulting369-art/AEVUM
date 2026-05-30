# Video-Generation-SaaS (slug: `video-gen-saas`)

> AEVUM SaaS-Produktpaket — verkaufsreife Spezifikation. Konzept: **Script/Text → fertiges Marketing-Video** (Avatar + B-Roll + Voiceover), self-serve, brandfähig.

---

## Was es löst

Marketing-Teams, Solo-Creator, Agenturen und KMU brauchen ständig **Video-Content** (Ads, Social-Clips, Product-Explainer, Onboarding) — aber:

- Klassische Video-Produktion = teuer, langsam, nicht skalierbar (Dreh, Schnitt, Sprecher).
- Bestehende AI-Tools sind entweder **zu generisch** (reines Text→Clip ohne Brand-Konsistenz), **zu teuer für KMU** (Enterprise-Lock-in à la Synthesia), oder **zu technisch** (rohe API ohne Workflow).

Dieses SaaS macht aus **einem Script (oder Stichworten) in einem Durchlauf ein fertiges, gebrandetes Video**: Avatar/Voiceover spricht den Text, B-Roll wird passend generiert/eingespielt, Captions + Brand-Kit (Logo, Farben, Intro/Outro) automatisch. Output: rendering-fertiges MP4, querformat + hochkant.

---

## Zielgruppe (ICP)

| Segment | Schmerz | Warum dieses Tool |
|---|---|---|
| **Solo-Creator / Coach / Personal Brand** | will täglich posten, hat kein Team | Script rein → 10 Hochkant-Clips raus |
| **KMU-Marketing (1-5 Personen)** | braucht Ads/Explainer ohne Agenturbudget | self-serve, Brand-Kit, kein Dreh |
| **Performance-/Social-Media-Agenturen** | viele Kunden, viel Volumen, eng kalkuliert | Multi-Brand-Workspaces, Bulk, API |
| **SaaS / E-Commerce** | Product-Videos in Masse, mehrsprachig | Templating + Voiceover-Translation |

Primär-ICP für AEVUM-Go-to-Market: **Agentur + KMU-Marketing** (Volumen + Wiederholkauf, kein One-Shot).

---

## Kern-Features

**MVP (verkaufbar ab Tag 1):**
1. **Script→Video Generator** — Text-Editor oder „Stichworte → AI schreibt Script".
2. **AI-Avatar + Voiceover** — sprechender Presenter (HeyGen/Avatar-API) ODER reine Voiceover-Spur (ElevenLabs) über B-Roll.
3. **B-Roll-Engine** — generative Clips (Kling/Veo/Runway) ODER Stock-Footage-Fallback, scene-by-scene aus dem Script.
4. **Auto-Composition** — Captions/Untertitel, Brand-Kit (Logo, Farben, Font, Intro/Outro), Format-Presets (9:16 / 16:9 / 1:1).
5. **Render & Export** — programmatisches Compositing (Creatomate/Shotstack), MP4-Download + Share-Link.
6. **Workspace + Credits** — Team-Workspace, Credit-Wallet, Render-History, Stripe-Billing.

**Phase 2:**
- **Voice/Video-Translation** (1 Script → N Sprachen mit Lip-Sync).
- **Bulk/Batch** (CSV → 100 Videos, z.B. Produktkatalog).
- **Brand-Avatar-Cloning** (eigener Avatar/eigene Stimme, opt-in + Consent-Gate).
- **API + Zapier/Make-Integration** (Headless für Agenturen).
- **Template-Marketplace** (vorgefertigte Video-Vorlagen je Branche).

---

## USP vs. Markt (recherchiert)

Der AI-Video-Markt lag 2024 bei ~3,86 Mrd. USD, Projektion ~42 Mrd. bis 2033 — getrieben von Tools wie HeyGen (~95-100 Mio. ARR Ende 2025) und Synthesia (>90% der Fortune 100). Recherchierter Wettbewerb:

| Anbieter | Stärke | Schwäche / Lücke | Pricing-Anker |
|---|---|---|---|
| **HeyGen** | Beste Avatar-Qualität, 175+ Sprachen, „Video Agent" (Prompt→fertig), API ab $5 | Avatar-zentriert; teuer bei Volumen; B-Roll/generative Scenes schwach | ab $24/mo |
| **Synthesia** | Enterprise/Training, Compliance, Governance | Enterprise-Lock-in, Stock-Avatars, nicht für schnellen Social-Content | Enterprise-lastig |
| **Runway (Gen-4.5)** | Beste kreative generative Scenes ($0,15/sec) | Kein Avatar/Script-Workflow, reines Generator-Tool | ab ~$12/mo |
| **Sora 2 / Veo 3.1 / Kling 3.0** | Rohe generative T2V-Modelle, top Bildqualität | Keine Voiceover/Brand/Composition-Schicht, reine Modelle | API $0,10–0,75/sec |
| **Creatomate / Shotstack** | JSON→Video Render-Infra, Templating | Kein AI-Generator, nur Compositing | ab $41 / $49/mo |
| **Colossyan / Veed / Arcade** | LMS / Timeline-Editor / SaaS-Marketing | jeweils Single-Use-Case | $20–50/mo |

**AEVUM-USP — die Lücke dazwischen:**
1. **Orchestrierungs-Layer, nicht Einzeltool.** Kombiniert Avatar (HeyGen) + Voiceover (ElevenLabs) + generatives B-Roll (Kling/Veo) + Compositing (Creatomate) in **einem self-serve Flow**. Kein Wettbewerber deckt die ganze Kette gebrandet + günstig ab.
2. **KMU/Agentur-Pricing statt Enterprise.** Low-Ticket-Einstieg (€27-97) wo HeyGen/Synthesia bei höheren Tiers oder Enterprise-Sales starten.
3. **Brand-Konsistenz first.** Brand-Kit-Engine (Logo/Farben/Intro/Outro/Caption-Style) — generative Tools liefern „schöne Clips", aber keinen wiedererkennbaren Marken-Look.
4. **Model-agnostisch.** Provider-Abstraktion → günstigstes/bestes Modell pro Job (Kling $0,10/sec vs. Veo $0,75/sec), kein Vendor-Lock, Marge steuerbar.
5. **EU-/DSGVO-/AI-Act-ready by design** (Art. 50 Marking ab 08/2026) — Vertrauensvorteil für EU-Kunden vs. US-Tools. Siehe `SECURITY-DSGVO.md`.

---

## Dokumente in diesem Paket

- `SPEC.md` — technische Architektur, reale APIs/Modelle, Datenfluss, Endpoints, MVP vs Phase-2.
- `SALES-BRIEF.md` — Pricing-Tiers, ROI, Conversion-Story.
- `SECURITY-DSGVO.md` — Datenfluss, Rechtsgrundlage, Vendor-DPAs, EU-AI-Act, Risiken.
- `BUILD-PLAN.md` — Workblock-Bauplan, MVP-Reihenfolge.
