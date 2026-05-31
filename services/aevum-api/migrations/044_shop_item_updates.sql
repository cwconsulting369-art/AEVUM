-- AEVUM Shop-Item Update Notifications (Task-Batch 2026-05-25)
-- Tracks Blueprint/DFY-Item versions + notifies past purchasers via Resend
-- on Major-Update (Customer-Claims-Audit: "kostenlose Major-Updates 12 Monate" promise needs mechanism)
--
-- Project: iwyzbiufmdnwmddjkevf (AEVUM)
-- Depends on: 004_orders.sql (orders.package_name carries item_slug), 023_quality_gate.sql

-- ─── shop_items_meta: Lightweight version tracking ─────────────────
-- We do NOT extend shop_item_build_status (separate concern: gate vs version)
-- Singleton-per-slug table for current version + last release notes.
CREATE TABLE IF NOT EXISTS public.shop_items_meta (
  item_slug              TEXT        PRIMARY KEY,
  current_version        TEXT        NOT NULL DEFAULT 'v1.0.0',
  last_update_notes      TEXT,
  last_update_at         TIMESTAMPTZ,
  last_notified_at       TIMESTAMPTZ,
  last_notified_version  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shop_items_meta_updated
  ON public.shop_items_meta(last_update_at DESC);

ALTER TABLE public.shop_items_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service-role only" ON public.shop_items_meta;
CREATE POLICY "service-role only" ON public.shop_items_meta
  FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE public.shop_items_meta
  IS 'Per-slug version tracking for shop items. Drives update-notification cycle.';

-- ─── shop_item_update_log: per-customer update mail audit ──────────
CREATE TABLE IF NOT EXISTS public.shop_item_update_log (
  id                  BIGSERIAL   PRIMARY KEY,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- recipient (denormalized for log durability; account_id optional)
  customer_email      TEXT        NOT NULL,
  account_id          UUID,

  -- payload
  item_slug           TEXT        NOT NULL,
  version             TEXT        NOT NULL,
  release_notes       TEXT,

  -- send-result
  status              TEXT        NOT NULL DEFAULT 'sent'
                                  CHECK (status IN ('sent','bounced','failed','skipped')),
  resend_message_id   TEXT,
  error               TEXT,

  -- correlation
  triggered_by        TEXT        DEFAULT 'admin'
                                  CHECK (triggered_by IN ('admin','auto','cron','n8n'))
);

CREATE INDEX IF NOT EXISTS idx_shop_update_log_slug
  ON public.shop_item_update_log(item_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shop_update_log_email
  ON public.shop_item_update_log(customer_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shop_update_log_account
  ON public.shop_item_update_log(account_id) WHERE account_id IS NOT NULL;

ALTER TABLE public.shop_item_update_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service-role only" ON public.shop_item_update_log;
CREATE POLICY "service-role only" ON public.shop_item_update_log
  FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE public.shop_item_update_log
  IS 'Audit log of update mails sent to past purchasers per shop_item version.';

-- ─── notification_preferences: per-account opt-out ─────────────────
-- Per-account preference. Default: opted-in.
-- Granular: shop_updates only (not transactional / not marketing-newsletter).
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  customer_email             TEXT        PRIMARY KEY,
  shop_updates_enabled       BOOLEAN     NOT NULL DEFAULT TRUE,
  unsubscribe_token          TEXT        UNIQUE,
  unsubscribed_at            TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_prefs_token
  ON public.notification_preferences(unsubscribe_token)
  WHERE unsubscribe_token IS NOT NULL;

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service-role only" ON public.notification_preferences;
CREATE POLICY "service-role only" ON public.notification_preferences
  FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE public.notification_preferences
  IS 'Per-email opt-out tracking for shop-update notifications.';
