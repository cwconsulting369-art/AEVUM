// /api/content — AEVUM Content/Social-Funnel-Engine (account-scoped)
//
// Facebook + LinkedIn als getrennte Kanäle. Content-Pieces idea→draft→approved→scheduled→published.
// Draft-Engine: Claude generiert aus icp_profiles + brand_voice + content_topics (research-seeded,
// Patrick-editierbar). Approve läuft über thailandre-bot (Telegram). Funnel-Aggregat speist Dashboard.
//
// Public: keine.
// Admin (x-admin-token):
//   GET   /api/content/:slug/channels
//   GET   /api/content/:slug/pieces?status=&platform=&segment=&limit=
//   POST  /api/content/:slug/pieces
//   PATCH /api/content/:slug/pieces/:id
//   POST  /api/content/:slug/pieces/generate
//   GET   /api/content/:slug/pieces/:id/metrics
//   GET   /api/content/:slug/funnel

import { Router } from 'express';
import { z } from 'zod';
import http from 'http';
import { supabase } from '../lib/supabase.js';
import { safeCompare } from '../lib/security.js';
import { callAnthropic } from '../lib/anthropic-helper.js';
import { encryptSecret } from '../lib/crypto.js';
import { publishPiece } from '../lib/social-publish.js';

export const contentRouter = Router();

const API_BASE = process.env.AEVUM_API_BASE_URL || 'https://api.aevum-system.de';
const PORTAL_BASE = process.env.AEVUM_PORTAL_BASE_URL || 'https://app.aevum-system.de';
const OAUTH_PLATFORMS = ['facebook', 'linkedin'];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const THAILANDRE_NOTIFY_URL = process.env.THAILANDRE_BOT_NOTIFY_URL || 'http://127.0.0.1:4105/notify';
const PLATFORMS = ['facebook', 'linkedin', 'instagram', 'other'];
const SEGMENTS = ['auswanderer', 'investor', 'beides'];
const STATUSES = ['idea', 'draft', 'approved', 'scheduled', 'published', 'archived'];

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers['x-aevum-admin-token'];
  const expected = process.env.AEVUM_ADMIN_TOKEN;
  if (!token || !expected || !safeCompare(token, expected)) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

function unwrap(r) {
  if (!r || !r.ok) return null;
  return r.data;
}

async function getAccountBySlug(slug) {
  const r = await supabase.select('accounts', `?slug=eq.${encodeURIComponent(slug)}&select=id,slug,name&limit=1`);
  const rows = unwrap(r);
  return rows && rows.length ? rows[0] : null;
}

// Resolve account from :slug param once per request
async function withAccount(req, res, next) {
  const account = await getAccountBySlug(req.params.slug);
  if (!account) return res.status(404).json({ ok: false, error: 'account_not_found' });
  req.account = account;
  next();
}

// Fire-and-forget notify to thailandre-bot (content approval card)
function notifyBotApproval(piece) {
  return new Promise((resolve) => {
    try {
      const data = JSON.stringify({
        type: 'content_approval',
        piece_id: piece.id,
        account: 'patrick-roth',
        platform: piece.platform,
        segment: piece.segment,
        awareness_stage: piece.awareness_stage || null,
        title: piece.title || '(ohne Titel)',
        body: piece.body || '',
        audience: 'both'
      });
      const u = new URL(THAILANDRE_NOTIFY_URL);
      const r = http.request({
        hostname: u.hostname, port: u.port || 80, path: u.pathname + u.search, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
      }, (resp) => { let b = ''; resp.on('data', d => b += d); resp.on('end', () => resolve({ ok: resp.statusCode < 400, raw: b })); });
      r.on('error', (e) => { console.warn('[content] bot-notify failed:', e.message); resolve({ ok: false, error: e.message }); });
      r.setTimeout(4000, () => { r.destroy(); resolve({ ok: false, error: 'timeout' }); });
      r.write(data); r.end();
    } catch (e) { resolve({ ok: false, error: e.message }); }
  });
}

// Resolve (or pick) the account's project — token-storage lives in project_apis.
// Prefer matching project_slug, else the account's first/onboarding project.
async function getAccountProject(accountId, slug) {
  const slugQ = slug ? `&slug=eq.${encodeURIComponent(slug)}` : '';
  const r = await supabase.select('projects',
    `?account_id=eq.${accountId}${slugQ}&select=id,slug,name&order=created_at.asc&limit=1`);
  const rows = unwrap(r);
  return rows && rows.length ? rows[0] : null;
}

// Load the decrypted social token for a channel from project_apis (service=social_<platform>).
// Returns null if no project / no row. Tokens are NEVER logged.
async function getChannelToken(accountId, platform) {
  const project = await getAccountProject(accountId);
  if (!project) return null;
  const r = await supabase.select('project_apis',
    `?project_id=eq.${project.id}&service=eq.social_${platform}&order=added_at.desc&select=id,key_encrypted,health&limit=1`);
  const rows = unwrap(r);
  if (!rows || !rows.length) return null;
  try {
    const { decryptSecret } = await import('../lib/crypto.js');
    return decryptSecret(rows[0].key_encrypted);
  } catch (e) {
    console.error('[content] token decrypt failed:', e.message);
    return null;
  }
}

// ──────────────────────────────────────────────────────────
// GET /channels
// ──────────────────────────────────────────────────────────

contentRouter.get('/:slug/channels', requireAdmin, withAccount, async (req, res) => {
  const r = await supabase.select('content_channels',
    `?account_id=eq.${req.account.id}&select=id,platform,display_name,external_id,connected,enabled&order=platform.asc`);
  res.json({ ok: true, channels: unwrap(r) || [] });
});

// ──────────────────────────────────────────────────────────
// GET /pieces
// ──────────────────────────────────────────────────────────

contentRouter.get('/:slug/pieces', requireAdmin, withAccount, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  let q = `?account_id=eq.${req.account.id}&order=created_at.desc&limit=${limit}`;
  q += '&select=id,platform,kind,status,segment,topic,title,body,visual_url,utm_campaign,awareness_stage,icp_profile_id,scheduled_at,published_at,external_post_id,approved_by,approved_at,created_by,created_at,updated_at';
  if (req.query.status && STATUSES.includes(req.query.status)) q += `&status=eq.${req.query.status}`;
  if (req.query.platform && PLATFORMS.includes(req.query.platform)) q += `&platform=eq.${req.query.platform}`;
  if (req.query.segment && SEGMENTS.includes(req.query.segment)) q += `&segment=eq.${req.query.segment}`;
  const r = await supabase.select('content_pieces', q);
  res.json({ ok: true, pieces: unwrap(r) || [] });
});

// ──────────────────────────────────────────────────────────
// POST /pieces  — manual create
// ──────────────────────────────────────────────────────────

const PieceCreate = z.object({
  platform: z.enum(['facebook', 'linkedin', 'instagram', 'other']),
  segment: z.enum(['auswanderer', 'investor', 'beides']).optional(),
  kind: z.enum(['post', 'article', 'story', 'reel', 'carousel']).optional(),
  status: z.enum(['idea', 'draft', 'approved', 'scheduled', 'published', 'archived']).optional(),
  topic: z.string().max(300).optional(),
  title: z.string().max(300).optional(),
  body: z.string().max(20000).optional(),
  visual_url: z.string().max(1000).optional(),
  utm_campaign: z.string().max(120).optional(),
  awareness_stage: z.string().max(40).optional(),
  scheduled_at: z.string().optional()
});

contentRouter.post('/:slug/pieces', requireAdmin, withAccount, async (req, res) => {
  const parsed = PieceCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const ins = await supabase.insert('content_pieces', {
    account_id: req.account.id,
    status: 'draft',
    created_by: 'patrick',
    ...parsed.data
  });
  if (!ins.ok) return res.status(500).json({ ok: false, error: 'insert_failed', details: ins.error });
  res.json({ ok: true, piece: Array.isArray(ins.data) ? ins.data[0] : ins.data });
});

// ──────────────────────────────────────────────────────────
// PATCH /pieces/:id  — update / status-transition
// ──────────────────────────────────────────────────────────

const PiecePatch = z.object({
  status: z.enum(['idea', 'draft', 'approved', 'scheduled', 'published', 'archived']).optional(),
  segment: z.enum(['auswanderer', 'investor', 'beides']).optional(),
  kind: z.enum(['post', 'article', 'story', 'reel', 'carousel']).optional(),
  topic: z.string().max(300).optional(),
  title: z.string().max(300).optional(),
  body: z.string().max(20000).optional(),
  visual_url: z.string().max(1000).optional(),
  utm_campaign: z.string().max(120).optional(),
  awareness_stage: z.string().max(40).optional(),
  scheduled_at: z.string().nullable().optional(),
  approved_by: z.string().max(60).optional()
}).refine(d => Object.keys(d).length > 0, { message: 'empty_patch' });

contentRouter.patch('/:slug/pieces/:id', requireAdmin, withAccount, async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const parsed = PiecePatch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });

  const patch = { ...parsed.data, updated_at: new Date().toISOString() };
  const now = new Date().toISOString();
  if (patch.status === 'approved') { patch.approved_at = now; if (!patch.approved_by) patch.approved_by = 'patrick'; }
  if (patch.status === 'published') patch.published_at = now;

  // account-scope guard: only update if piece belongs to this account
  const upd = await supabase.update('content_pieces', `?id=eq.${id}&account_id=eq.${req.account.id}`, patch);
  if (!upd.ok) return res.status(500).json({ ok: false, error: 'update_failed', details: upd.error });
  const rows = upd.data;
  if (!rows || (Array.isArray(rows) && !rows.length)) return res.status(404).json({ ok: false, error: 'piece_not_found' });
  res.json({ ok: true, piece: Array.isArray(rows) ? rows[0] : rows });
});

// ──────────────────────────────────────────────────────────
// POST /pieces/generate  — Claude-Draft-Engine
// ──────────────────────────────────────────────────────────

const GenerateSchema = z.object({
  segment: z.enum(['auswanderer', 'investor', 'beides']),
  platform: z.enum(['facebook', 'linkedin', 'instagram', 'other']),
  awareness_stage: z.string().max(40).optional(),
  topic_id: z.string().uuid().optional(),
  topic: z.string().max(300).optional(),
  n: z.number().int().min(1).max(3).optional()
});

const PLATFORM_GUIDE = {
  facebook: 'Facebook (Hauptkanal Auswanderer): persönlich, nahbar, Story/Vulnerability, Du-Form. Native-Post-Stil, kein nackter Link. Hook in Zeile 1.',
  linkedin: 'LinkedIn (Hauptkanal Investoren): seriös, faktenbasiert, Tension-Hook mit konkreter Story/Zahl in Zeile 1. Text/Carousel-Stil. Externe Links nur in den Kommentar (im Body erwähnen, nicht einbetten).',
  instagram: 'Instagram: visuell, kurz, Caption mit Hook + Hashtags am Ende.',
  other: 'Allgemeiner Social-Post: klarer Hook, ein Gedanke, eine Handlungseinladung.'
};

contentRouter.post('/:slug/pieces/generate', requireAdmin, withAccount, async (req, res) => {
  const parsed = GenerateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const { segment, platform, awareness_stage, topic_id, n = 1 } = parsed.data;
  let topicText = parsed.data.topic || null;

  // Pull editable config (research-seeded → Patrick-overridable)
  const segFilter = segment === 'beides' ? '' : `&segment=in.(${segment},beides)`;
  const [icpR, voiceR, topicR] = await Promise.all([
    supabase.select('icp_profiles', `?account_id=eq.${req.account.id}${segment === 'beides' ? '' : `&segment=eq.${segment}`}&limit=1`),
    supabase.select('brand_voice', `?account_id=eq.${req.account.id}&limit=1`),
    topic_id
      ? supabase.select('content_topics', `?id=eq.${topic_id}&account_id=eq.${req.account.id}&limit=1`)
      : (topicText ? Promise.resolve({ ok: true, data: [] })
        : supabase.select('content_topics', `?account_id=eq.${req.account.id}&status=eq.open${segFilter}${awareness_stage ? `&awareness_stage=eq.${awareness_stage}` : ''}&order=created_at.asc&limit=1`))
  ]);

  const icp = unwrap(icpR)?.[0] || null;
  const voice = unwrap(voiceR)?.[0] || null;
  const topicRow = unwrap(topicR)?.[0] || null;
  if (topicRow && !topicText) topicText = topicRow.topic + (topicRow.angle ? ` — Angle: ${topicRow.angle}` : '');
  const awareness = awareness_stage || topicRow?.awareness_stage || icp?.awareness_default || 'problem';

  // System prompt = Brand-Voice + ICP (gecacht — stabil über Aufrufe)
  const sysParts = [
    'Du bist Patricks Content-Texter für "Leben in Thailand" (Patrick Roth, ehrlicher Berater für Auswandern & Immobilien in Pattaya/Thailand). Du schreibst auf Deutsch, Du-Form.',
    'EHRLICHKEITS-BRAND (HART): keine erfundenen Zahlen, keine Fake-Testimonials, keine künstliche Verknappung, kein Hype, kein Verkäufer-Sprech. Bei Auslandsimmobilien sind Hype/Druck = Scam-Trigger. Risiken ehrlich benennen schafft Vertrauen.'
  ];
  if (voice) {
    sysParts.push(`MARKENSTIMME:\nTon: ${voice.tone || ''}`);
    if (Array.isArray(voice.dos) && voice.dos.length) sysParts.push(`Do's: ${voice.dos.join('; ')}`);
    if (Array.isArray(voice.donts) && voice.donts.length) sysParts.push(`Don'ts: ${voice.donts.join('; ')}`);
    if (voice.examples) sysParts.push(`Beispiel-Stimme: ${voice.examples}`);
  }
  if (icp) {
    sysParts.push(`ZIELGRUPPE (${icp.name || segment}): ${icp.summary || ''}`);
    if (Array.isArray(icp.pains) && icp.pains.length) sysParts.push(`Pains: ${icp.pains.join('; ')}`);
    if (Array.isArray(icp.desires) && icp.desires.length) sysParts.push(`Wünsche: ${icp.desires.join('; ')}`);
    if (Array.isArray(icp.objections) && icp.objections.length) sysParts.push(`Einwände: ${icp.objections.join('; ')}`);
    if (icp.language_notes) sysParts.push(`Sprache: ${icp.language_notes}`);
  }
  const system = sysParts.join('\n\n');

  // Delimiter-Format statt JSON: robust gegen mehrzeilige Post-Texte mit Emojis/Anführungszeichen.
  const userMsg = [
    `Schreibe ${n} ${platform}-Post${n > 1 ? 's' : ''} für das Segment "${segment}", Awareness-Stufe "${awareness}".`,
    `Plattform-Stil: ${PLATFORM_GUIDE[platform]}`,
    topicText ? `Thema: ${topicText}` : 'Wähle ein Thema, das zur Zielgruppe + Awareness-Stufe passt.',
    '',
    'Antworte AUSSCHLIESSLICH in diesem Format — keine Einleitung, keine Erklärung, kein Markdown-Codeblock:',
    'TITEL: <kurzer interner Titel>',
    'POST:',
    '<der fertige Post-Text inkl. Hook und ggf. Hashtags>',
    n > 1 ? 'Trenne mehrere Posts durch eine eigene Zeile, die nur %%% enthält.' : ''
  ].filter(Boolean).join('\n');

  let raw;
  try {
    const resp = await callAnthropic({
      messages: [{ role: 'user', content: userMsg }],
      system,
      model: 'claude-sonnet-4-5',
      maxTokens: 2000,
      cacheSystem: true
    });
    raw = (resp.text || '').trim();
  } catch (e) {
    console.error('[content] generate LLM failed:', e.message);
    return res.status(502).json({ ok: false, error: 'generation_failed', detail: e.message });
  }

  const chunks = raw.split(/\n\s*%%%\s*\n/).map(s => s.trim()).filter(Boolean);
  const drafts = [];
  for (const c of chunks.slice(0, n)) {
    const tm = c.match(/TITEL:\s*(.+)/i);
    const title = tm ? tm[1].trim() : 'Entwurf';
    const body = c
      .replace(/TITEL:\s*.+\r?\n?/i, '')
      .replace(/^\s*POST:\s*\r?\n?/im, '')
      .trim();
    if (body) drafts.push({ title, body });
  }
  if (!drafts.length) {
    console.error('[content] generate produced no parseable drafts. raw head:', raw.slice(0, 160));
    return res.status(502).json({ ok: false, error: 'no_drafts_generated' });
  }

  const utmBase = `${platform}-${segment}-${awareness}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const created = [];
  for (const d of drafts) {
    const ins = await supabase.insert('content_pieces', {
      account_id: req.account.id,
      platform,
      segment,
      kind: platform === 'linkedin' ? 'post' : 'post',
      status: 'draft',
      awareness_stage: awareness,
      icp_profile_id: icp?.id || null,
      topic: topicText ? topicText.slice(0, 300) : null,
      title: (d.title || '').slice(0, 300) || 'Entwurf',
      body: (d.body || '').slice(0, 20000),
      utm_campaign: `${utmBase}-${Math.random().toString(36).slice(2, 7)}`,
      created_by: 'agent'
    });
    if (ins.ok) {
      const piece = Array.isArray(ins.data) ? ins.data[0] : ins.data;
      created.push(piece);
      notifyBotApproval(piece).then(r => console.log('[content] bot-notify:', r?.ok ? 'ok' : 'fail', r?.error || ''));
    }
  }

  // mark topic as used
  if (topicRow?.id) await supabase.update('content_topics', `?id=eq.${topicRow.id}`, { status: 'used' });

  res.json({ ok: true, pieces: created });
});

// ──────────────────────────────────────────────────────────
// GET /pieces/:id/metrics
// ──────────────────────────────────────────────────────────

contentRouter.get('/:slug/pieces/:id/metrics', requireAdmin, withAccount, async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const r = await supabase.select('content_metrics', `?content_piece_id=eq.${id}&order=captured_at.desc&limit=200`);
  res.json({ ok: true, metrics: unwrap(r) || [] });
});

// ──────────────────────────────────────────────────────────
// GET /funnel  — aggregate for dashboard (logical funnel stages)
// ──────────────────────────────────────────────────────────

contentRouter.get('/:slug/funnel', requireAdmin, withAccount, async (req, res) => {
  const accId = req.account.id;
  const [chR, piR, leR] = await Promise.all([
    supabase.select('content_channels', `?account_id=eq.${accId}&select=platform,display_name,connected,enabled`),
    supabase.select('content_pieces', `?account_id=eq.${accId}&select=id,platform,status,segment`),
    supabase.select('customer_leads', `?account_id=eq.${accId}&select=lead_tier,status,attributed_content_id,utm_source`)
  ]);
  const channels = unwrap(chR) || [];
  const pieces = unwrap(piR) || [];
  const leads = unwrap(leR) || [];

  // metrics: latest row per piece, summed per platform
  const pieceIds = pieces.map(p => p.id);
  let metricsByPlatform = {};
  if (pieceIds.length) {
    const inList = pieceIds.map(id => `"${id}"`).join(',');
    const mR = await supabase.select('content_metrics',
      `?content_piece_id=in.(${inList})&select=content_piece_id,captured_at,impressions,clicks,link_clicks&order=captured_at.desc&limit=2000`);
    const metrics = unwrap(mR) || [];
    const pieceToPlatform = Object.fromEntries(pieces.map(p => [p.id, p.platform]));
    const seen = new Set();
    for (const m of metrics) {
      if (seen.has(m.content_piece_id)) continue; // latest only (ordered desc)
      seen.add(m.content_piece_id);
      const plat = pieceToPlatform[m.content_piece_id] || 'other';
      metricsByPlatform[plat] = metricsByPlatform[plat] || { impressions: 0, clicks: 0 };
      metricsByPlatform[plat].impressions += m.impressions || 0;
      metricsByPlatform[plat].clicks += (m.link_clicks ?? m.clicks) || 0;
    }
  }

  const pieceById = Object.fromEntries(pieces.map(p => [p.id, p]));
  const emptyTier = () => ({ A: 0, B: 0, C: 0, D: 0 });

  // build per-channel aggregate
  const channelOut = channels.map(ch => {
    const chPieces = pieces.filter(p => p.platform === ch.platform);
    const by_status = { draft: 0, approved: 0, scheduled: 0, published: 0 };
    let total = 0;
    for (const p of chPieces) { total++; if (by_status[p.status] !== undefined) by_status[p.status]++; }
    const leads_by_tier = emptyTier();
    let leads_attributed = 0;
    for (const l of leads) {
      const attrPlat = l.attributed_content_id ? pieceById[l.attributed_content_id]?.platform : null;
      const plat = attrPlat || l.utm_source || null;
      if (plat === ch.platform) {
        leads_attributed++;
        if (l.lead_tier && leads_by_tier[l.lead_tier] !== undefined) leads_by_tier[l.lead_tier]++;
      }
    }
    const m = metricsByPlatform[ch.platform] || { impressions: 0, clicks: 0 };
    return {
      platform: ch.platform,
      display_name: ch.display_name,
      connected: !!ch.connected,
      pieces_total: total,
      pieces_by_status: by_status,
      impressions: m.impressions,
      clicks: m.clicks,
      leads_attributed,
      leads_by_tier
    };
  });

  // segments
  const segments = {};
  for (const seg of ['auswanderer', 'investor']) {
    const segPieces = pieces.filter(p => p.segment === seg).length;
    let segLeads = 0;
    for (const l of leads) {
      const segOfLead = l.attributed_content_id ? pieceById[l.attributed_content_id]?.segment : null;
      if (segOfLead === seg) segLeads++;
    }
    segments[seg] = { pieces: segPieces, leads: segLeads };
  }

  // stages — keys match content_pieces.status values (singular)
  const content = { draft: 0, approved: 0, scheduled: 0, published: 0 };
  for (const p of pieces) { if (content[p.status] !== undefined) content[p.status]++; }
  const reach = { impressions: 0, clicks: 0 };
  for (const k of Object.values(metricsByPlatform)) { reach.impressions += k.impressions; reach.clicks += k.clicks; }
  const leadsStage = { total: leads.length, by_tier: emptyTier() };
  let qualified = 0, won = 0, lost = 0;
  const QUALIFIED = new Set(['qualified', 'meeting-scheduled', 'meeting-held', 'won']);
  for (const l of leads) {
    if (l.lead_tier && leadsStage.by_tier[l.lead_tier] !== undefined) leadsStage.by_tier[l.lead_tier]++;
    if (QUALIFIED.has(l.status)) qualified++;
    if (l.status === 'won') won++;
    if (l.status === 'lost') lost++;
  }

  res.json({
    ok: true,
    funnel: {
      channels: channelOut,
      segments,
      stages: {
        content,
        reach,
        leads: leadsStage,
        qualified: { count: qualified },
        closed: { won, lost }
      }
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════
// PHASE 1 / TEIL A — Funnel-Workflow (Publish, ICP, Brand-Voice, Topics, Channels)
// ══════════════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────
// POST /pieces/:id/publish  — die GATED Publish-Aktion
//   409 {ok:false, gated:true, reason:'channel_not_connected'} wenn Kanal
//       nicht connected ODER kein Token → davor wird social-publish.js NICHT erreicht.
//   Bei connected+Token: realer Call via lib/social-publish.js → Piece published.
// ──────────────────────────────────────────────────────────
contentRouter.post('/:slug/pieces/:id/publish', requireAdmin, withAccount, async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });

  // Load piece (account-scoped)
  const pr = await supabase.select('content_pieces',
    `?id=eq.${id}&account_id=eq.${req.account.id}&select=*&limit=1`);
  const piece = unwrap(pr)?.[0];
  if (!piece) return res.status(404).json({ ok: false, error: 'piece_not_found' });

  // Load the matching channel
  const cr = await supabase.select('content_channels',
    `?account_id=eq.${req.account.id}&platform=eq.${piece.platform}&select=id,platform,external_id,connected,enabled&limit=1`);
  const channel = unwrap(cr)?.[0];

  if (!channel || !channel.connected) {
    return res.status(409).json({ ok: false, gated: true, reason: 'channel_not_connected' });
  }

  // Token from project_apis (decrypted). No token → still gated.
  const token = await getChannelToken(req.account.id, piece.platform);
  if (!token) {
    return res.status(409).json({ ok: false, gated: true, reason: 'channel_not_connected' });
  }

  // ── GATED-Grenze überschritten: realer Social-API-Call ──
  let result;
  try {
    result = await publishPiece({
      platform: piece.platform,
      token,
      externalId: channel.external_id,
      piece
    });
  } catch (e) {
    if (e.code === 'NO_TOKEN') {
      return res.status(409).json({ ok: false, gated: true, reason: 'channel_not_connected' });
    }
    console.error('[content] publish failed:', e.code || '', e.message);
    return res.status(502).json({ ok: false, error: 'publish_failed', code: e.code || null, detail: e.message });
  }

  const now = new Date().toISOString();
  const upd = await supabase.update('content_pieces', `?id=eq.${id}&account_id=eq.${req.account.id}`, {
    status: 'published',
    published_at: now,
    external_post_id: result.external_post_id || null,
    updated_at: now
  });
  await supabase.update('content_channels', `?id=eq.${channel.id}`, { last_published_at: now });

  const updated = Array.isArray(upd.data) ? upd.data[0] : upd.data;
  res.json({ ok: true, piece: updated, external_post_id: result.external_post_id || null });
});

// ──────────────────────────────────────────────────────────
// ICP-Profile (GET all / PATCH per segment → upsert)
// ──────────────────────────────────────────────────────────
contentRouter.get('/:slug/icp', requireAdmin, withAccount, async (req, res) => {
  const r = await supabase.select('icp_profiles',
    `?account_id=eq.${req.account.id}&select=id,segment,name,summary,pains,desires,objections,awareness_default,language_notes,source,updated_at&order=segment.asc`);
  res.json({ ok: true, icp: unwrap(r) || [] });
});

const IcpPatch = z.object({
  name: z.string().max(300).optional(),
  summary: z.string().max(4000).optional(),
  pains: z.array(z.string().max(500)).max(50).optional(),
  desires: z.array(z.string().max(500)).max(50).optional(),
  objections: z.array(z.string().max(500)).max(50).optional(),
  awareness_default: z.enum(['unaware', 'problem', 'solution', 'product', 'most']).optional(),
  language_notes: z.string().max(2000).optional()
}).refine(d => Object.keys(d).length > 0, { message: 'empty_patch' });

contentRouter.patch('/:slug/icp/:segment', requireAdmin, withAccount, async (req, res) => {
  const segment = req.params.segment;
  if (!SEGMENTS.includes(segment)) return res.status(400).json({ ok: false, error: 'invalid_segment' });
  const parsed = IcpPatch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });

  const now = new Date().toISOString();
  const patch = { ...parsed.data, source: 'patrick', updated_at: now };

  // Upsert: try update, insert if no row for (account, segment)
  const upd = await supabase.update('icp_profiles',
    `?account_id=eq.${req.account.id}&segment=eq.${segment}`, patch);
  let row = Array.isArray(upd.data) ? upd.data[0] : upd.data;
  if (!row) {
    const ins = await supabase.insert('icp_profiles', {
      account_id: req.account.id, segment, ...patch
    });
    if (!ins.ok) return res.status(500).json({ ok: false, error: 'upsert_failed', details: ins.error });
    row = Array.isArray(ins.data) ? ins.data[0] : ins.data;
  }
  res.json({ ok: true, icp: row });
});

// ──────────────────────────────────────────────────────────
// Brand-Voice (GET / PATCH → upsert, 1 pro Account)
// ──────────────────────────────────────────────────────────
contentRouter.get('/:slug/brand-voice', requireAdmin, withAccount, async (req, res) => {
  const r = await supabase.select('brand_voice',
    `?account_id=eq.${req.account.id}&select=id,tone,dos,donts,examples,notes,source,updated_at&limit=1`);
  res.json({ ok: true, brand_voice: unwrap(r)?.[0] || null });
});

const BrandVoicePatch = z.object({
  tone: z.string().max(2000).optional(),
  dos: z.array(z.string().max(500)).max(50).optional(),
  donts: z.array(z.string().max(500)).max(50).optional(),
  examples: z.string().max(4000).optional(),
  notes: z.string().max(4000).optional()
}).refine(d => Object.keys(d).length > 0, { message: 'empty_patch' });

contentRouter.patch('/:slug/brand-voice', requireAdmin, withAccount, async (req, res) => {
  const parsed = BrandVoicePatch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });

  const now = new Date().toISOString();
  const patch = { ...parsed.data, source: 'patrick', updated_at: now };

  const upd = await supabase.update('brand_voice', `?account_id=eq.${req.account.id}`, patch);
  let row = Array.isArray(upd.data) ? upd.data[0] : upd.data;
  if (!row) {
    const ins = await supabase.insert('brand_voice', { account_id: req.account.id, ...patch });
    if (!ins.ok) return res.status(500).json({ ok: false, error: 'upsert_failed', details: ins.error });
    row = Array.isArray(ins.data) ? ins.data[0] : ins.data;
  }
  res.json({ ok: true, brand_voice: row });
});

// ──────────────────────────────────────────────────────────
// Topic-Bank (GET / POST / PATCH / DELETE)
// ──────────────────────────────────────────────────────────
contentRouter.get('/:slug/topics', requireAdmin, withAccount, async (req, res) => {
  const r = await supabase.select('content_topics',
    `?account_id=eq.${req.account.id}&select=id,segment,awareness_stage,topic,angle,status,source,created_at&order=created_at.desc&limit=300`);
  res.json({ ok: true, topics: unwrap(r) || [] });
});

const TopicCreate = z.object({
  segment: z.enum(['auswanderer', 'investor', 'beides']),
  awareness_stage: z.enum(['unaware', 'problem', 'solution', 'product', 'most']).optional(),
  topic: z.string().min(1).max(300),
  angle: z.string().max(500).optional()
});

contentRouter.post('/:slug/topics', requireAdmin, withAccount, async (req, res) => {
  const parsed = TopicCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const ins = await supabase.insert('content_topics', {
    account_id: req.account.id,
    status: 'open',
    source: 'patrick',
    ...parsed.data
  });
  if (!ins.ok) return res.status(500).json({ ok: false, error: 'insert_failed', details: ins.error });
  res.json({ ok: true, topic: Array.isArray(ins.data) ? ins.data[0] : ins.data });
});

const TopicPatch = z.object({
  topic: z.string().min(1).max(300).optional(),
  angle: z.string().max(500).nullable().optional(),
  status: z.enum(['open', 'used', 'parked']).optional()
}).refine(d => Object.keys(d).length > 0, { message: 'empty_patch' });

contentRouter.patch('/:slug/topics/:id', requireAdmin, withAccount, async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const parsed = TopicPatch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const upd = await supabase.update('content_topics',
    `?id=eq.${id}&account_id=eq.${req.account.id}`, parsed.data);
  if (!upd.ok) return res.status(500).json({ ok: false, error: 'update_failed', details: upd.error });
  const rows = upd.data;
  if (!rows || (Array.isArray(rows) && !rows.length)) return res.status(404).json({ ok: false, error: 'topic_not_found' });
  res.json({ ok: true, topic: Array.isArray(rows) ? rows[0] : rows });
});

contentRouter.delete('/:slug/topics/:id', requireAdmin, withAccount, async (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const del = await supabase.delete('content_topics',
    `?id=eq.${id}&account_id=eq.${req.account.id}`);
  if (!del.ok) return res.status(500).json({ ok: false, error: 'delete_failed', details: del.error });
  res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════════════════
// Channel-Connect / OAuth — die aktive-Schnittstelle-GRENZE (503 wenn unkonfiguriert)
// ══════════════════════════════════════════════════════════════════════════

// Read OAuth client config per platform from env. Missing → caller returns 503.
function oauthConfig(platform) {
  if (platform === 'facebook') {
    return {
      clientId: process.env.FB_APP_ID || process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FB_APP_SECRET || process.env.FACEBOOK_CLIENT_SECRET || '',
      authBase: 'https://www.facebook.com/v21.0/dialog/oauth',
      tokenBase: 'https://graph.facebook.com/v21.0/oauth/access_token',
      scope: 'pages_manage_posts,pages_read_engagement,pages_show_list',
      envHint: 'FB_APP_ID/FB_APP_SECRET'
    };
  }
  if (platform === 'linkedin') {
    return {
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      authBase: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenBase: 'https://www.linkedin.com/oauth/v2/accessToken',
      scope: 'w_member_social r_liteprofile',
      envHint: 'LINKEDIN_CLIENT_ID/LINKEDIN_CLIENT_SECRET'
    };
  }
  return null;
}

function redirectUri(slug, platform) {
  return `${API_BASE}/api/content/${encodeURIComponent(slug)}/channels/${platform}/connect/callback`;
}

// POST /channels/:platform/connect/start → authorize_url (or 503 if unconfigured)
contentRouter.post('/:slug/channels/:platform/connect/start', requireAdmin, withAccount, async (req, res) => {
  const platform = req.params.platform;
  if (!OAUTH_PLATFORMS.includes(platform)) return res.status(400).json({ ok: false, error: 'invalid_platform' });
  const cfg = oauthConfig(platform);
  if (!cfg || !cfg.clientId || !cfg.clientSecret) {
    return res.status(503).json({
      ok: false,
      error: 'oauth_not_configured',
      hint: `set ${cfg ? cfg.envHint : '<PLATFORM>_CLIENT_ID/SECRET'} in aevum.env`
    });
  }
  // state carries the account slug so the callback can re-resolve the account.
  const state = Buffer.from(JSON.stringify({ slug: req.params.slug, platform }), 'utf8').toString('base64');
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri(req.params.slug, platform),
    response_type: 'code',
    scope: cfg.scope,
    state
  });
  res.json({ ok: true, authorize_url: `${cfg.authBase}?${params.toString()}` });
});

// GET /channels/:platform/connect/callback?code= → exchange + store encrypted token
contentRouter.get('/:slug/channels/:platform/connect/callback', requireAdmin, withAccount, async (req, res) => {
  const platform = req.params.platform;
  if (!OAUTH_PLATFORMS.includes(platform)) return res.status(400).json({ ok: false, error: 'invalid_platform' });
  const cfg = oauthConfig(platform);
  if (!cfg || !cfg.clientId || !cfg.clientSecret) {
    return res.status(503).json({ ok: false, error: 'oauth_not_configured', hint: `set ${cfg ? cfg.envHint : '<PLATFORM>_CLIENT_ID/SECRET'} in aevum.env` });
  }
  const code = req.query.code;
  if (typeof code !== 'string' || !code) {
    return res.redirect(`${PORTAL_BASE}/funnel?channel=${platform}&connect=error&reason=no_code`);
  }

  // Exchange code → access token (real call; reached only when configured + code present).
  let token = null;
  let externalId = null;
  try {
    if (platform === 'facebook') {
      const qp = new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        redirect_uri: redirectUri(req.params.slug, platform),
        code
      });
      const tr = await fetch(`${cfg.tokenBase}?${qp.toString()}`);
      const td = await tr.json().catch(() => ({}));
      if (!tr.ok || !td.access_token) throw new Error(td?.error?.message || 'token_exchange_failed');
      // Resolve first managed Page → page-id + page-access-token (needed for /feed).
      const pr = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${encodeURIComponent(td.access_token)}`);
      const pd = await pr.json().catch(() => ({}));
      const page = Array.isArray(pd.data) && pd.data.length ? pd.data[0] : null;
      token = page?.access_token || td.access_token;
      externalId = page?.id || null;
    } else if (platform === 'linkedin') {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri(req.params.slug, platform),
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret
      });
      const tr = await fetch(cfg.tokenBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      const td = await tr.json().catch(() => ({}));
      if (!tr.ok || !td.access_token) throw new Error(td?.error_description || 'token_exchange_failed');
      token = td.access_token;
      // Resolve member URN for author field.
      const pr = await fetch('https://api.linkedin.com/v2/me', { headers: { Authorization: `Bearer ${token}` } });
      const pd = await pr.json().catch(() => ({}));
      externalId = pd?.id ? `urn:li:person:${pd.id}` : null;
    }
  } catch (e) {
    console.error(`[content] ${platform} oauth callback failed:`, e.message);
    return res.redirect(`${PORTAL_BASE}/funnel?channel=${platform}&connect=error`);
  }

  if (!token) {
    return res.redirect(`${PORTAL_BASE}/funnel?channel=${platform}&connect=error&reason=no_token`);
  }

  // Store token encrypted in project_apis (NEVER logged, NEVER in response).
  const project = await getAccountProject(req.account.id);
  if (project) {
    const enc = encryptSecret(token);
    const existing = await supabase.select('project_apis',
      `?project_id=eq.${project.id}&service=eq.social_${platform}&select=id&limit=1`);
    const ex = unwrap(existing)?.[0];
    if (ex) {
      await supabase.update('project_apis', `?id=eq.${ex.id}`,
        { key_encrypted: enc, scope: 'read-write', health: 'ok', last_used_at: new Date().toISOString() });
    } else {
      await supabase.insert('project_apis', {
        project_id: project.id,
        service: `social_${platform}`,
        key_label: `${platform} publish token`,
        key_encrypted: enc,
        scope: 'read-write',
        health: 'ok'
      });
    }
  } else {
    console.warn('[content] no project for account — token not persisted, channel not marked connected');
    return res.redirect(`${PORTAL_BASE}/funnel?channel=${platform}&connect=error&reason=no_project`);
  }

  // Mark channel connected (+ external_id).
  const chPatch = { connected: true };
  if (externalId) chPatch.external_id = externalId;
  await supabase.update('content_channels',
    `?account_id=eq.${req.account.id}&platform=eq.${platform}`, chPatch);

  res.redirect(`${PORTAL_BASE}/funnel?channel=${platform}&connect=success`);
});

// POST /channels/:platform/disconnect → connected=false + delete token row
contentRouter.post('/:slug/channels/:platform/disconnect', requireAdmin, withAccount, async (req, res) => {
  const platform = req.params.platform;
  if (!OAUTH_PLATFORMS.includes(platform)) return res.status(400).json({ ok: false, error: 'invalid_platform' });

  const project = await getAccountProject(req.account.id);
  if (project) {
    await supabase.delete('project_apis', `?project_id=eq.${project.id}&service=eq.social_${platform}`);
  }
  await supabase.update('content_channels',
    `?account_id=eq.${req.account.id}&platform=eq.${platform}`, { connected: false });
  res.json({ ok: true });
});

// PATCH /channels/:platform → {enabled?, display_name?, external_id?}
const ChannelPatch = z.object({
  enabled: z.boolean().optional(),
  display_name: z.string().max(200).optional(),
  external_id: z.string().max(300).optional()
}).refine(d => Object.keys(d).length > 0, { message: 'empty_patch' });

contentRouter.patch('/:slug/channels/:platform', requireAdmin, withAccount, async (req, res) => {
  const platform = req.params.platform;
  if (!PLATFORMS.includes(platform)) return res.status(400).json({ ok: false, error: 'invalid_platform' });
  const parsed = ChannelPatch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  const upd = await supabase.update('content_channels',
    `?account_id=eq.${req.account.id}&platform=eq.${platform}`, parsed.data);
  if (!upd.ok) return res.status(500).json({ ok: false, error: 'update_failed', details: upd.error });
  const rows = upd.data;
  if (!rows || (Array.isArray(rows) && !rows.length)) return res.status(404).json({ ok: false, error: 'channel_not_found' });
  res.json({ ok: true, channel: Array.isArray(rows) ? rows[0] : rows });
});
