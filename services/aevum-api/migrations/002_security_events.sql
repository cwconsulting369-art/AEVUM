-- AEVUM security_events table
-- Created: 2026-05-19
-- Run in Supabase SQL Editor (Project: AEVUM, ref: iwyzbiufmdnwmddjkevf)

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  event_type text not null,    -- validation_fail | honeypot_triggered | too_fast | attack_pattern | rate_limit
  reason text,
  endpoint text,
  ip text,
  user_agent text,
  payload_summary text,

  reviewed boolean default false,
  reviewed_at timestamptz,
  notes text
);

create index if not exists security_events_type_idx on public.security_events (event_type, created_at desc);
create index if not exists security_events_ip_idx on public.security_events (ip, created_at desc);
create index if not exists security_events_unreviewed_idx on public.security_events (reviewed, created_at desc) where reviewed = false;

alter table public.security_events enable row level security;

comment on table public.security_events is 'AEVUM API blocked attempts — honeypot triggers, attack patterns, validation failures, rate-limit hits';
