// AEVUM Project-Agent Memory — file-based, Lennox-style
// Created: 2026-05-22
//
// Layout:
//   <ROOT>/<account_slug>/<project_slug>/
//     ├─ MEMORY.md           (one-liner index)
//     ├─ user_<slug>.md
//     ├─ project_<slug>.md
//     ├─ feedback_<slug>.md
//     └─ reference_<slug>.md
//
// All file ops are sandboxed: account_slug + project_slug are validated against
// /^[a-z0-9_-]+$/ before touching the filesystem. No traversal possible.
//
// Memory-Update protocol (Agent emits during streaming):
//   <aevum-memory-update slug="..." type="user|project|feedback|reference">
//   ...optional one-line summary then body...
//   </aevum-memory-update>
// Backend parses these out, writes the file, updates MEMORY.md index, and returns
// a list of saved slugs so the frontend can toast.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.env.AEVUM_AGENT_MEMORY_DIR
  || path.resolve(process.cwd(), 'data', 'agent-memory');

const SLUG_RE = /^[a-z0-9_-]+$/;
const TYPE_RE = /^(user|project|feedback|reference)$/;
const ALLOWED_TYPES = ['user', 'project', 'feedback', 'reference'];

const MAX_FILE_BYTES = 32 * 1024;          // 32 KB per memory file
const MAX_INDEX_LINES = 200;               // cap MEMORY.md index entries
const MAX_BODY_CHARS = 8000;               // safety cap on a single memory body
const MAX_SUMMARY_CHARS = 200;             // one-liner

function safeSlug(s) {
  return typeof s === 'string' && s.length >= 1 && s.length <= 64 && SLUG_RE.test(s);
}

function safeType(t) {
  return typeof t === 'string' && TYPE_RE.test(t);
}

function projectDir(accountSlug, projectSlug) {
  if (!safeSlug(accountSlug) || !safeSlug(projectSlug)) {
    throw new Error('agent-memory: invalid account or project slug');
  }
  return path.join(ROOT, accountSlug, projectSlug);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
}

async function safeRead(file) {
  try {
    const buf = await fs.readFile(file, 'utf8');
    return buf;
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

function memoryFileName(type, slug) {
  return `${type}_${slug}.md`;
}

// ─── List all memory files for a project ────────────────────
export async function listMemoryFiles(accountSlug, projectSlug) {
  const dir = projectDir(accountSlug, projectSlug);
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter(e => e.isFile() && e.name.endsWith('.md') && e.name !== 'MEMORY.md')
      .map(e => e.name)
      .sort();
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

// ─── Read MEMORY.md index (returns string or '') ────────────
export async function readIndex(accountSlug, projectSlug) {
  const dir = projectDir(accountSlug, projectSlug);
  const content = await safeRead(path.join(dir, 'MEMORY.md'));
  return content || '';
}

// ─── Read a specific memory file ────────────────────────────
export async function readMemoryFile(accountSlug, projectSlug, type, slug) {
  if (!safeType(type) || !safeSlug(slug)) {
    return null;
  }
  const dir = projectDir(accountSlug, projectSlug);
  return safeRead(path.join(dir, memoryFileName(type, slug)));
}

// ─── Read all memory bodies (used to build system-prompt) ───
export async function readAllMemories(accountSlug, projectSlug, { maxFiles = 40 } = {}) {
  const dir = projectDir(accountSlug, projectSlug);
  const files = await listMemoryFiles(accountSlug, projectSlug);
  const out = [];
  for (const name of files.slice(0, maxFiles)) {
    const content = await safeRead(path.join(dir, name));
    if (content) out.push({ name, content });
  }
  return out;
}

// ─── Write/replace a memory file ────────────────────────────
// Returns { ok, slug, type, summary, written }
export async function writeMemory(accountSlug, projectSlug, { type, slug, summary, body }) {
  if (!safeType(type)) return { ok: false, error: 'invalid_type' };
  if (!safeSlug(slug)) return { ok: false, error: 'invalid_slug' };
  if (typeof body !== 'string' || body.length === 0) return { ok: false, error: 'empty_body' };

  const dir = projectDir(accountSlug, projectSlug);
  await ensureDir(dir);

  const safeBody = body.slice(0, MAX_BODY_CHARS);
  const safeSummary = (summary || safeBody.split('\n').find(l => l.trim()) || slug).slice(0, MAX_SUMMARY_CHARS).trim();
  const now = new Date().toISOString();

  const front =
`---
type: ${type}
slug: ${slug}
created: ${now}
updated: ${now}
---

# ${safeSummary}

${safeBody}
`;

  if (Buffer.byteLength(front, 'utf8') > MAX_FILE_BYTES) {
    return { ok: false, error: 'too_large' };
  }

  const fileName = memoryFileName(type, slug);
  const target = path.join(dir, fileName);

  // Preserve original created timestamp if file already exists
  const existing = await safeRead(target);
  let finalContent = front;
  if (existing) {
    const createdMatch = existing.match(/^created:\s*(\S+)/m);
    if (createdMatch) {
      finalContent = front.replace(/created:\s*\S+/, `created: ${createdMatch[1]}`);
    }
  }

  await fs.writeFile(target, finalContent, { mode: 0o600 });
  await rebuildIndex(accountSlug, projectSlug);

  return { ok: true, slug, type, summary: safeSummary, written: fileName };
}

// ─── Delete a memory file ───────────────────────────────────
export async function deleteMemory(accountSlug, projectSlug, type, slug) {
  if (!safeType(type) || !safeSlug(slug)) return { ok: false, error: 'invalid' };
  const dir = projectDir(accountSlug, projectSlug);
  const target = path.join(dir, memoryFileName(type, slug));
  try {
    await fs.unlink(target);
    await rebuildIndex(accountSlug, projectSlug);
    return { ok: true };
  } catch (err) {
    if (err.code === 'ENOENT') return { ok: true, missing: true };
    return { ok: false, error: err.message };
  }
}

// ─── Erase entire project memory (DSGVO) ────────────────────
export async function eraseProjectMemory(accountSlug, projectSlug) {
  const dir = projectDir(accountSlug, projectSlug);
  try {
    await fs.rm(dir, { recursive: true, force: true });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ─── Rebuild MEMORY.md index from existing files ────────────
async function rebuildIndex(accountSlug, projectSlug) {
  const dir = projectDir(accountSlug, projectSlug);
  const files = await listMemoryFiles(accountSlug, projectSlug);

  const lines = [];
  lines.push('# AEVUM Project-Agent Memory Index');
  lines.push('');
  lines.push(`*Auto-generated. ${new Date().toISOString()}*`);
  lines.push('');

  let entries = 0;
  for (const name of files) {
    if (entries >= MAX_INDEX_LINES) break;
    const content = await safeRead(path.join(dir, name)).catch(() => null);
    if (!content) continue;
    const summary = extractSummary(content) || name.replace(/\.md$/, '');
    lines.push(`- [${name}](./${name}) — ${summary}`);
    entries++;
  }

  if (entries === 0) {
    lines.push('*(no memories yet)*');
  }

  await fs.writeFile(path.join(dir, 'MEMORY.md'), lines.join('\n') + '\n', { mode: 0o600 });
}

function extractSummary(content) {
  // Prefer the first markdown H1, else first non-empty non-frontmatter line.
  const lines = content.split('\n');
  let inFront = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (i === 0 && l.trim() === '---') { inFront = true; continue; }
    if (inFront) {
      if (l.trim() === '---') inFront = false;
      continue;
    }
    if (l.startsWith('# ')) return l.slice(2).trim().slice(0, MAX_SUMMARY_CHARS);
    if (l.trim() && !l.startsWith('#')) return l.trim().slice(0, MAX_SUMMARY_CHARS);
  }
  return '';
}

// ─── Memory-update marker parser ────────────────────────────
// Parses ALL <aevum-memory-update> blocks from an assistant transcript and
// strips them out. Returns { cleanText, updates: [{type, slug, summary, body}] }
const MARKER_RE = /<aevum-memory-update\s+([^>]+)>([\s\S]*?)<\/aevum-memory-update>/gi;

export function parseMemoryUpdates(text) {
  if (typeof text !== 'string' || !text) return { cleanText: text || '', updates: [] };
  const updates = [];

  const cleanText = text.replace(MARKER_RE, (_m, attrs, body) => {
    const attrMap = {};
    const attrRe = /(\w+)\s*=\s*"([^"]*)"/g;
    let am;
    while ((am = attrRe.exec(attrs)) !== null) {
      attrMap[am[1]] = am[2];
    }
    const type = (attrMap.type || '').toLowerCase();
    const slug = (attrMap.slug || '').toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 64);
    const summary = (attrMap.summary || '').slice(0, MAX_SUMMARY_CHARS);
    const cleanBody = body.trim();
    if (TYPE_RE.test(type) && SLUG_RE.test(slug) && cleanBody.length > 0) {
      updates.push({ type, slug, summary, body: cleanBody });
    }
    return ''; // strip the marker from visible text
  });

  return { cleanText: cleanText.trim(), updates };
}

// ─── Apply parsed updates to the filesystem ─────────────────
export async function applyUpdates(accountSlug, projectSlug, updates) {
  if (!Array.isArray(updates) || updates.length === 0) return [];
  const results = [];
  for (const u of updates.slice(0, 5)) { // cap at 5 writes per turn
    try {
      const r = await writeMemory(accountSlug, projectSlug, u);
      results.push(r);
    } catch (err) {
      results.push({ ok: false, error: err.message, slug: u.slug });
    }
  }
  return results;
}

// ─── Build the memory section for a system-prompt ───────────
export async function buildMemoryPromptSection(accountSlug, projectSlug) {
  const memories = await readAllMemories(accountSlug, projectSlug, { maxFiles: 30 });
  if (memories.length === 0) {
    return '\n# AGENT MEMORY (file-based, Lennox-style)\n*(noch keine Erinnerungen gespeichert)*\n';
  }
  const blocks = memories.map(m => `## ${m.name}\n${m.content.trim()}`).join('\n\n');
  return `\n# AGENT MEMORY (file-based, Lennox-style)\n\nDu kennst folgendes über diesen Customer + Project (eigene Erinnerungen, die du angelegt hast):\n\n${blocks}\n`;
}

export const __testing = {
  ROOT,
  safeSlug,
  safeType,
  projectDir,
  extractSummary
};
