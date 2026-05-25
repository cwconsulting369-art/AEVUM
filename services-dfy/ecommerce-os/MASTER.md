---
title: AEVUM DFY — ecommerce-os
date: 2026-05-25
---

# AEVUM Done-for-You — ecommerce-os

> Generated 2026-05-25. Combined Master-Doc.

---

# 1. Sales-Brief


## In einem Satz

Wir bauen dir ein vollständiges operatives Backend für deinen Online-Shop: Order-Management, Inventory-Sync, Customer-Support-Automation und Reporting — alles verbunden, alles automatisiert, ohne dass du täglich ins System greifen musst.

---

## Wer das braucht

| Segment | Konkreter Use-Case | Fit-Rating |
|---|---|---|
| **AG** (Agenturen 3–50 MA) | Agentur managed mehrere Shop-Kunden, braucht ein skalierbares Backend-Template das sie für jeden Client deployen können; oder eigener Merch-/Kurs-Shop läuft halbmanuell | ★★★★☆ |
| **PB** (Personal Brands) | Creator/Experte betreibt Kurs-Shop, Merch-Store oder digitale Produkte — Orders laufen über 3 Tools, Support-Mails stapeln sich, Inventory ist Excel | ★★★☆☆ |
| **FI** (Mittelstand B2B, 10–100 MA) | B2B-Shop mit konfigurierbaren Produkten, Wiederverkäufer-Preisen, manuellen Fulfillment-Prozessen, Buchhaltungs-Übergabe die wöchentlich Stunden kostet | ★★★★★ |

---

## Was Customer bekommt

1. **Shop-Connector-Setup** — API-Integration von Shopify / WooCommerce / Shopware zu zentraler Daten-Schicht (bidirektional)
2. **Order-Management-System** — Automatisierte Order-Routing-Logik: Zahlungseingang → Fulfillment-Trigger → Status-Updates → Kundenbenachrichtigung, ohne manuelle Eingriffe
3. **Inventory-Sync-Layer** — Echtzeit-Abgleich zwischen Shop-Frontend, Lager-Tool (Warehouse / Sheet / ERP-Lite) und Lieferanten-Feed; Low-Stock-Alerts mit definierten Schwellwerten
4. **Customer-Support-Automation** — Ticket-Triage (Helpdesk-Integration: Freshdesk / Gorgias / Zendesk), automatische Antworten auf Top-10-FAQ-Kategorien, Eskalations-Routing zu Human-Agent
5. **Returns & Refund Workflow** — Standardisierter RMA-Prozess: Antrag → Prüfung → Approval/Rejection → Erstattungs-Trigger → Inventory-Rückbuchung
6. **Customer-Data-Hub** — Zentrales Kundenprofil: Kaufhistorie, LTV-Score, Segment-Tag (New / Repeat / VIP / At-Risk), Sync mit E-Mail-Marketing-Tool
7. **Reporting-Dashboard** — KPI-Board (GMV, AOV, Conversion, Return-Rate, Ticket-Volumen, Response-Time) mit täglichem Auto-Report an Operator
8. **Fulfillment-Partner-Integration** — Anbindung eines Fulfillment-Dienstleisters (3PL / Eigenlogistik) inkl. Tracking-Link-Automation und Versandbestätigungs-Flow
9. **Buchhaltungs-Export-Automatik** — Strukturierter Daten-Export (Rechnungen, Stornos, Gutschriften) an Steuerberater-Tool oder DATEV-kompatibler CSV-Output
10. **SOP-Dokumentation** — Schriftliche Betriebsanleitungen für alle automatisierten Flows + Video-Walkthroughs für die häufigsten Operator-Eingriffe

---

## Mehrwert (konkret)

### Vorher / Nachher

| Dimension | Vorher | Nachher | Schätzwert |
|---|---|---|---|
| Order-Bearbeitung | Manuell: Zahlung prüfen, Fulfillment auslösen, Kunde informieren | Vollautomatisch, trigger-basiert | **-4–8 Std./Woche** |
| Inventory-Fehler | Überverkäufe, falsche Bestände, Nachbestell-Vergessen | Echtzeit-Sync, automatische Alerts | **-80% Inventory-Fehler** |
| Support-Volumen | Jede WISMO-Mail landet beim Team | 60–70% der Standard-Tickets automatisch beantwortet | **-60% manueller Support-Aufwand** |
| Reporting | Monatliches manuelles Zusammenziehen aus 4 Tools | Täglicher Auto-Report, Echtzeit-Dashboard | **+3–5 Std./Monat zurückgewonnen** |
| Revenue-Sichtbarkeit | Umsatz wird erst Monatsende klar | Tagesaktuelle GMV/AOV-Sicht | **Schnellere Entscheidungen, geschätzter Revenue-Lift +5–12% durch besseres Replenishment + VIP-Identifikation** |
| Rückgabe-Prozess | Chaos: Mail-Thread, manueller Refund | Standardisiert, dokumentiert, schneller | **Reduzierte Bearbeitungszeit von Ø 3 Tagen auf <24h** |

---

## Pricing-Logic

| | **Tier M** | **Tier L** |
|---|---|---|
| **Setup-Range** | €8.000 – €14.000 | €18.000 – €40.000 |
| **Monthly Retainer** | €2.000 – €3.000 | €3.000 – €5.000 |
| **Scope-Profil** | 1 Shop-System, bis 5 Module, 1 Fulfillment-Partner, bis 500 Orders/Mo | 2+ Shop-Systeme oder Multi-Storefront, 8+ Module, komplexe ERP-Anbindung, >500 Orders/Mo |
| **Daten-Quellen** | Bis 4 (Shop + Payment + Fulfillment + Helpdesk) | Bis 8 (+ ERP, PIM, Marktplätze, Lieferanten-API) |
| **Reporting** | Standard-KPI-Board | Custom-Dashboard + automatische Anomalie-Alerts |
| **Support** | Async Retainer (Tickets, Monitoring, Optimierungen) | Dedicated CS + monatlicher Strategy-Call |
| **Implementation** | 6–8 Wochen | 10–14 Wochen |

> Setup-to-Retainer-Ratio ca. 3:1. Retainer deckt: Monitoring, Bug-Fixing, Flow-Optimierungen, monatliche KPI-Review.

---

## Timeline

| Phase | Woche | Inhalt |
|---|---|---|
| **Discovery & Architecture** | W1–2 | Tech-Stack-Audit, API-Prüfung, Flow-Mapping, Datenmodell-Design |
| **Core-Build** | W3–5 | Shop-Connector, Order-Flow, Inventory-Sync, Grundstruktur Customer-Hub |
| **Support & Returns** | W5–6 | Helpdesk-Integration, Ticket-Triage, RMA-Workflow |
| **Reporting & Exports** | W6–7 | Dashboard-Build, Buchhaltungs-Export, Alert-Konfiguration |
| **Testing & Hardening** | W7–8 | End-to-End-Tests mit echten Orders, Edge-Case-Handling, Fehler-Logs |
| **Handover & Go-Live** | W8 (M / W12–14 L) | Docs-Übergabe, Training, Monitoring-Setup, Go-Live-Freigabe |

---

## Voraussetzungen Customer

- Admin-Zugriff auf Shop-System (Shopify / WooCommerce / Shopware)
- API-Keys für Payment-Provider (Stripe / PayPal / etc.)
- Zugriff auf oder Entscheidung für Helpdesk-Tool
- Lager-/Inventory-Daten in strukturierter Form (Sheet, ERP-Export, o.ä.)
- Fulfillment-Partner-Kontakt mit API-Dokumentation oder EDI-Spec
- Benennung eines internen Ansprechpartners (mind. 2–3 Std./Woche Verfügbarkeit in Phase 1–2)
- Klare Entscheidung über Kernsortiment-Struktur (Varianten, Bundles, digitale vs. physische Produkte)

---

## Nicht-Ziele (Out-of-Scope)

1. **Shop-Design / Frontend-Entwicklung** — Kein Theme-Bau, kein UX-Redesign, keine Produktseiten-Optimierung
2. **SEO / Performance-Marketing** — Keine Ads, kein SEO-Setup, kein Google Shopping Feed
3. **Produktdaten-Migration** — Wir übernehmen keine manuelle Datenpflege oder Massenimport von Produktkatalogen (>500 SKU ohne strukturierten Export)
4. **Steuerberatung / Buchhaltungslogik** — Wir liefern Export-Automation, keine Steuerberatung oder USt-Konfiguration
5. **Custom ERP-Entwicklung** — Keine proprietären ERP-Schnittstellen ohne vorhandene API-Dokumentation
6. **Content / Produkttexte / Bilder** — Kein Content-Asset-Management, keine Bild-Bearbeitung
7. **Marktplatz-Listing-Management** — Kein Amazon Seller Central, kein eBay-Listing-Tool — nur Daten-Sync wenn API vorhanden
8. **Dauerbetrieb ohne Retainer** — Nach Handover ohne laufenden Retainer kein AEVUM-Monitoring

---

## Upsell-Pfade

| Trigger | Next Service |
|---|---|
| Customer will Ads schalten und Kampagnen-Performance sehen | `command-center-dashboard` — Cross-Tool KPI-Sicht inkl. Ad-Spend vs. GMV |
| Support-Volumen bleibt hoch, komplexere Anfragen häufen sich | `ai-lead-engine` (falls B2B) oder dedizierter AI-Chatbot-Build als Add-On |
| Reporting-Wunsch geht über Shop-KPIs hinaus (Finance, HR, ops-übergreifend) | `business-os` oder `database-system` |
| Customer will Inhalte rund um Shop-Produkte automatisieren | `content-engine` |
| Ad-Scripts für Shop-Produkte gebraucht | `script-factory-dfy` |
| Customer will Live-KPI-Board im Büro / für Team | `hud-command-center` |

---

## Conversion-Story

Die meisten E-Commerce-Operatoren, die zu uns kommen, haben das gleiche Problem: Der Shop läuft — irgendwie. Orders kommen rein, werden manuell bearbeitet, Kunden schreiben Mails die irgendwer irgendwann beantwortet, und am Monatsende sitzt jemand zwei Stunden und zieht Zahlen aus drei verschiedenen Tabs zusammen. Das System funktioniert — solange der Umsatz klein bleibt. Sobald Volumen kommt, bricht es.

Das AEVUM E-Commerce-OS ist nicht ein weiteres Tool, das du lernst und dann vergisst. Es ist ein operatives Rückgrat, das wir für dich bauen — auf deinen Stack, auf deine Produkte, auf deine Prozesse. Wir verbinden was schon da ist, automatisieren was täglich Stunden kostet, und geben dir ein Dashboard das dir morgens in 90 Sekunden zeigt, wo dein Business steht. Kein Raten. Keine blinden Flecken.

Was nach dem Go-Live passiert ist der eigentliche ROI: Dein Team bearbeitet keine Standard-Support-Tickets mehr. Deine Inventory-Fehler verschwinden. Deine Buchhalterin bekommt einmal wöchentlich einen sauberen Export statt monatliche Klärungsanrufe. Und du siehst zum ersten Mal wirklich, welche Kunden dein Business tragen — und kannst anfangen, gezielt in sie zu investieren. Das ist kein Luxus für große Shops. Das ist der Unterschied zwischen einem Business das dich besitzt, und einem das du besitzt.
\newpage

# 2. Scope-Checklist


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
\newpage

# 3. Delivery-Plan


---

## Phasen

### Phase 1: Discovery & Architecture — W1–W2

**Ziel:** Vollständiges Verständnis des bestehenden Tech-Stacks, Datenmodell finalisiert, Architektur abgenommen.

| Deliverable | Owner | Customer-Input benötigt |
|---|---|---|
| Tech-Stack-Audit-Dokument (API-Check für alle Tools) | Engineering | API-Keys, Tool-Zugänge |
| Flow-Map: Ist-Zustand (Order-Journey, Support-Journey, Inventory-Journey) | Founder / Engineering | Interview mit Customer-POC |
| Datenmodell-Entwurf (Produkte, Orders, Kunden, Inventory) | Engineering | Sortimentsstruktur-Info |
| Architektur-Skizze (Toolstack + Verbindungen + Datenfluss) | Engineering | — |
| Onboarding-Dokument: Customer-Zugang-Checkliste abgehakt | Customer Success | Alle Zugänge liefern |

**Customer-Touchpoint:** Kick-off Call (90 Min.) + Discovery-Interview (60 Min., W2)

---

### Phase 2: Core-Build — W3–W5

**Ziel:** Shop-Connector, Order-Management, Inventory-Sync laufen stabil in Staging.

| Deliverable | Owner | Customer-Input benötigt |
|---|---|---|
| Shop-API-Integration (bidirektional, Webhook-Setup) | Engineering | API-Keys freigegeben |
| Order-Routing-Flow (Zahlungseingang → Fulfillment → Notification) | Engineering | Fulfillment-Partner-Zugang |
| Storno- und Verzögerungs-Flow | Engineering | — |
| Inventory-Sync (Shop ↔ Lager-Tool, Schwellwerte konfiguriert) | Engineering | Lager-Daten im Ziel-Format |
| Überverkaufs-Schutz aktiv | Engineering | — |
| Fulfillment-Partner-Integration + Tracking-Automation | Engineering | Partner-API-Doku |

**Customer-Touchpoint:** Weekly Sync W3 (30 Min.) + Milestone-Review W5 (45 Min.) — Demo des Order-Flows live

**Quality-Gate intern:** Engineering-Sign-Off: Order-Flow 3x End-to-End getestet in Staging. Inventory-Sync delta <5 Min. verifiziert.

---

### Phase 3: Support & Returns — W5–W6

**Ziel:** Helpdesk-Integration läuft, Triage funktioniert, RMA-Flow komplett.

| Deliverable | Owner | Customer-Input benötigt |
|---|---|---|
| Helpdesk-Tool-Integration (Webhooks + API) | Engineering | Helpdesk-Admin-Zugang |
| Ticket-Triage-Logik (Tags, Kategorien, Routing-Regeln) | Engineering | Top-5-FAQ definiert von Customer |
| Auto-Antwort-Templates (5 Kategorien, dynamische Order-Daten) | Engineering + CS | Template-Texte vom Customer oder Freigabe für AEVUM-Entwürfe |
| Eskalations-Routing (Timeouts konfiguriert) | Engineering | — |
| RMA-Formular / Antragsstrecke live | Engineering | Retouren-Policy-Dokument vom Customer |
| Approval/Rejection-Flow + Inventory-Rückbuchung | Engineering | — |

**Customer-Touchpoint:** Weekly Sync W6 (30 Min.) — Demo Support-Triage + RMA-Flow

**Quality-Gate intern:** CS prüft: Triage-Trefferquote >90% auf 20 Test-Tickets. RMA-Flow 3x durchgetestet.

---

### Phase 4: Reporting & Exports — W6–W7

**Ziel:** Dashboard live, Auto-Reports konfiguriert, Buchhaltungs-Export läuft autonom.

| Deliverable | Owner | Customer-Input benötigt |
|---|---|---|
| KPI-Dashboard (GMV, AOV, Conversion, Return-Rate, Ticket-Volumen, Response-Time) | Engineering | — |
| Täglicher Auto-Report (E-Mail oder Slack) | Engineering | Ziel-Kanal und Empfänger |
| Customer-Segment-Tags live (New / Repeat / VIP / At-Risk) mit E-Mail-Tool-Sync | Engineering | E-Mail-Tool-Zugang und Segment-Definitions |
| Buchhaltungs-CSV-Export (wöchentlich automatisch) | Engineering | Pflichtfelder-Definition (ggf. mit Steuerberater abgestimmt) |

**Customer-Touchpoint:** Weekly Sync W7 (30 Min.) — Dashboard-Walkthrough

**Quality-Gate intern:** Founder-Check: Dashboard-Werte mit Roh-Daten aus Shop-Backend abgeglichen (Abweichung <2%). Export-CSV manuell auf Pflichtfelder geprüft.

---

### Phase 5: Testing & Hardening — W7–W8

**Ziel:** Alle Flows vollständig End-to-End getestet, Error-Handling aktiv, Silent-Fails eliminiert.

| Deliverable | Owner | Customer-Input benötigt |
|---|---|---|
| End-to-End-Test-Protokoll (alle Kern-Flows, 3 Durchläufe) | Engineering + CS | Zugriff auf echte Staging-Daten oder Testdaten |
| Fehler-Log-Analyse und Fixes | Engineering | — |
| Error-Notification-Setup (alle Flows haben Fallback + Alert) | Engineering | Benachrichtigungs-Kanal |
| Performance-Check (Latenz Shop-Sync, Webhook-Delivery-Rate) | Engineering | — |
| Dokumentation Review-Draft (SOP + Video-Script) | CS | Customer-POC für Review-Runde |

**Customer-Touchpoint:** UAT-Session (User Acceptance Testing) mit Customer-POC — W7/W8, 60 Min.

**Quality-Gate intern:** Engineering + CS Sign-Off gemeinsam: Kein Flow ohne Error-Handler. Test-Protokoll vollständig ausgefüllt. Customer-POC hat UAT-Freigabe gegeben.

---

### Phase 6: Handover & Go-Live — W8 (M) / W12–14 (L)

**Ziel:** Customer ist operativ eigenständig. Retainer-Monitoring aktiv.

| Deliverable | Owner | Customer-Input benötigt |
|---|---|---|
| SOP-Dokumentation final (alle Flows schriftlich) | CS | Final-Freigabe |
| Video-Walkthroughs (3–5 Loom-Videos) | CS | — |
| Access-Übergabe (Zugänge dokumentiert, AEVUM-Test-Keys revoked) | Engineering | Customer bestätigt Zugänge |
| Monitoring-Setup (Uptime-Alerts, Flow-Fehler-Alerts, Weekly Health-Check) | Engineering | — |
| Retainer-Kickoff (Async-Ticket-System erklärt, SLA kommuniziert) | CS | — |
| Go-Live-Freigabe (schriftliche Bestätigung Customer) | CS | Schriftlich |

**Customer-Touchpoint:** Handover-Call (60 Min.) + Go-Live-Bestätigung schriftlich

---

## Team-Allocation

| Rolle | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|---|---|---|---|---|---|---|
| **Founder** | Kick-off, Architektur-Review | Milestone-Gate | — | Dashboard-Check | Final Sign-Off | Go-Live-Freigabe |
| **Engineering** | Tech-Audit, Datenmodell | Core-Build (Vollzeit) | Support/RMA-Build | Reporting-Build | Testing, Fixes | Monitoring-Setup |
| **Customer Success** | Onboarding-Dok, Discovery | Weekly Syncs | Template-Koordination, Triage-Test | Dashboard-Walkthrough | UAT-Begleitung, Doku-Draft | Handover-Call, Retainer-Kickoff |

---

## Customer-Onboarding-Touchpoints

| Touchpoint | Timing | Format | Dauer | Owner |
|---|---|---|---|---|
| **Kick-off Call** | W1, Tag 2–3 | Video-Call | 90 Min. | Founder + CS |
| **Discovery-Interview** | W2 | Video-Call | 60 Min. | Engineering + CS |
| **Weekly Sync** | Jede Woche (W3–W7) | Video-Call oder Async-Loom | 30 Min. | CS |
| **Milestone-Review: Core-Build** | W5 | Video-Call mit Live-Demo | 45 Min. | Engineering + CS |
| **Milestone-Review: Support/RMA** | W6 | Video-Call mit Live-Demo | 30 Min. | Engineering |
| **UAT-Session** | W7–W8 | Video-Call, Customer testet live | 60 Min. | CS + Customer-POC |
| **Handover-Call** | W8 (M) / W12–14 (L) | Video-Call | 60 Min. | CS + Founder |
| **Retainer-Monatliches Update** | Laufend | Async Report + optionaler Call | 30 Min. | CS |

---

## Risk-Register

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Fulfillment-Partner hat keine stabile API oder inkonsistente Doku | Mittel | Hoch | API-Check in W1 als Blocker-Gate. Wenn keine API: EDI-Fallback evaluieren oder manuelle Übergabe-Workflow als Interim. Scope-Anpassung in CR kommunizieren. |
| **R2** | Customer-POC nicht verfügbar oder Feedback-Loops >48h | Mittel | Mittel | Klare Verfügbarkeits-Vereinbarung im Kick-off. Bei 2x Delay: formelle Warnung, Zeitplan-Verschiebung auf Customer-Konto kommuniziert. |
| **R3** | Lager-Daten nicht strukturiert oder in proprietärem Format | Mittel | Hoch | Früh in W1 prüfen. Wenn nicht strukturiert: Interim-Sheet-Lösung als Connector, aber Mehraufwand als CR. Clean-Data als Voraussetzung explizit kommuniziert. |
| **R4** | Tool-Entscheidung (Helpdesk) ändert sich nach W3 | Niedrig | Hoch | Tool-Festlegung als hartes Gate vor Phase 3. Jeder Wechsel danach = CR + Zeitverschiebung, schriftlich bestätigt. |
| **R5** | Webhooks / API-Limits des Shop-Systems (Rate-Limiting) bei hohem Volumen | Niedrig (Tier M) / Mittel (Tier L) | Mittel | In Architecture-Phase Rate-Limits dokumentieren. Queue-Mechanismus einbauen wenn >500 Orders/Mo erwartet. In Tier-L standard. |

---

## Quality-Gates

| Gate | Zeitpunkt | Prüfer | Kriterium |
|---|---|---|---|
| **Gate 1: Architecture Sign-Off** | Ende W2 | Founder | Datenmodell vollständig, alle APIs erreichbar und dokumentiert, Architektur-Skizze genehmigt |
| **Gate 2: Core-Build Sign-Off** | Ende W5 | Engineering | Order-Flow 3x End-to-End erfolgreich, Inventory-Sync-Delta <5 Min., Fehler-Log leer |
| **Gate 3: Support & RMA Sign-Off** | Ende W6 | CS | Triage-Trefferquote >90%, RMA 3x durchgetestet, keine Silent-Fails |
| **Gate 4: Reporting Sign-Off** | Ende W7 | Founder | Dashboard-Werte verifiziert (<2% Abweichung), Export-CSV geprüft, Auto-Report live |
| **Gate 5: UAT Sign-Off** | W7–W8 | Customer-POC | Customer hat alle Kern-Flows selbst durchgeklickt und schriftlich freigegeben |
| **Gate 6: Go-Live Sign-Off** | W8 (M) / W14 (L) | Founder + CS | Handover-Package vollständig, Monitoring aktiv, schriftliche Go-Live-Bestätigung Customer vorhanden |

---

## Handover-Package

| Asset | Format | Ablage |
|---|---|---|
| SOP-Dokumentation alle Haupt-Flows | Notion / PDF | Customer-Notion-Workspace oder Google Drive |
| Video-Walkthroughs (3–5 Loom-Videos) | Loom-Links + MP4-Download | Shared Drive |
| Architektur-Übersicht (Tool-Map + Datenfluss) | Miro / PDF | Shared Drive |
| API-Keys & Zugänge-Dokumentation | Passwort-Manager-Export (1Password / Bitwarden) | Sicher an Customer übergeben |
| Test-Protokoll (abgenommene Flows) | PDF | Shared Drive |
| Change-Request-Log (falls CRs während Setup) | Notion / PDF | Shared Drive |
| Monitoring-Anleitung (wie Alerts lesen, wie eskalieren) | Notion-Seite | Customer-Notion-Workspace |
| Retainer-SLA-Dokument | PDF | E-Mail + Shared Drive |
| Buchhaltungs-Export-Konfiguration | Inline in SOP | — |
| Kontakt- und Eskalations-Pfad AEVUM | Notion-Seite | Customer-Notion-Workspace |
\newpage

# 4. Quality-Gate


**Projekt-Slug:** `ecommerce-os`
**Typ:** DFY
**Status zum Zeitpunkt dieses Dokuments:** [ ] In Progress / [ ] Ready for Sign-Off / [ ] Signed Off

---

## Asset-Inventar

| # | Asset | Typ | Status | Ablage-Link |
|---|---|---|---|---|
| 1 | Shop-API-Connector (bidirektional) | Integration | [ ] | — |
| 2 | Order-Routing-Flow (Paid → Fulfilled → Notified) | Automation | [ ] | — |
| 3 | Storno- und Verzögerungs-Flow | Automation | [ ] | — |
| 4 | Inventory-Sync (Shop ↔ Lager, Schwellwerte) | Integration + Automation | [ ] | — |
| 5 | Überverkaufs-Schutz | Automation | [ ] | — |
| 6 | Fulfillment-Partner-Integration + Tracking-Automation | Integration | [ ] | — |
| 7 | Helpdesk-Integration + Triage-Logik | Integration + Automation | [ ] | — |
| 8 | Auto-Antwort-Templates (5 Kategorien) | Automation | [ ] | — |
| 9 | Eskalations-Routing | Automation | [ ] | — |
| 10 | RMA-Formular + Approval/Rejection-Flow | Form + Automation | [ ] | — |
| 11 | Inventory-Rückbuchung nach Retoure | Automation | [ ] | — |
| 12 | Customer-Hub (Kundenprofil, LTV, Segment-Tags) | Datenmodell + Integration | [ ] | — |
| 13 | E-Mail-Marketing-Tool-Sync (Segment-Tags) | Integration | [ ] | — |
| 14 | KPI-Dashboard | Reporting | [ ] | — |
| 15 | Täglicher Auto-Report | Automation | [ ] | — |
| 16 | Buchhaltungs-CSV-Export (wöchentlich) | Automation | [ ] | — |
| 17 | SOP-Dokumentation (alle Haupt-Flows) | Doku | [ ] | — |
| 18 | Video-Walkthroughs (3–5 Loom-Videos) | Doku | [ ] | — |
| 19 | Architektur-Übersicht (Tool-Map + Datenfluss) | Doku | [ ] | — |
| 20 | Test-Protokoll (abgenommene Flows) | Doku | [ ] | — |
| 21 | Monitoring-Setup (Alerts, Health-Check) | Infra | [ ] | — |
| 22 | Zugänge-Dokumentation (übergeben an Customer) | Doku | [ ] | — |

---

## Sign-Off-Kriterien

Alle 10 Punkte müssen ✅ sein bevor Go-Live-Freigabe erteilt wird.

| # | Kriterium | Status |
|---|---|---|
| 1 | Order-Flow (Paid → Fulfilled → Customer-Notification) hat 3 erfolgreiche End-to-End-Durchläufe in Produktionsumgebung ohne manuelle Eingriffe absolviert | [ ] ✅ |
| 2 | Inventory-Sync: Bestandsänderung im Lager schlägt innerhalb von 5 Minuten im Shop-Frontend durch; Überverkaufs-Schutz aktiv getestet und bestätigt | [ ] ✅ |
| 3 | Support-Triage kategorisiert >90% der Testtickets (20 Testfälle) korrekt; Auto-Antworten triggern fehlerfrei auf allen 5 konfigurierten Kategorien | [ ] ✅ |
| 4 | RMA-Flow (Antrag → Approval → Inventory-Rückbuchung) hat 3 Test-Retouren vollständig durchlaufen ohne manuelle Eingriffe | [ ] ✅ |
| 5 | KPI-Dashboard zeigt korrekte Werte mit max. 2% Abweichung von Shop-Backend-Rohdaten; täglicher Auto-Report ist im Ziel-Kanal angekommen (mind. 2 Test-Sends) | [ ] ✅ |
| 6 | Buchhaltungs-CSV-Export enthält alle Pflichtfelder ohne NULL-Werte und hat mindestens 1 automatischen Testlauf absolviert | [ ] ✅ |
| 7 | Kein Haupt-Flow hat einen Silent-Fail: alle Flows haben definierten Error-Handler + Alert-Notification bei Fehler | [ ] ✅ |
| 8 | Customer-POC hat UAT-Session abgeschlossen und alle Kern-Flows selbst durchgeklickt; schriftliche UAT-Freigabe liegt vor | [ ] ✅ |
| 9 | SOP-Dokumentation von Customer-POC geprüft und freigegeben; alle Video-Walkthroughs hochgeladen und verlinkt; Test-Protokoll vollständig ausgefüllt | [ ] ✅ |
| 10 | Monitoring aktiv (Uptime-Alerts, Flow-Fehler-Alerts, Weekly Health-Check konfiguriert); schriftliche Go-Live-Bestätigung des Customers liegt vor | [ ] ✅ |

---

## Known-Limitations (Phase-2-Items / Explizit nicht in diesem Scope)

| # | Limitation | Begründung / Kontext |
|---|---|---|
| L1 | Ticket-Automation basiert auf Rules und Templates — kein LLM-basiertes dynamisches Antworten | LLM-Integration ist separates Add-On (CR / eigenes Angebot). Customer-Erwartung muss explizit gesetzt sein. |
| L2 | Inventory-Sync deckt 1 Lager-Standort ab (Tier M) | Multi-Warehouse-Sync erfordert Datenmodell-Erweiterung — nicht in Standard-Scope |
| L3 | Buchhaltungs-Export ist CSV/DATEV-Format — keine direkte Buchhalter-Software-Integration (Lexoffice-API etc.) | Direkte Buchhalter-Tool-API-Integration ist Add-On |
| L4 | Customer-Segment-Logik (VIP/At-Risk) basiert auf definierten statischen Schwellwerten — kein ML-basiertes Scoring | Predictive LTV-Scoring ist Phase-2-Feature, erfordert Datenhistorie von mind. 6 Monaten |
| L5 | Kein A/B-Testing der Auto-Antwort-Templates im Scope | Kann in Retainer-Phase als Optimierungs-Item aufgenommen werden |
| L6 | Fulfillment: nur 1 Partner. Zweiter Partner = CR | Im Pricing-Variations-Dokument kommuniziert |
| L7 | Dashboard ohne Anomalie-Detection / automatische Alerts auf Ausreißer (Tier M) | Anomalie-Detection in Tier L enthalten oder als Retainer-Optimierung |

---

## DB-Update-Befehl

```sql
-- AEVUM Service-Item Sign-Off: ecommerce-os
UPDATE aevum_service_items
SET
  status                = 'signed_off',
  delivery_phase        = 'handover',
  sign_off_date         = CURRENT_DATE,
  sign_off_by           = 'AEVUM_FOUNDER', -- ggf. ersetzen mit tatsächlichem User-ID
  quality_gate_passed   = TRUE,
  known_limitations_doc = TRUE,
  handover_package_sent = TRUE,
  retainer_active       = TRUE,
  updated_at            = NOW()
WHERE
  item_slug = 'ecommerce-os'
  AND customer_id = :customer_id; -- Platzhalter ersetzen

-- Delivery-Log-Eintrag
INSERT INTO aevum_delivery_log (
  item_slug,
  customer_id,
  event_type,
  event_note,
  event_date,
  logged_by
) VALUES (
  'ecommerce-os',
  :customer_id,
  'SIGN_OFF',
  'All 10 quality gates passed. Handover package delivered. Retainer activated.',
  CURRENT_DATE,
  'AEVUM_FOUNDER'
);
```

---

## Pattern-Notes für DFY-Builder-Pattern

```
PATTERN: ecommerce-os
Typ: Multi-Module DFY mit Integrations-Kernstück

Wichtigste Differenzierungen vs. andere DFY-Items:
- Höchste Anzahl externer API-Abhängigkeiten aller DFY-Items (Shop + Payment + Helpdesk + Fulfillment + Email + Lager)
  → API-Check muss härtestes Gate in Phase 1 sein. Kein Weiterreden ohne bestätigte API-Verfügbarkeit.

- Datenmodell-Entscheidung in W1–W2 ist irreversibel ohne CR
  → Founder muss Architecture Sign-Off aktiv abnehmen, nicht delegieren.

- Customer-POC-Verfügbarkeit ist kritischer als bei anderen Items
  → Ohne 2–3 Std./Woche POC in Phase 1: Scope-Qualität leidet. Klare Commitment-Vereinbarung im Kick-off.

- Inventory-Datenqualität ist häufigster praktischer Blocker
  → Lager-Daten in W1 anfordern und Struktur prüfen. Wenn unklar: 1 Woche Buffer einplanen.

- Fulfillment-Partner-API ist Wildcard
  → Immer Worst-Case-Scenario (kein stabiles API) als Fallback vorbereiten.

Retainer-Muster post-Handover:
- Monat 1: Bug-Fixing-Window — kein CR für Scope-Items. Fokus Stabilisierung.
- Monat 2+: Optimierungs-Items aus Known-Limitations adressieren. Upsell-Trigger: Reporting-Wünsche → database-system / hud-command-center.

Preispositionierung:
- Tier M eignet sich für PB und kleinere AG-Clients mit klarem 1-Shop-Setup.
- Tier L für FI mit ERP-Touch oder Multi-Channel.
- Setup-to-Retainer-Ratio 3:1 hält. Bei ERP-Add-On steigt Retainer überproportional (Monitoring-Aufwand).

Nächste Pattern-Verbesserung:
- Checkliste für Fulfillment-Partner-API-Readiness als separates Mini-Dokument sinnvoll (häufigster Blocker).
- Muster für DSGVO-Compliance-Check Customer-Daten als Onboarding-Schritt formalisieren.
```