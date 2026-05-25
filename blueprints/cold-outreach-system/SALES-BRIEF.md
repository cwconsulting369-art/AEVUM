# Cold-Outreach-System — Sales-Brief

**Blueprint:** cold-outreach-system
**Tier:** Blueprint (DIY)
**Preis:** Siehe `apps/web/public/pricing` (€-Range nach Pricing-Model)
**Sales-Ready seit:** 2026-05-25

---

## In einem Satz

Eine Kontaktliste (CSV / Apollo-Export / Airtable) durchläuft eine DSGVO-konforme 3-Schritt-E-Mail-Sequenz mit KI-personalisierten Hooks. Jeder Kontakt erhält Mail 1, +3d Follow-up und +5d "Letzte Chance" — Antwortende werden automatisch ausgeschleust. Inkl. Opt-Out-Webhook und Sender-Reputation-Setup.

---

## Wer das braucht

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur** (5–30 MA, AG) | Sales-Pipeline trocken, Inbound reicht nicht, manuelles Outreach kostet 1-2 MA-Tage/Woche | 30-50 personalisierte Mails/Tag autonom, 3-Step-Sequenz ohne Copy-Paste |
| **Personal Brand** (Coach/Berater/Solo, PB) | Keine Zeit für Outbound, jeder Mail-Anschreiben ist Bauchgefühl, keine Disziplin im Follow-up | Vorlagen + KI-Hook + automatische Reminder → 2h-Setup statt täglich Mails schreiben |
| **Mittelstand B2B** (10–100 MA, FI) | Vertrieb scheut Cold-Calls, Marketing macht Content aber keine Direktansprache, Top-100-Ziel-Accounts werden ignoriert | Account-Liste laden, Sequenz starten, Sales bekommt nur Antworter — keine Triage |

---

## Was Customer bekommt

1. **n8n-Workflow (JSON-Export)** — fertig konfigurierter Workflow mit 13 Nodes (Trigger, Set, Split, Batch, OpenRouter-HTTP, 3 Email-Sends, 2 Wait, 2 IF, Opt-Out-Webhook)
2. **3-Step-Sequenz-Logik** — Mail 1 (personalisiert) + Mail 2 (+3 Tage Follow-up) + Mail 3 (+5 Tage Letzte Chance), mit Auto-Skip bei Antwort
3. **KI-Hook-Generator** (OpenRouter) — 2-Satz-Personalisierung pro Kontakt: 1 Hook + 1 Brücken-Satz zum Angebot, kein generisches Lob, kein Clickbait
4. **3 Mail-Templates** (HTML) — getestet auf Deliverability, Plain-Text-Fallback im Workflow
5. **Opt-Out-Webhook** — separater Webhook-Endpoint, automatische Blocklist-Aufnahme, DSGVO-pflichtig
6. **DSGVO-Pack** — § 7 UWG + Art. 6 lit. f Checkliste, Pflicht-Mailfooter-Spec (Impressum + Opt-Out), Löschfristen
7. **Domain-Warm-Up-Anleitung** — SPF/DKIM/DMARC + 2-4 Wochen Domain-Aufwärmen vor Cold-Volume
8. **Bounce + Spam-Troubleshooting-Guide** — mail-tester.com-Score, Domain-Reputation-Recovery, NeverBounce/ZeroBounce-Verifier
9. **Install-Guide** — Schritt-für-Schritt in 60-90 Min einsatzbereit (länger als Lead-Qualifier wegen Sender-Setup)
10. **Security-Risk-Review** — Sender-Reputation, Bulk-DDoS-Schutz, OpenRouter-Token-Hygiene, Listen-Vergiftung
11. **CSV-Template** mit korrekten Spaltennamen für Apollo/LinkedIn-Export

---

## Mehrwert (konkret)

**Vorher:**
- Sales-MA schreibt 10-20 Mails/Tag manuell → ~3-4h/Tag
- Follow-up wird vergessen (40-60% der Mails bekommen kein Follow-up)
- Personalisierung ist "Hi {{firstName}}" — Response-Rate <2%
- Keine Opt-Out-Mechanik → DSGVO-Beschwerde-Risiko + Domain-Blacklisting

**Nachher:**
- 30-50 Mails/Tag autonom versendet, KI-personalisiert
- 3-Step-Sequenz immer durchgezogen (außer bei Antwort)
- Response-Rate-Realistic: 5-12% (B2B, gut-recherchierte Liste, eigene Domain warm)
- Opt-Outs landen automatisch auf Blocklist → Domain bleibt sauber

**ROI-Schätzung (Agentur, 200 Kontakte/Wo):**
- Time-Save: ~12h/Wo MA-Zeit für Mail-Versand + Follow-up-Tracking → 48h/Mo
- Bei MA-Kosten €50/h fully-loaded → €2.400/Mo gespart
- Conversion-Lift: bei 8% Response × 200/Wo = 16 Conversations/Wo. Realistisch 2-4 davon werden Calls, 0,5-1 wird Deal.
- 1 Deal/Monat zusätzlich bei Durchschnitts-Deal €3-10k → Pay-Back in 1 Monat

**Realistic-Caveat:** Cold-Outreach ist KEIN Selbstläufer. Liste muss recherchiert sein, Angebot muss klar sein, Domain muss aufgewärmt sein. Blueprint liefert die Mechanik — die Inhalte (Hook-Quality, Angebots-Klarheit) macht der Customer.

---

## Pricing-Logic

| Variante | Was | Preis-Range |
|---|---|---|
| **Blueprint-Only** | JSON + Docs + Install-Guide + CSV-Template | €X (siehe Pricing-Page) |
| **Done-for-You** | Wir installieren + warmen Domain auf + 100 Test-Adressen + 1. Kampagne live | €X × 2.5 |
| **Done-with-You** | Setup gemeinsam, Customer lernt Hook-Optimierung + Listen-Hygiene | €X × 1.75 |

→ Conversion-Pfad zu Tier S/M Audit wenn Customer "ich brauche bessere Leads, nicht nur mehr Mails" → wird ICP-Refinement + AEVUM-Lead-Engine.

---

## Voraussetzungen Customer

- n8n laufend (Cloud-EU €20/Mo oder Self-Hosted)
- OpenRouter-Account + API-Key (~€5-10/Mo für 200 Hooks)
- **Eigene Sender-Domain** (NICHT Hauptdomain) — z.B. `kontakt.deinefirma.de` (~€10/Jahr)
- SMTP / Resend / Postmark / Mailgun für Versand (Resend: €0/Mo bis 3k Mails)
- 2-4 Wochen Vorlauf für Domain-Warm-Up
- Recherchierte Kontaktliste (Apollo Pro / LinkedIn / Eigenrecherche — KEIN gekaufter Listen-Schrott)
- Klares 1-Satz-Angebot

**Total monatliche Tool-Kosten:** €30–80 (n8n + OpenRouter + Sender-Provider + Domain).

---

## Nicht-Ziele (explizit)

- ❌ B2C-Cold-Mail (rechtswidrig nach UWG, hier kategorisch verboten)
- ❌ Spam-Versand auf gekaufte Listen (= Domain-Suizid)
- ❌ Echtzeit-Inbox-Monitoring + Reply-Detection (Phase 2 — aktuell nutzen wir CRM-Flag oder manuelle Markierung)
- ❌ Multi-Channel (LinkedIn-DM + Mail + Phone kombiniert — Future-Blueprint)
- ❌ Eigene Liste-Recherche / Scraping (Apollo macht das; Lead-Scraper-Factory ist separates Blueprint)
- ❌ Inbox-Routing wenn Antworten kommen (Customer muss manuell oder via CRM handlen)
- ❌ A/B-Testing von Hooks (Phase 2)

---

## Upsell-Pfade

| Customer-Frage | Next-Step |
|---|---|
| "Wie bekomme ich überhaupt qualifizierte Adressen?" | → Lead-Scraper-Factory (Future-Blueprint) / Apollo-Setup-DwY |
| "Antworten landen chaotisch in meinem Posteingang" | → Lead-Qualifier-Pro Blueprint (Inbound-Triage) |
| "Wir brauchen verschiedene Sequenzen für verschiedene Branchen" | → DFY-Variante mit Multi-Sequenz-Architektur |
| "Die Hooks sind nicht gut genug" | → Audit S (Hook-Engineering + Prompt-Optimierung mit Customer-Voice) |
| "Wir wollen Reply-Tracking automatisch" | → Audit M (IMAP-Integration + Reply-Klassifizierung) |
| "Telefon + Mail kombiniert" | → Multi-Channel-Engine (Future-Blueprint) |

---

## Conversion-Story (Brief für Sales-Page)

> "Du hast 200 potenzielle Kunden auf der Liste. Du schreibst 10 Mails am Montag, vergisst Follow-up am Donnerstag, am Freitag landest du mit der Hälfte im Spam-Ordner — und in Woche 2 macht dein Sales-Team das Gleiche nochmal."
>
> "Cold-Outreach-System nimmt die Liste, schickt KI-personalisierte 3-Step-Sequenzen über deine aufgewärmte Sender-Domain, Opt-Outs landen automatisch auf der Blocklist — und du siehst nur die Antworter."
>
> "DSGVO-konform (§ 7 UWG B2B-Cold-Mail), Opt-Out-Pflicht erfüllt, Bounce-Rate <2% nach Setup. Einmalkauf, beliebig oft Kampagnen starten."
