-- AEVUM Stripe Shop — orders table
-- Created: 2026-05-20
-- Project: iwyzbiufmdnwmddjkevf (AEVUM Supabase)
--
-- Captures every Stripe Checkout Session for AEVUM packages and add-ons.
-- Webhook from Stripe drives status transitions.

CREATE TABLE IF NOT EXISTS public.orders (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Stripe identifiers
  stripe_session_id       TEXT        UNIQUE,
  stripe_payment_intent   TEXT,
  stripe_customer_id      TEXT,

  -- Customer-facing
  customer_email          TEXT        NOT NULL,
  customer_name           TEXT,
  customer_company        TEXT,

  -- Order contents (snapshot — we do not rely on Stripe metadata at read time)
  package_tier            TEXT        NOT NULL CHECK (package_tier IN ('S','M','L','custom')),
  package_name            TEXT,
  base_price_cents        INTEGER     NOT NULL,
  recurring_price_cents   INTEGER,
  recurring_interval      TEXT        CHECK (recurring_interval IN ('month','year') OR recurring_interval IS NULL),

  -- Add-ons + bundle
  addons                  JSONB       DEFAULT '[]'::JSONB,
  bundle_discount_percent INTEGER     DEFAULT 0,

  -- Pilot programm
  pilot_discount_applied  BOOLEAN     NOT NULL DEFAULT FALSE,
  pilot_discount_percent  INTEGER     DEFAULT 0,
  pilot_slot_number       INTEGER,

  -- Totals (after all discounts)
  subtotal_cents          INTEGER     NOT NULL,
  total_cents             INTEGER     NOT NULL,
  currency                TEXT        NOT NULL DEFAULT 'eur',

  -- Workflow state
  status                  TEXT        NOT NULL DEFAULT 'pending'
                                      CHECK (status IN ('pending','paid','failed','refunded','cancelled')),
  paid_at                 TIMESTAMPTZ,

  -- Audit
  ip                      TEXT,
  user_agent              TEXT,
  metadata                JSONB       DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS orders_status_idx     ON public.orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_email_idx      ON public.orders (customer_email);
CREATE INDEX IF NOT EXISTS orders_session_idx    ON public.orders (stripe_session_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- No public role can read or write. Only service_role (via Stripe webhook + admin).
CREATE POLICY "service-role only" ON public.orders FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE public.orders IS 'AEVUM Stripe shop orders — pilot-program pricing tracked separately';

-- ─── pilot_slots counter (singleton) ─────────────────────────────
-- Tracks how many pilot-discount slots are taken.
-- Total cap from public.dsgvo_settings or hardcoded fallback 10.
CREATE TABLE IF NOT EXISTS public.pilot_slots (
  id              INT         PRIMARY KEY DEFAULT 1,
  total_slots     INTEGER     NOT NULL DEFAULT 10,
  slots_taken     INTEGER     NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pilot_slots_singleton CHECK (id = 1)
);

INSERT INTO public.pilot_slots (id, total_slots, slots_taken)
  VALUES (1, 10, 0)
  ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.pilot_slots ENABLE ROW LEVEL SECURITY;

-- Read public (so frontend can show "X/10 Plätze frei")
CREATE POLICY "anyone can read pilot slots" ON public.pilot_slots
  FOR SELECT USING (true);

COMMENT ON TABLE public.pilot_slots IS 'Counter for the pilot programm — slots taken transparently visible to visitors';

-- ─── Trigger: increment pilot_slots when an order is marked paid with pilot discount ───
CREATE OR REPLACE FUNCTION public.increment_pilot_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid'
     AND (OLD IS NULL OR OLD.status <> 'paid')
     AND NEW.pilot_discount_applied = TRUE THEN
    UPDATE public.pilot_slots
      SET slots_taken = slots_taken + 1,
          updated_at = now()
      WHERE id = 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_increment_pilot_slots ON public.orders;
CREATE TRIGGER orders_increment_pilot_slots
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.increment_pilot_slots();
