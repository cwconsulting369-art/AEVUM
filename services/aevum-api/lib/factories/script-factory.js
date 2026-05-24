// AEVUM Script-Factory — Wave C1 (SaaS Variante C, Pay-per-Run)
// Created: 2026-05-24
//
// 4-Stage LLM-Pipeline:
//   Stage 1: Generate N hooks (1 call)
//   Stage 2: Body per hook (parallel)
//   Stage 3: CTA per hook+body (parallel)
//   Stage 4: Format per platform (no LLM call, local)
//
// Cost-tracking via logUsage (writes agent_usage_log + EUR spend).
// Auto-refund on failure handled by the route layer.

import { supabase } from '../supabase.js';
import { callAnthropic } from '../anthropic-helper.js';
import { logUsage } from '../credit-spend.js';

const COST_PER_RUN_CREDITS = 40;
const MODEL = 'claude-sonnet-4-5';

// ─── Platform-spezifische Format-Hints (Stage 4 + Prompt-Steering) ──
const PLATFORM_HINTS = {
  meta: 'Meta/Instagram Reel oder Facebook Ad. 15-30 Sek. Hook in den ersten 3 Sek. Mobile-first.',
  tiktok: 'TikTok Ad. 15-30 Sek. Pattern-Interrupt im Hook. Native, ungeschliffener Ton, hohes Tempo.',
  youtube: 'YouTube Pre-Roll oder Shorts. 15-60 Sek. Hook muss in 5 Sek. den Skip verhindern.',
  all: 'Multi-Platform — funktioniert auf Meta, TikTok und YouTube. Schreibe so, dass es auf allen Plattformen funktioniert.'
};

const PLATFORM_DURATION = {
  meta: 30,
  tiktok: 30,
  youtube: 60,
  all: 30
};

// ─── PUBLIC: runScriptFactory ────────────────────────────────────
export async function runScriptFactory({ runId, accountId }) {
  // 1. Load run + brand context
  const runSel = await supabase.select(
    'script_factory_runs',
    `?id=eq.${runId}&select=*&limit=1`
  );
  if (!runSel.ok || !runSel.data?.length) throw new Error('run_not_found');
  const run = runSel.data[0];

  let brand = null;
  if (run.brand_id) {
    const bSel = await supabase.select(
      'script_factory_brands',
      `?id=eq.${run.brand_id}&select=*&limit=1`
    );
    brand = bSel.data?.[0] || null;
  }

  // Mark running
  await supabase.update('script_factory_runs', `?id=eq.${runId}`, {
    status: 'running',
    started_at: new Date().toISOString()
  });

  let totalInput = 0;
  let totalOutput = 0;
  const N = Math.min(Math.max(Number(run.variant_count) || 5, 3), 10);

  // ─── Stage 1: Hooks ─────────────────────────────────────────
  const hooksResp = await callAnthropic({
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: buildHooksUserPrompt(run, brand, N) }],
    model: MODEL,
    maxTokens: 800
  });
  totalInput += hooksResp.usage.input_tokens;
  totalOutput += hooksResp.usage.output_tokens;

  const hooks = parseHooks(hooksResp.text, N);
  if (hooks.length === 0) throw new Error('hook_generation_empty');

  // ─── Stage 2+3: Body + CTA pro Hook (parallel) ──────────────
  const variants = await Promise.all(hooks.map(async (hook, idx) => {
    const bodyResp = await callAnthropic({
      system: buildSystemPrompt(brand),
      messages: [{ role: 'user', content: buildBodyUserPrompt(hook, run, brand) }],
      model: MODEL,
      maxTokens: 500
    });
    totalInput += bodyResp.usage.input_tokens;
    totalOutput += bodyResp.usage.output_tokens;

    const ctaResp = await callAnthropic({
      system: buildSystemPrompt(brand),
      messages: [{ role: 'user', content: buildCtaUserPrompt(hook, bodyResp.text, run, brand) }],
      model: MODEL,
      maxTokens: 200
    });
    totalInput += ctaResp.usage.input_tokens;
    totalOutput += ctaResp.usage.output_tokens;

    return {
      variant_index: idx,
      hook: hook.trim(),
      body: bodyResp.text.trim(),
      cta: ctaResp.text.trim()
    };
  }));

  // ─── Stage 4: Format + persist outputs ──────────────────────
  const platformFormat = run.platform === 'all'
    ? 'multi'
    : `${run.platform}-${PLATFORM_DURATION[run.platform] || 30}s`;

  for (const v of variants) {
    const full_script = formatScript(v, run.platform);
    const estimated_duration_sec = estimateDuration(`${v.hook} ${v.body} ${v.cta}`);
    await supabase.insert('script_factory_outputs', {
      run_id: runId,
      variant_index: v.variant_index,
      hook: v.hook,
      body: v.body,
      cta: v.cta,
      full_script,
      platform_format: platformFormat,
      estimated_duration_sec
    });
  }

  // Cost-tracking via credit-spend
  const { costEur } = await logUsage({
    accountId,
    sessionId: runId,
    endpoint: '/api/factories/script/run',
    model: MODEL,
    inputTokens: totalInput,
    outputTokens: totalOutput,
    creditsSpent: COST_PER_RUN_CREDITS,
    context: 'script-factory-run'
  });

  await supabase.update('script_factory_runs', `?id=eq.${runId}`, {
    status: 'complete',
    finished_at: new Date().toISOString(),
    credits_spent: COST_PER_RUN_CREDITS,
    cost_eur: costEur,
    input_tokens: totalInput,
    output_tokens: totalOutput
  });

  return { runId, variants: variants.length, costEur };
}

export const SCRIPT_FACTORY_COST_CREDITS = COST_PER_RUN_CREDITS;

// ─── Prompt-Builder ──────────────────────────────────────────────
function buildSystemPrompt(brand) {
  const voice = brand?.voice ? `\nBrand-Voice: ${brand.voice}` : '';
  const audience = brand?.audience ? `\nZielgruppe: ${brand.audience}` : '';
  const usps = Array.isArray(brand?.unique_selling_points) && brand.unique_selling_points.length
    ? `\nUSPs: ${brand.unique_selling_points.join(' / ')}`
    : '';
  const avoid = Array.isArray(brand?.do_not_say) && brand.do_not_say.length
    ? `\nNICHT verwenden: ${brand.do_not_say.join(' / ')}`
    : '';

  return `Du bist ein Senior Performance-Copywriter für E-Commerce Ad-Scripts.
Du schreibst auf Deutsch, direkt, ohne Floskeln, ohne KI-Phrasen.${voice}${audience}${usps}${avoid}

Regeln:
- Hooks: kurz, scharf, Pattern-Interrupt oder Pain-Point oder Curiosity-Gap.
- Body: spezifisch, konkret, ein klarer Nutzen, keine Buzzwords.
- CTA: aktionsorientiert, ein klarer nächster Schritt, keine generischen "Jetzt kaufen!".`;
}

function buildHooksUserPrompt(run, brand, n) {
  const platformHint = PLATFORM_HINTS[run.platform] || PLATFORM_HINTS.all;
  const productDesc = run.product_description
    ? `\nProdukt-Beschreibung: ${run.product_description}`
    : '';

  return `Produkt: ${run.product_name}${productDesc}
Hook-Ziel: ${run.hook_goal}
Plattform: ${platformHint}

Generiere genau ${n} verschiedene Hooks (jeweils 1-2 Sätze, max. 20 Wörter pro Hook).
Jeder Hook MUSS einen anderen Angle nutzen (z.B. Pain-Point / Curiosity / Stat-Hook / Story-Open / Pattern-Interrupt).

Format (genau einhalten):
1. <Hook 1>
2. <Hook 2>
...

Keine Einleitung, keine Erklärung, NUR die nummerierte Liste.`;
}

function buildBodyUserPrompt(hook, run, brand) {
  const platformHint = PLATFORM_HINTS[run.platform] || PLATFORM_HINTS.all;
  const productDesc = run.product_description
    ? `\nProdukt-Beschreibung: ${run.product_description}`
    : '';

  return `Produkt: ${run.product_name}${productDesc}
Plattform: ${platformHint}

Hook (bereits fest):
"${hook}"

Schreibe den Body (Hauptteil) der Werbung — 40-70 Wörter, knüpft direkt am Hook an.
Liefere einen konkreten Nutzen, einen Beleg/Beispiel, vermeide leere Adjektive.
Schreibe so, dass es gesprochen klingt (nicht geschrieben).

Antworte NUR mit dem Body-Text, keine Einleitung, keine Anführungszeichen.`;
}

function buildCtaUserPrompt(hook, body, run, brand) {
  return `Produkt: ${run.product_name}
Plattform: ${run.platform}

Hook: "${hook}"
Body: "${body}"

Schreibe genau EINE CTA-Zeile (max. 15 Wörter).
Konkret, aktionsorientiert, ein klarer Schritt. Kein "Jetzt kaufen!", kein "Klick hier!".
Verwende einen klaren Verb + Nutzen-Bezug.

Antworte NUR mit der CTA-Zeile, ohne Anführungszeichen, ohne Erklärung.`;
}

// ─── Parser ─────────────────────────────────────────────────────
function parseHooks(text, n) {
  if (!text) return [];
  // Match numbered list lines: "1. ..." / "1) ..."
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const out = [];
  for (const line of lines) {
    const m = line.match(/^(\d+)[\.\)]\s*(.+)$/);
    if (m) {
      const hook = m[2].replace(/^["„'»]|["“'«]$/g, '').trim();
      if (hook.length >= 5) out.push(hook);
    }
  }
  // Fallback: split paragraphs if no numbered list found
  if (out.length === 0) {
    const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length >= 5);
    out.push(...paras);
  }
  return out.slice(0, n);
}

// ─── Formatters ─────────────────────────────────────────────────
function formatScript(v, platform) {
  const header = platform === 'all'
    ? '[Multi-Platform Script]'
    : `[${platform.toUpperCase()} Script]`;
  return `${header}

HOOK:
${v.hook}

BODY:
${v.body}

CTA:
${v.cta}`;
}

function estimateDuration(text) {
  // ~150 words/min spoken → 0.4 sec per word; min 5s, max 90s
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  const sec = Math.round(words * 0.4);
  return Math.min(Math.max(sec, 5), 90);
}
