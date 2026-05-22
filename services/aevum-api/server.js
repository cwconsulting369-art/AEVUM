// Load env per convention: _shared.env first, then project-specific aevum.env
// override: true on BOTH because shell env or pm2 dump may have leftovers from other projects
import dotenv from 'dotenv';
dotenv.config({ path: '/home/carlos/.envs/_shared.env', override: true });
dotenv.config({ path: '/home/carlos/.envs/aevum.env', override: true });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { auditRouter } from './routes/audit.js';
import { accountsRouter } from './routes/accounts.js';
import { projectsRouter } from './routes/projects.js';
import { blueprintsRouter } from './routes/blueprints.js';
import { authRouter } from './routes/auth.js';
import { meRouter } from './routes/me.js';
import { casesRouter } from './routes/cases.js';
import { approvalRouter } from './routes/approval.js';
import { tgWebhookRouter } from './routes/tg-webhook.js';
import { helpbotRouter } from './routes/helpbot.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3210', 10);

// Behind cloudflared+CF tunnel — trust the proxy chain so real IPs work via CF-Connecting-IP
app.set('trust proxy', true);

// Security headers via helmet (audit M2)
// API serves JSON only; frontend on aevum-system.de must be able to call us cross-origin.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://aevum-system.de', 'https://api.stripe.com'],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // API serves JSON, kein iframe-Embed gewünscht
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Frontend on aevum-system.de muss calls machen
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS — allow aevum-system.de + localhost dev
const ALLOWED_ORIGINS = [
  'https://aevum-system.de',
  'https://www.aevum-system.de',
  'https://app.aevum-system.de',
  'http://localhost:3000',
  'http://localhost:5180',
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

// IPv6-safe key generator (express-rate-limit requires ipKeyGenerator helper)
// Falls CF header eine IPv6 ist, normalisiert ipKeyGenerator den /64-Prefix
function clientIpKey(req) {
  const raw = clientIp(req);
  return ipKeyGenerator(raw);
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
  keyGenerator: clientIpKey,
  message: { ok: false, error: 'rate_limit_global' }
});
app.use(globalLimiter);

// Strict: 3 audit-submits / hour / IP — anti-spam for the WGM form
const auditSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
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
  keyGenerator: clientIpKey,
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

// AEVUM v2 — Account/Project/Blueprint layer (admin-token gated)
app.use('/api/accounts', accountsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/blueprints', blueprintsRouter);

// AEVUM v2 — Customer-Portal auth + self-service (Block D)
app.use('/api/auth', authRouter);
app.use('/api/me', meRouter);
app.use('/api/cases', casesRouter);

// Lennox ↔ Carlos async approval channel (admin-token gated)
app.use('/api/approval', approvalRouter);

// Telegram-Bot webhook (secret-token gated, not admin-gated — Telegram can't send custom headers besides secret_token)
app.use('/api/tg-webhook', tgWebhookRouter);

// Helpbot chat widget — Claude Sonnet 4.5 streaming
// Layered rate-limits: 30 msg / hour / IP, 200 msg / day / IP
const helpbotHourLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { ok: false, error: 'rate_limit_helpbot_hour', hint: 'Bitte später wieder versuchen oder direkt /audit nutzen.' },
  skip: (req) => req.method !== 'POST' || req.path !== '/chat'
});
const helpbotDayLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { ok: false, error: 'rate_limit_helpbot_day', hint: 'Tageslimit erreicht. Buche ein Erstgespräch unter /audit.' },
  skip: (req) => req.method !== 'POST' || req.path !== '/chat'
});
app.use('/api/helpbot', helpbotHourLimiter, helpbotDayLimiter, helpbotRouter);

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
