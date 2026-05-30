# Lead-Enrichment — Sales-Brief

**Blueprint:** lead-enrichment
**Tier:** Blueprint (DIY)
**Preis:** Siehe `apps/web/public/pricing` (€-Range nach Pricing-Model)
**Sales-Ready seit:** 2026-05-30

---

## In einem Satz

Rohe Leads (Name + Domain + ggf. E-Mail) laufen durch eine automatische Anreicherungs-Pipeline: Firmendaten + Socials werden via API gezogen, ein KI-ICP-Score (0-100, Tier A-D) bewertet jeden Lead gegen dein Ideal Customer Profile, alles landet angereichert im CRM — und Hot-Leads über deinem Threshold lösen sofort einen Sales-Alert aus.

---

## Wer das braucht

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur** (5–30 MA, AG) | Leads aus 4 Kanälen, kein einheitliches Qualifizieren, Sales recherchiert jeden Lead manuell (5-10 Min) oder gar nicht | Jeder Lead in Sekunden angereichert + gescort, Sales arbeitet Tier-A zuerst — spart 1/2 MA-Tag/Woche |
| **Personal Brand** (Coach/Berater/Solo, PB) | Inbound-Leads aus Formular/LinkedIn, keine Zeit jeden zu googeln, gute gehen zwischen schlechten unter | Hot-Lead-Mail bei jedem Treffer über Threshold → reagiert nur noch auf das, was zählt |
| **Mittelstand B2B** (10–100 MA, FI) | CRM voll halb-ausgefüllter Leads, Vertrieb verbrennt Zeit mit Recherche statt Closing, Priorisierung nach Bauchgefühl | Enrichment + Scoring VOR CRM-Eintrag → saubere Datenqualität + objektive Priorisierung |

---

## Was Customer bekommt

1. **n8n-Workflow (JSON-Export)** — 15 Nodes, end-to-end: Webhook-Intake, Config, Normalisierung/Validierung, 2 parallele Enrichment-APIs, Merge, KI-ICP-Scoring (Anthropic Claude), CRM-Write, Threshold-Routing, Hot-Lead-Alert, Fehler-Pfad.
2. **Domain-First-Validierungslogik** — Freemail-Filter, Domain-Ableitung aus E-Mail, kaputte Datensätze in den Fehler-Pfad statt API-Geld verbrennen.
3. **Zwei-Quellen-Enrichment** — Firmografie (Branche/Größe/Umsatz/Standort/Tech-Stack) + Socials (LinkedIn/Twitter/Facebook), parallel + ausfalltolerant gemergt.
4. **KI-ICP-Scoring** — Claude bewertet gegen deine ICP-Definition: Score 0-100, Tier A/B/C/D, disqualifiziert-Flag, 3 Begründungen, Datenlücken — striktes JSON, „erfinde nichts"-Prompt, konservativ bei dünner Datenlage.
5. **Robuster Score-Parser** — wirft nie; bei kaputtem LLM-Output Fallback-Tier-D statt Pipeline-Crash.
6. **Threshold-Routing + Hot-Lead-Alert** — konfigurierbarer Score-Schwellwert, formatierte HTML-Alert-Mail mit komplettem Profil an Sales.
7. **Provider-agnostische Config** — Firmendaten-API, Socials-API, CRM-Sink als Platzhalter (TheCompaniesAPI/Abstract/PeopleDataLabs/Airtable/HubSpot/Sheets).
8. **DSGVO-Pack** — Art. 6 lit. f Bewertung, Datenfluss-Analyse, Vendor-DPA-Übersicht, EU-AI-Act-Einordnung (Limited Risk), Löschfristen.
9. **Security-Risk-Review** — 14 Risks inkl. API-Token-Hygiene, Webhook-Absicherung, PII-Drittland-Transfer, LLM-Prompt-Injection.
10. **Install-Guide** — 10 Schritte, in 45-75 Min einsatzbereit.
11. **Mermaid-Flow-Diagramm** — visuelles Workflow-Verständnis für Doku/Onboarding.

---

## Mehrwert (konkret)

**Vorher:**
- Lead kommt rein → jemand googelt 5-10 Min (Branche, Größe, LinkedIn-Check) → trägt manuell ins CRM ein → priorisiert nach Bauchgefühl.
- Bei 50 Leads/Woche: ~5-8h reine Recherche-Zeit, halb-konsistent.
- Schlechte Leads (Freelancer, Mini-Agenturen, Konzerne außerhalb ICP) werden gleich behandelt wie A-Kunden → Sales-Fokus zerfasert.

**Nachher:**
- Lead kommt rein → in <30 Sekunden angereichert, gescort, im CRM, ggf. Sales-Alert.
- Sales sieht Tier + Score + Begründung → arbeitet A vor B vor C, ignoriert disqualifizierte.
- Datenqualität im CRM konsistent (gleiche Felder, gleiche Logik bei jedem Lead).

**ROI-Schätzung (Agentur, 50 Leads/Woche):**
- Time-Save: ~6h/Woche Recherche → ~24h/Monat.
- Bei MA-Kosten €50/h fully-loaded → ~€1.200/Mo gespart.
- Laufende Kosten: €10-40/Mo Tools + ~€0,05/Lead × 200/Mo = ~€10 → unter €60/Mo.
- Pay-Back: erster Monat, danach reiner Hebel.
- Conversion-Lift: Sales-Zeit fließt in Tier-A statt Streuverlust → realistisch +20-40% Termin-Rate auf priorisierte Leads.

**Realistic-Caveat:** Der Score ist nur so gut wie (a) deine ICP-Definition und (b) die Datenqualität deiner Enrichment-API. Bei kleinen DACH-Firmen sind US-Daten-APIs lückenhaft — dann scort Claude konservativ und benennt die Lücke. Das Blueprint liefert die Mechanik; ICP-Schärfe + Provider-Wahl macht der Customer (oder DwY-Begleitung).

---

## Pricing-Logic

| Variante | Was | Preis-Range |
|---|---|---|
| **Blueprint-Only** | JSON + Docs + Install-Guide + Diagramm | €X (siehe Pricing-Page) |
| **Done-for-You** | Wir wählen + verbinden APIs, kalibrieren ICP-Prompt, mappen CRM, Test mit 50 echten Leads | €X × 2.5 |
| **Done-with-You** | Setup gemeinsam, Customer lernt ICP-Tuning + Provider-Auswahl + Score-Kalibrierung | €X × 1.75 |

→ Conversion-Pfad zu Tier S/M Audit wenn Customer „wir brauchen Predictive-Scoring / mehr Datenquellen / Multi-CRM-Sync" sagt.

---

## Voraussetzungen Customer

- n8n laufend (Cloud-EU €20/Mo oder Self-Hosted)
- Firmendaten-API-Account (TheCompaniesAPI / Abstract / PeopleDataLabs — Pay-per-Lookup)
- Optional Socials/Domain-Intel-API
- Anthropic API-Key (~€0,003-0,01/Lead)
- CRM/Airtable/Google-Sheet als Ziel-Sink
- SMTP für interne Alerts
- **Eine klare ICP-Definition** (Branche, Größe, Umsatz, Rolle, Ausschlusskriterien)

**Total monatliche Tool-Kosten:** €10–60 (n8n + APIs + LLM + CRM) bei moderatem Volumen.

---

## Nicht-Ziele (explizit)

- ❌ Lead-Generierung / Scraping (das ist der Lead-Scraper-Factory-Blueprint — dieser hier reichert vorhandene Leads an)
- ❌ Cold-Outreach / Mail-Sequenzen (siehe Cold-Outreach-System-Blueprint — Hot-Leads werden hier nur gemeldet, nicht angeschrieben)
- ❌ Dedup / CRM-Hygiene (macht das CRM via Upsert auf `domain`)
- ❌ Batch-Massenverarbeitung mit Rate-Throttle out-of-the-box (Customer muss SplitInBatches+Wait ergänzen)
- ❌ Predictive-Scoring auf Basis historischer Conversions (Phase 2 / Audit)
- ❌ Multi-CRM-Sync gleichzeitig (ein Sink im Default)
- ❌ Eigene Daten-API hosten (Provider werden angebunden, nicht gebaut)

---

## Upsell-Pfade

| Customer-Frage | Next-Step |
|---|---|
| „Wo bekomme ich überhaupt Leads her?" | → Lead-Scraper-Factory (Blueprint) |
| „Die guten Leads will ich automatisch anschreiben" | → Cold-Outreach-System (Blueprint) — Hot-Lead-Output dieses Flows als Input |
| „Score soll auf unseren echten Conversions lernen" | → Audit M (Predictive-Scoring + historisches Training) |
| „Daten von US-API sind für DACH zu dünn" | → DwY: DACH-Provider-Auswahl + Multi-Source-Enrichment |
| „Wir wollen Enrichment in mehrere Systeme gleichzeitig" | → Audit S (Multi-Sink-Architektur) |
| „ICP-Score trifft oft daneben" | → Audit S (ICP-Prompt-Engineering + Few-Shot mit Best-Kunden) |

---

## Conversion-Story (Brief für Sales-Page)

> „Es kommt ein Lead rein: ‚Tom Berger, acme-gmbh.de'. Mehr nicht. Jemand muss jetzt 8 Minuten googeln, um zu wissen: Ist das eine 5-Mann-Agentur oder ein 200-Mann-Mittelständler? Passt das überhaupt zu uns?"
>
> „Lead-Enrichment macht das in 30 Sekunden — automatisch. Firmendaten, Socials, ICP-Score von 0-100, Tier A bis D, mit Begründung. Alles im CRM. Und wenn's ein Tier-A-Treffer ist, hat dein Sales-Team die Mail im Postfach, bevor der Lead die Seite verlassen hat."
>
> „DSGVO-bewertet (Art. 6 lit. f, EU-AI-Act Limited-Risk), provider-agnostisch, einmal aufgesetzt, läuft für jeden eingehenden Lead. Schluss mit blindem Anschreiben und Recherche-Verbrennung."
