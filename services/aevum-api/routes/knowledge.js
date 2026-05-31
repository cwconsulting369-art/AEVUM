// AEVUM Knowledge-Hub SSOT Routes — Block F1
// Mount: /api/admin/knowledge
// Created: 2026-05-25
//
// ALL endpoints admin-only (Bearer ADMIN_API_KEY via adminApiKeyGuard).
// Public has NO access to these tables — they are internal SSOT only.
//
// Endpoints:
//   POST /sources                  create knowledge_sources row
//   GET  /sources                  list sources
//   POST /entries                  create knowledge_entries row
//   GET  /entries?source=&category=&use=
//                                  query entries with filters
//   POST /sanitize                 body={entry_id} → returns sanitized string
//   GET  /health                   ping

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { adminApiKeyGuard } from '../lib/security.js';
import { sanitizeForCustomer, sanitizeWithAudit } from '../lib/knowledge-sanitize.js';

export const knowledgeRouter = Router();

// Alle Routes admin-only.
knowledgeRouter.use(adminApiKeyGuard);

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;

const SourceSchema = z.object({
  slug: z.string().regex(SLUG_RE),
  name: z.string().min(1).max(200),
  source_type: z.enum(['coach', 'agency', 'platform', 'playbook', 'case-study']),
  domain: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived']).default('active')
});

const EntrySchema = z.object({
  source_id: z.number().int().positive(),
  topic: z.string().min(1).max(200),
  raw_excerpt: z.string().min(1).max(20000),
  sanitized_takeaway: z.string().max(5000).optional(),
  category: z.string().max(80).optional(),
  tags: z.array(z.string().max(60)).max(20).default([]),
  internal_notes: z.string().max(5000).optional(),
  customer_use: z.enum(['never', 'inspiration-only', 'meta-pattern', 'blocked']).default('never')
});

// ─── Health ───────────────────────────────────────────────────────
knowledgeRouter.get('/health', (_req, res) => {
  res.json({ ok: true, scope: 'knowledge-ssot', ts: new Date().toISOString() });
});

// ─── POST /sources ───────────────────────────────────────────────
knowledgeRouter.post('/sources', async (req, res) => {
  const parsed = SourceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }
  const ins = await supabase.insert('knowledge_sources', parsed.data);
  if (!ins.ok) {
    if (ins.status === 409 || ins.error?.code === '23505') {
      return res.status(409).json({ ok: false, error: 'slug_already_exists' });
    }
    return res.status(500).json({ ok: false, error: 'create_failed', details: ins.error });
  }
  const row = Array.isArray(ins.data) ? ins.data[0] : ins.data;
  res.json({ ok: true, source: row });
});

// ─── GET /sources ────────────────────────────────────────────────
knowledgeRouter.get('/sources', async (_req, res) => {
  const sel = await supabase.select(
    'knowledge_sources',
    '?order=created_at.desc&select=id,slug,name,source_type,domain,description,status,created_at'
  );
  if (!sel.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  res.json({ ok: true, sources: Array.isArray(sel.data) ? sel.data : [] });
});

// ─── POST /entries ───────────────────────────────────────────────
knowledgeRouter.post('/entries', async (req, res) => {
  const parsed = EntrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }
  // Verify source exists
  const srcSel = await supabase.select(
    'knowledge_sources',
    `?id=eq.${parsed.data.source_id}&select=id&limit=1`
  );
  if (!srcSel.ok || !Array.isArray(srcSel.data) || srcSel.data.length === 0) {
    return res.status(404).json({ ok: false, error: 'source_not_found' });
  }
  const ins = await supabase.insert('knowledge_entries', parsed.data);
  if (!ins.ok) return res.status(500).json({ ok: false, error: 'create_failed', details: ins.error });
  const row = Array.isArray(ins.data) ? ins.data[0] : ins.data;
  res.json({ ok: true, entry: row });
});

// ─── GET /entries?source=&category=&use= ─────────────────────────
knowledgeRouter.get('/entries', async (req, res) => {
  const parts = [
    'select=id,source_id,topic,raw_excerpt,sanitized_takeaway,category,tags,internal_notes,customer_use,created_at,updated_at',
    'order=created_at.desc'
  ];
  const { source, category, use } = req.query;
  if (source) {
    const n = parseInt(String(source), 10);
    if (Number.isFinite(n)) parts.push(`source_id=eq.${n}`);
  }
  if (category && typeof category === 'string') {
    parts.push(`category=eq.${encodeURIComponent(category)}`);
  }
  if (use && typeof use === 'string') {
    parts.push(`customer_use=eq.${encodeURIComponent(use)}`);
  }
  const q = '?' + parts.join('&');
  const sel = await supabase.select('knowledge_entries', q);
  if (!sel.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  res.json({ ok: true, entries: Array.isArray(sel.data) ? sel.data : [] });
});

// ─── POST /sanitize ──────────────────────────────────────────────
// Body: { entry_id } OR { entry_ids: [..] }. Returns sanitized strings.
knowledgeRouter.post('/sanitize', async (req, res) => {
  const ids = Array.isArray(req.body?.entry_ids)
    ? req.body.entry_ids.filter((n) => Number.isFinite(n))
    : Number.isFinite(req.body?.entry_id)
    ? [req.body.entry_id]
    : null;
  if (!ids || ids.length === 0) {
    return res.status(400).json({ ok: false, error: 'entry_id_or_entry_ids_required' });
  }
  const filter = `?id=in.(${ids.join(',')})&select=id,raw_excerpt,sanitized_takeaway,customer_use`;
  const sel = await supabase.select('knowledge_entries', filter);
  if (!sel.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  const rows = Array.isArray(sel.data) ? sel.data : [];
  const result = rows.map((row) => {
    const { output, hits } = sanitizeWithAudit(row);
    return {
      id: row.id,
      customer_use: row.customer_use,
      output,           // null if blocked/never/missing-takeaway
      blocked: output === null,
      audit_hits: hits
    };
  });
  res.json({ ok: true, sanitized: result });
});

export default knowledgeRouter;
