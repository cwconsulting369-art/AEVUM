# Lead Factory — Scope-Checklist (Intern / Sales-Call)

## In-Scope

| Kategorie | Item | Aufwand-Estimate |
|---|---|---|
| **Discovery** | ICP-Workshop (1x 90-Min. Call + Dokumentation) | 4-6 Std. |
| **Discovery** | Targeting-Matrix erstellen (Firmografika, Technografika, Trigger) | 3-4 Std. |
| **Discovery** | Tech-Stack-Audit (bestehende Tools, CRM, E-Mail-Infra) | 2 Std. |
| **Scraping** | Multi-Source Scraping-Pipeline aufsetzen (bis 2 Quellen bei Tier M, bis 4 bei Tier L) | 8-12 Std. |
| **Scraping** | Deduplication-Layer implementieren | 3-4 Std. |
| **Enrichment** | Automatische Datenanreicherung (Kontaktdaten, LinkedIn, Company-News) | 6-10 Std. |
| **Enrichment** | Job-Change / Trigger-Event-Detection einrichten | 4-6 Std. |
| **Qualifikation** | Scoring-Modell definieren + implementieren (regelbasiert + AI-Layer) | 8-12 Std. |
| **Qualifikation** | Ausschluss-Logik und Blacklist-Management | 2-3 Std. |
| **Outreach** | Deliverability-Setup (SPF/DKIM/DMARC, Domain-Warming) | 4-6 Std. |
| **Outreach** | E-Mail-Sequenz copywriting (bis 3 Sequenzen bei Tier M, bis 8 bei Tier L) | 8-16 Std. |
| **Outreach** | Personalisierungs-Layer auf Basis Enrichment-Daten | 4-8 Std. |
| **Outreach** | LinkedIn-Sequenz (nur Tier L oder Add-On bei Tier M) | 6-8 Std. |
| **Outreach** | Reply-Handling-Templates (4 Kategorien) | 2-3 Std. |
| **Integration** | CRM-Anbindung (1 CRM, Standard-Felder + Status-Updates) | 6-10 Std. |
| **Integration** | Webhook/Trigger für automatische CRM-Stage-Änderungen | 3-4 Std. |
| **Tracking** | Lead-Tracking-Dashboard aufsetzen | 6-8 Std. |
| **Tracking** | Reply-Rate, Open-Rate, Conversion-Tracking konfigurieren | 3-4 Std. |
| **Launch** | Soft-Launch + Monitoring erste 2 Wochen | 4-6 Std. |
| **Launch** | Initiales Tuning auf Basis erster Daten (bis 2 Iterationen) | 4-6 Std. |
| **Dokumentation** | SOPs für alle Kernprozesse (Scraping, Qualifikation, Outreach-Management) | 6-8 Std. |
| **Dokumentation** | Video-Walkthroughs (max. 3 Loom-Videos, 10-15 Min. je) | 3-4 Std. |
| **Training** | 1x Übergabe-Call mit Customer-Team (90 Min.) | 1,5 Std. |

**Gesamt Aufwand-Estimate Tier M:** ca. 90-120 Std.
**Gesamt Aufwand-Estimate Tier L:** ca. 150-200 Std.

---

## Out-of-Scope

Was der Customer **nicht** bekommt — muss aktiv in Sales-Call kommuniziert werden:

- Laufendes Copywriting für mehr als 2 neue Sequenzen/Monat im Retainer
- A/B-Testing-Auswertung und Optimierung öfter als 1x/Monat (im Standard-Retainer)
- CRM-Migration oder Datentransfer aus Altsystemen (separater Scope)
- CRM-Customization über Standard-Felder hinaus (Custom-Objects, komplexe Workflows im CRM)
- Sales-Coaching, Closing-Scripts, Verhandlungsführung
- Paid-Traffic-Kampagnen jeglicher Art
- Rechtliche DSGVO-Prüfung des Outreach-Konzepts
- Aufbau eigener Prospect-Datenbanken die Customer "besitzt" (Daten kommen von Dritttools)
- Branchen-Compliance-Checks (Fintech, Healthcare, etc.)
- 24/7-Support oder SLA unter 48h Response-Time
- White-Label-Setup für Wiederverkauf
- Integration in mehr als 1 CRM (Tier M) / mehr als 2 CRMs (Tier L) ohne Add-On

---

## Voraussetzungen Customer-Side

| Kategorie | Anforderung | Kritisch? |
|---|---|---|
| **Tools** | LinkedIn Sales Navigator Zugang (oder Apollo-Account) | Ja — ohne Source kein Scraping |
| **Tools** | CRM-Zugang mit Admin-Rechten | Ja |
| **Infrastruktur** | Business-Domain(s) für Outreach-E-Mails (nicht Haupt-Domain empfohlen) | Ja |
| **Infrastruktur** | DNS-Zugang für SPF/DKIM/DMARC-Setup | Ja |
| **Zeit** | Ansprechpartner 2-3 Std./Woche in Wochen 1-4 für ICP-Feedback und Reviews | Ja |
| **Zeit** | Wöchentlicher 30-Min. Sync-Call über gesamte Implementation | Empfohlen |
| **Daten** | Bestehende Kundenliste / Wunschkunden-Liste als Input für ICP-Kalibrierung | Empfohlen |
| **Offer** | Klares, bereits validiertes Angebot mit definiertem Value-Prop | Kritisch — kein System rettet ein unklares Offer |
| **Entscheidung** | Freigabe-Prozess für Outreach-Copy (wer muss abnehmen, in welcher Zeit?) | Ja — Bottleneck-Risiko |

---

## Quality-Standards

AEVUM erklärt den Service erst als "Done" wenn alle folgenden Punkte erfüllt sind:

1. Scraping-Pipeline läuft ohne manuelle Eingriffe und liefert mindestens vereinbartes Lead-Volumen/Woche
2. Qualifikations-Scoring weist nachweislich >80% der manuell-validierten "guten" Leads als High-Score aus (Kalibrierungs-Test mit Customer)
3. Deliverability-Setup vollständig: SPF ✅ DKIM ✅ DMARC ✅ Domain-Warming abgeschlossen (mind. 2 Wochen)
4. Mindestens eine Outreach-Sequenz hat 200+ E-Mails als Soft-Launch durchlaufen mit messbaren Open-Rates >30%
5. CRM-Integration funktioniert bidirektional: Lead landet automatisch in CRM, Stage-Updates fließen zurück
6. Dashboard zeigt Live-Daten ohne manuelle Datenanbindung
7. Reply-Handling-Templates sind im System hinterlegt und getestet
8. SOPs sind schriftlich dokumentiert und von Customer-Team als verständlich bestätigt
9. Mindestens 1 Übergabe-Call durchgeführt, offene Fragen dokumentiert
10. Customer hat System eigenständig 5 Werktage ohne AEVUM-Support bedient (Stabilitäts-Nachweis)

---

## Change-Request-Policy

| Szenario | Handling |
|---|---|
| Kleiner Scope-Change (z.B. anderer CRM-Field-Name, Sequenz-Anpassung <30 Min.) | Wird ohne Aufpreis integriert, wenn in Phase noch offen |
| Mittlerer Change (neue Sequenz, zusätzliche Lead-Quelle, Reporting-Erweiterung) | Change-Request-Dokument, Aufwand-Estimate, Freigabe durch Customer, €150-250/Std. |
| Größerer Scope-Shift (neuer Kanal, zweites CRM, Branchen-Pivot) | Neuer Mini-Scope + Pricing, frühestens nach Phase 4 eingebaut |
| ICP-Pivot nach Phase 2 (Targeting-Matrix komplett neu) | Resets Phase 2 — zusätzlicher Aufwand wird berechnet, Timeline verlängert sich um 2-3 Wochen |
| Customer will schneller liefern als Timeline erlaubt | Rush-Fee: +20-30% auf verbleibenden Setup-Betrag |

**Grundsatz:** Jeder Change-Request wird schriftlich festgehalten. Keine mündlichen Scope-Erweiterungen.

---

## Pricing-Variations

| Add-On / Variation | Preis-Impact Setup | Preis-Impact Retainer |
|---|---|---|
| LinkedIn-Kanal zu Tier M hinzufügen | +€2.500 – €3.500 | +€400 – €600/Mo |
| 3. Lead-Quelle (z.B. Branchenverzeichnis, Custom Scraper) | +€1.500 – €2.500 | +€200 – €350/Mo |
| Zweites CRM anbinden | +€1.200 – €2.000 | +€150 – €250/Mo |
| A/B-Test-Layer mit monatlichem Report | +€1.000 Setup | +€350 – €500/Mo |
| Erweiterte Deliverability (3 Sending-Domains statt 1) | +€800 – €1.200 | +€150/Mo (Monitoring) |
| 4+ Sequenzen bei Tier M (statt max. 3) | +€600 pro Sequenz | — |
| Hyper-Care verlängern (über Standard hinaus, pro Woche) | — | +€500/Woche |
| White-Label-Setup für Agentur-Wiederverkauf | +€4.000 – €8.000 | Auf Anfrage |
| Rush-Delivery (< 8 Wochen bei Tier M) | +20-30% auf Setup | — |