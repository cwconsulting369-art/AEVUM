// AEVUM Knowledge-Hubs API — Wave H1
// Mount: /api/knowledge-hubs
//
// Endpoints:
//   GET    /                          list public + owned hubs (no auth required — public listing)
//   POST   /                          create new hub (admin-only)
//   PATCH  /:hubId                    update hub (admin-only)
//   DELETE /:hubId                    delete hub + all docs (admin-only)
//   GET    /:hubId/documents          list documents in hub (public if hub public)
//   POST   /:hubId/documents          add document (admin-only). Body: { title, content_md?, source_url?, metadata? }
//   DELETE /:hubId/documents/:docId   delete document (admin-only)
//
// Auth: x-aevum-admin-token (same pattern as /api/subscriptions, /api/accounts).
// Doc-Upload via JSON body (markdown). File-upload via multer left for future iteration.

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { safeCompare } from '../lib/security.js';

export const knowledgeHubsRouter = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,60}$/;

function requireAdmin(req, res, next) {
  const tok = req.get('x-aevum-admin-token');
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!expected) return res.status(500).json({ ok: false, error: 'admin_token_not_configured' });
  if (!tok || !safeCompare(tok, expected)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  next();
}

const HubSchema = z.object({
  slug: z.string().regex(SLUG_RE, 'slug must be lowercase alphanumeric + dashes, 2-60 chars'),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  owner_account_id: z.string().uuid().optional(),
  is_public: z.boolean().default(false),
  associated_use_cases: z.array(z.string().max(100)).max(20).default([])
});

const DocSchema = z.object({
  title: z.string().min(1).max(300),
  content_md: z.string().max(200000).optional(),
  source_url: z.string().url().max(2000).optional(),
  metadata: z.record(z.any()).optional()
}).refine(d => d.content_md || d.source_url, { message: 'content_md or source_url required' });

// ─── GET / — list (public listing) ───────────────────────────────
knowledgeHubsRouter.get('/', async (_req, res) => {
  const sel = await supabase.select(
    'knowledge_hubs',
    `?is_public=eq.true&order=name.asc&select=id,slug,name,description,is_public,owner_account_id,associated_use_cases,created_at`
  );
  if (!sel.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true, hubs: Array.isArray(sel.data) ? sel.data : [] });
});

// ─── POST / — create hub (admin) ─────────────────────────────────
knowledgeHubsRouter.post('/', requireAdmin, async (req, res) => {
  const parsed = HubSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  const ins = await supabase.insert('knowledge_hubs', {
    slug: parsed.data.slug,
    name: parsed.data.name,
    description: parsed.data.description || null,
    owner_account_id: parsed.data.owner_account_id || null,
    is_public: parsed.data.is_public,
    associated_use_cases: parsed.data.associated_use_cases
  });
  if (!ins.ok) {
    if (ins.status === 409 || ins.error?.code === '23505') {
      return res.status(409).json({ ok: false, error: 'slug_already_exists' });
    }
    return res.status(500).json({ ok: false, error: 'create_failed', details: ins.error });
  }
  const hub = Array.isArray(ins.data) ? ins.data[0] : ins.data;
  return res.json({ ok: true, hub });
});

// ─── PATCH /:hubId (admin) ───────────────────────────────────────
knowledgeHubsRouter.patch('/:hubId', requireAdmin, async (req, res) => {
  const { hubId } = req.params;
  if (!UUID_RE.test(hubId)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const parsed = HubSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  const patch = { ...parsed.data, updated_at: new Date().toISOString() };
  const upd = await supabase.update('knowledge_hubs', `?id=eq.${hubId}`, patch);
  if (!upd.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  const row = Array.isArray(upd.data) ? upd.data[0] : upd.data;
  if (!row) return res.status(404).json({ ok: false, error: 'not_found' });
  return res.json({ ok: true, hub: row });
});

// ─── DELETE /:hubId (admin) ──────────────────────────────────────
knowledgeHubsRouter.delete('/:hubId', requireAdmin, async (req, res) => {
  const { hubId } = req.params;
  if (!UUID_RE.test(hubId)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const del = await supabase.delete('knowledge_hubs', `?id=eq.${hubId}`);
  if (!del.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true });
});

// ─── GET /:hubId/documents (public if hub public) ────────────────
knowledgeHubsRouter.get('/:hubId/documents', async (req, res) => {
  const { hubId } = req.params;
  if (!UUID_RE.test(hubId)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  // Public-only access here; admin sees same data but can use other endpoints
  const hubSel = await supabase.select('knowledge_hubs', `?id=eq.${hubId}&select=is_public&limit=1`);
  if (!hubSel.data?.length) return res.status(404).json({ ok: false, error: 'hub_not_found' });
  if (!hubSel.data[0].is_public) {
    // Allow if admin token
    const tok = req.get('x-aevum-admin-token');
    if (!tok || !safeCompare(tok, process.env.AEVUM_ADMIN_TOKEN || '')) {
      return res.status(403).json({ ok: false, error: 'hub_not_public' });
    }
  }
  const sel = await supabase.select(
    'knowledge_documents',
    `?hub_id=eq.${hubId}&order=created_at.desc&select=id,title,source_url,metadata,embedding_status,created_at`
  );
  if (!sel.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true, documents: Array.isArray(sel.data) ? sel.data : [] });
});

// ─── POST /:hubId/documents (admin) ──────────────────────────────
knowledgeHubsRouter.post('/:hubId/documents', requireAdmin, async (req, res) => {
  const { hubId } = req.params;
  if (!UUID_RE.test(hubId)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const parsed = DocSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });

  // Verify hub exists
  const hubSel = await supabase.select('knowledge_hubs', `?id=eq.${hubId}&select=id&limit=1`);
  if (!hubSel.data?.length) return res.status(404).json({ ok: false, error: 'hub_not_found' });

  const ins = await supabase.insert('knowledge_documents', {
    hub_id: hubId,
    title: parsed.data.title,
    content_md: parsed.data.content_md || null,
    source_url: parsed.data.source_url || null,
    metadata: parsed.data.metadata || {},
    embedding_status: 'pending'
  });
  if (!ins.ok) return res.status(500).json({ ok: false, error: 'create_failed', details: ins.error });
  const doc = Array.isArray(ins.data) ? ins.data[0] : ins.data;
  return res.json({ ok: true, document: doc });
});

// ─── DELETE /:hubId/documents/:docId (admin) ─────────────────────
knowledgeHubsRouter.delete('/:hubId/documents/:docId', requireAdmin, async (req, res) => {
  const { hubId, docId } = req.params;
  if (!UUID_RE.test(hubId) || !UUID_RE.test(docId)) {
    return res.status(400).json({ ok: false, error: 'invalid_id' });
  }
  const del = await supabase.delete('knowledge_documents', `?id=eq.${docId}&hub_id=eq.${hubId}`);
  if (!del.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true });
});
