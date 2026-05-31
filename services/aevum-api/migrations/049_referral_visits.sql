-- 049_referral_visits.sql
-- Reflink-Klick-/Journey-Tracking für das Website-Referral-System.
-- Externe bekommen einen Ref-Link (api.../r/CODE → Site ?ref=CODE). Jeder Klick + jede
-- Pageview wird hier getrackt (anonymisierte IP) → Attribution: Klicks → Leads → Abschlüsse.
-- Account-scoped über referral_codes → referral_programs → projects. Migration 046/048 vorausgesetzt.

-- ─── 1) Besuche/Klicks pro Ref-Code (Zeitreihe) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.referral_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  code TEXT,                                  -- denormalisiert (falls Code-Row gelöscht/unbekannt)
  kind TEXT NOT NULL DEFAULT 'click' CHECK (kind IN ('click','pageview')),
  path TEXT,                                  -- besuchte Seite (Journey)
  ip_hash TEXT,                               -- SHA256(ip+salt), DSGVO-konform anonymisiert
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_referral_visits_code ON public.referral_visits(code_id);
CREATE INDEX IF NOT EXISTS idx_referral_visits_created ON public.referral_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_referral_visits_kind ON public.referral_visits(code_id, kind);
ALTER TABLE public.referral_visits ENABLE ROW LEVEL SECURITY;

-- ─── 2) Klick-Zähler auf referral_codes (denormalisiert, schnelle Stats) ──
ALTER TABLE public.referral_codes
  ADD COLUMN IF NOT EXISTS click_count INT NOT NULL DEFAULT 0;
