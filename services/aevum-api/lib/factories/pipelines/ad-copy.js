// Ad-Copy Pipeline (Salinsky-aligned)
// Use-Cases: ad-copy-meta, ad-copy-google, ad-copy-tiktok
// Structure: Hook (3s pattern-interrupt) -> Body (USPs + Social-Proof) -> CTA

import { callAnthropic } from '../../anthropic-helper.js';

const MODEL = 'claude-sonnet-4-5';

const PLATFORM_HINTS = {
  meta: 'Meta/Instagram Reel/Story. 15-30s. Mobile-first. Hook in den ersten 3 Sek. Visual-driven.',
  google: 'Google Search Ad. Headlines max 30 chars, Descriptions max 90 chars. Keyword-rich, klar.',
  tiktok: 'TikTok native Ad. 15-30s. Pattern-Interrupt, ungeschliffener Ton, hohes Tempo, vertikal.',
  all: 'Multi-Platform (Meta+TikTok+Google). Hook in 3s. Mobile-first.'
};

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
  - ICP: ${s.icp || '-'}
  - Awareness-Stage: ${s.awareness || '-'}
  - Brand-Tone: ${s.brand_tone || 'direkt'}
  - Platform: ${s.platform || 'meta'}${tim}`;
}

function detectPlatformFromUseCase(useCase) {
  const slug = useCase?.slug || '';
  if (slug.includes('meta')) return 'meta';
  if (slug.includes('google')) return 'google';
  if (slug.includes('tiktok')) return 'tiktok';
  return 'meta';
}

export const adCopyPipeline = {
  async run({ inputScript, useCase, settings, knowledge, timContext, variantCount }) {
    const N = Math.min(Math.max(variantCount || 5, 3), 10);
    const platform = settings?.platform && settings.platform !== 'all' ? settings.platform : detectPlatformFromUseCase(useCase);
    const platformHint = PLATFORM_HINTS[platform] || PLATFORM_HINTS.meta;
    const knowledgeBlock = buildKnowledge(knowledge);
    const settingsBlock = buildSettings(settings, timContext);

    const sys = `Du bist Senior Performance-Copywriter für ${platform.toUpperCase()}-Ads. Nutze die AIDA+ Struktur (Attention/Hook 3s → Interest/Body → Desire/Outcome → Action/CTA + Risk-Reversal).

# OUTPUT-CONSTRAINTS (Carlos's IP-Schutz)
- Knowledge-Material = nur Inspiration. NIE Framework-Namen ("Salinsky", "Bauligs", "Hub", "AEVUM-Method", o.ä.) im Output.
- Keine 1:1-Quotes aus Knowledge-Material. Eigene Formulierungen.
- Bei Methoden-Erwähnung in Copy: generic bleiben ("bewährte Conversion-Struktur").

Sprache: ${platform === 'google' ? 'Deutsch, knapp, keyword-rich' : 'Deutsch, direkt, gesprochen, keine Floskeln'}.

Use-Case: ${useCase.name}
Platform-Hint: ${platformHint}
${settingsBlock}${knowledgeBlock}

WICHTIG: Jede Variant MUSS einen anderen Hook-Type haben (Curiosity / Pain-Agitation / Social-Proof / Educational-Anchor / Demo-Visual).`;

    const userMsg = `Original-Ad-Copy des Users:
"""
${inputScript}
"""

Generiere ${N} optimierte ${platform.toUpperCase()}-Ad-Copy-Varianten. JSON-Array-Output, strict:

[
  {
    "variant_index": 0,
    "hook": "<3s Pattern-Interrupt, max 20 Wörter>",
    "body": "<Body-Text: USP + Social-Proof, ${platform === 'google' ? '90 chars max' : '40-70 Wörter'}>",
    "cta": "<Action-CTA, max 15 Wörter, kein 'Jetzt kaufen!'>",
    "hook_type": "<Curiosity|Pain-Agitation|Social-Proof|Educational|Demo-Visual>",
    "full_script": "<komplettes Ad-Script als ein Block>"
  }
]

NUR JSON-Array. Genau ${N} Varianten.`;

    const resp = await callAnthropic({
      messages: [{ role: 'user', content: userMsg }],
      system: sys,
      model: MODEL,
      maxTokens: 4000
    });

    const arr = parseJsonArray(resp.text);
    return arr.slice(0, N).map((v, i) => ({
      variant_index: typeof v.variant_index === 'number' ? v.variant_index : i,
      hook: v.hook || '',
      body: v.body || '',
      cta: v.cta || '',
      full_script: v.full_script || `HOOK:\n${v.hook}\n\nBODY:\n${v.body}\n\nCTA:\n${v.cta}`,
      platform_format: `${platform}-ad-copy`,
      meta: { hook_type: v.hook_type || null, platform }
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
