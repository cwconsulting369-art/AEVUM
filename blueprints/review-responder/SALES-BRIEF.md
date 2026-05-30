# Review-Responder Blueprint — Sales Brief

## In einem Satz

Automatisiert die Beantwortung von Google- und Trustpilot-Reviews mit KI-generierten, brand-konformen Antworten — inklusive menschlichem Freigabe-Gate und täglichem Sentiment-Report.

---

## Wer das braucht

| Segment | Fit | Warum |
|---|---|---|
| **AG – Agenturen** | ★★★★★ | Review-Management als White-Label-Leistung für mehrere Kunden; ein Blueprint, viele Mandanten; Skalierungseffekt sofort spürbar |
| **PB – Personal Brands** | ★★★☆☆ | Sinnvoll ab ~10 Reviews/Monat; das Approve-Gate passt perfekt für Solopreneure, die Kontrolle behalten wollen, ohne täglich manuell zu reagieren |
| **FI – Mittelstand B2B** | ★★★★☆ | Mehrere Standorte, mehrere Review-Quellen, Brand-Voice-Konsistenz über Teams hinweg; Compliance-Anforderungen an Nachweisbarkeit abgedeckt durch Sheet-Log |

---

## Was Customer bekommt

1. Automatisches Polling neuer Reviews von Trustpilot (API) und Google (Webhook-Eingang)
2. KI-generierte Antworten (Claude) — Ton, Länge und Sprache per System-Prompt konfiguriert
3. Approve-Gate per E-Mail — ein Klick für Freigabe oder Ablehnung, keine Login-Pflicht
4. Automatische Veröffentlichung freigegebener Antworten via Trustpilot API
5. Sentiment-Klassifikation (positiv/neutral/negativ) mit numerischem Score für jede Review
6. Sofort-Alert bei negativen Reviews (1–2 Sterne) via Slack
7. Täglicher Sentiment-Report per E-Mail: Durchschnittsscore, Verteilung, Auffälligkeiten
8. Review-Log in Google Sheets: vollständiger Audit-Trail mit Status und Timestamps
9. Error-Alerting via Slack bei fehlgeschlagenen API-Calls
10. 19-Node-Workflow, vollständig in n8n — kein proprietäres Lock-in

---

## Mehrwert (konkret)

### Vorher / Nachher

| Dimension | Vorher (manuell) | Nachher (Blueprint) |
|---|---|---|
| Reaktionszeit auf neue Review | 1–5 Tage (wenn überhaupt) | < 2 Stunden (bis Freigabe) |
| Zeitaufwand pro Antwort | 8–15 Minuten | < 1 Minute (Freigabe-Klick) |
| Antwortquote | 20–40 % (typisch) | Ziel: 90–100 % |
| Ton-Konsistenz | Abhängig von Mitarbeiter, Tagesform | Brand-Voice-konform durch System-Prompt |
| Negative Reviews erkannt | Beim nächsten manuellen Check | Sofort-Alert innerhalb Minuten |
| Reportingaufwand | Kein oder manuell in Excel | Automatisch täglich, aggregiert |

### ROI-Schätzung (konservativ)

- **AG:** Bei 5 betreuten Kunden à 30 Reviews/Monat = 150 Reviews. Zeitersparnis ~20 h/Monat. Bei 100 EUR Stundensatz intern = **2.000 EUR/Monat direkte Kostenersparnis**. Upsell als "Reputation Management"-Modul: 300–600 EUR/Monat/Kunde möglich.
- **FI:** Review-Antwortquote von 30 % → 90 % nachweislich verbessert Google-Ranking. Branchenübliche Schätzung: +5–15 % lokale Sichtbarkeit. Bei 50 k EUR Jahresumsatz über lokale Suche = **2.500–7.500 EUR Mehrwert p. a.**
- **PB:** Zeitersparnis 2–4 h/Monat = mehr Kapazität für Kerngeschäft. Professionellere Außenwirkung → höhere Konversion auf Profilbesucher.

> **Limit:** ROI-Zahlen sind Schätzwerte. Tatsächliche Effekte hängen von Plattform, Branche, Review-Volumen und Freigabe-Disziplin ab. Kein Blueprint ersetzt aktive Reputationsstrategie.

---

## Pricing-Logic

| Delivery-Modell | Was enthalten | Preis-Indikation |
|---|---|---|
| **Blueprint (Self-Service)** | workflow.json + README + Install-Guide + DSGVO-Check | €297–€497 einmalig |
| **Done-with-You (DwY)** | Blueprint + 2 h Setup-Call + Credential-Walkthrough + Brand-Voice-Prompt-Review | Tier S: €2.000–€3.500 Setup, €500–€800/Mo Support |
| **Done-for-You (DFY)** | Vollständiges Setup, Testing, Brand-Voice-Kalibrierung, Google-API-Integration, Hardening, Monitoring-Setup, Hypercare 30 Tage | Tier S–M: €4.000–€8.000 Setup, €1.000–€2.000/Mo |

> Agenturen mit 3+ Kunden: Reseller-Konditionen auf Anfrage.

---

## Voraussetzungen Customer

| Voraussetzung | Pflicht | Details |
|---|---|---|
| n8n-Instanz (Self-hosted oder Cloud) | Ja | Version ≥ 1.40.0 |
| Trustpilot Business Account mit API-Zugang | Ja | Kostenpflichtig ab Trustpilot Business-Plan |
| Google Business Profile | Ja (für Google Reviews) | Direkte API-Publishing-Fähigkeit erfordert GMB-API-OAuth-App-Verifizierung — aufwendig |
| Anthropic API Key (Claude) | Ja | Pay-per-use; bei ~100 Reviews/Mo ca. 5–15 USD/Mo |
| SMTP-Account oder Gmail | Ja | Für Approve-Gate und Reports |
| Google Sheets | Ja | Kostenlos |
| Slack Workspace | Nein (optional) | Für Error-Alerts und Negativ-Sofort-Alerts |

---

## Nicht-Ziele

- **Kein automatisches Publishing ohne menschliche Freigabe** — das Approve-Gate ist bewusst Pflicht (nicht optional konfiguriert)
- **Kein natives Google-Review-Publishing** — Google My Business API erfordert separaten OAuth-Verifizierungsprozess; Blueprint deckt Antwort-Generierung und Logging ab, Publishing muss manuell oder via Zapier-Bridge erfolgen
- **Kein Review-Generierungs-Tool** — das Blueprint antwortet auf Reviews, fordert keine an
- **Kein CRM-Connector** — Reviewer-Daten fließen in Google Sheets, nicht in HubSpot, Salesforce o. ä. (→ Upsell)
- **Kein Mehrsprachigkeits-Router** — Claude antwortet in der konfigurierten Sprache; automatische Sprach-Detection und -Routing ist nicht enthalten (→ Phase 2)

---

## Upsell-Pfade

| Upsell-Modul | Beschreibung | Tier | Trigger |
|---|---|---|---|
| **CRM-Sync** | Reviewer-Daten + Sentiment in HubSpot/Pipedrive schreiben | S–M | Customer nutzt CRM aktiv |
| **Multi-Plattform-Erweiterung** | Yelp, Kununu, ProvenExpert anbinden | S–M | AG mit mehreren Kunden-Plattformen |
| **Google-Native-Publishing** | GMB API OAuth-App einrichten + Publishing-Node | M | FI mit Google-Fokus |
| **Competitor-Monitoring** | Öffentliche Reviews von Wettbewerbern tracken + Report | M–L | Strategie-orientierte FI/AG |
| **Eskalations-Workflow** | Negative Reviews → automatisch Support-Ticket in Jira/Zendesk | S | FI mit Customer-Service-Struktur |
| **White-Label-Dashboard** | Retool/Metabase-Oberfläche für Agentur-Kunden | M–L | AG, die Reporting verkaufen |
| **Full Reputation-Management-Suite** | Review-Responder + Monitoring + CRM + Dashboard gebündelt | L | FI/AG mit Enterprise-Anspruch |

---

## Conversion-Story

**Die stille Reputations-Erosion.** Die meisten Unternehmen wissen, dass unbeantworte Reviews ein Problem sind. Trotzdem passiert es täglich: Die neue 2-Sterne-Review von letztem Dienstag wartet noch auf eine Antwort. Nicht weil niemand zuständig wäre, sondern weil "das Antworten" in der To-do-Liste immer hinter dringenderem Tagesgeschäft verschwindet. Google registriert die fehlende Interaktion. Potenzielle Kunden lesen die unkommentierte Beschwerde. Der Schaden ist real, er ist nur schwer zu messen — bis er in den Conversion-Rates auftaucht.

**Was das Blueprint konkret ändert.** Der Review-Responder nimmt die Antwort-Last aus dem operativen Alltag heraus, ohne die Kontrolle zu entziehen. Claude generiert eine brand-konforme Antwort — nicht als Autopilot, sondern als Vorschlag, der per E-Mail-Klick freigegeben oder abgelehnt wird. Der zuständige Manager entscheidet in 20 Sekunden, statt 15 Minuten zu schreiben. Negative Reviews landen sofort als Alert in Slack, bevor der Chef sie zufällig auf der Plattform entdeckt. Das Sheet-Log dokumentiert jeden Schritt: für interne Audits, für Kunden-Reporting, für die eigene Lernkurve.

**Für Agenturen: Das ist ein Produkt, kein Werkzeug.** Wer dieses Blueprint für Kunden betreibt, verkauft Reputation-Management als Managed Service — monatlich recurring, niedrige Betriebslast, hoher wahrgenommener Wert. Das Approve-Gate macht es mandantenfähig: Jeder Kunde gibt selbst frei, die Agentur überwacht und optimiert den Brand-Voice-Prompt. Mit drei Kunden ist das Setup rentabel. Mit zehn ist es ein eigenständiges Produkt-Line-Item.