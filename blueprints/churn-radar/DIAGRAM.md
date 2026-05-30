# Churn-Radar — Workflow-Diagramm

Visuelle Übersicht des n8n-Workflows aus `workflow.json`. Zeigt alle Nodes und Verbindungen inkl. Triage-Verzweigung und Error-Pfad.

```mermaid
flowchart TD
    A["Schedule: Täglich 07:00 (Mo-Fr)<br/><i>scheduleTrigger</i>"] --> B["Set: Churn-Konfiguration<br/><i>set</i>"]
    B --> C["Postgres: Kunden-Aktivität laden<br/><i>postgres</i>"]

    C -->|Erfolg| D["Code: Churn-Score berechnen<br/><i>code · 5-Faktoren-Heuristik</i>"]
    C -.->|DB-Fehler| ERR["Email: Fehler-Alert<br/><i>emailSend · Ops-Mail</i>"]

    D --> E{"IF: Über Risiko-Schwelle?<br/><i>score &gt;= riskThreshold</i>"}

    E -->|false: gesund| OK["NoOp: Gesund — kein Alert<br/><i>noOp</i>"]

    E -->|true: at risk| F["HTTP: KI-Churn-Analyse<br/><i>httpRequest · OpenRouter</i>"]
    E -->|true: at risk| M["Merge: Kunde + KI-Output<br/><i>merge · combineByPosition</i>"]

    F -->|Erfolg| G["Code: KI-Antwort parsen<br/><i>code · Fallback bei kaputtem JSON</i>"]
    F -.->|KI-Fehler| ERR
    G --> M

    M --> H["Email: Retention-Sequenz<br/><i>emailSend · an Kunde</i>"]
    M --> I["Slack: Churn-Alert an CS-Team<br/><i>slack</i>"]

    H --> L["Postgres: Churn-Event protokollieren<br/><i>postgres · ON CONFLICT</i>"]
    I --> L

    classDef trigger fill:#1e3a5f,stroke:#3b82f6,color:#fff;
    classDef logic fill:#3f2d52,stroke:#a855f7,color:#fff;
    classDef ai fill:#3d2a1a,stroke:#f59e0b,color:#fff;
    classDef action fill:#1a3d2a,stroke:#22c55e,color:#fff;
    classDef errorpath fill:#3d1a1a,stroke:#ef4444,color:#fff;

    class A trigger;
    class B,D,E,G,M,OK logic;
    class F ai;
    class C,H,I,L action;
    class ERR errorpath;
```

## Legende

| Farbe | Bedeutung | Nodes |
|---|---|---|
| 🔵 Blau | Trigger | Schedule |
| 🟣 Lila | Logik / Datenverarbeitung | Set, Score-Code, IF-Triage, Parse-Code, Merge, NoOp |
| 🟠 Orange | KI | OpenRouter-Analyse |
| 🟢 Grün | Aktion / I/O | Postgres-Read, Retention-Mail, Slack-Alert, Event-Log |
| 🔴 Rot | Error-Pfad | Fehler-Alert-Mail |

## Ablauf in Worten

1. **Schedule** löst werktäglich morgens aus.
2. **Set** lädt zentrale Konfiguration (Schwellen, Absender, Slack-Channel).
3. **Postgres-Read** holt Kunden + Aktivitätsdaten. Bei DB-Fehler → Error-Pfad (Ops-Mail).
4. **Score-Code** berechnet pro Kunde den Churn-Score und das Risk-Band.
5. **IF-Triage** verzweigt: gesunde Kunden → NoOp (Ende). Risiko-Kunden → KI-Pfad.
6. **OpenRouter** liefert Risiko-Einschätzung + Retention-Mail-Text. Bei Fehler → Error-Pfad.
7. **Parse-Code** liest die KI-Antwort robust aus (Fallback-Template bei kaputtem JSON).
8. **Merge** führt Kundendaten + KI-Output zusammen.
9. **Doppel-Aktion:** Retention-Mail an den Kunden **+** Slack-Alert ans CS-Team.
10. **Postgres-Log** schreibt das Churn-Event (Doppel-Schutz via ON CONFLICT).
