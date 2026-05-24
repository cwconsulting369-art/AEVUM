// E-Commerce Pipeline (Salinsky AIDA+ adapted for product pages)
// Use-Case: ecommerce-product
// Structure: Product-Hook -> USP-Bullets -> Social-Proof -> CTA

import { callAnthropic } from '../../anthropic-helper.js';

const MODEL = 'claude-sonnet-4-5';

function buildKnowledge(knowledge) {
  if (!knowledge?.length) return '';
  const chunks = knowledge
    .map(k => `### ${k.title}\n${(k.content_md || '').slice(0, 2500)}`)
    .join('\n\n')
    .slice(0, 8000);
  return `\n\n# Knowledge-Hub-Material (Reference)\n${chunks}`;
}

function buildSettings(settings, timContext) {
  const s = settings || {};
  const tim = timContext
    ? `\nTim-Customer-Profile:\n  - Name: ${timContext.customer_name}\n  - Niche: ${timContext.niche || '-'}\n  - Brand-Voice: ${timContext.brand_voice || '-'}\n  - Target-ICP: ${timContext.target_icp || '-'}\n  - Awareness: ${timContext.awareness_stage || '-'}\n  - Product-Category: ${timContext.product_category || '-'}`
    : '';
  return `Settings:
  - Niche: ${s.niche || '-'}
  - Awareness-Stage: ${s.awareness || '-'}
  - Brand-Tone: ${s.brand_tone || 'direkt, konkret, Outcome-fokussiert'}${tim}`;
}

export const ecommercePipeline = {
  async run({ inputScript, useCase, settings, knowledge, timContext, variantCount }) {
    const N = Math.min(Math.max(variantCount || 5, 3), 10);
    const knowledgeBlock = buildKnowledge(knowledge);
    const settingsBlock = buildSettings(settings, timContext);

    const sys = `Du bist Senior E-Commerce Conversion-Copywriter. Nutze Salinsky AIDA+ Framework angepasst für Product-Page-Copy:
- Product-Hook (Headline + 1-2 Sätze, löst Pain)
- USP-Bullets (3-5 Bullets, konkrete Outcomes statt Features)
- Social-Proof (Customer-Quote oder Stats)
- CTA (action-orientiert + Risk-Reversal-Hint)

Sprache: Deutsch, direkt, gesprochen, keine Buzzwords ("Game-changer", "Transform", "Unleash" verboten).

Use-Case: ${useCase.name}
${settingsBlock}${knowledgeBlock}

WICHTIG: Jede Variant MUSS einen anderen Angle haben (Outcome-First / Pain-Solver / Founder-Story / Comparison / Demo-Visual).`;

    const userMsg = `Original Product-Page-Copy des Users:
"""
${inputScript}
"""

Generiere ${N} optimierte Product-Page-Copy-Varianten. JSON-Array-Output, strict:

[
  {
    "variant_index": 0,
    "product_hook": "<Headline + 1-2 Sätze>",
    "usp_bullets": ["<USP 1>", "<USP 2>", "<USP 3>"],
    "social_proof": "<Customer-Voice oder Stat>",
    "cta": "<CTA + Risk-Reversal-Hint>",
    "angle": "<Outcome-First|Pain-Solver|Founder-Story|Comparison|Demo>",
    "full_script": "<komplette Product-Page-Copy als ein Block, ready-to-paste>"
  }
]

NUR JSON-Array. Genau ${N} Varianten.`;

    const resp = await callAnthropic({
      messages: [{ role: 'user', content: userMsg }],
      system: sys,
      model: MODEL,
      maxTokens: 4500
    });

    const arr = parseJsonArray(resp.text);
    return arr.slice(0, N).map((v, i) => ({
      variant_index: typeof v.variant_index === 'number' ? v.variant_index : i,
      hook: v.product_hook || '',
      body: [
        Array.isArray(v.usp_bullets) ? v.usp_bullets.map(b => `- ${b}`).join('\n') : '',
        v.social_proof || ''
      ].filter(Boolean).join('\n\n'),
      cta: v.cta || '',
      full_script: v.full_script || [
        v.product_hook,
        Array.isArray(v.usp_bullets) ? v.usp_bullets.map(b => `- ${b}`).join('\n') : '',
        v.social_proof,
        v.cta
      ].filter(Boolean).join('\n\n'),
      platform_format: 'ecommerce-product',
      meta: { angle: v.angle || null, usp_count: Array.isArray(v.usp_bullets) ? v.usp_bullets.length : 0 }
    }));
  }
};

function parseJsonArray(text) {
  if (!text) return [];
  try { const j = JSON.parse(text); if (Array.isArray(j)) return j; } catch {}
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try { const j = JSON.parse(m[0]); return Array.isArray(j) ? j : []; } catch { return []; }
}
