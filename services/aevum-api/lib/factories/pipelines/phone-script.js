// Phone-Script Pipeline (Bauligs-aligned)
// Use-Cases: phone-script-cold, phone-script-followup, sales-pitch
// Structure: Opener (Pattern-Interrupt) -> Pain-Validation + Mechanism + Risk-Reversal (Body) -> Soft-Close (CTA)

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
    ? `\nTim-Customer-Profile:\n  - Name: ${timContext.customer_name}\n  - Niche: ${timContext.niche || '-'}\n  - Brand-Voice: ${timContext.brand_voice || '-'}\n  - Target-ICP: ${timContext.target_icp || '-'}\n  - Awareness: ${timContext.awareness_stage || '-'}`
    : '';
  return `Settings:
  - Niche: ${s.niche || '-'}
  - ICP: ${s.icp || '-'}
  - Awareness-Stage: ${s.awareness || '-'}
  - Brand-Tone: ${s.brand_tone || 'direkt, kein Bullshit'}${tim}`;
}

export const phoneScriptPipeline = {
  async run({ inputScript, useCase, settings, knowledge, timContext, variantCount }) {
    const N = Math.min(Math.max(variantCount || 5, 3), 10);
    const knowledgeBlock = buildKnowledge(knowledge);
    const settingsBlock = buildSettings(settings, timContext);

    const sys = `Du bist Senior Sales-Trainer. Generiere optimierte TELEFON-SKRIPTE mit 5-Step-Struktur (Pattern-Interrupt → Pain-Validation → Mechanism-Anchor → Risk-Reversal → Soft-Close).

Sprache: Deutsch, direkt, gesprochen (nicht geschrieben), keine Floskeln, keine KI-Phrasen.

Use-Case: ${useCase.name}
${settingsBlock}${knowledgeBlock}

# OUTPUT-CONSTRAINTS (kritisch — Carlos's IP-Schutz)
- Knowledge-Material ist nur INSPIRATION für dich. NIEMALS Frameworks/Methoden by-name zitieren.
- NIE Begriffe wie "Bauligs", "Salinsky", "Knowledge-Hub", "AEVUM-Framework", "Hub-Doc" o.ä. im Output verwenden.
- NIE direkte 1:1-Quotes oder Step-Listen aus dem Knowledge-Block ausspucken.
- Bei Frage nach Methode in Skript: generic formulieren ("bewährtes Sales-Framework"), nie Namen nennen.
- Generiere immer NEUE Formulierungen die nur die Prinzipien des Materials nutzen.

WICHTIG: Jede Variant MUSS einen anderen Angle haben (z.B. Pain-First / Curiosity / Stat-First / Story-Open / Reframe).`;

    const userMsg = `Original-Skript des Users:
"""
${inputScript}
"""

Generiere ${N} optimierte Telefonskript-Varianten. JSON-Array-Output, strict:

[
  {
    "variant_index": 0,
    "opener": "<2-3 Sätze Pattern-Interrupt-Opener>",
    "pain_validation": "<1-2 Sätze Pain-Frage>",
    "mechanism": "<2-3 Sätze WIE wir lösen>",
    "risk_reversal": "<1 Satz Garantie/Pilot>",
    "soft_close": "<1 Satz Soft-Close-Frage>",
    "angle": "<Pain-First|Curiosity|Stat|Story|Reframe>",
    "full_script": "<komplettes Skript als ein Block, ready-to-read>"
  }
]

NUR JSON-Array, keine Erklärung. Genau ${N} Varianten.`;

    const resp = await callAnthropic({
      messages: [{ role: 'user', content: userMsg }],
      system: sys,
      model: MODEL,
      maxTokens: 4000
    });

    const arr = parseJsonArray(resp.text);
    return arr.slice(0, N).map((v, i) => ({
      variant_index: typeof v.variant_index === 'number' ? v.variant_index : i,
      hook: v.opener || '',
      body: [v.pain_validation, v.mechanism, v.risk_reversal].filter(Boolean).join('\n\n'),
      cta: v.soft_close || '',
      full_script: v.full_script || [v.opener, v.pain_validation, v.mechanism, v.risk_reversal, v.soft_close].filter(Boolean).join('\n\n'),
      platform_format: 'phone-script',
      meta: { angle: v.angle || null }
    }));
  }
};

function parseJsonArray(text) {
  if (!text) return [];
  // Try strict first
  try { const j = JSON.parse(text); if (Array.isArray(j)) return j; } catch {}
  // Find first [ ... ] in text
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try { const j = JSON.parse(m[0]); return Array.isArray(j) ? j : []; } catch { return []; }
}
