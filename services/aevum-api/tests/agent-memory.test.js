// Unit tests for lib/agent-memory.js (parseMemoryUpdates only — file IO not exercised)
import { describe, it, expect } from 'vitest';
import { parseMemoryUpdates } from '../lib/agent-memory.js';

describe('parseMemoryUpdates', () => {
  it('extracts a single memory-update marker', () => {
    const text = `Hier ist die Antwort.

<aevum-memory-update slug="customer-pref" type="user" summary="Mag direkte Kommunikation">
Carlos bevorzugt brutal direkte Antworten ohne Hedging.
</aevum-memory-update>

Ende.`;
    const { cleanText, updates } = parseMemoryUpdates(text);
    expect(updates).toHaveLength(1);
    expect(updates[0].slug).toBe('customer-pref');
    expect(updates[0].type).toBe('user');
    expect(updates[0].summary).toBe('Mag direkte Kommunikation');
    expect(updates[0].body).toContain('brutal direkte');
    expect(cleanText).not.toContain('aevum-memory-update');
  });

  it('returns empty for text without markers', () => {
    const { cleanText, updates } = parseMemoryUpdates('Normal answer.');
    expect(updates).toEqual([]);
    expect(cleanText).toBe('Normal answer.');
  });

  it('handles multiple markers', () => {
    const text = `<aevum-memory-update slug="a" type="user" summary="first">body1</aevum-memory-update>
<aevum-memory-update slug="b" type="project" summary="second">body2</aevum-memory-update>`;
    const { updates } = parseMemoryUpdates(text);
    expect(updates).toHaveLength(2);
  });

  it('rejects invalid slugs / types', () => {
    const text = `<aevum-memory-update slug="" type="bogus" summary="x">body</aevum-memory-update>`;
    const { updates } = parseMemoryUpdates(text);
    expect(updates).toHaveLength(0);
  });

  it('handles non-string input safely', () => {
    expect(parseMemoryUpdates(null).updates).toEqual([]);
    expect(parseMemoryUpdates(undefined).updates).toEqual([]);
  });
});
