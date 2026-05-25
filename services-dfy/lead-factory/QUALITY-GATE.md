# Lead Factory — Quality-Gate & Sign-Off

## Asset-Inventar

| # | Asset | Format | Erstellt | Übergeben | Location |
|---|---|---|---|---|---|
| 1 | ICP-Workshop-Protokoll | Notion-Doc | Phase 1 | Ja | `/customer/[slug]/discovery/` |
| 2 | Targeting-Matrix | Notion-Tabelle | Phase 1 | Ja | `/customer/[slug]/discovery/` |
| 3 | Scraping-Pipeline-Konfiguration | Tool-Config + Doku | Phase 2 | Ja | `/customer/[slug]/system/` |
| 4 | Enrichment-Layer-Setup | Tool-Config + Doku | Phase 2 | Ja | `/customer/[slug]/system/` |
| 5 | Scoring-Modell-Doku (Regel-Set + AI-Layer) | PDF + Config | Phase 2 | Ja | `/customer/[slug]/system/` |
| 6 | Outreach-Sequenzen (alle Steps, alle Varianten) | Export + Doku | Phase 3 | Ja | `/customer/[slug]/outreach/` |
| 7 | Reply-Handling-Templates (4 Kategorien) | Notion-Doc | Phase 3 | Ja | `/customer/[slug]/outreach/` |
| 8 | Deliverability-Setup-Nachweis (SPF/DKIM/DMARC) | Screenshot + Config | Phase 3 | Ja | `/customer/[slug]/infra/` |
| 9 | CRM-Integration-Doku + Field-Mapping | Notion-Doc | Phase 4 | Ja | `/customer/[slug]/system/` |
| 10 | Lead-Tracking-Dashboard | Live-Link + Doku | Phase 4 | Ja | `/customer/[slug]/dashboard/` |
| 11 | SOP: Scraping & Qualifikation | Notion-Doc | Phase 6 | Ja | `/customer/[slug]/sops/` |
| 12 | SOP: Outreach-Management | Notion-Doc | Phase 6 | Ja | `/customer/[slug]/sops/` |
| 13 | SOP: CRM & Dashboard | Notion-Doc | Phase 6 | Ja | `/customer/[slug]/sops/` |
| 14 | Video-Walkthroughs (3x Loom) | Video-Links | Phase 6 | Ja | `/customer/[slug]/training/` |
| 15 | Retainer-Scope-Doku | PDF | Phase 6 | Ja | `/customer/[slug]/retainer/` |
| 16 | Zugänge-Inventar | Verschlüsselt | Phase 6 | Ja | `/customer/[slug]/access/` |
| 17 | Optimierungs-Backlog | Notion-Doc | Phase 6 | Ja | `/customer/[slug]/backlog/` |
| 18 | 30-Tage-Analyse-Template | Spreadsheet | Phase 6 | Ja | `/customer/[slug]/retainer/` |

---

## Sign-Off-Kriterien

Alle 10 Punkte müssen ✅ sein bevor Status auf `DELIVERED` gesetzt wird:

| # | Kriterium | Status |
|---|---|---|
| 1 | Scraping-Pipeline läuft 5 Werktage ohne manuelle Eingriffe und liefert vereinbartes Lead-Volumen | ✅ |
| 2 | Scoring-Kalibrierungs-Test bestanden: >80% der manuell validierten Top-Leads als High-Score klassifiziert | ✅ |
| 3 | Deliverability vollständig: SPF ✅ DKIM ✅ DMARC ✅ Domain-Warming abgeschlossen (mind. 14 Tage) | ✅ |
| 4 | Soft-Launch mit 200+ E-Mails durchgeführt, Open-Rate >30%, Bounce-Rate <3% | ✅ |
| 5 | CRM-Integration bidirektional getestet: Lead landet automatisch im CRM, Stage-Updates fließen zurück | ✅ |
| 6 | Dashboard zeigt Live-Daten ohne manuelle Dateneingabe, alle Metriken korrekt | ✅ |
| 7 | Alle Sequenzen schriftlich von Customer freigegeben (Copy-Freigabe dokumentiert) | ✅ |
| 8 | SOPs von Customer-Team als verständlich bestätigt (schriftliche Bestätigung vorhanden) | ✅ |
| 9 | Übergabe-Call durchgeführt, alle offenen Fragen dokumentiert und beantwortet | ✅ |
| 10 | Customer hat System eigenständig 5 Werktage ohne AEVUM-Support bedient — keine kritischen Fehler | ✅ |

---

## Known Limitations (Phase-2-Items / Backlog)

Diese Items sind explizit **nicht** im initialen Scope und werden im Optimierungs-Backlog dokumentiert:

| Item | Grund nicht in Phase 1 | Empfohlener Zeitpunkt |
|---|---|---|
| A/B-Test-Layer mit statistischer Auswertung | Braucht Mindest-Datenvolumen (mind. 500 Sends pro Variante) — erst nach 4-6 Wochen Betrieb sinnvoll | Monat 2-3 im Retainer |
| Intent-Signal-Integration (z.B. G2, Bombora) | Zusätzliche Tool-Kosten + Integrationsaufwand; abhängig von Markt | Add-On ab Monat 3 |
| Automatisiertes Meeting-Booking (Calendly-Integration in Reply-Flow) | Sequenziell sinnvoll erst wenn Reply-Rates stabil und Sequenzen optimiert | Monat 2 |
| Multi-Language-Sequenzen (DACH + EN) | Separater Copy-Aufwand; nur relevant wenn ICP international | Change-Request |
| Predictive Lead-Scoring (ML-Modell statt Regelwerk) | Braucht mind. 3 Monate historische Daten aus dem System | Monat 4-6 |
| Automatisches Lead-Nurturing für "Not Now"-Replies | Erhöht Systemkomplexität; sinnvoll erst wenn Grundsystem stabil läuft | Monat 3 |

---

## DB-Update-Befehl

```sql
-- AEVUM DFY Delivery: Lead Factory Sign-Off
UPDATE dfy_deliveries
SET
  status                = 'DELIVERED',
  delivered_at          = NOW(),
  quality_gate_passed   = TRUE,
  sign_off_criteria_met = 10,
  phase2_items_count    = 6,
  retainer_active       = TRUE,
  retainer_start_date   = CURRENT_DATE,
  handover_package_sent = TRUE,
  notes                 = 'All 10 sign-off criteria met. 6 Phase-2 items documented in customer backlog. Retainer active.'
WHERE
  item_slug     = 'lead-factory'
  AND item_type = 'dfy'
  AND customer_id = :customer_id;  -- :customer_id ersetzen

-- Optional: Retainer-Datensatz anlegen
INSERT INTO retainer_contracts (
  customer_id,
  item_slug,
  tier,
  monthly_rate,
  start_date,
  scope_doc_url,
  status
) VALUES (
  :customer_id,
  'lead-factory',
  :tier,               -- 'M' oder 'L'
  :monthly_rate,       -- z.B. 2200.00
  CURRENT_DATE,
  :scope_doc_url,      -- Link zur Retainer-Scope-Doku
  'ACTIVE'
);
```

---

## Pattern-Notes für DFY-Builder-Pattern

```
PATTERN: lead-factory-dfy-v1
---
Service-Typ: Full-Stack Outbound-System (Scraping → Qualifikation → Outreach → Tracking)
ICP-Fit-Ranking: FI ★★★★★ | AG ★★★★★ | PB ★★★★☆
Kritischer Dependency: Valides Offer beim Customer — größter Failure-Mode ist nicht technisch
Deliverability-Risiko: Immer dedizierte Outreach-Domain(s), nie Haupt-Domain
Scoring-Kalibrierung: Customer muss aktiv mitarbeiten in Phase 2 — nicht delegierbar
Copy-Bottleneck: Freigabe-SLA für Customer kommunizieren (48h), sonst Timeline-Killer
Tier-Differenzierung: Hauptsächlich über Kanal-Anzahl, Sequenz-Anzahl, Lead-Volumen
Upsell-Logik: Nach 90 Tagen Betrieb → Sales-OS oder Command-Center-Dashboard naheliegend
Phase-2-Trigger: A/B-Testing, Intent-Signals, Nurturing-Flows immer nach Daten, nie upfront
Retainer-Wert: Monatliches Tuning + Sequenz-Updates + Monitoring + Strategy-Session (Tier L)
Lessons: ICP-Phase nie überspringen, auch wenn Customer "schon weiß wer der Zielkunde ist"
Version: 1.0 | Created: 2025
```