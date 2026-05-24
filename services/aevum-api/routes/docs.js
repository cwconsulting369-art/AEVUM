// AEVUM Customer Document-Exchange — Filesystem-backed MD-Exchange
// Created: 2026-05-24 — Wave A3
//
// Mounted at /api/me/projects/:slug/docs (JWT-gated via meRouter)
//
// File content lives in /home/carlos/restructure-workspace/aevum-phase/AEVUM/customers/<slug>/docs/{inbox,outbox,shared}/
// Metadata + Audit-Log persisted in DB (table: customer_documents).
//
// GET    /                            — list all docs (inbox+outbox+shared)
// GET    /:folder/:filename           — read content
// POST   /upload                      — customer uploads to inbox/ (multipart)
// POST   /:folder/:filename           — customer creates/edits in shared/ (JSON body)
// DELETE /:folder/:filename           — customer deletes (only inbox/ + shared/)
//
// Security: path-traversal block, folder allowlist, filename regex, JWT account scoping.

import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { supabase } from '../lib/supabase.js';

export const docsRouter = Router({ mergeParams: true });

// ── Constants ──────────────────────────────────────────────
const DOCS_ROOT = '/home/carlos/restructure-workspace/aevum-phase/AEVUM/customers';
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FOLDERS = ['inbox', 'outbox', 'shared'];
const FILENAME_RX = /^[a-zA-Z0-9_.-]+\.md$/;

// ── Helpers ────────────────────────────────────────────────
function resolveSafe(slug, folder, filename) {
  if (!FILENAME_RX.test(filename)) throw new Error('invalid_filename');
  if (!ALLOWED_FOLDERS.includes(folder)) throw new Error('invalid_folder');
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('invalid_slug');
  const target = path.join(DOCS_ROOT, slug, 'docs', folder, filename);
  const base = path.join(DOCS_ROOT, slug, 'docs', folder);
  // path-traversal defence-in-depth
  if (!target.startsWith(base + path.sep) && target !== base) throw new Error('path_traversal');
  return target;
}

function folderDir(slug, folder) {
  if (!ALLOWED_FOLDERS.includes(folder)) throw new Error('invalid_folder');
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('invalid_slug');
  return path.join(DOCS_ROOT, slug, 'docs', folder);
}

async function ensureDirs(slug) {
  for (const f of ALLOWED_FOLDERS) {
    await fs.mkdir(folderDir(slug, f), { recursive: true });
  }
}

async function resolveProjectForCustomer(accountId, slug) {
  const r = await supabase.select(
    'projects',
    `select=id&account_id=eq.${accountId}&slug=eq.${encodeURIComponent(slug)}`
  );
  return r.data?.[0] ?? null;
}

// Customer-slug must match JWT account-slug → request path slug is the project,
// but doc-exchange is account-scoped. We use the JWT account_slug for the FS path.
function accountSlug(req) {
  return req.customer?.account_slug;
}

async function audit({ account_id, project_id, filename, folder, size_bytes, action, role = 'customer' }) {
  try {
    await supabase.insert('customer_documents', {
      account_id,
      project_id: project_id ?? null,
      filename,
      folder,
      size_bytes: size_bytes ?? null,
      created_by_role: role,
      action,
    });
  } catch (e) {
    console.error('[docs] audit insert failed:', e?.message);
  }
}

function mapErr(e) {
  const msg = e?.message || 'error';
  if (['invalid_filename', 'invalid_folder', 'invalid_slug', 'path_traversal'].includes(msg)) {
    return { status: 400, error: msg };
  }
  if (e?.code === 'ENOENT') return { status: 404, error: 'not_found' };
  return { status: 500, error: 'internal_error', message: msg };
}

// ── Multer upload middleware ───────────────────────────────
const uploadMw = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!FILENAME_RX.test(file.originalname || '')) {
      return cb(new Error('invalid_filename'));
    }
    cb(null, true);
  },
});

// ── GET / — list all docs ──────────────────────────────────
docsRouter.get('/', async (req, res) => {
  try {
    const slug = accountSlug(req);
    if (!slug) return res.status(401).json({ ok: false, error: 'no_account_slug' });
    await ensureDirs(slug);

    const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
    // Note: per-project listing not yet enforced — docs are account-scoped on FS.

    const out = { inbox: [], outbox: [], shared: [] };
    for (const folder of ALLOWED_FOLDERS) {
      try {
        const dir = folderDir(slug, folder);
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const ent of entries) {
          if (!ent.isFile()) continue;
          if (!FILENAME_RX.test(ent.name)) continue;
          const fp = path.join(dir, ent.name);
          const st = await fs.stat(fp);
          out[folder].push({
            filename: ent.name,
            folder,
            size_bytes: st.size,
            modified_at: st.mtime.toISOString(),
          });
        }
        out[folder].sort((a, b) => b.modified_at.localeCompare(a.modified_at));
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
    }
    void project;
    res.json({ ok: true, docs: out });
  } catch (e) {
    const m = mapErr(e);
    res.status(m.status).json({ ok: false, error: m.error, message: m.message });
  }
});

// ── GET /:folder/:filename — read content ──────────────────
docsRouter.get('/:folder/:filename', async (req, res) => {
  try {
    const slug = accountSlug(req);
    if (!slug) return res.status(401).json({ ok: false, error: 'no_account_slug' });
    const { folder, filename } = req.params;
    const target = resolveSafe(slug, folder, filename);
    const content = await fs.readFile(target, 'utf8');
    const st = await fs.stat(target);

    const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
    await audit({
      account_id: req.customer.account_id,
      project_id: project?.id,
      filename,
      folder,
      size_bytes: st.size,
      action: 'read',
    });

    res.json({
      ok: true,
      filename,
      folder,
      size_bytes: st.size,
      modified_at: st.mtime.toISOString(),
      content,
    });
  } catch (e) {
    const m = mapErr(e);
    res.status(m.status).json({ ok: false, error: m.error, message: m.message });
  }
});

// ── POST /upload — multipart upload to inbox/ ──────────────
docsRouter.post('/upload', uploadMw.single('file'), async (req, res) => {
  try {
    const slug = accountSlug(req);
    if (!slug) return res.status(401).json({ ok: false, error: 'no_account_slug' });
    if (!req.file) return res.status(400).json({ ok: false, error: 'no_file' });

    const filename = req.file.originalname;

    // Wave H4 — Content-safety check: filename must be .md (FILENAME_RX) AND
    // content must be text-only (no executable magic-bytes). Block PDF/ZIP/PE/ELF
    // payloads renamed to .md.
    const buf = req.file.buffer;
    if (buf && buf.length >= 4) {
      const b0 = buf[0], b1 = buf[1], b2 = buf[2], b3 = buf[3];
      const isPdf  = b0 === 0x25 && b1 === 0x50 && b2 === 0x44 && b3 === 0x46;
      const isZip  = b0 === 0x50 && b1 === 0x4B && (b2 === 0x03 || b2 === 0x05);
      const isPe   = b0 === 0x4D && b1 === 0x5A;                            // MZ / Windows EXE
      const isElf  = b0 === 0x7F && b1 === 0x45 && b2 === 0x4C && b3 === 0x46; // ELF
      const isOle  = b0 === 0xD0 && b1 === 0xCF && b2 === 0x11 && b3 === 0xE0;
      const isJpg  = b0 === 0xFF && b1 === 0xD8 && b2 === 0xFF;
      const isPng  = b0 === 0x89 && b1 === 0x50 && b2 === 0x4E && b3 === 0x47;
      if (isPdf || isZip || isPe || isElf || isOle || isJpg || isPng) {
        return res.status(415).json({ ok: false, error: 'binary_content_not_allowed', hint: 'Nur Markdown-Text-Dateien erlaubt.' });
      }
      // Loose text-check on first 512 bytes — any non-printable + non-utf8 sequence rejects
      const sample = buf.slice(0, Math.min(512, buf.length));
      let printable = 0;
      for (const byte of sample) {
        if (byte === 0x09 || byte === 0x0A || byte === 0x0D || (byte >= 0x20 && byte <= 0x7E) || byte >= 0xC0) {
          printable++;
        }
      }
      if (printable / sample.length < 0.85) {
        return res.status(415).json({ ok: false, error: 'non_text_content', hint: 'Datei scheint binär zu sein.' });
      }
    }

    const target = resolveSafe(slug, 'inbox', filename);
    await ensureDirs(slug);
    await fs.writeFile(target, req.file.buffer);

    const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
    await audit({
      account_id: req.customer.account_id,
      project_id: project?.id,
      filename,
      folder: 'inbox',
      size_bytes: req.file.size,
      action: 'created',
    });

    res.status(201).json({
      ok: true,
      filename,
      folder: 'inbox',
      size_bytes: req.file.size,
    });
  } catch (e) {
    const m = mapErr(e);
    res.status(m.status).json({ ok: false, error: m.error, message: m.message });
  }
});

// ── POST /:folder/:filename — create/edit in shared/ ──────
docsRouter.post('/:folder/:filename', async (req, res) => {
  try {
    const slug = accountSlug(req);
    if (!slug) return res.status(401).json({ ok: false, error: 'no_account_slug' });
    const { folder, filename } = req.params;
    if (folder !== 'shared' && folder !== 'inbox') {
      return res.status(403).json({ ok: false, error: 'forbidden_folder', message: 'customers can only write to shared/ or inbox/' });
    }
    const content = req.body?.content;
    if (typeof content !== 'string') return res.status(400).json({ ok: false, error: 'missing_content' });
    const byteLen = Buffer.byteLength(content, 'utf8');
    if (byteLen > MAX_FILE_BYTES) return res.status(413).json({ ok: false, error: 'too_large', limit: MAX_FILE_BYTES });

    const target = resolveSafe(slug, folder, filename);
    await ensureDirs(slug);

    let action = 'created';
    try {
      await fs.access(target);
      action = 'edited';
    } catch { /* not exists → created */ }

    await fs.writeFile(target, content, 'utf8');

    const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
    await audit({
      account_id: req.customer.account_id,
      project_id: project?.id,
      filename,
      folder,
      size_bytes: byteLen,
      action,
    });

    res.json({ ok: true, filename, folder, size_bytes: byteLen, action });
  } catch (e) {
    const m = mapErr(e);
    res.status(m.status).json({ ok: false, error: m.error, message: m.message });
  }
});

// ── DELETE /:folder/:filename — only inbox/ + shared/ ─────
docsRouter.delete('/:folder/:filename', async (req, res) => {
  try {
    const slug = accountSlug(req);
    if (!slug) return res.status(401).json({ ok: false, error: 'no_account_slug' });
    const { folder, filename } = req.params;
    if (folder !== 'shared' && folder !== 'inbox') {
      return res.status(403).json({ ok: false, error: 'forbidden_folder', message: 'customers can only delete in shared/ or inbox/' });
    }
    const target = resolveSafe(slug, folder, filename);
    let size = 0;
    try {
      const st = await fs.stat(target);
      size = st.size;
    } catch (e) {
      if (e.code === 'ENOENT') return res.status(404).json({ ok: false, error: 'not_found' });
      throw e;
    }
    await fs.unlink(target);

    const project = await resolveProjectForCustomer(req.customer.account_id, req.params.slug);
    await audit({
      account_id: req.customer.account_id,
      project_id: project?.id,
      filename,
      folder,
      size_bytes: size,
      action: 'deleted',
    });

    res.json({ ok: true, filename, folder });
  } catch (e) {
    const m = mapErr(e);
    res.status(m.status).json({ ok: false, error: m.error, message: m.message });
  }
});

// Multer-specific error handler (mounted after routes)
docsRouter.use((err, _req, res, _next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ ok: false, error: 'too_large', limit: MAX_FILE_BYTES });
  }
  if (err?.message === 'invalid_filename') {
    return res.status(400).json({ ok: false, error: 'invalid_filename' });
  }
  console.error('[docs] err:', err?.message);
  res.status(500).json({ ok: false, error: 'internal_error' });
});
