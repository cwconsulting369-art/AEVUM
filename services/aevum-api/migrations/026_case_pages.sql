-- 026_case_pages.sql — Wave B5: Cases-Pages mit Live-Daten-Anbindung
--
-- Speichert pro Account einen redaktionellen Case-Eintrag fuer
-- /cases/<slug> (Customer-Story, aktivierte AEVUM-Services, Live-KPIs).
--
-- Carlos editiert die Inhalte spaeter via Admin-UI; das Schema
-- erlaubt feingranulares Permission-Gating (show_revenue/users/growth)
-- damit Live-Daten nur dort eingeblendet werden, wo der Kunde
-- explizit zugestimmt hat (Brand-Memory: Anti-Fake-it).

CREATE TABLE IF NOT EXISTS public.case_pages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id   UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  slug         TEXT UNIQUE NOT NULL,
  hero_title   TEXT NOT NULL,
  hero_subtitle TEXT,
  brand_url    TEXT,                                       -- Live-URL des Kunden-Projekts

  -- Content-Sections (Markdown)
  project_description TEXT,
  collaboration_story TEXT,
  vision              TEXT,

  -- Aktivierte AEVUM-Services [{slug,name,started_at,impact}]
  activated_services JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Statische Live-KPIs [{label,value,unit,source,updated_at}]
  -- Backend mergt optional Live-Daten aus project_intelligence/projects
  live_kpis JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Public-Permissions
  public        BOOLEAN NOT NULL DEFAULT false,
  show_revenue  BOOLEAN NOT NULL DEFAULT false,
  show_users    BOOLEAN NOT NULL DEFAULT false,
  show_growth   BOOLEAN NOT NULL DEFAULT false,

  -- Display
  hero_image_url     TEXT,
  testimonial_quote  TEXT,
  testimonial_author TEXT,

  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_pages_slug
  ON public.case_pages(slug);

CREATE INDEX IF NOT EXISTS idx_case_pages_public_sort
  ON public.case_pages(public, sort_order);

CREATE INDEX IF NOT EXISTS idx_case_pages_account
  ON public.case_pages(account_id);

ALTER TABLE public.case_pages ENABLE ROW LEVEL SECURITY;

-- Public-Read fuer published Cases (anon JWT)
DROP POLICY IF EXISTS case_pages_public_read ON public.case_pages;
CREATE POLICY case_pages_public_read
  ON public.case_pages
  FOR SELECT
  USING (public = true);

-- Service-Role bypass: hat ohnehin Full-Access via Service-JWT.
-- Anon-Writes komplett verboten.

-- ---------------------------------------------------------------
-- Mock-Cleanup: 3 HV-Mock-Accounts (hv-augsburg-sued, schaefer-partner,
-- vogt-hv) wurden als Demo-Inhalt angelegt — auf status='archived'
-- damit Dashboards/Bots sie nicht mehr in MRR/Customer-Counts zaehlen.
-- Daten bleiben fuer FK-Integritaet erhalten.
-- ---------------------------------------------------------------

-- Erweitere status-CHECK um 'archived' (Mock-Cleanup-Target)
ALTER TABLE public.accounts
  DROP CONSTRAINT IF EXISTS accounts_status_check;
ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_status_check
  CHECK (status = ANY (ARRAY['onboarding','active','paused','churned','archived']));

UPDATE public.accounts
   SET status = 'archived', updated_at = now()
 WHERE slug IN ('hv-augsburg-sued','schaefer-partner','vogt-hv')
   AND status <> 'archived';
