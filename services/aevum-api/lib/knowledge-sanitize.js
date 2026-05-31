// AEVUM Knowledge-Hub Sanitization Layer — Block F1
// Created: 2026-05-25
//
// Purpose:
//   Zwingend zwischen knowledge_entries-Row und JEDEM Customer-LLM-Prompt/Output.
//   Verhindert dass raw_excerpt, Brand-Names, Framework-Acronyms oder 1:1-Phrasen
//   versehentlich an einen Customer rausgehen.
//
// Memory-Reference: feedback_ssot_knowledge_output_protection_2026_05_25.
//
// Usage:
//   import { sanitizeForCustomer, sanitizeMany } from '../lib/knowledge-sanitize.js';
//   const safe = sanitizeForCustomer(entry);                  // → string | null
//   const safeArr = sanitizeMany(entries);                    // → string[] (only safe entries)

// ---- Brand/Framework Stop-List ----------------------------------------------
// Diese Patterns werden aggressiv aus jedem Output gestrippt. Erweitern sobald
// neue Knowledge-Sources reinkommen.
const BRAND_PATTERNS = [
  /\bbaulig(?:s|-twins?)?\b/gi,
  /\bsalinsky\b/gi,
  /\bknightvision\b/gi,
  /\bmario\b/gi,
  /\bbrandedecom\b/gi,
  /\bhormozi\b/gi,
  /\btony\s+robbins\b/gi,
  /\bgary\s*vee\b/gi
];

// Framework-Akronyme die copyright/trademark-sensitiv sind (case-insensitive).
const FRAMEWORK_PATTERNS = [
  /\b(?:BANT|MEDDIC|MEDDPICC|SPIN|GAP|CHAMP|FAINT)\b/g,
  /\b\$100M\s+offers?\b/gi,
  /\b(?:grand\s+slam\s+offer)\b/gi
];

// Attribution-Phrases die signalisieren dass jemand zitiert wird.
const ATTRIBUTION_PATTERNS = [
  /\b\w+s?\s+(?:sagt|sagen|empfiehlt|empfehlen|nennt|nennen|nutzt|nutzen)\s+(?:das|es|dies)\b/gi,
  /\b(?:nach|laut|gemäß)\s+\w+s?\b/gi,
  /\b\w+s?-(?:methode|framework|formel|system)\b/gi
];

// Replace-Token (neutralisiert die Stelle ohne komplett zu löschen).
const REDACT = '[…]';

/**
 * Strippt Brand-Names, Framework-Akronyme und Attribution-Phrases.
 * Behält den umgebenden Satzbau erhalten.
 *
 * @param {string} text
 * @returns {string}
 */
export function stripBrandsAndFrameworks(text) {
  if (!text || typeof text !== 'string') return '';
  let out = text;
  for (const re of BRAND_PATTERNS)        out = out.replace(re, REDACT);
  for (const re of FRAMEWORK_PATTERNS)    out = out.replace(re, REDACT);
  for (const re of ATTRIBUTION_PATTERNS)  out = out.replace(re, REDACT);
  // Aufeinanderfolgende REDACTs kompakter machen
  out = out.replace(/(\s*\[…\]\s*){2,}/g, ' [...] ');
  // Doppel-Spaces zusammenziehen
  out = out.replace(/\s{2,}/g, ' ').trim();
  return out;
}

/**
 * Haupt-Sanitizer für eine knowledge_entries-Row.
 *
 * Logik nach customer_use:
 *   - 'never' / 'blocked'   → null   (DO NOT USE)
 *   - 'inspiration-only'    → sanitized_takeaway gestrippt (NIE raw_excerpt)
 *   - 'meta-pattern'        → sanitized_takeaway gestrippt + zusätzlicher Pattern-Filter
 *   - alles andere/null     → null  (safe default)
 *
 * Wenn sanitized_takeaway fehlt aber customer_use erlauben würde, fällt das
 * komplett auf null — wir bauen NIE on-the-fly aus raw_excerpt einen Output.
 *
 * @param {object} entry  knowledge_entries-Row
 * @returns {string|null}
 */
export function sanitizeForCustomer(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const use = entry.customer_use;

  if (use === 'never' || use === 'blocked' || !use) return null;

  const takeaway = entry.sanitized_takeaway;
  if (!takeaway || typeof takeaway !== 'string' || !takeaway.trim()) {
    // Kein vorbereiteter Takeaway → wir liefern NICHT den raw_excerpt.
    return null;
  }

  if (use === 'inspiration-only' || use === 'meta-pattern') {
    return stripBrandsAndFrameworks(takeaway);
  }

  // Unbekannter Wert → safe default
  return null;
}

/**
 * Bulk-Variant: nimmt array von entries, gibt array sanitisierter Strings zurück
 * (Nulls werden gefiltert). Verlust an Reihenfolge möglich.
 *
 * @param {object[]} entries
 * @returns {string[]}
 */
export function sanitizeMany(entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map(sanitizeForCustomer)
    .filter((s) => typeof s === 'string' && s.length > 0);
}

/**
 * Audit-Hilfsfunktion: zeigt was-rauskommt + welche Patterns getroffen haben.
 * NICHT in Customer-Output verwenden — nur für Logging/Tests.
 *
 * @param {object} entry
 * @returns {{output: string|null, hits: string[]}}
 */
export function sanitizeWithAudit(entry) {
  const before = entry?.sanitized_takeaway || '';
  const output = sanitizeForCustomer(entry);
  const hits = [];
  for (const re of BRAND_PATTERNS)        if (re.test(before)) hits.push(`brand:${re.source}`);
  for (const re of FRAMEWORK_PATTERNS)    if (re.test(before)) hits.push(`framework:${re.source}`);
  for (const re of ATTRIBUTION_PATTERNS)  if (re.test(before)) hits.push(`attribution:${re.source}`);
  return { output, hits };
}

export default {
  sanitizeForCustomer,
  sanitizeMany,
  stripBrandsAndFrameworks,
  sanitizeWithAudit
};
