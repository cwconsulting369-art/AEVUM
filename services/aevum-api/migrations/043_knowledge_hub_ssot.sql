-- 043_knowledge_hub_ssot.sql
-- Block F1 — Knowledge-Hub SSOT (internal-only)
-- Created: 2026-05-25
--
-- Purpose:
--   Internal SSOT für strategische Knowledge (Baulig, Salinsky, Knightvision, Mario-Pitch-Patterns).
--   Dient als Inspirations-Layer für AEVUM-Output, NIEMALS als Direkt-Quote/1:1-Pattern an Customer.
--   sanitization-Layer (siehe lib/knowledge-sanitize.js) verhindert dass raw_excerpt direkt
--   in Customer-LLM-Prompts oder Outputs landet.
--
-- Tables sind admin-only (service-role) — NIE public-read.

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id            bigserial PRIMARY KEY,
  slug          text UNIQUE NOT NULL,
  name          text NOT NULL,
  source_type   text NOT NULL CHECK (source_type IN ('coach','agency','platform','playbook','case-study')),
  domain        text,
  description   text,
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_entries (
  id              bigserial PRIMARY KEY,
  source_id       bigint REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  topic           text NOT NULL,
  raw_excerpt     text NOT NULL,
  sanitized_takeaway text,
  category        text,
  tags            text[] DEFAULT '{}'::text[],
  internal_notes  text,
  customer_use    text CHECK (customer_use IN ('never','inspiration-only','meta-pattern','blocked')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_entries_source   ON knowledge_entries(source_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_category ON knowledge_entries(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_use      ON knowledge_entries(customer_use);

-- RLS: admin/service-role only. Public has NO access.
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_sources" ON knowledge_sources;
CREATE POLICY "service_role_all_sources"
  ON knowledge_sources FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_entries" ON knowledge_entries;
CREATE POLICY "service_role_all_entries"
  ON knowledge_entries FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Trigger: auto-bump updated_at on entries
CREATE OR REPLACE FUNCTION touch_knowledge_entries_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_knowledge_entries_touch ON knowledge_entries;
CREATE TRIGGER trg_knowledge_entries_touch
  BEFORE UPDATE ON knowledge_entries
  FOR EACH ROW EXECUTE FUNCTION touch_knowledge_entries_updated_at();

COMMENT ON TABLE knowledge_sources IS
  'Block F1 (2026-05-25) — Internal SSOT for strategic knowledge sources. NEVER public-facing.';
COMMENT ON TABLE knowledge_entries IS
  'Block F1 (2026-05-25) — Knowledge entries. raw_excerpt = INTERNAL. Use lib/knowledge-sanitize.js before any customer-facing use.';
COMMENT ON COLUMN knowledge_entries.customer_use IS
  'never|blocked = NEVER use in customer output. inspiration-only = use sanitized_takeaway only. meta-pattern = abstract patterns OK after sanitization.';

-- Seed-Data: 2 sources + 6 abstract example entries
INSERT INTO knowledge_sources (slug, name, source_type, domain, description) VALUES
  ('aevum-internal-patterns', 'AEVUM Internal Patterns', 'playbook', NULL,
   'Eigene abstrakte Sales/Marketing/Ops-Patterns aus Carlos-Pitches und AEVUM-Operations.'),
  ('public-coaching-meta', 'Public Coaching Meta-Patterns', 'playbook', NULL,
   'Anonymisierte Meta-Patterns aus öffentlich beobachteten Coaching-Modellen. Keine 1:1-Inhalte. Inspirations-Bibliothek.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO knowledge_entries
  (source_id, topic, raw_excerpt, sanitized_takeaway, category, tags, internal_notes, customer_use)
SELECT s.id, e.topic, e.raw_excerpt, e.sanitized_takeaway, e.category, e.tags, e.internal_notes, e.customer_use
FROM knowledge_sources s
CROSS JOIN LATERAL (VALUES
  ('Sales-Call Struktur',
   'Discovery → Pain → Vision → Value → Ask. Lange Discovery (40%), kurzer Ask (5%).',
   'Strukturiere Sales-Calls so dass der Großteil der Zeit für Verständnis des Kunden-Kontexts verwendet wird und nur ein kleiner Teil für den konkreten Abschluss.',
   'sales', ARRAY['call','structure','discovery'],
   'Funktioniert in DACH gut weil Kunde sich gehört fühlt vor Pitch.',
   'meta-pattern'),
  ('Cold-Outreach Hook-Pattern',
   'Anchor (spezifischer Beobachtung beim Prospect) → Insight (was wir daraus folgern) → Soft-CTA (kurze Frage statt Pitch).',
   'Kalt-Akquise wird wirksamer wenn die Nachricht mit einer spezifischen Beobachtung beim Empfänger startet, einer kurzen Folgerung und einer offenen Frage endet — statt mit einem direkten Verkaufs-Pitch.',
   'marketing', ARRAY['outreach','linkedin','cold-email'],
   'Gut für LinkedIn-DM und Cold-Email. Specificity beats volume.',
   'meta-pattern'),
  ('Pricing-Tier-Anchoring',
   'High-Tier als Anchor (€10k+), Mid-Tier als gewünschter Target (€3-5k), Low-Tier als Decoy (€500).',
   'Pricing-Pages mit 3 Tiers wirken besser wenn die Tiers psychologisch gestaffelt sind — eine hohe Vergleichsbasis, ein attraktives Mittelfeld und ein bewusst unattraktiver Einstieg.',
   'pricing', ARRAY['anchoring','tiers','psychology'],
   'AEVUM-Shop nutzt das implizit — DFY=High, Audit=Mid, Blueprint=Low.',
   'meta-pattern'),
  ('Webinar-to-Close Sequenz',
   'Lead-Magnet → Webinar/Demo → 1:1-Strategie-Call → Angebot → 24h-Verknappung.',
   'Eine mehrstufige Sequenz mit Bildungs-Phase vor dem Verkaufs-Gespräch erhöht Abschluss-Quoten — speziell bei beratungsintensiven Produkten.',
   'sales', ARRAY['funnel','sequence','webinar'],
   'Klassische Coaching-Funnel-Logik. Für AEVUM eher Lead-Magnet → Audit → Pflicht-Call.',
   'inspiration-only'),
  ('Founder-Brand Trust-Pattern',
   'Persönliche Story + Vulnerabilität + spezifische Zahlen + wiederholbarer Daily-Output.',
   'Founder-Brands gewinnen Vertrauen durch eine Mischung aus persönlichen Anekdoten, konkreten messbaren Ergebnissen und konsistentem Content-Output über lange Zeiträume.',
   'positioning', ARRAY['founder-brand','content','trust'],
   'Carlos hat das via LinkedIn-Tagebuch-Posts. Wichtig: nicht aspirational, sondern echte Zahlen.',
   'inspiration-only'),
  ('Service-Productization-Pyramid',
   'Service (custom, high-touch) → Productized-Service (standard scope, mid-touch) → Product (self-serve, low-touch).',
   'Skalierung im Dienstleistungs-Geschäft erfolgt typischerweise in drei Stufen — von individuellem Service über standardisierte Service-Pakete bis hin zu Self-Service-Produkten.',
   'positioning', ARRAY['productization','scaling','service-business'],
   'AEVUM Roadmap V1=Service, V2=Blueprint-Shop, V3=Self-Serve-SaaS spiegelt das.',
   'meta-pattern')
) AS e(topic, raw_excerpt, sanitized_takeaway, category, tags, internal_notes, customer_use)
WHERE s.slug = 'public-coaching-meta'
ON CONFLICT DO NOTHING;
