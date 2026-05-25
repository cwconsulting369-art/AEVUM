# HUD Command Center — Quality-Gate & Sign-Off

## Asset-Inventory

| # | Asset | Format | Status | Ablageort |
|---|---|---|---|---|
| 1 | Architektur-Dokumentation (final, versioniert) | Markdown / Notion | ☐ | `/projects/{customer-id}/docs/architecture-v[n].md` |
| 2 | Datenfluss-Diagramm | PDF / Figma | ☐ | `/projects/{customer-id}/docs/dataflow-diagram.pdf` |
| 3 | Connector-Übersicht (Quellen, Auth, Frequenz) | Tabelle in Doku | ☐ | In architecture doc integriert |
| 4 | Data-Schema-Dokument (Feld-Definitionen, Typen) | Markdown / Sheet | ☐ | `/projects/{customer-id}/docs/schema.md` |
| 5 | Dashboard (Live-Deployment) | URL | ☐ | In Handover-E-Mail dokumentiert |
| 6 | Dashboard-Access-Übersicht (User/Rolle/Permissions) | Tabelle | ☐ | `/projects/{customer-id}/access-log.md` |
| 7 | Alert-Definitionen + Schwellenwert-Tabelle | Tabelle | ☐ | `/projects/{customer-id}/docs/alerts.md` |
| 8 | Fehlerbehandlungs-Playbook | Markdown | ☐ | `/projects/{customer-id}/docs/error-playbook.md` |
| 9 | Training-Recording | Video-Link | ☐ | `/projects/{customer-id}/handover/training-recording.url` |
| 10 | Connector-Test-Protokoll (je Quelle) | Tabelle / Doc | ☐ | `/projects/{customer-id}/qa/connector-tests.md` |
| 11 | UAT-Protokoll + Customer Sign-Off (E-Mail) | E-Mail-Screenshot / PDF | ☐ | `/projects/{customer-id}/qa/uat-signoff.pdf` |
| 12 | Edge-Case-Test-Protokoll | Markdown | ☐ | `/projects/{customer-id}/qa/edge-case-tests.md` |
| 13 | Change-Request-Formular-Vorlage | Markdown / PDF | ☐ | `/projects/{customer-id}/handover/cr-template.md` |
| 14 | Retainer-SLA-Dokument | PDF | ☐ | `/projects/{customer-id}/handover/retainer-sla.pdf` |
| 15 | 30-Tage-Support-Kanal (aktiv) | Slack-Channel / Ticket-Link | ☐ | In Handover-E-Mail dokumentiert |

---

## Sign-Off-Kriterien

| # | Kriterium | Prüfmethode | Status |
|---|---|---|---|
| 1 | Alle vereinbarten Datenquellen liefern Daten live ins HUD, kein manueller Import | Live-Screenshot mit Timestamp, Gegencheck mit Quell-System | ☐ |
| 2 | Auto-Refresh läuft: Datenverzögerung ≤ 15 Min. unter Normalbetrieb | Timed Test dokumentiert (3x zu verschiedenen Zeitpunkten) | ☐ |
| 3 | Alle KPI-Card-Werte korrekt: Abweichung ≤ 1% vs. Rohdaten im Quell-System | Gegencheck-Tabelle ausgefüllt je Card | ☐ |
| 4 | Alert-System löst innerhalb ≤ 5 Min. nach Trigger aus | Testlauf dokumentiert mit Timestamp Trigger / Timestamp Alert-Empfang | ☐ |
| 5 | Mind. 2 Rollen-Views (Tier M) / vereinbarte Anzahl (Tier L) live und mit korrekten Permissions | Login-Test mit Customer-Accounts beider Rollen, Screenshot | ☐ |
| 6 | Edge-Cases dokumentiert und Dashboard verhält sich definiert bei API-Ausfall | Test: API-Verbindung getrennt → Dashboard zeigt "Last Updated"-Timestamp + kein Crash | ☐ |
| 7 | Architektur-Dokument final, aktuell, alle Quellen und Frequenzen korrekt beschrieben | Founder-Review bestätigt | ☐ |
| 8 | Fehlerbehandlungs-Playbook deckt Top-3-Szenarien ab | CS-Review: Playbook lesbar und umsetzbar für nicht-technischen Customer | ☐ |
| 9 | Training abgehalten, Recording-Link an Customer gesendet und bestätigt | E-Mail-Bestätigung Customer vorhanden | ☐ |
| 10 | Customer-UAT schriftlich abgenommen, Support-Kanal aktiv, Retainer-SLA kommuniziert | UAT-Sign-Off-E-Mail in QA-Ordner, Slack-Kanal/Ticket-System überprüft | ☐ |

**Alle 10 Punkte müssen ✅ sein vor DB-Update und Retainer-Start-Bestätigung.**

---

## Known-Limitations (Phase-2-Items)

Diese Items sind bewusst nicht in diesem Engagement enthalten. Sie sind dokumentiert damit kein falsches Erwartungsmanagement entsteht und für spätere Upsell-Gespräche genutzt werden können:

| Limitation | Kontext | Potentieller Phase-2-Pfad |
|---|---|---|
| Kein Forecasting / Predictive Layer | HUD zeigt historische + aktuelle Daten. Keine ML-Prognosen. | Database-System-Erweiterung oder dediziertes ML-Engagement |
| Kein Automation-Response-Layer | HUD triggert Alerts, handelt aber nicht selbst (kein "wenn KPI X → automatisch Aktion Y") | Business-OS oder Sales-OS als Automation-Layer drüber |
| Historische Daten nur soweit API hergibt | Backfill über API-Limits hinaus wurde nicht implementiert (außer explizit beauftragt) | Data-Migration-Add-on, separat zu beauftragen |
| Keine White-Label-Fähigkeit | Dashboard ist für Customer intern, nicht für Weitergabe an deren Clients gebaut | Separates White-Label-Engagement |
| Qualität der Daten abhängig von Quell-Systemen | Wenn Quelldaten sich verschlechtern (fehlende Pflege im CRM etc.) verschlechtert sich HUD-Qualität | Regelmäßige Datenqualitäts-Reviews im Retainer; ggf. Database-System-Engagement |
| Kein natürlichsprachlicher Query-Layer | Man kann nicht "Zeig mir alle Kunden die letzten Monat über 10k ausgegeben haben" reintippen | Future: AI-Query-Layer als Add-on |

---

## DB-Update-Befehl

```sql
-- HUD Command Center Delivery Sign-Off
-- Ausführen NUR wenn alle 10 Sign-Off-Kriterien ✅

UPDATE aevum_projects
SET
  status                  = 'delivered',
  delivery_completed_at   = NOW(),
  phase                   = 'retainer',
  retainer_start_date     = CURRENT_DATE,
  handover_package_url    = '/projects/{customer-id}/handover/',
  known_limitations_noted = TRUE,
  updated_at              = NOW()
WHERE
  project_slug  = 'hud-command-center'
  AND customer_id = '{customer-id}'; -- Ersetzen vor Ausführung

-- Retainer-Record anlegen
INSERT INTO aevum_retainers (
  project_id,
  customer_id,
  service_slug,
  tier,                    -- 'M' oder 'L'
  monthly_fee,             -- z.B. 2200 (Tier M) oder 3800 (Tier L)
  included_changes_per_mo, -- 2 (Tier M) oder 5 (Tier L)
  start_date,
  next_review_date,
  status
)
VALUES (
  (SELECT id FROM aevum_projects WHERE project_slug = 'hud-command-center' AND customer_id = '{customer-id}'),
  '{customer-id}',
  'hud-command-center',
  '{tier}',
  {monthly_fee},
  {included_changes},
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days', -- erster Check-in
  'active'
);
```

---

## Pattern-Notes für DFY-Builder-Pattern

**Service-Charakter:** Daten-Aggregation + Visualisierung. Kein Logic-Building, kein Automation-Bau. Das HUD ist passiv — es zeigt, handelt nicht.

**Kritischste Phase:** Phase 2 (Connector-Build). Hier entstehen 70% der unerwarteten Aufwände. API-Dokumentation lügt, Rate-Limits sind undokumentiert, Auth-Flows ändern sich. Buffer einplanen.

**Häufigstes Scope-Creep-Muster:** Customer sieht das fertige Dashboard und will sofort 3 neue Quellen dazuhaben die "eigentlich eh logisch wären". Scope-Freeze-Disziplin ist nicht optional. CR-Policy muss im Kick-off explizit besprochen werden, nicht nur im Vertrag stehen.

**Differenzierung zu command-center-dashboard (ähnlicher Slug):** HUD-Command-Center = Real-Time-Focus mit Live-Streams und Alert-System. Cross-Tool-Visibility ist das Ziel von command-center-dashboard aber der Echtzeit-Aspekt und das Alert-System sind das differenzierende Merkmal dieses Slugs. Im Sales-Gespräch: "Wie schnell merkt ihr aktuell wenn eine wichtige Metrik aus dem Ruder läuft?"

**Retainer-Risiko:** Technisch gesehen das stabilste DFY-Offering wenn Phase 1-2 sauber sind. Connector-Maintenance ist berechenbar. Höchstes Churn-Risiko: Customer denkt nach 3 Monaten "das läuft ja alleine, warum zahle ich noch?" — proaktiv mit Retainer-Wert-Kommunikation entgegenwirken (monatlicher "was haben wir gemacht" Summary).

**Upsell-Timing:** 60-90 Tage nach Go-Live. Customer hat dann genug Daten gesehen um zu wissen was er nicht nur sehen, sondern auch automatisch anstoßen will. Dann ist der Boden für Business-OS oder Sales-OS bereitet.