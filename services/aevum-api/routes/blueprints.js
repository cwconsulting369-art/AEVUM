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
import { supabase } from '../lib/supabase.js';

export const blueprintsRouter = Router();

const TYPE_MAP = {
  'dashboards': 'blueprint_dashboards',
  'agents': 'blueprint_agents',
  'workflows': 'blueprint_workflows',
  'pricing': 'blueprint_pricing',
  'audit-forms': 'blueprint_audit_forms',
  'marketing-thesis': 'blueprint_marketing_thesis'
};

function requireAdmin(req, res, next) {
  const tok = req.get('x-aevum-admin-token');
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!expected) return res.status(500).json({ ok: false, error: 'admin_token_not_configured' });
  if (!tok || tok !== expected) return res.status(401).json({ ok: false, error: 'unauthorized' });
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
  if (!req.body?.id) return res.status(400).json({ ok: false, error: 'id_required' });
  const r = await supabase.insert(table, req.body);
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
  const r = await supabase.update(table, `id=eq.${encodeURIComponent(req.params.id)}`, req.body);
  if (!r.ok) return res.status(500).json({ ok: false, error: r.error });
  if (!r.data?.length) return res.status(404).json({ ok: false, error: 'blueprint_not_found' });
  res.json({ ok: true, blueprint: r.data[0] });
});
