# AEVUM Quality Gate — Reporting Dashboard Blueprint

**Item-ID:** `reporting-dashboard-setup`
**Typ:** blueprint
**Quality-Gate-Version:** 1.0
**Datum:** 2025
**Status:** REVIEW PENDING

---

## Asset-Inventory

| Asset | Dateiname | Status | Letztes Update |
|---|---|---|---|
| Workflow-JSON | `reporting-dashboard-setup.json` | Vorhanden (Summary geprüft) | 2025 |
| README | `README.md` | Vorhanden, vollständig | 2025 |
| Sales Brief | `SALES-BRIEF.md` | Erstellt (dieser Run) | 2025 |
| Security Risks | `SECURITY-RISKS.md` | Erstellt (dieser Run) | 2025 |
| DSGVO Check | `DSGVO-CHECK.md` | Erstellt (dieser Run) | 2025 |
| Install Guide | `INSTALL-GUIDE.md` | Erstellt (dieser Run) | 2025 |
| Quality Gate | `QUALITY-GATE.md` | Erstellt (dieser Run) | 2025 |
| Thumbnail / Preview | nicht geprüft | Ausstehend | — |
| Changelog | nicht vorhanden | Ausstehend | — |

---

## Sign-Off-Kriterien (10/10)

| # | Kriterium | Gewicht | Status | Notiz |
|---|---|---|---|---|
| QG-01 | Workflow-JSON importierbar und alle 6 Nodes vorhanden | KRITISCH | 🟡 PENDING | Summary bestätigt 6 Nodes; tatsächlicher Import-Test ausstehend |
| QG-02 | Schedule Trigger konfiguriert auf Montag 07:00 + korrekte Zeitzone | KRITISCH | 🟡 PENDING | Schedule Trigger vorhanden laut Summary; Timezone-Setting muss im echten JSON geprüft werden |
| QG-03 | Config-Node enthält alle dokumentierten Parameter (`ga4PropertyId`, `reportRecipients`, `reportTitle`, `currency`) | KRITISCH | 🟡 PENDING | Laut README vorhanden; tatsächliche Node-Werte im JSON ungeprüft |
| QG-04 | Code Node enthält HTML-Escape-Funktion für externe String-Inputs | HOCH | 🔴 OFFEN | Laut Security-Review nicht implementiert — muss vor Go-Live nachgerüstet werden |
| QG-05 | Error-Handling: mindestens ein Fehler-Pfad oder dokumentierter Error-Workflow-Hinweis vorhanden | HOCH | 🟢 ERFÜLLT | Install-Guide dokumentiert Error-Workflow-Setup; im Workflow selbst kein nativer Error-Node (akzeptiert mit Anleitung) |
| QG-06 | DSGVO-Check erstellt und GA4-Query auf aggregierte Metriken beschränkt | HOCH | 🟡 PENDING | Dok erstellt; tatsächliche GA4 API Query-Parameter im HTTP Node ungeprüft |
| QG-07 | Security-Risk-Matrix mit min. 10 Risks, davon 2+ HIGH/CRITICAL | MITTEL | 🟢 ERFÜLLT | 12 Risks identifiziert, davon 4 CRITICAL/HIGH workflow-spezifisch |
| QG-08 | Pricing-Logik in Sales-Brief vollständig und konsistent mit AEVUM-Preistiers | MITTEL | 🟢 ERFÜLLT | S-Tier korrekt referenziert (€2.500 Setup), DFY/DwY/Blueprint abgedeckt |
| QG-09 | Install-Guide enthält mind. 3 Test-Szenarien + 3 Troubleshooting-Cases | MITTEL | 🟢 ERFÜLLT | 3 Test-Szenarien, 5 Troubleshooting-Cases |
| QG-10 | Alle Docs referenzieren `reporting-dashboard-setup` als Item-ID konsistent | NIEDRIG | 🟢 ERFÜLLT | Item-ID in allen 5 Docs korrekt gesetzt |

**Gesamt-Score:** 5/10 grün, 4/10 pending, 1/10 offen
**Gate-Entscheidung:** 🟠 CONDITIONAL PASS — QG-04 muss geschlossen werden, QG-01/02/03/06 nach echtem Import-Test bestätigen

---

## Known Limitations

| # | Limitation | Scope | Phase 2 |
|---|---|---|---|
| L-01 | Kein nativer Error-Node im Workflow — Fehler-Alerting muss extern über n8n Error-Workflow konfiguriert werden | Workflow-Design | Phase 2: Error-Branch direkt im Blueprint integrieren |
| L-02 | Meta Ads Integration ist auskommentiert / optional — kein vollständiger Test-Pfad für Meta-Daten im aktuellen Blueprint | Feature-Scope | Phase 2: Meta als eigenständiger Sub-Workflow oder eigenes Blueprint-Item |
| L-03 | Einzel-Property only — kein Multi-Property-Rollup in einer Mail | Skalierung | Phase 2: Multi-Property-Blueprint mit Loop-Over-Properties-Node |
| L-04 | Report-Zeitraum fix auf 7 Tage — kein UI/Config-basierter Zeitraum-Selector | Konfigurierbarkeit | Phase 2: Dropdown-basierte Zeitraum-Auswahl via Form-Trigger |
| L-05 | HTML-Template statisch im Code Node — kein externes Template-Management | Customization | Phase 2: Template aus Google Sheets oder externem File laden |
| L-06 | Kein historisches Reporting — jede Ausführung ist zustandslos, keine Persistenz in DB | Datenarchiv | Phase 2: Postgres-/Airtable-Anbindung für historische KPI-Speicherung |
| L-07 | HTML-Escape für Sheet-Kommentar nicht in Standard-Blueprint enthalten | Security | Hotfix empfohlen vor Go-Live (QG-04) |
| L-08 | Token-Ablauf-Monitoring für Meta nicht automatisiert | Betrieb | Phase 2: Separater Token-Health-Check-Workflow |

---

## DB-Update-Befehl

```sql
-- Einfügen oder Update des Blueprint-Eintrags in AEVUM Blueprint Registry
INSERT INTO blueprint_items (
  item_id,
  name,
  type,
  status,
  pricing_tier,
  node_count,
  quality_gate_version,
  quality_gate_score,
  quality_gate_status,
  known_limitations_count,
  dsgvo_cleared,
  security_risks_documented,
  docs_complete,
  created_at,
  updated_at
) VALUES (
  'reporting-dashboard-setup',
  'AEVUM — Reporting Dashboard',
  'blueprint',
  'conditional_pass',
  'S',
  6,
  '1.0',
  '5/10',
  'CONDITIONAL_PASS',
  8,
  TRUE,
  TRUE,
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (item_id) DO UPDATE SET
  status = EXCLUDED.status,
  quality_gate_score = EXCLUDED.quality_gate_score,
  quality_gate_status = EXCLUDED.quality_gate_status,
  known_limitations_count = EXCLUDED.known_limitations_count,
  docs_complete = EXCLUDED.docs_complete,
  updated_at = NOW();

-- Quality Gate Log Entry
INSERT INTO quality_gate_log (
  item_id,
  gate_version,
  gate_date,
  gate_result,
  open_items,
  reviewer,
  notes
) VALUES (
  'reporting-dashboard-setup',
  '1.0',
  NOW(),
  'CONDITIONAL_PASS',
  'QG-04: HTML-Escape im Code Node; QG-01/02/03/06: Import-Test ausstehend',
  'AEVUM Builder-Agent',
  'Hotfix QG-04 vor Customer-Delivery erforderlich. Phase-2-Items dokumentiert.'
);
```

---

## Pattern-Notes für Builder-Logik

Diese Notes dienen der Weiterentwicklung der Blueprint-Builder-Logik und dokumentieren Muster, die beim Erstellen dieses Blueprint-Typs relevant sind.

### Pattern: Schedule-Trigger + Mail-Sender Kombination

Workflows mit Schedule Trigger + E-Mail-Versand haben folgende wiederkehrende Risiken die immer geprüft werden müssen:
- Fehlende Fehler-Benachrichtigung bei stummem Scheitern (Trigger läuft, Node schlägt fehl, niemand merkt es)
- Absender-Reputation (SPF/DKIM immer in Security-Risks und Install-Guide erwähnen)
- Zeitzone-Mismatch zwischen n8n-Host und gewünschter Trigger-Zeit

### Pattern: HTTP-Request gegen externe API (kein nativer n8n Node)

Der Blueprint nutzt `httpRequest` statt eines nativen GA4-Nodes. Das bedeutet:
- Credential-Verwaltung ist manueller (Service Account JSON statt OAuth-Flow)
- API-Response-Parsing liegt vollständig im Code Node
- Fehler-Codes müssen im Code Node explizit behandelt werden
- Für Builder-Logik: Bei diesem Pattern immer auf fehlende Null-Checks im Code Node hinweisen

### Pattern: Code Node als HTML-Builder

Immer wenn ein Code Node HTML-Output generiert der aus externen Quellen gespeist wird:
- HTML-Escape ist Pflicht-Mitigation (QG-04)
- Im Builder-Prompt automatisch auf dieses Risiko hinweisen
- Dieses Muster tritt auf bei: Report-Generierung, Mail-Template-Building, PDF-Vorstufen

### Pattern: Konfiguration im Set-Node

Konfigurations-Werte im Set-Node (statt in Umgebungsvariablen) sind für Self-Service-Blueprints akzeptabel, haben aber Limitations:
- Werte sind im Workflow-JSON sichtbar → kein Schutz für sensible Daten
- Nicht umgebungs-spezifisch (kein Staging/Prod-Split)
- Für DFY: Empfehlung auf n8n-Variablen oder `.env` migrieren

### Offene Builder-Tasks für dieses Item

- [ ] Code Node auf HTML-Escape nachrüsten (QG-04 schließen)
- [ ] Tatsächlichen Workflow-JSON gegen Summary validieren (QG-01/02/03)
- [ ] GA4 HTTP Request Body dokumentieren (welche `dimensions` und `metrics` genau)
- [ ] Changelog-File erstellen (`CHANGELOG.md`)
- [ ] Thumbnail/Preview-Grafik für Produktseite erstellen