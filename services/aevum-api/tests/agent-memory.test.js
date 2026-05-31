// Unit tests for lib/agent-memory.js
// Covers: parseMemoryUpdates (parser) + Block-B3 edge-case hardening for
// writeMemory/readMemoryFile/readAllMemories/rebuildMemoryIndex.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Force a writable test ROOT before importing the module (module reads env at load).
const TEST_ROOT = await fs.mkdtemp(path.join(os.tmpdir(), 'aevum-memory-test-'));
process.env.AEVUM_AGENT_MEMORY_DIR = TEST_ROOT;

const {
  parseMemoryUpdates,
  writeMemory,
  readMemoryFile,
  readAllMemories,
  listMemoryFiles,
  readIndex,
  deleteMemory,
  rebuildMemoryIndex,
  applyUpdates,
} = await import('../lib/agent-memory.js');

const ACC = 'test-account';
const PROJ = 'test-project';

afterAll(async () => {
  await fs.rm(TEST_ROOT, { recursive: true, force: true });
});

// ─── parseMemoryUpdates ────────────────────────────────────
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

// ─── B3 edge cases: writeMemory ────────────────────────────
describe('writeMemory edge cases', () => {
  it('writes a basic memory file and rebuilds index', async () => {
    const r = await writeMemory(ACC, PROJ, {
      type: 'user', slug: 'pref-1', summary: 'pref 1', body: 'Carlos likes X.'
    });
    expect(r.ok).toBe(true);
    expect(r.written).toBe('user_pref-1.md');
    const idx = await readIndex(ACC, PROJ);
    expect(idx).toContain('user_pref-1.md');
  });

  it('returns invalid_type for unknown type (no throw)', async () => {
    const r = await writeMemory(ACC, PROJ, { type: 'evil', slug: 'x', body: 'b' });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('invalid_type');
  });

  it('returns invalid_slug for empty/bad slug', async () => {
    const r = await writeMemory(ACC, PROJ, { type: 'user', slug: '', body: 'b' });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('invalid_slug');
  });

  it('returns empty_body for whitespace-only body', async () => {
    const r = await writeMemory(ACC, PROJ, { type: 'user', slug: 'ok', body: '   \n\n  ' });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('empty_body');
  });

  it('returns empty_body for missing body', async () => {
    const r = await writeMemory(ACC, PROJ, { type: 'user', slug: 'ok' });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('empty_body');
  });

  it('truncates oversized body and flags it', async () => {
    const big = 'A'.repeat(10000);
    const r = await writeMemory(ACC, PROJ, { type: 'reference', slug: 'big', body: big });
    expect(r.ok).toBe(true);
    expect(r.truncated).toBe(true);
    expect(r.original_chars).toBe(10000);
  });

  it('rejects invalid account/project slug without throwing', async () => {
    const r = await writeMemory('Bad Slug!', PROJ, { type: 'user', slug: 'x', body: 'b' });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('invalid_account_or_project');
  });

  it('serializes concurrent writes (last-write-wins, no corruption)', async () => {
    const writes = await Promise.all([
      writeMemory(ACC, PROJ, { type: 'user', slug: 'race', body: 'v1' }),
      writeMemory(ACC, PROJ, { type: 'user', slug: 'race', body: 'v2' }),
      writeMemory(ACC, PROJ, { type: 'user', slug: 'race', body: 'v3' }),
    ]);
    expect(writes.every(w => w.ok)).toBe(true);
    const content = await readMemoryFile(ACC, PROJ, 'user', 'race');
    expect(content).toMatch(/v[123]/);
    // Index must not be corrupt (one row per file — link uses filename twice [name](./name))
    const idx = await readIndex(ACC, PROJ);
    const rows = idx.split('\n').filter(l => l.includes('user_race.md'));
    expect(rows.length).toBe(1);
  });
});

// ─── B3 edge cases: read paths ─────────────────────────────
describe('read paths', () => {
  it('readMemoryFile returns null for missing file (no throw)', async () => {
    const r = await readMemoryFile(ACC, PROJ, 'user', 'does-not-exist');
    expect(r).toBeNull();
  });

  it('readMemoryFile returns null for invalid slug (no throw)', async () => {
    const r = await readMemoryFile(ACC, PROJ, 'user', 'BAD SLUG!');
    expect(r).toBeNull();
  });

  it('readMemoryFile returns null for invalid account slug (no throw)', async () => {
    const r = await readMemoryFile('BAD!', PROJ, 'user', 'pref-1');
    expect(r).toBeNull();
  });

  it('listMemoryFiles returns [] for non-existent project', async () => {
    const r = await listMemoryFiles(ACC, 'nope-not-here');
    expect(r).toEqual([]);
  });

  it('listMemoryFiles returns [] for invalid slugs (no throw)', async () => {
    const r = await listMemoryFiles('BAD!', PROJ);
    expect(r).toEqual([]);
  });

  it('readAllMemories skips corrupted files (no frontmatter) but still returns them flagged', async () => {
    // Plant a corrupted file directly
    const dir = path.join(TEST_ROOT, ACC, PROJ);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'user_corrupt.md'), 'no frontmatter here\njust plain text');
    const memories = await readAllMemories(ACC, PROJ);
    const corrupt = memories.find(m => m.name === 'user_corrupt.md');
    expect(corrupt).toBeTruthy();
    expect(corrupt.content).toContain('no frontmatter');
  });
});

// ─── B3 edge cases: rebuildMemoryIndex ──────────────────────
describe('rebuildMemoryIndex', () => {
  it('rebuilds index from files on disk', async () => {
    const r = await rebuildMemoryIndex(ACC, PROJ);
    expect(r.ok).toBe(true);
    const idx = await readIndex(ACC, PROJ);
    expect(idx).toContain('Auto-generated');
  });

  it('rejects invalid slugs gracefully', async () => {
    const r = await rebuildMemoryIndex('BAD!', PROJ);
    expect(r.ok).toBe(false);
    expect(r.error).toBe('invalid_account_or_project');
  });
});

// ─── applyUpdates batching ─────────────────────────────────
describe('applyUpdates', () => {
  it('returns [] for non-array input', async () => {
    const r = await applyUpdates(ACC, PROJ, null);
    expect(r).toEqual([]);
  });

  it('caps at 5 writes per call', async () => {
    const updates = Array.from({ length: 10 }, (_, i) => ({
      type: 'user', slug: `batch-${i}`, body: `body ${i}`
    }));
    const r = await applyUpdates(ACC, PROJ, updates);
    expect(r).toHaveLength(5);
  });
});

// ─── deleteMemory edge cases ───────────────────────────────
describe('deleteMemory', () => {
  it('returns ok+missing for non-existent file (no throw)', async () => {
    const r = await deleteMemory(ACC, PROJ, 'user', 'never-existed');
    expect(r.ok).toBe(true);
    expect(r.missing).toBe(true);
  });

  it('returns invalid for bad inputs', async () => {
    const r = await deleteMemory(ACC, PROJ, 'evil', 'slug');
    expect(r.ok).toBe(false);
    expect(r.error).toBe('invalid');
  });
});
