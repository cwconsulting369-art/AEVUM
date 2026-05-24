// AEVUM SaaS Waitlist endpoint — Wave B4 (Helpbot 3-Varianten Routing)
// Created: 2026-05-24
//
// POST /api/waitlist/saas   { tool, email, context? }
//   Tools: script-factory | dsgvo-factory | lead-factory
//   Captures interest for Pfad C (Self-Service SaaS gegen Credits, in Aufbau).

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { scanPayload } from '../lib/security.js';

export const waitlistRouter = Router();

const WaitlistSchema = z.object({
  tool: z.enum(['script-factory', 'dsgvo-factory', 'lead-factory']),
  email: z.string().email().max(254).transform(s => s.toLowerCase()),
  context: z.string().max(500).optional()
});

waitlistRouter.post('/saas', async (req, res) => {
  const parsed = WaitlistSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_input', details: parsed.error.flatten() });
  }

  // Defensive scan on free-text context only (email already strict-validated by Zod)
  if (parsed.data.context) {
    const hits = scanPayload({ ctx: parsed.data.context });
    if (hits.length > 0) {
      return res.status(400).json({ ok: false, error: 'invalid_input' });
    }
  }

  const row = {
    tool: parsed.data.tool,
    email: parsed.data.email,
    context: parsed.data.context || null,
    ts: new Date().toISOString()
  };

  const result = await supabase.insert('saas_waitlist', row);

  if (!result.ok) {
    // Duplicate (UNIQUE(tool,email)) → still treat as success for UX (idempotent)
    const errMsg = JSON.stringify(result.error || {}).toLowerCase();
    if (errMsg.includes('duplicate') || errMsg.includes('unique') || result.status === 409) {
      return res.json({ ok: true, message: 'Bereits eingetragen. Du bekommst Bescheid sobald verfügbar.', duplicate: true });
    }
    console.error('[waitlist] insert failed:', result.error);
    return res.status(500).json({ ok: false, error: 'persist_failed' });
  }

  return res.json({ ok: true, message: 'Eingetragen. Du bekommst Bescheid sobald verfügbar.' });
});

waitlistRouter.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'waitlist' });
});
