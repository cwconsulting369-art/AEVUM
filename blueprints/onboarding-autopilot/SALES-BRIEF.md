# Onboarding-Autopilot — Sales-Brief

**Blueprint:** onboarding-autopilot
**Tier:** Blueprint (DIY)
**Preis:** Siehe `apps/web/public/pricing` (€-Range nach Pricing-Model)
**Sales-Ready seit:** 2026-05-25

---

## In einem Satz

Jeder neue Kunde läuft ab Sekunde 1 automatisch durch dieselbe Premium-Onboarding-Sequenz: Welcome-Mail mit Kick-off-Link, CRM-Anlage, Team-Ping in Slack, Follow-up nach 3 Tagen. Ohne dass du an irgendwas denken musst.

---

## Wer das braucht

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur** (AG, 5–30 MA) | Jeder Neukunde wird anders behandelt, Onboarding dauert 14d weil PM-Zeit fehlt, Customer wartet auf "ersten Kontakt" 3d+ | Premium-Onboarding läuft in <1d. Customer fühlt sich VIP, dein Team behält Kapazität für Delivery. |
| **Personal Brand** (PB, Coach/Berater) | Vergisst Welcome-Mail/Kick-off-Link, weil zwischen Sales-Call und Delivery 4 Tage Funkstille | Welcome + Kick-off-Link + Erinnerung laufen ohne dich. Du wirkst organisiert ohne Mehraufwand. |
| **Mittelstand B2B** (FI, 10–100 MA) | Sales übergibt Kunde an Delivery, Übergabe ist Ad-Hoc, Datensatz unvollständig, jedes Mal anders | Standardisierter Onboarding-Trigger → strukturierter CRM-Record → Slack-Übergabe an Delivery-Team. Reproduzierbar. |

---

## Was Customer bekommt

1. **n8n-Workflow (JSON-Export)** — 6-Node-Workflow, fertig zu importieren
2. **Welcome-Mail-Template (HTML)** — premium-style, personalisierbar, mit Kick-off-Block + nächste-Schritte-Block
3. **Follow-up-Template (HTML)** — kurze, persönliche Check-in-Mail nach 3 Tagen
4. **CRM-Anbindung** — Airtable ODER Notion (Switch-Logik dokumentiert)
5. **Slack-Team-Ping** — Channel-Notification beim Eingang, optional
6. **Calendly-Integration** — Kick-off-Link in Welcome-Mail automatisch
7. **3 Trigger-Optionen** — Formular (Tally/Typeform) / CRM-Tag / Manueller Start
8. **Customizable Wait-Period** — 3 Tage Default, anpassbar 1–14 Tage
9. **DSGVO-Pack** — Customer-Data-Verarbeitung dokumentiert, Vendor-DPA-Übersicht
10. **Install-Guide** — Step-by-Step in <45 Min einsatzbereit
11. **Security-Risk-Review** — Webhook-Schutz, PII-Handling, Mail-Template-Injection-Prevention

---

## Mehrwert (konkret)

**Vorher:**
- Lead unterschreibt → Sales sagt "Welcome-Mail kommt" → 2 Tage später kommt sie (vielleicht) → Kick-off-Termin per Mail-Ping-Pong → Datensatz im CRM unvollständig oder gar nicht da
- Onboarding-Zeit von Sign-Off bis "Kunde produktiv" = **10–14 Tage**
- Inkonsistente Customer-Experience: einer kriegt Welcome-PDF, einer kriegt nichts
- Sales-Delivery-Handoff verliert Infos

**Nachher:**
- Sign-Off → Formular-Submission ODER CRM-Tag-Switch → in <60 Sek: Welcome-Mail, CRM-Record, Slack-Ping. Nach 3 Tagen: Check-in-Mail.
- Onboarding-Zeit von Sign-Off bis Kick-off-Termin = **<1 Tag** (Customer bucht selbst via Calendly)
- Jeder Kunde bekommt identische Premium-Experience
- Delivery-Team hat strukturierten Übergabe-Record

**ROI-Schätzung (Mittel-Agentur, 4 Neukunden/Mo):**
- Time-Save: ~2h Onboarding-Koordination/Kunde × 4 Kunden = 8h/Mo
- Bei PM-Kosten €60/h fully-loaded → **€480/Mo direkter Time-Save**
- Plus: Customer-Experience-Lift (höhere Retention, früheres Erstprojekt-Go) — schwer quantifizierbar, real
- Plus: Onboarding-Konsistenz reduziert Delivery-Friction (weniger "Was hat Sales versprochen?")

**ROI für Personal Brand:**
- 1× peinliche "vergessene Welcome-Mail" verhindert = €X Customer-Trust-Schutz
- Kick-off-Buchung in <24h statt 3 Tage Mail-Ping-Pong = Project-Start beschleunigt

---

## Pricing-Logic

| Variante | Was | Preis-Range |
|---|---|---|
| **Blueprint-Only** | JSON + Docs + Install-Guide | €X (siehe Pricing-Page) |
| **Done-for-You** | Wir installieren + konfigurieren auf deine Tools + Domain-Setup + 1 Test-Run | €X × 2 |
| **Done-with-You** | Setup gemeinsam, du lernst dabei | €X × 1.5 |

→ Conversion-Pfad zu **Customer-Portal-DFY** (für Vollkunden-Onboarding ins eigene Portal) wenn Customer Multi-Project-Management will.

---

## Voraussetzungen Customer

- n8n laufend (Cloud €20/Mo EU-Region oder Self-Hosted)
- E-Mail-Versand: Resend (€0 bis 100/d) oder SMTP mit verifizierter Domain (SPF/DKIM Pflicht)
- CRM: Airtable (€0–20/Mo) oder Notion (€0)
- Slack (optional, €0–8/Mo) für Team-Ping
- Calendly (optional, €0–10/Mo) für Kick-off-Buchung
- Trigger-Quelle: Tally/Typeform-Account ODER Airtable-Automation ODER manueller Trigger

**Total monatliche Tool-Kosten:** €0–50 abhängig vom Stack.

---

## Nicht-Ziele (explizit)

- Kein vollwertiges Customer-Success-System (keine Health-Scores, kein Churn-Prediction)
- Kein Multi-Project-Tracking pro Customer (1 Onboarding-Sequenz pro Trigger, danach Übergabe)
- Kein Multi-Touch-CRM (nur Stammdaten-Anlage, keine Activity-Tracking-Pipeline)
- Kein Customer-Portal (das ist `customer-portal` Blueprint)
- Kein Personal-Agent für Customer (das ist Full-Partner-Tier)
- Kein Multi-Sprach-Routing (Welcome-Mail nur in einer Sprache pro Workflow)

---

## Upsell-Pfade

| Customer-Frage | Next-Step |
|---|---|
| "Mein Onboarding hat 3 Phasen mit verschiedenen Stakeholdern" | → Audit S (Multi-Stakeholder-Sequence-Customization) |
| "Ich will dass Customer in mein Portal kommt" | → Customer-Portal-Blueprint + DFY-Setup |
| "Customer soll eigenen Agent bekommen" | → Full-Partner-Tier (Personal-Agent-Provisioning) |
| "Ich brauche Health-Score + Churn-Warnung" | → Audit M (Customer-Success-Engine) |
| "Multi-Project-Tracking ab Onboarding" | → Customer-Portal + Project-Module |

---

## Conversion-Story (Brief für Sales-Page)

> "Du gewinnst einen neuen Kunden. Was passiert in den ersten 72 Stunden? Bei den meisten: Nichts. Sales sagt 'Welcome-Mail kommt', PM ist im Delivery, der Kunde wartet. Drei Tage Funkstille — und schon ist der Wow-Effekt vom Sign-Off verpufft."
>
> "Onboarding-Autopilot löst das. In <60 Sekunden nach Sign-Off: Personalisierte Welcome-Mail mit Kick-off-Link, dein Team in Slack benachrichtigt, CRM-Record angelegt. Nach 3 Tagen: Check-in-Mail. Alles ohne dass du dran denkst."
>
> "Setup in <45 Minuten. Funktioniert mit Tally, Typeform, Airtable, Notion, Slack, Calendly. Einmal kaufen, beliebig anpassen."
