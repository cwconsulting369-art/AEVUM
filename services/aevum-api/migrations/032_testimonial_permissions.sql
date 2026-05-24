-- 032_testimonial_permissions.sql — Wave E4: Customer-controlled Permission Layer
--
-- Bestehende case_pages (026) hatte nur 3 Toggles (show_revenue/users/growth).
-- Wave E4 erweitert auf 8 Permission-Flags pro Item, dazu Audit-Trail in
-- testimonial_consent_log. Default fuer alles sensible = false (Anti-Fake-it).
--
-- Brand+Services+Story+Vision = true by default (sonst leerer Case).
-- Logo + Testimonial-Quote + Revenue/Users/Growth = false (opt-in).

-- ---------------------------------------------------------------
-- 1) Permission-Flags an case_pages
-- ---------------------------------------------------------------
ALTER TABLE public.case_pages
  ADD COLUMN IF NOT EXISTS allow_show_logo               BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_show_brand_name         BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_show_testimonial        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_show_services           BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_show_collaboration_story BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_show_vision             BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS consent_signed_at             TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_signed_by             TEXT;

-- ---------------------------------------------------------------
-- 2) Audit-Trail: jede Permission-Aenderung wird geloggt (DSGVO-Transparenz)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonial_consent_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_page_id    UUID NOT NULL REFERENCES public.case_pages(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES public.accounts(id)   ON DELETE CASCADE,
  changed_by      TEXT NOT NULL,        -- 'customer' / 'admin' / 'system'
  changed_field   TEXT NOT NULL,        -- 'allow_show_revenue' / 'testimonial_quote' / etc.
  old_value       JSONB,
  new_value       JSONB,
  ip_anonymized   TEXT,
  ts              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_case
  ON public.testimonial_consent_log(case_page_id, ts DESC);

CREATE INDEX IF NOT EXISTS idx_consent_account
  ON public.testimonial_consent_log(account_id, ts DESC);

ALTER TABLE public.testimonial_consent_log ENABLE ROW LEVEL SECURITY;

-- Read-Policy: nur Service-Role (Backend mit Service-JWT). Customer geht ueber API.
-- Anon-Reads bewusst verboten.

-- ---------------------------------------------------------------
-- 3) Defaults fuer existing Cases (Anti-Fake-it)
-- Niemand hat explizit zugestimmt — daher sensitive Flags = false.
-- Story+Vision+Services+Brand-Name bleiben sichtbar (das war schon der
-- Status-Quo der oeffentlichen Cases). Logo + Testimonial-Quote OFF.
-- ---------------------------------------------------------------
UPDATE public.case_pages
   SET allow_show_brand_name          = true,
       allow_show_services            = true,
       allow_show_collaboration_story = true,
       allow_show_vision              = true,
       allow_show_logo                = false,
       allow_show_testimonial         = false,
       show_revenue                   = false,
       show_users                     = false,
       show_growth                    = false
 WHERE slug IN ('ketolabs','utilityhub','thailand-re','goldtradersociety');
