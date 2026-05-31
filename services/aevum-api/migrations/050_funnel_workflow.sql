-- 050_funnel_workflow.sql
-- Patrick Funnel VOLL-WORKFLOW — Nurture-Sequenz + Speed-to-Lead + Publish-Tracking.
-- Account-agnostisch (patrick-roth + künftige Customer). Idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- KEIN Apply durch Agents — nur Lennox-main appliziert.

-- ─── 1) customer_leads: Nurture-State + Speed-to-Lead-Flag ────────────────
ALTER TABLE public.customer_leads
  ADD COLUMN IF NOT EXISTS nurture_status TEXT DEFAULT 'active'
    CHECK (nurture_status IN ('active','paused','done','excluded')),
  ADD COLUMN IF NOT EXISTS nurture_step INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nurture_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nurture_last_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS speed_alert_sent BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_leads_nurture_status ON public.customer_leads(account_id, nurture_status);

-- ─── 2) content_channels: letzter erfolgreicher Publish ───────────────────
ALTER TABLE public.content_channels
  ADD COLUMN IF NOT EXISTS last_published_at TIMESTAMPTZ;

-- ─── 3) Nurture-Log (eine Zeile pro versendeter Nurture-Mail) ─────────────
CREATE TABLE IF NOT EXISTS public.lead_nurture_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.customer_leads(id) ON DELETE CASCADE,
  step INT,
  channel TEXT DEFAULT 'email',
  subject TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'sent'
);
CREATE INDEX IF NOT EXISTS idx_lead_nurture_log_lead ON public.lead_nurture_log(lead_id);
