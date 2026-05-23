// Rate-Limiter für DSGVO-Endpoints (Art 15/17/20 Challenge-Flow)
// Per IP: max 5 Requests pro 15min — anti-spam + anti-enumeration.

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

function clientIp(req) {
  return req.headers['cf-connecting-ip']
    || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.ip || 'unknown';
}

export const dsgvoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(clientIp(req)),
  message: { ok: false, error: 'rate_limit_dsgvo' }
});
