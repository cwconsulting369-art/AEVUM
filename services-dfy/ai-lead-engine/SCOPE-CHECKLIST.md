# AI Lead Engine — Scope-Checklist (intern, Sales-Call)

## In-Scope

| Kategorie | Item | Aufwand-Estimate |
|---|---|---|
| **Discovery** | ICP-Workshop (1 Session, 90 Min) mit Customer | 2h |
| **Discovery** | ICP-Dokumentation + Scoring-Kriterien-Definition | 3h |
| **Scraping** | Setup einer Scraping-Quelle (Apollo / Clay / LinkedIn Sales Nav) | 4-6h |
| **Scraping** | Filter-Logik nach ICP-Parametern (Firmengröße, Branche, Geo, Jobtitel) | 3-4h |
| **Scraping** | Deduplizierung + Blacklist-Integration | 2h |
| **Enrichment** | E-Mail-Verifikations-Workflow (Hunter.io / Apollo / ZeroBounce) | 3h |
| **Enrichment** | Company-Daten-Anreicherung (Mitarbeiterzahl, Funding, Tech-Stack) | 3-4h |
| **Enrichment** | News-Trigger-Setup (optional, Hiring / Funding Signals) | 2-3h |
| **Qualifikation** | AI-Scoring-Logik (GPT-basiert oder regelbasiert je nach Komplexität) | 5-8h |
| **Qualifikation** | Schwellenwert-Definition: "Hot / Warm / Cold" Leads | 2h |
| **Outreach** | Outreach-Domain-Setup + DNS-Konfiguration (SPF, DKIM, DMARC) | 2h |
| **Outreach** | Domain-Warming-Koordination (2-3 Wochen, Customer muss warten) | Monitoring |
| **Outreach** | Copy für 3-5 Sequenz-Varianten (Email Sequence: 3-4 Steps je) | 6-10h |
| **Outreach** | LinkedIn-Message-Sequenzen (Connect + 2 Follow-Ups) | 4h |
| **Outreach** | AI-First-Line-Personalisierung (Clay oder GPT-Integration) | 4-6h |
| **Outreach** | Sending-Tool-Setup (Instantly / Lemlist / Smartlead — je nach Wahl) | 3h |
| **Follow-Up** | Verhaltensbasierte Follow-Up-Logik (Opener vs. Non-Opener) | 4h |
| **Follow-Up** | Bounce-Handling + Unsubscribe-Management | 2h |
| **CRM-Integration** | Webhook / API-Verbindung zu CRM (HubSpot / Pipedrive / Airtable) | 4-6h |
| **CRM-Integration** | Lead-Status-Mapping (Contacted → Replied → Booked) | 2h |
| **Dashboard** | Performance-Dashboard (Airtable / Notion / Custom — je nach Scope) | 5-8h |
| **Dashboard** | Weekly-Automated-Report (E-Mail-Zusammenfassung Metriken) | 3h |
| **QA** | Soft-Launch mit 50-100 Test-Leads, Monitoring, Bug-Fixing | 6-8h |
| **Handover** | Playbook-Dokumentation (wie man neue Kampagnen aufsetzt) | 4h |
| **Handover** | Handover-Call (60 Min, Loom-Video-Walkthrough) | 2h |

**Gesamt-Estimate Tier M:** 85-110h Engineering + Setup
**Gesamt-Estimate Tier L:** 140-200h (multi-ICP, A/B-Setup, erweiterte Integrationen)

---

## Out-of-Scope

| Was Customer NICHT bekommt | Warum explizit |
|---|---|
| Offer-/Pricing-Entwicklung | Wir bauen Kanal, nicht Angebot. Ohne stehendes Offer kein Go-Live. |
| Sales-Call-Handling oder Closing-Support | Kein BizDev-as-a-Service. Nur Infrastruktur. |
| Laufendes Copywriting über Retainer hinaus | Neue Kampagnen-Copies sind Retainer-Leistung, pauschal 2 Iterationen/Mo enthalten. Mehr = Change Request. |
| CRM-Neuaufbau oder komplexe CRM-Customization | Setup in bestehendem oder Standard-CRM. Kein HubSpot-Consulting. |
| Ad-Kampagnen (Paid Social / Search) | Komplett separates Thema. Eigener Service. |
| Content-Erstellung für LinkedIn-Profil | Profil-Optimierungshinweise geben wir einmalig. Nicht mehr. |
| Lead-Listen-Kauf oder -Beschaffung via bezahlte Datenbanken | Customer trägt Kosten für Apollo, Clay, Sales Navigator selbst. |
| Rechtliche Beratung zu DSGVO / Cold-Outreach-Compliance | Wir bauen Best-Practice-Setups. Rechtliche Freigabe ist Sache des Customers. |
| Reporting-Analyse oder Strategie-Calls über Retainer hinaus | Monatlicher Call (45 Min) ist inkludiert. Mehr = extra. |
| A/B-Testing-Auswertung in Tier M | Nur in Tier L enthalten. Tier M bekommt eine Sequenz-Variante. |

---

## Voraussetzungen Customer-Side

| Voraussetzung | Detail | Kritisch? |
|---|---|---|
| **Stehender Offer** | Was wird angeboten, an wen, zu welchem Preis. Ohne das kein Copy. | ✅ Blocker |
| **ICP-Klarheit** | Branche, Firmengröße, Geo, Jobtitel der Entscheider. Kann im Workshop erarbeitet werden — braucht aber Customer-Input. | ✅ Blocker |
| **Outreach-Domain** | Separate Domain oder Subdomain für Cold-Outreach (nicht Haupt-Domain). Customer kauft selbst. | ✅ Blocker |
| **Tool-Zugang** | Apollo / Clay / Sales Nav Account (Kosten: €80-500/Mo Customer-seitig). | ✅ Blocker |
| **CRM-Entscheidung** | Welches CRM? Zugang für Integration. | Hoch |
| **LinkedIn-Account** | Personlicher Account des Founders/Sales-Reps für LinkedIn-Outreach. Sales Navigator empfohlen. | Hoch |
| **E-Mail-Sending-Account** | Google Workspace oder Microsoft 365 (nicht Gmail Gratis). Ca. €6/Mo. | Hoch |
| **Feedback-Verfügbarkeit** | 1-2h/Woche in den ersten 4 Wochen. Danach 45 Min/Mo für Retainer-Call. | Mittel |
| **DSGVO-Freigabe intern** | Customer klärt intern ob Cold-Outreach-Prozess rechtlich freigegeben ist. | Mittel |

---

## Quality-Standards

AEVUM erklärt das System als "Done" wenn folgende Bedingungen erfüllt sind:

1. Scraping-Pipeline liefert täglich ≥50 qualifizierte Leads (gemäß definiertem ICP-Scoring-Threshold) ohne manuellen Eingriff.
2. Enrichment-Rate: ≥85% der gescrapten Leads haben verifizierte E-Mail-Adresse.
3. Outreach-Sequenz ist live, Domain-Warming abgeschlossen (≥2 Wochen), kein Spam-Flag in ersten 100 Sends.
4. Erste-Line-Personalisierung ist für ≥90% der Leads ausgefüllt (nicht leer oder Fallback-Text).
5. Follow-Up-Logik ist korrekt verzweigt: Opener vs. Non-Opener erhalten unterschiedliche Messages.
6. CRM-Integration: Reply oder Calendly-Click triggert automatisch Lead-Erstellung im CRM ohne manuelle Intervention.
7. Dashboard zeigt: Kontaktiert / Öffnungsrate / Reply-Rate / Gebuchte Calls — aktuell, nicht manuell gepflegt.
8. Weekly-Report wird automatisch ausgelöst (kein manuelles Anstoßen).
9. Blacklist / DNC-Filter funktioniert: Test mit bekannten Exclusions bestanden.
10. Soft-Launch (50-100 Leads) ohne kritische Fehler abgeschlossen, Customer hat abgenommen.

---

## Change-Request-Policy

| Situation | Vorgehen |
|---|---|
| Customer will zweite ICP-Zielgruppe hinzufügen (war nicht im Scope) | Change-Request: €1.500-3.000 Setup + ggf. Retainer-Anpassung |
| Customer will andere Sending-Plattform nach Setup-Start | Möglichkeit prüfen. Wenn Plattformwechsel, 50% des Plattform-Setups wird neu berechnet. |
| Customer will zusätzliche CRM-Integration (zweites CRM) | Flat-Rate: €800-1.500 je nach CRM-Komplexität |
| Copy-Runden über 2 Revision-Zyklen hinaus | €250-500 pro Revision-Runde |
| Neuer Markt / neue Geo-Ausweitung nach Go-Live | Change-Request: €1.000-2.500 |
| Feature-Request der nicht in Deliverable-Liste steht | Discovery-Assessment (1-2h intern), dann Angebot. Nichts kostenlos. |

**Grundregel:** Scope-Creep wird immer schriftlich (Slack/E-Mail) bestätigt bevor Arbeit beginnt. Kein "mal schnell" ohne CR-Freigabe.

---

## Pricing-Variations

| Add-On / Variation | Preis-Impact |
|---|---|
| Zweite ICP-Zielgruppe | +€2.000-4.000 Setup |
| A/B-Testing-Framework (2 Sequenz-Varianten parallel) | +€1.500 Setup |
| News-Trigger-Enrichment (Funding/Hiring-Signale) | +€800-1.200 Setup |
| LinkedIn-Automation via Phantombuster / Dux-Soup | +€600-1.000 Setup (Customer trägt Tool-Kosten) |
| Custom Reporting-Dashboard (statt Standard-Airtable) | +€2.000-4.000 Setup |
| Mehrsprachige Sequenzen (DE + EN oder andere Kombination) | +€1.000-1.500 Setup pro Sprache |
| Onboarding Sales-Rep-Training (Team, nicht nur Founder) | +€500 pauschal |
| Retainer-Erhöhung auf tägliches Monitoring + Reaktion | +€500-800/Mo |