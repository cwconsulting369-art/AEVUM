# AEVUM E-Commerce-OS — DFY Service

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