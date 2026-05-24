-- 020_project_quicklinks.sql
-- AEVUM Headquarter Vision — Wave A2 (Quicklinks)
--
-- Per-project Quicklinks: Webseiten, Repos, Tools, Services, Custom-Resources
-- die Customer im Project-OS-Dashboard sehen. Klick öffnet Link in neuem Tab.

CREATE TABLE IF NOT EXISTS public.project_quicklinks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  url          TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('website','repo','tool','service','resource','other')),
  icon         TEXT,                  -- lucide-react icon name (optional)
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quicklinks_project       ON public.project_quicklinks(project_id);
CREATE INDEX IF NOT EXISTS idx_quicklinks_project_sort  ON public.project_quicklinks(project_id, sort_order);

ALTER TABLE public.project_quicklinks ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_project_quicklinks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_project_quicklinks_updated_at ON public.project_quicklinks;
CREATE TRIGGER trg_project_quicklinks_updated_at
  BEFORE UPDATE ON public.project_quicklinks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_project_quicklinks_updated_at();

-- ───────────────────────────────────────────────────────────────────────────
-- Seed: existing customer-projects in DB
-- (idempotent via NOT EXISTS guard pro (project_id, label))
-- ───────────────────────────────────────────────────────────────────────────

-- AEVUM (carlos/aevum) — 8659199a-7bc8-4d93-80b9-48e93aefa3e1
INSERT INTO public.project_quicklinks (project_id, label, url, category, icon, sort_order)
SELECT '8659199a-7bc8-4d93-80b9-48e93aefa3e1'::uuid, x.label, x.url, x.category, x.icon, x.sort_order
FROM (VALUES
  ('Website',           'https://aevum-system.de',                 'website',  'Globe',    10),
  ('Customer-Portal',   'https://portal.aevum-system.de',          'website',  'LayoutDashboard', 20),
  ('API Health',        'https://api.aevum-system.de/api/health',  'service',  'Activity', 30),
  ('Supabase',          'https://supabase.com/dashboard/project/iwyzbiufmdnwmddjkevf', 'tool', 'Database', 40),
  ('Vercel',            'https://vercel.com/iamcarlostheone/aevum-portal', 'tool', 'Cloud', 50),
  ('Stripe Dashboard',  'https://dashboard.stripe.com',            'tool',     'CreditCard', 60),
  ('GitHub Repo',       'https://github.com/iamcarlostheone/AEVUM','repo',     'Github',   70)
) AS x(label, url, category, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_quicklinks q
  WHERE q.project_id = '8659199a-7bc8-4d93-80b9-48e93aefa3e1'::uuid AND q.label = x.label
);

-- CollaGlow (ketolabs/collaglow) — c4851539-d10a-49bd-88df-1bf1ffd3be61
INSERT INTO public.project_quicklinks (project_id, label, url, category, icon, sort_order)
SELECT 'c4851539-d10a-49bd-88df-1bf1ffd3be61'::uuid, x.label, x.url, x.category, x.icon, x.sort_order
FROM (VALUES
  ('Shopify Store',  'https://admin.shopify.com',          'tool',    'Shop',     10),
  ('Klaviyo',        'https://www.klaviyo.com/dashboard',  'tool',    'Mail',     20),
  ('Meta Ads',       'https://business.facebook.com',      'tool',    'Megaphone',30),
  ('Google Ads',     'https://ads.google.com',             'tool',    'Search',   40),
  ('Juicy Tracking', 'https://app.juicy.bid',              'tool',    'Activity', 50)
) AS x(label, url, category, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_quicklinks q
  WHERE q.project_id = 'c4851539-d10a-49bd-88df-1bf1ffd3be61'::uuid AND q.label = x.label
);

-- Thailand RE (patrick-roth/thailand-re-leadfunnel) — c7b075d0-4627-4f00-a2ed-248988c49d10
INSERT INTO public.project_quicklinks (project_id, label, url, category, icon, sort_order)
SELECT 'c7b075d0-4627-4f00-a2ed-248988c49d10'::uuid, x.label, x.url, x.category, x.icon, x.sort_order
FROM (VALUES
  ('LinkedIn',  'https://www.linkedin.com/in/patrickroth', 'website', 'Linkedin', 10),
  ('WhatsApp Business', 'https://business.whatsapp.com',   'tool',    'MessageSquare', 20)
) AS x(label, url, category, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_quicklinks q
  WHERE q.project_id = 'c7b075d0-4627-4f00-a2ed-248988c49d10'::uuid AND q.label = x.label
);

-- HV Augsburg Süd (hv-augsburg-sued/hv-aug-sued-marketing) — ed21da60-b055-46ca-b480-c89157c00541
-- No seed yet (URLs unknown).

-- Schäfer & Partner (schaefer-partner/schaefer-ads) — d9b907ed-3906-4445-8f30-818bbe6f9d8d
-- No seed yet (URLs unknown).

-- ───────────────────────────────────────────────────────────────────────────
-- Verify
SELECT project_id, count(*) AS link_count FROM public.project_quicklinks GROUP BY project_id ORDER BY link_count DESC;
