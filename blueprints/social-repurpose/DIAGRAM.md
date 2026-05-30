# Social-Repurpose — Workflow-Diagramm

Visualisierung des n8n-Workflows (`workflow.json`, 15 Nodes). Ein Long-Form-Asset wird zu 5+ plattformspezifischen Posts, validiert, gespeichert und als Freigabe-Digest versendet — mit durchgehendem Fehler-Pfad.

```mermaid
flowchart TD
    A["⏰ Schedule: Werktags 08:00"]:::trigger
    A2["🔗 Webhook: Asset-Eingang<br/>(alternativ, default aus)"]:::trigger
    B["⚙️ Set: Brand-Konfiguration<br/>brandVoice · Zielgruppe · URLs"]:::config
    C["🌐 HTTP: Long-Form-Asset laden<br/>(CMS / Feed)"]:::http
    D["🧹 Code: Asset bereinigen<br/>HTML strippen · clippen · hashen"]:::code
    E["🤖 HTTP: KI-Repurpose<br/>OpenRouter → 5 Posts als JSON"]:::llm
    F["✂️ Code: Posts parsen & aufteilen<br/>JSON-Guard · Limit-Check · split"]:::code
    G{"📏 IF: Über Zeichen-Limit?"}:::decision
    H["💾 HTTP: Draft speichern<br/>(Airtable / Notion / Supabase)"]:::http
    M["🔀 Merge: Drafts sammeln"]:::util
    N["📊 Aggregate: Digest-Daten"]:::util
    O["📝 Code: Freigabe-Digest bauen<br/>HTML mit allen Posts"]:::code
    P["📧 Email: Freigabe-Digest<br/>→ Approval-Inbox"]:::output

    ERR["⚠️ Code: Fehler aufbereiten<br/>Stage + Message"]:::error
    ERRMAIL["📧 Email: Fehler-Alert<br/>→ Ops-Inbox"]:::error

    A --> B
    A2 -.alternativ.-> B
    B --> C
    C -->|OK| D
    C -.Fehler.-> ERR
    D --> E
    E -->|OK| F
    E -.Fehler.-> ERR
    F --> G
    G -->|"ja → needs_review"| M
    G -->|"nein → draft"| H
    H -->|OK| M
    H -.Fehler.-> ERR
    M --> N
    N --> O
    O --> P
    ERR --> ERRMAIL

    classDef trigger fill:#1e3a8a,stroke:#1e40af,color:#fff;
    classDef config fill:#0f766e,stroke:#0d9488,color:#fff;
    classDef http fill:#7c3aed,stroke:#6d28d9,color:#fff;
    classDef llm fill:#be185d,stroke:#9d174d,color:#fff;
    classDef code fill:#374151,stroke:#1f2937,color:#fff;
    classDef decision fill:#b45309,stroke:#92400e,color:#fff;
    classDef util fill:#475569,stroke:#334155,color:#fff;
    classDef output fill:#15803d,stroke:#166534,color:#fff;
    classDef error fill:#b91c1c,stroke:#991b1b,color:#fff;
```

---

## Legende

| Farbe | Node-Typ | Funktion |
|---|---|---|
| 🔵 Blau | Trigger | Schedule (werktags 08:00) oder optionaler Webhook-Push |
| 🟢 Türkis | Config | Brand-Voice, Zielgruppe, URLs, Mail-Adressen |
| 🟣 Violett | HTTP | Externe Calls: Asset laden, Draft speichern |
| 🌸 Magenta | LLM | OpenRouter-Repurpose (5 Posts aus 1 Call) |
| ⚫ Grau-dunkel | Code | Bereinigen, Parsen/Splitten, Digest-Bau, Fehler-Aufbereitung |
| 🟠 Orange | Decision | Plattform-Zeichenlimit-Check |
| 🔘 Grau | Util | Merge + Aggregate (Posts wieder zusammenführen) |
| 🟢 Grün | Output | Freigabe-Digest-Mail |
| 🔴 Rot | Error | Fehler-Pfad → Alert-Mail |

## Flow in Worten

1. **Trigger** feuert werktags 08:00 (oder per Webhook beim Veröffentlichen).
2. **Brand-Konfiguration** liefert Voice, Zielgruppe und alle Ziel-URLs.
3. **Asset laden** holt das neueste Long-Form-Asset aus dem CMS/Feed. Schlägt das fehl → Fehler-Pfad.
4. **Bereinigen** strippt HTML, kürzt auf token-sicheres Budget, bildet einen `assetHash`.
5. **KI-Repurpose** erzeugt in einem OpenRouter-Call 5 Posts (LinkedIn-Text, 2 Tweets, Instagram-Caption, Carousel-Outline) als JSON. Schlägt das fehl → Fehler-Pfad.
6. **Parsen & Aufteilen** validiert das JSON, splittet jeden Post in ein eigenes Item, prüft Zeichenlimits.
7. **Limit-Check:** Posts über dem Plattform-Limit gehen als `needs_review` direkt in den Merge; saubere Posts werden gespeichert.
8. **Draft speichern** schreibt jeden sauberen Post in den Draft-Store. Schlägt das fehl → Fehler-Pfad.
9. **Merge + Aggregate** führen alle Posts wieder zu einem Stream zusammen.
10. **Digest bauen + Mail** versendet eine HTML-Übersicht aller Posts an die Approval-Inbox — **keine automatische Veröffentlichung**, der Mensch gibt frei.
11. **Fehler-Pfad** fängt Fetch-, LLM- und Store-Fehler ab und schickt eine Alert-Mail mit Stufen-Info statt halben Output zu produzieren.
