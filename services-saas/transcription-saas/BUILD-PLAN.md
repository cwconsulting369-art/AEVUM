# BUILD-PLAN — Transcription-SaaS

Bauplan in Workblöcken. Sub-Tasks inhaltlich beschrieben, keine Zeitangaben (Mannstunden-Logik invalide bei AI-Build). Reihenfolge = MVP-first, jeder Block endet funktional verified (E2E + Failure-Modes), nicht nur Happy-Path.

**MVP-Ziel:** Nutzer kann Datei hochladen → Transkript mit Diarization + Summary erhalten → exportieren → bezahlen. Alles self-serve.

---

## Block 0 — Foundation & Provider-Abstraktion
**Zuerst, weil alles drauf aufbaut.**
- Repo + Next.js/TS-Scaffold im AEVUM-Monorepo-Pattern (1 Projekt = 1 Repo, Sub-Folder).
- Supabase-Projekt **EU-Region (eu-central)** anlegen, Auth (Magic-Link + Google OAuth).
- Datenmodell + RLS: `accounts`, `transcription_jobs`, `transcripts`, `segments`, `speakers`, `summaries`, `shares`, `usage_events`.
- `TranscriptionProvider`-Interface definieren (transcribe + diarize), Deepgram-Adapter als erste Impl.
- Env/Key-Handling: Keys in `.env`/Supabase-encrypted, nie inline.
- Verify: Schema-Migration läuft, RLS blockt Cross-Account-Read (Test mit 2 Accounts).

## Block 1 — Upload & Ingest Pipeline
- Presigned-Upload-Endpoint (`/api/uploads/sign`) → EU-Storage, kurzlebige URL.
- Frontend Drag-&-Drop + Datei-Validierung (Format, Größe je Tier).
- `ffmpeg`-Schritt im Worker: Audio aus Video extrahieren, normalisieren, chunken falls nötig (Whisper 25 MB / Lauflängen-Limit beachten).
- Job-Erstellung (`POST /api/jobs`) → Queue-Eintrag, status=queued.
- Verify: 100 MB Video hochladen → Audio extrahiert → Job in DB; Failure-Mode: korrupte Datei → sauberer Error, kein Crash.

## Block 2 — Transkription + Diarization (managed Engine)
**Kern-Wert, kommt früh.**
- Worker zieht Job, ruft Deepgram Nova-3 batch (Diarization on, Word-Timestamps on).
- Ergebnis-Mapping → `transcripts` + `segments` (speaker_label, start/end_ms, text).
- Status-Maschine: queued → processing → done/error, mit error_msg.
- Realtime/Poll Job-Status zum Frontend.
- AssemblyAI-Adapter als zweite Impl (A/B + Fallback bei Deepgram-Ausfall).
- Verify: DE + EN Mehrsprecher-Datei → korrekte Speaker-Trennung + Timestamps; Failure-Mode: Engine-Timeout/429 → Retry + sauberer Fehlerstatus.

## Block 3 — KI-Summary
- Summary-Adapter (Claude/GPT): Transkript → TL;DR + Bullets + Action-Items, strukturiertes JSON.
- Persist in `summaries`, an Transkript hängen.
- Prompt robust gegen lange Transkripte (Chunking/Map-Reduce bei Überlänge).
- Verify: 1 h-Meeting → sinnvolle Action-Items; Failure-Mode: leeres/sehr kurzes Transkript → kein LLM-Halluzinat, graceful skip.

## Block 4 — Editor & Anzeige
- Transkript-View: Segmente nach Speaker, synchronisierter Player↔Text (Klick springt zur Audiostelle).
- Inline-Korrektur (`PATCH`), Speaker umbenennen/mergen.
- Summary-Tab (TL;DR/Bullets/Action-Items).
- Suchen im Transkript.
- Verify: Edit speichert + bleibt nach Reload; Player-Sync klickbar.

## Block 5 — Export
- Export-Service: TXT, DOCX, SRT, VTT (MVP-Set).
- SRT/VTT aus Word-Timestamps korrekt timecoden.
- DOCX mit Speaker-Labels + Timestamps formatiert.
- Verify: SRT lädt fehlerfrei in Video-Player; DOCX öffnet sauber in Word.

## Block 6 — Billing & Self-Serve (cash-kritisch)
- Stripe-Checkout: Credit-Packs (27/67/97 €) + Abos (Solo/Creator/Team).
- Webhook (`/api/webhooks/stripe`) → Credits gutschreiben, Plan setzen.
- Credit-Verbrauch pro Job (`usage_events`), Guard vor Job-Start (genug Credits?).
- Free-Trial 30 Min ohne Karte bei Signup.
- Stripe Customer Portal für Self-Service-Kündigung/Upgrade.
- Verify: Kauf → Credits da → Job verbraucht korrekt; Failure-Mode: Webhook-Doppelzustellung → idempotent (kein Doppel-Gutschreiben).

## Block 7 — DSGVO-Baseline & Sharing
- AVV/DPA-Template im Dashboard download-/signierbar.
- Auto-Löschung Originalaudio (konfigurierbare Frist) + Retention-Setting.
- Hard-Delete-Endpoint (Art. 17) + Audit-Log.
- Share-Link: Token-Entropie + Passwort + Ablauf.
- Transparenz-Hinweis (KI-Verarbeitung) im Produkt + AGB.
- Verify: Delete entfernt alle zugehörigen Rows + Storage-Objekt; Share-Link expired → 403.

## Block 8 — Landing & Conversion-Funnel
- Landing-Page (Visual-First, AEVUM-Stack): Hook + Demo + echtes Beispieltranskript.
- Signup → Free-Trial → Paywall am Wert (Export/Trial-Ende).
- Upgrade-Nudges im Dashboard (Verbrauch sichtbar).
- Verify: voller Funnel Signup→Trial→Upload→Export→Paywall→Kauf klickbar E2E.

---

## MVP-Cut-Line
Blöcke **0–8 = MVP** (verkaufbar, cash-fähig). Alles unten = **Phase-2**, erst nach erster Cash-Validierung.

## Phase-2 Workblöcke (nach MVP)
- **EU-only-Processing:** WhisperX (faster-whisper large-v3) + pyannote.audio 4.0/Community-1 auf EU-GPU (Hetzner/Scaleway), Provider-Adapter, `eu_only`-Flag, Premium-Tier-Gating.
- **URL-Import:** YouTube/Drive/Dropbox-Ingest.
- **Realtime:** Deepgram Flux / AssemblyAI Streaming (WebSocket) Live-Transkription.
- **Mehr Sprachen + Übersetzung**, Auto-Kapitel + Topic/Keyword-Extraktion erweitert.
- **Team-Workspaces + Rollen**, PII-Redaction, Custom-Vocabulary/Keyterm-Prompting.
- **PDF-Branding-Export, Notion/Markdown-Push.**
- **Public-API für Kunden**, Zapier/Make-Integration.

---

## Build-Reihenfolge-Begründung
Diarization+Transkription (Block 2) und Billing (Block 6) sind die zwei Säulen: ohne erstere kein Produkt, ohne letztere kein Cash. Summary (Block 3) ist der Differenzierer, kommt direkt danach. DSGVO-Baseline (Block 7) ist Pflicht vor Go-Live mit echten Kundendaten — kein optionales Nice-to-have. EU-only (Phase-2) ist Compliance-Premium, lohnt erst ab Volumen/Compliance-Nachfrage (Self-host-Break-even ~25–65 h/Mo laut Recherche).

---

## Sources
- WhisperX: https://github.com/m-bain/whisperx
- pyannoteAI Community-1 / OSS-Stand: https://www.pyannote.ai/blog/community-1
- Deepgram Pricing (COGS-Basis): https://deepgram.com/learn/best-speech-to-text-apis-2026
- Self-host Break-even (Picovoice/BrassTranscripts-Daten): https://picovoice.ai/blog/state-of-speaker-diarization/
