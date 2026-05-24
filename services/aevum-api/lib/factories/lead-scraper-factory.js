// AEVUM Lead-Scraper-Factory — Wave I5 Phase-1
// Created: 2026-05-24
//
// LLM-Pitch-Generation pipeline:
//   For each pending lead in a campaign, generate 3 AEVUM-Brandtone-conform
//   pitch-variants (subject + body + tone + hook_angle), store as JSONB,
//   pick variant[0] as default outreach_message.
//
// Async (fire-and-forget) — called from routes/factories/lead-scraper.js.
// Auto-refund on failure handled by the route layer.

import { supabase } from '../supabase.js';
import { callAnthropic } from '../anthropic-helper.js';
import { logUsage } from '../credit-spend.js';

export const LEAD_SCRAPER_COST_PER_LEAD = 12;
const MODEL = 'claude-sonnet-4-5';
const DEFAULT_BRANDTONE_SLUG = 'aevum-brandtone';

async function loadBrandtoneContext(campaign) {
  let docs = [];
  if (campaign.brandtone_hub_id) {
    const r = await supabase.select(
      'knowledge_documents',
      `?hub_id=eq.${campaign.brandtone_hub_id}&select=content_md&limit=10`
    );
    if (r.ok && Array.isArray(r.data)) docs = r.data;
  }
  if (!docs.length) {
    // Fallback to default AEVUM brandtone hub
    const hubSel = await supabase.select(
      'knowledge_hubs',
      `?slug=eq.${DEFAULT_BRANDTONE_SLUG}&select=id&limit=1`
    );
    const hub = hubSel.ok && hubSel.data?.[0];
    if (hub) {
      const dr = await supabase.select(
        'knowledge_documents',
        `?hub_id=eq.${hub.id}&select=content_md&limit=10`
      );
      if (dr.ok && Array.isArray(dr.data)) docs = dr.data;
    }
  }
  return docs.map(d => d.content_md || '').join('\n\n').slice(0, 8000);
}

function parseVariantsFromText(text) {
  if (!text) return [];
  // Strip markdown code fences
  const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/gim, '').trim();
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (!m) return [];
  try {
    const parsed = JSON.parse(m[0]);
    if (!Array.isArray(parsed?.variants)) return [];
    return parsed.variants
      .filter(v => v && typeof v === 'object')
      .slice(0, 5)
      .map(v => ({
        subject: String(v.subject || '').slice(0, 200),
        body: String(v.body || '').slice(0, 2000),
        tone: String(v.tone || 'direct').slice(0, 50),
        hook_angle: String(v.hook_angle || '').slice(0, 200)
      }));
  } catch {
    return [];
  }
}

function buildSystemPrompt(brandtone) {
  return `Du bist AEVUM-Outreach-Writer. Erzeuge 3 Pitch-Varianten fuer einen Lead.

# Brand-Voice (SSOT-KNOWLEDGE — NIE direkt zitieren oder benennen)
${brandtone || '(kein Brandtone-Kontext geladen — nutze Defaults: direkt, ehrlich, kurz, eine spezifische Frage am Ende)'}

# Output STRICT-JSON (nur dieses Objekt, keine Erklaerungen davor/danach):
{
  "variants": [
    {
      "subject": "kurze Betreffzeile (max 60 Zeichen)",
      "body": "Mail-Body (max 4 Saetze, keine Markdown, keine Floskeln)",
      "tone": "direct|curious|reference",
      "hook_angle": "kurze Beschreibung des Hook-Angles (intern)"
    },
    { "...": "Variante 2" },
    { "...": "Variante 3" }
  ]
}

# HARTE REGELN
- NIEMALS interne Hub-Namen, Frameworks oder SSOT-Knowledge-Quellen erwaehnen (z.B. "Bauligs", "Salinsky", Knowledge-Hub-IDs)
- NIEMALS andere Kunden (Tim, Brandedecom, Mario) erwaehnen ohne explizite Daten dazu
- Konkret zu DIESEM Lead, keine generischen Templates
- Max 4 Saetze Body, keine Bullet-Listen, keine Markdown
- Eine spezifische Frage am Ende
- Authentisch, kein AI-Smell, keine "Game-changer"/"Transform"-Floskeln
- 3 unterschiedliche tones: direct, curious, reference`;
}

function buildUserPrompt(lead) {
  return `Lead-Daten:
Company: ${lead.company_name || 'unbekannt'}
Domain: ${lead.company_domain || ''}
Owner: ${lead.owner_name || 'unbekannt'}
Email: ${lead.owner_email}
LinkedIn: ${lead.owner_linkedin_url || ''}

Generiere 3 Pitch-Varianten im AEVUM-Brandtone (JSON-only Output).`;
}

export async function runLeadPitchGeneration({ campaignId, accountId }) {
  const campSel = await supabase.select(
    'lead_scraper_campaigns',
    `?id=eq.${campaignId}&select=*&limit=1`
  );
  if (!campSel.ok || !campSel.data?.length) {
    throw new Error('campaign_not_found');
  }
  const camp = campSel.data[0];

  const brandtone = await loadBrandtoneContext(camp);

  const pendingSel = await supabase.select(
    'leads',
    `?campaign_id=eq.${campaignId}&outreach_status=eq.pending&select=*&limit=200`
  );
  const pending = (pendingSel.ok && Array.isArray(pendingSel.data)) ? pendingSel.data : [];
  if (!pending.length) {
    await supabase.update('lead_scraper_campaigns', `?id=eq.${campaignId}`, {
      status: 'ready_to_send',
      updated_at: new Date().toISOString()
    });
    return { generated: 0 };
  }

  const system = buildSystemPrompt(brandtone);

  let totalIn = 0;
  let totalOut = 0;
  let successCount = 0;

  for (const lead of pending) {
    try {
      const resp = await callAnthropic({
        messages: [{ role: 'user', content: buildUserPrompt(lead) }],
        system,
        model: MODEL,
        maxTokens: 1500
      });
      totalIn += resp.usage?.input_tokens || 0;
      totalOut += resp.usage?.output_tokens || 0;

      let variants = parseVariantsFromText(resp.text || '');
      // SSOT-Sanitization (Memory: feedback_ssot_knowledge_output_protection_2026_05_24)
      const { sanitizeOutputObject } = await import('../output-sanitize.js');
      const sanitized = sanitizeOutputObject(variants, [brandtone || '']);
      if (sanitized.modified) {
        console.warn(`[lead-scraper] sanitize-hits lead=${lead.id}:`, sanitized.hits.join(', '));
        variants = sanitized.object;
      }
      const defaultIdx = 0;
      const defaultVariant = variants[defaultIdx];
      const defaultMsg = defaultVariant
        ? defaultVariant.body
        : `Hi ${lead.owner_name || 'there'}, kurze Frage zu ${lead.company_name || 'eurem Setup'} — passt ein 15-min Call?`;
      const defaultSubject = defaultVariant?.subject
        || `Kurze Frage, ${lead.owner_name || 'Hi'}`;

      await supabase.update('leads', `?id=eq.${lead.id}`, {
        pitch_variants: variants,
        pitch_selected_index: defaultIdx,
        outreach_message: defaultMsg,
        outreach_message_subject: defaultSubject,
        outreach_status: 'generated',
        credits_spent: LEAD_SCRAPER_COST_PER_LEAD
      });
      successCount++;
    } catch (err) {
      console.error(`[lead-scraper] generation failed for lead ${lead.id}:`, err.message || err);
      // Leave lead at pending so manual retry possible — do not mark failed here
    }
  }

  await supabase.update('lead_scraper_campaigns', `?id=eq.${campaignId}`, {
    status: 'ready_to_send',
    updated_at: new Date().toISOString()
  });

  await logUsage({
    accountId,
    sessionId: campaignId,
    endpoint: '/api/factories/lead-scraper/generate',
    model: MODEL,
    inputTokens: totalIn,
    outputTokens: totalOut,
    creditsSpent: successCount * LEAD_SCRAPER_COST_PER_LEAD,
    context: `lead-scraper-pitch-generation campaign=${campaignId}`
  });

  return { generated: successCount, total: pending.length };
}
