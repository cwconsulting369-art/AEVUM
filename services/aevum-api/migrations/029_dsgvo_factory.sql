-- AEVUM DSGVO-Factory SaaS — Wave C2
-- Created: 2026-05-24 (Agent C2)
--
-- Stub-MVP: AVV-Template aus personal-os/01-business/aevum/AVV-TEMPLATE-AEVUM-2026-05-20.md
-- aktiv. 5 weitere Templates (Datenschutzerklaerung, Impressum, AGB, Widerruf, Newsletter)
-- als Coming-Soon → Wave-D.
-- Pricing: 25 Credits / Run (~€2.50).

CREATE TABLE IF NOT EXISTS public.dsgvo_factory_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN (
    'avv',
    'datenschutzerklaerung',
    'impressum',
    'agb',
    'widerruf',
    'newsletter-consent'
  )),
  inputs JSONB NOT NULL,                    -- Firma, Vertreter, Adresse, Vendoren, etc.
  pdf_url TEXT,                              -- nach erfolgreicher Generation
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','running','complete','failed')),
  credits_spent INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dsgvo_runs_account ON public.dsgvo_factory_runs(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dsgvo_runs_status ON public.dsgvo_factory_runs(status)
  WHERE status IN ('pending','running');

ALTER TABLE public.dsgvo_factory_runs ENABLE ROW LEVEL SECURITY;

-- Seed Quality-Gate entry for dsgvo-factory (idempotent)
INSERT INTO public.shop_item_build_status (item_slug, item_type, gate_passed, notes) VALUES
  ('dsgvo-factory', 'saas', false, 'Stub-MVP live 2026-05-24 (AVV-Template), Rest Coming-Soon Wave-D')
ON CONFLICT (item_slug) DO UPDATE
  SET notes = EXCLUDED.notes,
      updated_at = now();
