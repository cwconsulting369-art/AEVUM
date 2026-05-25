# Sales-OS — Quality-Gate & Sign-Off

**Projekt-ID**: `AEVUM-DFY-SALES-OS-[CUSTOMER-ID]`
**Service-Slug**: `sales-os`
**Version**: 1.0
**Status**: ⬜ PENDING

---

## Asset-Inventory

| # | Asset | Format | Owner | Status |
|---|---|---|---|---|
| 1 | CRM-Workspace (konfiguriert + live) | SaaS-System | Eng | ⬜ |
| 2 | Pipeline-Stage-Dokumentation | Notion-Page / PDF | Eng | ⬜ |
| 3 | Scoring-Kriterien-Dokument (versioniert) | PDF | Founder | ⬜ |
| 4 | Scoring-Logik implementiert + dokumentiert | In-CRM + Notion | Eng | ⬜ |
| 5 | Automation-Flows (alle vereinbarten, fehlerfrei) | In-CRM/Automation-Tool | Eng | ⬜ |
| 6 | Deal-Velocity-Alert-Setup | In-CRM | Eng | ⬜ |
| 7 | Score-Threshold-Trigger (Hot-Alert) | In-CRM | Eng | ⬜ |
| 8 | Sales-Dashboard (live, Echtzeit-Daten) | Dashboard-Tool | Eng | ⬜ |
| 9 | Daten-Migration (Migrations-Report) | Excel/CSV | Eng | ⬜ |
| 10 | Schriftliches Playbook | Notion-Page / PDF | CS | ⬜ |
| 11 | Loom-Video 1: Pipeline-Daily-Use | Loom | CS | ⬜ |
| 12 | Loom-Video 2: Score-Interpretation | Loom | CS | ⬜ |
| 13 | Loom-Video 3: Admin-Ansicht | Loom | CS | ⬜ |
| 14 | Training-Session-Aufzeichnung | Video-File | CS | ⬜ |
| 15 | Technische Dokumentation | Notion-Page | Eng | ⬜ |
| 16 | Retainer-SLA-Dokument | PDF | CS | ⬜ |
| 17 | Zugangsdaten-Übergabe (sicherer Kanal) | 1Password o.ä. | Eng | ⬜ |

---

## Sign-Off-Kriterien

Alle 10 Punkte müssen ✅ sein bevor "Done" kommuniziert wird:

| # | Kriterium | Status |
|---|---|---|
| 1 | Scoring-Modell läuft auf Live-Daten, mind. 20 Leads haben plausibel verteilte Scores (Cold/Warm/Hot) | ⬜ |
| 2 | Alle vereinbarten Automation-Flows haben End-to-End-Test bestanden, 0 Error-Logs in 48h nach Aktivierung | ⬜ |
| 3 | Dashboard zeigt Echtzeit-Daten (Refresh max. 4h), alle KPIs plausibel und mit Quelldaten abgeglichen | ⬜ |
| 4 | Daten-Migration abgeschlossen: Record-Count stimmt mit Quelldaten überein, Spot-Check 50 Records manuell validiert | ⬜ |
| 5 | Deal-Velocity-Alert: Künstlicher Test-Deal durch alle Stages geführt, Alert korrekt ausgelöst | ⬜ |
| 6 | Customer-Team hat Training-Session absolviert (Aufzeichnung vorhanden, Anwesenheit dokumentiert) | ⬜ |
| 7 | Schriftliches Playbook übergeben inkl. 3 Loom-Videos — Customer hat Empfang bestätigt | ⬜ |
| 8 | Scoring-Thresholds schriftlich vom Customer abgenommen (E-Mail oder Notion-Kommentar als Nachweis) | ⬜ |
| 9 | Architektur-Entscheidungen und Stage-Struktur schriftlich bestätigt (Phase-1-QG-Nachweis vorhanden) | ⬜ |
| 10 | Retainer-SLA-Dokument unterschrieben, Retainer-Start-Datum bestätigt, erste Retainer-Zahlung ausgelöst | ⬜ |

**Freigabe durch**: _________________________ (Founder-Sign-Off)
**Datum**: _________________________

---

## Known-Limitations (Phase-2-Items)

Diese Punkte sind bewusst nicht in Scope — dokumentiert damit kein Future-Customer-Success-Manager sie als "vergessen" behandelt:

| Item | Warum nicht in Phase 1 | Empfohlener Zeitpunkt |
|---|---|---|
| ML-Layer Scoring-Verbesserung (Tier M) | Benötigt 3-6 Monate Live-Daten aus dem System selbst | Nach 6 Monaten Retainer als Upgrade bewertbar |
| Predictive Forecasting (Deal-Win-Probability per Stage) | Erfordert ausreichend historische Closed-Won/Lost-Daten — in Woche 6 nicht verfügbar | Retainer-Monat 6+ wenn genug Deal-Daten vorliegen |
| Integration mit Buchhaltungs-/ERP-System | Explizit Out-of-Scope, eigenes Service-Offering | Bei konkretem Bedarf als separates Projekt kalkulieren |
| A/B-Testing der Follow-up-Sequenzen | Sinnvoll erst nach 2-3 Monaten Laufzeit und ausreichend Daten-Volumen | Ab Retainer-Monat 3 als Change-Request möglich |
| Multi-Pipeline-Setup (mehr als 1 Sales-Team/Region) | Tier-L-Feature, nicht in Standard-Scope | Bei Wachstum: Upgrade-Gespräch initiieren |
| Inbound-Lead-Capture-Formulare / Website-Integration | Eigene Komplexität, Berührung mit `website-crm` Service | Als Add-on oder separates Projekt |

---

## DB-Update-Befehl

```sql
-- Sales-OS DFY Item in AEVUM Service-DB registrieren / updaten
-- Ausführen nach finalem Go-Live und Customer-Sign-Off

INSERT INTO aevum_service_items (
  slug,
  item_type,
  display_name,
  tier_m_setup_min,
  tier_m_setup_max,
  tier_m_retainer_min,
  tier_m_retainer_max,
  tier_l_setup_min,
  tier_l_setup_max,
  tier_l_retainer_min,
  tier_l_retainer_max,
  implementation_weeks_min,
  implementation_weeks_max,
  icp_ag_fit,
  icp_pb_fit,
  icp_fi_fit,
  primary_upsell_slug,
  secondary_upsell_slug,
  status,
  version,
  last_updated
) VALUES (
  'sales-os',
  'dfy',
  'Sales-OS — Sales-Pipeline mit AI-Scoring + CRM-Integration',
  10000,
  18000,
  2000,
  3000,
  25000,
  45000,
  3500,
  5000,
  4,
  12,
  5,   -- AG: 5/5
  4,   -- PB: 4/5
  5,   -- FI: 5/5
  'ai-lead-engine',
  'command-center-dashboard',
  'active',
  '1.0',
  CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  status = 'active',
  version = '1.0',
  last_updated = CURRENT_TIMESTAMP;

-- Customer-Delivery-Eintrag (nach Projekt-Abschluss)
INSERT INTO aevum_deliveries (
  project_id,
  service_slug,
  customer_id,
  go_live_date,
  tier,
  setup_price_actual,
  retainer_price_monthly,
  retainer_start_date,
  sign_off_complete,
  delivery_notes
) VALUES (
  '[AEVUM-DFY-SALES-OS-CUSTOMER-ID]',
  'sales-os',
  '[CUSTOMER-ID]',
  CURRENT_DATE,
  '[M|L]',          -- Tier einsetzen
  [ACTUAL-SETUP],   -- tatsächlicher Setup-Preis
  [ACTUAL-RETAINER],
  CURRENT_DATE,
  true,
  'Phase-2-Items dokumentiert: ML-Upgrade ab Monat 6 evaluieren, Multi-Pipeline bei Wachstum.'
);
```

---

## Pattern-Notes für DFY-Builder-Pattern

```yaml
pattern_id: dfy-sales-os-v1
service_category: sales_enablement
core_complexity_driver: scoring_model_type  # regelbasiert vs ML — bestimmt Tier-Entscheidung
critical_dependency: crm_platform_lock_in   # muss in Phase 1 abgeschlossen sein, kein Mid-Project-Switch
primary_failure_mode: adoption_gap          # System gebaut aber nicht genutzt — höchstes Retainer-Risiko
retainer_health_signal: scoring_data_volume # Anzahl Leads die wöchentlich Scores bekommen → Adoption-Proxy
upsell_trigger_1: lead_volume_insufficient  # Wenn Pipeline-Quality gut aber Volumen fehlt → ai-lead-engine
upsell_trigger_2: ops_visibility_needed     # Wenn Sales-OS stabil und Customer will mehr Dashboard → command-center
differentiation_vs_generic_crm_setup:
  - AI-Scoring-Layer (nicht nur Felder anlegen)
  - Velocity-Alerts (proaktiv, nicht reaktiv)
  - Enrichment-Integration
  - Monatliches Modell-Tuning im Retainer
scope_boundary_most_tested: content_for_flows  # Customer erwartet oft dass AEVUM E-Mail-Texte schreibt
minimum_viable_customer: has_sales_process_even_if_undocumented  # kein Sales-OS für Pre-Sales-Stage-Startups
```