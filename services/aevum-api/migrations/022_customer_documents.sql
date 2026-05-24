-- Migration 022 — Customer Document Exchange (audit log + metadata)
-- File-Inhalte liegen im Filesystem (customers/<slug>/docs/{inbox,outbox,shared}/),
-- diese Tabelle protokolliert Aktionen und speichert Metadata.
-- Wave A3 Doc-Exchange — 2026-05-24

CREATE TABLE IF NOT EXISTS public.customer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  folder TEXT NOT NULL CHECK (folder IN ('inbox','outbox','shared')),
  size_bytes INT,
  created_by_role TEXT NOT NULL CHECK (created_by_role IN ('customer','agent','admin')),
  action TEXT NOT NULL CHECK (action IN ('created','edited','deleted','read')),
  ts TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_docs_account_project ON public.customer_documents(account_id, project_id);
CREATE INDEX IF NOT EXISTS idx_docs_ts ON public.customer_documents(ts DESC);

ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;
