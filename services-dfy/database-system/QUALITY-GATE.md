# Quality-Gate — Database System (DFY)

**Dokument-Typ:** Sign-Off-Doku  
**Verwendet bei:** Handover-Zeitpunkt, intern vor Übergabe an Customer  
**Status-Marker:** ✅ = bestanden | ⏳ = ausstehend | ❌ = nicht bestanden

---

## Asset-Inventory

| # | Asset | Format | Location | Status |
|---|---|---|---|---|
| 1 | Source-Inventory-Dokument | Google Doc / Notion | [Link] | ⏳ |
| 2 | KPI-Glossar (finalisiert, Customer-freigegeben) | Google Doc / Notion | [Link] | ⏳ |
| 3 | Data-Quality-Report (alle Quellen) | Google Doc | [Link] | ⏳ |
| 4 | Datenbankschema / ERD | PNG + PDF | [Link] | ⏳ |
| 5 | Tabellen-Glossar (alle Felder, Deutsch) | Notion / Google Doc | [Link] | ⏳ |
| 6 | ETL-Pipeline-Code / Konfiguration (dokumentiert) | Git-Repo oder Notion | [Link] | ⏳ |
| 7 | Refresh-Scheduler-Konfiguration | Intern dokumentiert | [Link] | ⏳ |
| 8 | Fehler-Handling-Dokumentation | Intern | [Link] | ⏳ |
| 9 | Validierungs-Dokument mit Customer-Sign-Off | Google Doc | [Link] | ⏳ |
| 10 | Dashboard-Set (alle vereinbarten Boards) | Reporting-Tool | [Link] | ⏳ |
| 11 | Alerting-Konfiguration (dokumentiert) | Reporting-Tool / Doc | [Link] | ⏳ |
| 12 | SOP: neue Quelle hinzufügen | Google Doc | [Link] | ⏳ |
| 13 | SOP: KPI anpassen | Google Doc | [Link] | ⏳ |
| 14 | Video-Walkthrough Pipeline (Loom) | Loom-Link | [Link] | ⏳ |
| 15 | Recording Onboarding-Session | Zoom-Link | [Link] | ⏳ |
| 16 | Zugänge übergeben (Credentials dokumentiert) | 1Password / Sec. Doc | [Link] | ⏳ |
| 17 | Retainer-Scope-Doku (1-pager) | PDF | [Link] | ⏳ |

---

## Sign-Off-Kriterien

Alle 10 Kriterien müssen ✅ sein. Kein Handover bei offenen ❌.

| # | Kriterium | Status | Notiz |
|---|---|---|---|
| 1 | Alle vereinbarten Datenquellen verbunden und Pipeline läuft ≥ 5× fehlerfrei durch automatischen Refresh | ⏳ | Datum letzter erfolgreicher Run: [DATUM] |
| 2 | Daten-Validierung: alle KPI-Abweichungen < 2% oder dokumentiert + erklärt. Customer-Sign-Off schriftlich vorhanden. | ⏳ | Sign-Off-Email von: [KONTAKT], Datum: [DATUM] |
| 3 | Alle vereinbarten KPIs im Dashboard vorhanden und korrekt berechnet (laut KPI-Glossar) | ⏳ | Geprüft durch: [ENG-NAME] |
| 4 | Alle vereinbarten Dashboards funktionieren im gewählten Reporting-Tool. Filter korrekt. Mobile-Grundfunktion gegeben. | ⏳ | |
| 5 | Alerting aktiv: mind. 1 Test-Alert je konfiguriertem Alert ausgelöst und vom Customer-Empfänger bestätigt empfangen | ⏳ | Test-Datum: [DATUM] |
| 6 | Fehler-Handling in Pipeline dokumentiert und getestet: was passiert wenn Quelle X nicht erreichbar ist? | ⏳ | |
| 7 | Dokumentation vollständig: ERD + Tabellen-Glossar + beide SOPs zugänglich und von CS reviewed | ⏳ | CS-Review durch: [CS-NAME] |
| 8 | Video-Walkthrough (Loom) fertig, zugänglich, Länge ≥ 20 Min, deckt alle Pipeline-Komponenten ab | ⏳ | Loom-Link: [LINK] |
| 9 | Onboarding-Session durchgeführt (≥ 2h, aufgezeichnet). Customer hat schriftlich bestätigt, System selbst bedienen zu können. | ⏳ | Bestätigung von: [KONTAKT], Datum: [DATUM] |
| 10 | Kein offener Bug P0 oder P1 zum Handover-Zeitpunkt. Offene P2-Bugs dokumentiert mit Retainer-Bearbeitung kommuniziert. | ⏳ | Offene P2-Bugs: [ANZAHL], dokumentiert in [LINK] |

---

## Known Limitations (Phase-2-Items)

Diese Punkte sind bewusst nicht Teil des initialen Setups. Sie sind dokumentiert für Retainer-Roadmap oder Upsell:

| # | Limitation | Warum nicht in Phase 1? | Empfohlener Zeitpunkt |
|---|---|---|---|
| L1 | Prädiktive Analysen / ML-basierte Forecasts | Erfordert mind. 12 Monate Historik + separate Architektur | Nach 6–12 Monaten Retainer |
| L2 | Weitere Datenquellen über Grundpaket hinaus | Scope-Grenze. Neue Quellen = neue Komplexität. | Quartalsweise im Retainer (1 Quelle/Quartal enthalten) |
| L3 | Granularere Daten-Historik (über Erstbefüllung hinaus) | APIs liefern nur begrenzten Rückblick. Historik-Erweiterung über Archivierungs-Pipeline möglich. | Bei Bedarf als CR |
| L4 | Self-Service-KPI-Builder für Customer (ohne AEVUM) | Würde deutlich komplexeres Frontend erfordern. | Bei hohem Bedarf: Upsell auf erweitertes Reporting-Tool |
| L5 | Automatische Anomalie-Detection (Outlier-Flagging) | Erfordert Baseline-Daten über mind. 3 Monate + separate Logik | Tier L Add-on nach Stabilisierungsphase |
| L6 | White-Label-Zugang für Kunden des Customers (Agentur-Use-Case) | User-Management und Multi-Tenancy deutlich komplexer | Separater Scope, separates Angebot |

---

## DB-Update-Befehl

```sql
-- AEVUM Internal: DFY Item Sign-Off
UPDATE dfy_items
SET
  status            = 'delivered',
  handover_date     = CURRENT_DATE,
  quality_gate_passed = TRUE,
  phase2_items      = ARRAY[
    'ml-forecasting',
    'additional-sources-beyond-scope',
    'extended-data-history',
    'self-service-kpi-builder',
    'anomaly-detection',
    'white-label-multi-tenant'
  ],
  retainer_active   = TRUE,
  notes             = 'All 10 sign-off criteria passed. Known limitations documented. Retainer scope communicated.'
WHERE
  item_slug = 'database-system'
  AND customer_id = [CUSTOMER_ID];  -- REPLACE before executing
```

---

## Pattern-Notes für DFY-Builder-Pattern

**Was macht `database-system` strukturell anders als andere DFY-Items:**

1. **Validierungsphase ist kritischer Differentiator** — Im Gegensatz zu z.B. `content-engine` oder `command-center-dashboard` gibt es hier eine explizite Daten-Validierungsphase die Customer-Input (Referenz-Zahlen) zwingend erfordert. Ohne diese Phase kein vertrauenswürdiges System. In anderen Items ist Validierung intern — hier ist sie bilateral.

2. **Zugänge-Dependency ist der häufigste Blocker** — API-Keys, OAuth-Zugänge, IT-Freigaben. Das ist bei keinem anderen Item so ausgeprägt. In Sales-Calls früh ansprechen: "Haben Sie eine IT-Abteilung mit Freigabeprozessen?" — wenn ja, diese Person muss in W1 dabei sein, nicht erst in W3.

3. **Transformation-Layer ist die unsichtbare Komplexität** — Customer sieht die Dashboards, nicht die Transformation. Fehler im Transformation-Layer (falsche Dedup-Logik, falsche KPI-Berechnung) sind schwer sichtbar und teuer zu fixen. QG-2 und QG-3 existieren genau deswegen. Nie Phase 4 starten ohne QG-3 schriftlich abgenommen.

4. **Retainer ist strukturell notwendig, nicht optional** — APIs ändern sich. Felder werden umbenannt. Rate-Limits verändern sich. Das ist keine Verkaufsstrategie, das ist Realität von API-basierten Pipelines. Im Sales-Gespräch klar kommunizieren: ohne Retainer ist das System nach 6–12 Monaten kaputt.

5. **Pricing-Eskalation kommt fast immer aus Quellen-Anzahl** — Nicht aus Dashboard-Komplexität. Die wichtigste Scope-Frage im Sales-Call: "Zählen wir gemeinsam die Quellen." Jede Quelle über das Paket hinaus ist reale Arbeitszeit.

---