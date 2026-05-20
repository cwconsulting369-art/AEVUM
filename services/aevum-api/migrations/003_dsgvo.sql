-- DSGVO compliance — consent + erasure tracking
-- Created: 2026-05-19

-- 1) Consent-Log (Art 7 DSGVO — must prove consent was given)
create table if not exists public.consent_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  audit_id uuid references public.audits(id) on delete cascade,
  email text,
  consent_type text not null,        -- 'wgm_submission', 'newsletter', etc.
  consent_text_version text not null, -- e.g. 'datenschutz-v1-2026-05-19'
  ip text,
  user_agent text,
  withdrawn_at timestamptz
);
create index if not exists consent_log_email_idx on public.consent_log (email);
create index if not exists consent_log_audit_idx on public.consent_log (audit_id);
alter table public.consent_log enable row level security;

-- 2) Erasure-Log (Art 17 DSGVO — proof of deletion + audit trail)
create table if not exists public.erasure_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  requested_by text,                   -- 'self' | 'admin'
  audits_deleted_count int default 0,
  consents_deleted_count int default 0,
  notes text
);
create index if not exists erasure_log_email_idx on public.erasure_log (email);
alter table public.erasure_log enable row level security;

-- 3) Add consent reference to audits
alter table public.audits add column if not exists consent_version text;
alter table public.audits add column if not exists consent_at timestamptz;

-- 4) Add anonymized flag to security_events (post 30-day IP anonymization)
alter table public.security_events add column if not exists ip_anonymized boolean default false;

comment on table public.consent_log is 'DSGVO Art 7 — Nachweis der Einwilligung';
comment on table public.erasure_log is 'DSGVO Art 17 — Audit trail of erasure requests';
