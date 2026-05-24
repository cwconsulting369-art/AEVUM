// AEVUM Agent-Throttle Middleware
// Created: 2026-05-24 (Agent A5)
//
// Pre-LLM-call gate: blocks request when daily-cap reached, alerts at 80%.
// Sits BEFORE /api/helpbot/chat and /api/me/projects/:slug/agent/chat.
//
// Usage:
//   import { agentThrottle } from '../lib/agent-throttle.js';
//   helpbotRouter.post('/chat', agentThrottle({ allowAnonymous: true }), handler);
//   projectAgentRouter.post('/chat', agentThrottle(), handler);

import { checkDailyCap } from './credit-spend.js';
import { notifyCarlos } from './tg-notify.js';

const ALERT_COOLDOWN_MS = 60 * 60 * 1000; // max 1 alert/hour
let lastAlert = 0;

export function agentThrottle(opts = {}) {
  const { allowAnonymous = false } = opts;
  return async (req, res, next) => {
    try {
      // Resolve accountId from various auth shapes used in this codebase
      const accountId =
        req.customer?.account_id ||
        req.account?.id ||
        req.user?.account_id ||
        null;

      if (!accountId && !allowAnonymous) {
        return res.status(401).json({ ok: false, error: 'auth_required' });
      }

      const check = await checkDailyCap(accountId);

      // Hard stops
      if (check.globalOverLimit) {
        console.warn(`[agent-throttle] GLOBAL CAP HIT €${check.globalSpend.toFixed(2)}/€${check.caps.global}`);
        return res.status(429).json({
          ok: false,
          error: 'global_daily_cap_reached',
          retry_after: '24h'
        });
      }
      if (check.accountOverLimit) {
        return res.status(429).json({
          ok: false,
          error: 'account_daily_cap_reached',
          retry_after: '24h',
          spend_eur: Number(check.accountSpend.toFixed(2)),
          cap_eur: check.caps.perAccount
        });
      }

      // 80%-Alerts (debounced)
      if ((check.accountAt80 || check.globalAt80) && Date.now() - lastAlert > ALERT_COOLDOWN_MS) {
        const msg = [
          '⚠️ *Agent-Spend 80% Cap*',
          `Account: €${check.accountSpend.toFixed(2)} / €${check.caps.perAccount}`,
          `Global:  €${check.globalSpend.toFixed(2)} / €${check.caps.global}`,
          `Endpoint: \`${req.originalUrl || req.url}\``
        ].join('\n');
        notifyCarlos(msg).catch(() => {});
        lastAlert = Date.now();
      }

      req.agentCaps = check;
      next();
    } catch (err) {
      console.error('[agent-throttle] error:', err.message || err);
      // Fail-open: don't block requests on monitoring errors
      next();
    }
  };
}
