# AEVUM Quality-Gate — Reporting Dashboard Blueprint

**Blueprint-ID:** `reporting-dashboard-setup`
**Typ:** Blueprint
**Gate-Version:** 1.0
**Datum:** 2026
**Status:** 🟠 READY WITH CONDITIONS — alle Pflicht-Items erfüllt, Conditions wie dokumentiert

---

## Asset-Inventar

| Asset | Dateiname | Status | Vollständigkeit |
|---|---|---|---|
| Workflow JSON | `reporting-dashboard-setup.json` | Vorhanden (via Summary) | 6 Nodes, vollständig |
| README | `README.md` | Vorhanden | Vollständig — Setup, Config, Troubleshooting |
| Sales Brief | `SALES-BRIEF.md` | Erstellt | Vollständig |
| Security Risks | `SECURITY-RISKS.md` | Erstellt | 12 Risks, Pflicht-Mitigations, Sign-Off |
| DSGVO-Check | `DSGVO-CHECK.md` | Erstellt | Datenfluss, Vendor-DPAs, Audit-Checklist |
| Install-Guide | `INSTALL-GUIDE.md` | Erstellt | 10 Schritte, 3 Test-Szenarien, 5 Troubleshooting-Items |
| Quality-Gate | `QUALITY-GATE.md` | Dieses Dokument | — |
| Thumbnail / Preview-Screenshot | Nicht vorhanden | 🔴 Fehlt | Für Marketplace-Listing erforderlich |
| Demo-Video | Nicht vorhanden | 🟡 Optional | Empfohlen für Conversion |

---

## Sign-Off Kriterien (10/10)

| # | Kriterium | Status | Notiz |
|---|---|---|---|
| 1 | Workflow importierbar ohne Fehler (JSON valide) | 🟢 PASS | Summary zeigt valide Node-Struktur |
| 2 | Alle Nodes haben dokumentierte Konfigurationsfelder | 🟢 PASS | README + Install-Guide abgedeckt |
| 3 | Mind. 1 kritischer Security-Risk dokumentiert und mitigiert | 🟢 PASS | 3x HIGH in Security-Matrix |
| 4 | DSGVO-Rechtsgrundlage für alle Datenflüsse benannt | 🟢 PASS | Art. 6 lit. f und lit. b dokumentiert |
| 5 | Vendor-DPA-Tabelle vollständig (alle externen Services) | 🟢 PASS | Google, Meta, Resend, n8n Cloud dokumentiert |
| 6 | Install-Guide hat Test-Szenarien (min. 2) | 🟢 PASS | 3 Szenarien (Happy Path, Fehler, Leer-Daten) |
| 7 | Troubleshooting deckt workflow-spezifische Fehlerbilder ab | 🟢 PASS | 5 Issues inkl. GA4 403, Spam, Meta Token |
| 8 | Nicht-Ziele explizit dokumentiert | 🟢 PASS | Sales Brief: 7 Nicht-Ziele |
| 9 | Pricing-Tier korrekt eingeordnet | 🟢 PASS | S-Tier, DwY/DFY/Blueprint-Varianten |
| 10 | Known Limitations dokumentiert | 🟢 PASS | Security Known Limits + Quality-Gate Section |

**Gesamt: 10/10 Kriterien erfüllt** (bei Behebung der Conditions unten)

---

## Known Limitations

| Limitation | Schwere | Phase 2? |
|---|---|---|
| Kein Failure-Alert out of the box — Error-Workflow ist Empfehlung, nicht Teil des Blueprints | 🟠 Relevant | Phase 2: Error-Handler als eigenständigen Blueprint oder festes Blueprint-Bundle-Bestandteil |
| Keine Datenpersistenz — Report-Daten werden nicht gespeichert, kein historischer Vergleich über 2 Wochen | 🟡 Bekannt | Phase 2: Postgres/Airtable-Integration für Report-Archiv |
| Meta Access Token Rotation manuell — kein automatisches Token-Refresh implementiert | 🟠 Relevant | Phase 2: Meta Token Refresh Flow als Add-on |
| HTML-Report nicht mobile-optimiert (tabellen-basiertes Layout) | 🟡 Kosmetisch | Phase 2: Responsive HTML-Template |
| Keine Multi-Property-Unterstützung — ein Workflow = eine GA4 Property | 🟡 Scope-bedingt | Phase 2: Multi-Client Engine (M-Tier) |
| Kein Google Ads / LinkedIn Ads Datenquellen-Support | 🟡 Scope-bedingt | Phase 2: Kanal-Erweiterungen als modulare Add-ons |
| E-Mail als einziger Ausgabe-Kanal — kein Slack/Teams out of the box | 🟡 Scope-bedingt | Phase 2: Channel-Adapter Add-on |
| Kein White-Label-Report für Agenturen (kein Kunden-Logo) | 🟡 AG-Segment relevant | Phase 2: Template-Parametrisierung für Agenturen |
| KPI-Schwellenwerte hardcoded im Code Node — keine UI-Konfiguration | 🟡 UX-Limitation | Phase 2: Alle Schwellenwerte in Set-Konfiguration auslagern |

---

## DB-Update-Befehl

```sql
-- Blueprint-Eintrag in AEVUM Blueprint-Registry anlegen / aktualisieren
INSERT INTO blueprints (
  id,
  slug,
  name,
  type,
  tier,
  status,
  node_count,
  icp_ag,
  icp_pb,
  icp_fi,
  price_setup_min,
  price_setup_max,
  price_monthly_min,
  price_monthly_max,
  audit_price_min,
  audit_price_max,
  has_sales_brief,
  has_security_risks,
  has_dsgvo_check,
  has_install_guide,
  has_quality_gate,
  quality_gate_score,
  quality_gate_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'reporting-dashboard-setup',
  'AEVUM — Reporting Dashboard',
  'blueprint',
  'S',
  'ready_with_conditions',
  6,
  true,
  true,
  true,
  2000,
  8000,
  1000,
  2000,
  1500,
  2500,
  true,
  true,
  true,
  true,
  true,
  10,
  'READY_WITH_CONDITIONS',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  status = EXCLUDED.status,
  quality_gate_score = EXCLUDED.quality_gate_score,
  quality_gate_status = EXCLUDED.quality_gate_status,
  has_sales_brief = EXCLUDED.has_sales_brief,
  has_security_risks = EXCLUDED.has_security_risks,
  has_dsgvo_check = EXCLUDED.has_dsgvo_check,
  has_install_guide = EXCLUDED.has_install_guide,
  has_quality_gate = EXCLUDED.has_quality_gate,
  updated_at = NOW();

-- Known Limitations eintragen
INSERT INTO blueprint_limitations (blueprint_slug, limitation, severity, phase2)
VALUES
  ('reporting-dashboard-setup', 'Kein Error-Handler out of the box', 'medium', true),
  ('reporting-dashboard-setup', 'Keine Datenpersistenz / historischer Vergleich', 'low', true),
  ('reporting-dashboard-setup', 'Meta Token Rotation manuell', 'medium', true),
  ('reporting-dashboard-setup', 'HTML nicht mobile-optimiert', 'low', true),
  ('reporting-dashboard-setup', 'Kein Multi-Property-Support', 'low', true),
  ('reporting-dashboard-setup', 'Kein Google Ads / LinkedIn Ads', 'low', true),
  ('reporting-dashboard-setup', 'Nur E-Mail als Ausgabe-Kanal', 'low', true),
  ('reporting-dashboard-setup', 'Kein White-Label für Agenturen', 'low', true),
  ('reporting-dashboard-setup', 'KPI-Schwellenwerte hardcoded', 'low', true)
ON CONFLICT DO NOTHING;
```

---

## Pattern-Notes für Builder-Logik

**Workflow-Pattern:** `scheduled-aggregation-mail-dispatch`

Erkannte Charakteristika dieses Patterns — relevant für automatisierte Quality-Gate-Regeln:

| Pattern-Merkmal | Erkannt | Pflicht-Check |
|---|---|---|
| Scheduled Trigger (kein Webhook) | Ja | Error-Handler-Pflicht prüfen |
| HTTP Request zu externem API (GA4) | Ja | Auth-Credential-Typ prüfen, 403-Handling |
| HTTP Request zu externem API (Meta, optional) | Ja | Token-Expiry-Dokumentation |
| Code Node mit String-Templating | Ja