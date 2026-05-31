# Transcription-SaaS

**Slug:** `transcription-saas`
**Status:** Spezifikation (verkaufsreifes Produktpaket, noch keine lauffähige App)
**Owner:** AEVUM
**Stand:** 2026-05-30

> Allumfassende Audio/Video-Transkription mit Speaker-Diarization, KI-Summary und Multi-Format-Export. Self-serve, EU-gehostet, DSGVO-first.

---

## Was es löst

Menschen produzieren immer mehr gesprochenes Material — Meetings, Interviews, Podcasts, Calls, Vorlesungen, Sprachnachrichten — aber gesprochenes Wort ist **nicht durchsuchbar, nicht zitierbar, nicht weiterverwertbar**. Manuelle Mitschrift kostet 4-6× die Audiolänge. Klassische Transkriptions-Dienste sind entweder teuer (Rev human: ~1,99 €/Min), seat-locked (Trint ab ~80 €/Sitz/Monat) oder US-gehostet mit DSGVO-Fragezeichen.

Transcription-SaaS macht aus jeder Audio-/Videodatei in Minuten ein strukturiertes, durchsuchbares, exportierbares Dokument:

- **Wer hat was gesagt** (Speaker-Diarization + Timestamps)
- **Worum ging es** (KI-Summary, Action-Items, Kapitel, Stichworte)
- **In welchem Format** (TXT, DOCX, SRT/VTT, PDF, JSON, Notion/Markdown)

Kernversprechen: **Hochladen → 1 Klick → fertiges, geteiltes Dokument.** Kein Setup, kein Seat-Zwang, EU-Datenhaltung.

---

## Zielgruppe (ICP)

Nicht regional gebunden — digitaler Anbieter. Primäre Segmente:

| Segment | Job-to-be-done | Schmerz heute |
|---|---|---|
| **Solo-Consultants / Coaches** | Client-Calls dokumentieren, Follow-ups schreiben | Tippt mit oder vergisst Details |
| **Journalisten / Autoren / Podcaster** | Interviews zitierfähig machen, Shownotes | Stundenlanges Zurückspulen |
| **Agenturen / kleine Teams** | Meeting-Protokolle, Workshop-Doku | Niemand will Protokoll schreiben |
| **Forschende / Studierende** | Experten-Interviews, Vorlesungen | Manuelle Transkription frisst Wochen |
| **Anwälte / Mediziner (DACH)** | Diktate, Mandanten-/Patientengespräche | US-Tools DSGVO-rechtlich heikel |
| **Content-Creator** | Video → Untertitel, Repurposing | SRT-Erstellung ist Fummelarbeit |

**Beachhead:** DACH-Solo-Professionals + Content-Creator, die DSGVO-konforme EU-Datenhaltung explizit brauchen — das ist der wunde Punkt aller US-First-Anbieter.

---

## Kern-Features (MVP)

1. **Upload & Ingest** — Audio (mp3, m4a, wav, ogg) + Video (mp4, mov), Drag-&-Drop, URL-Import (YouTube/Drive Phase-2), max. Dateigröße tier-abhängig.
2. **Transkription** — Multilingual (DE/EN priorisiert, 50+ Sprachen via Whisper-Familie), Word-Level-Timestamps.
3. **Speaker-Diarization** — automatische Sprechertrennung ("Speaker 1/2/…"), manuelles Umbenennen, Speaker-Merge.
4. **KI-Summary** — TL;DR, Bullet-Summary, Action-Items, automatische Kapitel/Topics, extrahierte Stichworte.
5. **Editor** — synchronisierter Player ↔ Text (Klick auf Wort springt zur Stelle), Inline-Korrektur, Suchen & Ersetzen.
6. **Export** — TXT, DOCX, PDF, SRT, VTT, JSON, Markdown; Branding-frei oder mit eigenem Logo (höhere Tiers).
7. **Sharing** — Read-only-Link, Passwortschutz, Ablaufdatum.
8. **Account & Billing** — self-serve Signup, Stripe-Checkout, Minuten-Kontingent + Pay-as-you-go-Topup.

Details siehe [`SPEC.md`](./SPEC.md). MVP-vs-Phase-2-Schnitt ebenda + [`BUILD-PLAN.md`](./BUILD-PLAN.md).

---

## USP vs. Markt

Recherchierter Wettbewerb (Stand 2026, Quellen siehe unten):

| Anbieter | Modell | Per-Min / Preis | Schwäche, die wir angreifen |
|---|---|---|---|
| **Rev** | Seat-Sub + AI 0,25 €/Min | Essentials ~25,49 $/Sitz, Pro ~47,99 $/Sitz | Teuer pro Minute, seat-gebunden, US |
| **Otter.ai** | Sub, Minuten-Pool | Pro ~16,99 $/Mo (8,33 $ jährlich) | Minuten-Caps, US-Cloud, schwach bei DE |
| **Trint** | Seat-Sub | ab ~80 $/Sitz/Mo, kein PAYG | Hochpreisig, kein self-serve PAYG |
| **Sonix** | PAYG | ~10 $/Stunde (~0,167 €/Min) | Solide, aber US, kein DSGVO-Fokus |
| **Descript** | Sub + Editing-Suite | Feature-überladen für reine Transkription | Overkill für "nur Transkript" |

**Unsere Positionierung — drei klare Kanten:**

1. **EU/DSGVO-first als Default, nicht als Add-on.** EU-Region-Storage, AVV/DPA-Templates ready, Auto-Löschung, optionaler "EU-only-Processing"-Modus (self-hosted Whisper + pyannote auf EU-GPU). Das können die US-First-Player nicht glaubwürdig kontern.
2. **Self-serve Low-Ticket statt Seat-Zwang.** Einmalige Credit-Packs (27 €) + günstige Monatspläne (ab 27 €) — kein Sales-Call, kein Seat-Minimum. (Linie mit AEVUM-Cash-Modell: no-call, self-serve, Stripe-Checkout.)
3. **Transkript ist nur der Anfang.** Summary + Action-Items + Kapitel + Export-in-jedes-Format als integriertes Produkt, nicht als Premium-Upsell-Wall versteckt.

**Ehrlichkeits-Brand (AEVUM-Standard):** Wir behaupten keine "99,9 % Accuracy" — WER ist sprach-/audioabhängig (AssemblyAI Universal-2 ~14,5 % WER auf schwierigen Mixed-Datasets). Wir kommunizieren realistische Erwartungen + zeigen, wann menschliches Nachredigieren sinnvoll ist.

---

## Sources (recherchiert)

- Deepgram — Best Speech-to-Text APIs 2026: https://deepgram.com/learn/best-speech-to-text-apis-2026
- AssemblyAI — Speech-to-Text API Pricing: https://www.assemblyai.com/blog/speech-to-text-api-pricing
- AssemblyAI — Top speaker diarization libraries & APIs 2026: https://www.assemblyai.com/blog/top-speaker-diarization-libraries-and-apis
- pyannoteAI — Open Source vs API: https://www.pyannote.ai/blog/diarization-open-source-vs-api-best-usages-and-limitations
- Picovoice — State of Speaker Diarization 2026 (pyannote vs Falcon): https://picovoice.ai/blog/state-of-speaker-diarization/
- WhisperX (GitHub): https://github.com/m-bain/whisperx
- Sonix — Rev Pricing 2026: https://sonix.ai/resources/rev-pricing/
- Sonix — Trint Pricing 2026: https://sonix.ai/resources/trint-pricing/
- BrassTranscripts — Otter.ai Pricing 2026: https://brasstranscripts.com/blog/otter-ai-pricing-2025-subscription-vs-usage-based
- BLUESKEYE AI — Transcripts as biometric data (EU AI Act): https://www.blueskeye.com/blogs/hot-take-transcripts-are-biometric-data-according-to-the-eu-ai-act
- IAPP — Biometrics in the EU (GDPR, AI Act): https://iapp.org/news/a/biometrics-in-the-eu-navigating-the-gdpr-ai-act
- EU Commission — AI Act regulatory framework: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
