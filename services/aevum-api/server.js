// Load env per convention: _shared.env first, then project-specific aevum.env
// override: true on BOTH because shell env or pm2 dump may have leftovers from other projects
import dotenv from 'dotenv';
dotenv.config({ path: '/home/carlos/.envs/_shared.env', override: true });
dotenv.config({ path: '/home/carlos/.envs/aevum.env', override: true });

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { auditRouter } from './routes/audit.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3210', 10);

// Behind cloudflared+CF tunnel — trust the proxy chain so real IPs work via CF-Connecting-IP
app.set('trust proxy', true);

// CORS — allow aevum-system.de + localhost dev
const ALLOWED_ORIGINS = [
  'https://aevum-system.de',
  'https://www.aevum-system.de',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, cb) => {
    // allow no-origin (curl, server-to-server)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('CORS: origin not allowed'));
  },
  credentials: false
}));

// Stripe webhook needs the RAW body to verify the signature.
// Mount it before express.json() so the raw bytes survive.
import { checkoutRouter } from './routes/checkout.js';
app.post(
  '/api/checkout/webhook',
  express.raw({ type: 'application/json', limit: '1mb' }),
  (req, res, next) => {
    // Re-route into the router which expects POST /webhook
    req.url = '/webhook';
    return checkoutRouter.handle(req, res, next);
  }
);

app.use(express.json({ limit: '256kb' }));

// Real client IP comes from Cloudflare via CF-Connecting-IP header
function clientIp(req) {
  return req.headers['cf-connecting-ip']
    || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.ip
    || 'unknown';
}

// Basic request log
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path} ip=${clientIp(req)}`);
  next();
});

// Rate-Limits
// Global: 60 requests / minute / IP — generous catch-all
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIp,
  message: { ok: false, error: 'rate_limit_global' }
});
app.use(globalLimiter);

// Strict: 3 audit-submits / hour / IP — anti-spam for the WGM form
const auditSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIp,
  message: {
    ok: false,
    error: 'rate_limit_audit',
    hint: 'Maximal 3 Anfragen pro Stunde. Bitte direkt per WhatsApp oder Email kontaktieren.'
  },
  // Only limit POST /submit — not /export, /erase, /withdraw-consent, /
  skip: (req) => req.method !== 'POST' || req.path !== '/submit'
});

// DSGVO self-service limiter — 5 requests / 10 min / IP for export/erase/withdraw
const dsgvoLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIp,
  message: {
    ok: false,
    error: 'rate_limit_dsgvo',
    hint: 'Maximal 5 DSGVO-Anfragen pro 10 Minuten. Bei dringendem Anliegen: dsgvo@aevum-system.de'
  },
  skip: (req) => {
    if (req.method !== 'POST') return true;
    const p = req.path;
    return !(p === '/export' || p === '/erase' || p === '/withdraw-consent');
  }
});

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'aevum-api', uptime: process.uptime() });
});
app.use('/api/audit', auditSubmitLimiter, dsgvoLimiter, auditRouter);

// Checkout — create-session + pilot-status. Webhook is mounted above
// with raw-body parser before express.json().
app.use('/api/checkout', checkoutRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'not_found', path: req.path });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('ERR:', err);
  res.status(500).json({ ok: false, error: 'server_error' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`aevum-api listening on 127.0.0.1:${PORT}`);
});
