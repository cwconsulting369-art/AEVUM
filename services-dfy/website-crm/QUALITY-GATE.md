# Quality-Gate: Custom CRM-Frontend mit Workflow-Engine

## Asset-Inventory

| # | Asset | Typ | Status | Wo |
|---|---|---|---|---|
| 1 | CRM-Frontend (deployed, produktiv) | Software | ☐ | Produktiv-URL |
| 2 | Workflow-Engine (alle vereinbarten Automatisierungen aktiv) | Software | ☐ | Backend/Automations-Layer |
| 3 | Formular-Integration (end-to-end aktiv) | Integration | ☐ | CRM + Formular-Tool |
| 4 | E-Mail-Provider-Anbindung (aktiv) | Integration | ☐ | CRM + E-Mail-Provider |
| 5 | E-Mail-Templates (deployed im System) | Content/Config | ☐ | CRM-Template-Library |
| 6 | Rollenbasierte Zugriffslogik (min. 3 Rollen aktiv) | Config | ☐ | User-Management |
| 7 | Reporting-Dashboard (live Daten) | Software | ☐ | CRM-Dashboard |
| 8 | Datenmigration (validierter Import) | Daten | ☐ | CRM-Datenbank |
| 9 | System-Dokumentation (schriftlich) | Dokument | ☐ | Notion/PDF |
| 10 | Video-Walkthroughs (3-5 Videos) | Media | ☐ | Notion/Drive |
| 11 | Workflow-Map (visuell) | Dokument | ☐ | Miro/Figma/PDF |
| 12 | Migration-Validation-Report | Dokument | ☐ | Google Drive/PDF |
| 13 | Admin-Credentials übergeben | Access | ☐ | 1Password/Direktübergabe |
| 14 | UAT-Sign-Off (schriftlich, Customer-POC) | Dokument | ☐ | E-Mail/Notion |
| 15 | Retainer-Scope-Dokument übergeben | Dokument | ☐ | Shared Notion Space |

---

## Sign-Off-Kriterien

| # | Kriterium | Status |
|---|---|---|
| 1 | Alle im Requirements-Doc vereinbarten Features sind deployed und funktional getestet | ☐ |
| 2 | Alle vereinbarten Workflows mit min. 3 Test-Durchläufen validiert, inkl. Edge-Cases | ☐ |
| 3 | Formular-to-CRM End-to-End < 60s Latenz getestet und bestätigt | ☐ |
| 4 | Rollenbasierte Zugriffsrechte: Jede Rolle mit separatem Test-User manuell verifiziert | ☐ |
| 5 | Datenmigration: Record-Count 100% korrekt, Duplikate < 2%, Pflichtfelder befüllt | ☐ |
| 6 | Reporting-Dashboard-Daten mit Rohdaten abgestimmt (Stichprobe min. 20 Records) | ☐ |
| 7 | Performance: Seitenladezeit < 2s bei 1.000 Records; API-Response < 500ms (getestet) | ☐ |
| 8 | Alle Zugänge (Admin, Integrationen, Datenbank) an Customer übergeben und bestätigt | ☐ |
| 9 | Komplettes Handover-Package (Doku, Videos, Workflow-Map, Validation-Report) übergeben | ☐ |
| 10 | Schriftlicher UAT-Sign-Off von Customer-POC vor Go-Live liegt vor | ☐ |

**Delivery gilt erst dann als abgeschlossen, wenn alle 10 Punkte auf ✅ stehen. Kein Retainer-Start ohne vollständigen Sign-Off.**

---

## Known-Limitations (Phase-2-Items)

Diese Items sind bewusst aus dem aktuellen Scope ausgeschlossen und als potenzielle Phase-2-Erweiterungen dokumentiert:

| Item | Warum nicht jetzt | Empfohlener Next-Step |
|---|---|---|
| AI-Deal-Scoring / Lead-Qualifizierung | Erfordert Trainings-Datensatz + ML-Layer — separater Aufbau | → sales-os Modul |
| Automatisierter Outbound (Sequences ohne manuellen Trigger) | Deliverability-Risiko ohne separates Warming-Setup | → ai-lead-engine |
| Native Mobile App | Anderer Tech-Stack, separates Projekt | Separates Angebot auf Anfrage |
| Erweiterte Multi-Source-Reporting-Pipeline | Datenbankarchitektur müsste erweitert werden | → database-system Modul |
| Mehrsprachiges Interface | Lokalisierungs-Layer nicht im aktuellen Build | Phase-2-CR bei Bedarf |
| Vollautomatisierte Rechnungsstellung | ERP-Logik außerhalb CRM-Scope | Separater ERP-Track |

---

## DB-Update-Befehl

```sql
-- AEVUM Service-Delivery-Tracking
UPDATE service_deliveries
SET
  status                = 'completed',
  sign_off_date         = CURRENT_DATE,
  handover_complete     = TRUE,
  retainer_active       = TRUE,
  phase2_items_logged   = TRUE,
  notes                 = 'website-crm DFY delivery complete. All 10 sign-off criteria met. Phase-2 items documented: AI-scoring, outbound-sequences, mobile-app, multi-source-reporting. Retainer started post-handover.'
WHERE
  item_slug             = 'website-crm'
  AND customer_id       = :customer_id
  AND delivery_phase    = 'phase-5-handover';

-- Upsell-Tracking eintragen
INSERT INTO upsell_pipeline (customer_id, source_item_slug, target_item_slug, trigger_condition, status, created_at)
VALUES
  (:customer_id, 'website-crm', 'sales-os',                'deal-scoring-request',           'open', NOW()),
  (:customer_id, 'website-crm', 'ai-lead-engine',           'outbound-automation-request',    'open', NOW()),
  (:customer_id, 'website-crm', 'command-center-dashboard', 'cross-tool-visibility-request',  'open', NOW()),
  (:customer_id, 'website-crm', 'database-system',          'advanced-reporting-request',     'open', NOW());
```

---

## Pattern-Notes für DFY-Builder-Pattern

**Service-Kern:** `website-crm` ist der Interface-Layer-Service. Das Differenzierungsmerkmal gegenüber generischen CRM-Tools ist die vollständige Anpassung an die Kunden-Logik — kein Mapping des Kunden auf ein Standard-Datenmodell, sondern Bau des Datenmodells nach Kunden-Prozess.

**Kritische Design-Entscheidungen:**
- Discovery-Sign-Off als hartes Gate ist nicht verhandelbar — Scope-Creep bei CRMs ist der häufigste Delivery-Killer
- Workflow-Anzahl muss im Vertrag fixiert sein (nicht "alle die wir brauchen") — klare Zahl, klare CR-Policy
- Migration ist immer ein Risikopunkt — Pre-Assessment in Woche 1 ist Pflicht, nicht optional
- UAT muss vom Customer-Team durchgeführt werden, nicht nur vom POC — echter User-Acceptance-Test

**Upsell-Logik:** Das CRM ist naturgemäß der Einstiegspunkt für weitere Systeme. Nach 2-3 Monaten entstehen typisch zwei Bedürfnisse: (a) Daten rein bekommen (→ ai-lead-engine) und (b) Daten auswerten (→ database-system / command-center-dashboard). Diese Trigger aktiv im Retainer-Review beobachten.

**Pricing-Anker:** Setup-Kosten sind bei CRMs höher gerechtfertigt als bei anderen Services, weil der Wechselkosten-Effekt nach Go-Live hoch ist. Customer verlässt selten ein gut gebautes Custom-CRM — Retainer-Churn ist niedrig wenn Delivery sauber.

**Anti-Pattern vermeiden:** Kein Feature-Bau ohne schriftliche Anforderung. Mündliche Absprachen in CRM-Projekten erzeugen garantiert Konflikte in Phase 4. Jedes Feature muss im Requirements-Doc stehen.