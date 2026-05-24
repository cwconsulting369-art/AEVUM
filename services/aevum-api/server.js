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
import { googleAuthRouter } from './routes/auth-google.js';
import { meRouter } from './routes/me.js';
import { casesRouter } from './routes/cases.js';
import { approvalRouter } from './routes/approval.js';
import { tgWebhookRouter } from './routes/tg-webhook.js';
import { helpbotRouter } from './routes/helpbot.js';
import { botRouter } from './routes/bot.js';
import { creditsRouter } from './routes/credits.js';
import { shopTrackingRouter } from './routes/shop-tracking.js';
import { shopItemsRouter } from './routes/shop-items.js';
import { dashboardStatsRouter } from './routes/dashboard-stats.js';
import { customerLeadsRouter } from './routes/customer-leads.js';
import { waitlistRouter } from './routes/waitlist.js';
import { leadMagnetsRouter } from './routes/lead-magnets.js';
import { scriptFactoryRouter } from './routes/factories/script.js';
import { dsgvoFactoryRouter } from './routes/factories/dsgvo.js';
import { knowledgeHubsRouter } from './routes/knowledge-hubs.js';
import { subscriptionsRouter, projectSubscriptionsRouter } from './routes/subscriptions.js';
import { subOsRouter } from './routes/sub-os.js';
import { anonymizeIp } from './lib/security.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3210', 10);

// Behind cloudflared+CF tunnel — trust only the first hop (CR-03: prevent rate-limit bypass via spoofed XFF)
app.set('trust proxy', 1);

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
  console.log(`${new Date().toISOString()} ${req.method} ${req.path} ip=${anonymizeIp(clientIp(req)) || 'unknown'}`);
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

// Upload limiter — 15 file uploads / hour / IP (5 files * 3 submits)
const auditUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: {
    ok: false,
    error: 'rate_limit_upload',
    hint: 'Maximal 15 Datei-Uploads pro Stunde.'
  },
  skip: (req) => req.method !== 'POST' || req.path !== '/upload-file'
});

// DSGVO self-service limiter — central definition in lib/dsgvo-limiter.js (CR-02 SSOT).
// Wrapped here mit path-skip damit nur POST /export, /erase, /withdraw-consent gelimitet werden.
import { dsgvoLimiter as baseDsgvoLimiter } from './lib/dsgvo-limiter.js';
const dsgvoLimiter = (req, res, next) => {
  if (req.method !== 'POST') return next();
  const p = req.path;
  if (!(p === '/export' || p === '/erase' || p === '/withdraw-consent')) return next();
  return baseDsgvoLimiter(req, res, next);
};

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'aevum-api', uptime: process.uptime() });
});
app.use('/api/audit', auditSubmitLimiter, auditUploadLimiter, dsgvoLimiter, auditRouter);

// Checkout — create-session + pilot-status. Webhook is mounted above
// with raw-body parser before express.json().
// Wave H4: explicit limit on POST endpoints to protect against Stripe-session spam.
const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { ok: false, error: 'rate_limit_checkout', hint: 'Maximal 10 Checkout-Versuche pro Minute.' },
  skip: (req) => req.method !== 'POST'
});
// Payments-Pause-Guard — wenn app_settings.payments_paused=true → alle non-webhook checkout-Endpoints return 503
import { paymentsPausedGuard, isPaymentsPaused, getPausedMessage } from './lib/payments-paused.js';
const checkoutWithPauseGuard = (req, res, next) => {
  // Webhook (POST /webhook) NIE blockieren — Stripe muss zustellen können falls historische Sessions
  if (req.path === '/webhook' || req.path === '') return next();
  return paymentsPausedGuard(req, res, next);
};
app.use('/api/checkout', checkoutLimiter, checkoutWithPauseGuard, checkoutRouter);

// Public /api/config — Frontend liest hier ob Payments live sind
app.get('/api/config', async (_req, res) => {
  const paused = await isPaymentsPaused();
  const msg = await getPausedMessage();
  res.json({
    ok: true,
    payments_paused: paused,
    payments_paused_message: msg,
    timestamp: new Date().toISOString()
  });
});

// AEVUM v2 — Account/Project/Blueprint layer (admin-token gated)
app.use('/api/accounts', accountsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/blueprints', blueprintsRouter);

// AEVUM Wave F2 — Subscription-Tracking (admin-token gated)
// Pool CRUD on /api/subscriptions, per-project links + cost-summary on /api/projects/:id/*
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/projects/:id', projectSubscriptionsRouter);

// AEVUM v2 — Customer-Lead-Storage (Public Intake + Admin Read)
app.use('/api/leads', customerLeadsRouter);

// AEVUM v2 — Customer-Portal auth + self-service (Block D)
app.use('/api/auth', authRouter);

// Wave I4 — Google-OAuth-Login (1-Click for SaaS/Shop)
// Routes: GET /api/auth/google, GET /api/auth/google/callback
app.use('/api/auth', googleAuthRouter);

// Wave H4: explicit /api/me upload-burst limit (5/min/IP for POST upload paths only).
//          requireCustomerAuth + JWT already in meRouter; this is defense-in-depth.
const meUploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { ok: false, error: 'rate_limit_me_upload', hint: 'Maximal 5 Uploads pro Minute.' },
  skip: (req) => req.method !== 'POST' || !/\/projects\/[^/]+\/docs\/upload$/.test(req.path)
});
app.use('/api/me', meUploadLimiter, meRouter);
app.use('/api/cases', casesRouter);

// Credit + Loyalty System
app.use('/api/credits', creditsRouter);

// Bot-internal data endpoint (admin-token gated, localhost only in practice)
app.use('/bot', botRouter);

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
// Erase-Endpoint: 5/hour/IP — abuse prevention but not too tight for legit users
const helpbotEraseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { ok: false, error: 'rate_limit_helpbot_erase', hint: 'Maximal 5 Lösch-Anfragen pro Stunde.' },
  skip: (req) => req.method !== 'POST' || req.path !== '/erase'
});
app.use('/api/helpbot', helpbotHourLimiter, helpbotDayLimiter, helpbotEraseLimiter, helpbotRouter);

// SaaS Waitlist (Pfad C — Coming-Soon tools): 10 submits / hour / IP
const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { ok: false, error: 'rate_limit_waitlist', hint: 'Maximal 10 Anfragen pro Stunde.' },
  skip: (req) => req.method !== 'POST' || req.path !== '/saas'
});
app.use('/api/waitlist', waitlistLimiter, waitlistRouter);

// Lead-Magnets — Wave D3 (PDF download via email-capture). 10/h/IP per slug.
const leadMagnetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { ok: false, error: 'rate_limit_lead_magnet', hint: 'Maximal 10 Anfragen pro Stunde.' },
  skip: (req) => req.method !== 'POST'
});
app.use('/api/lead-magnets', leadMagnetLimiter, leadMagnetsRouter);

// Shop-tracking — fire-and-forget page-view + funnel capture.
// Tight rate-limit: 100/min/IP, scoped to POST /track only.
const shopTrackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { ok: false, error: 'rate_limit_shop_track' },
  skip: (req) => req.method !== 'POST' || req.path !== '/track'
});
app.use('/api/shop', shopTrackLimiter, shopTrackingRouter);
app.use('/api/shop-items', shopItemsRouter);

// Admin-token gated dashboard aggregate endpoints (shop / stripe / orders)
app.use('/api/dashboard', dashboardStatsRouter);

// SaaS Factories — Wave C (Pay-per-Run)
// Wave H4: zusätzlicher IP-Burst-Schutz on top of agent-throttle + spendCredits.
// Schützt vor Massen-Burst von einem Account/IP (auch wenn Credits-Pool gefüllt ist).
const factoryRunLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { ok: false, error: 'rate_limit_factory_run', hint: 'Maximal 3 Factory-Runs pro Minute.' },
  skip: (req) => req.method !== 'POST' || req.path !== '/run'
});
app.use('/api/factories/script', factoryRunLimiter, scriptFactoryRouter);
app.use('/api/factories/dsgvo', factoryRunLimiter, dsgvoFactoryRouter);

// Knowledge-Hubs — Wave H1 (SSOT for Bauligs/Salinsky/etc; admin CRUD + public listing)
// Wave H4: defense-in-depth limit (admin-token gated CRUD is the primary control).
const knowledgeWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { ok: false, error: 'rate_limit_knowledge_write', hint: 'Maximal 20 Knowledge-Hub-Writes pro Minute.' },
  skip: (req) => req.method === 'GET' || req.method === 'HEAD'
});
app.use('/api/knowledge-hubs', knowledgeWriteLimiter, knowledgeHubsRouter);

// Sub-OS aevum-summary endpoints — Wave E3 (admin-token gated)
//   /api/sub-os                      → list supported systems
//   /api/sub-os/_all/summary         → aggregated (Master-Dashboard pull)
//   /api/sub-os/:system/summary      → live cached KPIs per system
//   /api/sub-os/snapshots/:system    → snapshot history (trends)
app.use('/api/sub-os', subOsRouter);

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
