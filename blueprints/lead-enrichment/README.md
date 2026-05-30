# AEVUM Blueprint: Lead-Enrichment

> Rohe Leads (Name + Domain) automatisch anreichern (Firmendaten, Socials, ICP-Score) — bevor irgendwer Zeit in Outreach steckt.

---

## Das Problem (brutal-honest)

Du bekommst Leads rein — aus dem Kontaktformular, aus einem Apollo-Export, aus einem Messe-Scan, aus LinkedIn. Was du hast: ein Name, eine Domain, vielleicht eine E-Mail. Was du NICHT hast: Branche, Größe, Umsatz, ob das überhaupt dein Wunschkunde ist.

Also passiert eins von zwei Dingen:
- **Variante A:** Jemand googelt jeden Lead von Hand (5-10 Min/Lead), trägt Daten ins CRM ein, schätzt nach Bauchgefühl ob's passt. Bei 50 Leads/Woche = ein halber Arbeitstag, der verbrennt.
- **Variante B:** Niemand macht es. Sales schreibt blind alle an — inkl. der Freelancer, der 3-Personen-Agenturen und der Konzerne, die nie kaufen. Conversion im Keller, Pipeline voller Müll.

Beides ist teuer. Variante A kostet Zeit, Variante B kostet Fokus und gute Sender-Reputation.

## Die Lösung

Dieses Blueprint nimmt jeden rohen Lead und reichert ihn **vollautomatisch** an, bevor er bei Sales landet:

1. **Intake** — Lead kommt per Webhook rein (Formular / Zapier / CRM / CSV-Loop). Pflichtfeld: Domain (oder ableitbar aus Geschäfts-E-Mail).
2. **Normalisieren + Validieren** — Domain säubern, Freemail (gmail/gmx/...) aussortieren, kaputte Datensätze in den Fehler-Pfad.
3. **Firmendaten anreichern** — Branche, Mitarbeiterzahl, Umsatz, Standort, Tech-Stack via Firmendaten-API.
4. **Socials & Domain-Intel** — LinkedIn / Twitter / Facebook + Domain-Metadaten, parallel zur Firmen-API.
5. **Profil bauen** — beide API-Antworten defensiv zu einem flachen Profil mergen (robust gegen leere/verschachtelte Antworten).
6. **ICP-Scoring (KI)** — Claude bewertet das Profil gegen deine ICP-Definition: Score 0-100, Tier A/B/C/D, disqualifiziert ja/nein, 3 Begründungen, Datenlücken — als striktes JSON.
7. **Ins CRM/Sheet schreiben** — jeder angereicherte Lead landet vollständig im CRM.
8. **Hot-Lead-Alert** — liegt der Score über deinem Threshold (Default 70) und ist nicht disqualifiziert, geht sofort eine Mail an Sales mit dem kompletten Profil.

**Ergebnis:** Sales sieht nur noch angereicherte, gescorte Leads — und springt sofort auf Tier-A. Kein manuelles Googeln, kein blindes Anschreiben.

---

## Features

- **Domain-First-Validierung** — kein Domain, kein Enrichment; Freemail-Filter eingebaut (E-Mail-Domain wird als Fallback abgeleitet).
- **Zwei parallele Datenquellen** (Firmografie + Socials) via Merge zusammengeführt — eine API darf ausfallen, der Flow läuft weiter (`onError: continueRegularOutput`).
- **Provider-agnostisch** — Firmendaten-API, Socials-API und CRM-Sink sind als Platzhalter konfigurierbar (TheCompaniesAPI, Abstract, PeopleDataLabs, Clearbit-Nachfolger, Airtable, HubSpot, Google Sheets …).
- **KI-ICP-Scoring** mit Anthropic Claude — deterministisch (temperature 0.2), striktes JSON, „erfinde keine Daten"-Prompt, konservativ bei Datenlücken.
- **Robustes Parsen** — der Score-Parser wirft nie; bei kaputtem LLM-Output Fallback-Score (Tier D) statt Pipeline-Crash.
- **Threshold-Routing** — nur echte Hot-Leads triggern den Sales-Alert; alle Leads landen trotzdem vollständig im CRM.
- **Error-Pfad** — ungültige Leads UND fehlgeschlagene CRM-Writes lösen einen Fehler-Alert per Mail aus.

---

## Ziel-Segmente

| Segment | Pain | Hebel durch dieses Blueprint |
|---|---|---|
| **Agentur (AG)** | Leads aus mehreren Kanälen, kein einheitliches Qualifizieren, Sales priorisiert nach Bauchgefühl | Jeder Lead automatisch angereichert + gescort → Sales arbeitet Tier-A zuerst ab |
| **Personal Brand / Solo (PB)** | Keine Zeit, jeden Inbound-Lead zu recherchieren; verpasst die guten zwischen den schlechten | Hot-Lead-Alert per Mail bei jedem Treffer über Threshold → kein gutes Lead geht unter |
| **Mittelstand B2B (FI)** | CRM voll mit halb-ausgefüllten Leads, Vertrieb verliert Zeit mit Recherche statt Gesprächen | Enrichment + Scoring vor CRM-Eintrag → Datenqualität + Priorisierung automatisch |

---

## Was du eintragen musst

Alle individuellen Werte sind im Workflow als `{{INDIVIDUELL: ...}}` markiert (im Set-Node **„Enrichment-Konfiguration"**) bzw. als n8n-Credentials.

| Platzhalter / Feld | Was rein muss | Woher |
|---|---|---|
| `companyEnrichUrl` | Base-URL deiner Firmendaten-API | TheCompaniesAPI / Abstract / PeopleDataLabs Dashboard → API-Docs |
| `socialsLookupUrl` | Endpoint für Socials/Domain-Intel | PeopleDataLabs / Clearbit-Nachfolger / Provider-Docs |
| `icpDefinition` | Dein Ideal Customer Profile in 3-5 Sätzen (Branche, Größe, Umsatz, Rolle, Ausschlusskriterien) | Dein Kopf / Sales-Team / bestehende Best-Kunden analysieren |
| `scoreThreshold` | Ab welchem Score ein Lead „hot" ist (0-100, Default 70) | Eigene Entscheidung — startet bei 70, nach 2 Wochen kalibrieren |
| `notifyEmail` | Empfänger der Hot-Lead-Alerts | deine/Sales-Mailbox |
| `fromEmail` | Absender für interne Alerts | eigene verifizierte SMTP-Adresse |
| `crmSinkUrl` | Webhook/REST-Endpoint deines CRM/Sheets | Airtable / HubSpot / Notion / Google-Sheet-Webhook |
| Credential **„Company-Enrich API"** | API-Key der Firmendaten-API (Header Auth) | Provider-Dashboard → n8n Credential-Store |
| Credential **„Socials-Intel API"** | API-Key der Socials-API (Header Auth) | Provider-Dashboard → n8n Credential-Store |
| Credential **„CRM-Sink API"** | API-Key/Token des CRM (Header Auth) | CRM-Settings → n8n Credential-Store |
| Credential **„Anthropic API"** | Anthropic API-Key | console.anthropic.com → n8n Credential-Store |
| Credential **„SMTP"** | SMTP-Zugang für interne Alert-Mails | dein Mail-Provider |

**Wichtig:** Alle API-Keys gehören in den n8n-Credential-Store, NIEMALS direkt in einen Node-Body oder ins Set-Node. Sonst stehen sie im Workflow-Export im Klartext.

---

## Voraussetzungen

| Tool | Zweck | Pflicht? | Kosten |
|---|---|---|---|
| n8n (Cloud-EU oder Self-Host) | Workflow-Engine | Ja | €0–20/Mo |
| Firmendaten-API | Firmografische Anreicherung | Ja | je nach Provider, oft Pay-per-Lookup (~€0,01-0,10/Lead) |
| Socials/Domain-Intel-API | LinkedIn/Socials | Empfohlen | optional, gleiche Größenordnung |
| Anthropic API-Key | ICP-Scoring (Claude) | Ja | ~€0,003-0,01/Lead (Sonnet, kurzer Prompt) |
| SMTP / Mail-Provider | Hot-Lead- + Fehler-Alerts | Ja | €0 |
| CRM / Airtable / Google Sheets | Ziel-Sink für Leads | Ja | €0–20/Mo |

**Geschätzte laufende Kosten:** €10–40/Mo + ~€0,02-0,15 pro angereichertem Lead (API + LLM).

---

## Setup in Kürze (Details in INSTALL-GUIDE.md)

1. **Import** — `workflow.json` in n8n importieren (Workflows → Import from File). NICHT aktivieren.
2. **Credentials** — 5 Credentials anlegen: Company-Enrich API, Socials-Intel API, CRM-Sink API, Anthropic API, SMTP. Jeweils im passenden Node referenzieren.
3. **Konfiguration** — Set-Node „Enrichment-Konfiguration" ausfüllen (alle `{{INDIVIDUELL}}`-Werte).
4. **Test** — per `curl` einen Test-Lead an den Webhook schicken (siehe INSTALL-GUIDE Schritt 8), prüfen ob Enrichment + Score + CRM-Eintrag + Alert kommen.
5. **Aktivieren** — Workflow auf „Active" schalten, Webhook-URL in deine Lead-Quelle eintragen.

---

## Datenfluss (Kurzform)

```
[Webhook: Roh-Lead] → [Set: Config] → [Code: Normalisieren] → [IF: anreicherbar?]
   gültig ─┬─→ [HTTP: Firmendaten] ─┐
           └─→ [HTTP: Socials]   ───┴→ [Merge] → [Code: Profil] → [AI Agent: ICP-Score (Claude)]
                                                                        → [Code: Score parsen]
                                                                        → [HTTP: CRM-Write]
                                                                        → [IF: Hot-Lead?] → [Email: Alert]
   ungültig ─→ [Email: Fehler-Alert]
   CRM-Write-Fehler ─→ [Email: Fehler-Alert]
```

Vollständiges Diagramm: siehe `DIAGRAM.md`.

---

## Limits (ehrlich)

- **Enrichment-Qualität = API-Qualität.** Das Blueprint liefert die Mechanik. Wie gut die Firmendaten sind, hängt 100% vom gewählten Provider ab. Bei kleinen/DACH-Firmen sind viele US-APIs lückenhaft.
- **Kein Dedup.** Wird derselbe Lead zweimal geschickt, wird er zweimal angereichert + geschrieben. Dedup macht dein CRM (z.B. Airtable Upsert auf `domain`) — nicht dieser Flow.
- **Kein Rate-Limit-Throttle eingebaut.** Bei Massen-Imports (CSV-Loop mit 1000 Leads) kannst du dein API-Kontingent in Minuten verbrennen. Für Batch-Verarbeitung einen SplitInBatches + Wait davorsetzen.
- **ICP-Score ist eine KI-Einschätzung, kein Orakel.** Bei dünner Datenlage scort Claude konservativ (Tier D) und benennt `dataGaps`. Die ersten ~30 Scores manuell gegenprüfen und ICP-Definition nachschärfen.
- **Personenbezug.** Lead-Daten + abgeleitete Profile sind personenbezogene Daten → DSGVO gilt voll. Siehe `DSGVO-CHECK.md` (Art. 6 lit. f, DPA mit jedem Daten-Provider, EU-AI-Act-Transparenz).
- **Single-Lead-pro-Call optimiert.** Der Merge-by-Position-Schritt geht von 1 Firmen-Antwort + 1 Socials-Antwort pro Lead aus. Für Multi-Item-Batches die Code-Nodes auf Item-Iteration umbauen.
