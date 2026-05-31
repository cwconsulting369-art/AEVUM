# Proposal-Generator — Sales-Brief

**Blueprint:** proposal-generator
**Tier:** Blueprint (DIY)
**Preis:** Siehe `apps/web/public/pricing` (€-Range nach Pricing-Model)
**Sales-Ready seit:** 2026-05-30

---

## In einem Satz

Discovery-Notizen (Call / Formular / Transcript) gehen rein — ein maßgeschneidertes, gebrandetes Angebot mit nachvollziehbarer Pricing-Logik (Mengenrabatt, Express-Zuschlag, USt, Anzahlung) kommt als HTML + PDF raus, wird ins CRM geloggt und landet standardmäßig zur Freigabe in deinem Postfach — nicht ungeprüft beim Kunden.

---

## Wer das braucht

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur** (5–30 MA, AG) | Jeder im Team baut Angebote anders, Pricing inkonsistent, ein Angebot kostet 1-2h und liegt dann tagelang | Standardisierter Angebots-Output aus Call-Notizen, gleiche Qualität team-weit, Minuten statt Stunden |
| **Personal Brand** (Coach/Berater/Solo, PB) | Angebote = ungeliebte Bürokratie, Preise aus dem Bauch, Lead kühlt während des Zögerns ab | 5-Min-Angebot mit fairer Regel-Kalkulation, sofort nach dem Call raus |
| **Mittelstand B2B** (10–100 MA, FI) | Angebots-Erstellung ist Flaschenhals beim Vertrieb / beim Chef | Discovery rein → Entwurf zur Freigabe, Sales bleibt im Verkaufs-Flow statt im Word-Dokument |

---

## Was Customer bekommt

1. **n8n-Workflow (JSON-Export)** — 14 Nodes: Webhook-Intake, Config, Discovery-Normalisierung, Validierungs-IF, Claude-Strukturierung (LLM + AI-Agent), deterministische Pricing-Code-Node, HTML-Render-Node, PDF-HTTP, CRM-Log-HTTP, Versand-Gate-IF, 3 Email-Nodes (Kunde / interne Review / Fehler)
2. **KI-Strukturierung** — Claude leitet Bedürfnisse aus Freitext ab und wählt **nur aus dem eigenen Leistungskatalog** Positionen (keine erfundenen Leistungen, keine erfundenen Preise)
3. **Deterministische Pricing-Engine** (Code, kein LLM) — Mengenrabatt, Express-Zuschlag bei knapper Deadline, USt (inkl. §19-UStG-Kleinunternehmer-Modus), Anzahlungs-Ausweis, Budget-Warnung
4. **Gebrandetes Angebots-HTML + Plaintext + PDF** — Positionstabelle, Liefer-Ergebnisse, Konditionen, eindeutige Angebots-Nr., "gültig bis"-Datum
5. **Versand-Gate** — Default `internal_review` (Mensch prüft vor Kundenversand), umschaltbar auf `direct_client`
6. **Crash-sichere Code-Nodes** — wackelige LLM-Antwort führt nie zum Workflow-Abbruch (Fallback-Position + dataGaps-Reporting)
7. **CRM-Log** — jedes Angebot mit Metadaten (Betrag, Scope, Gültigkeit, Status) zur Pipeline-Nachverfolgung
8. **Fehler-Pfad** — Sammel-Alert bei ungültiger Discovery, PDF- oder CRM-Fehler; nie ein kaputtes Angebot zum Kunden
9. **DSGVO-Pack** — Datenfluss, Art. 6 lit. f/b, Vendor-DPA-Übersicht, EU-AI-Act-Einordnung (Limited Risk + Transparenz)
10. **Security-Risk-Review** — 14 Risks, 3 HIGH (Fehl-Versand, PII-an-US-LLM, Token-Hygiene)
11. **Install-Guide** — 10 Schritte, in 45–75 Min einsatzbereit

---

## Mehrwert (konkret)

**Vorher:**
- 60–120 Min pro Angebot (Notizen sichten, Vorlage suchen, tippen, rechnen, Layout fixen)
- Pricing inkonsistent: Mengenrabatt/Express vergessen, jeder im Team rechnet anders
- Copy-Paste-Fehler (alter Kundenname im neuen Angebot)
- Angebot liegt 1-3 Tage rum → Lead kühlt ab

**Nachher:**
- Discovery rein → Angebots-Entwurf in <2 Min zur Freigabe
- Pricing regelbasiert, reproduzierbar, prüfbar (Code, nicht Bauchgefühl)
- Einheitliches Branding + Konditionen + USt-Hinweis automatisch
- Schnelligkeit = höhere Abschlussquote (warmer Lead bekommt sofort sein Angebot)

**ROI-Schätzung (Agentur, 20 Angebote/Mo):**
- Time-Save: ~1,5h × 20 = 30h/Mo Angebots-Arbeit
- Bei MA-Kosten €50/h fully-loaded → €1.500/Mo gespart
- Conversion-Lift: schnellere Angebote = realistisch +5-10% Abschlussquote auf warme Leads
- Bei Durchschnitts-Deal €2-5k und 1-2 zusätzlichen Abschlüssen/Mo → Pay-Back im ersten Monat

**Realistic-Caveat:** Der Generator ist nur so gut wie (a) die Qualität der Discovery-Notizen und (b) der definierte `serviceCatalog`. Er ersetzt nicht das Verkaufsgespräch — er ersetzt das Tippen danach. Default-Modus prüft jedes Angebot durch einen Menschen.

---

## Pricing-Logic

| Variante | Was | Preis-Range |
|---|---|---|
| **Blueprint-Only** | JSON + Docs + Install-Guide | €X (siehe Pricing-Page) |
| **Done-for-You** | Wir setzen es auf, modellieren deinen Katalog + Pricing-Regeln, binden PDF-Provider + CRM an, kalibrieren den Prompt an 5-10 echten Discovery-Beispielen | €X × 2.5 |
| **Done-with-You** | Setup gemeinsam, Customer lernt Katalog-Pflege + Prompt-Tuning + Versand-Gate-Logik | €X × 1.75 |

→ Conversion-Pfad zu Tier S/M Audit, wenn Customer "ich will Signatur + Anzahlung-Einzug + Follow-up automatisch" → Angebots-zu-Cash-Pipeline.

---

## Voraussetzungen Customer

- n8n laufend (Cloud-EU €20/Mo oder Self-Hosted)
- Anthropic-API-Key (~€0,01-0,03/Angebot)
- HTML-zu-PDF-Provider (PDFShift ab €9/Mo ODER Gotenberg self-host €0)
- SMTP / Resend / Postmark / Mailgun
- CRM/Sheet/Supabase fürs Log (optional aber empfohlen)
- **Klar definierter Leistungskatalog mit Preisen** (das ist die Hausaufgabe — ohne sauberen Katalog kein sauberes Angebot)

**Total monatliche Tool-Kosten:** €15–60 (n8n + Anthropic + PDF + Mail).

---

## Nicht-Ziele (explizit)

- ❌ E-Signature / rechtsverbindliche Unterschrift (Upsell: DocuSign/Yousign)
- ❌ Payment-Einzug / Anzahlung kassieren (Upsell: Stripe-Link)
- ❌ Angebots-Follow-up-Sequenz (separate Mechanik)
- ❌ Mehrsprachige Angebote out-of-the-box (Prompt + Template anpassbar, nicht Default)
- ❌ Komplexe Margen-/Kosten-Kalkulation mit Wareneinsatz (Service-Pricing, nicht Produkt-BOM)
- ❌ Ungeprüfter Auto-Versand als Default (bewusst: `internal_review`)

---

## Upsell-Pfade

| Customer-Frage | Next-Step |
|---|---|
| "Der Kunde soll direkt unterschreiben können" | → Audit S (E-Signature-Integration: Yousign/DocuSign) |
| "Anzahlung soll automatisch eingezogen werden" | → Stripe-Payment-Link-Integration (Audit S) |
| "Wenn keiner reagiert, soll automatisch nachgefasst werden" | → Cold-Outreach-/Follow-up-Mechanik koppeln |
| "Die Discovery soll automatisch aus dem Call-Transcript kommen" | → Meeting-Summarizer-Blueprint vorschalten (Fireflies/Zoom → Webhook) |
| "Wir brauchen verschiedene Angebots-Templates je Branche" | → DFY mit Multi-Template-Architektur |
| "Das Pricing wird komplexer (Staffeln, Margen, Rabattlogik)" | → Audit M (Pricing-Engine-Erweiterung) |

---

## Conversion-Story (Brief für Sales-Page)

> "Du hast einen guten Discovery-Call gehabt. Jetzt sitzt du am Abend und baust zum hundertsten Mal ein Angebot in Word zusammen — kopierst das vom letzten Kunden, vergisst den Mengenrabatt, das Layout zerschießt sich, und morgen früh schickst du es ab. Wenn du nicht vergisst."
>
> "Der Proposal-Generator nimmt deine Notizen, strukturiert sie mit KI in dein eigenes Leistungsangebot, rechnet die Preise nach deinen Regeln (nicht aus dem Bauch), baut ein sauberes Angebot als PDF — und legt es dir zur Freigabe ins Postfach. Du klickst 'passt' und es ist beim Kunden, während der Call noch warm ist."
>
> "KI strukturiert, Code rechnet, ein Mensch gibt frei. Konsistent, schnell, prüfbar. Einmalkauf, beliebig viele Angebote."
