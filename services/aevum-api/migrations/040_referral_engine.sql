-- AEVUM Referral Engine — 2026-05-25
-- Project: iwyzbiufmdnwmddjkevf
--
-- Customer-driven referral programs with reward tracking.
-- Generalised so every Full-Partner project can have its own program.
-- Patrick Roth Thailand is seeded as first active program.

BEGIN;

-- ─── 1) referral_programs ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referral_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','paused','ended')),

  -- Reward to the referrer (existing customer/contact)
  referrer_reward_type TEXT
    CHECK (referrer_reward_type IN ('cash','voucher','service-credit','travel-voucher','custom')),
  referrer_reward_value_eur NUMERIC(10,2),
  referrer_reward_description TEXT,

  -- Reward to the referee (the new customer)
  referee_reward_type TEXT
    CHECK (referee_reward_type IN ('discount','voucher','bonus-service','custom')),
  referee_reward_value_eur NUMERIC(10,2),
  referee_reward_description TEXT,

  -- When the reward unlocks
  trigger_event TEXT NOT NULL DEFAULT 'closed_won'
    CHECK (trigger_event IN ('lead_qualified','meeting_booked','closed_won')),

  -- Public marketing copy
  pitch_text TEXT,
  share_template TEXT,            -- "Hey {NAME}, Patrick hat mir geholfen — wenn du Thailand erwägst, kannst du ihn hier kontaktieren: {LINK}"

  -- Limits
  max_uses_per_code INT,          -- NULL = unlimited
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_referral_programs_project ON public.referral_programs(project_id);
ALTER TABLE public.referral_programs ENABLE ROW LEVEL SECURITY;

-- ─── 2) referral_codes ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.referral_programs(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,

  -- Who owns this code (the referrer)
  referrer_name TEXT,
  referrer_email TEXT,
  referrer_lead_id UUID REFERENCES public.customer_leads(id) ON DELETE SET NULL,
  referrer_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,

  active BOOLEAN NOT NULL DEFAULT true,

  -- Aggregated stats (denormalised, updated via trigger)
  uses_count INT NOT NULL DEFAULT 0,
  qualified_count INT NOT NULL DEFAULT 0,
  closed_won_count INT NOT NULL DEFAULT 0,
  total_reward_earned_eur NUMERIC(10,2) NOT NULL DEFAULT 0,

  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_program ON public.referral_codes(program_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_email ON public.referral_codes(referrer_email);
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- ─── 3) referrals (actual events) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.referral_programs(id) ON DELETE CASCADE,
  code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,

  -- The referred party
  lead_id UUID REFERENCES public.customer_leads(id) ON DELETE SET NULL,
  referee_name TEXT,
  referee_email TEXT,
  referee_phone TEXT,
  referee_notes TEXT,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','qualified','converted','rewarded','expired','rejected')),

  -- Reward state
  referrer_reward_paid BOOLEAN NOT NULL DEFAULT false,
  referrer_reward_paid_at TIMESTAMPTZ,
  referrer_reward_amount_eur NUMERIC(10,2),
  referrer_reward_notes TEXT,

  referee_reward_paid BOOLEAN NOT NULL DEFAULT false,
  referee_reward_paid_at TIMESTAMPTZ,
  referee_reward_amount_eur NUMERIC(10,2),

  -- Lifecycle timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  qualified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(code_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_program_status ON public.referrals(program_id, status);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- ─── 4) Extend customer_leads with referral attribution ─────────
ALTER TABLE public.customer_leads
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_customer_leads_referral_code ON public.customer_leads(referral_code);

-- ─── 5) Trigger: keep referral_codes stats in sync ──────────────
CREATE OR REPLACE FUNCTION public.refresh_referral_code_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.referral_codes
  SET
    uses_count = (SELECT COUNT(*) FROM public.referrals WHERE code_id = COALESCE(NEW.code_id, OLD.code_id)),
    qualified_count = (SELECT COUNT(*) FROM public.referrals WHERE code_id = COALESCE(NEW.code_id, OLD.code_id) AND status IN ('qualified','converted','rewarded')),
    closed_won_count = (SELECT COUNT(*) FROM public.referrals WHERE code_id = COALESCE(NEW.code_id, OLD.code_id) AND status IN ('converted','rewarded')),
    total_reward_earned_eur = (SELECT COALESCE(SUM(referrer_reward_amount_eur),0) FROM public.referrals WHERE code_id = COALESCE(NEW.code_id, OLD.code_id) AND referrer_reward_paid = true)
  WHERE id = COALESCE(NEW.code_id, OLD.code_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_referrals_stats ON public.referrals;
CREATE TRIGGER trg_referrals_stats
AFTER INSERT OR UPDATE OR DELETE ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.refresh_referral_code_stats();

-- ─── 6) Seed: Patrick Roth Thailand Referral Program ────────────
INSERT INTO public.referral_programs (
  project_id, name, slug, status,
  referrer_reward_type, referrer_reward_value_eur, referrer_reward_description,
  referee_reward_type, referee_reward_value_eur, referee_reward_description,
  trigger_event, pitch_text, share_template
)
SELECT
  'c7b075d0-4627-4f00-a2ed-248988c49d10'::uuid,
  'Patrick Roth Thailand — Empfehlungs-Programm',
  'patrick-roth-empfehlungen',
  'active',
  'travel-voucher', 500.00, '500 € Reisegutschein (Hotel/Flug in Thailand) für jede erfolgreich vermittelte Comfort-/Premium-Kundschaft.',
  'discount', 250.00, '250 € Rabatt auf Comfort/Premium-Paket beim ersten Buchungsschritt.',
  'closed_won',
  'Du kennst jemanden, der mit dem Gedanken spielt, in Thailand zu kaufen oder zu leben? Wenn ich ihm wirklich helfen kann, danke ich dir mit einem 500€-Reisegutschein. Dein Freund bekommt 250€ Rabatt auf sein Paket — wir nennen das fair geteilt.',
  'Hi {NAME}, ich habe gerade mit Patrick Roth gearbeitet (Concierge für Thailand-Immobilien in Pattaya). Falls du selber irgendwann mit dem Gedanken spielst — er ist ehrlich, vor Ort und du kannst ihn unverbindlich anschreiben: {LINK}'
WHERE NOT EXISTS (
  SELECT 1 FROM public.referral_programs WHERE slug = 'patrick-roth-empfehlungen'
);

COMMIT;
