-- AEVUM Shop Analytics — track page-views, funnel, device, attribution
-- Created: 2026-05-24
-- Project: iwyzbiufmdnwmddjkevf (AEVUM Supabase)
--
-- Fire-and-forget tracking from apps/web. Public-write via service_role only
-- (frontend hits backend, backend writes). RLS denies all direct access.

CREATE TABLE IF NOT EXISTS public.shop_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Anon session-id from browser localStorage (UUID v4 from client)
  session_id      TEXT        NOT NULL,

  -- Event kind. Open enum so we can add later without migration.
  event_type      TEXT        NOT NULL
                              CHECK (event_type IN (
                                'page_view',
                                'checkout_start',
                                'checkout_complete',
                                'checkout_abandon',
                                'addtocart',
                                'shop_open',
                                'audit_start',
                                'audit_submit'
                              )),

  -- Page context
  path            TEXT,
  referrer        TEXT,

  -- Attribution
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,

  -- Device classification (client-side)
  device_type     TEXT        CHECK (device_type IN ('mobile','tablet','desktop') OR device_type IS NULL),
  country         TEXT,                                  -- CF-IPCountry header if available

  -- Commerce context (optional, populated on checkout_*)
  package_tier    TEXT,                                  -- 'S' | 'M' | 'L' | blueprint-slug
  value_cents     INTEGER,

  -- Privacy
  ip_anonymized   TEXT,                                  -- /24 or /64 — never raw IP

  -- Free-form context payload
  meta            JSONB       DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS shop_events_created_idx   ON public.shop_events (created_at DESC);
CREATE INDEX IF NOT EXISTS shop_events_session_idx   ON public.shop_events (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS shop_events_type_idx      ON public.shop_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS shop_events_tier_idx      ON public.shop_events (package_tier) WHERE package_tier IS NOT NULL;

ALTER TABLE public.shop_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service-role only" ON public.shop_events;
CREATE POLICY "service-role only" ON public.shop_events FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE public.shop_events IS 'Shopify-style funnel + traffic events for aevum-system.de — anonymized, fire-and-forget';

-- ─── Daily funnel rollup view ─────────────────────────────────────
-- Used by dashboard to render funnel chart without aggregation in app.
DROP VIEW IF EXISTS public.shop_funnel_daily;
CREATE VIEW public.shop_funnel_daily AS
  SELECT
    date_trunc('day', created_at)::date AS day,
    event_type,
    count(*)                            AS events,
    count(DISTINCT session_id)          AS sessions
  FROM public.shop_events
  GROUP BY 1, 2
  ORDER BY 1 DESC, 2 ASC;
