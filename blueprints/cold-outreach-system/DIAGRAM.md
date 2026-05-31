# Cold Outreach System — Ablaufdiagramm

Dieses Diagramm zeigt den kompletten Ablauf des AEVUM Cold-Outreach-Workflows: von der CSV-Importliste über die KI-gestützte Personalisierung bis zur automatischen 3-stufigen E-Mail-Sequenz mit Antwort-Erkennung und integriertem Opt-out.

**So liest du es:** Pfeile zeigen den Datenfluss von Schritt zu Schritt. Die beiden Entscheidungs-Rauten (IF) prüfen jeweils, ob der Kontakt geantwortet hat. Bei "Ja" stoppt die Sequenz für diesen Kontakt (keine weitere Mail). Bei "Nein" läuft sie zur nächsten Stufe weiter. Der Opt-out-Webhook läuft eigenständig und verarbeitet Abmeldungen.

```mermaid
flowchart TD
    trigger["Manueller Start: CSV-Import"]
    config["Kampagnen-Konfiguration setzen<br/>(Absender, Angebot, Calendly, Opt-out-URL)"]
    split["Kontakte aufteilen"]
    batch["Batch: 10 Kontakte pro Tag"]
    hook["KI-Hook generieren<br/>(GPT-4o via OpenRouter)"]
    extract["Hook + Betreff extrahieren"]
    mail1["E-Mail 1: Erstkontakt"]
    wait3["Warten: 3 Tage"]
    if1{"Antwort nach Mail 1?"}
    followup["E-Mail: Follow-up 1"]
    wait5["Warten: 5 Tage"]
    if2{"Antwort nach Follow-up?"}
    last["E-Mail: Letzte Chance"]
    stop1["Ende — Antwort erhalten"]
    stop2["Ende — Antwort erhalten"]

    optout["Webhook: Opt-out<br/>(eigenständig, parallel)"]
    optdone["Abmeldung verarbeitet"]

    trigger --> config
    config --> split
    split --> batch
    batch --> hook
    hook --> extract
    extract --> mail1
    mail1 --> wait3
    wait3 --> if1
    if1 -->|"Ja (geantwortet)"| stop1
    if1 -->|"Nein"| followup
    followup --> wait5
    wait5 --> if2
    if2 -->|"Ja (geantwortet)"| stop2
    if2 -->|"Nein"| last

    optout --> optdone
```

## Knoten-Übersicht

| Schritt | Typ | Funktion |
|---|---|---|
| Manueller Start: CSV-Import | Manual Trigger | Startet die Kampagne |
| Kampagnen-Konfiguration | Set | Absenderdaten, Angebot, Calendly-Link, Opt-out-URL |
| Kontakte aufteilen | Split Out | Wandelt die Kontaktliste in einzelne Datensätze |
| Batch: 10 pro Tag | Split in Batches | Begrenzt auf 10 Kontakte pro Durchlauf (Zustellbarkeit) |
| KI-Hook generieren | HTTP Request | Personalisierter 2-Satz-Hook via GPT-4o |
| Hook extrahieren | Set | Extrahiert Hook + erzeugt Betreffzeile |
| E-Mail 1 | Send Email | Erstkontakt (HTML, mit Opt-out-Link) |
| Warten: 3 Tage | Wait | Pause vor Antwort-Prüfung |
| Antwort nach Mail 1? | IF | Verzweigung je nach Antwortstatus |
| Follow-up 1 | Send Email | Erinnerung, falls keine Antwort |
| Warten: 5 Tage | Wait | Pause vor zweiter Prüfung |
| Antwort nach Follow-up? | IF | Verzweigung je nach Antwortstatus |
| Letzte Chance | Send Email | Abschluss-Mail, falls weiterhin keine Antwort |
| Webhook: Opt-out | Webhook | Eigenständige Verarbeitung von Abmeldungen |
