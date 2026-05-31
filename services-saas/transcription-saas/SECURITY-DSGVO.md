# SECURITY & DSGVO — Transcription-SaaS

Voice-Daten sind heikel. Transkripte können personenbezogene und ggf. besondere Kategorien (Art. 9 DSGVO) enthalten, und Speaker-Diarization erzeugt potenziell biometrie-nahe Merkmale. Dieses Dokument analysiert Datenfluss, Rechtsgrundlage, Vendor-Lage und EU-AI-Act-Einordnung — und nennt die Risiken ehrlich.

> **Hinweis:** Dies ist eine technisch-organisatorische Einordnung, keine Rechtsberatung. Vor Go-Live mit echten Mandanten-/Patientendaten anwaltliche Prüfung des AVV + DSFA empfohlen.

---

## 1. Datenfluss-Analyse (Personenbezug)

| Stufe | Daten | Personenbezug | Maßnahme |
|---|---|---|---|
| Upload | Audio/Video-Datei | hoch (Stimme, Inhalt) | TLS, presigned URL, EU-Storage |
| Storage | Originaldatei | hoch | Verschlüsselung at-rest, EU-Region, Auto-Löschung |
| Verarbeitung managed | Audio → Drittland-Engine? | hoch + Drittlandtransfer | nur EU-Region-Endpunkte / EU-only-Modus |
| Verarbeitung EU-only | Audio → eigene EU-GPU | hoch, kein Transfer | self-host WhisperX+pyannote, kein Vendor |
| Transkript | Volltext + Segmente | hoch (Klartext-Inhalt) | RLS, Verschlüsselung, Löschanspruch |
| Diarization | Speaker-Labels/Voiceprint-nah | potenziell biometrisch | Opt-in, keine Voiceprint-Persistenz über Job hinaus |
| Summary | LLM-Verarbeitung Transkript | hoch | EU-Modus: kein Drittland-LLM; opt-out möglich |
| Sharing | Read-only-Link | hoch | Passwort + Ablauf + Token-Entropie |

**Datenminimierung (HARD-Rule):** Originalaudio nach erfolgreicher Transkription optional automatisch löschen (Default-Frist konfigurierbar, z. B. 7/30 Tage). Nur speichern, was der Nutzer braucht. Keine Voiceprints/Speaker-Embeddings persistieren, wenn nicht zwingend für Funktion.

---

## 2. Rechtsgrundlage (Art. 6 DSGVO)

- **B2B-Kunde als Verantwortlicher, AEVUM als Auftragsverarbeiter (Art. 28).** AVV/DPA zwischen Kunde und AEVUM erforderlich → Template bereitstellen, im Dashboard signierbar/downloadbar.
- **Rechtsgrundlage des Kunden** gegenüber den aufgenommenen Personen: i. d. R. **Art. 6 (1) b** (Vertrag) oder **Art. 6 (1) f** (berechtigtes Interesse) — bei Aufnahmen Dritter muss der Kunde die Einwilligung/Information der Gesprächsteilnehmer sicherstellen. Das ist Pflicht des Kunden; wir weisen darauf in Onboarding/AGB hin.
- **Besondere Kategorien (Art. 9):** wenn Gesprächsinhalt Gesundheit, etc. enthält (Arzt/Anwalt) → erhöhtes Schutzniveau, EU-only-Modus + AVV mit erweiterten TOMs nötig.
- **Diarization/Voiceprint:** wenn zur **Identifikation** genutzt → biometrische Daten (Art. 9), explizite Einwilligung nötig. Unsere Diarization trennt nur Sprecher innerhalb eines Jobs ("Speaker 1/2"), erzeugt **keinen** persistenten Identifikator über Jobs hinweg → Risiko reduziert, muss aber dokumentiert + technisch garantiert bleiben.

---

## 3. Vendor-DPAs (Sub-Prozessoren)

**Regel (AEVUM-HARD):** Sub-Prozessoren nur listen, wenn im Code tatsächlich aktiv genutzt. Liste pro Modus pflegen.

| Vendor | Rolle | DPA verfügbar | EU-Hosting | Anmerkung |
|---|---|---|---|---|
| Supabase | DB/Auth/Storage | ja | EU-Region wählbar (eu-central) | Region beim Setup fixieren |
| Deepgram | STT managed | DPA + SOC2; prüfe EU-Region/Datenlokation | US-Anbieter → ggf. Drittland | nur Default-Modus; SCCs prüfen |
| AssemblyAI | STT managed (Alt) | DPA verfügbar | US | nur wenn aktiviert |
| Anthropic/OpenAI | Summary-LLM | DPA; no-training-on-API-data prüfen | US | im EU-Modus durch EU-LLM ersetzt |
| Stripe | Billing | DPA (Standard) | global | keine Audio-/Transkriptdaten an Stripe |
| Hetzner/Scaleway | EU-GPU/Storage (EU-Modus) | AVV (DE/EU) | EU | bevorzugt für Compliance-Tier |

**Drittland-Transfer:** Im Default-Modus gehen Daten an US-Engines (Deepgram/AssemblyAI) → SCCs + Transfer-Impact-Assessment nötig. **EU-only-Processing-Modus eliminiert das vollständig** (kein US-Sub-Prozessor) — deshalb als Premium-Tier auch rechtlich sauberstes Angebot. Vor Vendor-Erwähnung in AGB/AVV: tatsächliche Datenlokation jedes Vendors verifizieren.

---

## 4. EU-AI-Act-Einordnung

Volle Anwendbarkeit ab **2. August 2026**; Transparenzpflichten ab 08/2026.

- **Reine Speech-to-Text-Transkription** = i. d. R. **Limited Risk** → Transparenzpflichten (Nutzer muss wissen, dass KI verarbeitet) reichen.
- **Achtung Biometrie-Schwelle:** Es gibt die ernstzunehmende Lesart, dass **Transkripte/Diarization als biometrische Daten** im Sinne des AI Act gelten können (breiter als GDPR). Speaker-Recognition erzeugt "Voiceprints" = geschützte biometrische Identifikatoren → bei **Identifikation** wird das **High-Risk** und braucht dokumentiertes Opt-in.
- **Verboten:** Emotionserkennung am Arbeitsplatz/Bildung auf Basis biometrischer Daten; biometrische Identifikation in öffentlichen Räumen (eng begrenzte Ausnahmen). → Wir bauen **keine** Emotions-/Identifikations-Features.
- **Unsere Linie:** Diarization bleibt sprecher-trennend, nicht sprecher-identifizierend; keine Voiceprint-Persistenz; keine Emotionsanalyse. Dadurch im **Limited-Risk-Korridor**. Transparenz-Hinweis im Produkt + AGB. Bei Feature-Erweiterung (z. B. Sprecher-Wiedererkennung über Sessions) → neu als High-Risk bewerten, DSFA aktualisieren.

---

## 5. Technische & Organisatorische Maßnahmen (TOMs)

- TLS überall, Verschlüsselung at-rest (Storage + DB).
- RLS auf allen Tabellen, account-gebunden, kein Cross-Account-Read.
- Presigned, kurzlebige Upload-/Download-URLs.
- Auto-Löschung Originalaudio + konfigurierbare Retention für Transkripte.
- Hard-Delete-Endpoint (`DELETE /api/transcripts/:id`) für Art.-17-Löschanspruch.
- Audit-Log (`usage_events`) für Verarbeitungsnachweis.
- Keine Keys im Code/Chat — Lennox-Keys in `~/.claude/.env`, Customer-Keys verschlüsselt (AES-256) in Supabase (AEVUM Data-Separation-Rule).
- Share-Links: Token mit hoher Entropie, Passwortschutz, Ablaufdatum.
- Professionelle Error-Anzeige — keine Raw-API-Errors an den User.

---

## 6. Risiken (ehrlich benannt)

| Risiko | Schwere | Mitigation |
|---|---|---|
| Drittland-Transfer im Default-Modus (US-Engines) | hoch | EU-only-Modus als Default für Compliance-Kunden; SCCs + TIA für Rest |
| Transkript/Diarization als Biometrie (AI-Act-Lesart) | mittel-hoch | keine Identifikation/Voiceprint-Persistenz, Limited-Risk halten, dokumentieren |
| Inhalt = besondere Kategorien (Arzt/Anwalt) | hoch | EU-Modus + erweiterte TOMs + DSFA, Tier gating |
| Kunde holt keine Einwilligung der Aufgenommenen | mittel | klare Pflichtenhinweise im Onboarding/AGB; Verantwortung beim Kunden |
| Vendor ändert Datenlokation/Training-Policy | mittel | regelmäßiges Vendor-Review, no-training-Flag prüfen |
| Accuracy-Fehler in rechtlich relevantem Transkript | mittel | Erwartungsmanagement, "Entwurf, bitte prüfen"-Hinweis, Editor zur Korrektur |

---

## Sources

- EU Commission — AI Act regulatory framework: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- BLUESKEYE AI — Transcripts as biometric data under EU AI Act: https://www.blueskeye.com/blogs/hot-take-transcripts-are-biometric-data-according-to-the-eu-ai-act
- IAPP — Biometrics in the EU (GDPR + AI Act): https://iapp.org/news/a/biometrics-in-the-eu-navigating-the-gdpr-ai-act
- UMEVO — GDPR & AI Voice Recorders (voiceprints, Art. 35 DSFA): https://www.umevo.ai/blogs/ume-all-posts/gdpr-and-ai-voice-recorders-what-european-teams-must-know-before-recording
- Speechmatics — Voice AI Compliance Guide 2026: https://www.speechmatics.com/company/articles-and-news/your-essential-guide-to-voice-ai-compliance-in-todays-digital-landscape
- Resemble.ai — EU AI Act for GenAI 2026 (Limited Risk / Art. 50): https://www.resemble.ai/resources/the-eu-ai-act-what-generative-ai-companies-need-to-know-in-2026
