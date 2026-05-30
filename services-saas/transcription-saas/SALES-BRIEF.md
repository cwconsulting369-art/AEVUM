# SALES-BRIEF — Transcription-SaaS

Self-serve, no-call, Stripe-Checkout. Cash sofort, kein Sales-Gespräch nötig (AEVUM-Cash-Modell).

---

## Positionierung (1 Satz)

**"Lade jede Aufnahme hoch — bekomme in Minuten ein durchsuchbares Transkript mit Sprechertrennung, Zusammenfassung und Export in jedes Format. EU-gehostet, DSGVO-konform, ohne Seat-Zwang."**

---

## Pricing-Tiers

Hybrid: günstige Einstiegs-Subs für Stamm-Nutzer + Pay-as-you-go-Credits für Gelegenheits-Nutzer. Beides 100 % self-serve über Stripe-Checkout. Preise in EUR, Kleinunternehmer §19 (keine USt.-Ausweisung).

### Credit-Packs (Pay-as-you-go, kein Abo)
| Pack | Preis | Inkludiert | Effektiv/Min |
|---|---|---|---|
| **Starter-Pack** | **27 €** | 300 Min (5 h) | ~0,09 €/Min |
| **Pro-Pack** | **67 €** | 900 Min (15 h) | ~0,074 €/Min |
| **Power-Pack** | **97 €** | 1.500 Min (25 h) | ~0,065 €/Min |

> Credits verfallen 12 Monate. Kein Abo-Zwang — ideal für Erst-Conversion und unregelmäßige Nutzer.

### Abos (monatlich, kündbar, self-serve)
| Plan | Preis/Mo | Min/Mo inkl. | Topup | Zielgruppe |
|---|---|---|---|---|
| **Solo** | **27 €** | 600 Min (10 h) | 0,08 €/Min | Coach, Berater, Solo |
| **Creator** | **57 €** | 1.500 Min (25 h) + Branding-Export + SRT/VTT Bulk | 0,06 €/Min | Podcaster, Content |
| **Team** | **149 €** | 5.000 Min (83 h) + 3 Sitze + Workspaces | 0,05 €/Min | Agenturen, Teams |
| **EU-Compliance** | **ab 199 €** | EU-only-Processing (self-host), AVV signiert, Auto-Löschung-SLA, DPA-Paket | nach Volumen | Anwalt, Arzt, Behörde, Enterprise-DACH |

**Free-Trial:** 30 Min einmalig kostenlos bei Signup (ohne Karte) → Conversion-Hebel.

### Marge-Sanity-Check (echte Daten)
COGS managed (Deepgram Nova-3 batch ~0,0043 $/Min ≈ ~0,004 €/Min) + Summary-LLM (~0,01–0,02 €/Min) + Storage marginal → Gesamt-COGS grob **~0,02–0,03 €/Min**. Verkaufspreis 0,05–0,09 €/Min → **Bruttomarge ~60–75 %**, vor Stripe-Fees. EU-only-Modus (eigene GPU) hat höhere Fixkosten → erst ab Volumen/Compliance-Premium rentabel.

---

## Mehrwert / ROI (Conversion-Argument)

**Zeit ist das Verkaufsargument.** Manuelle Transkription kostet das 4–6-fache der Audiolänge.

- 1 h Interview manuell tippen = **4–6 h Arbeit**. Mit dem SaaS: ~Minuten + 15 Min Korrektur.
- Bei 30 €/h Eigen-Stundensatz spart 1 transkribierte Stunde **~120–180 € Zeitwert** — gegen **~2,40–5,40 €** Tool-Kosten.
- **ROI > 20×** schon beim ersten ernsthaften Use-Case.

**Gegen die Konkurrenz (recherchiert):**
- Rev AI: 0,25 €/Min → wir 0,05–0,09 €/Min = **3–5× günstiger pro Minute**.
- Trint: ab ~80 $/Sitz/Mo, kein PAYG → wir self-serve ab 27 € ohne Seat.
- Otter: Minuten-Caps + US-Cloud → wir ohne harte Caps (Topup) + EU.
- Sonix: ~0,167 €/Min PAYG (US) → wir günstiger + DSGVO-first.

---

## Conversion-Story (Funnel)

1. **Hook (Landing):** "Schluss mit Mitschreiben. Lade die Aufnahme hoch — fertig." Demo-Video + ein echtes Beispieltranskript sichtbar.
2. **Free-Trial (30 Min, ohne Karte):** Nutzer lädt erste echte Datei hoch, sieht Diarization + Summary → Aha-Moment.
3. **Paywall am Wert:** nach Trial-Verbrauch oder beim Export → Credit-Pack 27 € (niedrigste Reibung) oder Abo.
4. **Self-serve Upgrade:** wer regelmäßig nutzt, sieht "du hast diesen Monat X Min — mit Solo (27 €) sparst du Y" → Abo-Push im Dashboard.
5. **EU-Compliance-Upsell:** Anwälte/Ärzte/Behörden → AVV + EU-only als sichtbarer Premium-Pfad (199 €+), self-serve startbar, Lennox-Outreach per Mail (keine Calls).

**Anti-Reibung:** Keine Demo-Calls, keine Sales-Gespräche. Stripe-Checkout + Magic-Link-Login. Alles async.

**Ehrlichkeits-Brand:** Realistische Accuracy-Kommunikation (kein "99,9 %"-Fake), klare DSGVO-Aussagen nur was im Code wirklich gilt — passt zum AEVUM-Anti-Fake-it-Standard.

---

## Sources

- Sonix — Rev Pricing 2026 (0,25 €/Min AI, Seat-Preise): https://sonix.ai/resources/rev-pricing/
- Sonix — Trint Pricing 2026 (~80 $/Sitz, kein PAYG): https://sonix.ai/resources/trint-pricing/
- BrassTranscripts — Otter.ai Pricing 2026: https://brasstranscripts.com/blog/otter-ai-pricing-2025-subscription-vs-usage-based
- Deepgram — STT Pricing (Nova-3 ~0,0043 $/Min COGS-Basis): https://deepgram.com/learn/best-speech-to-text-apis-2026
- AssemblyAI — Per-Minute Pricing-Vergleich: https://www.assemblyai.com/blog/speech-to-text-api-pricing
