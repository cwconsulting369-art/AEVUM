# AEVUM Blueprint: Support-Triage

> Eingehende Support-Mails automatisch klassifizieren, priorisieren, einen Antwort-Entwurf erstellen und ans richtige Team routen — DSGVO-konform, mit Mensch-im-Loop.

---

## Das Problem (brutal ehrlich)

Ein gemeinsames Support-Postfach (`support@firma.de`) ist nach kurzer Zeit Chaos:

- Niemand fühlt sich zuständig → wichtige Mails bleiben tagelang liegen
- Die dringende Server-Down-Beschwerde liegt zwischen einer Rechnungsfrage und einer Sales-Anfrage
- Jeder Agent liest jede Mail komplett, bevor er weiß, ob sie ihn überhaupt betrifft
- Antworten werden von Null geschrieben, obwohl 70% Standard-Fälle sind
- Keine SLA-Übersicht: Du merkst erst aus der Eskalations-Mail, dass etwas brennt

**Kostet:** 1-2 Mitarbeiter-Stunden pro Tag nur fürs Sortieren + langsame Reaktionszeit + frustrierte Kunden.

## Die Lösung

Dieses Blueprint hängt sich an dein Support-Postfach (IMAP) und macht bei **jeder** eingehenden Mail automatisch:

1. **Normalisieren + Sanitisieren** — Betreff/Body säubern, gegen Prompt-Injection härten, Länge kappen
2. **Klassifizieren (Claude)** — Kategorie (Abrechnung / Technik / Vertrieb / Allgemein), Priorität (urgent / high / normal / low), Stimmung, Sprache, Zusammenfassung
3. **Antwort-Entwurf** — höflicher, faktentreuer Draft in der Sprache des Kunden (KEIN Auto-Versand — Mensch prüft)
4. **Routing** — Ticket landet beim richtigen Team, urgent löst zusätzlich einen Slack-Alert aus
5. **SLA-Deadline** — automatisch berechnet nach Priorität
6. **Error-Pfad** — wenn die KI oder der Versand fehlschlägt, geht die Mail in eine Dead-Letter-Benachrichtigung statt verloren

**Ergebnis:** Das Team sieht vorsortierte Tickets mit Zusammenfassung + fertigem Antwort-Entwurf. Reaktionszeit sinkt, nichts geht unter.

**Was es NICHT ist:** Kein vollautonomer Bot, der Kunden direkt antwortet. Der Antwort-Entwurf ist ein Vorschlag für einen Menschen. Das ist Absicht (DSGVO, EU-AI-Act, Markenschutz).

---

## Features

| Feature | Beschreibung |
|---|---|
| IMAP-Trigger | Pollt jedes Standard-Postfach (auch Gmail/Outlook via IMAP) |
| KI-Klassifizierung | Kategorie + Priorität + Stimmung + Sprache in einem Call (Claude, strukturierter Output) |
| Antwort-Entwurf | Faktentreuer Draft, keine erfundenen Zusagen, Sprache = Kundensprache |
| Team-Routing | Konfigurierbare Team→Mail→Slack-Map im Set-Node, kein Hardcoding |
| Eskalations-Logik | `urgent` und `needs_human` lösen Slack-Alert + Prioritäts-Markierung aus |
| SLA-Berechnung | Deadline pro Priorität automatisch (urgent/high/normal) |
| Prompt-Injection-Schutz | Mail-Inhalt wird als Daten behandelt, Steuerzeichen entschärft |
| Error-Pfad / DLQ | Fehlgeschlagene Mails → Fehler-Benachrichtigung statt stiller Verlust |
| Mensch-im-Loop | Niemals Auto-Versand an Kunden; Agent prüft + sendet |

---

## Für wen (Ziel-Segmente)

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur** (5–30 MA, AG) | Geteiltes Support-/Projekt-Postfach, Tickets versanden zwischen Projektarbeit | Auto-Vorsortierung + Draft, Team weiß sofort wer zuständig ist |
| **Personal Brand / Solo** (Coach, Creator, PB) | Hunderte Mails, kein Support-Team, alles Chefsache, urgent geht unter | Zusammenfassung + Draft spart Lesezeit, urgent-Alert verhindert Eskalation |
| **Mittelstand B2B** (10–100 MA, FI) | Mehrere Abteilungen, manuelle Weiterleitung im Postfach, keine SLA-Transparenz | Klares Routing Abrechnung/Technik/Vertrieb + SLA-Deadline pro Ticket |

---

## Was du eintragen musst

Alle individuellen Werte sind im Workflow als `{{INDIVIDUELL: ...}}` markiert. Die meisten sitzen im **Set-Node „Triage-Konfiguration"**.

| Platzhalter | Wo | Was rein muss | Woher |
|---|---|---|---|
| `{{INDIVIDUELL: IMAP-Credential Support-Postfach}}` | Email-Trigger-Node, Credential | IMAP-Zugang zum Support-Postfach | Mail-Hoster (Host/Port/User/Passwort), z.B. IONOS, Google Workspace IMAP, Mailbox.org |
| `{{INDIVIDUELL: Anthropic API Credential}}` | Anthropic-Chat-Model-Node, Credential | Anthropic API-Key | console.anthropic.com → API Keys |
| `{{INDIVIDUELL: SMTP-Credential}}` | beide Email-Send-Nodes, Credential | SMTP-Zugang zum Versand der internen Tickets/Alerts | gleicher Mail-Hoster oder Resend/Postmark |
| `{{INDIVIDUELL: Firmenname GmbH}}` | Set-Node, `companyName` | Dein Firmenname (geht in den KI-Prompt) | dein Unternehmen |
| `{{INDIVIDUELL: Vorname Nachname, Support-Team ...}}` | Set-Node, `signature` | Signatur für Antwort-Entwürfe | dein Support-Team |
| `{{INDIVIDUELL: support@firma.de}}` | Set-Node, `draftFromEmail` | Absender für interne Ticket-Mails | dein Support-Postfach |
| `{{INDIVIDUELL: billing@firma.de}}` u.a. | Set-Node, `teams.*.email` | Mailadresse pro Team (Abrechnung/Technik/Vertrieb/Allgemein) | deine Team-Verteiler |
| `{{INDIVIDUELL: #support-billing}}` u.a. | Set-Node, `teams.*.slack` | Slack-Channel pro Team | dein Slack-Workspace |
| `{{INDIVIDUELL: https://hooks.slack.com/...}}` | Set-Node, `slackWebhookUrl` | Incoming-Webhook-URL für Urgent-Alerts | Slack → Apps → Incoming Webhooks |

**Optional anpassbar (kein Platzhalter, aber sinnvoll):**
- KI-Prompt im Node „LLM: Klassifizieren + Draft" — Tonalität, zusätzliche Kategorien, eigene Eskalations-Regeln
- `slaHoursUrgent` im Set-Node (Default 2h)
- Kategorien-Liste (Default: billing/technical/sales/general) — bei Änderung auch im Code-Node „Routing ableiten" und im Switch nachziehen

---

## Voraussetzungen

| Tool | Zweck | Pflicht? | Kosten |
|---|---|---|---|
| n8n (Cloud-EU oder Self-Host) | Workflow-Engine | Ja | €0–20/Mo |
| Support-Postfach mit IMAP | Eingang | Ja | meist im Mail-Tarif |
| Anthropic API-Key | Klassifizierung + Draft | Ja | ~€0,003–0,01 pro Mail (Claude Sonnet) |
| SMTP-Zugang | Interne Ticket-/Alert-Mails | Ja | meist im Mail-Tarif |
| Slack-Workspace + Incoming-Webhook | Urgent-Alerts | Optional | €0 |

**Wichtig:** Postfach sollte in der EU gehostet sein (DSGVO). Anthropic ist ein US-Vendor — der Datentransfer ist im DSGVO-CHECK dokumentiert und braucht eine DPA + Hinweis in der Datenschutzerklärung.

---

## Setup in 5 Phasen (Details: INSTALL-GUIDE.md)

### 1. Import
`workflow.json` in n8n importieren (Workflows → Import from File). **Nicht aktivieren**, bis Credentials + Set-Node fertig sind.

### 2. Credentials
Drei Credentials anlegen und in den Nodes referenzieren: IMAP (Trigger), Anthropic API (Chat-Model), SMTP (beide Send-Nodes). Niemals Keys direkt in Node-Felder schreiben.

### 3. Konfiguration
Set-Node „Triage-Konfiguration" ausfüllen: Firmenname, Signatur, Team-Map (Mail + Slack pro Team), Slack-Webhook, SLA-Stunden.

### 4. Test
Workflow manuell ausführen oder eine Testmail ins Postfach legen. Prüfen: korrekte Kategorie, Priorität, sinnvoller Draft, Ticket landet beim richtigen Team, urgent löst Slack-Alert aus. Error-Pfad mit absichtlich falscher Slack-URL testen.

### 5. Aktivieren
Auf „Active" schalten. IMAP-Poll läuft dann automatisch. Erste Woche täglich Stichproben der Klassifizierung + Drafts lesen.

---

## Limits (ehrlich)

- **Kein Auto-Versand an Kunden.** Der Draft ist ein Vorschlag, ein Mensch sendet. Bewusste Entscheidung (DSGVO/AI-Act/Marke). Auto-Reply ist Phase-2 und braucht extra Guardrails.
- **Keine Konversations-History.** Jede Mail wird isoliert klassifiziert. Thread-Kontext (vorherige Mails desselben Kunden) ist Phase-2.
- **Keine echte Ticketsystem-Integration.** Routing geht per Mail + Slack. Zendesk/Freshdesk/HubSpot-Anbindung ist Erweiterung (HTTP-Node-Tausch).
- **IMAP-Polling, kein Push.** Latenz = Poll-Intervall (Sekunden bis 1 Min). Für Echtzeit: Gmail-Push / Helpdesk-Webhook als Trigger tauschen.
- **Klassifizierungs-Qualität hängt am Prompt + Kategorien.** Erste 20-50 Mails reviewen und Prompt schärfen. Unklare Mails landen korrekt in `general` + `needs_human`.
- **Anhänge werden nicht analysiert.** Nur Betreff + Text. Bild-/PDF-Inhalte ignoriert (Download standardmäßig aus).
- **Anthropic = US-Transfer.** PII (Absender, Mailinhalt) geht an einen US-Vendor. DPA + DS-Erklärungs-Hinweis Pflicht (siehe DSGVO-CHECK).
