// /api/me/projects/:slug/uh-mirror — UtilityHub-Mirror endpoints
//
// Proxies UH-Supabase read-only into AEVUM-Customer-Portal so Miguel
// can run his Energie-Datenhub from the AEVUM-Portal (long-term move
// away from utility-hub.one/app/* admin UI).
//
// Plus external mirrors: Close.com, Airtable, Notion (via stored API-Keys).

import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { decryptSecret } from '../lib/crypto.js';

export const uhMirrorRouter = Router({ mergeParams: true });

const UH_URL = process.env.UH_SUPABASE_URL;
const UH_KEY = process.env.UH_SUPABASE_SERVICE_KEY;

async function uhSelect(path) {
  if (!UH_URL || !UH_KEY) return { ok: false, error: 'uh-supabase-not-configured' };
  try {
    const res = await fetch(`${UH_URL}/rest/v1${path}`, {
      headers: {
        'apikey': UH_KEY,
        'Authorization': `Bearer ${UH_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    const range = res.headers.get('content-range');
    const total = range ? parseInt(range.split('/').pop(), 10) : null;
    const data = await res.json();
    return { ok: res.ok, data, total: Number.isFinite(total) ? total : null };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function isAuthorized(req) {
  const slug = req.params.slug;
  const accountSlug = req.customer?.account_slug;
  if (req.customer?.client_zero) return true;
  if (slug === 'utilityhub-platform' || slug === 'utilityhub') return true;
  if (accountSlug === 'utilityhub') return true;
  return false;
}

uhMirrorRouter.get('/overview', async (req, res) => {
  if (!isAuthorized(req)) return res.status(403).json({ ok: false, error: 'forbidden' });

  const [customers, orgs, batches, teleson] = await Promise.all([
    uhSelect('/customers?select=id&limit=1'),
    uhSelect('/organizations?select=id&limit=1'),
    uhSelect('/import_batches?select=id,status,total_rows&order=created_at.desc&limit=5'),
    uhSelect('/teleson_records?select=id&limit=1')
  ]);

  const lastBatch = batches.data?.[0] || null;

  res.json({
    ok: true,
    kpis: {
      customers_total: customers.total ?? 0,
      orgs_total: orgs.total ?? 0,
      teleson_records_total: teleson.total ?? 0,
      imports_total: batches.total ?? 0,
      last_import: lastBatch ? {
        status: lastBatch.status,
        rows: lastBatch.total_rows
      } : null
    },
    recent_imports: (batches.data || []).map(b => ({
      id: b.id,
      status: b.status,
      total_rows: b.total_rows
    }))
  });
});

uhMirrorRouter.get('/customers', async (req, res) => {
  if (!isAuthorized(req)) return res.status(403).json({ ok: false, error: 'forbidden' });

  const limit = Math.min(parseInt(req.query.limit || '25', 10), 200);
  const offset = parseInt(req.query.offset || '0', 10);
  const search = (req.query.q || '').trim();

  let path = `/customers?select=id,full_name,email,phone,address,city,postal_code,status,source,object_type,created_at&order=created_at.desc&limit=${limit}&offset=${offset}`;
  if (search) {
    const safe = search.replace(/[%(),]/g, ' ');
    path += `&or=(full_name.ilike.*${encodeURIComponent(safe)}*,email.ilike.*${encodeURIComponent(safe)}*,city.ilike.*${encodeURIComponent(safe)}*)`;
  }

  const r = await uhSelect(path);
  res.json({ ok: r.ok, customers: r.data || [], total: r.total ?? null });
});

uhMirrorRouter.get('/customers/:id', async (req, res) => {
  if (!isAuthorized(req)) return res.status(403).json({ ok: false, error: 'forbidden' });
  const id = req.params.id;
  const [customer, identities, teleson, notes] = await Promise.all([
    uhSelect(`/customers?id=eq.${id}&select=*&limit=1`),
    uhSelect(`/customer_identities?customer_id=eq.${id}&select=*`),
    uhSelect(`/teleson_records?customer_id=eq.${id}&select=*&order=created_at.desc`),
    uhSelect(`/customer_notes?customer_id=eq.${id}&select=*&order=created_at.desc&limit=20`)
  ]);
  res.json({
    ok: true,
    customer: customer.data?.[0] || null,
    identities: identities.data || [],
    teleson_records: teleson.data || [],
    notes: notes.data || []
  });
});

uhMirrorRouter.get('/imports', async (req, res) => {
  if (!isAuthorized(req)) return res.status(403).json({ ok: false, error: 'forbidden' });
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const r = await uhSelect(`/import_batches?select=*&order=created_at.desc&limit=${limit}`);
  res.json({ ok: r.ok, imports: r.data || [], total: r.total ?? null });
});

uhMirrorRouter.get('/teleson', async (req, res) => {
  if (!isAuthorized(req)) return res.status(403).json({ ok: false, error: 'forbidden' });
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  const r = await uhSelect(`/teleson_records?select=id,customer_id,energie,status,neuer_versorger,neu_ap,belieferungsdatum,gebunden_bis&order=created_at.desc&limit=${limit}`);
  res.json({ ok: r.ok, records: r.data || [], total: r.total ?? null });
});

uhMirrorRouter.get('/organizations', async (req, res) => {
  if (!isAuthorized(req)) return res.status(403).json({ ok: false, error: 'forbidden' });
  const r = await uhSelect('/organizations?select=*&order=created_at.desc&limit=50');
  res.json({ ok: r.ok, organizations: r.data || [], total: r.total ?? null });
});

uhMirrorRouter.get('/contacts', async (req, res) => {
  if (!isAuthorized(req)) return res.status(403).json({ ok: false, error: 'forbidden' });
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  const r = await uhSelect(`/contacts?select=*&order=created_at.desc&limit=${limit}`);
  res.json({ ok: r.ok, contacts: r.data || [], total: r.total ?? null });
});

uhMirrorRouter.get('/reports', async (req, res) => {
  if (!isAuthorized(req)) return res.status(403).json({ ok: false, error: 'forbidden' });
  const [byObjType, byStatus, bySource, byEnergie] = await Promise.all([
    uhSelect('/customers?select=object_type&limit=1000'),
    uhSelect('/customers?select=status&limit=1000'),
    uhSelect('/customers?select=source&limit=1000'),
    uhSelect('/teleson_records?select=energie,status&limit=1000')
  ]);

  const count = (arr, key) => {
    const out = {};
    for (const row of arr.data || []) {
      const k = row[key] || '–';
      out[k] = (out[k] || 0) + 1;
    }
    return Object.entries(out).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  };

  res.json({
    ok: true,
    customers_by_object_type: count(byObjType, 'object_type'),
    customers_by_status:      count(byStatus, 'status'),
    customers_by_source:      count(bySource, 'source'),
    teleson_by_energie:       count(byEnergie, 'energie'),
    teleson_by_status:        count(byEnergie, 'status'),
  });
});

// ────────────────────────────────────────────────────────────
// External Integration Mirrors (Close.com, Airtable, Notion)
// All read the API-Key from project_apis (AES-256-GCM encrypted).
// ────────────────────────────────────────────────────────────

async function getProjectApiKey(req, service) {
  const accountId = req.customer?.account_id;
  if (!accountId) return null;
  const slug = req.params.slug;
  const proj = await supabase.select('projects', `select=id&account_id=eq.${accountId}&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  const projectId = proj.data?.[0]?.id;
  if (!projectId) return null;
  const row = await supabase.select(
    'project_apis',
    `select=key_encrypted,key_label&project_id=eq.${projectId}&service=eq.${encodeURIComponent(service)}&order=added_at.desc&limit=1`
  );
  const enc = row.data?.[0]?.key_encrypted;
  if (!enc) return null;
  try { return { plaintext: decryptSecret(enc), label: row.data[0].key_label }; }
  catch { return null; }
}

// ── Close.com — Read-only Lead-Sync ─────────────────────────
uhMirrorRouter.get('/close/leads', async (req, res) => {
  if (!isAuthorized(req)) return res.status(403).json({ ok: false, error: 'forbidden' });
  const cred = await getProjectApiKey(req, 'close');
  if (!cred) return res.json({ ok: false, error: 'no_api_key', hint: 'API-Keys → Service "close" einreichen' });

  const limit = Math.min(parseInt(req.query.limit || '25', 10), 100);
  try {
    const auth = Buffer.from(cred.plaintext + ':').toString('base64');
    const r = await fetch(`https://api.close.com/api/v1/lead/?_limit=${limit}`, {
      headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' }
    });
    if (!r.ok) {
      const errText = await r.text();
      return res.json({ ok: false, error: 'close_api_error', status: r.status, detail: errText.slice(0, 200) });
    }
    const data = await r.json();
    const leads = (data.data || []).map(l => ({
      id: l.id,
      name: l.display_name || l.name,
      status: l.status_label,
      created_at: l.date_created,
      updated_at: l.date_updated,
      url: l.html_url,
      contacts: (l.contacts || []).slice(0, 3).map(c => ({
        name: c.name,
        emails: (c.emails || []).map(e => e.email),
        phones: (c.phones || []).map(p => p.phone)
      }))
    }));
    res.json({ ok: true, leads, total: data.total_results || leads.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'close_fetch_failed', detail: e.message });
  }
});

// ── Airtable — Live-Mirror Records ─────────────────────────
uhMirrorRouter.get('/airtable/records', async (req, res) => {
  if (!isAuthorized(req)) return res.status(403).json({ ok: false, error: 'forbidden' });
  const cred = await getProjectApiKey(req, 'airtable');
  if (!cred) return res.json({ ok: false, error: 'no_api_key', hint: 'API-Keys → Service "airtable" einreichen, label="appXXXX/TableName"' });

  // Convention: key_label = "baseId/tableName"  OR  req.query.base + req.query.table
  let baseId = req.query.base || '';
  let tableName = req.query.table || '';
  if ((!baseId || !tableName) && cred.label) {
    const [b, t] = cred.label.split('/');
    if (b) baseId = b;
    if (t) tableName = t;
  }
  if (!baseId || !tableName) {
    return res.json({ ok: false, error: 'no_base_or_table', hint: 'Setze key_label="appXXX/Leads" beim API-Key oder gib ?base=&table= mit' });
  }

  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const r = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?pageSize=${limit}`, {
      headers: { 'Authorization': `Bearer ${cred.plaintext}` }
    });
    if (!r.ok) {
      const errText = await r.text();
      return res.json({ ok: false, error: 'airtable_api_error', status: r.status, detail: errText.slice(0, 200) });
    }
    const data = await r.json();
    res.json({
      ok: true,
      base_id: baseId,
      table_name: tableName,
      records: (data.records || []).map(rec => ({
        id: rec.id,
        fields: rec.fields,
        created_at: rec.createdTime
      })),
      offset: data.offset || null
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'airtable_fetch_failed', detail: e.message });
  }
});

// ── Notion — Live-Mirror Database/Pages ─────────────────────
uhMirrorRouter.get('/notion/databases', async (req, res) => {
  if (!isAuthorized(req)) return res.status(403).json({ ok: false, error: 'forbidden' });
  const cred = await getProjectApiKey(req, 'notion');
  if (!cred) return res.json({ ok: false, error: 'no_api_key', hint: 'API-Keys → Service "notion" einreichen (Internal-Integration-Token)' });

  try {
    const r = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cred.plaintext}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filter: { value: 'database', property: 'object' }, page_size: 20 })
    });
    if (!r.ok) {
      const errText = await r.text();
      return res.json({ ok: false, error: 'notion_api_error', status: r.status, detail: errText.slice(0, 200) });
    }
    const data = await r.json();
    res.json({
      ok: true,
      databases: (data.results || []).map(d => ({
        id: d.id,
        title: d.title?.[0]?.plain_text || '(untitled)',
        url: d.url,
        created_time: d.created_time,
        last_edited_time: d.last_edited_time
      }))
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'notion_fetch_failed', detail: e.message });
  }
});

uhMirrorRouter.get('/notion/database/:id', async (req, res) => {
  if (!isAuthorized(req)) return res.status(403).json({ ok: false, error: 'forbidden' });
  const cred = await getProjectApiKey(req, 'notion');
  if (!cred) return res.json({ ok: false, error: 'no_api_key' });
  const dbId = req.params.id;
  try {
    const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cred.plaintext}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ page_size: 30 })
    });
    if (!r.ok) {
      const errText = await r.text();
      return res.json({ ok: false, error: 'notion_api_error', status: r.status, detail: errText.slice(0, 200) });
    }
    const data = await r.json();
    res.json({
      ok: true,
      pages: (data.results || []).map(p => {
        const titleProp = Object.values(p.properties || {}).find(prop => prop.type === 'title');
        const title = titleProp?.title?.[0]?.plain_text || '(untitled)';
        return { id: p.id, title, url: p.url, last_edited_time: p.last_edited_time, properties: p.properties };
      })
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'notion_fetch_failed', detail: e.message });
  }
});
