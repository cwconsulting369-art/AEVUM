# Quality Gate: newsletter-growth-machine

**Blueprint-ID:** `newsletter-growth-machine`
**Typ:** Blueprint
**Gate-Version:** 1.0
**Erstellt:** 2025
**Status:** PENDING SIGN-OFF

---

## Asset-Inventory

| Asset | Dateiname | Status | Prüfpunkte |
|---|---|---|---|
| Workflow JSON | `workflow.json` | ✅ Vorhanden | 11 Nodes, import-tested |
| README | `README.md` | ✅ Vorhanden (existing) | Vollständig bis auf abgeschnittenes Troubleshooting-Ende |
| Sales Brief | `SALES-BRIEF.md` | ✅ Erstellt | Alle 9 Sections vorhanden |
| Security Risk Matrix | `SECURITY-RISKS.md` | ✅ Erstellt | 12 Risks, davon 3 HIGH, PM-Code-Snippets |
| DSGVO-Check | `DSGVO-CHECK.md` | ✅ Erstellt | EU AI Act, Vendor-DPA-Tabelle, Audit-Checklist |
| Install Guide | `INSTALL-GUIDE.md` | ✅ Erstellt | 10 Schritte, 5 Troubleshooting-Cases |
| Quality Gate | `QUALITY-GATE.md` | ✅ Dieses File | — |
| `workflow.json` Smoke-Test | Manuell vor Go-Live | ⏳ Ausstehend | Import → Execute → Check alle 11 Nodes |
| Pricing-Kalkulation | Intern (nicht Customer-facing) | ✅ In Sales-Brief | DFY S/M, Blueprint-Tier, Audit |

---

## Sign-Off-Kriterien (10/10)

| # | Kriterium | Prüfmethode | Status |
|---|---|---|---|
| 1 | Workflow-JSON importierbar ohne Fehler in n8n ≥ 1.30 | Manueller Import-Test | ⏳ Ausstehend |
| 2 | Alle 11 Nodes korrekt verknüpft, keine fehlenden Connections | Node-Graph-Review | ⏳ Ausstehend |
| 3 | Happy-Path-Test (Szenario A aus Install-Guide) erfolgreich | Execute + Beehiiv-Draft-Check | ⏳ Ausstehend |
| 4 | Approval-Webhook feuert korrekt und triggert Beehiiv-Push | Manueller Klick + API-Response 200 | ⏳ Ausstehend |
| 5 | Kein API-Key im Workflow-JSON als Plaintext vorhanden | `grep -i "sk-or\|bearer\|api_key" workflow.json` | ⏳ Ausstehend |
| 6 | README vollständig (abgeschnittenes Ende im existing README repariert) | Linter + Sichtprüfung | 🔴 Offen — README bricht bei Troubleshooting ab |
| 7 | SALES-BRIEF alle Pricing-Tiers enthalten + realistisch für ICP | Review durch Sales/Founder | ⏳ Ausstehend |
| 8 | DSGVO-CHECK: Vendor-DPA-Links funktionsfähig | Link-Check | ⏳ Ausstehend |
| 9 | SECURITY-RISKS: Alle Pflicht-Mitigations im Install-Guide referenziert | Cross-Check PM-1 bis PM-4 | ✅ Erledigt |
| 10 | EU AI Act Kennzeichnungs-Empfehlung in DSGVO-CHECK und Install-Guide vorhanden | Sichtprüfung | ✅ Erledigt |

**Go-Live-Freigabe:** Erst wenn alle 10 Kriterien ✅

---

## Known Limitations

| Limitation | Severity | Phase 2 Marker |
|---|---|---|
| Thema-Selektion automatisch = immer #1 von 5 Vorschlägen; kein manueller Auswahl-Flow eingebaut | Mittel — einschränkend für Nutzer mit kuratierten Themen | 🔵 Phase 2: Wait-Node nach Ideation für manuelle Themen-Wahl |
| Kein eingebautes Fehler-Handling bei Beihiiv-Push-Failure (kein Retry, keine Alert-Mail) | Mittel — Silent Fail möglich | 🔵 Phase 2: Error-Branch nach HTTP: Beehiiv Push |
| Single-Model-Dependency auf OpenRouter; Modell-Downtime = Workflow-Fail | Mittel | 🔵 Phase 2: Fallback-Modell in IF-Node implementieren |
| Kein Quality-Check des generierten Drafts (Wortanzahl, Themen-Konsistenz) vor Review-Mail | Niedrig — manuell abfangbar im Review | 🔵 Phase 2: Auto-QC-Node (Wortanzahl-Check, Keyword-Presence) |
| Beehiiv-Push pusht als "Draft", nicht als "Scheduled" — Versand-Zeitpunkt muss manuell in Beehiiv gesetzt werden | Niedrig — zusätzlicher manueller Schritt in Beehiiv | 🔵 Phase 2: `scheduled_at`-Parameter in Beehiiv-Push-Body |
| Kein Multi-Newsletter-Support im aktuellen Workflow (eine Publication ID fest konfiguriert) | Niedrig für PB, Mittel für AG mit mehreren Clients | 🔵 Phase 2: Loop über Konfigurations-Array |
| README bricht im Troubleshooting-Abschnitt ab (vorliegendes existing README unvollständig) | Niedrig — Installation noch möglich via Install-Guide | 🔴 Fix vor Go-Live: README reparieren |
| Approval über E-Mail-Link ohne zweiten Bestätigungsschritt — Mail-Client Auto-Preview-Bug möglich | Mittel (Security) | 🔵 Phase 2: Redirect auf Bestätigungs-Seite mit zweitem Button |

---

## README-Fix-Aufgabe (vor Go-Live)

Das bestehende README bricht ab bei:
```
**Beehiiv Push schlägt fehl (401):** API Key abgelaufen oder
```

**Zu ergänzen:**
```markdown
**Beehiiv Push schlägt fehl (401):** API Key abgelaufen oder falscher Scope. 
Neuen Key in Beehiiv Settings → API generieren, in n8n Credential aktualisieren.

**Wait-Node nimmt Approval nicht an:** URL abgelaufen (>7 Tage) oder 
Workflow wurde neu gestartet. Workflow manuell neu ausführen, neuen Draft generieren.

**KI-Output auf Englisch:** System-Prompt um explizite Sprachanweisung ergänzen 
("Schreibe auf Deutsch.") im Node HTTP: Full Draft schreiben.
```

---

## DB-Update-Befehl

```sql
-- Blueprint als "ready_for_review" markieren nach Asset-Erstellung
UPDATE blueprint_items
SET
  status               = 'ready_for_review',
  has_sales_brief      = TRUE,
  has_security_risks   = TRUE,
  has_dsgvo_check      = TRUE,
  has_install_guide    = TRUE,
  has_quality_gate     = TRUE,
  quality_gate_version = '1.0',
  sign_off_complete    = FALSE,  -- erst nach Smoke-Test und README-Fix
  known_limitations    = 8,
  phase2_items         = 6,
  pricing_tier_min     = 'S',
  pricing_tier_max     = 'M',
  icp_fit_ag           = TRUE,
  icp_fit_pb           = TRUE,
  icp_fit_fi           = TRUE,
  eu_ai_act_class      = 'limited_risk',
  dsgvo_dsfa_required  = FALSE,
  updated_at           = NOW(),
  updated_by           = 'builder-agent-v1'
WHERE item_id = 'newsletter-growth-machine';

-- Sign-Off nach manuellem Smoke-Test und README-Fix:
-- UPDATE blueprint_items SET sign_off_complete = TRUE, status = 'published' WHERE item_id = 'newsletter-growth-machine';
```

---

## Pattern-Notes für Builder-Logik

Diese Notes dokumentieren Patterns aus diesem Blueprint für Wiederverwendung in der Builder-Logik:

**Pattern: Webhook-Wait-Approval**
- Jeder Blueprint mit `n8n-nodes-base.wait` triggert automatisch: Security-Risk "Webhook missbrauchbar" (Severity HIGH) + Mitigation PM-1 (Token-Auth)
- DSGVO-Note: Wait-Node hält PII in Execution-State → Execution-Retention-Setting Pflicht
- Sales-Note: Human-in-the-Loop ist Kaufargument für Compliance-affine Kunden, immer in Conversion-Story erwähnen

**Pattern: LLM via HTTP (OpenRouter)**
- Jeder LLM-Call via HTTP triggert: EU AI Act Limited Risk Einordnung + Kennzeichnungspflicht
- DSGVO-Risk: Drittlandübermittlung USA, kein vollständiger AVV verfügbar → "No-PII-in-Prompts" als Pflicht-Mitigation
- Security-Risk: Hallucination + Content-Quality = immer Severity HIGH wenn Output öffentlich kommuniziert wird
- Modell-Version immer pinnen: Known Limitation wenn nicht gepinnt

**Pattern: Mail-Sender Node**
- Jeder sendEmail-Node triggert: SMTP-Credential-Risk (Spam-Abuse), SPF/DKIM/DMARC-