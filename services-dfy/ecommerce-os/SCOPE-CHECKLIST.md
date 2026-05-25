# AEVUM E-Commerce-OS — Scope-Checklist (intern, Sales-Call)

---

## In-Scope

| Kategorie | Item | Aufwand-Estimate |
|---|---|---|
| **Discovery** | Tech-Stack-Interview, API-Verfügbarkeits-Check, bestehende Flow-Dokumentation | 6–10 Std. |
| **Discovery** | Datenmodell-Design (Produkte, Orders, Kunden, Inventory) | 4–8 Std. |
| **Shop-Connector** | Shopify / WooCommerce / Shopware API-Integration (read + write) | 8–16 Std. |
| **Shop-Connector** | Webhook-Setup für Order-Events (created, paid, fulfilled, cancelled, refunded) | 4–6 Std. |
| **Order-Management** | Order-Routing-Logik (Zahlungseingang → Fulfillment-Trigger) | 6–10 Std. |
| **Order-Management** | Automatische Kunden-Benachrichtigungen (Bestätigung, Versand, Delay) | 4–6 Std. |
| **Order-Management** | Storno-Flow (automatische Stornierung + Refund-Trigger bei definierten Bedingungen) | 4–6 Std. |
| **Inventory-Sync** | Bidirektionaler Sync Shop ↔ Lager-Tool (1 Lager-System) | 8–14 Std. |
| **Inventory-Sync** | Low-Stock-Alert-Automation (definierte Schwellwerte, Benachrichtigungs-Route) | 3–5 Std. |
| **Inventory-Sync** | Überverkaufs-Schutz (Auto-Deaktivierung bei Null-Bestand) | 2–4 Std. |
| **Customer-Support** | Helpdesk-Integration (1 Tool: Gorgias / Freshdesk / Zendesk) | 6–10 Std. |
| **Customer-Support** | Ticket-Triage-Logik (Kategorisierung nach Tags: WISMO, Retoure, Beschwerde, Sonstiges) | 4–6 Std. |
| **Customer-Support** | Auto-Antworten Top-5-FAQ-Kategorien (Templates + dynamische Daten aus Order-API) | 6–10 Std. |
| **Customer-Support** | Eskalations-Routing (ungelöste Tickets nach X Stunden an Human-Agent) | 2–4 Std. |
| **Returns & Refunds** | RMA-Formular / Antragsstrecke (eingebettet oder per Link) | 4–8 Std. |
| **Returns & Refunds** | Approval/Rejection-Workflow + Kundenbenachrichtigung | 3–5 Std. |
| **Returns & Refunds** | Inventory-Rückbuchung nach Retouren-Eingang | 3–5 Std. |
| **Customer-Hub** | Zentrales Kundenprofil-Datenmodell (Kaufhistorie, LTV, Segment-Tag) | 6–10 Std. |
| **Customer-Hub** | Sync mit E-Mail-Tool (1 Tool: Klaviyo / Mailchimp / ActiveCampaign — Segment-Tags pushen) | 4–6 Std. |
| **Fulfillment** | 1 Fulfillment-Partner-Integration (API oder EDI — vorausgesetzt: vorhandene Doku) | 8–14 Std. |
| **Fulfillment** | Tracking-Link-Automation (Tracking-ID → Kunden-Benachrichtigung) | 3–5 Std. |
| **Reporting** | KPI-Dashboard-Setup (GMV, AOV, Conversion, Return-Rate, Ticket-Volumen) | 8–12 Std. |
| **Reporting** | Täglicher Auto-Report (E-Mail oder Slack-Nachricht an Operator) | 2–4 Std. |
| **Buchhaltungs-Export** | Strukturierter CSV/DATEV-Export (Rechnungen, Stornos, Gutschriften) — wöchentlich automatisiert | 4–6 Std. |
| **Dokumentation** | SOP für alle Haupt-Flows (schriftlich) | 6–10 Std. |
| **Dokumentation** | Video-Walkthroughs (3–5 Loom-Videos für Operator-Eingriffe) | 4–6 Std. |
| **Testing** | End-to-End-Tests mit echten oder Testdaten (je 3 Durchläufe pro Kern-Flow) | 8–12 Std. |

**Gesamt-Aufwand-Range Tier M:** 120–180 Std. | **Tier L:** 200–320 Std.

---

## Out-of-Scope

| Bereich | Was Customer NICHT bekommt |
|---|---|
| Frontend / Design | Kein Shop-Design, kein Theme, keine Produktseiten-Arbeit |
| SEO / Marketing | Kein Ads-Setup, kein SEO, kein Google Shopping Feed |
| Produktdaten | Kein manueller Produktimport, keine Katalog-Pflege, keine Massenübersetzungen |
| Steuer / Compliance | Keine USt-Konfiguration, keine steuerliche Prüfung der Export-Daten |
| ERP-Custom-Dev | Keine proprietären Schnittstellen ohne vorhandene API-Docs |
| Mehrere Shop-Systeme (Tier M) | Bei Tier M: nur 1 Shop-Plattform konfiguriert |
| Marktplatz-Management | Kein Amazon/eBay-Listing-Tool — Sync nur wenn stabile API vorhanden |
| KI-Chatbot-Development | Ticket-Automation ≠ Custom-AI-Chatbot — Templates und Rules, kein LLM-Training |
| Mehrsprachigkeit | Kein Multi-Language-Support für Kunden-Benachrichtigungen (außer als Add-On) |
| Backup / Hosting | Keine Infrastruktur-Verantwortung für Shop-Hosting oder Datenbankserver |
| On-Site-Präsenz | Kein physischer Vor-Ort-Einsatz beim Customer |

---

## Voraussetzungen Customer-Side

| Bereich | Konkrete Anforderung | Risiko wenn nicht vorhanden |
|---|---|---|
| **Access** | Admin-API-Zugang: Shop-System, Payment-Provider, Helpdesk | Verzögerung Phase 1, ggf. +1–2 Wochen |
| **Access** | Fulfillment-Partner API-Key + Doku | Ohne: Fulfillment-Modul manuell fallback — kein vollautomatischer Flow |
| **Daten** | Lager-Daten in strukturiertem Format (Export aus ERP / Sheet / WMS) | Ohne: Inventory-Sync nicht möglich in Woche 3–4 |
| **Daten** | Kundendaten DSGVO-konform (Consent für Marketing-Sync dokumentiert) | Rechtliches Risiko auf Customer-Seite — AEVUM baut nur was Customer freigibt |
| **Tool-Entscheidung** | Verbindliche Entscheidung Helpdesk-Tool vor Woche 3 | Spätere Tool-Wechsel = Change Request |
| **Ansprechpartner** | Fester interner POC, 2–3 Std./Woche in Phase 1–2 | Discovery-Qualität leidet direkt |
| **Sortiment** | Klares Produktmodell (Varianten-Logik, Bundles, digital vs. physisch entschieden) | Fehlentscheidungen in Datenmodell kosten 10–20 Std. Nacharbeit |
| **Zeit-Commitment** | Feedback-Loops: Antwort innerhalb 48h auf Review-Anfragen | Verzögerungen verschieben Go-Live — AEVUM nicht verantwortlich |

---

## Quality-Standards

AEVUM erklärt einen Scope-Bereich als "Done" wenn:

| Standard | Kriterium |
|---|---|
| **Order-Flow** | 3 erfolgreiche End-to-End-Durchläufe (paid → fulfilled → notified) in Produktionsumgebung oder Staging mit echten Webhooks |
| **Inventory-Sync** | Bestandsänderung im Lager-Tool schlägt innerhalb von 5 Minuten auf Shop-Frontend durch; Überverkaufs-Schutz aktiv getestet |
| **Support-Automation** | Ticket-Triage kategorisiert >90% der Testtickets korrekt; Auto-Antworten triggern fehlerfrei auf definierten Kategorien |
| **RMA-Flow** | Retouren-Antrag → Approval → Inventory-Rückbuchung läuft ohne manuelle Eingriffe durch in Test-Szenario |
| **Reporting** | Dashboard zeigt korrekte Werte (Abweichung <2% zu Roh-Daten), täglicher Report landet zuverlässig in Ziel-Kanal |
| **Export** | Buchhaltungs-CSV enthält alle Pflichtfelder, kein NULL in Pflichtfeldern, Export läuft wöchentlich autonom |
| **Dokumentation** | Alle SOP-Dokumente von Customer-POC geprüft und abgezeichnet; Videos vollständig hochgeladen und verlinkt |
| **Fehlerbehandlung** | Alle Haupt-Flows haben definierte Fallback-Pfade und Error-Notification (kein Silent-Fail) |

---

## Change-Request-Policy

| Situation | Regelung |
|---|---|
| Scope-Erweiterung im Retainer (klar kleines Item <4 Std.) | Wird im Retainer absorbiert wenn Kapazität vorhanden — dokumentiert im Monthly-Log |
| Scope-Erweiterung Setup-Phase (>4 Std., neues Modul) | Formeller Change Request: schriftliche Beschreibung, Aufwand-Estimate, Freigabe durch Customer vor Start. +€800–2.500 je nach Komplexität |
| Tool-Wechsel nach Start (z.B. Helpdesk-Wechsel in W4) | Immer Change Request, da Rebuild. Minimum +€1.500 + Zeitplan-Verschiebung |
| Anforderungs-Änderung am Datenmodell nach W2 | CR erforderlich — Datenmodell-Änderungen späte Phase = hoher Rebuild-Aufwand |
| Bugs innerhalb definiertem Scope nach Go-Live | Im Retainer abgedeckt (30 Tage Bug-Fixing-Window nach Go-Live ohne CR) |

---

## Pricing-Variations

| Add-On / Variation | Preis-Impact Setup | Impact Retainer |
|---|---|---|
| 2. Shop-Plattform (Shopify + WooCommerce parallel) | +€3.000 – €5.000 | +€500/Mo |
| 1 zusätzlicher Marktplatz-Sync (Amazon / eBay mit API) | +€2.000 – €3.500 | +€300/Mo |
| Multi-Language-Kunden-Benachrichtigungen (je Sprache) | +€500 – €800/Sprache | — |
| 2. Fulfillment-Partner | +€1.500 – €2.500 | +€200/Mo |
| Komplexe ERP-Integration (SAP, NAVISION — vorhandene API) | +€5.000 – €12.000 | +€500–800/Mo |
| Custom AI-Ticket-Antworten (LLM-basiert, kein Template) | +€3.000 – €6.000 | +€400/Mo |
| Subscription/Abo-Commerce-Logik (Recurring Orders) | +€2.500 – €4.000 | +€300/Mo |
| POS-Integration (Stationäres Geschäft + Online-Sync) | +€2.000 – €3.500 | +€300/Mo |
| Dedizierter Monthly Strategy-Call + Quarterly Review | — | +€500/Mo |