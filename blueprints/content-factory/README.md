# AEVUM Blueprint: Content-Factory

> Von der Idee zum fertigen Post — vollautomatisch für Instagram und LinkedIn.

---

## Was dieses Blueprint macht

Die **Content-Factory** nimmt eine Liste von Themen-Ideen entgegen und produziert daraus täglich fertig formatierte Social-Media-Posts. Der Workflow läuft jeden Morgen um 08:00 Uhr, zieht das nächste Thema aus deiner Queue, generiert einen Hook, schreibt den vollständigen Caption-Text und baut die passenden Hashtags — alles per KI. Das Ergebnis landet in deiner Notion-Datenbank und du bekommst eine Telegram- oder Slack-Benachrichtigung.

**Ergebnis pro Durchlauf:**
- 1 Hook (erste Zeile, Aufmerksamkeitsfang)
- 1 Caption (300–600 Zeichen, plattformspezifisch)
- 1 Hashtag-Set (10–15 Tags, themenrelevant)
- Notion-Eintrag mit Status "Draft"
- Benachrichtigung an dich zur finalen Freigabe

---

## Voraussetzungen

| Tool | Zweck | Pflicht? |
|------|-------|----------|
| n8n (self-hosted oder Cloud) | Workflow-Engine | Ja |
| OpenRouter API Key | KI-Modell-Zugang (GPT-4o, Claude, etc.) | Ja |
| Notion Integration Token | Output-Speicher | Empfohlen |
| Telegram Bot Token | Benachrichtigung | Optional |
| Slack Webhook URL | Alternative zu Telegram | Optional |

**n8n Version:** Getestet mit n8n >= 1.30. Ältere Versionen können abweichen.

**OpenRouter:** Konto unter [openrouter.ai](https://openrouter.ai) erstellen, API Key generieren. Kosten: ca. $0.002–0.01 pro Workflow-Durchlauf je nach gewähltem Modell.

---

## Setup in 5 Schritten

### Schritt 1: Workflow importieren

1. In n8n oben rechts auf **"Import Workflow"** klicken
2. Die Datei `workflow.json` aus diesem Ordner hochladen
3. Workflow wird geöffnet — noch nicht aktivieren

### Schritt 2: API-Credentials anlegen

In n8n unter **Settings > Credentials** folgende Credentials erstellen:

- **OpenRouter (HTTP Header Auth):**
  - Name: `OpenRouter API`
  - Header Name: `Authorization`
  - Header Value: `Bearer YOUR_OPENROUTER_API_KEY`

- **Notion API:**
  - Offizielle n8n Notion-Integration nutzen
  - Integration Token aus deinem Notion Workspace einfügen

- **Telegram (falls genutzt):**
  - Bot Token von @BotFather
  - Chat ID deines Telegram-Accounts

### Schritt 3: Themen-Queue befüllen

Im Workflow den **"Set Node: Topic Queue"** öffnen. Dort das Array `topics` anpassen:

```json
["Warum 80% der Agenturen scheitern",
 "5 Automatisierungen die sofort Zeit sparen",
 "Was ein gutes Briefing ausmacht",
 "Der größte Fehler beim Onboarding",
 "Wie wir mit einem Workflow 10h/Woche sparen"]
```

Tipp: Halte mindestens 14 Themen bereit (2 Wochen Vorlauf).

### Schritt 4: Notion-Datenbank verbinden

1. In Notion eine neue Datenbank anlegen mit den Spalten:
   - `Titel` (Title)
   - `Status` (Select: Draft / Freigegeben / Veröffentlicht)
   - `Plattform` (Multi-Select: Instagram / LinkedIn)
   - `Caption` (Text)
   - `Hashtags` (Text)
   - `Erstellt am` (Date)

2. Die Datenbank-ID aus der URL kopieren (der 32-stellige Hash)
3. Im Notion Create Node die Database ID eintragen

### Schritt 5: Workflow aktivieren

Toggle oben rechts auf **"Active"** stellen. Der Workflow läuft ab sofort täglich um 08:00 Uhr.

---

## Workflow-Übersicht

```
[Schedule Trigger 08:00]
        |
[Set: Topic aus Queue lesen]
        |
[HTTP: OpenRouter → Hook generieren]
        |
[HTTP: OpenRouter → Caption schreiben]
        |
[IF: Caption > 100 Zeichen?]
   |           |
  Ja          Nein
   |           |
[HTTP:      [Error Log]
 Hashtags]
   |
[Notion: Page erstellen]
        |
[Telegram/Slack Benachrichtigung]
```

### Node-Erklärungen

| Node | Funktion |
|------|----------|
| Schedule Trigger | Startet täglich um 08:00 Uhr |
| Set: Topic Queue | Array mit deinen Themen; Index rotiert täglich |
| HTTP Request #1 | Sendet Thema an OpenRouter → empfängt Hook (1-2 Sätze) |
| HTTP Request #2 | Sendet Hook + Thema → empfängt ausgeschriebene Caption |
| IF Node | Qualitätsprüfung: Caption muss mindestens 100 Zeichen haben |
| HTTP Request #3 | Sendet Caption → empfängt passende Hashtags |
| Notion Create | Legt neuen Eintrag in deiner Content-Datenbank an |
| Telegram/Slack | Schickt dir eine Vorschau mit Link zur Notion-Seite |

---

## Prompt-Library

### System-Prompt 1: Hook-Generator

```
Du bist ein erfahrener Social-Media-Texter für B2B-Agenturen und Personal Brands.
Deine Aufgabe: Schreibe einen Hook für folgenden Post.

Regeln:
- Maximal 2 Sätze (unter 150 Zeichen gesamt)
- Starte mit einer provokanten Aussage, Zahl oder Frage
- Kein Clickbait — die Aussage muss im Post eingelöst werden
- Sprache: Direkt, klar, kein Marketingsprech
- Kein Emoji am Anfang

Thema: {{topic}}

Antworte NUR mit dem Hook. Kein Kommentar, keine Erklärung.
```

### System-Prompt 2: Caption-Writer

```
Du bist ein erfahrener Social-Media-Texter. Schreibe einen vollständigen Post.

Plattform: {{platform}} (Instagram = informell, kurze Absätze; LinkedIn = etwas formeller, strukturierter)
Ton: {{tone_of_voice}}
Länge: 300–500 Zeichen

Struktur:
1. Hook (bereits vorgegeben, direkt übernehmen)
2. Kernaussage in 3-4 kurzen Sätzen
3. Call-to-Action (z.B. Kommentar, Speichern, DM)

Hook: {{hook}}
Thema: {{topic}}

Antworte NUR mit dem fertigen Post-Text. Kein Kommentar davor oder danach.
```

### System-Prompt 3: Hashtag-Builder

```
Du bist ein Hashtag-Spezialist für {{platform}}.

Erstelle 12 relevante Hashtags für folgenden Post. Mix aus:
- 4 große Hashtags (>500k Posts)
- 5 mittlere Hashtags (50k–500k Posts)
- 3 Nischen-Hashtags (<50k Posts, sehr spezifisch)

Thema: {{topic}}
Branche: {{industry}}

Format: Alle Hashtags in einer Zeile, mit # und Leerzeichen getrennt.
Beispiel: #Marketing #ContentCreation #Agentur

Antworte NUR mit der Hashtag-Zeile.
```

---

## Konfigurierbare Parameter

| Parameter | Standard | Anpassen in |
|-----------|----------|-------------|
| Posting-Zeit | 08:00 täglich | Schedule Trigger Node |
| Posting-Frequenz | Täglich | Schedule Trigger (auf wöchentlich/werktäglich ändern) |
| Tone of Voice | Direkt, professionell | Set Node: `tone_of_voice` Variable |
| Plattform | Instagram + LinkedIn | Set Node: `platform` Variable |
| KI-Modell | `openai/gpt-4o` | HTTP Request Nodes → Body → `model` |
| Notion DB ID | Leer (muss gesetzt werden) | Notion Node → Database |
| Themen-Queue | Beispiel-Array | Set Node: `topics` Array |

---

## Troubleshooting

### Fehler 1: "Authentication failed" beim HTTP Request

**Ursache:** OpenRouter API Key falsch oder abgelaufen.

**Lösung:**
1. In n8n → Settings → Credentials → OpenRouter API öffnen
2. Key prüfen: `Bearer ` vor dem Key nicht vergessen
3. Auf [openrouter.ai](https://openrouter.ai) Guthaben prüfen (mindestens $1)

---

### Fehler 2: Notion-Seite wird nicht erstellt

**Ursache:** Database ID fehlt oder Notion-Integration hat keinen Zugriff auf die Datenbank.

**Lösung:**
1. In Notion die Datenbank öffnen → oben rechts "..." → "Connections" → deine Integration hinzufügen
2. Database ID neu kopieren (URL zwischen letztem `/` und `?v=...`)

---

### Fehler 3: IF Node schlägt fehl — Caption immer unter 100 Zeichen

**Ursache:** OpenRouter gibt einen Fehler zurück und der Fallback-Text ist leer.

**Lösung:**
1. HTTP Request Node öffnen → "Output" prüfen
2. Häufig: Falscher JSON-Pfad für die Antwort. Prüfe ob `{{ $json.choices[0].message.content }}` korrekt ist
3. Bei Modellwechsel: Antwortstruktur kann sich ändern

---

### Fehler 4: Themen-Queue erschöpft

**Ursache:** Der Index-Counter überschreitet die Array-Länge.

**Lösung:**
- Neue Themen ins Array einfügen (Set Node)
- Alternativ: Index-Counter im Set Node auf 0 zurücksetzen
- Empfehlung: 30+ Themen immer vorhalten

---

### Fehler 5: Workflow läuft nicht zur geplanten Zeit

**Ursache:** n8n-Server nicht erreichbar, oder Workflow nicht aktiviert.

**Lösung:**
1. Workflow-Toggle oben rechts auf "Active" prüfen
2. Bei self-hosted n8n: Server-Status und Timezone prüfen (`GENERIC_TIMEZONE=Europe/Berlin` in `.env`)
3. Unter "Executions" prüfen ob Fehler im Log stehen

---

## Support

Probleme beim Setup? Zwei Wege:

1. **AEVUM Community** — Austausch mit anderen Blueprint-Nutzern (Link in deiner AEVUM-Kunden-Mail)
2. **AEVUM Audit buchen** — Wir schauen uns deinen Stack an und konfigurieren alles gemeinsam: [aevum-system.de](https://aevum-system.de)
