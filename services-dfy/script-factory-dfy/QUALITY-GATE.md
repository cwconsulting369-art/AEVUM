# Script Factory DFY — Quality-Gate & Sign-Off

**Item-Slug:** `script-factory-dfy`
**Customer:** [CUSTOMER_NAME]
**Delivery-Lead:** [CS_LEAD_NAME]
**Go-Live-Datum:** [DATUM]
**Tier:** [ ] M / [ ] L

---

## Asset-Inventory

| # | Asset | Format/Ort | Status | Abgenommen von |
|---|---|---|---|---|
| 1 | Produktkatalog-Anbindung | Live-Integration / Log | [ ] | Eng |
| 2 | Persona-Library | [Tool-Link] | [ ] | CS-Lead |
| 3 | Brand-Voice-Regelwerk | [Doc-Link] | [ ] | CS-Lead + Customer |
| 4 | Hook-Generator-Konfiguration | [System-Doku] | [ ] | Eng |
| 5 | Script-Assembly-Pipeline | [System-Doku] | [ ] | Eng |
| 6 | Brief-Output-Template (UGC) | [Tool-Link] | [ ] | CS-Lead |
| 7 | Review-Workflow im Output-Tool | [Tool-Link] | [ ] | CS-Lead |
| 8 | Script-Archive mit Tagging | [Tool-Link] | [ ] | CS-Lead |
| 9 | Feedback-Loop-Mechanismus | [System-Doku / API-Log] | [ ] | Eng |
| 10 | Test-Batch (30 Scripts) | [Tool-Link] | [ ] | Customer |
| 11 | System-Dokumentation | [Doc-Link] | [ ] | CS-Lead |
| 12 | Loom: Batch-Run starten | [Video-Link] | [ ] | CS-Lead |
| 13 | Loom: Personas pflegen | [Video-Link] | [ ] | CS-Lead |
| 14 | Loom: Feedback einspielen | [Video-Link] | [ ] | CS-Lead |
| 15 | Training-Session durchgeführt | Kalender-Bestätigung | [ ] | CS-Lead + Customer |
| 16 | Retainer-Prozess-Doku | [Doc-Link] | [ ] | CS-Lead |
| 17 | Change-Request-Vorlage | [Template-Link] | [ ] | CS-Lead |
| 18 | Erster produktiver Batch-Run | Log / Output-Tool | [ ] | Customer + Eng |

---

## Sign-Off-Kriterien

| # | Kriterium | Status |
|---|---|---|
| 1 | Produktkatalog-Anbindung läuft stabil und Updates werden korrekt erkannt | [ ] ✅ |
| 2 | Persona-Library enthält alle vertraglich vereinbarten Personas vollständig | [ ] ✅ |
| 3 | Hook-Generator produziert mind. 5 Hook-Varianten pro Produkt × Persona (alle 5 Pattern-Typen) | [ ] ✅ |
| 4 | Script-Assembly produziert vollständige Scripts in allen vereinbarten Formaten (15s/30s/60s) | [ ] ✅ |
| 5 | Brand-Voice-Filter blockiert alle definierten verbotenen Formulierungen (Negativtest bestanden) | [ ] ✅ |
| 6 | Customer-Qualitätsscore auf Test-Batch ≥ 7/10 (mind. 10 Scripts bewertet, dokumentiert) | [ ] ✅ |
| 7 | Review-Workflow im Output-Tool funktioniert, alle Status-Stufen durchgespielt | [ ] ✅ |
| 8 | Ein vollständiger Batch-Run ohne manuellen Eingriff erfolgreich abgeschlossen | [ ] ✅ |
| 9 | Alle Handover-Dokumente und Loom-Videos vollständig und vom CS-Lead reviewed | [ ] ✅ |
| 10 | Feedback-Loop-Mechanismus eingerichtet und einmalig erfolgreich getestet (Tier M: manuell / Tier L: API-Log) | [ ] ✅ |

**→ Alle 10 Kriterien müssen ✅ sein. Kein partieller Sign-Off.**

Freigabe Founder/Lead: _________________________ Datum: _____________
Freigabe Customer: _________________________ Datum: _____________

---

## Known Limitations (Phase-2-Items)

Diese Punkte sind bewusst nicht im aktuellen Scope und werden im Retainer oder als separates Offering adressiert:

| # | Limitation | Empfohlener nächster Schritt |
|---|---|---|
| L1 | Kein automatisches Ad-Deployment — Scripts müssen manuell in Ad-Accounts eingespielt werden | Scope-Erweiterung bei Bedarf (CR) |
| L2 | Feedback-Loop (Tier M) ist manuell — keine automatische Korrelation zwischen Script-ID und Ad-Performance | Upgrade auf Tier L oder → `hud-command-center` |
| L3 | Pipeline ist auf 1 Brand kalibriert — Multi-Mandant-Nutzung (Agentur) erfordert Re-Architektur | Explizit als Add-On gepreist |
| L4 | LLM-Qualität ist abhängig von Datenlage — bei dünnen Produktbeschreibungen sinkt Output-Qualität messbar | Datenqualitäts-Wartung ist Customer-Verantwortung |
| L5 | Kein integriertes Creator-Briefing-Tool — Briefs werden produziert, aber Übergabe an Creator ist manuell | → Zukünftiges Feature oder Prozess-Integration per CR |
| L6 | Style-Guide-Filter ist regelbasiert, kein lernender Filter — muss bei Brand-Evolution manuell aktualisiert werden | Retainer-Service: monatliche Pflege inklusive |

---

## DB-Update-Befehl

```sql
-- Script Factory DFY: Delivery Sign-Off
UPDATE aevum_dfy_items
SET
  status                = 'delivered',
  go_live_date          = CURRENT_DATE,
  tier                  = 'M', -- oder 'L', anpassen
  setup_revenue         = 11000, -- tatsächlichen Wert einsetzen
  monthly_retainer      = 2500,  -- tatsächlichen Wert einsetzen
  customer_score        = 7.8,   -- aus Test-Batch-Review
  quality_gate_passed   = TRUE,
  known_limitations     = '["no-auto-deploy","manual-feedback-loop-tierM","single-brand","data-quality-dependency","no-creator-tool","static-style-filter"]',
  handover_package_url  = 'https://notion.so/[LINK]', -- ersetzen
  updated_at            = NOW()
WHERE
  item_slug             = 'script-factory-dfy'
  AND customer_id       = '[CUSTOMER_ID]'; -- ersetzen

-- Retainer aktivieren
INSERT INTO aevum_retainer_schedule (
  item_slug,
  customer_id,
  monthly_amount,
  next_billing_date,
  retainer_scope,
  created_at
) VALUES (
  'script-factory-dfy',
  '[CUSTOMER_ID]',
  2500, -- anpassen
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month',
  'batch-runs,maintenance,1-persona-update-per-month,monthly-sync',
  NOW()
);
```

---

## Pattern-Notes für DFY-Builder-Pattern

**Pattern-Typ:** Content-Production-Pipeline mit strukturiertem Output-Layer

**Differenzierung zu ähnlichen Items:**
- `content-engine` → organischer Content (Planung + Publishing); Script Factory → bezahlte Werbung, kein Publishing
- `hud-command-center` → Visualisierung; Script Factory → Produktion
- `database-system` → Data-Engineering; Script Factory nutzt Data-Engineering nur als Input-Layer

**Kritische Design-Entscheidungen dieses Patterns:**
1. Prompt-Engineering-Kalibrierung ist der eigentliche Wert-Hebel — mehr Zeit hier = bessere Output-Qualität
2. Mid-Build-Preview (W3) ist nicht optional — früher Feedback-Einbau spart 20–30% Korrekturaufwand
3. Datenqualität ist Customer-Verantwortung — explizit in Scope-Checklist und Kick-off kommunizieren
4. Test-Batch-Score als objektives Abnahme-Kriterium ist Schutz für beide Seiten

**Skalierbarkeit:**
- Von Tier M → L: primär Feedback-Loop-Automatisierung und Volume-Erhöhung, keine Architektur-Änderung
- Multi-Brand: Architektur-Änderung erforderlich (separate Persona-Libraries, Brand-Voice-Filter-Isolation)

**Upsell-Signal im Retainer:** Wenn Customer ≥ 3× nach Performance-Reporting fragt → `command-center-dashboard` pitchen