# Support-Triage — Sales-Brief

**Blueprint:** support-triage
**Tier:** Blueprint (DIY)
**Preis:** Siehe `apps/web/public/pricing` (€-Range nach Pricing-Model)
**Sales-Ready seit:** 2026-05-30

---

## In einem Satz

Jede Mail im Support-Postfach wird automatisch klassifiziert (Kategorie, Priorität, Stimmung, Sprache), zusammengefasst, mit einem fertigen Antwort-Entwurf versehen und ans richtige Team geroutet — dringende Fälle lösen sofort einen Slack-Alert mit SLA-Deadline aus. Mensch-im-Loop: gesendet wird nie automatisch.

---

## Wer das braucht

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur** (5–30 MA, AG) | Geteiltes Postfach, niemand zuständig, Tickets versanden zwischen Projektarbeit, kein Überblick was brennt | Auto-Vorsortierung + Draft je Ticket; Team sieht sofort Zuständigkeit + Dringlichkeit |
| **Personal Brand / Solo** (Coach/Creator, PB) | Mail-Flut, alles Chefsache, keine Zeit jede Mail zu lesen, urgent geht zwischen Fan-Post unter | Zusammenfassung + Draft spart 70% Lesezeit; urgent-Alert verhindert verpasste Eskalation |
| **Mittelstand B2B** (10–100 MA, FI) | Mehrere Abteilungen, manuelle Weiterleitung im Postfach, keine SLA-Transparenz, Eskalationen erst spät sichtbar | Hartes Routing Abrechnung/Technik/Vertrieb + SLA-Deadline + Slack-Eskalation pro Ticket |

---

## Was Customer bekommt

1. **n8n-Workflow (JSON-Export)** — fertig verdrahteter Workflow mit 13 Nodes (IMAP-Trigger, Set-Config, 3× Code, Anthropic-Chat-Model + Structured-Output-Parser + LLM-Chain, Switch, HTTP-Slack, 2× Email-Send, Merge)
2. **KI-Klassifizierung** — Kategorie + Priorität + Stimmung + Sprache + Zusammenfassung + `needs_human`-Flag in einem Claude-Call mit strukturiertem Output (kein Freitext-Parsing-Risiko)
3. **Antwort-Entwurf-Generator** — höflicher, faktentreuer Draft in Kundensprache, ohne erfundene Zusagen, als Vorschlag für den Agenten
4. **Team-Routing-Map** — konfigurierbar im Set-Node (Team → Mail → Slack), kein Code-Eingriff nötig
5. **Eskalations-Logik** — `urgent` + `needs_human` lösen Slack-Alert mit SLA-Deadline aus
6. **Prompt-Injection-Härtung** — Sanitisierungs-Code-Node + „Inhalt = Daten, nicht Anweisung"-Prompt
7. **Error-Pfad / Dead-Letter** — fehlgeschlagene KI- oder Versand-Schritte → Fehler-Benachrichtigung statt stiller Verlust
8. **DSGVO-Pack** — Datenfluss-Analyse, Art.-6-Grundlagen, Vendor-DPA-Übersicht, EU-AI-Act-Einordnung (Limited Risk + Transparenzpflicht)
9. **Security-Risk-Review** — 15 Risks inkl. PII-zu-US-LLM, Prompt-Injection, Auto-Send-Verbot, Webhook-Hygiene
10. **Install-Guide** — Schritt-für-Schritt in 45-75 Min einsatzbereit
11. **Diagramm** — Mermaid-Flow für sofortiges Verständnis im Shop

---

## Mehrwert (konkret)

**Vorher:**
- Geteiltes Postfach, jeder liest jede Mail um Zuständigkeit zu klären → ~1-2 MA-h/Tag
- Dringende Fälle gehen zwischen Routine unter, Reaktionszeit unkontrolliert
- Antworten von Null geschrieben, auch bei Standard-Fällen
- Keine SLA-Sicht, Eskalation erst wenn der Kunde ein zweites Mal (wütend) schreibt

**Nachher:**
- Tickets kommen vorsortiert beim richtigen Team an, mit Zusammenfassung + Draft
- Urgent → sofortiger Slack-Alert mit SLA-Deadline
- Agent prüft + sendet Draft → Antwortzeit drastisch kürzer
- Stimmungs-Flag macht unzufriedene Kunden früh sichtbar

**ROI-Schätzung (Team, 60 Support-Mails/Tag):**
- Time-Save Sortieren + Erst-Triage: ~1,5h/Tag → ~30h/Mo
- Bei MA-Kosten €40/h fully-loaded → ~€1.200/Mo gespart
- Draft-Vorlage spart bei ~40 beantworteten Mails/Tag je ~3 Min → weitere ~40h/Mo
- KI-Kosten: 60 Mails/Tag × ~€0,006 ≈ €11/Mo
- Schnellere Reaktion + früh erkannte Unzufriedenheit = weniger Churn (schwer zu beziffern, real)

**Realistic-Caveat:** Die KI sortiert sehr gut, ersetzt aber kein Urteilsvermögen. Drafts müssen geprüft werden. Qualität steigt mit angepasstem Prompt + sauberer Kategorien-Definition. Garbage-in (1-Wort-Mails) bleibt Garbage — landet dann korrekt in `general` + `needs_human`.

---

## Pricing-Logic

| Variante | Was | Preis-Range |
|---|---|---|
| **Blueprint-Only** | JSON + Docs + Install-Guide | €X (siehe Pricing-Page) |
| **Done-for-You** | Wir installieren, Credentials + Team-Map + Prompt auf Customer-Tonalität, Test-Run, 1 Woche Begleitung | €X × 2.5 |
| **Done-with-You** | Setup gemeinsam, Customer lernt Prompt-Tuning + Kategorien-Pflege | €X × 1.75 |

→ Conversion-Pfad zu Audit M/L wenn Customer „wir wollen Auto-Reply für Standardfälle" oder „Anbindung an unser Ticketsystem (Zendesk/Freshdesk)" → wird Custom-Integration.

---

## Voraussetzungen Customer

- n8n laufend (Cloud-EU €20/Mo oder Self-Host)
- Support-Postfach mit IMAP-Zugang (Host/Port/User/Passwort)
- Anthropic-Account + API-Key (~€10-20/Mo bei mittlerem Volumen)
- SMTP-Zugang für interne Ticket-/Alert-Mails
- Slack-Workspace + Incoming-Webhook (optional, für Urgent-Alerts)
- Klare Team-Struktur (wer ist für was zuständig)

**Total monatliche Tool-Kosten:** €30–60 (n8n + Anthropic + bestehendes Mail-Hosting).

---

## Nicht-Ziele (explizit)

- ❌ Vollautonomer Auto-Reply an Kunden (bewusst Mensch-im-Loop — Phase 2 mit extra Guardrails)
- ❌ Konversations-/Thread-History (jede Mail isoliert klassifiziert — Phase 2)
- ❌ Native Ticketsystem-Integration (Zendesk/Freshdesk/HubSpot — Erweiterung via HTTP-Node)
- ❌ Anhang-/Bild-/PDF-Analyse (nur Betreff + Text)
- ❌ Echtzeit-Push (IMAP-Polling; für Push Trigger tauschen)
- ❌ Self-Learning / Feedback-Loop auf Klassifizierungs-Fehler (Phase 2)
- ❌ Voice/Telefon-Support (nur Mail)

---

## Upsell-Pfade

| Customer-Frage | Next-Step |
|---|---|
| „Standardfälle sollen automatisch beantwortet werden" | → Audit M (Auto-Reply-Engine mit Confidence-Threshold + Approval-Queue) |
| „Bindet das an unser Zendesk/Freshdesk an?" | → DFY-Variante mit Ticketsystem-API-Integration |
| „Wir wollen Thread-Kontext (Kundenhistorie)" | → Audit M (CRM-Lookup + Konversations-Memory) |
| „Anhänge/PDFs sollen mit ausgewertet werden" | → Audit L (Multimodal-Erweiterung) |
| „Wir brauchen ein Dashboard mit SLA-Metriken" | → Reporting-Blueprint / Dashboard-Build |
| „Mehrsprachiger Support mit eigenen Antwort-Bausteinen" | → DFY Prompt-Engineering + Knowledge-Base-Anbindung |

---

## Conversion-Story (Brief für Sales-Page)

> „Dein Support-Postfach hat heute 60 neue Mails. Drei davon sind dringend — ein Login-Ausfall, eine Vertragskündigung, eine wütende Beschwerde. Sie liegen irgendwo zwischen 40 Routine-Fragen, und du findest sie erst, wenn der Kunde zum zweiten Mal schreibt."
>
> „Support-Triage liest jede Mail in dem Moment, in dem sie ankommt: sortiert sie nach Team, markiert Dringlichkeit, schreibt einen fertigen Antwort-Entwurf und schickt bei urgent sofort einen Slack-Alert mit SLA-Deadline. Dein Team sieht vorsortierte Tickets — nicht ein Postfach voller Rätsel."
>
> „Gesendet wird nie automatisch. Der Mensch prüft und drückt ab. DSGVO-konform, EU-AI-Act Limited-Risk, mit Prompt-Injection-Schutz. Einmal eingerichtet, läuft es bei jeder Mail."
