# SECURITY & DSGVO — Video-Generation-SaaS

Stand Mai 2026. EU-Betrieb, KMU/Agentur-Kunden. Kernrisiko: synthetische Medien (Avatar/Stimme) + Verkettung mehrerer US-Sub-Prozessoren.

---

## 1. Datenfluss-Analyse (welche Daten, wohin)

| Datenart | Quelle | Verarbeitet von | Risiko |
|---|---|---|---|
| Account-Daten (Email, Auth) | User | Supabase (EU-Region wählbar) | niedrig |
| Script-/Prompt-Text | User-Eingabe | Claude/GPT, ggf. TTS/Avatar-Provider | mittel (kann personenbez. Inhalte enthalten) |
| Brand-Assets (Logo, Bilder) | User-Upload | Supabase Storage, Render-API | niedrig–mittel |
| **Voiceover-Stimme** | TTS (Standard) ODER **Voice-Clone** (Phase 2) | ElevenLabs | **hoch bei Cloning** (biometrieähnlich, Consent) |
| **Avatar-Likeness** | HeyGen-Stock ODER **Custom-Avatar** (Phase 2) | HeyGen | **hoch bei Custom** (Abbild realer Person) |
| Generierte B-Roll-Clips | Kling/Veo/Runway | jeweiliger Provider | mittel |
| Zahlungs-Daten | User | **Stripe (PCI-DSS)** — wir speichern keine Kartendaten | niedrig |
| Render-Output (MP4) | System | Supabase Storage | mittel |

**Datenfluss-Prinzip:** Prompts/Assets gehen an externe Generator-APIs. Das ist die zentrale DSGVO-Exponierung → **Auftragsverarbeitung (AVV/DPA) mit jedem Provider Pflicht.**

---

## 2. Rechtsgrundlage (DSGVO)

- **Art. 6 Abs. 1 lit. b** (Vertragserfüllung) — Verarbeitung von Account- und Projekt-Daten zur Leistungserbringung.
- **Art. 6 Abs. 1 lit. f** (berechtigtes Interesse) — Betrieb, Sicherheit, Missbrauchs-Prävention.
- **Art. 9 / Art. 6 Abs. 1 lit. a (Einwilligung)** — für **Voice-Cloning & Custom-Avatar** (Abbild/Stimme realer Personen): ausdrückliche, dokumentierte Einwilligung der abgebildeten Person, **bevor** Cloning möglich ist (Consent-Gate, Upload des Consent-Nachweises). Nutzer bestätigt Rechte an hochgeladenem Material.
- **Drittland-Transfer (Art. 44 ff.):** Mehrere Provider (HeyGen, ElevenLabs, OpenAI, ggf. Kling) sind US/Non-EU → **Standardvertragsklauseln (SCC)** bzw. EU-US Data Privacy Framework prüfen; im AVV mit dem Kunden offenlegen.

---

## 3. Vendor-DPAs / Sub-Prozessoren

Pflicht: AVV/DPA mit jedem **tatsächlich aktiv genutzten** Provider (HARD-Rule: keine Vendor-Nennung ohne reale Nutzung). Sub-Prozessor-Liste im Kunden-AVV transparent führen:

| Sub-Prozessor | Funktion | Region | To-Do |
|---|---|---|---|
| Supabase | DB/Auth/Storage | EU-Region wählbar | DPA, EU-Region erzwingen |
| Stripe | Payments | US/IRL | DPA vorhanden, SCC |
| Anthropic/OpenAI | Script-Gen | US | DPA + SCC, Opt-out Training |
| ElevenLabs | TTS / (Cloning) | US | DPA + SCC, kein Training auf Kundendaten |
| HeyGen | Avatar | US | DPA + SCC |
| Kling / Veo / Runway | B-Roll | CN (Kling!) / US | **Kling = China → DSGVO-kritisch**; für EU-Kunden Veo/Runway default, Kling opt-in/disclosed |
| Creatomate / Shotstack | Render | EU/AU | DPA |

> **Kling-Hinweis:** Kostengünstigstes Modell, aber chinesischer Anbieter → für strenge EU-Kunden nicht als Default. Provider-Abstraktion erlaubt EU-/US-only-Modus pro Workspace.

---

## 4. EU-AI-Act-Einordnung

- **System-Klasse:** Generative-AI / synthetische Medien → **kein Hochrisiko-System**, aber **Transparenzpflichten nach Art. 50** treffen voll zu.
- **Art. 50 (ab 2. August 2026 durchsetzbar):** Anbieter von AI, die synthetische Audio/Bild/Video/Text-Inhalte erzeugen, müssen Output **maschinenlesbar markieren** (detektierbar als künstlich erzeugt). Deployer von **Deepfakes** müssen **klar und sichtbar offenlegen**, dass Inhalt KI-generiert ist.
- **Code of Practice** (erster Entwurf 17.12.2025) definiert technische Standards: Multi-Layer-Watermarking = **Metadaten (C2PA) + unsichtbare Marker**, plus sichtbare Labels/Disclaimer bei Video.

**Umsetzung im Produkt (Pflicht-Stage „AI-Marking", siehe SPEC §3):**
1. **C2PA / Content-Credentials-Metadaten** in jedes MP4 (maschinenlesbar, Provenienz).
2. **Sichtbares Label** bei Avatar/Deepfake-Inhalten („KI-generiert"), abschaltbar nur wo rechtlich zulässig (z.B. klar künstlerischer/B-Roll-Kontext) — Default an.
3. **Audio-Disclaimer-Option** für reine Voiceover-Deepfakes.
4. **Dokumentation + Governance** (Art. 50 verlangt technisch + organisatorisch): Logging welcher Render markiert wurde (`renders.marking_applied`).

Default = konservativ markieren. Das ist gleichzeitig **USP** (siehe README) gegenüber US-Tools, die Marking nachrüsten müssen.

---

## 5. Risiken & Mitigation

| Risiko | Schwere | Mitigation |
|---|---|---|
| Missbrauch für Deepfakes realer Personen ohne Consent | hoch | Consent-Gate für Cloning, AUP/ToS, Prompt-Moderation, Marking erzwungen |
| Drittland-Transfer (US/China) | hoch | SCC/DPF, EU-only-Modus pro Workspace, Kling als opt-in |
| Provider trainiert auf Kundendaten | mittel | Vertraglich Training-Opt-out, no-retention-Flag wo verfügbar |
| Urheberrecht / Markenrechte in generiertem Content | mittel | User bestätigt Rechte (ToS), keine Marken/Promis in Prompts, Filter |
| Runaway-Kosten / Provider-Ausfall | mittel | Hard-Caps, Credit-Holds, Multi-Provider-Fallback, idempotente Stages |
| PII in Prompts/Assets | mittel | Hinweis im UI, Data-Minimization, Lösch-Funktion (Art. 17) |
| Art.-50-Non-Compliance ab 08/2026 | hoch | Marking-Stage = nicht optional im MVP, vor GA live |
| Storage-Leak (RLS-Fehler) | hoch | RLS auf workspace_id, signed URLs mit TTL, Pen-Test vor Launch |

**Betroffenenrechte:** Auskunft/Export/Löschung self-serve im Dashboard (Account + alle Projekte/Renders kaskadierend). Aufbewahrung: Renders nach Plan-Limit/Kündigung gem. Frist gelöscht.
