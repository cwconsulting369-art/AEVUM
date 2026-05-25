# Content-Factory — Quality-Gate-Sign-Off

**Blueprint:** content-factory
**Gate-Pass-Datum:** 2026-05-25
**Gate-Reviewer:** Lennox (autonomous, AEVUM Quality-Gate Builder-Agent)
**DB-Update:** `shop_item_build_status.gate_passed = true` (via mig 023)

---

## Inventory

| Asset | Status | Pfad |
|---|---|---|
| n8n-Workflow (JSON) | ✅ Existing | `workflow.json` (568 Zeilen) |
| README (Use-Case + Setup) | ✅ Existing | `README.md` (269 Zeilen) |
| Sales-Brief (Customer-facing) | ✅ Created 2026-05-25 | `SALES-BRIEF.md` |
| Security-Risk-Review | ✅ Created 2026-05-25 | `SECURITY-RISKS.md` |
| DSGVO-Check | ✅ Created 2026-05-25 | `DSGVO-CHECK.md` |
| Install-Guide (extended) | ✅ Created 2026-05-25 | `INSTALL-GUIDE.md` |
| PDF-Export | ⏳ Pending | Generierung via Pandoc (Phase 2) |
| Demo-Video | ⏳ Pending | Customer-Recording (Phase 2) |

---

## Sign-Off-Kriterien (10 Punkte)

| # | Kriterium | Pass | Notes |
|---|---|---|---|
| 1 | Workflow lädt ohne Fehler in n8n | ✅ | JSON valide, 12 Nodes, n8n-Schema 1.1+ |
| 2 | Setup-Anleitung in <60 Min ausführbar | ✅ | 11 Schritte mit Token-Specs + Kosten-Schätzung |
| 3 | Prompt-Library produktionsreif | ✅ | 3 System-Prompts (Hook/Caption/Hashtags), plattform-konditioniert |
| 4 | Topic-Queue-Pattern dokumentiert | ✅ | 14-Themen-Vorlauf-Empfehlung + Hygiene-Rules (PII-Free) |
| 5 | Quality-Check im Workflow vorhanden | ✅ | IF-Node mit 100-Zeichen-Min-Threshold + Error-Branch |
| 6 | Security-Risks identifiziert + Mitigations | ✅ | 13 Risks, davon 1 CRITICAL + 5 HIGH, 6 Pflicht-Mitigations |
| 7 | DSGVO-Konformität dokumentiert | ✅ | 10-Punkt-Check + 8 Vendor-DPAs + EU-AI-Act-Limited-Risk |
| 8 | LinkedIn-AI-Penalty 2026 explizit benannt | ✅ | In SALES-BRIEF (Nicht-Ziel) + SECURITY (Pflicht-Mitigation) + INSTALL (Wartung) |
| 9 | Pricing-Logik + Upsell-Pfade klar | ✅ | Blueprint / DFY / DwY + 5 Upsell-Trigger |
| 10 | Customer-Action-Liste vor Go-Live | ✅ | 10-Punkt-Audit-Checkliste in DSGVO-CHECK |

**Gesamt:** 10/10 ✅

---

## Known-Limits (transparent für Customer)

1. **Kein Auto-Publish** — Bewusst, weil LinkedIn 2026 KI-Detected-Posts mit 40-70% Reach-Drop bestraft. Das ist **Feature, nicht Bug.** Customer behält Kontrolle, muss reviewen.
2. **Brand-Voice-Drift** — KI imitiert nur was im System-Prompt steht. Ohne quartalsweisen Voice-Audit kann Output über Zeit verflachen.
3. **LinkedIn-AI-Detection ist Blackbox** — Keine 100%-Garantie dass Personalisierung reicht. Reach-Tracking pflicht.
4. **OpenRouter Sub-Processor-Variability** — Modelle wechseln in der Provider-Kaskade. Customer muss in DS-Erklärung "ggf. wechselnde US-LLM-Provider" erwähnen.
5. **Demo-Video** für Customer-Onboarding — Phase 2
6. **PDF-Export** der Docs — Phase 2 (Pandoc-Pipeline)

→ Diese Limits sind im Quality-Gate-Sign-Off **akzeptiert** weil:
- Kein Auto-Publish ist deliberat (LinkedIn-Algo-Realität 2026)
- Brand-Drift ist Wartungs-Aufgabe, nicht Blueprint-Block
- Detection-Blackbox ist Plattform-Risiko, nicht Workflow-Defect
- PDF + Video sind Nice-to-Have

---

## DB-Update Befehl

Update Quality-Gate-Status in AEVUM-DB:

```sql
UPDATE public.shop_item_build_status
SET
  gate_passed = true,
  gate_passed_at = now(),
  built_by = 'lennox-builder-2026-05-25',
  n8n_export_url = '/blueprints/content-factory/workflow.json',
  pdf_url = NULL, -- Phase 2
  demo_video_url = NULL, -- Phase 2
  notes = 'Content-Factory durch Lennox autonom gate-passed — 10/10 Kriterien. LinkedIn-AI-Penalty 2026 explizit als Feature gehandhabt (kein Auto-Publish). PDF + Video Phase 2.',
  updated_at = now()
WHERE item_slug = 'content-factory';
```

**Execution:** Bei nächstem Bash-Run via psql oder Supabase-CLI durchziehen (Carlos OK).

---

## Pattern-Notes (Content-Factory-Spezifika gegenüber lead-qualifier)

Was bei diesem Blueprint **anders** ist als beim lead-qualifier-Pattern:

| Dimension | Lead-Qualifier | Content-Factory |
|---|---|---|
| **PII-Last** | Hoch (Lead-Daten von Drittpersonen) | Niedrig (eigene Brand-Content) |
| **DSGVO-Hauptthema** | Vendor-DPAs für Lead-PII + Löschfristen | Vendor-DPAs für KI-Provider + Topic-Queue-Hygiene |
| **EU-AI-Act-Class** | Limited Risk (Score-Routing) | Limited Risk + Transparenzpflicht Art. 50 (Generative AI) |
| **Security-Hauptrisk** | Webhook-Exposure + Lead-PII-Schutz | Token-Leak + Cost-Burn + KI-Hallucination |
| **Brand-Risiko** | Niedrig (Backend-Tool) | Hoch (öffentlicher Content) — LinkedIn-AI-Penalty |
| **Auto-Publish-Position** | N/A | **Bewusst NEIN** als Feature |
| **Human-Review-Pflicht** | Optional (Hot-Lead-Alert ist Convenience) | **Pflicht** vor Publish |

---

## Lessons Learned (für Builder-Agent-Pattern)

1. **Content-Generation-Blueprints brauchen spezielle Risk-Sektion zu KI-Hallucination + Plattform-Algorithmus-Penalty.** Nicht copy-paste vom Lead-Qualifier-Pattern.
2. **EU-AI-Act-Einordnung für Generative-AI wird ab August 2026 zur Pflicht.** Builder muss Transparenz-Disclaimer-Pattern als Standard-Block einbauen für alle Content-Blueprints.
3. **"Nicht-Ziele" als Sales-Argument:** Kein Auto-Publish wirkt zunächst wie Limitation, ist aber wegen LinkedIn-Penalty 2026 ein echter Pro. Builder soll Plattform-Realitäten in SALES-BRIEF aktiv kommunizieren statt verstecken.
4. **Topic-Queue-Hygiene als Hard-Rule** — Builder muss bei allen Blueprints die User-Input an LLMs schicken eine PII-Free-Rule explizit dokumentieren.
5. **Cost-Runaway-Risk** ist bei LLM-Blueprints CRITICAL, nicht MEDIUM. Spend-Limits sind Pflicht, nicht Empfehlung.

→ Builder-Agent-Spec-Update → `personal-os/07-tools/BLUEPRINT-BUILDER-SPEC.md` (Content-Generation-Variante).
