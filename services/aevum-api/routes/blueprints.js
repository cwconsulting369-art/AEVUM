// /api/blueprints — AEVUM v2 Blueprint-Library (Read + Admin-Write)
//
// Endpoints:
//   GET    /api/blueprints                       — overview (counts per type)
//   GET    /api/blueprints/dashboards            — list dashboard blueprints
//   GET    /api/blueprints/agents                — list agent blueprints
//   GET    /api/blueprints/workflows             — list workflow blueprints
//   GET    /api/blueprints/pricing               — list pricing tiers
//   GET    /api/blueprints/audit-forms           — list audit-form versions
//   GET    /api/blueprints/marketing-thesis      — list marketing-thesis templates
//   GET    /api/blueprints/:type/:id             — get single blueprint
//   POST   /api/blueprints/:type                 — create new blueprint (admin)
//   PATCH  /api/blueprints/:type/:id             — update (admin)

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { safeCompare } from '../lib/security.js';

export const blueprintsRouter = Router();

const TYPE_MAP = {
  'dashboards': 'blueprint_dashboards',
  'agents': 'blueprint_agents',
  'workflows': 'blueprint_workflows',
  'pricing': 'blueprint_pricing',
  'audit-forms': 'blueprint_audit_forms',
  'marketing-thesis': 'blueprint_marketing_thesis'
};

// ──────────────────────────────────────────────────────────
// Validation Schemas (admin POST/PATCH bodies)
// Pragmatic per-type schemas with required-fields-strict + passthrough for
// blueprint-specific JSON. Prevents trash being persisted into DB.
// ──────────────────────────────────────────────────────────
const baseFields = {
  id: z.string().regex(/^[a-z0-9_-]+$/i).min(2).max(100),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  is_active: z.boolean().optional(),
  version: z.string().max(50).optional(),
  tags: z.array(z.string().max(60)).max(30).optional()
};

const CREATE_SCHEMAS = {
  'dashboards':       z.object({ ...baseFields, sections: z.array(z.any()).optional(), config: z.record(z.any()).optional() }).passthrough(),
  'agents':           z.object({ ...baseFields, capabilities: z.array(z.any()).optional(), config: z.record(z.any()).optional() }).passthrough(),
  'workflows':        z.object({ ...baseFields, steps: z.array(z.any()).optional(), trigger: z.record(z.any()).optional() }).passthrough(),
  'pricing':          z.object({ ...baseFields, tier: z.string().max(60).optional(), setup_eur: z.number().nonnegative().optional(), monthly_eur: z.number().nonnegative().optional() }).passthrough(),
  'audit-forms':      z.object({ ...baseFields, fields: z.array(z.any()).optional() }).passthrough(),
  'marketing-thesis': z.object({ ...baseFields, thesis: z.string().max(5000).optional() }).passthrough()
};

// PATCH schemas: same as create but id is optional + all fields optional
function patchSchemaFor(type) {
  const base = {
    id: z.string().regex(/^[a-z0-9_-]+$/i).min(2).max(100).optional(),
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    is_active: z.boolean().optional(),
    version: z.string().max(50).optional(),
    tags: z.array(z.string().max(60)).max(30).optional()
  };
  return z.object(base).passthrough();
}

function requireAdmin(req, res, next) {
  const tok = req.get('x-aevum-admin-token');
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!expected) return res.status(500).json({ ok: false, error: 'admin_token_not_configured' });
  if (!tok || !safeCompare(tok, expected)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  next();
}

// ──────────────────────────────────────────────────────────
// GET /api/blueprints — overview
// ──────────────────────────────────────────────────────────
blueprintsRouter.get('/', async (_req, res) => {
  const counts = {};
  for (const [type, table] of Object.entries(TYPE_MAP)) {
    const r = await supabase.select(table, 'select=id&is_active=eq.true');
    counts[type] = r.data?.length ?? 0;
  }
  res.json({ ok: true, counts });
});

// ──────────────────────────────────────────────────────────
// GET /api/blueprints/:type
// ──────────────────────────────────────────────────────────
blueprintsRouter.get('/:type', async (req, res) => {
  const table = TYPE_MAP[req.params.type];
  if (!table) return res.status(404).json({ ok: false, error: 'unknown_blueprint_type' });
  const onlyActive = req.query.all !== '1';
  const filter = onlyActive ? '&is_active=eq.true' : '';
  const r = await supabase.select(table, `select=*${filter}&order=id.asc`);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  res.json({ ok: true, type: req.params.type, items: r.data });
});

// ──────────────────────────────────────────────────────────
// GET /api/blueprints/:type/:id
// ──────────────────────────────────────────────────────────
blueprintsRouter.get('/:type/:id', async (req, res) => {
  const table = TYPE_MAP[req.params.type];
  if (!table) return res.status(404).json({ ok: false, error: 'unknown_blueprint_type' });
  const r = await supabase.select(table, `select=*&id=eq.${encodeURIComponent(req.params.id)}`);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  if (!r.data?.length) return res.status(404).json({ ok: false, error: 'blueprint_not_found' });
  res.json({ ok: true, blueprint: r.data[0] });
});

// ──────────────────────────────────────────────────────────
// POST /api/blueprints/:type — create
// ──────────────────────────────────────────────────────────
blueprintsRouter.post('/:type', requireAdmin, async (req, res) => {
  const table = TYPE_MAP[req.params.type];
  if (!table) return res.status(404).json({ ok: false, error: 'unknown_blueprint_type' });
  const schema = CREATE_SCHEMAS[req.params.type];
  const parsed = schema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const r = await supabase.insert(table, parsed.data);
  if (!r.ok) {
    if (r.status === 409) return res.status(409).json({ ok: false, error: 'id_already_exists' });
    return res.status(500).json({ ok: false, error: r.error });
  }
  res.status(201).json({ ok: true, blueprint: r.data?.[0] });
});

// ──────────────────────────────────────────────────────────
// PATCH /api/blueprints/:type/:id
// ──────────────────────────────────────────────────────────
blueprintsRouter.patch('/:type/:id', requireAdmin, async (req, res) => {
  const table = TYPE_MAP[req.params.type];
  if (!table) return res.status(404).json({ ok: false, error: 'unknown_blueprint_type' });
  const schema = patchSchemaFor(req.params.type);
  const parsed = schema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const r = await supabase.update(table, `id=eq.${encodeURIComponent(req.params.id)}`, parsed.data);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  if (!r.data?.length) return res.status(404).json({ ok: false, error: 'blueprint_not_found' });
  res.json({ ok: true, blueprint: r.data[0] });
});
