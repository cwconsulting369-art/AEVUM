# Content Engine — Quality-Gate & Sign-Off

**Item-Slug:** `content-engine`  
**Item-Type:** DFY  
**Status:** [ ] IN-PROGRESS / [ ] READY-FOR-SIGN-OFF / [ ] SIGNED-OFF

---

## Asset-Inventory

| Asset | Format | Status | Location |
|---|---|---|---|
| Brand-Voice-Profil v1.0 | Notion/Google-Doc | [ ] Done | |
| Content-Typen-Briefings (alle vereinbarten) | Notion/PDF | [ ] Done | |
| Intake-Pipeline (Formular + Zusatz-Input) | Live System | [ ] Done | |
| Ideen-Backlog im Board | Notion/Airtable | [ ] Done | |
| Prompt-Chain: Content-Typ 1 | Prompt-Library | [ ] Done | |
| Prompt-Chain: Content-Typ 2 | Prompt-Library | [ ] Done | |
| Prompt-Chain: weitere Typen (je nach Scope) | Prompt-Library | [ ] Done | |
| Repurposing-Flow | Live System | [ ] Done | |
| Review-Workflow mit Status-Tracking | Live System | [ ] Done | |
| Notification-System (Slack/E-Mail) | Live System | [ ] Done | |
| Publishing-Connector: Destination 1 | Live System | [ ] Done | |
| Publishing-Connector: Destination 2 | Live System | [ ] Done | |
| Publishing-Connector: weitere (je nach Scope) | Live System | [ ] Done | |
| Content-Kalender-View | Notion/Airtable | [ ] Done | |
| Analytics-Daten-Pull (alle vereinbarten Quellen) | Live System | [ ] Done | |
| Wöchentlicher automatisierter Report | Live System | [ ] Done | |
| SOP: Intake (Schrift + Video) | Notion + Loom | [ ] Done | |
| SOP: Review/Approval (Schrift + Video) | Notion + Loom | [ ] Done | |
| SOP: Publishing/Monitoring (Schrift + Video) | Notion + Loom | [ ] Done | |
| Prompt-Library (vollständig versioniert) | Notion/Google-Doc | [ ] Done | |
| Emergency-Runbook | Dokument | [ ] Done | |
| Access-Inventory | Tabelle | [ ] Done | |
| Retainer-Scope-Dokument | PDF | [ ] Done | |
| System-Architektur-Übersicht | Notion/PDF | [ ] Done | |

---

## Sign-Off-Kriterien

| # | Kriterium | Status |
|---|---|---|
| 1 | Brand-Voice-Profil vom Customer schriftlich als "final" bestätigt | [ ] ✅ |
| 2 | Alle vereinbarten Content-Typen haben funktionierende Prompt-Chains; Customer hat min. 3 Drafts pro Typ als "verwendbar" eingestuft | [ ] ✅ |
| 3 | Intake-Pipeline: alle vereinbarten Input-Methoden funktionieren ohne manuelle Korrektur | [ ] ✅ |
| 4 | Review-Workflow: Status-Transitions und Notifications fehlerfrei über min. 5 Werktage UAT | [ ] ✅ |
| 5 | Alle vereinbarten Publishing-Destinations: Test-Posts erfolgreich gepublisht; Fehler werden korrekt notifiziert | [ ] ✅ |
| 6 | Repurposing-Modul: Output entspricht Zielformat; kein manuelles Reformatieren nötig | [ ] ✅ |
| 7 | Analytics-Report: erscheint automatisch wöchentlich; Daten gegen Plattform-Zahlen verifiziert; Abweichung <5% | [ ] ✅ |
| 8 | Alle 3 SOPs vollständig (Schrift + Video); vom CS-Lead reviewed | [ ] ✅ |
| 9 | Handover-Package vollständig übergeben; Customer hat schriftlich bestätigt alle Assets erhalten zu haben | [ ] ✅ |
| 10 | 30-Tage-Retro durchgeführt; offene Issues dokumentiert und priorisiert; Retainer-Scope schriftlich bestätigt | [ ] ✅ |

---

## Known Limitations (Phase-2-Items)

Die folgenden Punkte sind bekannte Einschränkungen oder geplante Erweiterungen, die explizit **nicht** im aktuellen Delivery enthalten sind und im Retainer oder als separate Projekte behandelt werden:

| Limitation | Typ | Empfohlene Behandlung |
|---|---|---|
| Kein Lead-Attribution-Tracking (welcher Post → welcher Lead) | Feature-Gap | Upsell: `ai-lead-engine` oder `sales-os` |
| Kein SEO-Layer (Keyword-Mapping, SERP-Tracking) | Out-of-Scope | Separates Projekt-Offering |
| Prompt-Chain basiert auf Modell-Version zum Launch-Zeitpunkt; Major-Model-Upgrades nicht automatisch enthalten | Tech-Limitation | Change-Request bei signifikanten Modell-Wechseln |
| Analytics deckt nur direkte Plattform-Metriken ab; kein Attribution-Modeling, kein Multi-Touch | Feature-Gap | Upsell: `command-center-dashboard` für erweitertes Reporting |
| Mehr als vereinbarte Marken/Brands erfordern separates Pricing | Scope-Limitation | Retainer-Add-On: €800/Client (Agentur) |
| Video-/Bild-Content-Produktion nicht enthalten | Grundsätzlich Out-of-Scope | Externes Creative-Studio oder separates Offering |
| Community-Management und Comment-Responses nicht automatisiert | Out-of-Scope | Separates Social-Management-Offering |

---

## DB-Update-Befehl

```sql
-- Status-Update bei Sign-Off
UPDATE aevum_service_items
SET
  status                = 'signed-off',
  signed_off_at         = NOW(),
  signed_off_by         = 'REPLACE_WITH_RESPONSIBLE_PERSON',
  handover_confirmed    = TRUE,
  retainer_active       = TRUE,
  phase_2_items         = '["lead-attribution","seo-layer","model-upgrade-handling","extended-analytics","additional-brands","video-content","community-management"]',
  delivery_weeks_actual = REPLACE_WITH_ACTUAL_WEEKS,
  tier                  = 'REPLACE_WITH_M_OR_L',
  upsell_flags          = '["ai-lead-engine","command-center-dashboard","sales-os","script-factory-dfy","business-os"]',
  notes                 = 'REPLACE_WITH_FREE_TEXT_NOTES'
WHERE slug = 'content-engine'
  AND customer_id = REPLACE_WITH_CUSTOMER_ID;

-- Retainer-Record anlegen
INSERT INTO aevum_retainer_contracts (
  customer_id,
  service_slug,
  retainer_start_date,
  monthly_rate,
  scope_ref,
  next_review_date
) VALUES (
  REPLACE_WITH_CUSTOMER_ID,
  'content-engine',
  NOW(),
  REPLACE_WITH_MONTHLY_RATE,
  'retainer-scope-v1',
  NOW() + INTERVAL '90 days'
);
```

---

## Pattern-Notes für DFY-Builder-Pattern

**Was bei diesem Item anders ist als bei anderen DFY-Services:**

1. **Brand-Voice als kritischer Blocking-Dependency** — anders als bei tech-first Services (z. B. `ai-lead-engine`) ist die qualitativ schwer messbare "Brand Voice" der häufigste Failure-Point. Das Brand-Voice-Profil muss als formales Dokument behandelt werden, nicht als informelles Gespräch. Quality-Gate-1 ist deshalb ungewöhnlich "weich" — bewusstes Design.

2. **Zwei-Schichten-Output: Infrastruktur + Content** — Customer erwartet beides. Die Maschine UND dass die Maschine guten Output produziert. Scope muss im Sales-Call explizit trennen: wir bauen die Infrastruktur und trainieren die Prompts; Content-Qualität hängt dauerhaft von Customer-Input-Qualität ab. Garbage-in-Garbage-out muss kommuniziert werden.

3. **Retainer-Value ist höher als Setup-Value für Customer** — die eigentliche Wertentscheidung passiert in Monat 2–4 wenn Prompt-Maintenance und Analytics-Updates den System-Zerfall verhindern. Sales-Brief sollte Retainer aktiver verkaufen als Setup.

4. **Agenturen als Highest-Value-Segment** — Multi-Brand-Setup (Tier L) hat deutlich überproportionale Marge gegenüber Tier M. Bei Agenturen immer nach Anzahl aktiver Clients fragen und direkt Tier-L-Pricing pitchen.

5. **Review-Disziplin als Retainer-Killer** — wenn Customer den Review-Workflow nicht lebt, verfällt das System. Customer-Success muss in Monat 1–2 aktiv auf Review-Backlog achten. Frühzeitige Eskalation ist wichtiger als bei anderen DFY-Items.