// AEVUM Customer Doc-Exchange — Account-level (Block B1)
// Created: 2026-05-25
//
// Mounted at /api/me/docs (JWT-gated via meRouter).
// NOTE: this complements (does NOT replace) the per-project route in routes/docs.js.
// Storage root: /home/carlos/aevum-customers/<account_slug>/docs/{inbox,outbox,shared}/
//
// Endpoints (all gated by requireCustomerAuth from caller chain):
//   GET    /              ?box=inbox|outbox|shared    → list files in box (default: all)
//   GET    /file/:filename ?box=inbox|outbox|shared   → read file content (md/txt) or stream (pdf)
//   POST   /upload        multipart, ?box=inbox       → upload to inbox/
//   DELETE /file/:filename ?box=inbox|shared          → delete (only inbox+shared)
//
// Security: path-traversal block, extension allowlist, JWT account_slug scoping.
// Audit: writes to customer_documents (best-effort).

import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { supabase } from '../lib/supabase.js';

export const customerDocsRouter = Router();

// ─── Constants ─────────────────────────────────────────────
const DOCS_ROOT = process.env.AEVUM_CUSTOMERS_ROOT || '/home/carlos/aevum-customers';
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB (allows small PDFs)
const ALLOWED_BOXES = ['inbox', 'outbox', 'shared'];
const ALLOWED_EXT = new Set(['.md', '.txt', '.pdf']);
const FILENAME_RX = /^[a-zA-Z0-9_.\- ]+\.(md|txt|pdf)$/i;
const SLUG_RX = /^[a-z0-9-]+$/;

// ─── Helpers ───────────────────────────────────────────────
function getSlug(req) {
  return req.customer?.account_slug;
}

function boxParam(req) {
  const b = (req.query.box || '').toString().toLowerCase();
  if (ALLOWED_BOXES.includes(b)) return b;
  return null;
}

function resolveSafe(slug, box, filename) {
  if (!SLUG_RX.test(slug)) throw new Error('invalid_slug');
  if (!ALLOWED_BOXES.includes(box)) throw new Error('invalid_box');
  if (!FILENAME_RX.test(filename)) throw new Error('invalid_filename');
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) throw new Error('invalid_extension');

  const target = path.resolve(DOCS_ROOT, slug, 'docs', box, filename);
  const base = path.resolve(DOCS_ROOT, slug, 'docs', box);
  if (!target.startsWith(base + path.sep) && target !== base) throw new Error('path_traversal');
  return target;
}

function boxDir(slug, box) {
  if (!SLUG_RX.test(slug)) throw new Error('invalid_slug');
  if (!ALLOWED_BOXES.includes(box)) throw new Error('invalid_box');
  return path.join(DOCS_ROOT, slug, 'docs', box);
}

async function ensureBoxes(slug) {
  for (const b of ALLOWED_BOXES) {
    await fs.mkdir(boxDir(slug, b), { recursive: true });
  }
}

async function audit({ account_id, filename, folder, size_bytes, action, role = 'customer' }) {
  try {
    await supabase.insert('customer_documents', {
      account_id,
      project_id: null, // account-level (not project-scoped)
      filename,
      folder,
      size_bytes: size_bytes ?? null,
      created_by_role: role,
      action,
    });
  } catch (e) {
    console.error('[customer-docs] audit failed:', e?.message);
  }
}

function mapErr(e) {
  const msg = e?.message || 'error';
  if ([
    'invalid_filename', 'invalid_box', 'invalid_slug',
    'path_traversal', 'invalid_extension'
  ].includes(msg)) {
    return { status: 400, error: msg };
  }
  if (e?.code === 'ENOENT') return { status: 404, error: 'not_found' };
  return { status: 500, error: 'internal_error', message: msg };
}

// ─── Multer upload middleware ──────────────────────────────
const uploadMw = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!FILENAME_RX.test(file.originalname || '')) {
      return cb(new Error('invalid_filename'));
    }
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) return cb(new Error('invalid_extension'));
    cb(null, true);
  },
});

// ─── GET / — list files (optionally box-filtered) ──────────
customerDocsRouter.get('/', async (req, res) => {
  try {
    const slug = getSlug(req);
    if (!slug) return res.status(401).json({ ok: false, error: 'no_account_slug' });
    if (!SLUG_RX.test(slug)) return res.status(400).json({ ok: false, error: 'invalid_slug' });
    await ensureBoxes(slug);

    const targetBox = boxParam(req);
    const boxes = targetBox ? [targetBox] : ALLOWED_BOXES;

    const out = {};
    for (const box of boxes) {
      out[box] = [];
      try {
        const dir = boxDir(slug, box);
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const ent of entries) {
          if (!ent.isFile() || !FILENAME_RX.test(ent.name)) continue;
          const fp = path.join(dir, ent.name);
          const st = await fs.stat(fp);
          out[box].push({
            filename: ent.name,
            box,
            size_bytes: st.size,
            modified_at: st.mtime.toISOString(),
            ext: path.extname(ent.name).slice(1).toLowerCase(),
          });
        }
        out[box].sort((a, b) => b.modified_at.localeCompare(a.modified_at));
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
    }
    res.json({ ok: true, boxes: out });
  } catch (e) {
    const m = mapErr(e);
    res.status(m.status).json({ ok: false, error: m.error, message: m.message });
  }
});

// ─── GET /file/:filename — read content ────────────────────
customerDocsRouter.get('/file/:filename', async (req, res) => {
  try {
    const slug = getSlug(req);
    if (!slug) return res.status(401).json({ ok: false, error: 'no_account_slug' });
    const box = boxParam(req);
    if (!box) return res.status(400).json({ ok: false, error: 'missing_box' });

    const target = resolveSafe(slug, box, req.params.filename);
    const st = await fs.stat(target);
    const ext = path.extname(req.params.filename).toLowerCase();

    await audit({
      account_id: req.customer.account_id,
      filename: req.params.filename,
      folder: box,
      size_bytes: st.size,
      action: 'read',
    });

    if (ext === '.pdf') {
      // Stream PDF binary
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', st.size);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(req.params.filename)}"`);
      return createReadStream(target).pipe(res);
    }

    const content = await fs.readFile(target, 'utf8');
    res.json({
      ok: true,
      filename: req.params.filename,
      box,
      size_bytes: st.size,
      modified_at: st.mtime.toISOString(),
      ext: ext.slice(1),
      content,
    });
  } catch (e) {
    const m = mapErr(e);
    res.status(m.status).json({ ok: false, error: m.error, message: m.message });
  }
});

// ─── POST /upload — multipart upload to inbox/ (default) ──
customerDocsRouter.post('/upload', uploadMw.single('file'), async (req, res) => {
  try {
    const slug = getSlug(req);
    if (!slug) return res.status(401).json({ ok: false, error: 'no_account_slug' });
    if (!req.file) return res.status(400).json({ ok: false, error: 'no_file' });

    const box = boxParam(req) || 'inbox';
    if (box === 'outbox') {
      return res.status(403).json({ ok: false, error: 'forbidden_box', hint: 'Outbox ist Agent → Du. Lade in Inbox oder Shared.' });
    }

    const filename = req.file.originalname;
    const ext = path.extname(filename).toLowerCase();

    // Content-safety: for .md/.txt enforce plain-text sample; .pdf must have %PDF magic.
    const buf = req.file.buffer;
    if (ext === '.pdf') {
      if (buf.length < 4 || buf[0] !== 0x25 || buf[1] !== 0x50 || buf[2] !== 0x44 || buf[3] !== 0x46) {
        return res.status(415).json({ ok: false, error: 'invalid_pdf_magic' });
      }
    } else {
      // text-check: reject binary masquerading as .md/.txt
      const sample = buf.slice(0, Math.min(512, buf.length));
      let printable = 0;
      for (const byte of sample) {
        if (byte === 0x09 || byte === 0x0A || byte === 0x0D || (byte >= 0x20 && byte <= 0x7E) || byte >= 0xC0) {
          printable++;
        }
      }
      if (sample.length > 0 && printable / sample.length < 0.85) {
        return res.status(415).json({ ok: false, error: 'non_text_content' });
      }
    }

    const target = resolveSafe(slug, box, filename);
    await ensureBoxes(slug);
    await fs.writeFile(target, buf);

    await audit({
      account_id: req.customer.account_id,
      filename,
      folder: box,
      size_bytes: req.file.size,
      action: 'created',
    });

    res.status(201).json({ ok: true, filename, box, size_bytes: req.file.size });
  } catch (e) {
    const m = mapErr(e);
    res.status(m.status).json({ ok: false, error: m.error, message: m.message });
  }
});

// ─── DELETE /file/:filename ────────────────────────────────
customerDocsRouter.delete('/file/:filename', async (req, res) => {
  try {
    const slug = getSlug(req);
    if (!slug) return res.status(401).json({ ok: false, error: 'no_account_slug' });
    const box = boxParam(req);
    if (!box) return res.status(400).json({ ok: false, error: 'missing_box' });
    if (box === 'outbox') {
      return res.status(403).json({ ok: false, error: 'forbidden_box', hint: 'Outbox-Inhalte gehören dem Agent. Inbox/Shared darfst du löschen.' });
    }

    const target = resolveSafe(slug, box, req.params.filename);
    let size = 0;
    try {
      const st = await fs.stat(target);
      size = st.size;
    } catch (e) {
      if (e.code === 'ENOENT') return res.status(404).json({ ok: false, error: 'not_found' });
      throw e;
    }
    await fs.unlink(target);

    await audit({
      account_id: req.customer.account_id,
      filename: req.params.filename,
      folder: box,
      size_bytes: size,
      action: 'deleted',
    });

    res.json({ ok: true, filename: req.params.filename, box });
  } catch (e) {
    const m = mapErr(e);
    res.status(m.status).json({ ok: false, error: m.error, message: m.message });
  }
});

// Multer error-handler
customerDocsRouter.use((err, _req, res, _next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ ok: false, error: 'too_large', limit: MAX_FILE_BYTES });
  }
  if (err?.message === 'invalid_filename') {
    return res.status(400).json({ ok: false, error: 'invalid_filename' });
  }
  if (err?.message === 'invalid_extension') {
    return res.status(400).json({ ok: false, error: 'invalid_extension', allowed: [...ALLOWED_EXT] });
  }
  console.error('[customer-docs] err:', err?.message);
  res.status(500).json({ ok: false, error: 'internal_error' });
});
