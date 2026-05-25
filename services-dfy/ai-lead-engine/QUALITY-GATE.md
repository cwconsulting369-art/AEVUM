# AI Lead Engine — Quality-Gate & Sign-Off

## Asset-Inventory

| # | Asset | Typ | Status | Ablage |
|---|---|---|---|---|
| 1 | ICP-Dokumentation | Notion-Seite | ☐ | /aevum-delivery/[customer]/icp |
| 2 | Scoring-Kriterien-Tabelle | Notion-Tabelle | ☐ | /aevum-delivery/[customer]/scoring |
| 3 | Scraping-Pipeline (Apollo/Clay) | Live-Setup | ☐ | Tool-Account Customer |
| 4 | Enrichment-Workflow | Automation (Make/Zapier) | ☐ | Make/Zapier-Workspace |
| 5 | AI-Scoring-Logik | Automation / GPT-Workflow | ☐ | Make/Zapier oder Clay |
| 6 | Blacklist / DNC-Filter | Airtable-Tabelle oder Clay-Filter | ☐ | Verknüpft mit Pipeline |
| 7 | Outreach-Domain + DNS-Config | Technisch live | ☐ | Registrar-Account Customer |
| 8 | Sending-Tool-Setup (Instantly/Smartlead/Lemlist) | Live-Account | ☐ | Customer-Account |
| 9 | Cold-Email-Sequenz(en) | Sending-Tool | ☐ | Sending-Tool-Account |
| 10 | LinkedIn-Message-Sequenz | Dokumentiert + ggf. Tool | ☐ | Notion + Tool |
| 11 | AI-First-Line-Personalisierung | Clay-Spalte oder GPT-Workflow | ☐ | Clay / Make |
| 12 | Follow-Up-Logik (Opener/Non-Opener) | Sending-Tool-Automation | ☐ | Sending-Tool |
| 13 | CRM-Integration (Webhook/API) | Live-Verbindung | ☐ | CRM + Make/Zapier |
| 14 | Lead-Status-Mapping | CRM-Konfiguration | ☐ | CRM-Account Customer |
| 15 | Performance-Dashboard | Airtable / Notion / Custom | ☐ | Shared mit Customer |
| 16 | Weekly-Automated-Report | Make/Zapier-Trigger | ☐ | Make/Zapier-Workspace |
| 17 | Campaign-Setup-Playbook | Notion-Seite | ☐ | Shared Workspace |
| 18 | Loom-Video: Dashboard-Walkthrough | Loom | ☐ | Link in Notion |
| 19 | Loom-Video: Neue Kampagne starten | Loom | ☐ | Link in Notion |
| 20 | Loom-Video: Blacklist pflegen | Loom | ☐ | Link in Notion |
| 21 | Tool-Zugänge-Dokumentation | Notion (verschlüsselt) | ☐ | Shared Workspace |
| 22 | Retainer-Call-Booking bestätigt | Calendly | ☐ | E-Mail-Bestätigung |

---

## Sign-Off-Kriterien (alle 10 müssen ✅ sein)

| # | Kriterium | Status |
|---|---|---|
| 1 | Scraping-Pipeline liefert täglich ≥50 qualifizierte Leads (nach ICP-Scoring-Threshold) ohne manuellen Eingriff — dokumentiert über 3 aufeinanderfolgende Tage | ☐ |
| 2 | Enrichment-Rate ≥85%: Anteil der Leads mit verifizierter E-Mail-Adresse gemessen über letzten 200 gescrapten Leads | ☐ |
| 3 | Domain-Warming-Status: ≥2 Wochen Warming-Laufzeit, Spam-Rate unter 0.1% (Google Postmaster / SNDS-Screenshot liegt vor) | ☐ |
| 4 | AI-First-Line-Personalisierung: Test-Batch von 20 Leads geprüft — 90% korrekt gefüllt, kein leeres Feld, kein sichtbarer Fallback-Text | ☐ |
| 5 | Follow-Up-Logik korrekt: Opener-Pfad und Non-Opener-Pfad werden korrekt ausgelöst — dokumentierter Test mit je 2 simulierten Leads | ☐ |
| 6 | CRM-Integration: Reply + Calendly-Click triggern automatisch Lead-Erstellung / Stage-Wechsel im CRM — getesteter End-to-End-Durchlauf dokumentiert | ☐ |
| 7 | Dashboard zeigt Echtzeit-Metriken (Kontaktiert / Geöffnet / Replied / Booked) ohne manuelle Datenpflege — Customer hat Dashboard-Zugang bestätigt | ☐ |
| 8 | Weekly-Automated-Report ausgelöst und empfangen: Test-Report wurde an Customer-E-Mail gesendet und bestätigt | ☐ |
| 9 | Soft-Launch (50-100 Leads) abgeschlossen ohne kritische Fehler: Bounce <5%, Spam-Rate <0.1%, mind. 1 organischer Reply, Customer-Freigabe schriftlich vorliegt | ☐ |
| 10 | Handover-Package vollständig: Alle 22 Assets im Inventory auf ✅, Playbook übergeben, alle 3 Loom-Videos veröffentlicht, Retainer-Call gebucht | ☐ |

**Freigabe durch:** _______________________ (Founder-Signatur oder schriftliche Bestätigung)
**Datum:** _______________________
**Customer-Gegenzeichnung:** _______________________ (schriftlich, Slack/E-Mail-Screenshot ausreichend)

---

## Known-Limitations (Phase-2-Items — nicht in aktuellem Scope)

| Limitation | Erklärung | Möglicher Upsell / Roadmap |
|---|---|---|
| **Kein A/B-Testing in Tier M** | Tier M erhält eine Sequenz-Variante. Statistische Auswertung paralleler Varianten ist nicht Teil des Setups. | Tier-L-Upgrade oder Add-On (+€1.500) |
| **Kein Inbound-Lead-Capture** | System ist rein outbound. Eingehende Leads via Website oder Ads sind nicht integriert. | `website-crm`-Service |
| **LinkedIn-Automatisierung manuell-limitiert** | LinkedIn-Tool-Limits (100-150 Connections/Tag) können nicht technisch überschritten werden ohne Account-Risiko. Kein Workaround. | Diversifikation auf Email als Primärkanal |
| **Kein Predictive-Scoring (ML-basiert)** | Scoring ist regelbasiert oder GPT-basiert, nicht auf Customer-historischen-Daten trainiert. Wird genauer über Zeit — aber kein ML-Modell. | Zukünftiger Service `database-system` + Custom-ML |
| **Copy-Optimierung nicht automatisiert** | Wir testen keine Copy automatisch. Optimierung passiert durch Mensch im Retainer-Call. | Tier-L-Upgrade für gemanagtes A/B-Testing |
| **Kein Telefon-Outreach-Kanal** | System deckt Email + LinkedIn ab. Cold-Calling-Integration (z.B. via Orum, Salesloft) ist Out-of-Scope. | Separater Service / Retainer-Erweiterung |
| **Keine CRM-Automatisierungen beyond Lead-Push** | Wir pushen Leads ins CRM. Pipeline-Management, Deal-Stages-Automation, Forecasting sind nicht enthalten. | `sales-os`-Service |

---

## DB-Update-Befehl

```sql
-- AEVUM Service-Catalog: ai-lead-engine Sign-Off
UPDATE service_deliveries
SET
  status                  = 'delivered',
  sign_off_date           = CURRENT_DATE,
  tier                    = 'M',                        -- oder 'L' anpassen
  setup_fee_eur           = 11000,                      -- tatsächlich vereinbarter Wert
  monthly_retainer_eur    = 2200,                       -- tatsächlich vereinbarter Wert
  implementation_weeks    = 8,
  assets_delivered        = 22,
  quality_gates_passed    = 10,
  known_limitations_count = 7,
  next_review_date        = CURRENT_DATE + INTERVAL '30 days',
  retainer_active         = TRUE,
  notes                   = 'Soft-Launch abgeschlossen. Handover-Package vollständig. Retainer-Call gebucht.'
WHERE
  service_slug   = 'ai-lead-engine'
  AND customer_id = '[CUSTOMER_ID]';  -- ersetzen

-- Upsell-Tracking anlegen
INSERT INTO upsell_pipeline (customer_id, source_service, target_service, trigger_condition, created_at)
VALUES
  ('[CUSTOMER_ID]', 'ai-lead-engine', 'sales-os',                 'Closing-Rate < 20% nach 60 Tagen',       CURRENT_TIMESTAMP),
  ('[CUSTOMER_ID]', 'ai-lead-engine', 'command-center-dashboard', 'Multi-Tool-Visibility gewünscht',         CURRENT_TIMESTAMP),
  ('[CUSTOMER_ID]', 'ai-lead-engine', 'content-engine',           'Inbound-Aufbau parallel gewünscht',       CURRENT_TIMESTAMP);
```

---

## Pattern-Notes für DFY-Builder-Pattern

```
PATTERN: ai-lead-engine
VERSION: 1.0
ERSTELLT: [DATUM]

KERN-DIFFERENZIERUNG:
- Einziger DFY-Service mit aktiver Outbound-Sending-Komponente (Domain-Warming als kritischer Pfad)
- Scoring-Logik ist Customer-ICP-spezifisch — nicht generisch. Kein Template-Scoring.
- Copy ist Service-Bestandteil — nicht nur Tech. Copywriting-Kapazität muss bei Planung eingeplant werden.

KRITISCHE ABHÄNGIGKEITEN (die anderen Services nicht haben):
- Domain-Warming: zwingt 2-3 Wochen Vorlaufzeit. Timeline kann nicht komprimiert werden.
- ICP-Klarheit ist harter Blocker — kein Scraping ohne definierten ICP.
- Offer-Qualität liegt außerhalb unseres Einflusses. Reply-Rate-Erwartungen früh kalibrieren.

HÄUFIGE SCOPE-CREEP-VEKTOREN:
- "Können wir auch [zweite Zielgruppe] einbauen?" → immer CR
- "Schreibt ihr auch unsere LinkedIn-Posts?" → immer Out-of-Scope → content-engine
- "Könnt ihr auch die Calls übernehmen?" → nie. Klare Linie.

RETAINER-QUALITÄT HÄNGT AB VON:
- Monatlicher Copy-Iteration-Zyklus (2 Runden inkludiert)
- Performance-Monitoring muss durch Eng wöchentlich gecheckt werden (nicht nur auf Zuruf)
- Customer muss Feedback auf Reply-Qualität geben — ohne das kein Optimierungsloop

NÄCHSTE PATTERN-VERSION sollte adressieren:
- ML-basiertes Scoring als Premium-Add-On dokumentieren
- Telefon-Outreach-Kanal-Integration als separates Modul ausarbeiten
- Multi-Sprachen-Setup als Tier-L-Standardoption festschreiben
```