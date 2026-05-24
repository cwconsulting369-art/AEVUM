import { Router } from 'express';
import { z } from 'zod';
import { stripe, PILOT_COUPON_ID_ENV } from '../lib/stripe.js';
import { supabase } from '../lib/supabase.js';
import { notifyCarlos } from '../lib/tg-notify.js';
import { earnCredits, addStamp, checkStampReward } from '../lib/credits.js';
import { issueMagicLinkToken } from '../lib/crypto.js';
import { mailer, magicLinkHtml, magicLinkText } from '../lib/mailer.js';

export const checkoutRouter = Router();

// HGB §147 — 10 Jahre Aufbewahrung kaufmännischer Belege
const ORDER_RETENTION_MS = 10 * 365 * 24 * 60 * 60 * 1000;
const IMMEDIATE_START_VERSION = 'immediate-start-v1-2026-05-20';

function maskEmail(e) {
  if (!e || typeof e !== 'string') return '';
  return e.replace(/^(.).+(@.+)$/, '$1***$2');
}

// ensure account_credits row exists for given account_id (idempotent insert)
async function ensureCreditsRowForAccount(account_id) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  await fetch(`${url}/rest/v1/account_credits`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify({ account_id, balance: 0, lifetime_earned: 0 }),
  }).catch(() => {});
}

// ─── POST /api/checkout/webhook ─────────────────────────────────
// Stripe sends events here. Verified with STRIPE_WEBHOOK_SECRET.
// Express must NOT parse JSON on this route — we need the raw body.
checkoutRouter.post('/webhook', async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send('webhook not configured');
  }
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error('[webhook] signature verification failed:', e.message);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const sessionId = session.id;
    const amountTotal = session.amount_total ?? 0;
    const currency = session.currency ?? 'eur';

    const { data: existing } = await supabase.select(
      'orders',
      `?stripe_session_id=eq.${sessionId}&select=id`
    );
    const row = Array.isArray(existing) ? existing[0] : existing;

    const paidAt = new Date();
    const paidAtIso = paidAt.toISOString();
    // HGB §147 — 10 Jahre Aufbewahrungspflicht
    const dsgvoDeletionDueIso = new Date(paidAt.getTime() + ORDER_RETENTION_MS).toISOString();
    const metaImmediateStart = session.metadata?.consent_immediate_start === 'true';
    const metaImmediateStartVersion =
      session.metadata?.consent_immediate_start_version || (metaImmediateStart ? IMMEDIATE_START_VERSION : null);

    let finalOrderId = row?.id || null;

    if (row?.id) {
      await supabase.update(
        'orders',
        `?id=eq.${row.id}`,
        {
          status: 'paid',
          paid_at: paidAtIso,
          dsgvo_deletion_due: dsgvoDeletionDueIso,
          stripe_payment_intent: session.payment_intent,
          stripe_customer_id: session.customer,
          total_cents: amountTotal,
          subtotal_cents: amountTotal,
          base_price_cents: amountTotal,
          currency,
          updated_at: paidAtIso,
        }
      );
    } else {
      // Webhook arrived without a preceding create-session row (rare; log + fallback insert)
      const fallbackInsert = await supabase.insert('orders', {
        stripe_session_id: sessionId,
        customer_email: session.customer_details?.email || 'unknown@example.com',
        package_tier: session.metadata?.tier || session.metadata?.blueprint_slug || 'shop',
        package_name: session.metadata?.blueprint_slug || session.metadata?.product_id || 'Shop Purchase',
        base_price_cents: amountTotal,
        subtotal_cents: amountTotal,
        total_cents: amountTotal,
        pilot_discount_applied: session.metadata?.pilotApplied === 'true',
        pilot_discount_percent: session.metadata?.pilotApplied === 'true' ? 30 : 0,
        currency,
        status: 'paid',
        paid_at: paidAtIso,
        dsgvo_deletion_due: dsgvoDeletionDueIso,
        stripe_payment_intent: session.payment_intent,
        stripe_customer_id: session.customer,
        consent_immediate_start: metaImmediateStart,
        consent_immediate_start_at: metaImmediateStart ? paidAtIso : null,
        consent_immediate_start_version: metaImmediateStartVersion,
      });
      const inserted = Array.isArray(fallbackInsert.data) ? fallbackInsert.data[0] : fallbackInsert.data;
      finalOrderId = inserted?.id || null;
    }

    // § 356 Abs 4 BGB — post-payment consent_log entry (Beweissicherung Vertragsschluss)
    if (metaImmediateStart) {
      supabase.insert('consent_log', {
        order_id: finalOrderId,
        email: session.customer_details?.email || null,
        consent_type: 'immediate_start_waiver_confirmed_at_payment',
        consent_text_version: metaImmediateStartVersion || IMMEDIATE_START_VERSION,
        ip_anonymized: null,
        user_agent: 'stripe-webhook'
      }).catch(err => console.error('consent_log fail (webhook waiver):', err));
    }

    // ─── account_type='shop' Logik (2026-05-24) ──────────────────
    // Per mig019: account_type hat NOT NULL DEFAULT 'customer', Backfill setzt
    // has_agent_access=true für existierende Vollkunden. Daher:
    //   - Vollkunde   = account_type='customer' AND has_agent_access=true → NICHT überschreiben
    //   - Shop-Käufer = account_type='shop'  → bleibt shop
    //   - SaaS-User   = account_type='saas' → bleibt saas
    //   - Default-Row (customer + has_agent_access=false) → auf 'shop' downgraden
    //   - Kein Account → nur loggen (Carlos-Policy: kein auto-create)
    // Carlos 2026-05-24 Update: Auto-Account-Create für Gast-Käufer wenn opt-in
    // Auto-create wenn metadata.create_account==='true' ODER source startsWith 'saas-' (SaaS-Onboarding triggert immer Account-Create)
    const buyerEmail = session.customer_details?.email?.toLowerCase();
    const buyerName = session.customer_details?.name || null;
    const purchaseSource = session.metadata?.source || 'direct';
    const wantsAccount = session.metadata?.create_account === 'true' || purchaseSource.startsWith('saas-');
    const purchaseType = session.metadata?.purchase_type ||
      (session.metadata?.blueprint_slug ? 'blueprint' :
       session.metadata?.credit_package_slug ? 'saas-credits' :
       'unknown');
    const totalEurNum = amountTotal / 100;

    if (buyerEmail) {
      try {
        const { data: acctRows } = await supabase.select(
          'accounts',
          `?email=eq.${encodeURIComponent(buyerEmail)}&select=id,account_type,has_agent_access,first_purchase_at,lifetime_value_eur&limit=1`
        );
        let acct = Array.isArray(acctRows) ? acctRows[0] : acctRows;

        if (!acct && wantsAccount) {
          // Auto-Create Shop-Account (oder SaaS wenn Credit-Pack-Kauf)
          const initialType = purchaseSource.startsWith('saas-') ? 'saas' : 'shop';
          const slug = `${buyerEmail.split('@')[0].replace(/[^a-z0-9-]/g, '-').slice(0, 32)}-${Math.random().toString(36).slice(2, 6)}`;
          const insertRes = await supabase.insert('accounts', {
            slug,
            name: buyerName || buyerEmail.split('@')[0],
            email: buyerEmail,
            account_type: initialType,
            has_agent_access: false,
            status: 'active',
            source: purchaseSource,
            first_purchase_at: paidAtIso,
            first_purchase_amount_eur: totalEurNum,
            first_purchase_type: purchaseType,
            lifetime_value_eur: totalEurNum,
            last_activity_at: paidAtIso
          });
          if (insertRes.ok) {
            acct = Array.isArray(insertRes.data) ? insertRes.data[0] : insertRes.data;
            console.log(`[checkout-webhook] Account auto-created: ${acct?.aevum_id || acct?.id} (${initialType}) for ${maskEmail(buyerEmail)} source=${purchaseSource}`);
          } else {
            console.error('[checkout-webhook] auto-create failed (non-fatal):', insertRes.error);
          }
        } else if (!acct) {
          console.log(`[checkout-webhook] guest-buy: ${maskEmail(buyerEmail)} — kein Account (Gast-Modus)`);
        } else {
          // Existing-Account: Type-Logik + Tracking-Update
          const updateFields = {
            last_activity_at: paidAtIso,
            lifetime_value_eur: (Number(acct.lifetime_value_eur) || 0) + totalEurNum,
            updated_at: paidAtIso
          };
          if (!acct.first_purchase_at) {
            updateFields.first_purchase_at = paidAtIso;
            updateFields.first_purchase_amount_eur = totalEurNum;
            updateFields.first_purchase_type = purchaseType;
          }
          // Account-Type-Logik (Upgrade-Path one-way: shop→saas→customer):
          // Vollkunde bleibt Vollkunde. SaaS bleibt SaaS. Shop kann zu SaaS upgraden wenn Credit-Pack gekauft.
          if (acct.account_type === 'shop' && purchaseSource.startsWith('saas-')) {
            updateFields.account_type = 'saas';
            console.log(`[checkout-webhook] Account ${acct.id}: Upgrade shop→saas wegen Credit-Pack-Kauf`);
          } else if (acct.account_type === 'customer' && acct.has_agent_access === true) {
            console.log(`[checkout-webhook] Vollkunde ${acct.id} kauft — type bleibt customer (LTV +${totalEurNum.toFixed(2)})`);
          }
          await supabase.update('accounts', `?id=eq.${acct.id}`, updateFields);
        }
      } catch (acctErr) {
        console.error('[checkout-webhook] account-tracking error (non-fatal):', acctErr.message);
      }
    }

    // PII-minimised TG notification
    const emailMasked = maskEmail(session.customer_details?.email || '');
    const totalEur = (amountTotal / 100).toFixed(2);
    const tier = session.metadata?.blueprint_slug || session.metadata?.tier || session.metadata?.product_id || '?';
    notifyCarlos(
      `💰 *Neuer AEVUM-Sale* — ${tier}\n*Betrag:* ${totalEur} EUR\n*Kunde:* ${emailMasked}\n${session.metadata?.pilotApplied === 'true' ? `*Pilot-Slot:* ${session.metadata.pilotSlot}/10\n` : ''}_Volle Daten in Supabase orders-Tabelle_`
    );

    // Credits + Loyalty: nur wenn account_id in Session-Metadata vorhanden
    const accountId = session.metadata?.account_id;
    if (accountId) {
      try {
        await earnCredits(accountId, amountTotal, session.id, 'Blueprint-Kauf');
        await addStamp(accountId);
        await checkStampReward(accountId);
      } catch (credErr) {
        // Loyalty-Fehler dürfen den Webhook nicht blockieren
        console.error('[webhook] credits/loyalty error (non-fatal):', credErr.message);
      }
    }

    // ─── SaaS-Signup Credit-Grant + Magic-Link (Wave G4) ──────────
    // Wenn purchase_type='saas-credits' UND wir einen Account haben (gerade auto-created
    // ODER existing): Initial-Credit-Paket auf account_credits gutschreiben + Magic-Link
    // per Mail senden.
    const creditPkgSlug = session.metadata?.credit_package_slug;
    const creditsToGrant = parseInt(session.metadata?.credits_to_grant || '0', 10);
    const isSaasSignup = session.metadata?.purchase_type === 'saas-credits';

    if (isSaasSignup && buyerEmail && creditsToGrant > 0) {
      try {
        // Account holen (frisch auto-created oder existing)
        const { data: signupAcctRows } = await supabase.select(
          'accounts',
          `?email=eq.${encodeURIComponent(buyerEmail)}&select=id,name,email,aevum_id&limit=1`
        );
        const signupAcct = Array.isArray(signupAcctRows) ? signupAcctRows[0] : signupAcctRows;

        if (!signupAcct) {
          console.error(`[checkout-webhook] saas-signup: no account for ${maskEmail(buyerEmail)} — credit grant skipped`);
        } else {
          // 1) Credits aufladen — wir nutzen den earnCredits-Helper NICHT, weil der
          // Earn-Rate (10/€) anwendet. Hier ist Initial-Package: feste Credit-Menge.
          // Direkt Insert in credit_transactions + Balance-Update.
          await ensureCreditsRowForAccount(signupAcct.id);

          // Aktuellen Balance holen
          const { data: ccRows } = await supabase.select(
            'account_credits',
            `?account_id=eq.${signupAcct.id}&select=id,balance,lifetime_earned&limit=1`
          );
          const ccRow = Array.isArray(ccRows) ? ccRows[0] : ccRows;
          const newBalance = (Number(ccRow?.balance) || 0) + creditsToGrant;
          const newLifetime = (Number(ccRow?.lifetime_earned) || 0) + creditsToGrant;

          await supabase.update(
            'account_credits',
            `?account_id=eq.${signupAcct.id}`,
            {
              balance: newBalance,
              lifetime_earned: newLifetime,
              updated_at: paidAtIso,
            }
          );

          await supabase.insert('credit_transactions', {
            account_id: signupAcct.id,
            type: 'bonus', // Initial-Package = Bonus (kein purchase_earn weil keine LTV-Kopplung)
            amount: creditsToGrant,
            reference_id: session.id,
            description: `Initial-Credit-Package: ${creditPkgSlug || 'unknown'}`,
          }).catch(err => console.error('[checkout-webhook] credit_transactions insert non-fatal:', err.message));

          console.log(`[checkout-webhook] SaaS-Signup: ${creditsToGrant} Credits gutschrieben für ${maskEmail(buyerEmail)} (Paket=${creditPkgSlug})`);

          // 2) Magic-Link generieren + Mail senden (purpose=invite)
          try {
            const token = issueMagicLinkToken({
              account_id: signupAcct.id,
              email: signupAcct.email,
              purpose: 'invite',
              ttlSeconds: 60 * 60 * 24 // 24h für Onboarding
            });
            const portalBase = process.env.AEVUM_PORTAL_BASE_URL || 'https://app.aevum-system.de';
            const link = `${portalBase}/auth/verify?token=${encodeURIComponent(token)}`;
            await mailer.send({
              to: signupAcct.email,
              from: 'AEVUM SaaS <saas@aevum-system.de>',
              subject: 'Willkommen bei AEVUM — Dein Account ist bereit',
              html: magicLinkHtml({ name: signupAcct.name, link, purpose: 'invite' }),
              text: magicLinkText({ name: signupAcct.name, link, purpose: 'invite' }),
            });
            console.log(`[checkout-webhook] SaaS-Signup: Magic-Link gesendet an ${maskEmail(buyerEmail)}`);
          } catch (mailErr) {
            console.error('[checkout-webhook] saas-signup magic-link mail error (non-fatal):', mailErr.message);
          }
        }
      } catch (saasErr) {
        console.error('[checkout-webhook] saas-signup credit-grant error (non-fatal):', saasErr.message);
      }
    }
    // ─── Subscription-Signup (Wave I4) ────────────────────────────
    // checkout.session.completed mit mode='subscription' → Plan + Initial Credit-Grant
    if (session.mode === 'subscription' && session.subscription) {
      try {
        await handleSubscriptionCheckoutCompleted(session, paidAtIso);
      } catch (subErr) {
        console.error('[checkout-webhook] subscription-signup error (non-fatal):', subErr.message);
      }
    }
  }

  // ─── Subscription-Lifecycle-Events (Wave I4) ────────────────────
  // invoice.paid           → recurring renewal: credit-refill (skip first invoice — handled by checkout.session.completed)
  // customer.subscription.updated → status sync (active/past_due/etc)
  // customer.subscription.deleted → mark canceled
  if (event.type === 'invoice.paid') {
    try { await handleInvoicePaid(event.data.object); }
    catch (e) { console.error('[checkout-webhook] invoice.paid error (non-fatal):', e.message); }
  } else if (event.type === 'customer.subscription.updated') {
    try { await handleSubscriptionUpdated(event.data.object); }
    catch (e) { console.error('[checkout-webhook] sub.updated error (non-fatal):', e.message); }
  } else if (event.type === 'customer.subscription.deleted') {
    try { await handleSubscriptionDeleted(event.data.object); }
    catch (e) { console.error('[checkout-webhook] sub.deleted error (non-fatal):', e.message); }
  }

  return res.json({ received: true });
});

// ════════════════════════════════════════════════════════════════
// Subscription-Helper-Functions (Wave I4)
// ════════════════════════════════════════════════════════════════

async function findPlanByPriceId(stripePriceId) {
  const { data } = await supabase.select(
    'subscription_plans',
    `?stripe_price_id=eq.${encodeURIComponent(stripePriceId)}&select=slug,name,credits_per_month&limit=1`
  );
  return Array.isArray(data) ? data[0] : data;
}

async function grantSubscriptionCredits(account_id, amount, reference_id, description) {
  await ensureCreditsRowForAccount(account_id);
  const { data: ccRows } = await supabase.select(
    'account_credits',
    `?account_id=eq.${account_id}&select=id,balance,lifetime_earned&limit=1`
  );
  const ccRow = Array.isArray(ccRows) ? ccRows[0] : ccRows;
  const newBalance = (Number(ccRow?.balance) || 0) + amount;
  const newLifetime = (Number(ccRow?.lifetime_earned) || 0) + amount;
  const nowIso = new Date().toISOString();
  await supabase.update(
    'account_credits',
    `?account_id=eq.${account_id}`,
    { balance: newBalance, lifetime_earned: newLifetime, updated_at: nowIso }
  );
  await supabase.insert('credit_transactions', {
    account_id, type: 'subscription_refill',
    amount, reference_id, description
  }).catch(err => console.error('[sub] credit_transactions insert non-fatal:', err.message));
}

// Initial subscription signup — runs on checkout.session.completed (mode=subscription)
async function handleSubscriptionCheckoutCompleted(session, paidAtIso) {
  const buyerEmail = session.customer_details?.email?.toLowerCase();
  if (!buyerEmail) {
    console.warn('[sub] checkout.session.completed: no email');
    return;
  }
  const subscriptionId = session.subscription;
  const customerId = session.customer;

  // Get subscription details from Stripe for price-id
  const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] });
  const priceId = sub.items.data[0]?.price?.id;
  if (!priceId) {
    console.error('[sub] no price_id on subscription', subscriptionId);
    return;
  }

  const plan = await findPlanByPriceId(priceId);
  if (!plan) {
    console.error(`[sub] no plan found for price_id ${priceId}`);
    return;
  }

  // Find account (auto-created by main flow OR via google_oauth_sub OR by email)
  const { data: acctRows } = await supabase.select(
    'accounts',
    `?email=eq.${encodeURIComponent(buyerEmail)}&select=id,name,email,subscription_plan&limit=1`
  );
  let acct = Array.isArray(acctRows) ? acctRows[0] : acctRows;

  if (!acct) {
    // Auto-create as saas-account
    const slug = `${buyerEmail.split('@')[0].replace(/[^a-z0-9-]/g, '-').slice(0, 32)}-${Math.random().toString(36).slice(2, 6)}`;
    const buyerName = session.customer_details?.name || session.metadata?.buyer_name || buyerEmail.split('@')[0];
    const ins = await supabase.insert('accounts', {
      slug, name: buyerName, email: buyerEmail,
      account_type: 'saas', has_agent_access: false, status: 'active',
      source: session.metadata?.source || 'subscription-signup',
      first_purchase_at: paidAtIso,
      last_activity_at: paidAtIso
    });
    acct = Array.isArray(ins.data) ? ins.data[0] : ins.data;
  }

  if (!acct?.id) {
    console.error('[sub] account-create failed for', buyerEmail);
    return;
  }

  // Update account with subscription-fields
  const nextRenewal = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;
  await supabase.update('accounts', `?id=eq.${acct.id}`, {
    subscription_plan: plan.slug,
    subscription_status: sub.status,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    subscription_next_renewal: nextRenewal,
    updated_at: new Date().toISOString()
  });

  // Initial credit-grant
  await grantSubscriptionCredits(
    acct.id,
    plan.credits_per_month,
    session.id,
    `Subscription-Initial: ${plan.name} (${plan.credits_per_month} Credits)`
  );

  console.log(`[sub] SIGNUP ${acct.id} → ${plan.slug} (${plan.credits_per_month} Credits granted)`);
  notifyCarlos(
    `🔁 *Neue AEVUM-Subscription* — ${plan.name} (€${plan.slug === 'starter' ? 19 : plan.slug === 'growth' ? 49 : 99}/Mo)\n*Kunde:* ${maskEmail(buyerEmail)}\n*Credits:* ${plan.credits_per_month}/Mo`
  );

  // Send magic-link mail for first-login
  try {
    const token = issueMagicLinkToken({
      account_id: acct.id, email: acct.email,
      purpose: 'invite', ttlSeconds: 60 * 60 * 24
    });
    const portalBase = process.env.AEVUM_PORTAL_BASE_URL || 'https://app.aevum-system.de';
    const link = `${portalBase}/auth/verify?token=${encodeURIComponent(token)}`;
    await mailer.send({
      to: acct.email,
      from: 'AEVUM SaaS <saas@aevum-system.de>',
      subject: `Willkommen bei AEVUM — ${plan.name}-Abo aktiv`,
      html: magicLinkHtml({ name: acct.name, link, purpose: 'invite' }),
      text: magicLinkText({ name: acct.name, link, purpose: 'invite' }),
    });
  } catch (mailErr) {
    console.error('[sub] signup magic-link mail error (non-fatal):', mailErr.message);
  }
}

// Recurring renewal — invoice.paid for billing_reason='subscription_cycle' (not 'subscription_create')
async function handleInvoicePaid(invoice) {
  if (invoice.billing_reason === 'subscription_create') {
    // Initial signup — handled by checkout.session.completed. Skip.
    return;
  }
  if (!invoice.subscription) return;

  const sub = await stripe.subscriptions.retrieve(invoice.subscription, { expand: ['items.data.price'] });
  const priceId = sub.items.data[0]?.price?.id;
  const plan = priceId ? await findPlanByPriceId(priceId) : null;
  if (!plan) {
    console.error(`[sub] invoice.paid: no plan for sub ${invoice.subscription}`);
    return;
  }

  const { data: acctRows } = await supabase.select(
    'accounts',
    `?stripe_subscription_id=eq.${encodeURIComponent(invoice.subscription)}&select=id,email,subscription_plan&limit=1`
  );
  const acct = Array.isArray(acctRows) ? acctRows[0] : acctRows;
  if (!acct) {
    console.error(`[sub] invoice.paid: no account for sub ${invoice.subscription}`);
    return;
  }

  await grantSubscriptionCredits(
    acct.id, plan.credits_per_month, invoice.id,
    `Subscription-Renewal: ${plan.name} (${plan.credits_per_month} Credits)`
  );

  const nextRenewal = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;
  await supabase.update('accounts', `?id=eq.${acct.id}`, {
    subscription_status: sub.status,
    subscription_next_renewal: nextRenewal,
    updated_at: new Date().toISOString()
  });

  console.log(`[sub] RENEWAL ${acct.id} → ${plan.slug} (+${plan.credits_per_month} Credits)`);
}

async function handleSubscriptionUpdated(sub) {
  const { data: acctRows } = await supabase.select(
    'accounts',
    `?stripe_subscription_id=eq.${encodeURIComponent(sub.id)}&select=id&limit=1`
  );
  const acct = Array.isArray(acctRows) ? acctRows[0] : acctRows;
  if (!acct) return;

  const priceId = sub.items?.data?.[0]?.price?.id;
  const plan = priceId ? await findPlanByPriceId(priceId) : null;
  const nextRenewal = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;

  await supabase.update('accounts', `?id=eq.${acct.id}`, {
    subscription_plan: plan?.slug || null,
    subscription_status: sub.status,
    subscription_next_renewal: nextRenewal,
    updated_at: new Date().toISOString()
  });
  console.log(`[sub] UPDATE ${acct.id} status=${sub.status} plan=${plan?.slug || '?'}`);
}

async function handleSubscriptionDeleted(sub) {
  const { data: acctRows } = await supabase.select(
    'accounts',
    `?stripe_subscription_id=eq.${encodeURIComponent(sub.id)}&select=id,email&limit=1`
  );
  const acct = Array.isArray(acctRows) ? acctRows[0] : acctRows;
  if (!acct) return;

  await supabase.update('accounts', `?id=eq.${acct.id}`, {
    subscription_status: 'canceled',
    updated_at: new Date().toISOString()
  });
  console.log(`[sub] CANCEL ${acct.id}`);
  notifyCarlos(`⚠️ *AEVUM-Subscription gekündigt* — ${maskEmail(acct.email || '')}`);
}

// ─── GET /api/checkout/pilot-status ─────────────────────────────
// Public — frontend uses this to render "X/10 Pilot-Plätze frei"
checkoutRouter.get('/pilot-status', async (req, res) => {
  const { data } = await supabase.select(
    'pilot_slots',
    '?id=eq.1&select=total_slots,slots_taken'
  );
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return res.json({ total: 10, taken: 0, free: 10 });
  return res.json({
    total: row.total_slots,
    taken: row.slots_taken,
    free: Math.max(0, row.total_slots - row.slots_taken),
  });
});

// ─── POST /api/checkout/blueprint ───────────────────────────────
// Direct blueprint purchase via Stripe Price ID (no tier/addon logic)
// Body: { stripe_price_id, product_id, metadata, success_url, cancel_url, account_id? }
const BlueprintCheckoutSchema = z.object({
  stripe_price_id: z.string().min(1),
  product_id: z.string().min(1),
  mode: z.enum(['payment', 'subscription']).optional().default('payment'),
  metadata: z.record(z.string()).optional().default({}),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
  account_id: z.string().uuid().optional(),
});

checkoutRouter.post('/blueprint', async (req, res) => {
  if (!stripe) return res.status(503).json({ ok: false, error: 'stripe_not_configured' });

  const parsed = BlueprintCheckoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const f = parsed.data;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: f.mode,
      line_items: [{ price: f.stripe_price_id, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: f.success_url,
      cancel_url: f.cancel_url,
      metadata: {
        ...f.metadata,
        product_id: f.product_id,
        ...(f.account_id ? { account_id: f.account_id } : {}),
      },
    });

    return res.json({ ok: true, url: session.url, session_id: session.id });
  } catch (err) {
    console.error('[blueprint-checkout] stripe error:', err.message);
    return res.status(500).json({ ok: false, error: 'stripe_error', detail: err.message });
  }
});

// NOTE: Legacy `POST /api/checkout/create-session` (S/M/L tier flow) was removed
// 2026-05-24 — superseded by `/api/checkout/blueprint`. BuyButton.tsx (orphan
// frontend caller) was also removed in the same commit.

// ─── POST /api/checkout/credit-purchase ─────────────────────────
// SaaS-Signup-Flow (Wave G4): anonymer Visitor wählt Credit-Paket auf /saas/<tool>,
// kriegt Stripe-Checkout-URL zurück. Nach Zahlung erzeugt Webhook automatisch
// Account + lädt Credits auf + sendet Magic-Link-Mail.
//
// Body: { email, name?, package_slug, tool_slug?, source, consent? }
// Returns: { ok, url }
const CreditPurchaseSchema = z.object({
  email: z.string().email().max(200).transform((s) => s.toLowerCase().trim()),
  name: z.string().max(100).optional(),
  package_slug: z.enum(['starter', 'growth', 'pro']),
  tool_slug: z.string().max(60).regex(/^[a-z0-9-]+$/).optional(),
  source: z.string().max(120),
  consent: z.boolean().optional(),
});

checkoutRouter.post('/credit-purchase', async (req, res) => {
  if (!stripe) return res.status(503).json({ ok: false, error: 'stripe_not_configured' });

  const parsed = CreditPurchaseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const f = parsed.data;

  // Credit-Paket aus DB holen (Single Source of Truth)
  const { data: pkgRows } = await supabase.select(
    'credit_packages',
    `?slug=eq.${encodeURIComponent(f.package_slug)}&is_active=eq.true&select=slug,name,price_eur,credits,bonus_pct&limit=1`
  );
  const pkg = Array.isArray(pkgRows) ? pkgRows[0] : pkgRows;
  if (!pkg) return res.status(404).json({ ok: false, error: 'package_not_found' });

  const priceEur = Number(pkg.price_eur);
  if (!Number.isFinite(priceEur) || priceEur <= 0) {
    return res.status(500).json({ ok: false, error: 'package_price_invalid' });
  }

  const FRONTEND_BASE = process.env.AEVUM_WEB_BASE_URL || 'https://aevum-system.de';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: f.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `AEVUM ${pkg.name} · ${pkg.credits} Credits`,
              description:
                Number(pkg.bonus_pct) > 0
                  ? `+${Number(pkg.bonus_pct)}% Bonus · Initial-Credit-Paket für AEVUM SaaS-Tools`
                  : 'Initial-Credit-Paket für AEVUM SaaS-Tools',
            },
            unit_amount: Math.round(priceEur * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_BASE}/#/checkout/success?type=saas-signup&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_BASE}/#/checkout/cancelled`,
      metadata: {
        create_account: 'true',
        source: f.source,
        credit_package_slug: pkg.slug,
        credits_to_grant: String(pkg.credits),
        purchase_type: 'saas-credits',
        buyer_name: f.name || '',
        tool_slug: f.tool_slug || '',
        consent_at: new Date().toISOString(),
      },
    });

    return res.json({ ok: true, url: session.url, session_id: session.id });
  } catch (err) {
    console.error('[credit-purchase] stripe error:', err.message);
    return res.status(500).json({ ok: false, error: 'stripe_error', detail: err.message });
  }
});

// ─── POST /api/checkout/subscribe ───────────────────────────────
// Wave I4 — Subscription-Signup (Knightvision-Style)
// Anonymer Visitor wählt Subscription-Plan, kriegt Stripe-Subscription-Checkout-URL.
// Nach Zahlung: Webhook erzeugt Account + setzt subscription_plan + Initial-Credit-Grant + Magic-Link-Mail.
//
// Body: { plan_slug, email, name?, source }
// Returns: { ok, url }
const SubscribeSchema = z.object({
  plan_slug: z.enum(['starter', 'growth', 'pro']),
  email: z.string().email().max(200).transform((s) => s.toLowerCase().trim()),
  name: z.string().max(100).optional(),
  source: z.string().max(120).optional().default('subscription-signup'),
});

checkoutRouter.post('/subscribe', async (req, res) => {
  if (!stripe) return res.status(503).json({ ok: false, error: 'stripe_not_configured' });

  const parsed = SubscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'validation_failed', details: parsed.error.flatten() });
  }
  const f = parsed.data;

  // Plan aus DB (SSOT) holen
  const { data: planRows } = await supabase.select(
    'subscription_plans',
    `?slug=eq.${encodeURIComponent(f.plan_slug)}&is_active=eq.true&select=slug,name,price_eur,credits_per_month,stripe_price_id&limit=1`
  );
  const plan = Array.isArray(planRows) ? planRows[0] : planRows;
  if (!plan) return res.status(404).json({ ok: false, error: 'plan_not_found' });
  if (!plan.stripe_price_id) {
    return res.status(503).json({ ok: false, error: 'plan_not_configured', hint: `Stripe-Price-ID fehlt für ${plan.slug}` });
  }

  const FRONTEND_BASE = process.env.AEVUM_WEB_BASE_URL || 'https://aevum-system.de';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: f.email,
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      success_url: `${FRONTEND_BASE}/#/checkout/success?type=subscription&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_BASE}/#/checkout/cancelled`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          plan_slug: plan.slug,
          source: f.source || 'subscription-signup',
        }
      },
      metadata: {
        create_account: 'true',
        source: f.source || 'subscription-signup',
        subscription_plan: plan.slug,
        purchase_type: 'subscription',
        buyer_name: f.name || '',
        consent_at: new Date().toISOString(),
      },
    });

    return res.json({ ok: true, url: session.url, session_id: session.id });
  } catch (err) {
    console.error('[subscribe] stripe error:', err.message);
    return res.status(500).json({ ok: false, error: 'stripe_error', detail: err.message });
  }
});

// ─── GET /api/checkout/subscription-plans (public) ──────────────
// Frontend reads plans for Plan-Picker. SSOT.
checkoutRouter.get('/subscription-plans', async (_req, res) => {
  const { data } = await supabase.select(
    'subscription_plans',
    '?is_active=eq.true&select=slug,name,price_eur,credits_per_month,features,sort_order&order=sort_order'
  );
  res.json({ ok: true, plans: data || [] });
});
