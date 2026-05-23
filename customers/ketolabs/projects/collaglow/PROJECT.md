# CollaGlow — Projekt

**Kunde:** Ketolabs / Tommy
**Produkt:** Kollagen-Supplement (Nahrungsergänzung)
**AEVUM-Scope:** KI-Betriebssystem für Marketing-Entscheidungen

---

## Business-Kontext

- **Flagship-Produkt:** CollaGlow — Kollagen + Astaxanthin + Zellschutz
- **Core-Offer:** 2+1 GRATIS Bundle (~€89,99), AOV €70–90
- **Zielgruppe:** Frauen 35–65, Anti-Aging, Menopause
- **Channels:** Meta Ads (~€70k historischer Spend), Google Ads, TikTok (20k+ Follower)
- **Email:** Klaviyo, 20k+ Abonnenten
- **Ziel Phase 1:** CHAOS → SYSTEME. Keine neuen Tools, bestehende optimieren.

---

## Agent: CollaGlow-Bot

**Name:** `collaglow-bot`
**Charakter:** Daten-fokussierter DTC-Sparring-Partner für Tommy
**Zugang:** Nur Tommy + Carlos
**Fähigkeiten Phase 1:**
- KPI-Alerts wenn Meta/Google/Klaviyo-Werte abweichen
- CollaGlow-Business-Wissen abrufbar via TG-Chat
- Tägliche Performance-Zusammenfassung

---

## KPI-Schwellen (Alerts)

| Metrik | Alert-Trigger |
|---|---|
| ROAS Meta | < 2.5 → Alert |
| CPA | > €35 → Alert |
| Klaviyo Open Rate | < 20% → Alert |
| Revenue vs. Vortag | < -30% → Alert |

*Schwellen werden nach erstem echten Daten-Pull kalibriert.*

---

## Onboarding-Checklist

- [ ] Tommy gibt TG-User-ID bekannt
- [ ] Tommy erstellt `collaglow-bot` bei BotFather → Token an Carlos
- [ ] Meta Ads API-Zugang bestätigt
- [ ] Shopify API-Zugang bestätigt
- [ ] Bot deployen + testen
- [ ] Erstes Datenpull + Dashboard live
