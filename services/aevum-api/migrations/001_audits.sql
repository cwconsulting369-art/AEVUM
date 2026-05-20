-- AEVUM audits table
-- Created: 2026-05-19
-- Run in Supabase SQL Editor (Project: AEVUM, ref: iwyzbiumdnwmddkevf)

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Contact
  name text not null,
  company text not null,
  email text not null,
  phone text,

  -- Business context
  industry text,
  team_size text,
  description text,
  time_wasters text,
  tools text,
  budget text,
  timeline text,

  -- Operational
  status text not null default 'new',  -- new, reviewing, contacted, qualified, closed_won, closed_lost
  meta jsonb default '{}'::jsonb,

  -- Carlos's internal notes (added later)
  internal_notes text,
  reviewed_at timestamptz,
  contacted_at timestamptz
);

-- Index for status filtering (Carlos's review queue)
create index if not exists audits_status_idx on public.audits (status, created_at desc);

-- Index for email lookup
create index if not exists audits_email_idx on public.audits (email);

-- RLS: only service_role can access (anon/public should never read/write)
alter table public.audits enable row level security;

-- (No policies defined → only service_role bypass works → anon gets denied)

-- Comment for documentation
comment on table public.audits is 'AEVUM Workflow Audit submissions from aevum-system.de/#/workflow-audit';
