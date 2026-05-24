-- AEVUM Lead-Scraper-Factory — Wave I5 Phase-1 (2026-05-24)
-- Project: iwyzbiufmdnwmddjkevf
--
-- MVP: CSV-Upload + LLM-Pitch-Generation + Email-Send via Resend
-- Phase 2 (later): Scraping/Enrichment/Trigger-Detection — not in this migration

BEGIN;

-- ─── 1) lead_scraper_campaigns ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lead_scraper_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brandtone_hub_id UUID,
  source_csv_filename TEXT,
  outreach_channel TEXT DEFAULT 'email' CHECK (outreach_channel IN ('email','linkedin','both')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','generating','ready_to_send','sending','complete','paused')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lscamp_account ON public.lead_scraper_campaigns(account_id);
CREATE INDEX IF NOT EXISTS idx_lscamp_status ON public.lead_scraper_campaigns(status);
ALTER TABLE public.lead_scraper_campaigns ENABLE ROW LEVEL SECURITY;

-- ─── 2) leads ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.lead_scraper_campaigns(id) ON DELETE CASCADE,
  company_name TEXT,
  company_domain TEXT,
  company_data JSONB DEFAULT '{}'::jsonb,
  owner_name TEXT,
  owner_email TEXT,
  owner_linkedin_url TEXT,
  trigger_events JSONB DEFAULT '[]'::jsonb,
  pitch_variants JSONB DEFAULT '[]'::jsonb,
  pitch_selected_index INT,
  outreach_status TEXT DEFAULT 'pending' CHECK (outreach_status IN ('pending','generated','approved','sent','opened','replied','converted','bounced','unsubscribed','failed')),
  outreach_sent_at TIMESTAMPTZ,
  outreach_message TEXT,
  outreach_message_subject TEXT,
  reply_data JSONB,
  credits_spent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_status ON public.leads(campaign_id, outreach_status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(owner_email);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- ─── 3) Seed AEVUM-Brandtone Knowledge-Hub ───────────────────────
INSERT INTO public.knowledge_hubs (slug, name, description, is_public, associated_use_cases) VALUES
('aevum-brandtone', 'AEVUM Brand-Voice', 'Carlos''s Brand-Voice fuer Outreach: direkt, ehrlich, datengetrieben, keine Floskeln', true, '["lead-pitch","cold-outreach"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.knowledge_documents (hub_id, title, content_md, metadata)
SELECT h.id, 'AEVUM Brand-Voice Outreach', E'# AEVUM Outreach-Voice\n\n## DOs\n- Direkt, kein "Hallo, ich hoffe es geht dir gut"\n- Konkrete Beobachtung im Lead-Profile als Pattern-Interrupt-Opener\n- Mehrwert in Satz 1 (was bringt es DEM Lead)\n- 1 spezifische Frage am Ende\n- Max 4 Saetze, kein Wall-of-Text\n\n## DONTs\n- Marketing-Floskeln ("Game-changer", "Unleash", "Transform")\n- "Ich wuerde mich freuen ueber..."\n- "Falls Sie Zeit haben..."\n- Bullet-Point-Verkaufslisten\n- Persoenliche Anrede die generic wirkt ("Lieber [Name]")\n\n## Anti-Fake-it\n- Keine erfundenen Stats\n- Keine Mock-Cases\n- Bei Unsicherheit: "Bin neugierig - passt das?" statt Behauptung\n\n## Sample-Tonality\n- "Hi [Name], sah deinen Post zu [konkretes Thema]. Wir bauen genau fuer sowas. Schick ich dir 90-Sek-Demo?"\n- "Hey [Name], dein Setup auf [Brand] passt zu nem Projekt das ich gerade fuer Tim bei Brandedecom mache. Lust auf 15-min Sync?"', '{"category":"outreach","language":"de"}'::jsonb
FROM public.knowledge_hubs h
WHERE h.slug='aevum-brandtone'
  AND NOT EXISTS (
    SELECT 1 FROM public.knowledge_documents kd
    WHERE kd.hub_id = h.id AND kd.title = 'AEVUM Brand-Voice Outreach'
  );

DO $$
DECLARE
  camp_count INT;
  lead_count INT;
  hub_id UUID;
BEGIN
  SELECT count(*) INTO camp_count FROM public.lead_scraper_campaigns;
  SELECT count(*) INTO lead_count FROM public.leads;
  SELECT id INTO hub_id FROM public.knowledge_hubs WHERE slug='aevum-brandtone';
  RAISE NOTICE 'mig038: lead_scraper_campaigns=%, leads=%, aevum-brandtone-hub-id=%', camp_count, lead_count, hub_id;
END $$;

COMMIT;
