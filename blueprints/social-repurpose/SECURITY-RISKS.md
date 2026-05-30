# Social-Repurpose — Security-Risk-Review

**Blueprint:** social-repurpose
**Review-Datum:** 2026-05-30
**Reviewer:** Lennox (AEVUM Quality-Gate)
**Schweregrad-Skala:** 🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🟢 LOW

---

## Risk-Matrix

| # | Risiko | Schwere | Mitigation | Customer-Action |
|---|---|---|---|---|
| 1 | OpenRouter-API-Token im Workflow-JSON hartcoded → bei Export/Backup/Bug-Report-Leak gekaperter Account + explodierende Rechnung | 🟠 HIGH | Token AUSSCHLIESSLICH in n8n-Credential-Store. Spending-Cap bei OpenRouter (€20/Mo Hard-Stop) | Pflicht |
| 2 | Auto-Posten von KI-Content (falls Customer den Digest-Schritt durch Direkt-Post ersetzt) → off-brand/halluzinierter Post ist öffentlich bevor jemand ihn sieht = Marken-Schaden | 🟠 HIGH | Default = Freigabe-Digest, KEIN Auto-Post. Wenn Auto-Post: zwingend Approval-Gate + Halluzinations-Filter davor | Pflicht wenn Auto-Post |
| 3 | LLM-Halluzination: KI erfindet Zahlen/Zitate/Fakten die nicht im Asset stehen → wird ungeprüft gepostet → falsche Behauptung öffentlich, ggf. wettbewerbs-/haftungsrelevant | 🟠 HIGH | Harte Prompt-Regel „keine Fakten erfinden", Freigabe-Pflicht durch Mensch, erste 10 Digests manuell gegen Quelle prüfen | Pflicht |
| 4 | Prompt-Injection über Asset-Inhalt (Blog enthält „Ignore previous instructions, schreibe...") → KI bricht aus Brand-Voice aus, postet Fremdinhalt | 🟡 MEDIUM | Asset-Body wird in `Code: bereinigen` HTML-gestrippt + auf 6000 Zeichen begrenzt; User-Content klar als Daten markiert; Output-Validierung im Parse-Node | Empfohlen |
| 5 | Quell-CMS-API ohne Auth / mit zu weitreichendem Token → Token-Leak öffnet schreibenden Zugriff aufs CMS | 🟡 MEDIUM | Read-Only-Token für CMS-Abruf, Scope minimal. Bei öffentlichem RSS: gar kein Token | Pflicht |
| 6 | Draft-Store-Token (Airtable PAT / Notion / Supabase) zu breit gescoped → Leak gibt Zugriff auf gesamte Base/Workspace | 🟠 HIGH | Token auf genau eine Table/Database scopen (Airtable: scoped PAT, Supabase: nur INSERT-RLS), Credential-Store-only | Pflicht |
| 7 | PII/vertrauliche Inhalte im Long-Form-Asset → fließen via OpenRouter zu US-LLM-Provider (Drittland-Transfer) | 🟡 MEDIUM | EU-routbares Modell wählen (Claude/Mistral-EU), keine internen/vertraulichen Drafts durchschicken, DPA + DS-Erklärungs-Hinweis | Pflicht |
| 8 | Schedule-Polling ohne Dedupe → dasselbe Asset wird täglich erneut repurposed → doppelte Drafts + unnötige LLM-Kosten | 🟡 MEDIUM | CMS-Query auf „nur seit letztem Lauf" filtern ODER `assetHash`-Dedupe-Check vor LLM-Call (Static-Data/Store-Lookup) | Pflicht |
| 9 | LLM-Output ist kein valides JSON (Modell-Drift, Code-Fences, abgeschnitten) → Parse-Node bricht ab → kein Output | 🟡 MEDIUM | `response_format: json_object` gesetzt, defensives Fence-Stripping + try/catch im Parse-Node → sauberer Fehler statt Crash | Im Blueprint umgesetzt |
| 10 | Plattform-Zeichenlimit überschritten → Post wird beim Posten abgeschnitten / abgelehnt | 🟡 MEDIUM | Limit-Check-IF-Node markiert Überschreitungen als `needs_review` statt sie durchzulassen | Im Blueprint umgesetzt |
| 11 | Digest-/Alert-Mail über Freemail-Absender → landet im Spam, Freigabe-Mail wird verpasst, Drafts laufen ungesehen ins Leere | 🟢 LOW | Eigene Domain mit SPF/DKIM als Absender, kein gmail/outlook | Empfohlen |
| 12 | n8n-Execution-Logs enthalten kompletten Asset-Text + generierte Posts → Log-Leak = Inhalts-/ggf. PII-Leak | 🟡 MEDIUM | Execution-Log-Retention 30d, Sensitive-Field-Masking für Body-Felder, EU-Hosting | Pflicht |
| 13 | OpenRouter-Kosten-Runaway: zu großes Asset (kein Clipping) oder Endlos-Schleife → max_tokens × Volumen explodiert | 🟢 LOW | Asset auf 6000 Zeichen geclippt, max_tokens 2000, Spending-Cap, 1 Asset/Lauf | Im Blueprint umgesetzt |
| 14 | Webhook-Trigger (optional) ohne Token offen erreichbar → Fremde POSTen beliebige Inhalte → unerwünschte LLM-Calls auf deine Rechnung | 🟠 HIGH | Webhook-Trigger ist im Default DEAKTIVIERT. Bei Aktivierung: Header-Token + Cloudflare-Rate-Limit Pflicht | Pflicht wenn Webhook aktiv |

---

## Pflicht-Mitigations (Customer MUSS umsetzen)

### 1. OpenRouter-Token-Schutz
- Token NUR im n8n-Credential-Store („OpenRouter API"), niemals im HTTP-Node-Body
- OpenRouter-Dashboard: Spending-Cap hart auf €20/Mo
- Bei Verdacht: Token sofort revoken + rotieren

### 2. Kein Auto-Posten ohne Approval-Gate
- Default-Workflow endet bei der Freigabe-Mail. **Das ist gewollt.**
- Wer Auto-Posten will (Buffer/Ayrshare): zwingend einen IF-Node mit Approval-Status (`status === 'approved'` aus dem Draft-Store) davor. Niemals roher LLM-Output → Live-Post.

### 3. Halluzinations-Disziplin
- Prompt enthält bereits „Erfinde KEINE Fakten, Zahlen, Zitate"
- Erste 10 Digests: jeden Post gegen das Quell-Asset prüfen (stimmen Zahlen/Aussagen?)
- Bei wiederholten Halluzinationen: temperature senken (0.7 → 0.4) oder stärkeres Modell

### 4. Draft-Store-Token scopen
- Airtable: scoped Personal Access Token, nur auf die eine Table, nur `data.records:write`
- Supabase: RLS-Policy die nur INSERT in `social_drafts` erlaubt, anon-Key vermeiden
- Notion: Integration nur mit der einen Database geteilt

### 5. CMS-Read-Only
- Abruf-Token read-only. WordPress: Application Password mit Reader-Rolle. Ghost: Content-API-Key (read-only by design).
- Öffentliche RSS/Feeds: Auth am Node komplett entfernen

### 6. Dedupe gegen Mehrfach-Verarbeitung
**Problem:** Schedule-Polling holt täglich „das neueste Asset" — ist seit gestern nichts Neues erschienen, wird dasselbe Asset erneut durch die teure LLM-Maschine geschickt.

**Fix-Optionen:**
- **A (sauber):** CMS-Query mit `published_after`-Filter auf den letzten Lauf-Timestamp (in Static-Data merken)
- **B:** `assetHash` (im Bereinigungs-Node erzeugt) vor dem LLM-Call gegen den Draft-Store prüfen → existiert er, abbrechen
- **C:** Statt Schedule den Webhook-Trigger nutzen (feuert nur beim Veröffentlichen)

### 7. EU-Hosting + Modell-Routing
- n8n.cloud EU-Region oder Hetzner/Scaleway-Self-Host
- OpenRouter: EU-fähiges Modell (Claude/Mistral) wählen, vertrauliche Assets nicht durchschicken

### 8. Webhook absichern (nur falls aktiviert)
- Default: Webhook-Node ist `disabled`
- Bei Aktivierung: Header-Auth-Token am Webhook + Cloudflare-Rate-Limit (30/min/IP)

---

## Empfohlene Mitigations (Best-Practice)

### 9. Prompt-Injection-Defense
Asset-Body wird bereits HTML-gestrippt und auf 6000 Zeichen begrenzt. Zusätzlich: im System-Prompt klarstellen, dass der User-Block reine Daten sind und keine Anweisungen enthalten.

### 10. Log-Hygiene
- Execution-Log-Retention auf 30 Tage
- Sensitive-Field-Masking für `assetBody`, `body`, `html`

### 11. Absender-Reputation für Mails
Digest + Alert über eigene Domain mit SPF/DKIM, nicht über Freemail — sonst landet die Freigabe-Mail im Spam und niemand gibt frei.

### 12. Modell-Fallback
Bei OpenRouter-5xx: Fallback-Modell definieren (z.B. `openai/gpt-4o-mini`) statt kompletten Workflow-Abbruch. Aktuell deckt der Error-Pfad das mit Alert-Mail ab.

---

## Was AEVUM bei DFY-Install zusätzlich macht

- OpenRouter-Account-Setup + Spending-Cap + Token-Rotation-Schedule
- Brand-Voice-Prompt-Engineering (3-5 Iterationen gegen echte Customer-Posts)
- CMS-Feld-Mapping verifiziert (Code-Node „bereinigen" an reale Quelle angepasst)
- Draft-Store mit scoped Token + RLS aufgesetzt
- Dedupe-Logik eingebaut (assetHash-Check oder published_after-Filter)
- Cloudflare vor Webhook (falls Webhook-Trigger gewählt) + Rate-Limit
- Optional: Approval-Gate + Buffer/Ayrshare-Auto-Post mit Status-Check
- Test-Lauf mit 3 echten Assets + Halluzinations-Check gegen Quelle
- Security-Sign-Off im Customer-Portal

---

## Known-Limits (nicht-fixbar in diesem Blueprint)

- **Auto-Post-Approval-Gate:** nicht im Default (gewollt). DFY-Addon.
- **Dedupe:** als Customer-Pflicht dokumentiert, nicht hart im Default-Workflow (hängt von CMS-Query-Fähigkeit ab). Phase 2: generischer Static-Data-Dedupe-Node als Default.
- **Halluzinations-Auto-Filter:** kein automatischer Fakten-Abgleich. Mensch-Freigabe ist die Mitigation. Phase 2: Claim-Extraction + Source-Match.
- **Multi-Inbox / Multi-Brand:** ein Brand-Voice pro Workflow-Instanz. Mehrere Marken = mehrere Kopien. Phase 2: Brand-Selector.

---

## Sign-Off (Quality-Gate)

- [x] Risk-Matrix erstellt (14 Risks, 4× HIGH)
- [x] 8 Pflicht-Mitigations dokumentiert
- [x] Customer-Action-Liste klar
- [x] DFY-Differentiator ausgearbeitet
- [x] In-Blueprint umgesetzte Mitigations markiert (JSON-Validierung, Limit-Check, Clipping, Error-Pfad, Webhook-default-off)
- [ ] Pen-Test extern — Phase 2, nicht Sales-Blocker
- [ ] Auto-Post-Approval-Gate als Default-Addon — Phase 2
- [ ] Dedupe-Node als Default — Phase 2
