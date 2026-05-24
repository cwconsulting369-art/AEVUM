-- 039_trustpilot_reviews.sql
-- Wave I — Final. Cache-Tabelle für Trustpilot-Reviews (synced from Trustpilot API later)
-- Public-read (für Website-Widget-Fallback wenn Trustpilot-CDN down), service-role-write

CREATE TABLE IF NOT EXISTS trustpilot_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trustpilot_review_id TEXT UNIQUE,
  author_name TEXT,
  star_rating INT CHECK (star_rating BETWEEN 1 AND 5),
  text TEXT,
  language TEXT DEFAULT 'de',
  created_ts TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT true,
  synced_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trustpilot_stars
  ON trustpilot_reviews(star_rating DESC, created_ts DESC);

CREATE INDEX IF NOT EXISTS idx_trustpilot_published
  ON trustpilot_reviews(is_published, created_ts DESC)
  WHERE is_published = true;

ALTER TABLE trustpilot_reviews ENABLE ROW LEVEL SECURITY;

-- Public-read: nur published reviews
DROP POLICY IF EXISTS "public_read_published_reviews" ON trustpilot_reviews;
CREATE POLICY "public_read_published_reviews"
  ON trustpilot_reviews FOR SELECT
  USING (is_published = true);

-- Service-role: full access (sync-cron, admin)
DROP POLICY IF EXISTS "service_role_all" ON trustpilot_reviews;
CREATE POLICY "service_role_all"
  ON trustpilot_reviews FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE trustpilot_reviews IS
  'Wave-I-Final 2026-05-24 — Cache für Trustpilot-API Calls. Lokale Fallback-Source wenn Widget-CDN down. Sync via Cron (TBD).';
