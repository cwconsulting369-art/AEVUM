-- AEVUM — shop_products: EINZIGE Wahrheit für verkaufbaren Shop-Content (Carlos 2026-05-31)
-- Project: iwyzbiufmdnwmddjkevf
--
-- Zweck / Hintergrund:
--   Der Shop renderte bisher aus einer STATISCHEN, handkuratierten Registry
--   (apps/web/src/data/shop-items/index.ts). Der autonome Produkt-Erfinder-Loop
--   schrieb erfundene Produkte aber nur nach blueprints/<slug>/ (git) + in die
--   reine Build-Status-Tabelle shop_item_build_status. Ergebnis: 11/14 erfundene
--   Produkte waren im echten Shop NIE sichtbar (Scheintechnik-Falle) + slug-Drift.
--
--   shop_products wird die EINE Source of Truth für verkaufbaren Content. Der Shop
--   rendert dynamisch daraus. shop_item_build_status bleibt für Build-Artefakte
--   (gate_passed, n8n_export_url, pdf_url) und wird per slug gejoint.
--
-- Anti-Scheintechnik-Defaults (HARD):
--   * is_active DEFAULT false  → ein Produkt erscheint erst NACH expliziter Aktivierung
--   * stripe_price_verified DEFAULT false → kaufbar nur wenn echte Stripe-Price real existiert
--   * erfundene Produkte landen mit is_active=false/coming_soon=true → ehrlich "in Vorbereitung",
--     niemals als kaputt-kaufbares Produkt.
--
-- Idempotent: ja (CREATE TABLE IF NOT EXISTS + CREATE OR REPLACE).

BEGIN;

CREATE TABLE IF NOT EXISTS public.shop_products (
  slug                  text PRIMARY KEY,
  name                  text NOT NULL,
  type                  text NOT NULL DEFAULT 'blueprint'
                          CHECK (type IN ('blueprint', 'dfy', 'saas', 'bundle')),
  tag                   text,
  price_label           text,
  price                 numeric,
  currency              text NOT NULL DEFAULT 'EUR',

  -- Stripe — kaufbar NUR wenn stripe_price_id real existiert + verifiziert
  stripe_price_id       text,
  stripe_price_verified boolean NOT NULL DEFAULT false,
  stripe_verified_at    timestamptz,

  security_level        text DEFAULT 'business'
                          CHECK (security_level IN ('basic', 'business', 'dsgvo')),
  icp                   text[] NOT NULL DEFAULT '{}',
  category              text,

  -- Quality-Gate-Content (8 Pflicht-Sektionen, spiegelt ShopItemContent)
  tagline               text,
  what_is_it            text,
  outcomes              jsonb NOT NULL DEFAULT '[]'::jsonb,   -- string[]
  when_it_fits          jsonb NOT NULL DEFAULT '{}'::jsonb,   -- {fits:[],requires:[]}
  includes              jsonb NOT NULL DEFAULT '[]'::jsonb,   -- string[]
  pricing_note          text,
  security_note         text,
  faq                   jsonb NOT NULL DEFAULT '[]'::jsonb,   -- {q,a}[]
  demo_video_url        text,
  cross_sell            text,
  en                    jsonb,                                -- EN-Overlay (ShopItemEN)

  -- Lifecycle
  coming_soon           boolean NOT NULL DEFAULT false,
  coming_soon_phase     text,
  is_active             boolean NOT NULL DEFAULT false,       -- SICHERHEITS-DEFAULT
  source                text NOT NULL DEFAULT 'manual'
                          CHECK (source IN ('static-seed', 'product-inventor-loop', 'manual')),

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- updated_at automatisch pflegen
CREATE OR REPLACE FUNCTION public.shop_products_touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_shop_products_touch ON public.shop_products;
CREATE TRIGGER trg_shop_products_touch
  BEFORE UPDATE ON public.shop_products
  FOR EACH ROW EXECUTE FUNCTION public.shop_products_touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_shop_products_active   ON public.shop_products (is_active);
CREATE INDEX IF NOT EXISTS idx_shop_products_type     ON public.shop_products (type);
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON public.shop_products (category);

-- RLS: public read NUR aktiver Produkte; Schreiben nur service_role.
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shop_products_public_read ON public.shop_products;
CREATE POLICY shop_products_public_read
  ON public.shop_products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- service_role umgeht RLS automatisch (Seed/Loop/API-Backend nutzen Service-Key).

COMMIT;
