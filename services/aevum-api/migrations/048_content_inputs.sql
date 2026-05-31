-- 047_content_inputs.sql
-- Content-Engine-Input-Layer (research-seeded → Patrick-editierbar via Dashboard/Bot/Upload).
-- ICP-Profile, Brand-Voice, Topic-Bank. Account-scoped. Speist die Content-Draft-Engine.
-- Werte hier = Research-Initialwerte (aus Funnel-Playbook + Fakten-Research); Patrick überschreibt.

-- ─── 1) ICP-Profile (je Segment) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.icp_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  segment TEXT NOT NULL CHECK (segment IN ('auswanderer','investor','beides')),
  name TEXT,
  summary TEXT,
  pains JSONB DEFAULT '[]',
  desires JSONB DEFAULT '[]',
  objections JSONB DEFAULT '[]',
  awareness_default TEXT,            -- unaware|problem|solution|product|most
  language_notes TEXT,              -- Ton/Sprache der Zielgruppe
  source TEXT DEFAULT 'research',   -- research | patrick
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (account_id, segment)
);
CREATE INDEX IF NOT EXISTS idx_icp_account ON public.icp_profiles(account_id);

-- ─── 2) Brand-Voice (1 pro Account) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.brand_voice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL UNIQUE REFERENCES public.accounts(id) ON DELETE CASCADE,
  tone TEXT,
  dos JSONB DEFAULT '[]',
  donts JSONB DEFAULT '[]',
  examples TEXT,
  notes TEXT,
  source TEXT DEFAULT 'research',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 3) Topic-Bank (Ideen für die Content-Engine) ────────────────────────
CREATE TABLE IF NOT EXISTS public.content_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  segment TEXT CHECK (segment IN ('auswanderer','investor','beides')),
  awareness_stage TEXT,             -- unaware|problem|solution|product
  topic TEXT NOT NULL,
  angle TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','used','parked')),
  source TEXT DEFAULT 'research',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_topics_account ON public.content_topics(account_id);

-- ─── 4) content_pieces: Awareness/ICP/Approval-Felder ergänzen ───────────
ALTER TABLE public.content_pieces
  ADD COLUMN IF NOT EXISTS awareness_stage TEXT,
  ADD COLUMN IF NOT EXISTS icp_profile_id UUID REFERENCES public.icp_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_by TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- ─── 5) Seed: Patricks ICP + Brand-Voice + Start-Topics (Research-Initial) ─
INSERT INTO public.icp_profiles (account_id, segment, name, summary, pains, desires, objections, awareness_default, language_notes, source)
SELECT a.id, v.segment, v.name, v.summary, v.pains::jsonb, v.desires::jsonb, v.objections::jsonb, v.aware, v.lang, 'research'
FROM public.accounts a
CROSS JOIN (VALUES
  ('auswanderer','Auswanderungs-Willige (45-65, DACH)',
   'Rentner/Frührentner/Remote-Worker, die ernsthaft nach Pattaya auswandern wollen — wollen Sicherheit statt Lehrgeld.',
   '["Angst vor Visum/Behörden","überteuerte Maklerwohnung","Sprachbarriere","Vereinsamung","kein Netzwerk wenn es klemmt"]',
   '["sorgenfrei ankommen","ehrliche Begleitung","lokales Netzwerk","Klarheit über Kosten/Visum"]',
   '["zu teuer","schaffe ich auch allein","ist das seriös?","was wenn es mir nicht gefällt"]',
   'problem','Du-Form, warm, ehrlich, kein Verkäufer-Sprech.'),
  ('investor','Immobilien-Investoren (DACH, >100k verfügbar)',
   'Unternehmer/Selbständige/Vermögende, die Pattaya-Condos als Investment wollen — wollen echte Netto-Zahlen statt Hochglanz.',
   '["intransparente Renditen","Foreign-Quota-Recht unklar","Bauträger-Risiko","Wiederverkauf/Exit","Fernverwaltung-Vertrauen"]',
   '["ehrliche Netto-Rendite","rechtssicherer Kauf","geprüfte Bauträger","remote managebar"]',
   '["ist das rechtlich sicher?","8-12% wirklich?","wie komme ich wieder raus?","kann ich das aus DE steuern?"]',
   'solution','Du-Form, sachlich-professionell, faktenbasiert, Blau/Gold-Premium.')
) AS v(segment,name,summary,pains,desires,objections,aware,lang)
WHERE a.slug = 'patrick-roth'
ON CONFLICT (account_id, segment) DO NOTHING;

INSERT INTO public.brand_voice (account_id, tone, dos, donts, examples, source)
SELECT a.id,
  'Ehrlich, menschlich, "kein Makler sondern Berater". Du-Form. Klar, kein Hype.',
  '["ehrlich auch unbequeme Wahrheiten","echte Zahlen/Fakten","persönlich (Patrick als Mensch)","konkret statt Floskel"]'::jsonb,
  '["keine Fake-Stats/erfundene Testimonials","keine Verknappungs-Tricks","kein Verkäufer-Sprech","kein Hochglanz-Versprechen"]'::jsonb,
  'Ich bin kein Makler. Ich bin der Berater, den ich selbst gebraucht hätte.',
  'research'
FROM public.accounts a WHERE a.slug = 'patrick-roth'
ON CONFLICT (account_id) DO NOTHING;

INSERT INTO public.content_topics (account_id, segment, awareness_stage, topic, angle, source)
SELECT a.id, t.segment, t.aware, t.topic, t.angle, 'research'
FROM public.accounts a
CROSS JOIN (VALUES
  ('auswanderer','problem','Die 3 teuersten Fehler beim Thailand-Visum','Eigene Lehrgeld-Story → Lösung'),
  ('auswanderer','solution','Was ein Monat Pattaya WIRKLICH kostet','Ehrliche Zahlen vs Instagram-Mythos'),
  ('investor','solution','5-8% statt 12%: warum ehrliche Renditen mehr wert sind','Anti-Hochglanz-Positionierung'),
  ('investor','problem','Foreign-Quota: was Ausländer wirklich besitzen dürfen','Rechts-Klarheit, Vertrauen'),
  ('beides','unaware','Mein erstes Jahr in Pattaya — ohne Filter','Persönliche Story, Reichweite')
) AS t(segment,aware,topic,angle)
WHERE a.slug = 'patrick-roth'
ON CONFLICT DO NOTHING;
