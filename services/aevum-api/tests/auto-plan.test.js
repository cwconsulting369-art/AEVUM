// Unit tests for lib/auto-plan.js — edge-case helpers (D1)
import { describe, it, expect } from 'vitest';
import {
  truncateAnswers,
  extractJson,
  validateLlmResult,
  stubAnalysis,
  MAX_ANSWERS_BYTES
} from '../lib/auto-plan.js';

describe('truncateAnswers', () => {
  it('passes small answers through untouched', () => {
    const a = { foo: 'bar', n: 42 };
    const r = truncateAnswers(a);
    expect(r.truncated).toBe(false);
    expect(r.answers).toEqual(a);
  });

  it('truncates when answers exceed MAX_ANSWERS_BYTES', () => {
    const big = 'x'.repeat(MAX_ANSWERS_BYTES + 1000);
    const r = truncateAnswers({ pain: big });
    expect(r.truncated).toBe(true);
    expect(r.originalBytes).toBeGreaterThan(MAX_ANSWERS_BYTES);
    expect(JSON.stringify(r.answers).length).toBeLessThanOrEqual(MAX_ANSWERS_BYTES + 200);
  });

  it('handles null/undefined safely', () => {
    expect(truncateAnswers(null).truncated).toBe(false);
    expect(truncateAnswers(undefined).truncated).toBe(false);
  });
});

describe('extractJson', () => {
  it('extracts plain JSON object', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('extracts JSON from inside markdown fence', () => {
    const text = 'Hier ist:\n```json\n{"complexity_score": 5}\n```\n';
    expect(extractJson(text)).toEqual({ complexity_score: 5 });
  });

  it('extracts JSON with leading prose', () => {
    expect(extractJson('Klar, hier:{"x":2}')).toEqual({ x: 2 });
  });

  it('returns null for non-parseable text', () => {
    expect(extractJson('totally not json')).toBeNull();
    expect(extractJson('{broken json')).toBeNull();
  });

  it('returns null on non-string input', () => {
    expect(extractJson(null)).toBeNull();
    expect(extractJson(42)).toBeNull();
  });
});

describe('validateLlmResult', () => {
  it('accepts a well-formed result', () => {
    const r = validateLlmResult({
      complexity_score: 5,
      identified_pain_points: [{ category: 'workflow', description: 'x', severity: 'medium' }],
      recommended_blueprints: []
    });
    expect(r.ok).toBe(true);
  });

  it('rejects when missing required fields', () => {
    expect(validateLlmResult({ complexity_score: 5 }).ok).toBe(false);
  });

  it('rejects complexity out of range', () => {
    expect(validateLlmResult({
      complexity_score: 15,
      identified_pain_points: [],
      recommended_blueprints: []
    }).ok).toBe(false);
  });

  it('rejects non-array pain_points', () => {
    expect(validateLlmResult({
      complexity_score: 5,
      identified_pain_points: 'not array',
      recommended_blueprints: []
    }).ok).toBe(false);
  });

  it('rejects null/non-object', () => {
    expect(validateLlmResult(null).ok).toBe(false);
    expect(validateLlmResult('string').ok).toBe(false);
  });
});

describe('stubAnalysis', () => {
  it('returns valid schema even with empty answers', () => {
    const r = stubAnalysis({});
    expect(r._stub).toBe(true);
    expect(r.complexity_score).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(r.identified_pain_points)).toBe(true);
    expect(Array.isArray(r.recommended_blueprints)).toBe(true);
    expect(validateLlmResult(r).ok).toBe(true);
  });

  it('handles null answers gracefully', () => {
    const r = stubAnalysis(null);
    expect(r._stub).toBe(true);
    expect(r.complexity_score).toBeGreaterThanOrEqual(1);
  });

  it('selects lead-scraper blueprint when pain mentions akquise', () => {
    const r = stubAnalysis({ pain: 'lead akquise dauert ewig' });
    const ids = r.recommended_blueprints.map((b) => b.blueprint_id);
    expect(ids).toContain('lead-scraper-v1');
  });

  it('escalates complexity for large team', () => {
    const r = stubAnalysis({ unternehmen: { team_size: 25 } });
    expect(r.complexity_score).toBeGreaterThanOrEqual(7);
  });
});
