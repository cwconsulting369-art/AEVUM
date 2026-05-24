// AEVUM Script-Factory V2 — Wave H1 (2026-05-24)
// Multi-Pipeline-Orchestrator:
//   - Phone-Script (Bauligs-aligned)
//   - Ad-Copy (Salinsky-aligned, Meta/Google/TikTok)
//   - E-Commerce (AIDA+ Product-Page)
//
// Pipeline:
//   1. Load run + use-case + knowledge-hubs + tim-customer-context
//   2. Analyze input-script (A-F grade + hook-score + breakdown)
//   3. Run use-case-specific pipeline (variant generation)
//   4. Analyze each output-variant (grade + hook-score)
//   5. Compute differences before -> best-variant
//   6. Persist outputs + grading + analysis
//   7. logUsage + finalize run

import { supabase } from '../supabase.js';
import { callAnthropic } from '../anthropic-helper.js';
import { logUsage } from '../credit-spend.js';
import { phoneScriptPipeline } from './pipelines/phone-script.js';
import { adCopyPipeline } from './pipelines/ad-copy.js';
import { ecommercePipeline } from './pipelines/ecommerce.js';

const PIPELINES = {
  'phone-script': phoneScriptPipeline,
  'ad-copy': adCopyPipeline,
  'ecommerce': ecommercePipeline
};

export const SCRIPT_FACTORY_V2_COST_CREDITS = 40;
const MODEL = 'claude-sonnet-4-5';

export async function runScriptFactoryV2({ runId, accountId }) {
  // 1. Load run
  const runSel = await supabase.select('script_factory_runs', `?id=eq.${runId}&select=*&limit=1`);
  if (!runSel.ok || !runSel.data?.length) throw new Error('run_not_found');
  const run = runSel.data[0];
  if (!run.use_case) throw new Error('use_case_required_v2');
  if (!run.input_script) throw new Error('input_script_required_v2');

  // 2. Load use-case
  const ucSel = await supabase.select('script_use_cases', `?slug=eq.${encodeURIComponent(run.use_case)}&limit=1`);
  const useCase = ucSel.data?.[0];
  if (!useCase) throw new Error(`use_case_not_found:${run.use_case}`);

  const pipeline = PIPELINES[useCase.pipeline_id];
  if (!pipeline) throw new Error(`pipeline_not_found:${useCase.pipeline_id}`);

  // 3. Load knowledge-hubs
  let hubIds = Array.isArray(run.knowledge_hub_ids) ? run.knowledge_hub_ids : [];
  // Auto-include default hub if none picked
  if (hubIds.length === 0 && useCase.default_hub_slug) {
    const defH = await supabase.select('knowledge_hubs', `?slug=eq.${encodeURIComponent(useCase.default_hub_slug)}&select=id&limit=1`);
    if (defH.data?.[0]?.id) hubIds = [defH.data[0].id];
  }

  let knowledge = [];
  if (hubIds.length) {
    const inList = hubIds.map(id => `"${id}"`).join(',');
    const docsSel = await supabase.select(
      'knowledge_documents',
      `?hub_id=in.(${inList})&select=title,content_md,metadata&limit=20`
    );
    knowledge = docsSel.data || [];
  }

  // 4. Load Tim-customer-context
  let timContext = null;
  if (run.tim_customer_id) {
    const tcSel = await supabase.select('tim_customers', `?id=eq.${run.tim_customer_id}&select=*&limit=1`);
    timContext = tcSel.data?.[0] || null;
  }

  // 5. Mark running
  await supabase.update('script_factory_runs', `?id=eq.${runId}`, {
    status: 'running',
    started_at: new Date().toISOString()
  });

  let totalIn = 0, totalOut = 0;
  const trackUsage = (u) => { if (u) { totalIn += u.input_tokens || 0; totalOut += u.output_tokens || 0; } };

  // 6. Phase 1: Analyze input-script
  const analyzeBefore = await analyzeScript({
    script: run.input_script,
    useCase,
    settings: run.settings,
    knowledge,
    timContext,
    trackUsage
  });

  // 7. Phase 2: Run pipeline
  const variants = await pipeline.run({
    inputScript: run.input_script,
    useCase,
    settings: run.settings || {},
    knowledge,
    timContext,
    variantCount: run.variant_count || 5
  });

  if (!variants.length) throw new Error('pipeline_returned_no_variants');

  // 8. Phase 3: Analyze each variant (parallel, capped)
  const analyzedVariants = await Promise.all(variants.map(async (v) => {
    const a = await analyzeScript({
      script: v.full_script,
      useCase,
      settings: run.settings,
      knowledge: [],
      timContext,
      trackUsage
    });
    return { ...v, grade: a.grade, hook_score: a.hook_score, analysis: a };
  }));

  // 9. Pick best variant
  const best = analyzedVariants.reduce((a, b) => (parseGrade(b.grade) < parseGrade(a.grade) ? b : a));

  // 10. Compute differences (before -> best-variant)
  const differences = await computeDifferences({
    before: analyzeBefore,
    after: best.analysis,
    trackUsage
  });

  // 11. Persist outputs — mit SSOT-Knowledge-Output-Sanitization (Memory: feedback_ssot_knowledge_output_protection_2026_05_24)
  const { sanitizeOutputText, sanitizeOutputObject } = await import('../output-sanitize.js');
  const knowledgeChunks = (knowledge || []).map(k => k.content_md || '');
  let sanitizeHitsTotal = 0;
  for (const v of analyzedVariants) {
    const h = sanitizeOutputText(v.hook || '', knowledgeChunks);
    const b = sanitizeOutputText(v.body || '', knowledgeChunks);
    const c = sanitizeOutputText(v.cta || '', knowledgeChunks);
    const fs = sanitizeOutputText(v.full_script || '', knowledgeChunks);
    const a = sanitizeOutputObject(v.analysis || null, knowledgeChunks);
    if (h.modified || b.modified || c.modified || fs.modified || a.modified) {
      sanitizeHitsTotal += h.hits.length + b.hits.length + c.hits.length + fs.hits.length + a.hits.length;
      console.warn(`[script-factory-v2] sanitize-hits variant=${v.variant_index}:`, [...h.hits, ...b.hits, ...c.hits, ...fs.hits, ...a.hits].join(', '));
    }
    await supabase.insert('script_factory_outputs', {
      run_id: runId,
      variant_index: v.variant_index,
      hook: h.text || null,
      body: b.text || null,
      cta: c.text || null,
      full_script: fs.text,
      platform_format: v.platform_format || null,
      grade: v.grade || null,
      hook_score: v.hook_score ?? null,
      analysis: a.object ? { ...a.object, _meta: v.meta || null } : null
    });
  }
  if (sanitizeHitsTotal > 0) {
    console.warn(`[script-factory-v2] TOTAL sanitize-hits for run=${runId}: ${sanitizeHitsTotal}`);
  }

  // 12. logUsage + finalize
  const { costEur } = await logUsage({
    accountId,
    sessionId: runId,
    endpoint: '/api/factories/script/run',
    model: MODEL,
    inputTokens: totalIn,
    outputTokens: totalOut,
    creditsSpent: SCRIPT_FACTORY_V2_COST_CREDITS,
    context: `script-factory-v2:${run.use_case}`
  });

  await supabase.update('script_factory_runs', `?id=eq.${runId}`, {
    status: 'complete',
    finished_at: new Date().toISOString(),
    credits_spent: SCRIPT_FACTORY_V2_COST_CREDITS,
    cost_eur: costEur,
    input_tokens: totalIn,
    output_tokens: totalOut,
    grade_before: analyzeBefore.grade || null,
    grade_after: best.grade || null,
    hook_score_before: analyzeBefore.hook_score ?? null,
    hook_score_after: best.hook_score ?? null,
    analysis_before: analyzeBefore,
    analysis_after: best.analysis,
    differences
  });

  return {
    runId,
    variants: analyzedVariants.length,
    gradeBefore: analyzeBefore.grade,
    gradeAfter: best.grade,
    hookScoreBefore: analyzeBefore.hook_score,
    hookScoreAfter: best.hook_score,
    costEur
  };
}

function parseGrade(g) {
  const map = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
  return map[(g || 'F')[0]] ?? 5;
}

async function analyzeScript({ script, useCase, settings, knowledge, timContext, trackUsage }) {
  const knowledgeBlock = knowledge?.length
    ? knowledge.map(k => `## ${k.title}\n${(k.content_md || '').slice(0, 1500)}`).join('\n\n').slice(0, 6000)
    : '';

  const tim = timContext
    ? `\nTim-Customer-Profile:\n${JSON.stringify({ niche: timContext.niche, brand_voice: timContext.brand_voice, target_icp: timContext.target_icp, awareness: timContext.awareness_stage }, null, 2)}`
    : '';

  const sys = `Du bist Script-Analyst für Use-Case "${useCase.name}".

Bewertungs-Skala: A (excellent) bis F (failure).
Hook-Score: 0.0-10.0.

Settings:
${JSON.stringify(settings || {}, null, 2)}
${tim}

${knowledgeBlock ? `Knowledge-Reference:\n${knowledgeBlock}` : ''}

Output STRICT JSON-Object, KEIN Markdown-Wrapper:
{
  "grade": "A|B|C|D|E|F",
  "hook_score": 7.5,
  "strengths": ["...","..."],
  "weaknesses": ["...","..."],
  "score_breakdown": {
    "hook": 7.5,
    "structure": 6.0,
    "specificity": 5.5,
    "icp_match": 7.0,
    "cta": 6.5
  },
  "summary": "1 sentence overall."
}`;

  const userMsg = `Analysiere dieses Skript:\n\n"""\n${script}\n"""`;

  const resp = await callAnthropic({
    messages: [{ role: 'user', content: userMsg }],
    system: sys,
    model: MODEL,
    maxTokens: 1500
  });
  trackUsage?.(resp.usage);

  return parseJsonObj(resp.text, {
    grade: 'C',
    hook_score: 5.0,
    strengths: [],
    weaknesses: ['parse-failed'],
    score_breakdown: {},
    summary: 'Parse failed'
  });
}

async function computeDifferences({ before, after, trackUsage }) {
  const sys = `Vergleiche zwei Skript-Analysen. Identifiziere konkret was verbessert wurde.

Output STRICT JSON-Object, KEIN Markdown-Wrapper:
{
  "changes": [
    { "what": "...", "why": "...", "score_delta": 1.5 }
  ],
  "grade_delta": "C -> A",
  "key_improvement": "1 sentence",
  "hook_score_delta": 2.5
}`;

  const userMsg = `Vorher:\n${JSON.stringify(before, null, 2)}\n\nNachher:\n${JSON.stringify(after, null, 2)}`;

  const resp = await callAnthropic({
    messages: [{ role: 'user', content: userMsg }],
    system: sys,
    model: MODEL,
    maxTokens: 1200
  });
  trackUsage?.(resp.usage);

  const hookDelta = (Number(after?.hook_score) || 0) - (Number(before?.hook_score) || 0);
  return parseJsonObj(resp.text, {
    changes: [],
    grade_delta: `${before?.grade || '?'} -> ${after?.grade || '?'}`,
    key_improvement: 'auto-computed',
    hook_score_delta: hookDelta
  });
}

function parseJsonObj(text, fallback) {
  if (!text) return fallback;
  try { const j = JSON.parse(text); if (j && typeof j === 'object') return j; } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return fallback;
  try { const j = JSON.parse(m[0]); return j && typeof j === 'object' ? j : fallback; } catch { return fallback; }
}
