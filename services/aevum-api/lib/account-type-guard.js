// AEVUM v2 — Account-Type Guard (B1-v2: defensive, legacy-safe)
//
// Verwendung:
//   import { requireAccountType } from '../lib/account-type-guard.js';
//   meRouter.use('/shop-only-route', requireAccountType('shop','customer'), handler);
//
// Vertrag:
// - Erwartet, dass requireCustomerAuth bereits gelaufen ist (req.customer gesetzt).
// - Legacy-JWTs ohne account_type-claim: lädt aus DB, default 'customer' bei DB-Fehler.
// - DB-lookup fail ist NIE 500 (würde Login broken machen) — degrade gracefully zu 'customer'.

import { supabase } from './supabase.js';

async function resolveAccountType(req) {
  let claimType = req.customer?.account_type;
  let claimAccess = req.customer?.has_agent_access;
  if (typeof claimType === 'string' && typeof claimAccess === 'boolean') {
    return { account_type: claimType, has_agent_access: claimAccess };
  }
  // Legacy-JWT path: lookup DB
  const id = req.customer?.account_id;
  if (!id) {
    // last-resort default — safer to assume customer (existing behavior pre-mig019)
    return { account_type: 'customer', has_agent_access: true };
  }
  try {
    const r = await supabase.select(
      'accounts',
      `select=account_type,has_agent_access&id=eq.${id}&limit=1`
    );
    const acc = r.data?.[0];
    if (acc) {
      const t = acc.account_type || 'customer';
      const a = acc.has_agent_access ?? true;
      // mutate req.customer so downstream handlers see fresh values
      req.customer.account_type = t;
      req.customer.has_agent_access = a;
      return { account_type: t, has_agent_access: a };
    }
  } catch (e) {
    console.warn('[account-type-guard] DB lookup failed, defaulting to customer:', e.message);
  }
  // Default-safe
  req.customer.account_type = 'customer';
  req.customer.has_agent_access = true;
  return { account_type: 'customer', has_agent_access: true };
}

export function requireAccountType(...allowed) {
  return async (req, res, next) => {
    if (!req.customer?.account_id) {
      return res.status(401).json({ ok: false, error: 'no_account_context' });
    }
    const { account_type } = await resolveAccountType(req);
    if (!allowed.includes(account_type)) {
      return res.status(403).json({
        ok: false,
        error: 'wrong_account_type',
        required: allowed,
        current: account_type
      });
    }
    next();
  };
}

// Only allow accounts that have agent access (Vollkunden mit Personal-Agent).
// Defensive: legacy without claim → DB-lookup → default true (existing behavior preserved).
export async function requireAgentAccess(req, res, next) {
  if (!req.customer?.account_id) {
    return res.status(401).json({ ok: false, error: 'no_account_context' });
  }
  const { has_agent_access } = await resolveAccountType(req);
  if (!has_agent_access) {
    return res.status(403).json({ ok: false, error: 'agent_access_required', upgrade_cta: '/audit' });
  }
  next();
}
