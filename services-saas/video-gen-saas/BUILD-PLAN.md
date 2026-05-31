# BUILD-PLAN — Video-Generation-SaaS

Workblöcke mit inhaltlichen Sub-Tasks. Keine Zeitangaben. Reihenfolge = MVP-Pfad: zuerst die **eine** funktionierende Render-Kette E2E, dann Monetarisierung, dann Polish, dann Phase-2.

---

## WB-0 — Foundation
- [ ] Repo + Next.js (App Router) + Tailwind + shadcn/ui Skeleton
- [ ] Supabase-Projekt (EU-Region), Schema-Migrationen: `workspaces`, `members`, `projects`, `scenes`, `jobs`, `renders`, `brand_kits`, `credit_ledger`, `provider_costs`
- [ ] RLS-Policies auf `workspace_id` (Mandanten-Isolation) + Tests
- [ ] Supabase Auth (Email + OAuth), Workspace-Onboarding-Flow
- [ ] Separater Worker-Host + BullMQ + Redis (Upstash) angebunden
- [ ] `.env`-Konvention, Provider-Keys nur server-side (HARD: keine Keys im Client)

## WB-1 — Provider-Adapter-Layer (Herzstück, model-agnostisch)
- [ ] Adapter-Interface: `ScriptProvider`, `TTSProvider`, `VisualProvider`, `ComposeProvider`
- [ ] Implementieren MVP-Default: Claude (Script), ElevenLabs (TTS), Kling **oder** HeyGen (Visual), Creatomate (Compose)
- [ ] Cost-Estimator pro Adapter (sec/char/min → Credits)
- [ ] Sandbox/Mock-Modus jedes Adapters für Tests ohne Realkosten

## WB-2 — Render-Pipeline (E2E, das verkaufbare Kernerlebnis)
- [ ] BullMQ-Job `render_pipeline` mit Stages: Script → Voiceover → Visual → Compose → Marking
- [ ] Jede Stage idempotent, Status + Asset-URLs in `scenes`/`jobs` persistiert, retry-fähig
- [ ] Provider-Callbacks/Polling (HeyGen/Render async) sauber verarbeitet
- [ ] **AI-Marking-Stage**: C2PA-Metadaten + sichtbares Label (EU AI Act Art. 50) — nicht optional
- [ ] Final-MP4 → Supabase Storage, signed URL mit TTL
- [ ] ⚠️ MVP-Gate: **eine** Render-Variante (z.B. Voiceover+B-Roll) komplett E2E verified, bevor zweite Variante (Avatar)

## WB-3 — Studio-UI (User-Flow)
- [ ] Projekt-Editor: Stichworte → Script-Gen → Scene-Liste editierbar (Text, B-Roll-Prompt, Voice, Format)
- [ ] Brand-Kit-Editor (Logo, Farben, Font, Intro/Outro, Caption-Style)
- [ ] Format-Presets 9:16 / 16:9 / 1:1
- [ ] Render-Button → Job-Progress (SSE/Polling, Stage-Anzeige), Fehler professionell (kein Raw-API-Error)
- [ ] Preview-Player + Download + Share-Link + Render-History

## WB-4 — Billing & Credits (Monetarisierung)
- [ ] Stripe Checkout (Tiers Starter/Creator/Pro/Agency) + Customer Portal
- [ ] Credit-Wallet + `credit_ledger`, Pre-Flight-Hold vor Render, finale Abbuchung nach realem Verbrauch
- [ ] Stripe-Webhooks → Credit-Gutschrift; Top-up-Pakete
- [ ] Hard-Caps pro Workspace/Tag (Margen-/Runaway-Schutz)
- [ ] Free-Trial-Logik (3 Videos, Watermark, keine Karte)

## WB-5 — Compliance & Launch-Härtung (vor GA)
- [ ] AVV/DPA-Texte + Sub-Prozessor-Liste (nur real genutzte Vendor), SCC-Hinweise
- [ ] EU-only-Modus pro Workspace (Kling opt-in, Veo/Runway default für strenge Kunden)
- [ ] Betroffenenrechte self-serve (Export/Löschung kaskadierend)
- [ ] AUP/ToS (Consent-Pflicht, keine Promis/Marken, Rechte-Bestätigung)
- [ ] Security-Pass: RLS-Pen-Test, signed-URL-TTL, Rate-Limits, Sentry, strukturierte Logs
- [ ] Landing-Page + Demo-Video (mit dem Tool selbst erstellt = Dogfood-Proof)

---

## Was zuerst (MVP-Cut)
**WB-0 → WB-1 → WB-2 (eine Render-Variante E2E) → WB-3 → WB-4 → WB-5.**
Ziel MVP-Launch: User gibt Stichworte ein → bekommt **ein** fertiges, gebrandetes, Art.-50-markiertes MP4, bezahlt per Stripe-Credits. Alles andere ist Phase 2.

---

## Phase 2 (nach Launch, nach erstem Cashflow)
- [ ] Avatar als zweite Visual-Variante (HeyGen voll)
- [ ] Voice/Video-Translation (1 Script → N Sprachen, Lip-Sync)
- [ ] Bulk/Batch (CSV → N Videos)
- [ ] Avatar-/Voice-Cloning mit Consent-Gate + Consent-Upload
- [ ] Public-API + API-Keys + Make/Zapier-Integration
- [ ] Premium-Modelle (Veo 3.1 4K) im Pro/Agency-Tier
- [ ] Template-Marketplace (Branchen-Vorlagen)
- [ ] Team-Rollen + Approval-Flow (Agentur)
