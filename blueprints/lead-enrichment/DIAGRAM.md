# Lead-Enrichment — Workflow-Diagramm

> Visuelle Darstellung des n8n-Workflows aus `workflow.json` (15 Nodes). Zeigt den vollständigen Datenfluss vom Roh-Lead bis zum Sales-Alert inkl. Fehler-Pfad.

```mermaid
flowchart TD
    WH["Webhook: Roh-Lead Intake<br/>(POST: name, company, domain, email)"]
    CFG["Set: Enrichment-Konfiguration<br/>(ICP, Threshold, API-URLs, E-Mails)"]
    NORM["Code: Lead normalisieren<br/>(Domain saeubern, Freemail-Filter, validieren)"]
    IFVALID{"IF: Lead anreicherbar?"}

    COMP["HTTP: Firmendaten anreichern<br/>(Branche, Groesse, Umsatz, Tech)"]
    SOC["HTTP: Socials & Domain-Intel<br/>(LinkedIn, Twitter, Facebook)"]
    MERGE["Merge: Anreicherung<br/>zusammenfuehren (by position)"]
    PROFILE["Code: Enrichment-Profil bauen<br/>(defensives pick-Parsing)"]

    LLM["Anthropic Chat Model<br/>(claude-3-5-sonnet, temp 0.2)"]
    AGENT["AI Agent: ICP-Scoring<br/>(JSON: score, tier, reasons)"]
    PARSE["Code: Score parsen & flaggen<br/>(crash-sicher, Tier-D-Fallback)"]

    CRM["HTTP: In CRM/Sheet schreiben"]
    IFHOT{"IF: Hot-Lead<br/>(ueber Threshold)?"}
    HOT["Email: Hot-Lead-Alert<br/>(an Sales, volles Profil)"]
    ERR["Email: Fehler-Alert<br/>(ungueltig / CRM-Write-Fehler)"]

    WH --> CFG --> NORM --> IFVALID
    IFVALID -->|gueltig| COMP
    IFVALID -->|gueltig| SOC
    IFVALID -->|"ungueltig (Freemail / keine Domain)"| ERR

    COMP --> MERGE
    SOC --> MERGE
    MERGE --> PROFILE --> AGENT
    LLM -. ai_languageModel .-> AGENT
    AGENT --> PARSE --> CRM
    CRM -->|Erfolg| IFHOT
    CRM -.->|Write-Fehler| ERR
    IFHOT -->|"Score >= Threshold"| HOT
    IFHOT -->|"Score < Threshold"| STOP[" "]

    style WH fill:#1f6feb,color:#fff
    style IFVALID fill:#d29922,color:#000
    style IFHOT fill:#d29922,color:#000
    style LLM fill:#8957e5,color:#fff
    style AGENT fill:#8957e5,color:#fff
    style HOT fill:#2ea043,color:#fff
    style ERR fill:#cf222e,color:#fff
    style STOP fill:#f6f8fa,color:#f6f8fa,stroke:#f6f8fa
```

---

## Legende

| Element | Bedeutung |
|---|---|
| 🔵 Blau (Webhook) | Trigger / Eingang des Workflows |
| 🟡 Gelb (Rauten) | Verzweigung (IF-Node) |
| 🟣 Violett (LLM/Agent) | KI-Scoring via Anthropic Claude |
| 🟢 Grün | Erfolgs-Ausgang (Hot-Lead an Sales) |
| 🔴 Rot | Fehler-Ausgang (Alert an Betreiber) |
| `-. ai_languageModel .->` | Cluster-Node-Verbindung: das Sprachmodell hängt am AI-Agent (kein Daten-Hauptpfad) |
| `-.-> Write-Fehler` | Error-Output des CRM-Nodes (`onError: continueErrorOutput`) |

## Flow in Worten

1. **Roh-Lead** kommt per Webhook rein, **Konfiguration** wird angehängt.
2. **Normalisierung** säubert die Domain und filtert Freemail/ungültige Leads → diese gehen direkt in den **Fehler-Alert**.
3. Gültige Leads werden parallel über zwei APIs angereichert (**Firmendaten** + **Socials**) und im **Merge** zusammengeführt.
4. Das **Profil** wird defensiv gebaut (robust gegen leere/uneinheitliche API-Antworten).
5. **Claude** bewertet das Profil gegen das ICP → **Score** wird crash-sicher geparst und geflaggt.
6. Jeder Lead wird ins **CRM** geschrieben; schlägt das fehl, geht ein **Fehler-Alert** raus.
7. Liegt der Score über dem **Threshold** und ist der Lead nicht disqualifiziert, bekommt Sales sofort einen **Hot-Lead-Alert**. Sonst endet der Flow still (Lead ist trotzdem im CRM).
