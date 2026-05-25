# Quality-Gate — Automation Audit

## Asset-Inventory

| # | Asset | Format | Status | Verantwortlich |
|---|---|---|---|---|
| 1 | Process-Inventory-Dokument | Notion + PDF-Export | ☐ | Senior-Analyst |
| 2 | Tool-Stack-Bewertungs-Sheet | Google Sheets + PDF | ☐ | Engineering |
| 3 | Ineffizienz-Matrix | Google Sheets + PDF | ☐ | Senior-Analyst |
| 4 | Automation-Kandidaten-Liste | Google Sheets + Notion | ☐ | Founder |
| 5 | Quick-Win-Sheet | PDF + Notion | ☐ | Founder |
| 6 | 90-Tage-Roadmap | Notion + PDF | ☐ | Founder |
| 7 | ROI-Kalkulation (3 Szenarien) | Google Sheets + PDF | ☐ | Founder |
| 8 | Findings-Deck (Executive + Detail) | Google Slides + PDF | ☐ | Founder + CS |
| 9 | Stack-Empfehlung-Dokument | PDF | ☐ | Founder + Engineering |
| 10 | Video-Walkthrough (min. 20 min) | Loom / MP4 | ☐ | Customer-Success |
| 11 | Audit-Archiv (vollständig) | Google Drive / Notion | ☐ | Customer-Success |
| 12 | Customer-Sign-Off (schriftlich) | E-Mail-Bestätigung | ☐ | Customer-Success |

---

## Sign-Off-Kriterien

| # | Kriterium | Status |
|---|---|---|
| 1 | Alle 12 Assets aus dem Inventory sind übergeben und für Customer zugänglich | ☐ |
| 2 | Jeder dokumentierte Workflow enthält Trigger, Schritte, beteiligte Tools, Handoff-Punkte und bekannte Fehlerquellen | ☐ |
| 3 | Ineffizienz-Matrix enthält für jede Lücke: Zeit-Verlust-Schätzung, Fehlerrate-Einschätzung und Automatisierbarkeits-Score | ☐ |
| 4 | 90-Tage-Roadmap enthält Phasen, Projekte, Abhängigkeiten, Effort-Estimate und Priority-Score (keine Phase ohne konkrete Projekte) | ☐ |
| 5 | ROI-Kalkulation enthält alle 3 Szenarien (konservativ / realistisch / optimistisch) mit dokumentierten Annahmen | ☐ |
| 6 | Findings-Deck enthält Executive Summary (max. 5 Slides) + vollständigen Anhang; keine generischen Empfehlungen ohne Datenbasis | ☐ |
| 7 | Quick-Win-Sheet enthält für jede der Top 5 Automationen: Tool-Empfehlung, Aufwand-Schätzung, Nutzen-Schätzung, konkreten nächsten Schritt | ☐ |
| 8 | Readout-Call hat stattgefunden, Entscheider war anwesend, offene Fragen sind dokumentiert und beantwortet | ☐ |
| 9 | Video-Walkthrough ist min. 20 min, deckt alle Kern-Deliverables ab und ist verständlich ohne Vorwissen | ☐ |
| 10 | Schriftlicher Customer-Sign-Off vorhanden (E-Mail-Bestätigung mit Wording: "Findings vollständig und verständlich") | ☐ |

> Alle 10 Punkte müssen ✅ sein bevor das Projekt als "Done" markiert wird.

---

## Known-Limitations (Phase-2-Items)

| Limitation | Begründung | Möglicher Folge-Schritt |
|---|---|---|
| ROI-Schätzwerte sind keine testierten Zahlen | Basieren auf Industrie-Benchmarks und Interview-Angaben, nicht auf gemessenen Daten | Nach 90 Tagen Umsetzung: Retrospektive mit echten Daten |
| Workflows wurden beschrieben, nicht beobachtet | Prozess-Doku basiert auf Interviews; tatsächliche Ausführung kann abweichen | Process-Mining-Tool (z.B. Celonis Lite) als Zusatz-Schritt |
| Tool-Stack-Bewertung ist point-in-time | SaaS-Markt ändert sich; Empfehlungen können in 12 Monaten überholt sein | Jährliches Re-Audit oder Retainer-Check empfohlen |
| Keine Integration von HR/People-Faktoren | Effizienzprobleme durch Teamstruktur oder Skills sind nicht im Scope | HR-Strategieberatung separat |
| Roadmap nicht executable ohne Umsetzungs-Partner | Der Plan ist vollständig, aber Umsetzung erfordert Ressourcen (intern oder AEVUM DFY) | Direkt-Upsell auf relevante DFY-Services |

---

## DB-Update-Befehl

```sql
UPDATE aevum_service_items
SET
  status                = 'active',
  item_slug             = 'automation-audit',
  item_type             = 'dfy',
  tier_min              = 'M',
  tier_max              = 'L',
  setup_fee_min_eur     = 8000,
  setup_fee_max_eur     = 35000,
  retainer_fee_min_eur  = 0,
  retainer_fee_max_eur  = 3000,
  retainer_optional     = TRUE,
  timeline_weeks_min    = 5,
  timeline_weeks_max    = 12,
  icp_ag                = TRUE,
  icp_pb                = TRUE,
  icp_fi                = TRUE,
  icp_ag_fit_score      = 5,
  icp_pb_fit_score      = 4,
  icp_fi_fit_score      = 5,
  upsell_slugs          = ARRAY[
                            'sales-os',
                            'ai-lead-engine',
                            'command-center-dashboard',
                            'content-engine',
                            'business-os',
                            'database-system'
                          ],
  last_updated          = NOW(),
  updated_by            = 'dfy-builder-v1'
WHERE item_slug = 'automation-audit';
```

---

## Pattern-Notes für DFY-Builder-Pattern

```
PATTERN: audit-first-productized-service

KATEGORIE: Discovery / Strategy / Diagnostic
POSITIONIERUNG: Standalone-Produkt + natürlicher Upsell-Funnel-Einstieg

KEY-DIFFERENTIATOR vs. generische Beratung:
- Deliverables sind klar definiert (kein offenes Beratungsmandat)
- Time-boxed (5-12 Wochen, harte Deadline)
- Handover-Package macht Customer unabhängig von AEVUM
- ROI-Kalkulation als integraler Bestandteil (kein Soft-Consulting)

PRICING-LOGIK SPEZIFISCH:
- Kein verpflichtender Retainer (Standalone-tauglich)
- Retainer nur wenn Customer Roadmap mit AEVUM umsetzt
- Setup-Fee ist der primäre Revenue-Driver dieses Items
- Niedrige Einstiegs-Fee (€8k) senkt Hürde für erste Engagement

UPSELL-MECHANIK:
- Audit findet per Definition die Probleme die DFY-Services lösen
- Natural Handoff: Roadmap-Präsentation = impliziter Sales-Pitch für nächstes Item
- Customer, der Audit gemacht hat, ist 3-4x wahrscheinlicher für Follow-up DFY
- Empfehlung: Roadmap immer mit konkreten AEVUM-Service-Slugs als Lösungsoption referenzieren

RISK-PROFIL: Niedrig (kein Build, kein Tech-Stack, keine Integration)
DELIVERY-KOMPLEXITÄT: Mittel (hohe Analyse-Qualität erforderlich; Findings müssen spezifisch und nicht generisch sein)

HÄUFIGSTER FEHLER BEI DELIVERY:
- Generische Roadmap-Empfehlungen die nicht auf Customer-Daten basieren
- Zu viele Items auf Roadmap → Customer verliert Fokus → Roadmap wird nicht umgesetzt
- Findings-Call ohne Priorisierungs-Workshop → kein klarer nächster Schritt für Customer

ANTI-PATTERN:
- Audit nicht als "Consulting-Projekt" positionieren (verliert Produktcharakter)
- Kein unbegrenztes Scope-Creep erlauben (5-6 Workflows ist hard limit für Standard-Tier)
```