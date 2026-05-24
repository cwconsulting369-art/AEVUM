// Output-Sanitization-Layer
// Memory: feedback_ssot_knowledge_output_protection_2026_05_24
// Carlos: SSOT-Knowledge (Bauligs/Salinsky/etc) darf NIE als Output zu Customer rausgehen.
//
// Wird VOR persist + VOR Response aufgerufen, scant für Forbidden-Terms + Long-Quotes.

const FORBIDDEN_TERMS = [
  /bauligs/gi,
  /salinsky/gi,
  /knowledge[- ]hub/gi,
  /\bSSOT\b/g,
  /\bAEVUM[- ]?Internal\b/gi,
  /\bHub[- ]?Doc\b/gi,
  /aevum[- ]?default\b/gi,
];

// Falls Knowledge-Material Phrases hat die exakt 8+ Wörter matched → wahrscheinlich 1:1-Quote
const LONG_QUOTE_MIN_WORDS = 8;

export function sanitizeOutputText(text, knowledgeChunks = []) {
  if (!text || typeof text !== 'string') return { text, modified: false, hits: [] };
  let out = text;
  const hits = [];

  // 1. Forbidden-Term-Replacement
  for (const re of FORBIDDEN_TERMS) {
    if (re.test(out)) {
      hits.push(re.source);
      out = out.replace(re, '[—]');
    }
    re.lastIndex = 0;
  }

  // 2. Long-Quote-Detection
  if (knowledgeChunks.length) {
    const flatKnowledge = knowledgeChunks
      .map(k => (typeof k === 'string' ? k : k.content_md || ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .toLowerCase();
    const words = out.toLowerCase().split(/\s+/);
    for (let i = 0; i <= words.length - LONG_QUOTE_MIN_WORDS; i++) {
      const phrase = words.slice(i, i + LONG_QUOTE_MIN_WORDS).join(' ');
      if (phrase.length > 30 && flatKnowledge.includes(phrase)) {
        hits.push(`long_quote:"${phrase.slice(0, 60)}..."`);
        // Soft-Replace: leave text but flag
        break;
      }
    }
  }

  return { text: out, modified: hits.length > 0, hits };
}

export function sanitizeOutputObject(obj, knowledgeChunks = []) {
  if (!obj || typeof obj !== 'object') return { object: obj, modified: false, hits: [] };
  const allHits = [];
  const walk = (node) => {
    if (typeof node === 'string') {
      const r = sanitizeOutputText(node, knowledgeChunks);
      if (r.modified) allHits.push(...r.hits);
      return r.text;
    }
    if (Array.isArray(node)) return node.map(walk);
    if (typeof node === 'object' && node !== null) {
      const out = {};
      for (const [k, v] of Object.entries(node)) out[k] = walk(v);
      return out;
    }
    return node;
  };
  const cleaned = walk(obj);
  return { object: cleaned, modified: allHits.length > 0, hits: allHits };
}
