// Tests for lib/helpbot-knowledge.js
// Created: 2026-05-25 (Block B4 polish — verify lazy knowledge snippet works)

import { describe, it, expect } from 'vitest';
import {
  FAQS,
  CONFUSED_TOPICS,
  EDGE_CASE_REPLIES,
  getRelatedFaq,
  detectConfusion,
  detectEdgeCase,
  buildKnowledgeSnippet,
} from '../lib/helpbot-knowledge.js';

describe('helpbot-knowledge constants', () => {
  it('FAQS is a non-empty array of shape {q,a,tags}', () => {
    expect(Array.isArray(FAQS)).toBe(true);
    expect(FAQS.length).toBeGreaterThan(0);
    for (const f of FAQS) {
      expect(typeof f.q).toBe('string');
      expect(typeof f.a).toBe('string');
      expect(Array.isArray(f.tags)).toBe(true);
    }
  });
  it('CONFUSED_TOPICS is array of {pair,clarification}', () => {
    expect(Array.isArray(CONFUSED_TOPICS)).toBe(true);
    expect(CONFUSED_TOPICS.length).toBeGreaterThan(0);
    for (const c of CONFUSED_TOPICS) {
      expect(Array.isArray(c.pair)).toBe(true);
      expect(c.pair.length).toBe(2);
      expect(typeof c.clarification).toBe('string');
    }
  });
  it('EDGE_CASE_REPLIES has expected keys', () => {
    expect(EDGE_CASE_REPLIES).toHaveProperty('legal_advice');
    expect(EDGE_CASE_REPLIES).toHaveProperty('steuerberatung');
  });
});

describe('getRelatedFaq', () => {
  it('returns related faqs for a blueprint question', () => {
    const r = getRelatedFaq('Was kostet ein Blueprint genau?', 3);
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].tags).toContain('blueprint');
  });
  it('returns empty for empty / irrelevant input', () => {
    expect(getRelatedFaq('', 3)).toEqual([]);
    expect(getRelatedFaq('xyz qqq', 3)).toEqual([]);
  });
});

describe('detectConfusion', () => {
  it('hits when blueprint + saas-tool mentioned together', () => {
    const r = detectConfusion('Ist das ein blueprint oder ein saas-tool?');
    expect(r).not.toBeNull();
    expect(r.pair).toEqual(['blueprint', 'saas-tool']);
  });
  it('returns null for single topic', () => {
    expect(detectConfusion('Was kostet ein blueprint?')).toBeNull();
  });
});

describe('detectEdgeCase', () => {
  it('detects legal_advice', () => {
    expect(detectEdgeCase('Brauche ich einen Anwalt fuer DSGVO?')).toBe('legal_advice');
  });
  it('detects steuerberatung', () => {
    expect(detectEdgeCase('Macht ihr auch Buchhaltung?')).toBe('steuerberatung');
  });
  it('returns null otherwise', () => {
    expect(detectEdgeCase('Was kostet ein Blueprint?')).toBeNull();
  });
});

describe('buildKnowledgeSnippet (the actual helpbot integration point)', () => {
  it('returns non-empty string when ambiguous "blueprint vs saas-tool" question comes in', () => {
    const snippet = buildKnowledgeSnippet(
      'Ist ein blueprint dasselbe wie ein saas-tool oder verschieden?'
    );
    expect(snippet).toContain('KLARSTELLUNG');
    expect(snippet).toContain('blueprint vs saas-tool');
  });

  it('returns FAQ snippet when blueprint pricing asked', () => {
    const snippet = buildKnowledgeSnippet('Was kostet ein Blueprint?');
    expect(snippet).toContain('RELATED FAQ');
    expect(snippet).toContain('Blueprint');
  });

  it('returns edge-case snippet for legal questions', () => {
    const snippet = buildKnowledgeSnippet('Macht ihr auch Rechtsberatung?');
    expect(snippet).toContain('EDGE-CASE-HINWEIS');
    expect(snippet).toContain('legal_advice');
  });

  it('returns empty string for fully off-topic input', () => {
    const snippet = buildKnowledgeSnippet('xyzxyz qqq nonsense');
    expect(snippet).toBe('');
  });

  it('does not throw on null/undefined input', () => {
    expect(() => buildKnowledgeSnippet(null)).not.toThrow();
    expect(() => buildKnowledgeSnippet(undefined)).not.toThrow();
    expect(() => buildKnowledgeSnippet('')).not.toThrow();
  });
});
