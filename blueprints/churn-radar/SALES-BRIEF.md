# Churn-Radar — Sales-Brief

**Blueprint:** churn-radar
**Tier:** Blueprint (DIY)
**Preis:** Siehe `apps/web/public/pricing` (€-Range nach Pricing-Model)
**Sales-Ready seit:** 2026-05-30

---

## In einem Satz

Churn-Radar scannt täglich deine aktive Kundenbasis, berechnet pro Kunde einen erklärbaren Churn-Score aus echten Aktivitäts-Signalen (Login-Inaktivität, Nutzungs-Einbruch, Zahlungsausfälle, Support-Frust, Feature-Adoption) und löst bei Risiko automatisch eine KI-personalisierte Retention-Mail an den Kunden **plus** einen Slack-Alert ans Customer-Success-Team aus — inklusive Audit-Log und Fehler-Eskalation.

---

## Wer das braucht

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur / SaaS-Studio** (5–30 MA, AG) | Retainer und Subscriptions laufen "still" aus, niemand merkt es bis zur Kündigung, kein systematisches Account-Health | Tägliches Scoring über alle Accounts, CS bekommt nur die Risiko-Fälle, Retention läuft teil-automatisch |
| **Personal Brand / Solo-SaaS** (PB) | Merkt Churn erst auf der Stripe-Abrechnung, keine Zeit für manuelles Account-Watching | Vollautomatischer Frühwarn-Radar + Retention-Mail ohne tägliche Handarbeit |
| **Mittelstand B2B / Subscription** (10–100 MA, FI) | CS reagiert reaktiv statt proaktiv, kein Daten-getriebenes Eingreifen, kein Management-Reporting zu Churn-Risiko | MRR-gewichtete Alerts, Score-Priorisierung, Audit-Trail für Reporting + QBRs |

---

## Was Customer bekommt

1. **n8n-Workflow (JSON-Export)** — fertig verdrahteter Workflow mit 14 Nodes (Schedule-Trigger, Config-Set, 2× Postgres, 2× Code, IF-Triage, OpenRouter-HTTP, Merge, Retention-Email, Slack-Alert, NoOp, Error-Email, Sticky-Note)
2. **Transparenter Churn-Score** — 5-Faktoren-Heuristik (Login-Inaktivität, Nutzungs-Delta, Zahlungsausfälle, Tickets, Feature-Adoption), voll editierbar, keine Black-Box
3. **Risk-Bänder** — OK / WATCH / AT_RISK / CRITICAL für Priorisierung
4. **KI-Retention-Engine** (OpenRouter) — pro Risiko-Kunde eine kurze Risiko-Einschätzung + maßgeschneiderten Mail-Text (faktentreu, kein Marketing-Geschwurbel)
5. **Doppel-Reaktion** — automatische Retention-Mail an den Kunden + Slack-Alert ans Team, parallel
6. **Audit-Log** — `churn_events`-Tabelle mit Doppel-Alert-Schutz (ON CONFLICT), Basis für Reporting
7. **Error-Pfad** — DB-/KI-Fehler eskalieren als Ops-Mail statt still zu sterben
8. **Datenmodell-Spec** — Tabellen-Schema + Mapping-Anleitung für eigene DB oder Stripe/PostHog/Intercom-Quellen
9. **Install-Guide** — Schritt-für-Schritt, inkl. Mail-Review-Gate und Test-Account-Verfahren
10. **Security-Risk-Review** — DB-Zugriff, PII-an-LLM, Auto-Mail-Risiko, Alert-Fatigue, Token-Hygiene
11. **DSGVO-Check** — Bestandskunden-Rechtsgrundlage (Art. 6 lit. b/f), DPA-Übersicht, EU-AI-Act-Einordnung

---

## Mehrwert (konkret)

**Vorher:**
- Churn wird erst auf der Abrechnung sichtbar — zu spät zum Eingreifen
- Kein systematisches Health-Monitoring, CS arbeitet nach Bauchgefühl
- Risiko-Kunden werden gleich behandelt wie gesunde
- Retention-Versuche (wenn überhaupt) sind generisch und ad-hoc

**Nachher:**
- Risiko sichtbar **Wochen** vor der Kündigung
- CS bekommt täglich eine priorisierte, MRR-gewichtete Risiko-Liste
- Jeder Risiko-Kunde bekommt automatisch eine relevante Retention-Mail
- Lückenloser Audit-Trail für Management + QBR-Reporting

**ROI-Schätzung (SaaS, 300 aktive Accounts, Ø MRR €120):**
- Aktive Kundenbasis-MRR: ~€36.000/Mo
- Typische monatliche Churn-Rate ohne Intervention: 4–6 % → €1.440–2.160 MRR/Mo verloren
- Realistische Rückgewinnung durch frühe Intervention: 15–30 % der Risiko-Fälle
- Konservativ: 1 zurückgewonnener Account/Mo (€120 MRR × 12 = €1.440 LTV-Erhalt) → Blueprint bezahlt sich im ersten Monat
- CS-Zeitersparnis: kein manuelles Account-Durchklicken mehr → ~6–10h/Mo

**Realistic-Caveat:** Churn-Radar findet Risiko und triggert Reaktion — aber es ersetzt kein echtes Customer-Success. Wenn das Produkt nicht liefert, rettet auch die beste Retention-Mail den Kunden nicht. Der Blueprint liefert das Frühwarnsystem; die Beziehungsarbeit macht der Customer.

---

## Pricing-Logic

| Variante | Was | Preis-Range |
|---|---|---|
| **Blueprint-Only** | JSON + Docs + Install-Guide + Datenmodell-Spec | €X (siehe Pricing-Page) |
| **Done-for-You** | Wir mappen deine Datenquellen, kalibrieren den Score, schreiben Retention-Templates, gehen live | €X × 2.5 |
| **Done-with-You** | Setup gemeinsam, Customer lernt Score-Tuning + Datenquellen-Anbindung | €X × 1.75 |

→ Conversion-Pfad zu Audit M: Customer will echtes ML-Churn-Prediction (Survival-Analysis / XGBoost auf historischen Daten) oder Multi-Touch-Retention-Sequenzen statt Single-Mail.

---

## Voraussetzungen Customer

- n8n laufend (Cloud-EU €20/Mo oder Self-Hosted Hetzner/Scaleway)
- Postgres mit Kunden- + Aktivitätsdaten **ODER** Analytics-API (Stripe/PostHog/Mixpanel/Intercom)
- OpenRouter-Account + API-Key (~€2–8/Mo bei 300 Accounts, da nur Risiko-Fälle die KI treffen)
- SMTP / Resend / Postmark für Retention-Mail-Versand
- Slack Workspace + Bot-Token (oder Email/Telegram als Alert-Alternative)
- **Tracking der Aktivitäts-Signale im Produkt** — wenn `last_login_at` / Session-Counts nicht existieren, vorher instrumentieren

**Total monatliche Tool-Kosten:** €25–55 (n8n + OpenRouter + Mail-Provider; DB meist vorhanden).

---

## Nicht-Ziele (explizit)

- ❌ ML-basierte Churn-Prediction (Survival-Modell / Gradient-Boosting) — das ist Audit M, hier ist es eine transparente Heuristik
- ❌ Echtzeit-/In-App-Trigger (Batch täglich, kein Event-Streaming)
- ❌ Multi-Touch-Retention-Drip (aktuell Single-Mail pro Erkennung; Sequenz = Phase 2)
- ❌ Reply-Handling auf Retention-Mails (Antworten landen im normalen Postfach)
- ❌ Automatische Rabatt-/Gutschein-Vergabe (bewusst manuell — Geld-Entscheidung)
- ❌ Datenquellen-Instrumentierung im Produkt (Customer muss Events selbst tracken)
- ❌ B2C-Massen-Reaktivierung (Blueprint ist für aktive Bestandskunden, nicht Cold-Win-Back)

---

## Upsell-Pfade

| Customer-Frage | Next-Step |
|---|---|
| "Der Score trifft nicht gut genug" | → Audit M: ML-Churn-Modell auf historischen Daten trainiert |
| "Ich will eine ganze Retention-Sequenz, nicht eine Mail" | → DfY-Variante mit Multi-Touch-Drip (Mail 1 → Call-Offer → Rabatt-Angebot) |
| "Meine Daten liegen in Stripe + PostHog + Intercom verteilt" | → DfY: Multi-Source-Daten-Pipeline + Unified-Customer-View |
| "Ich brauche ein Dashboard, nicht nur Slack-Alerts" | → Churn-Dashboard-Addon (Risiko-Kohorten, MRR-at-Risk-Trend) |
| "Rabatte/Save-Offers automatisch vergeben" | → Audit M: Stripe-Coupon-Automation mit Approval-Gate |
| "Health-Score auch im Onboarding nutzen" | → Onboarding-Health-Blueprint (Future) |

---

## Conversion-Story (Brief für Sales-Page)

> "Dein bester Kunde hat sich seit 3 Wochen nicht eingeloggt. Die letzte Rechnung ist geplatzt. Drei Support-Tickets sind offen. Und du? Erfährst davon, wenn die Kündigung im Postfach liegt."
>
> "Churn-Radar sieht das Risiko Wochen vorher. Es scort jeden aktiven Kunden täglich, schickt dir die Gefährdeten als priorisierten Slack-Alert — und feuert automatisch eine relevante, KI-getextete Retention-Mail an den Kunden, bevor er weg ist."
>
> "Transparenter Score (keine Black-Box), DSGVO-konform für Bestandskunden, Audit-Log für dein Reporting. Einmal eingerichtet, läuft es jeden Morgen — und du verlierst keinen Kunden mehr im Stillen."
