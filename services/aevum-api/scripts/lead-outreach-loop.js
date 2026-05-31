// ───────────────────────────────────────────────────────────────────────────
// Lead-Outreach-Loop — autonomes Arbeiten, Pilot-Prozess
//
// Schließt den Goal→Plan→Approve→Execute-Loop für Lead-Outreach:
//   ② INITIATOR:  findet Campaigns mit fertigen Pitches (leads=generated) →
//                 erstellt approval-row (LennoxOS-DB). lennox-tg-bot pingt Carlos.
//   ③ EXECUTOR:   approval=approved → setzt leads generated→approved → sendet via
//                 mailer (Resend) → leads=sent → approval=executed + TG-Ergebnis.
//
// Leads/Campaigns: AEVUM-DB (iwyzbi, via aevum-api supabase-lib)
// Approvals:        LennoxOS-DB (diuwsh, via raw fetch / LENNOXOS_SUPABASE_*)
// Carlos = nur ✅/❌ im Telegram. Kein Handanlegen.
// ───────────────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
import path from 'path';
import os from 'os';

// Env: Lennox-Creds zuerst, dann AEVUM (SUPABASE_URL muss am Ende = AEVUM iwyzbi sein)
dotenv.config({ path: path.join(os.homedir(), '.claude', '.env'), override: false });
dotenv.config({ path: '/home/carlos/.envs/_shared.env', override: true });
dotenv.config({ path: '/home/carlos/.envs/aevum.env', override: true });

const { supabase } = await import('../lib/supabase.js');
const { mailer } = await import('../lib/mailer.js');

// ─── Config ───
const TICK_MS = parseInt(process.env.LEAD_LOOP_TICK_MS || '60000', 10); // 60s
const LENNOXOS_URL = process.env.LENNOXOS_SUPABASE_URL;
const LENNOXOS_KEY = process.env.LENNOXOS_SUPABASE_SERVICE_ROLE_KEY;
const TG_TOKEN = process.env.TG_LENNOX_BOT_TOKEN;
const CARLOS_CHAT = parseInt(process.env.TG_CARLOS_CHAT_ID || '6436074677', 10);
const OUTREACH_FROM = process.env.AEVUM_OUTREACH_FROM || 'AEVUM <audit@aevum-system.de>';

if (!LENNOXOS_URL || !LENNOXOS_KEY) {
  console.error('[lead-loop] FATAL: LENNOXOS_SUPABASE_* fehlt — Approvals nicht erreichbar');
  process.exit(1);
}

const L_HEADERS = { apikey: LENNOXOS_KEY, Authorization: `Bearer ${LENNOXOS_KEY}`, 'Content-Type': 'application/json' };

// ─── Approvals (LennoxOS-DB) ───
async function approvalsSelect(qs) {
  const r = await fetch(`${LENNOXOS_URL}/rest/v1/approvals${qs}`, { headers: L_HEADERS });
  if (!r.ok) throw new Error(`approvals select ${r.status} ${(await r.text()).slice(0, 120)}`);
  return r.json();
}
async function approvalsInsert(row) {
  const r = await fetch(`${LENNOXOS_URL}/rest/v1/approvals`, {
    method: 'POST', headers: { ...L_HEADERS, Prefer: 'return=representation' }, body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error(`approvals insert ${r.status} ${(await r.text()).slice(0, 120)}`);
  return (await r.json())[0];
}
async function approvalsPatch(id, fields) {
  const r = await fetch(`${LENNOXOS_URL}/rest/v1/approvals?id=eq.${id}`, {
    method: 'PATCH', headers: { ...L_HEADERS, Prefer: 'return=representation' }, body: JSON.stringify(fields),
  });
  if (!r.ok) throw new Error(`approvals patch ${r.status} ${(await r.text()).slice(0, 120)}`);
  return (await r.json())[0];
}

// ─── Telegram (nur sendMessage — kein polling, kollidiert nicht mit lennox-tg-bot) ───
async function tgSend(text) {
  if (!TG_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CARLOS_CHAT, text, disable_web_page_preview: true }),
    });
  } catch (e) { console.error('[lead-loop] tgSend', e.message); }
}

// ─── ② INITIATOR ───────────────────────────────────────────────────────────
// Findet Campaigns mit generated-Leads ohne offene Approval → erstellt approval-row.
async function initiatorTick() {
  // Campaigns, die nicht schon im Versand/fertig sind
  const camps = await supabase.select('lead_scraper_campaigns',
    `?status=in.(draft,generating,paused)&select=id,name,account_id,status&order=created_at.desc&limit=20`);
  if (!camps.ok || !Array.isArray(camps.data)) return;

  for (const camp of camps.data) {
    // Wie viele Leads haben fertige Pitches (generated), noch nicht approved/sent?
    const gen = await supabase.select('leads',
      `?campaign_id=eq.${camp.id}&outreach_status=eq.generated&select=id,owner_name,owner_email,outreach_message,outreach_message_subject&limit=500`);
    const leads = (gen.ok && Array.isArray(gen.data)) ? gen.data : [];
    if (!leads.length) continue;

    // Offene Approval für diese Campaign? (pending oder approved-noch-nicht-executed) → kein Doppel-Ping
    const open = await approvalsSelect(
      `?kind=eq.lead_outreach&status=in.(pending,approved)&payload->>campaign_id=eq.${camp.id}&select=id&limit=1`);
    if (open.length) continue;

    const preview = leads.slice(0, 2).map(l =>
      `• ${l.owner_name || l.owner_email}: "${(l.outreach_message_subject || l.outreach_message || '').slice(0, 80)}"`).join('\n');
    const summary =
      `Campaign "${camp.name}": ${leads.length} Pitch(es) fertig generiert.\n\n${preview}\n\n→ An alle ${leads.length} senden?`;

    const a = await approvalsInsert({
      kind: 'lead_outreach', summary, status: 'pending',
      payload: { campaign_id: camp.id, account_id: camp.account_id, lead_count: leads.length },
    });
    console.log(`[lead-loop][initiator] approval ${a.id} für Campaign ${camp.id} (${leads.length} leads)`);
    // lennox-tg-bot pickt die pending-row auf und pingt Carlos (15s-Intervall)
  }
}

// ─── ③ EXECUTOR ────────────────────────────────────────────────────────────
// approval=approved → setzt leads approved → sendet → sent → approval=executed.
async function executorTick() {
  const approved = await approvalsSelect(
    `?kind=eq.lead_outreach&status=eq.approved&executed_at=is.null&select=*&order=decided_at.asc&limit=5`);

  for (const ap of approved) {
    const campaignId = ap.payload?.campaign_id;
    if (!campaignId) { await approvalsPatch(ap.id, { status: 'failed', result: 'no campaign_id', executed_at: new Date().toISOString() }); continue; }

    try {
      // generated → approved (damit Versand sie aufnimmt)
      await supabase.update('leads', `?campaign_id=eq.${campaignId}&outreach_status=eq.generated`, { outreach_status: 'approved' });

      const appSel = await supabase.select('leads',
        `?campaign_id=eq.${campaignId}&outreach_status=eq.approved&select=*&limit=500`);
      const leads = (appSel.ok && Array.isArray(appSel.data)) ? appSel.data : [];

      let sent = 0, failed = 0;
      for (const lead of leads) {
        if (!lead.owner_email || !lead.outreach_message) {
          await supabase.update('leads', `?id=eq.${lead.id}`, { outreach_status: 'failed' });
          failed++; continue;
        }
        try {
          const subject = lead.outreach_message_subject || `Kurze Frage, ${lead.owner_name || ''}`.trim();
          const text = lead.outreach_message;
          const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:24px auto;color:#111;line-height:1.55;font-size:15px;">${text.replace(/\n/g, '<br>')}</div>`;
          const result = await mailer.send({ to: lead.owner_email, from: OUTREACH_FROM, subject, text, html });
          if (result?.ok) {
            await supabase.update('leads', `?id=eq.${lead.id}`, { outreach_status: 'sent', outreach_sent_at: new Date().toISOString() });
            sent++;
          } else {
            await supabase.update('leads', `?id=eq.${lead.id}`, { outreach_status: 'failed' });
            failed++;
          }
        } catch (err) {
          console.error(`[lead-loop][executor] lead ${lead.id}:`, err.message || err);
          await supabase.update('leads', `?id=eq.${lead.id}`, { outreach_status: 'failed' });
          failed++;
        }
      }

      await supabase.update('lead_scraper_campaigns', `?id=eq.${campaignId}`, { status: 'complete', updated_at: new Date().toISOString() });
      const resultMsg = `${sent} gesendet, ${failed} fehlgeschlagen`;
      await approvalsPatch(ap.id, { status: 'executed', executed_at: new Date().toISOString(), result: resultMsg });
      console.log(`[lead-loop][executor] approval ${ap.id} → ${resultMsg}`);
      await tgSend(`✅ Outreach versendet — Campaign-Pitches\n\n${resultMsg}`);
    } catch (err) {
      await approvalsPatch(ap.id, { status: 'failed', executed_at: new Date().toISOString(), result: String(err.message || err).slice(0, 300) });
      await tgSend(`⚠️ Outreach fehlgeschlagen: ${String(err.message || err).slice(0, 200)}`);
    }
  }
}

// ─── Loop ───
async function tick() {
  try { await initiatorTick(); } catch (e) { console.error('[lead-loop][initiator]', e.message); }
  try { await executorTick(); } catch (e) { console.error('[lead-loop][executor]', e.message); }
}

console.log(`[lead-loop] online — tick ${TICK_MS}ms, AEVUM-DB=${(process.env.SUPABASE_URL || '').replace(/(https:\/\/[a-z]+)\..*/, '$1...')}`);
tick();
setInterval(tick, TICK_MS);
