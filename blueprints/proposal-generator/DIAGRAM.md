# Proposal-Generator — Workflow-Diagramm

> Visuelle Darstellung des n8n-Workflows aus `workflow.json` (14 Nodes). Zeigt den vollständigen Datenfluss von den Discovery-Notizen bis zum freigegebenen Angebot inkl. Fehler-Pfad und Versand-Gate.

```mermaid
flowchart TD
    WH["Webhook: Discovery-Intake<br/>(POST: clientName, clientCompany,<br/>clientEmail, notes, budgetHint?, deadline?)"]
    CFG["Set: Angebots-Konfiguration<br/>(Vendor, serviceCatalog, pricingRules,<br/>PDF/CRM-URLs, sendMode)"]
    NORM["Code: Discovery normalisieren<br/>(saeubern, validieren, Tage bis Deadline)"]
    IFVALID{"IF: Discovery verwertbar?"}

    LLM["Anthropic Chat Model<br/>(claude-3-5-sonnet, temp 0.3)"]
    AGENT["AI Agent: Angebot strukturieren<br/>(Bedarf ableiten, Katalog-Positionen waehlen)"]
    PRICE["Code: Pricing-Logik anwenden<br/>(Summe, Rabatt, Express, USt, Anzahlung)"]
    HTML["Code: Angebots-HTML rendern<br/>(HTML + Plaintext, escaped)"]

    PDF["HTTP: PDF generieren"]
    STORE["HTTP: Angebot ins CRM loggen"]
    IFSEND{"IF: Direkt an Kunden?<br/>(sendMode)"}

    CLIENT["Email: Angebot an Kunden<br/>(nur direct_client)"]
    REVIEW["Email: Angebot zur Review<br/>(intern, Default)"]
    ERR["Email: Fehler-Alert<br/>(ungueltig / PDF / CRM-Fehler)"]

    WH --> CFG --> NORM --> IFVALID
    IFVALID -->|"verwertbar"| AGENT
    IFVALID -->|"ungueltig (Notizen zu kurz / Mail falsch)"| ERR

    LLM -. ai_languageModel .-> AGENT
    AGENT --> PRICE --> HTML --> PDF
    PDF -->|Erfolg| STORE
    PDF -.->|PDF-Fehler| ERR
    STORE -->|Erfolg| IFSEND
    STORE -.->|Write-Fehler| ERR
    IFSEND -->|"direct_client"| CLIENT
    IFSEND -->|"internal_review (Default)"| REVIEW

    style WH fill:#1f6feb,color:#fff
    style IFVALID fill:#d29922,color:#000
    style IFSEND fill:#d29922,color:#000
    style LLM fill:#8957e5,color:#fff
    style AGENT fill:#8957e5,color:#fff
    style CLIENT fill:#2ea043,color:#fff
    style REVIEW fill:#2ea043,color:#fff
    style ERR fill:#cf222e,color:#fff
```

---

## Legende

| Element | Bedeutung |
|---|---|
| 🔵 Blau (Webhook) | Trigger / Eingang des Workflows |
| 🟡 Gelb (Rauten) | Verzweigung (IF-Node) |
| 🟣 Violett (LLM/Agent) | KI-Strukturierung via Anthropic Claude |
| 🟢 Grün | Erfolgs-Ausgänge (Angebot an Kunden ODER an interne Review) |
| 🔴 Rot | Fehler-Ausgang (Alert an Betreiber) |
| `-. ai_languageModel .->` | Cluster-Node-Verbindung: das Sprachmodell hängt am AI-Agent (kein Daten-Hauptpfad) |
| `-.-> Fehler` | Error-Output des Nodes (`onError: continueErrorOutput`) |

## Flow in Worten

1. **Discovery-Notizen** kommen per Webhook rein, die **Konfiguration** (Katalog, Pricing-Regeln, Vendor-Daten) wird angehängt.
2. **Normalisierung** säubert + validiert den Input und berechnet Tage bis Deadline. Ungültige Discovery (zu kurze Notizen, falsche Mail) geht direkt in den **Fehler-Alert** — es wird kein Angebot erstellt.
3. **Claude** liest die Notizen, leitet die Bedürfnisse ab und wählt **ausschließlich Positionen aus dem Leistungskatalog** (keine erfundenen Leistungen/Preise).
4. Die **Pricing-Logik** rechnet deterministisch (Code, kein LLM): Zwischensumme, Mengenrabatt, Express-Zuschlag bei knapper Deadline, USt, Anzahlung — plus Budget-Warnung.
5. Das **Angebots-HTML** wird sauber gerendert (alle dynamischen Felder escaped) und an die **PDF-API** geschickt.
6. Jedes Angebot wird mit Metadaten ins **CRM** geloggt. Schlägt PDF oder CRM fehl, geht ein **Fehler-Alert** raus (kein stiller Tod).
7. Das **Versand-Gate** entscheidet: bei `direct_client` geht das Angebot an den Kunden, im Default `internal_review` zuerst zur menschlichen Freigabe ins interne Postfach.
