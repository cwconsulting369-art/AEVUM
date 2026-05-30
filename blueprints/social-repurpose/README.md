# AEVUM Blueprint: Social-Repurpose

> Ein Long-Form-Asset (Blog/Video-Transkript) → automatisch 5+ plattformspezifische Posts (LinkedIn / X / Instagram) im eigenen Brand-Voice. Mit Freigabe-Digest statt Auto-Posten.

---

## Das Problem (brutal ehrlich)

Du (oder dein Team) schreibst einen guten Blogartikel oder nimmst ein 30-Minuten-Video auf. Dann passiert eines von zwei Dingen:

1. **Nichts.** Der Artikel liegt im CMS, niemand auf LinkedIn/X/Instagram erfährt davon. Reichweite = 0.
2. **Manuelle Repurpose-Arbeit.** Jemand sitzt 60-90 Minuten dran, dreht den Artikel in einen LinkedIn-Post, zwei Tweets, eine Instagram-Caption. Jede Woche aufs Neue. Wird vergessen, sobald es stressig wird.

Das Ergebnis: Dein bestes Content-Asset bekommt 5% der Reichweite, die es verdient. Und die Distribution hängt an der Disziplin einer Person.

**Was dieses Blueprint NICHT löst:** Es schreibt keinen guten Content für dich. Wenn das Long-Form-Asset schwach ist, sind die Posts schwach. Garbage in, garbage out. Das hier ist ein Verteilungs- und Verdichtungs-Werkzeug, kein Content-Generator aus dem Nichts.

---

## Die Lösung

Der Workflow:

1. **Trigger:** Holt werktags 08:00 das neueste veröffentlichte Long-Form-Asset aus deinem CMS/Feed (oder per Webhook-Push beim Veröffentlichen).
2. **Bereinigen:** Strippt HTML, normalisiert, kürzt auf token-sicheres Budget.
3. **KI-Repurpose:** Ein einziger LLM-Call (OpenRouter) erzeugt 5 Posts in deinem Brand-Voice: 1× LinkedIn-Text, 2× Tweets (Hook + Listicle), 1× Instagram-Caption, 1× LinkedIn-Carousel-Outline.
4. **Validieren & Splitten:** Jeder Post wird gegen das Plattform-Zeichenlimit geprüft. Zu lange Posts werden als `needs_review` markiert, nicht stillschweigend abgeschnitten.
5. **Speichern:** Saubere Drafts landen in deinem Draft-Store (Airtable/Notion/Supabase) mit Status `draft`.
6. **Freigabe-Digest:** Eine HTML-Mail mit allen Posts geht an dich/dein Team. **Kein Auto-Posten.** Du entscheidest, was raus geht.
7. **Fehler-Pfad:** Schlägt CMS-Abruf, LLM-Call oder Speichern fehl, kommt eine Fehler-Alert-Mail statt halben Mülls.

**Ergebnis:** Aus jedem Long-Form-Asset werden in Minuten 5 ungeplante, brand-konforme Post-Entwürfe — du musst nur noch freigeben.

---

## Warum mit Freigabe statt Auto-Posten?

Bewusste Design-Entscheidung. Auto-Posten von KI-Text ist ein Marken-Risiko: Halluzinierte Zahlen, off-brand Tonfall oder ein peinlicher Tweet sind öffentlich, bevor du es merkst. Der Digest-Schritt kostet dich 2 Minuten und schützt deine Marke. Wer trotzdem Auto-Posten will: siehe `SECURITY-RISKS.md` (Risiko #6) und die DFY-Variante (Buffer/Ayrshare-Anbindung mit Guardrails).

---

## Ziel-Segmente

| Segment | Pain | Hebel |
|---|---|---|
| **Agentur** (AG) | Content für sich selbst (und Kunden) wird produziert, aber nie konsequent über alle Kanäle ausgespielt. Repurpose frisst billable Stunden. | 1 Artikel → 5 Posts pro Kunde/Kanal autonom, als skalierbarer Service weiterverkaufbar |
| **Personal Brand** (PB) | Coach/Berater/Solo schreibt unregelmäßig, postet noch unregelmäßiger. Keine Zeit + keine Disziplin für Multi-Channel. | Schreibt 1× lang, bekommt 5 Entwürfe in eigenem Voice, gibt in 2 Min frei |
| **Mittelstand / B2B-SaaS** (FI) | Marketing produziert Blog/Webinare, Social wird vom Praktikanten "mitgemacht". Inkonsistenter Markenauftritt. | Standardisierter Brand-Voice in allen Posts, Freigabe-Workflow für Marketing-Lead |

---

## Was du eintragen musst

Alle individuellen Werte stehen im Node **„Set: Brand-Konfiguration"** als `{{INDIVIDUELL: ...}}`-Platzhalter. Zusätzlich gibt es Platzhalter im Fehler-Handler-Node.

| Platzhalter | Was rein muss | Woher |
|---|---|---|
| `brandName` | Marken- oder Personenname | Du / Marken-Guide |
| `brandVoice` | 2-3 Sätze Tonalität (z.B. „direkt, technisch, kein Hype") | Marken-Guide / Tone-of-Voice-Doc. Wenn nicht vorhanden: 3 deiner besten Posts nehmen und die Eigenschaften beschreiben |
| `targetAudience` | Wen du erreichst (Rolle + Kontext) | ICP-Definition |
| `ctaDefault` | Standard-Call-to-Action-Text | Marketing |
| `platforms` | Komma-Liste (Default: `linkedin,twitter,instagram`) | Festlegen welche Kanäle |
| `sourceApiUrl` | API/Feed-URL die das neueste Long-Form-Asset liefert | CMS-API (WordPress REST `/wp-json/wp/v2/posts`, Ghost Content-API, Webflow CMS-API) oder RSS-to-JSON (rss2json, feedity) |
| `draftStoreUrl` | Endpoint zum Ablegen der Drafts | Airtable-Table-API / Notion-DB-API / Supabase-REST. Tabelle vorher anlegen (Spalten siehe INSTALL-GUIDE) |
| `approvalEmail` | Mail-Adresse für den Freigabe-Digest | Du / Social-Team |
| `senderEmail` | Absender für Benachrichtigungen | Eigene Domain (nicht Freemail) |
| `alertEmail` (im Fehler-Node) | Mail-Adresse für Fehler-Alerts | Ops / du |
| Fehler-`senderEmail` (im Fehler-Node) | Absender für Fehler-Alerts | Eigene Domain |

**Plus 3 Credentials (Node-Ebene, NICHT in JSON eintragen):**

| Credential | Wofür | Typ |
|---|---|---|
| `Source-CMS API Auth` | Asset-Abruf | Header Auth (z.B. `Authorization: Bearer <CMS_TOKEN>`). Bei öffentlichem RSS/Feed: Auth am Node entfernen |
| `OpenRouter API` | KI-Repurpose | Header Auth (`Authorization: Bearer <OPENROUTER_KEY>`) |
| `Draft-Store API Auth` | Draft speichern | Header Auth (z.B. Airtable `Bearer <AIRTABLE_PAT>`) |
| `SMTP` | Digest + Fehler-Mail | SMTP (eigener Mail-Provider) |

---

## Voraussetzungen

| Tool | Zweck | Pflicht? | Kosten |
|---|---|---|---|
| n8n (Cloud-EU oder Self-Host) | Workflow-Engine | Ja | €0–20/Mo |
| OpenRouter API Key | KI-Repurpose | Ja | ~€2–8/Mo (1 Asset/Werktag) |
| Long-Form-Quelle mit API/Feed | Asset-Input | Ja | abhängig vom CMS |
| Draft-Store (Airtable/Notion/Supabase) | Entwürfe ablegen + freigeben | Ja | €0–20/Mo |
| SMTP / Mail-Provider | Digest- + Fehler-Mail | Ja | €0–15/Mo |

**Kein eigenes CMS?** Du kannst die Quelle auch durch einen Google-Sheets-Node oder einen manuellen Trigger mit fixem Text ersetzen. Der Repurpose-Kern (Node „HTTP: KI-Repurpose" abwärts) bleibt gleich.

---

## Setup in 5 Schritten (Kurzfassung)

Vollständige Version mit DNS/Token-Details: siehe `INSTALL-GUIDE.md`.

### Schritt 1: Workflow importieren
n8n → Workflows → Import from File → `workflow.json`. **Nicht aktivieren.**

### Schritt 2: Credentials anlegen
4 Credentials (siehe Tabelle oben). Tokens **nur** im Credential-Store, niemals im Node-Body.

### Schritt 3: Brand-Konfiguration füllen
Node „Set: Brand-Konfiguration" → alle `{{INDIVIDUELL: ...}}` ersetzen. Im Fehler-Node ebenfalls die 2 Mail-Platzhalter.

### Schritt 4: Test-Run
Workflow manuell ausführen. Prüfen: Asset wird geladen, 5 Posts werden generiert, Drafts landen im Store, Digest-Mail kommt an. Feld-Mapping im Code-Node „Asset bereinigen" ggf. an deine CMS-Felder anpassen.

### Schritt 5: Aktivieren
Schedule-Trigger prüfen (Default werktags 08:00). Aktivieren. Alternativ Webhook-Trigger aktivieren und Schedule deaktivieren.

---

## Limits (transparent)

- **Reply/Engagement-Tracking:** nicht enthalten. Das Blueprint produziert Drafts, kein Analytics.
- **Auto-Posten:** bewusst nicht im Default (Marken-Risiko). DFY-Variante kann Buffer/Ayrshare anbinden.
- **Video-Transkription:** Der Workflow erwartet **Text** (Blog-Body oder fertiges Transkript). Audio/Video → Text (Whisper o.ä.) ist ein Vor-Schritt, nicht enthalten.
- **Bild-/Carousel-Rendering:** Das Carousel kommt als Slide-Outline (Text), nicht als fertige Grafik. Visuelle Umsetzung in Canva/Figma ist manuell.
- **Mehrsprachigkeit:** Prompt übernimmt die Asset-Sprache. Echte Multi-Language-Ausspielung (1 Asset → DE + EN Posts) ist Phase 2.
- **Dedupe:** Der Workflow hat einen `assetHash`, aber keine eingebaute „schon-verarbeitet"-Prüfung. Bei Schedule-Polling musst du serverseitig (CMS-Query `nur neue seit X`) oder über einen Dedupe-Check filtern, sonst werden Assets mehrfach repurposed. Siehe INSTALL-GUIDE Schritt 8.

---

## Datenfluss (Kurz)

```
[Schedule 08:00 / Webhook]
        │
[Set: Brand-Konfiguration]
        │
[HTTP: Asset laden] ──(Fehler)──┐
        │                        │
[Code: bereinigen]               │
        │                        │
[HTTP: KI-Repurpose] ──(Fehler)──┤
        │                        │
[Code: parsen & splitten]        │
        │                        │
[IF: über Limit?]                │
   ja│      │nein                │
 (review)  [HTTP: Draft speichern]──(Fehler)──┤
      │      │                   │
   [Merge: Drafts sammeln]       │
        │                        │
[Aggregate → Digest bauen]       │
        │                        │
[Email: Freigabe-Digest]   [Code: Fehler] → [Email: Fehler-Alert]
```

Detailliertes Mermaid-Diagramm: `DIAGRAM.md`.
