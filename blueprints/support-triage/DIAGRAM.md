# Support-Triage — Workflow-Diagramm

Visualisierung des n8n-Workflows aus `workflow.json`. Zeigt alle 13 Nodes, den Haupt-Flow, die KI-Sub-Nodes, das Prioritäts-Routing und den Error-/Dead-Letter-Pfad.

```mermaid
flowchart TD
    A["📥 Email Trigger: Support-Postfach<br/><i>emailReadImap</i>"] --> B["⚙️ Set: Triage-Konfiguration<br/><i>Team-Map, Slack, SLA</i>"]
    B --> C["🧹 Code: Mail normalisieren + sanitisieren<br/><i>Prompt-Injection-Schutz, Längen-Kappung</i>"]
    C --> D["🤖 LLM: Klassifizieren + Draft<br/><i>chainLlm</i>"]

    M["🧠 Anthropic Chat Model<br/><i>lmChatAnthropic</i>"] -. ai_languageModel .-> D
    P["📐 Structured Output Parser<br/><i>category / priority / draft</i>"] -. ai_outputParser .-> D

    D -->|"✓ Erfolg"| E["🧭 Code: Routing ableiten<br/><i>Team + SLA-Deadline, Whitelist-Validierung</i>"]
    D -->|"✗ Fehler"| X["🚨 Code: Error-Handler / DLQ"]

    E --> F{"🔀 Switch: Priorität / Eskalation"}
    F -->|"urgent"| G["💬 HTTP: Slack-Alert (Urgent)<br/><i>httpRequest</i>"]
    F -->|"needs_human"| H["🔗 Merge: Routing-Pfade"]
    F -->|"sonst (fallback)"| H
    G --> H

    H --> I["📧 Email: Ticket an Team + Draft<br/><i>emailSend — nur INTERN</i>"]
    I -->|"✗ Fehler"| X

    X --> Y["📧 Email: Fehler-Benachrichtigung<br/><i>emailSend → Allgemein-Team</i>"]

    classDef trigger fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a;
    classDef ai fill:#ede9fe,stroke:#8b5cf6,color:#4c1d95;
    classDef logic fill:#fef9c3,stroke:#eab308,color:#713f12;
    classDef output fill:#dcfce7,stroke:#22c55e,color:#14532d;
    classDef error fill:#fee2e2,stroke:#ef4444,color:#7f1d1d;

    class A trigger;
    class D,M,P ai;
    class B,C,E,F,H logic;
    class G,I output;
    class X,Y error;
```

## Legende

| Farbe | Bedeutung |
|---|---|
| 🔵 Blau | Trigger (Eingang aus dem Support-Postfach) |
| 🟣 Violett | KI-Verarbeitung (Anthropic-Modell + LLM-Chain + strukturierter Output-Parser) |
| 🟡 Gelb | Logik (Konfiguration, Sanitisierung, Routing, Verzweigung, Merge) |
| 🟢 Grün | Output (Slack-Alert + interne Ticket-Mail mit Antwort-Entwurf) |
| 🔴 Rot | Error-Pfad / Dead-Letter (Fehler-Sammler + Benachrichtigung) |

## Flow in Worten

1. Eine Mail trifft im **Support-Postfach** ein und löst den Workflow aus.
2. Die **Konfiguration** (Team-Map, Slack-Channels, SLA) wird geladen.
3. Die Mail wird **normalisiert und gegen Prompt-Injection gehärtet** (Steuerzeichen raus, Länge gekappt).
4. **Claude** klassifiziert die Mail (Kategorie, Priorität, Stimmung, Sprache), fasst sie zusammen und erstellt einen **Antwort-Entwurf** — als strukturierter, maschinenlesbarer Output.
5. Aus Kategorie + Priorität werden **Ziel-Team und SLA-Deadline** abgeleitet (mit Whitelist-Validierung).
6. Der **Switch** entscheidet: bei `urgent` zusätzlich ein **Slack-Alert**, bei `needs_human` oder sonst direkt weiter.
7. Alle Pfade laufen im **Merge** zusammen und erzeugen die **interne Ticket-Mail** ans zuständige Team — inklusive Zusammenfassung und Antwort-Entwurf (klar als „vor Versand prüfen" markiert, **kein Auto-Versand an den Kunden**).
8. Schlägt die KI oder der Versand fehl, landet die Mail im **Error-Handler** und löst eine **Fehler-Benachrichtigung** ans Allgemein-Team aus — keine Mail geht still verloren.
