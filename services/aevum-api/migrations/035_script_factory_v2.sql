-- AEVUM Script-Factory V2 — Multi-Pipeline + Knowledge-Hubs + Tim-Premium
-- Wave H1 (2026-05-24)
-- Project: iwyzbiufmdnwmddjkevf
--
-- Adds:
--   1. knowledge_hubs + knowledge_documents (SSOT for Bauligs/Salinsky/etc)
--   2. script_factory_runs erweitert (use_case, settings, grading, hook-scoring, differences, tim-customer-link)
--   3. script_factory_outputs erweitert (grade, hook_score, analysis)
--   4. tim_customers (Multi-Tenant inside Tim's subscription)
--   5. script_use_cases catalog (7 use-cases seeded)
--   6. Test-Knowledge-Hubs seeded (bauligs, salinsky, aevum-default + Mock-Frameworks)

BEGIN;

-- ─── 1) Knowledge-Hubs ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  associated_use_cases JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_hubs_owner ON public.knowledge_hubs(owner_account_id);
ALTER TABLE public.knowledge_hubs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID NOT NULL REFERENCES public.knowledge_hubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_url TEXT,
  content_md TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_hub ON public.knowledge_documents(hub_id);
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- ─── 2) script_factory_runs erweitern ────────────────────────────
ALTER TABLE public.script_factory_runs
  ADD COLUMN IF NOT EXISTS use_case TEXT,
  ADD COLUMN IF NOT EXISTS input_script TEXT,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS knowledge_hub_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS grade_before TEXT,
  ADD COLUMN IF NOT EXISTS grade_after TEXT,
  ADD COLUMN IF NOT EXISTS hook_score_before NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS hook_score_after NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS analysis_before JSONB,
  ADD COLUMN IF NOT EXISTS analysis_after JSONB,
  ADD COLUMN IF NOT EXISTS differences JSONB,
  ADD COLUMN IF NOT EXISTS tim_customer_id UUID;

-- V2 macht product_name/hook_goal/platform optional (v1-Runs bleiben unverändert)
ALTER TABLE public.script_factory_runs ALTER COLUMN product_name DROP NOT NULL;
ALTER TABLE public.script_factory_runs ALTER COLUMN hook_goal DROP NOT NULL;
ALTER TABLE public.script_factory_runs ALTER COLUMN platform DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_script_runs_use_case ON public.script_factory_runs(use_case) WHERE use_case IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_script_runs_tim_customer ON public.script_factory_runs(tim_customer_id) WHERE tim_customer_id IS NOT NULL;

-- ─── 3) script_factory_outputs erweitern ─────────────────────────
ALTER TABLE public.script_factory_outputs
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS hook_score NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS analysis JSONB;

-- V2 macht hook/body/cta optional (Phone-Scripts haben andere Felder)
ALTER TABLE public.script_factory_outputs ALTER COLUMN hook DROP NOT NULL;
ALTER TABLE public.script_factory_outputs ALTER COLUMN body DROP NOT NULL;
ALTER TABLE public.script_factory_outputs ALTER COLUMN cta DROP NOT NULL;

-- ─── 4) Tim-Premium Customers ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tim_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tim_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  niche TEXT,
  product_category TEXT,
  ad_platforms JSONB DEFAULT '[]'::jsonb,
  brand_voice TEXT,
  target_icp TEXT,
  awareness_stage TEXT,
  enrichment_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tim_account_id, customer_name)
);
CREATE INDEX IF NOT EXISTS idx_tim_customers_account ON public.tim_customers(tim_account_id);
ALTER TABLE public.tim_customers ENABLE ROW LEVEL SECURITY;

-- ─── 5) Use-Case-Catalog ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.script_use_cases (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  pipeline_id TEXT NOT NULL,
  required_settings JSONB DEFAULT '[]'::jsonb,
  default_hub_slug TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO public.script_use_cases (slug, name, description, pipeline_id, required_settings, default_hub_slug, sort_order) VALUES
('phone-script-cold', 'Telefonskript Cold-Call', 'Outbound-Calling für B2B/B2C-Akquise', 'phone-script', '["niche","icp","awareness"]'::jsonb, 'bauligs', 10),
('phone-script-followup', 'Telefonskript Follow-Up', 'Bestehende Leads, Reaktivierung, Nachfass', 'phone-script', '["niche","icp"]'::jsonb, 'bauligs', 20),
('ad-copy-meta', 'Meta Ad-Copy (Facebook/Instagram)', 'Hook-Body-CTA für Meta-Werbeanzeigen', 'ad-copy', '["niche","icp","awareness","brand_tone","platform"]'::jsonb, 'salinsky', 30),
('ad-copy-google', 'Google Ads Copy', 'Headlines + Descriptions für Search Ads', 'ad-copy', '["niche","icp","brand_tone"]'::jsonb, 'salinsky', 40),
('ad-copy-tiktok', 'TikTok Ad-Copy', 'Hook-driven Short-Form Ad-Scripts', 'ad-copy', '["niche","icp","awareness","brand_tone"]'::jsonb, 'salinsky', 50),
('ecommerce-product', 'E-Commerce Produkt-Description', 'Conversion-optimierte Product-Page-Copy', 'ecommerce', '["niche","brand_tone","awareness"]'::jsonb, 'salinsky', 60),
('sales-pitch', 'Sales-Pitch (Generic)', 'Allgemeines Sales-Skript, kein Kanal-fokus', 'phone-script', '["niche","icp"]'::jsonb, 'bauligs', 70)
ON CONFLICT (slug) DO NOTHING;

-- ─── 6) Test-Knowledge-Hubs ──────────────────────────────────────
INSERT INTO public.knowledge_hubs (slug, name, description, is_public, associated_use_cases) VALUES
('bauligs', 'Bauligs Sales Methodology', 'TEST-DATA: Calling-Mentoring Pattern. Carlos lädt echtes Material später hoch.', true, '["phone-script-cold","phone-script-followup","sales-pitch"]'::jsonb),
('salinsky', 'Salinsky E-Commerce-Consulting', 'TEST-DATA: Tim/Tommy E-Com-Material. Echte Daten kommen von Tim.', true, '["ad-copy-meta","ad-copy-google","ad-copy-tiktok","ecommerce-product"]'::jsonb),
('aevum-default', 'AEVUM Default Best-Practices', 'Allgemeine AI-Copywriting Best-Practices, generic.', true, '["phone-script-cold","ad-copy-meta","ecommerce-product","sales-pitch"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ─── 7) Test-Knowledge-Documents (Mock-Frameworks) ───────────────
INSERT INTO public.knowledge_documents (hub_id, title, content_md, metadata)
SELECT h.id, t.title, t.content, t.meta::jsonb
FROM public.knowledge_hubs h
JOIN (VALUES
  ('bauligs', 'Bauligs Cold-Call 5-Step', E'# Bauligs Cold-Call Framework\n\n## Step 1: Pattern-Interrupt-Opener\n- Nicht "Hallo, mein Name ist X" — sofort Wert/Frage\n- z.B. "Hi [Name], ich hab gerade gesehen dass [konkrete Beobachtung]. 30 Sekunden?"\n\n## Step 2: Pain-Validation\n- Frage zum Status-Quo\n- Lass den Lead selbst Pain artikulieren\n\n## Step 3: Mechanism-Anchor\n- Wie unsere Methode Pain löst (nicht WAS, sondern WIE)\n\n## Step 4: Risk-Reversal\n- 30-Tage-Garantie / Pilot-Setup\n- Kostenlose Probe\n\n## Step 5: Soft-Close\n- "Macht das Sinn als nächster Schritt?" statt "Buchen wir einen Call?"\n- Lead committs sich kleiner\n', '{"category":"framework","language":"de"}'),
  ('bauligs', 'Bauligs Objection-Handling', E'# Bauligs Objection-Handling\n\n## "Zu teuer"\n- Reframe: "Im Vergleich wozu?"\n- Cost-of-Inaction quantifizieren\n- ROI-Beispiel von Referenz-Kunde\n\n## "Keine Zeit"\n- "Wir machen das nur für Leute die sich Zeit nehmen für 10x ROI"\n- Soft-Disqualify\n\n## "Muss ich überlegen"\n- "Was genau willst du überlegen? Lass uns das jetzt durchgehen, spart dir Zeit"\n\n## "Schick mir Info per Mail"\n- "Das ist ein Brush-Off — sag mir was du wirklich brauchst um zu entscheiden"\n', '{"category":"objections","language":"de"}'),
  ('salinsky', 'Salinsky E-Com Hook-Library', E'# E-Com Ad-Hook Patterns (Salinsky)\n\n## Hook-Type 1: Curiosity\n- "I tried [common solution] for 3 months. Then I found [your product]."\n- Funktioniert für Supplements, Skincare, Health\n\n## Hook-Type 2: Pain-Agitation\n- "If you have [pain], you probably tried [common solution]. Here is why it does not work..."\n\n## Hook-Type 3: Social-Proof-First\n- "Over 10,000 [target] switched from [competitor] to us. Here is why:"\n\n## Hook-Type 4: Educational-Anchor\n- "Most people think [misconception]. The truth is [your angle]."\n\n## Hook-Type 5: Demo-Visual\n- "Watch what happens when [demo of product feature]"\n- Strongly visual, video-only\n', '{"category":"hooks","language":"en","platform":"meta-tiktok"}'),
  ('salinsky', 'Salinsky Conversion-Copy-Framework', E'# Salinsky AIDA+ Framework für E-Com\n\n## A — Attention (Hook 3s)\n- Pattern-Interrupt, kein "Hi!"\n- Specific Product-Visual oder Stat\n\n## I — Interest (Body 10-20s)\n- "You may have tried [X]. Here is why our [Y] is different:"\n- 3 USPs, kurz\n\n## D — Desire (Emotional 5-10s)\n- Outcome-Visualization: "Imagine waking up with [result]"\n- Customer-Voice-Over\n\n## A — Action (CTA)\n- Single, specific CTA\n- Urgency wenn ehrlich\n\n## + Risk-Reversal\n- 60-Day-Money-Back, Free-Returns, No-Questions\n', '{"category":"framework","language":"en","platform":"meta"}'),
  ('aevum-default', 'AEVUM AI-Copywriting Principles', E'# AEVUM Default Principles\n\n## 1. Brand-Voice First\n- Ohne Voice-Definition kein guter Output\n- Sample-Texte des Kunden als Ground-Truth\n\n## 2. ICP-Spezifisch\n- "Founders 25-45, Saas, $1-10M ARR" ungleich "General-Audience"\n- Specificity drives Resonance\n\n## 3. Awareness-Stage matched\n- Unaware -> Education\n- Problem-Aware -> Diagnostic\n- Solution-Aware -> Comparison\n- Product-Aware -> Social-Proof\n- Most-Aware -> CTA-First\n\n## 4. Anti-AI-Smell\n- Keine "Game-changer", "Unleash", "Transform"\n- Konkrete Verben, spezifische Zahlen\n\n## 5. Iteration vor Perfektion\n- Erste Version raus + measure\n', '{"category":"principles","language":"de"}')
) AS t(hub_slug, title, content, meta) ON h.slug = t.hub_slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.knowledge_documents kd WHERE kd.hub_id = h.id AND kd.title = t.title
);

-- ─── Verify ──────────────────────────────────────────────────────
DO $$
DECLARE
  hub_count INT;
  doc_count INT;
  uc_count INT;
BEGIN
  SELECT count(*) INTO hub_count FROM public.knowledge_hubs;
  SELECT count(*) INTO doc_count FROM public.knowledge_documents;
  SELECT count(*) INTO uc_count FROM public.script_use_cases;
  RAISE NOTICE 'mig035: knowledge_hubs=%, knowledge_documents=%, script_use_cases=%', hub_count, doc_count, uc_count;
END $$;

COMMIT;
