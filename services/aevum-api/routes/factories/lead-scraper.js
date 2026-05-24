// AEVUM Lead-Scraper-Factory API — Wave I5 Phase-1
// Mount: /api/factories/lead-scraper
//
// Endpoints:
//   POST   /campaigns                  multipart CSV upload + name → new campaign
//   GET    /campaigns                  list account campaigns
//   GET    /campaigns/:id              campaign + leads
//   POST   /campaigns/:id/generate     trigger LLM pitch-generation (spends 12 credits/lead)
//   POST   /campaigns/:id/send         send approved pitches via Resend mailer
//   PATCH  /leads/:id                  approve/edit/select pitch

import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../../lib/supabase.js';
import { requireCustomerAuth } from '../../lib/crypto.js';
import { agentThrottle } from '../../lib/agent-throttle.js';
import { spendCredits } from '../../lib/credits.js';
import { csvParse } from '../../lib/csv-helper.js';
import {
  runLeadPitchGeneration,
  LEAD_SCRAPER_COST_PER_LEAD
} from '../../lib/factories/lead-scraper-factory.js';
import { mailer } from '../../lib/mailer.js';

export const leadScraperRouter = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_CSV_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_LEADS_PER_CAMPAIGN = 500;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CSV_BYTES }
});

leadScraperRouter.use(requireCustomerAuth);
leadScraperRouter.use(agentThrottle());

function getAccountId(req) {
  return req.customer?.account_id || null;
}

// ─── POST /campaigns ────────────────────────────────────────────
leadScraperRouter.post('/campaigns', upload.single('csv'), async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });

  const name = String(req.body?.name || '').trim().slice(0, 200);
  const brandtoneRaw = req.body?.brandtone_hub_id;
  const brandtone_hub_id = (typeof brandtoneRaw === 'string' && UUID_RE.test(brandtoneRaw)) ? brandtoneRaw : null;
  if (!name) return res.status(400).json({ ok: false, error: 'missing_name' });
  if (!req.file) return res.status(400).json({ ok: false, error: 'missing_csv' });

  const csvText = req.file.buffer.toString('utf-8');
  const rows = csvParse(csvText);
  if (rows.length < 2) return res.status(400).json({ ok: false, error: 'csv_empty_or_no_data_rows' });

  const header = rows[0].map(c => String(c || '').trim().toLowerCase().replace(/^"|"$/g, ''));
  const idxName = header.indexOf('company_name');
  const idxDomain = header.indexOf('company_domain');
  const idxOwnerName = header.indexOf('owner_name');
  const idxOwnerEmail = header.indexOf('owner_email');
  const idxLI = header.indexOf('owner_linkedin_url');
  if (idxOwnerEmail < 0) {
    return res.status(400).json({ ok: false, error: 'csv_missing_owner_email_column', got_header: header });
  }

  const insRes = await supabase.insert('lead_scraper_campaigns', {
    account_id,
    name,
    brandtone_hub_id,
    source_csv_filename: req.file.originalname || 'leads.csv',
    status: 'draft'
  });
  if (!insRes.ok) return res.status(500).json({ ok: false, error: 'create_campaign_failed', details: insRes.error });
  const camp = Array.isArray(insRes.data) ? insRes.data[0] : insRes.data;
  if (!camp?.id) return res.status(500).json({ ok: false, error: 'no_campaign_id' });

  const seen = new Set();
  let imported = 0;
  let skipped = 0;
  for (let i = 1; i < rows.length && imported < MAX_LEADS_PER_CAMPAIGN; i++) {
    const r = rows[i];
    const email = String(r[idxOwnerEmail] || '').trim().toLowerCase();
    if (!email || !email.includes('@')) { skipped++; continue; }
    if (seen.has(email)) { skipped++; continue; }
    seen.add(email);
    const insLead = await supabase.insert('leads', {
      campaign_id: camp.id,
      company_name: (idxName >= 0 ? String(r[idxName] || '').trim() : null) || null,
      company_domain: (idxDomain >= 0 ? String(r[idxDomain] || '').trim() : null) || null,
      owner_name: (idxOwnerName >= 0 ? String(r[idxOwnerName] || '').trim() : null) || null,
      owner_email: email,
      owner_linkedin_url: (idxLI >= 0 ? String(r[idxLI] || '').trim() : null) || null,
      outreach_status: 'pending'
    });
    if (insLead.ok) imported++;
    else skipped++;
  }

  if (imported === 0) {
    await supabase.delete('lead_scraper_campaigns', `?id=eq.${camp.id}`);
    return res.status(400).json({ ok: false, error: 'no_valid_rows', skipped });
  }

  return res.json({ ok: true, campaign_id: camp.id, leads_imported: imported, skipped });
});

// ─── GET /campaigns ─────────────────────────────────────────────
leadScraperRouter.get('/campaigns', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const sel = await supabase.select(
    'lead_scraper_campaigns',
    `?account_id=eq.${account_id}&order=created_at.desc&limit=50&select=*`
  );
  if (!sel.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true, campaigns: Array.isArray(sel.data) ? sel.data : [] });
});

// ─── GET /campaigns/:id ─────────────────────────────────────────
leadScraperRouter.get('/campaigns/:id', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });
  const c = await supabase.select(
    'lead_scraper_campaigns',
    `?id=eq.${id}&account_id=eq.${account_id}&select=*&limit=1`
  );
  if (!c.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  if (!c.data?.length) return res.status(404).json({ ok: false, error: 'not_found' });
  const leads = await supabase.select(
    'leads',
    `?campaign_id=eq.${id}&order=created_at.asc&select=*`
  );
  return res.json({
    ok: true,
    campaign: c.data[0],
    leads: leads.ok && Array.isArray(leads.data) ? leads.data : []
  });
});

// ─── POST /campaigns/:id/generate ───────────────────────────────
leadScraperRouter.post('/campaigns/:id/generate', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });

  const c = await supabase.select(
    'lead_scraper_campaigns',
    `?id=eq.${id}&account_id=eq.${account_id}&select=*&limit=1`
  );
  if (!c.ok || !c.data?.length) return res.status(404).json({ ok: false, error: 'campaign_not_found' });

  const pendingSel = await supabase.select(
    'leads',
    `?campaign_id=eq.${id}&outreach_status=eq.pending&select=id&limit=500`
  );
  const pendingCount = (pendingSel.ok && Array.isArray(pendingSel.data)) ? pendingSel.data.length : 0;
  if (!pendingCount) return res.status(400).json({ ok: false, error: 'no_pending_leads' });

  const totalCost = pendingCount * LEAD_SCRAPER_COST_PER_LEAD;
  const spend = await spendCredits(account_id, totalCost, `lead-scraper-generate-${pendingCount}`);
  if (!spend.ok) {
    return res.status(402).json({
      ok: false,
      error: spend.error || 'insufficient_credits',
      need: totalCost,
      have: spend.balance ?? 0
    });
  }

  await supabase.update('lead_scraper_campaigns', `?id=eq.${id}`, {
    status: 'generating',
    updated_at: new Date().toISOString()
  });

  // Async fire-and-forget
  runLeadPitchGeneration({ campaignId: id, accountId: account_id })
    .catch(async err => {
      console.error('[lead-scraper] generation failed:', err.message || err);
      await supabase.update('lead_scraper_campaigns', `?id=eq.${id}`, {
        status: 'paused',
        updated_at: new Date().toISOString()
      });
      await spendCredits(account_id, -totalCost, 'lead-scraper-refund-fail');
    });

  return res.json({
    ok: true,
    leads_to_generate: pendingCount,
    credits_spent: totalCost,
    estimated_duration_sec: pendingCount * 8
  });
});

// ─── POST /campaigns/:id/send ───────────────────────────────────
leadScraperRouter.post('/campaigns/:id/send', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });

  const c = await supabase.select(
    'lead_scraper_campaigns',
    `?id=eq.${id}&account_id=eq.${account_id}&select=*&limit=1`
  );
  if (!c.ok || !c.data?.length) return res.status(404).json({ ok: false, error: 'campaign_not_found' });

  const appSel = await supabase.select(
    'leads',
    `?campaign_id=eq.${id}&outreach_status=eq.approved&select=*&limit=500`
  );
  const approved = (appSel.ok && Array.isArray(appSel.data)) ? appSel.data : [];
  if (!approved.length) return res.status(400).json({ ok: false, error: 'no_approved_leads' });

  await supabase.update('lead_scraper_campaigns', `?id=eq.${id}`, {
    status: 'sending',
    updated_at: new Date().toISOString()
  });

  // Fire-and-forget email send
  (async () => {
    const fromAddr = process.env.AEVUM_OUTREACH_FROM || 'AEVUM <audit@aevum-system.de>';
    for (const lead of approved) {
      if (!lead.owner_email || !lead.outreach_message) {
        await supabase.update('leads', `?id=eq.${lead.id}`, { outreach_status: 'failed' });
        continue;
      }
      try {
        const subject = lead.outreach_message_subject || `Kurze Frage, ${lead.owner_name || ''}`.trim();
        const text = lead.outreach_message;
        const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:24px auto;color:#111;line-height:1.55;font-size:15px;">${text.replace(/\n/g, '<br>')}</div>`;
        const result = await mailer.send({
          to: lead.owner_email,
          from: fromAddr,
          subject,
          text,
          html
        });
        if (result?.ok) {
          await supabase.update('leads', `?id=eq.${lead.id}`, {
            outreach_status: 'sent',
            outreach_sent_at: new Date().toISOString()
          });
        } else {
          await supabase.update('leads', `?id=eq.${lead.id}`, { outreach_status: 'failed' });
        }
      } catch (err) {
        console.error(`[lead-scraper-send] lead ${lead.id} failed:`, err.message || err);
        await supabase.update('leads', `?id=eq.${lead.id}`, { outreach_status: 'failed' });
      }
    }
    await supabase.update('lead_scraper_campaigns', `?id=eq.${id}`, {
      status: 'complete',
      updated_at: new Date().toISOString()
    });
  })().catch(err => console.error('[lead-scraper-send batch]', err));

  return res.json({ ok: true, scheduled: approved.length });
});

// ─── PATCH /leads/:id ───────────────────────────────────────────
leadScraperRouter.patch('/leads/:id', async (req, res) => {
  const account_id = getAccountId(req);
  if (!account_id) return res.status(401).json({ ok: false, error: 'no_account_id' });
  const { id } = req.params;
  if (!UUID_RE.test(id)) return res.status(400).json({ ok: false, error: 'invalid_id' });

  const leadSel = await supabase.select('leads', `?id=eq.${id}&select=id,campaign_id,pitch_variants&limit=1`);
  if (!leadSel.ok || !leadSel.data?.length) return res.status(404).json({ ok: false, error: 'not_found' });
  const lead = leadSel.data[0];

  const campCheck = await supabase.select(
    'lead_scraper_campaigns',
    `?id=eq.${lead.campaign_id}&account_id=eq.${account_id}&select=id&limit=1`
  );
  if (!campCheck.ok || !campCheck.data?.length) return res.status(403).json({ ok: false, error: 'not_owner' });

  const { outreach_status, outreach_message, outreach_message_subject, pitch_selected_index } = req.body || {};
  const patch = {};
  const ALLOWED_STATUS = new Set(['pending', 'generated', 'approved', 'sent']);
  if (typeof outreach_status === 'string' && ALLOWED_STATUS.has(outreach_status)) {
    patch.outreach_status = outreach_status;
  }
  if (typeof outreach_message === 'string') {
    patch.outreach_message = outreach_message.slice(0, 5000);
  }
  if (typeof outreach_message_subject === 'string') {
    patch.outreach_message_subject = outreach_message_subject.slice(0, 200);
  }
  if (typeof pitch_selected_index === 'number' && Number.isInteger(pitch_selected_index)) {
    patch.pitch_selected_index = pitch_selected_index;
    // Auto-sync outreach_message from selected variant if no explicit message provided
    if (!('outreach_message' in (req.body || {}))) {
      const variants = Array.isArray(lead.pitch_variants) ? lead.pitch_variants : [];
      const v = variants[pitch_selected_index];
      if (v?.body) patch.outreach_message = String(v.body).slice(0, 5000);
      if (v?.subject && !patch.outreach_message_subject) patch.outreach_message_subject = String(v.subject).slice(0, 200);
    }
  }

  if (!Object.keys(patch).length) return res.status(400).json({ ok: false, error: 'no_valid_fields' });

  const upd = await supabase.update('leads', `?id=eq.${id}`, patch);
  if (!upd.ok) return res.status(502).json({ ok: false, error: 'db_error' });
  return res.json({ ok: true, lead: Array.isArray(upd.data) ? upd.data[0] : upd.data });
});
