# DSGVO-Factory — Quality-Gate & Sign-Off

## Asset-Inventory

| # | Asset | Format | Status | Owner |
|---|---|---|---|---|
| 1 | Verarbeitungsverzeichnis (VVT) | Notion/Airtable Database | ☐ | Eng |
| 2 | AV-Register inkl. AVV-Status | Notion/Airtable Database | ☐ | Eng |
| 3 | AVV-Reminder-Automation | Make/n8n Flow | ☐ | Eng |
| 4 | Consent-Management-System + Audit-Trail-DB | Make Flow + Airtable | ☐ | Eng |
| 5 | Betroffenenrechte-Ticketing (4 Typen) | Ticketing-System (Notion/Linear) + Automation | ☐ | Eng |
| 6 | Response-Templates (Art. 15/16/17/20) | Notion / Word-Export | ☐ | CS |
| 7 | 30-Tage-SLA-Tracking + Eskalations-Flow | Make/n8n | ☐ | Eng |
| 8 | Löschfristenregister + Automatisierungs-Hooks | Airtable + Make/n8n | ☐ | Eng |
| 9 | TOM-Dokumentation (final, freigegeben) | PDF | ☐ | CS |
| 10 | Datenpannen-Playbook + Melde-Templates | PDF + Notion | ☐ | CS |
| 11 | DSGVO-Compliance-Dashboard | Softr/Notion | ☐ | Eng |
| 12 | Mitarbeiter-Awareness-Paket (Videos + Quiz + Protokoll) | Loom + Notion | ☐ | CS |
| 13 | Quarterly-Review-Trigger-Automation | Make/n8n + E-Mail | ☐ | Eng |
| 14 | System-Dokumentation (Vollständig) | Notion | ☐ | CS |
| 15 | Loom-Walkthroughs (5-8 Videos) | Loom + Notion-Embed | ☐ | CS |
| 16 | Credentials & Access-Dokumentation | 1Password / Notion | ☐ | CS |
| 17 | Handover-Session-Recording | Loom / Zoom-Recording | ☐ | CS |

---

## Sign-Off-Kriterien

Alle 10 Punkte müssen ✅ sein, bevor Handover freigegeben wird:

| # | Kriterium | Status |
|---|---|---|
| 1 | VVT vollständig: Alle identifizierten Verarbeitungstätigkeiten dokumentiert, 100% Owner-Mapping abgeschlossen | ☐ |
| 2 | AV-Register vollständig: Alle Auftragsverarbeiter erfasst, AVV-Status für jeden Eintrag bekannt (nicht leer) | ☐ |
| 3 | Consent-Tracking live: Opt-in → DB-Eintrag → Audit-Trail funktioniert nachweislich (Test-Protokoll vorhanden) | ☐ |
| 4 | Betroffenenrechte: Alle 4 Anfrage-Typen technisch getestet, korrekt geroutet, Response-Templates zugewiesen | ☐ |
| 5 | SLA-Tracking: 30-Tage-Frist wird korrekt berechnet, Eskalations-Notification ausgelöst bei Überschreitung (Test-Durchlauf dokumentiert) | ☐ |
| 6 | Löschfristenregister: Alle Datenkategorien mit Frist hinterlegt, mindestens 1 automatischer Hook live und getestet | ☐ |
| 7 | TOM-Dokumentation: Finale Version vom Customer-Owner schriftlich freigegeben (Datum + Name im Dokument) | ☐ |
| 8 | Datenpannen-Playbook: Customer-Owner hat Tabletop-Test vollständig durchlaufen, Ergebnis dokumentiert | ☐ |
| 9 | Awareness-Paket: Mindestens 1 Test-MA hat kompletten Flow durchlaufen, Bestätigungsprotokoll liegt vor | ☐ |
| 10 | Dashboard: Alle KPIs live, Datenkonsistenz via Stichprobe (5 KPIs manuell geprüft) bestätigt, Quarterly-Trigger gesetzt und erste Notification verifiziert | ☐ |

---

## Known Limitations (Phase-2-Items)

Folgende Items sind bewusst nicht in Phase 1 enthalten und werden ggf. als CR oder in Retainer-Phase adressiert:

| # | Limitation | Begründung | Empfohlener Next-Step |
|---|---|---|---|
| L1 | Löschfristenautomatisierung ist nicht für alle Tools möglich (abhängig von API-Verfügbarkeit) | Einige Tools haben keine API für automatisches Löschen — dort manuelle Prozesse mit Checkliste | Tool-Evaluation im Retainer; ggf. Tool-Migration empfehlen |
| L2 | AVVs mit Dienstleistern sind nicht alle abgeschlossen — Status "fehlend" verbleibt nach Übergabe | AEVUM kann nicht im Namen des Customers verhandeln | Customer muss fehlende AVVs aktiv nachverfolgen; Reminder-System unterstützt |
| L3 | Neues Datenschutzrecht / Gesetzesänderungen (z.B. ePrivacy-Verordnung, nationale Umsetzungen) | Rechtliche Entwicklungen außerhalb AEVUM-Scope | Retainer-Quarterly-Review als Frühwarnsystem; bei Bedarf CR |
| L4 | DSFA für neue Hochrisiko-Verarbeitungen nicht enthalten | DSFA-Durchführung ist juristisch komplex — Templates geliefert, Durchführung = Customer | DSFA-Begleitung als CR buchbar (€2.000-3.500) |
| L5 | Multi-Jurisdiktion (UK-GDPR, CCPA, etc.) nicht abgedeckt | Scope ist DSGVO-EU; andere Jurisdiktionen haben andere Anforderungen | Separates Angebot bei Bedarf |
| L6 | Consent-Retroaktivierung bestehender Kontaktlisten | Ob bestehende Kontakte rechtskonform sind — historisches Problem, nicht von AEVUM lösbar | Anwalt für Bewertung der Legacy-Liste; ggf. Re-Consent-Kampagne als separater Scope |

---

## DB-Update-Befehl

```sql
-- AEVUM Service Catalog: Item Status Update nach Delivery
UPDATE service_catalog
SET
  status                = 'active',
  delivery_status       = 'delivered',
  last_delivery_date    = CURRENT_DATE,
  tier_m_setup_min      = 9000,
  tier_m_setup_max      = 14000,
  tier_m_retainer_min   = 1800,
  tier_m_retainer_max   = 2800,
  tier_l_setup_min      = 22000,
  tier_l_setup_max      = 45000,
  tier_l_retainer_min   = 3200,
  tier_l_retainer_max   = 5000,
  implementation_weeks_m = 7,
  implementation_weeks_l = 11,
  icp_ag                = true,
  icp_pb                = true,
  icp_fi                = true,
  primary_icp           = 'AG,FI',
  upsell_targets        = 'database-system,website-crm,business-os,command-center-dashboard,automation-audit',
  docs_complete         = true,
  updated_at            = NOW()
WHERE slug = 'dsgvo-factory';

-- Log Delivery Event
INSERT INTO delivery_log (service_slug, event_type, event_date, notes)
VALUES (
  'dsgvo-factory',
  'initial_docs_complete',
  NOW(),
  'Sales-Brief, Scope-Checklist, Delivery-Plan, Quality-Gate erstellt. Tier M + L dokumentiert. Keine Rechtsberatung im Scope.'
);
```

---

## Pattern-Notes für DFY-Builder-Pattern

```
PATTERN: dsgvo-factory
CATEGORY: compliance-automation
VERSION: 1.0

KEY-DIFFERENTIATIONS:
- Explicit legal-non-advice boundary: kritisch und muss in JEDEM Customer-Touch wiederholt werden
  → In Vertrag, Kick-off, Handover schriftlich verankern
- Hybrid-Output: Kombination aus Datenbank-Assets (VVT, AV-Register) + Automationen + Dokumentation
  → Eng + CS müssen eng zusammenarbeiten; CS-lastig in frühen Phasen, Eng-lastig in Phase 3
- Blocking-Risk: Tool-Zugang ist härtester Blocker — kein Fortschritt ohne Zugang
  → Kick-off-Gate: erst nach 80% Zugang bestätigen
- Expectation-Risk: Customers neigen dazu, "DSGVO-konform" mit "rechtlich abgesichert" gleichzusetzen
  → Proaktive Enttäuschung besser als reaktive Haftung
- Retainer-Value: Hoch, weil Compliance kontinuierlich gepflegt werden muss — Quarterly-Reviews + AVV-Monitoring
  → In Sales-Gespräch Retainer als eigentliche Schutzebene positionieren, nicht Setup

PRICING-NOTES:
- Tier M passt gut für Agenturen <20 MA mit standardem Tool-Stack
- Tier L bei Mittelstand mit mehreren Entitäten oder komplexem HR-System schnell erreicht
- Add-on Live-Schulung ist häufig requested — aktiv anbieten nach Handover

REUSABLE-TEMPLATES:
- VVT-Template: Notion-DB-Template wiederverwendbar
- AVV-Register-Template: Airtable-Base wiederverwendbar
- Response-Templates (Art. 15-20): Wiederverwendbar mit Customer-Branding-Swap
- TOM-Template: Wiederverwendbar mit Ist-Zustand-Anpassung

WATCH-OUT:
- Customer stellt im Retainer "kurze Fragen" die faktisch Rechtsberatung sind
  → CS muss frühzeitig umleiten: "Das ist eine juristische Frage — hier ist unser Prozess-Support,
    für die Rechtsfrage empfehlen wir [Anwalt/DSB]"
```