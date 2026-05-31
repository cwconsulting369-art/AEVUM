-- 046_content_funnel.sql
-- Content/Social-Funnel-Fundament (dashboard-agnostisch).
-- Kanäle (Facebook/LinkedIn als getrennte Bereiche), Content-Pieces, ECHTE Metriken
-- (per Cron aus FB/LinkedIn-API), + Lead-Attribution (welches Piece brachte den Lead).
-- Account-scoped (patrick-roth + künftige Customer). Das (neue) Dashboard liest das nur.

-- ─── 1) Kanäle pro Account = die getrennten Funnel-Bereiche ───────────────
CREATE TABLE IF NOT EXISTS public.content_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook','linkedin','instagram','other')),
  display_name TEXT,
  external_id TEXT,                 -- FB Page-ID / LinkedIn-URN
  connected BOOLEAN DEFAULT false,  -- API-Verbindung aktiv?
  enabled BOOLEAN DEFAULT true,     -- Kanal an/aus (Patrick steuerbar)
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (account_id, platform)
);
CREATE INDEX IF NOT EXISTS idx_content_channels_account ON public.content_channels(account_id);

-- ─── 2) Content-Pieces (jedes Stück, Idee → Live) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.content_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook','linkedin','instagram','other')),
  kind TEXT DEFAULT 'post' CHECK (kind IN ('post','article','story','reel','carousel')),
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea','draft','approved','scheduled','published','archived')),
  segment TEXT CHECK (segment IN ('auswanderer','investor','beides')),  -- Zielsegment
  topic TEXT,
  title TEXT,
  body TEXT,
  visual_url TEXT,
  utm_campaign TEXT,                -- = utm_content auf der Site → Lead-Attribution
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  external_post_id TEXT,            -- FB/LinkedIn Post-ID (für Metrik-Pull)
  source_ref TEXT,                 -- Quelle (Blog-Artikel etc.) → "nichts doppelt"
  created_by TEXT DEFAULT 'agent', -- agent | patrick | lennox
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_content_pieces_account ON public.content_pieces(account_id);
CREATE INDEX IF NOT EXISTS idx_content_pieces_status ON public.content_pieces(account_id, status);
CREATE INDEX IF NOT EXISTS idx_content_pieces_platform ON public.content_pieces(account_id, platform);
CREATE INDEX IF NOT EXISTS idx_content_pieces_utm ON public.content_pieces(utm_campaign);

-- ─── 3) Echte Metriken (Zeitreihe pro Piece, aus FB/LinkedIn-API) ─────────
CREATE TABLE IF NOT EXISTS public.content_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_piece_id UUID NOT NULL REFERENCES public.content_pieces(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ DEFAULT now(),
  impressions INTEGER,
  reach INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  clicks INTEGER,
  link_clicks INTEGER,
  raw JSONB DEFAULT '{}',           -- voller API-Response (Audit)
  UNIQUE (content_piece_id, captured_at)
);
CREATE INDEX IF NOT EXISTS idx_content_metrics_piece ON public.content_metrics(content_piece_id);

-- ─── 4) Lead-Attribution: welches Content-Piece brachte den Lead ──────────
ALTER TABLE public.customer_leads
  ADD COLUMN IF NOT EXISTS attributed_content_id UUID REFERENCES public.content_pieces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
CREATE INDEX IF NOT EXISTS idx_leads_attributed_content ON public.customer_leads(attributed_content_id);

-- ─── 5) Patricks 2 Kanäle seeden (FB + LinkedIn), noch nicht verbunden ────
INSERT INTO public.content_channels (account_id, platform, display_name, connected, enabled)
SELECT a.id, c.platform, c.dn, false, true
FROM public.accounts a
CROSS JOIN (VALUES ('facebook','Facebook-Seite'), ('linkedin','LinkedIn (Patrick)')) AS c(platform, dn)
WHERE a.slug = 'patrick-roth'
ON CONFLICT (account_id, platform) DO NOTHING;
