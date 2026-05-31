// /api/referrals — AEVUM Referral Engine
//
// Public:
//   GET    /api/referrals/programs/:slug                        — Marketing-Page-Data für Code-Owner
//   POST   /api/referrals/leads/:account_slug/with-code         — Lead-Form mit Referral-Code (öffentlich)
//
// Customer (JWT — Patrick sieht seine Codes/Referrals):
//   GET    /api/referrals/me/programs                           — Programme für eingeloggte Customer
//   GET    /api/referrals/me/programs/:program_id/codes         — Codes seines Programms
//   POST   /api/referrals/me/programs/:program_id/codes         — Neuen Code für Referrer ausstellen
//   GET    /api/referrals/me/programs/:program_id/referrals     — Tracked Referrals
//   PATCH  /api/referrals/me/referrals/:id                      — Status-Update (qualified/converted/rewarded)
//
// Admin (x-admin-token — Carlos):
//   POST   /api/referrals/admin/programs                        — Programm anlegen
//   PATCH  /api/referrals/admin/programs/:id                    — Programm editieren

import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { supabase } from '../lib/supabase.js';
import { safeCompare } from '../lib/security.js';
import { requireCustomerAuth } from '../lib/crypto.js';

export const referralsRouter = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE_RE = /^[A-Z0-9][A-Z0-9-]{1,49}$/i;
const REF_LANDING_URL = process.env.REF_LANDING_URL || 'https://leben-in-thailand.de';

function hashIp(ip) {
  if (!ip) return null;
  const salt = process.env.AEVUM_IP_HASH_SALT || 'aevum-default-salt-change-in-prod';
  return crypto.createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 32);
}

function clientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers['x-aevum-admin-token'];
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!token || !expected || !safeCompare(token, expected)) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

function generateCode(seed) {
  // PATRICK-<slug>-XXX  (3-4 char suffix for uniqueness)
  const clean = (seed || 'REF').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) || 'REF';
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${clean}-${suffix}`;
}

function unwrap(r) {
  if (!r || !r.ok) return null;
  if (Array.isArray(r.data)) return r.data;
  return r.data;
}

// ────────────────────────────────────────────────────────────
// PUBLIC — Marketing-Page-Data (no auth)
// ────────────────────────────────────────────────────────────

referralsRouter.get('/programs/:slug', async (req, res) => {
  const slug = String(req.params.slug || '').trim().toLowerCase();
  if (!slug) return res.status(400).json({ ok: false, error: 'missing_slug' });
  const r = await supabase.select('referral_programs',
    `select=id,name,slug,status,referrer_reward_description,referee_reward_description,pitch_text,share_template&slug=eq.${encodeURIComponent(slug)}&status=eq.active&limit=1`
  );
  const rows = unwrap(r);
  if (!rows?.length) return res.status(404).json({ ok: false, error: 'program_not_found' });
  res.json({ ok: true, program: rows[0] });
});

// PUBLIC — Reflink click → track + redirect to site (?ref=CODE)
// Shareable short link: https://api.aevum-system.de/api/referrals/r/CODE
referralsRouter.get('/r/:code', async (req, res) => {
  const code = String(req.params.code || '').trim().toUpperCase();
  const dest = `${REF_LANDING_URL}/?ref=${encodeURIComponent(code)}`;
  if (!CODE_RE.test(code)) return res.redirect(302, REF_LANDING_URL);
  try {
    const codeRes = await supabase.select('referral_codes', `?select=id&code=eq.${encodeURIComponent(code)}&active=eq.true&limit=1`);
    const row = unwrap(codeRes)?.[0];
    // fire-and-forget visit + click_count; never block the redirect
    if (row) {
      supabase.insert('referral_visits', {
        code_id: row.id, code, kind: 'click',
        path: '/', ip_hash: hashIp(clientIp(req)),
        user_agent: String(req.headers['user-agent'] || '').slice(0, 400),
        referer: String(req.headers['referer'] || '').slice(0, 400)
      }).catch(() => {});
      // increment denormalised click_count
      supabase.select('referral_codes', `?select=click_count&id=eq.${row.id}&limit=1`).then(r => {
        const cur = unwrap(r)?.[0]?.click_count || 0;
        supabase.update('referral_codes', `?id=eq.${row.id}`, { click_count: cur + 1 }).catch(() => {});
      }).catch(() => {});
    }
  } catch (e) { /* swallow — redirect is what matters */ }
  res.redirect(302, dest);
});

// PUBLIC — Pageview beacon for journey tracking (lightweight)
const VisitSchema = z.object({
  code: z.string().min(2).max(50),
  path: z.string().max(300).optional()
});
referralsRouter.post('/track/visit', async (req, res) => {
  const parsed = VisitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false });
  const code = parsed.data.code.toUpperCase();
  if (!CODE_RE.test(code)) return res.json({ ok: true }); // silently ignore garbage
  const codeRes = await supabase.select('referral_codes', `?select=id&code=eq.${encodeURIComponent(code)}&active=eq.true&limit=1`);
  const row = unwrap(codeRes)?.[0];
  if (row) {
    await supabase.insert('referral_visits', {
      code_id: row.id, code, kind: 'pageview',
      path: (parsed.data.path || '/').slice(0, 300), ip_hash: hashIp(clientIp(req)),
      user_agent: String(req.headers['user-agent'] || '').slice(0, 400)
    });
  }
  res.json({ ok: true });
});

// PUBLIC — Submit lead with referral code (extends customer-leads but routes through referral)
const ReferralLeadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(50).optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
  referral_code: z.string().min(3).max(50)
});

referralsRouter.post('/leads/:account_slug/with-code', async (req, res) => {
  const parsed = ReferralLeadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const data = parsed.data;

  // Resolve account
  const accountSlug = String(req.params.account_slug || '').trim().toLowerCase();
  const accRes = await supabase.select('accounts', `select=id&slug=eq.${encodeURIComponent(accountSlug)}&limit=1`);
  const acc = unwrap(accRes)?.[0];
  if (!acc) return res.status(404).json({ ok: false, error: 'account_not_found' });

  // Resolve referral code (must be active, program must be active)
  const codeRes = await supabase.select('referral_codes',
    `select=id,program_id,referrer_name,referrer_email,active,expires_at,uses_count&code=eq.${encodeURIComponent(data.referral_code.toUpperCase())}&active=eq.true&limit=1`
  );
  const code = unwrap(codeRes)?.[0];
  if (!code) return res.status(404).json({ ok: false, error: 'invalid_referral_code' });
  if (code.expires_at && new Date(code.expires_at) < new Date()) {
    return res.status(410).json({ ok: false, error: 'referral_code_expired' });
  }

  // Insert customer_lead
  const leadIns = await supabase.insert('customer_leads', {
    account_id: acc.id,
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    source: 'referral',
    source_detail: data.referral_code.toUpperCase(),
    referral_code: data.referral_code.toUpperCase(),
    consent_given: true,
    consent_text: `Empfehlung von ${code.referrer_name || code.referrer_email || 'Code'} ${data.referral_code.toUpperCase()}`,
    consent_timestamp: new Date().toISOString(),
    raw_data: { referral_message: data.message || null, referrer: code.referrer_name, referrer_email: code.referrer_email }
  });
  if (!leadIns.ok) return res.status(500).json({ ok: false, error: 'lead_insert_failed', details: leadIns.error });
  const lead = Array.isArray(leadIns.data) ? leadIns.data[0] : leadIns.data;

  // Insert referral event
  const refIns = await supabase.insert('referrals', {
    program_id: code.program_id,
    code_id: code.id,
    lead_id: lead?.id || null,
    referee_name: data.name,
    referee_email: data.email,
    referee_phone: data.phone || null,
    referee_notes: data.message || null,
    status: 'pending'
  });
  if (!refIns.ok) return res.status(500).json({ ok: false, error: 'referral_insert_failed', details: refIns.error });
  const ref = Array.isArray(refIns.data) ? refIns.data[0] : refIns.data;

  // Backlink referral_id on lead
  if (lead?.id && ref?.id) {
    await supabase.update('customer_leads', `?id=eq.${lead.id}`, { referral_id: ref.id });
  }

  res.json({ ok: true, lead_id: lead?.id, referral_id: ref?.id });
});

// ────────────────────────────────────────────────────────────
// CUSTOMER (JWT) — Patrick's view of his programs
// ────────────────────────────────────────────────────────────

const customerRouter = Router();
customerRouter.use(requireCustomerAuth);

customerRouter.get('/programs', async (req, res) => {
  // List programs for projects this customer owns
  const projRes = await supabase.select('projects', `select=id,slug,name&account_id=eq.${req.customer.account_id}`);
  const projects = unwrap(projRes) || [];
  if (!projects.length) return res.json({ ok: true, programs: [] });
  const ids = projects.map(p => p.id).map(id => `"${id}"`).join(',');
  const progRes = await supabase.select('referral_programs',
    `select=*&project_id=in.(${ids})&order=created_at.desc`
  );
  res.json({ ok: true, programs: unwrap(progRes) || [] });
});

customerRouter.get('/programs/:program_id/codes', async (req, res) => {
  const { program_id } = req.params;
  if (!UUID_RE.test(program_id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  // Ownership check
  const ownership = await assertProgramOwnership(program_id, req.customer.account_id);
  if (!ownership.ok) return res.status(ownership.status).json({ ok: false, error: ownership.error });
  const r = await supabase.select('referral_codes',
    `select=*&program_id=eq.${program_id}&order=created_at.desc&limit=200`
  );
  res.json({ ok: true, codes: unwrap(r) || [] });
});

const CodeCreateSchema = z.object({
  referrer_name: z.string().min(1).max(200),
  referrer_email: z.string().email().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  expires_at: z.string().optional().nullable()
});

customerRouter.post('/programs/:program_id/codes', async (req, res) => {
  const { program_id } = req.params;
  if (!UUID_RE.test(program_id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const parsed = CodeCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const ownership = await assertProgramOwnership(program_id, req.customer.account_id);
  if (!ownership.ok) return res.status(ownership.status).json({ ok: false, error: ownership.error });

  // Try up to 5 times in case of unique collision
  let code = null;
  for (let i = 0; i < 5 && !code; i++) {
    const candidate = generateCode(parsed.data.referrer_name);
    const ins = await supabase.insert('referral_codes', {
      program_id,
      code: candidate,
      referrer_name: parsed.data.referrer_name,
      referrer_email: parsed.data.referrer_email || null,
      notes: parsed.data.notes || null,
      expires_at: parsed.data.expires_at || null,
      active: true
    });
    if (ins.ok) {
      code = Array.isArray(ins.data) ? ins.data[0] : ins.data;
    }
  }
  if (!code) return res.status(500).json({ ok: false, error: 'code_generation_failed' });
  res.json({ ok: true, code });
});

customerRouter.get('/programs/:program_id/referrals', async (req, res) => {
  const { program_id } = req.params;
  if (!UUID_RE.test(program_id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const ownership = await assertProgramOwnership(program_id, req.customer.account_id);
  if (!ownership.ok) return res.status(ownership.status).json({ ok: false, error: ownership.error });
  const r = await supabase.select('referrals',
    `select=*&program_id=eq.${program_id}&order=created_at.desc&limit=500`
  );
  res.json({ ok: true, referrals: unwrap(r) || [] });
});

const ReferralPatchSchema = z.object({
  status: z.enum(['pending','qualified','converted','rewarded','expired','rejected']).optional(),
  referrer_reward_paid: z.boolean().optional(),
  referrer_reward_amount_eur: z.number().nonnegative().optional(),
  referrer_reward_notes: z.string().max(2000).optional(),
  referee_reward_paid: z.boolean().optional(),
  referee_reward_amount_eur: z.number().nonnegative().optional()
}).refine(d => Object.keys(d).length > 0, { message: 'empty_patch' });

customerRouter.patch('/referrals/:id', async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const parsed = ReferralPatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });

  // Resolve referral → program → project → account ownership
  const refRes = await supabase.select('referrals', `select=program_id&id=eq.${id}&limit=1`);
  const ref = unwrap(refRes)?.[0];
  if (!ref) return res.status(404).json({ ok: false, error: 'referral_not_found' });
  const ownership = await assertProgramOwnership(ref.program_id, req.customer.account_id);
  if (!ownership.ok) return res.status(ownership.status).json({ ok: false, error: ownership.error });

  // Lifecycle timestamps
  const patch = { ...parsed.data };
  const now = new Date().toISOString();
  if (patch.status === 'qualified') patch.qualified_at = now;
  if (patch.status === 'converted') patch.converted_at = now;
  if (patch.status === 'rewarded') patch.rewarded_at = now;
  if (patch.referrer_reward_paid === true) patch.referrer_reward_paid_at = now;
  if (patch.referee_reward_paid === true) patch.referee_reward_paid_at = now;

  const upd = await supabase.update('referrals', `?id=eq.${id}`, patch);
  if (!upd.ok) return res.status(500).json({ ok: false, error: 'update_failed', details: upd.error });
  res.json({ ok: true, referral: Array.isArray(upd.data) ? upd.data[0] : upd.data });
});

async function assertProgramOwnership(program_id, account_id) {
  const r = await supabase.select('referral_programs',
    `select=id,project_id,projects:projects!inner(account_id)&id=eq.${program_id}&projects.account_id=eq.${account_id}&limit=1`
  );
  const row = unwrap(r)?.[0];
  if (!row) {
    // Fallback: simpler check without join
    const p = await supabase.select('referral_programs', `select=project_id&id=eq.${program_id}&limit=1`);
    const prog = unwrap(p)?.[0];
    if (!prog) return { ok: false, status: 404, error: 'program_not_found' };
    const pr = await supabase.select('projects', `select=account_id&id=eq.${prog.project_id}&limit=1`);
    const proj = unwrap(pr)?.[0];
    if (!proj || proj.account_id !== account_id) return { ok: false, status: 403, error: 'forbidden' };
  }
  return { ok: true };
}

referralsRouter.use('/me', customerRouter);

// ────────────────────────────────────────────────────────────
// ADMIN — Carlos
// ────────────────────────────────────────────────────────────

const adminRouter = Router();
adminRouter.use(requireAdmin);

const ProgramCreateSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100),
  referrer_reward_type: z.enum(['cash','voucher','service-credit','travel-voucher','custom']).optional(),
  referrer_reward_value_eur: z.number().nonnegative().optional(),
  referrer_reward_description: z.string().max(2000).optional(),
  referee_reward_type: z.enum(['discount','voucher','bonus-service','custom']).optional(),
  referee_reward_value_eur: z.number().nonnegative().optional(),
  referee_reward_description: z.string().max(2000).optional(),
  trigger_event: z.enum(['lead_qualified','meeting_booked','closed_won']).optional(),
  pitch_text: z.string().max(5000).optional(),
  share_template: z.string().max(2000).optional()
});

adminRouter.post('/programs', async (req, res) => {
  const parsed = ProgramCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const ins = await supabase.insert('referral_programs', { ...parsed.data, status: 'active' });
  if (!ins.ok) return res.status(500).json({ ok: false, error: 'insert_failed', details: ins.error });
  res.json({ ok: true, program: Array.isArray(ins.data) ? ins.data[0] : ins.data });
});

adminRouter.patch('/programs/:id', async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const upd = await supabase.update('referral_programs', `?id=eq.${id}`, { ...req.body, updated_at: new Date().toISOString() });
  if (!upd.ok) return res.status(500).json({ ok: false, error: 'update_failed', details: upd.error });
  res.json({ ok: true, program: Array.isArray(upd.data) ? upd.data[0] : upd.data });
});

// ADMIN — Reflink stats for dashboard (codes with stats + recent visits)
adminRouter.get('/programs/:id/codes', async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const r = await supabase.select('referral_codes',
    `select=id,code,referrer_name,referrer_email,active,click_count,uses_count,qualified_count,closed_won_count,total_reward_earned_eur,created_at&program_id=eq.${id}&order=created_at.desc&limit=500`);
  res.json({ ok: true, codes: unwrap(r) || [] });
});

adminRouter.get('/programs/:id/visits', async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const limit = Math.min(parseInt(req.query.limit) || 200, 1000);
  // resolve code ids of this program, then visits
  const codesR = await supabase.select('referral_codes', `select=id&program_id=eq.${id}&limit=500`);
  const ids = (unwrap(codesR) || []).map(c => `"${c.id}"`).join(',');
  if (!ids) return res.json({ ok: true, visits: [] });
  const r = await supabase.select('referral_visits',
    `select=id,code,kind,path,created_at&code_id=in.(${ids})&order=created_at.desc&limit=${limit}`);
  res.json({ ok: true, visits: unwrap(r) || [] });
});

// Resolve a referral program by slug (dashboard wiring: slug → program_id)
adminRouter.get('/program-by-slug/:slug', async (req, res) => {
  const slug = String(req.params.slug || '').trim().toLowerCase();
  const r = await supabase.select('referral_programs', `select=id,name,slug,status&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  const row = unwrap(r)?.[0];
  if (!row) return res.status(404).json({ ok: false, error: 'program_not_found' });
  res.json({ ok: true, program: row });
});

referralsRouter.use('/admin', adminRouter);
