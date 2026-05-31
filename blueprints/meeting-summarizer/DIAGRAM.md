# Meeting-Summarizer — Workflow-Diagramm

Visuelle Darstellung des n8n-Workflows aus `workflow.json` (14 Nodes). Der Flow läuft von Trigger über Transkript-Holen, KI-Summary bis zu den drei Output-Kanälen — mit durchgehendem Fehler-Pfad.

```mermaid
flowchart TD
    SCHED["⏰ Schedule:<br/>alle 15 Min"]:::trigger
    HOOK["🔔 Webhook:<br/>Fireflies/Zoom Push<br/>(Alternative)"]:::trigger
    CFG["⚙️ Set:<br/>Konfiguration"]:::config
    FETCH["🌐 HTTP: Fireflies<br/>Transkripte holen"]:::http
    SPLIT["✂️ Split:<br/>einzelne Meetings"]:::logic
    FILTER["🔍 Filter:<br/>nur echte Transkripte<br/>(≥3 Sätze)"]:::logic
    PREP["📝 Code:<br/>Transkript aufbereiten<br/>(Kürzen + Entschärfen)"]:::code
    LLM["🤖 HTTP: KI-Summary<br/>(Claude)"]:::ai
    PARSE["📦 Code:<br/>Summary parsen<br/>(JSON + Fallback)"]:::code
    CRM["🗂️ HTTP:<br/>CRM-Sync"]:::http
    NOTIFY["💬 HTTP:<br/>Slack/Teams-Notify"]:::http
    MAIL["📧 Email:<br/>Summary versenden"]:::output

    ERRFMT["⚠️ Code:<br/>Fehler aufbereiten"]:::error
    ERRNOTIFY["🚨 HTTP:<br/>Fehler-Alert"]:::error

    SCHED --> CFG
    HOOK --> CFG
    CFG --> FETCH
    FETCH -->|Erfolg| SPLIT
    FETCH -.->|Fehler| ERRFMT
    SPLIT --> FILTER
    FILTER --> PREP
    PREP --> LLM
    LLM -->|Erfolg| PARSE
    LLM -.->|Fehler| ERRFMT
    PARSE --> CRM
    CRM -->|Erfolg| NOTIFY
    CRM -.->|Fehler| ERRFMT
    NOTIFY --> MAIL
    ERRFMT --> ERRNOTIFY

    classDef trigger fill:#1e3a8a,stroke:#3b82f6,color:#fff;
    classDef config fill:#374151,stroke:#9ca3af,color:#fff;
    classDef http fill:#065f46,stroke:#10b981,color:#fff;
    classDef logic fill:#78350f,stroke:#f59e0b,color:#fff;
    classDef code fill:#581c87,stroke:#a855f7,color:#fff;
    classDef ai fill:#7c2d12,stroke:#fb923c,color:#fff;
    classDef output fill:#0f766e,stroke:#2dd4bf,color:#fff;
    classDef error fill:#7f1d1d,stroke:#ef4444,color:#fff;
```

## Legende

| Farbe | Node-Typ | Rolle |
|---|---|---|
| 🔵 Blau | Trigger | Startet den Workflow — Schedule (Polling) **oder** Webhook (Push). Nur einer aktiv. |
| ⚫ Grau | Set | Zentrale Konfiguration (URLs, Empfänger, Modell). |
| 🟢 Grün | HTTP Request | Externe API-Calls: Transkript holen, CRM-Sync, Chat-Notify, Fehler-Alert. |
| 🟠 Orange (Logic) | Split / Filter | Meetings vereinzeln + Müll-Calls aussortieren. |
| 🟣 Lila | Code | Transkript aufbereiten (kürzen/entschärfen) + LLM-Antwort robust parsen. |
| 🟠 Orange (AI) | HTTP → LLM | Claude erzeugt strukturierte Summary (JSON-Schema). |
| 🟦 Türkis | Email | Versendet die HTML-Summary an das Team. |
| 🔴 Rot | Error-Pfad | Gescheiterte HTTP-Schritte (gestrichelte Linien) → Fehler-Aufbereitung → Alert in den errorChannel. |

## Lesehilfe

- **Durchgezogene Linien** = Haupt-/Erfolgs-Pfad.
- **Gestrichelte Linien** = Fehler-Ausgänge (`onError: continueErrorOutput`) der HTTP-Nodes. So bleibt kein still gescheitertes Meeting unbemerkt.
- **Output-Kette** CRM → Notify → Mail läuft sequenziell; nicht benötigte Kanäle lassen sich einzeln deaktivieren.
- **Dedup** (Doppelverarbeitung verhindern) ist im Default nicht enthalten — bei Schedule-Trigger ergänzen oder Webhook-Trigger nutzen (siehe INSTALL-GUIDE Schritt 8).
