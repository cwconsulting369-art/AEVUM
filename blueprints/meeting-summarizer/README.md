# AEVUM Blueprint: Meeting-Summarizer

> Aus jedem Call automatisch eine strukturierte Summary + Action-Items + CRM-Eintrag — ohne dass jemand mitschreibt.

---

## Das Problem (brutal ehrlich)

Du hast 5–15 Calls die Woche. Fireflies/Zoom nimmt sie auf, transkribiert sie — und dann passiert: nichts. Das Transkript verstaubt im Tool. Niemand liest 40 Minuten Wortprotokoll. Action-Items werden vergessen, Entscheidungen verschwinden, das CRM bleibt leer, und in 3 Wochen weiß keiner mehr, was im Call mit Kunde X eigentlich besprochen wurde.

Das eigentliche Asset (was wurde entschieden, wer macht was bis wann) liegt in den Transkripten — aber niemand hat Zeit, es rauszuholen.

## Die Lösung

Der **Meeting-Summarizer** zieht abgeschlossene Call-Transkripte automatisch aus Fireflies (oder Zoom), schickt sie durch ein KI-Modell (Claude) und erzeugt pro Meeting:

1. **3–6-Satz-Zusammenfassung** — worum ging's, was kam raus
2. **Entscheidungs-Liste** — was wurde verbindlich beschlossen
3. **Action-Items** — Task + Owner + Frist (sofern im Call genannt; sonst `null`, nichts erfunden)
4. **Sentiment** — positiv / neutral / kritisch (für Pipeline-Frühwarnung)
5. **Nächster Termin** — falls im Call vereinbart

Das Ergebnis landet automatisch:
- als Datensatz im **CRM** (Airtable/HubSpot/Pipedrive)
- als Nachricht im **Slack/Teams-Channel**
- als **E-Mail** an Team/Stakeholder

**Ergebnis:** 5 Minuten nach Call-Ende hat das ganze Team die Essenz — strukturiert, durchsuchbar, im CRM. Kein manuelles Protokoll mehr.

---

## Features

- **Polling ODER Webhook** — Schedule-Trigger (alle 15 Min Fireflies abfragen) oder Push-Webhook (Fireflies/Zoom feuert bei „Transcription completed")
- **Müll-Filter** — abgebrochene Calls / leere Transkripte werden vor dem teuren LLM-Call aussortiert
- **Anti-Halluzination-Prompt** — die KI darf keine Owner/Fristen/Fakten erfinden; unklar = `null`
- **Strukturiertes JSON-Schema** — robustes Parsen mit Fallback, kein „die KI hat heute Markdown geschrieben"-Crash
- **Multi-Output** — CRM + Chat + Mail aus einem Lauf
- **Error-Pfad** — gescheiterte Fetches/LLM-Calls/CRM-Writes lösen einen Fehler-Alert aus, statt still zu sterben
- **Token-Schutz** — Transkripte werden hart gekürzt (Kosten-Cap + Prompt-Injection-Entschärfung)

---

## Ziel-Segmente

| Segment | Wofür |
|---|---|
| **Agentur** (AG) | Kunden-Calls automatisch protokollieren, Action-Items ins Projekt-Board, nichts mehr „wir hatten doch gesagt..." |
| **Personal Brand / Coach / Berater** (PB) | Discovery- und Coaching-Calls dokumentieren ohne Mitschreiben, Follow-up-Mails aus Action-Items |
| **Mittelstand B2B / Sales** (FI) | Sales-Calls ins CRM, Deal-Sentiment-Tracking, Vertriebsleitung sieht Pipeline-Realität statt Bauchgefühl |

---

## Was du eintragen musst

Alle Platzhalter im Workflow sind als `{{INDIVIDUELL: ...}}` markiert (im Set-Node „Konfiguration") oder liegen als n8n-Credential vor.

| Platzhalter / Credential | Was rein muss | Woher |
|---|---|---|
| `Fireflies API (Bearer)` (Credential) | Header `Authorization` = `Bearer <FIREFLIES_API_KEY>` | Fireflies → Settings → Developer Settings → API Key |
| `Anthropic API (x-api-key)` (Credential) | Header `x-api-key` = `<ANTHROPIC_API_KEY>` | console.anthropic.com → API Keys (Spending-Cap setzen!) |
| `CRM API (Bearer)` (Credential) | Auth-Header deines CRM (z.B. `Authorization: Bearer <AIRTABLE_PAT>`) | Airtable/HubSpot/Pipedrive → API-/Token-Settings |
| `SMTP` (Credential) | Mail-Versand-Zugang (Host/Port/User/Pass) | Resend/Postmark/eigener Mailserver |
| `crmBaseUrl` | CRM-Endpoint, z.B. `https://api.airtable.com/v0/<BASE_ID>/meetings` | dein CRM-Tool (Base-ID + Tabellenname) |
| `notifyChannel` | Slack-Incoming-Webhook- oder Teams-Connector-URL | Slack: Apps → Incoming Webhooks / Teams: Channel → Connectors |
| `errorChannel` | Slack/Teams-Webhook für Fehler-Alerts (darf = `notifyChannel` sein) | wie oben |
| `summaryRecipientEmail` | E-Mail-Adresse(n), die die Summary kriegen | du / dein Team |
| `senderEmail` | Absender-Adresse der Summary-Mail | deine Versand-Domain |
| `llmModel` | LLM-Modell-ID (Default `claude-3-5-sonnet-20241022`) | Anthropic-Modell-Liste; alternativ OpenRouter-EU-Modell |
| `firefliesGraphqlUrl` | Default `https://api.fireflies.ai/graphql` — nur ändern bei Zoom-Umbau | — |

> Bei **Zoom statt Fireflies**: Den Node „HTTP: Fireflies Transkripte holen" auf den Zoom-REST-Endpoint `/meetings/{meetingId}/recordings` + Transcript-Download umbauen und die Feldnamen im „Code: Transkript aufbereiten"-Node anpassen. Der Rest des Flows bleibt identisch.

---

## Voraussetzungen

| Tool | Zweck | Pflicht? | Kosten |
|---|---|---|---|
| n8n (Cloud-EU oder Self-Host) | Workflow-Engine | Ja | €0–20/Mo |
| Fireflies.ai (Pro+) **oder** Zoom (mit Transkription) | Transkript-Quelle | Ja | Fireflies ab ~€10/Seat |
| Anthropic API Key (oder OpenRouter) | KI-Summary | Ja | ~€0,01–0,03 pro Meeting |
| CRM mit API (Airtable/HubSpot/Pipedrive) | Summary-Ablage | Empfohlen | €0–20/Mo |
| Slack/Teams Webhook | Team-Benachrichtigung | Optional | €0 |
| SMTP/Resend/Postmark | Summary per Mail | Optional | €0–15/Mo |

**Wichtig:** Mindestens **eines** der drei Outputs (CRM / Chat / Mail) konfigurieren — sonst läuft der Workflow zwar, aber das Ergebnis landet nirgends. Nicht genutzte Output-Nodes einfach deaktivieren (Node → Disable).

---

## Setup in 5 Schritten

### 1. Importieren
n8n → Workflows → Import from File → `workflow.json`. **Noch nicht aktivieren.**

### 2. Credentials anlegen
4 Header-/SMTP-Credentials anlegen (Fireflies, Anthropic, CRM, SMTP) und in den jeweiligen Nodes referenzieren. **API-Keys NIE direkt in den Node-Body schreiben** — immer Credential-Store.

### 3. Konfiguration ausfüllen
Set-Node „Konfiguration" öffnen, alle `{{INDIVIDUELL: ...}}`-Werte mit echten URLs/Adressen ersetzen.

### 4. Testlauf
Schedule-Trigger temporär durch Manual-Run ersetzen (oder Node „Execute Workflow"). Ein echtes, kurzes Test-Meeting in Fireflies bereithalten. Prüfen:
- Transkript wird geholt
- Summary-JSON ist sinnvoll (kein erfundener Owner)
- CRM-Datensatz erscheint
- Slack/Mail kommt an
- Fehler-Pfad testen: Fireflies-Credential kurz falsch setzen → Fehler-Alert muss im errorChannel landen

### 5. Aktivieren
Trigger-Modus wählen (Schedule **oder** Webhook — nicht beide), Workflow auf „Active". Erste Tage Output stichprobenhaft gegen die echten Calls prüfen.

---

## Datenfluss

```
[Schedule /15min]  ODER  [Webhook Fireflies/Zoom]
            \              /
          [Set: Konfiguration]
                  |
       [HTTP: Fireflies Transkripte]  --(Fehler)-->  [Code: Fehler] -> [HTTP: Alert]
                  |
       [Split: einzelne Meetings]
                  |
       [Filter: nur echte Transkripte]
                  |
       [Code: Transkript aufbereiten]
                  |
       [HTTP: KI-Summary (Claude)]    --(Fehler)-->  [Code: Fehler] -> [HTTP: Alert]
                  |
       [Code: Summary parsen]
                  |
       [HTTP: CRM-Sync]               --(Fehler)-->  [Code: Fehler] -> [HTTP: Alert]
                  |
       [HTTP: Slack/Teams-Notify]
                  |
       [Email: Summary versenden]
```

---

## Limits (ehrlich)

- **Reine Text-Summary** — kein Audio-Re-Processing, keine Sprecher-Diarization über das hinaus, was Fireflies/Zoom liefert.
- **Lange Calls werden gekürzt** (~6k Tokens Transkript). Bei 90-Min-Calls geht Detail verloren — Mail enthält dann einen Truncation-Hinweis + Link aufs Volltranskript. Für lange Calls: Map-Reduce-Summary als Phase 2.
- **CRM-Body ist Airtable-Format als Default** — andere CRMs brauchen Body-/Feld-Mapping-Anpassung (dokumentiert im Node-Notes).
- **Keine Dedup-Logik im Default** — Polling kann dasselbe Meeting mehrfach ziehen, wenn du den Lookback nicht an dein Poll-Intervall anpasst. Sauber: Webhook-Trigger nutzen ODER `meetingId` gegen CRM prüfen (Phase-2-Erweiterung, siehe SECURITY-RISKS).
- **KI kann inhaltlich daneben liegen** — Summary ist Arbeitserleichterung, kein verbindliches Rechtsdokument. Footer-Hinweis ist drin.
- **EU-Datenfluss** — Anthropic-API ist US. Für strikte DSGVO: OpenRouter mit EU-Modell oder Mistral-EU (siehe DSGVO-CHECK).
