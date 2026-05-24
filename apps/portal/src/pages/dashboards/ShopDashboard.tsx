// Shop-Dashboard — fuer Shop-Kaeufer (account_type='shop', has_agent_access=false).
// Sichtbar: Orders, Downloads, Credits, Helpbot-Hint, Upgrade-CTA.
// NICHT sichtbar: Projects, Personal-Agent, Documents, Quicklinks (Vollkunden-only).

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Link } from 'react-router';
import {
  ShoppingBag, Download, Coins, Bot, Sparkles, ArrowRight,
  FileText, Package, CheckCircle2, ExternalLink, MessageCircle
} from 'lucide-react';
import { stagger } from '@/lib/animations';
import Spinner from '@/components/Spinner';

interface Order {
  id: string;
  created_at: string;
  paid_at: string | null;
  status: string;
  package_tier: string | null;
  package_name: string | null;
  total_cents: number;
  currency: string;
  addons: any;
  recurring_interval: string | null;
  stripe_session_id: string | null;
}

interface CreditsSnapshot {
  balance: number;
  lifetime_earned: number;
}

export default function ShopDashboard() {
  const { me } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [credits, setCredits] = useState<CreditsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ ok: boolean; orders: Order[] }>('/api/me/orders').catch(() => ({ ok: false, orders: [] })),
      api<{ ok: boolean; credits: CreditsSnapshot }>('/api/me/credits').catch(() => ({
        ok: false,
        credits: { balance: 0, lifetime_earned: 0 }
      }))
    ]).then(([o, c]) => {
      setOrders(o.orders ?? []);
      setCredits(c.credits ?? { balance: 0, lifetime_earned: 0 });
    }).finally(() => setLoading(false));
  }, []);

  if (!me) return null;
  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="md" /></div>;
  }

  const paidOrders = (orders ?? []).filter(o => o.status === 'paid' || o.paid_at);

  return (
    <div className="dashboard-stack @container">
      {/* Hero — compact */}
      <header>
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-2 uppercase tracking-wider font-semibold">
          <Sparkles size={12} /> Dein Shop-Bereich
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {me.account.name || 'Willkommen'}
        </h1>
        <p className="text-ink-400 mt-1 text-sm">
          Deine Käufe, Downloads und Bonuspunkte auf einen Blick.
        </p>
      </header>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-[var(--dashboard-gap)]">
        <KpiCard
          i={0}
          icon={ShoppingBag}
          label="Käufe"
          value={paidOrders.length.toString()}
          accent={paidOrders.length > 0}
        />
        <KpiCard
          i={1}
          icon={Coins}
          label="Credits"
          value={(credits?.balance ?? 0).toLocaleString('de-DE')}
          accent={(credits?.balance ?? 0) > 0}
          highlight
        />
        <KpiCard
          i={2}
          icon={Download}
          label="Downloads"
          value={paidOrders.length.toString()}
          accent={paidOrders.length > 0}
        />
      </div>

      {/* Credits + Helpbot — side-by-side auf xl fuer Viewport-Fit */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[var(--dashboard-gap)]">
        <section className="animate-fade-up xl:col-span-2" style={{ animationDelay: '180ms' }}>
          <div className="card-premium card-pad h-full">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0">
                  <Coins size={20} className="text-gold-300" />
                </div>
                <div>
                  <div className="text-[0.6rem] uppercase tracking-[0.3em] text-gold-400/70 mb-1">Dein Bonus-Konto</div>
                  <div className="text-2xl xl:text-3xl font-bold text-gold-gradient tabular-nums leading-none">
                    {(credits?.balance ?? 0).toLocaleString('de-DE')} <span className="text-base font-medium text-ink-400">Credits</span>
                  </div>
                  <div className="text-xs text-ink-400 mt-1">
                    Gesamt verdient: {(credits?.lifetime_earned ?? 0).toLocaleString('de-DE')}
                  </div>
                </div>
              </div>
              <Link to="/credits" className="btn-gold py-2 px-4 text-xs inline-flex items-center gap-2">
                Credits verwalten <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>

        <section className="animate-fade-up" style={{ animationDelay: '220ms' }}>
          <div className="card-premium card-pad h-full flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-emerald-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white mb-0.5">Fragen zum Kauf?</div>
              <a
                href="https://t.me/aevumsystem_bot?start=help"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1"
              >
                Helpbot öffnen <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Orders */}
      <section className="animate-fade-up" style={{ animationDelay: '280ms' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-white">Deine Käufe</h2>
            <p className="text-xs text-ink-400 mt-0.5">Alle abgeschlossenen Bestellungen im Shop.</p>
          </div>
        </div>
        {paidOrders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="card-premium divide-y divide-white/5">
            {paidOrders.map((o, i) => (
              <OrderRow key={o.id} order={o} i={i} />
            ))}
          </div>
        )}
      </section>

      {/* Downloads — auto-fit-grid */}
      {paidOrders.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: '320ms' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-white">Downloads</h2>
              <p className="text-xs text-ink-400 mt-0.5">Blueprint-JSONs, PDFs und Video-Material zu deinen Käufen.</p>
            </div>
          </div>
          <div className="dashboard-grid">
            {paidOrders.map((o, i) => (
              <div key={o.id} className="card-premium card-compact animate-fade-up" style={stagger(i, 60, 60)}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{o.package_name || o.package_tier || 'Bestellung'}</div>
                    <div className="text-[0.7rem] text-ink-400 mt-0.5 font-mono">{o.id.slice(0, 8)}</div>
                  </div>
                  <Package size={16} className="text-gold-300 shrink-0" />
                </div>
                <div className="flex flex-col gap-2">
                  <DownloadButton label="n8n-Blueprint (JSON)" icon={FileText} disabled />
                  <DownloadButton label="Implementierungs-PDF" icon={FileText} disabled />
                  <DownloadButton label="Walkthrough-Video" icon={ExternalLink} disabled />
                </div>
                <div className="text-[0.65rem] text-ink-500 mt-3">
                  Downloads werden in Kürze freigeschaltet. Bei Fragen → Helpbot.
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upgrade-CTA */}
      <section className="animate-fade-up" style={{ animationDelay: '460ms' }}>
        <div className="relative overflow-hidden card-premium p-6 xl:p-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />
          <div className="relative max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-gold-300 mb-2 uppercase tracking-wider font-semibold">
              <Bot size={14} /> Upgrade zur Voll-Partnerschaft
            </div>
            <h3 className="text-xl xl:text-2xl font-bold text-white mb-2">
              Mehr aus AEVUM herausholen?
            </h3>
            <p className="text-sm text-ink-300 mb-4 leading-relaxed">
              Buche dein kostenloses Audit. Wir bauen dir dein Operating-System, geben dir einen
              eigenen Personal-Agent, Projekt-Spaces, Dokumentenaustausch und volle Custom-Integration.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a href="https://aevum-system.de/audit" className="btn-gold inline-flex items-center gap-2">
                Kostenloses Audit buchen <ArrowRight size={14} />
              </a>
              <a href="https://aevum-system.de" className="text-xs text-ink-300 hover:text-gold-300 transition inline-flex items-center gap-1">
                Mehr erfahren <ArrowRight size={12} />
              </a>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/5">
              <UpgradeBullet text="Personal-Agent mit Memory" />
              <UpgradeBullet text="Custom-Projekt-Spaces" />
              <UpgradeBullet text="Dokumentenaustausch" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  i, icon: Icon, label, value, accent, highlight
}: {
  i: number;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="card-premium card-compact animate-fade-up" style={stagger(i, 60, 60)}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={16} className={accent ? 'text-gold-300' : 'text-ink-400'} strokeWidth={1.8} />
        <span className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold">{label}</span>
      </div>
      <div className={`text-xl sm:text-2xl xl:text-2xl font-bold tracking-tight ${highlight ? 'text-gold-gradient' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function OrderRow({ order, i }: { order: Order; i: number }) {
  const total = (order.total_cents / 100).toLocaleString('de-DE', { style: 'currency', currency: order.currency || 'EUR' });
  const date = order.paid_at || order.created_at;
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-fade-up" style={stagger(i, 40, 50)}>
      <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
        <CheckCircle2 size={16} className="text-emerald-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">
          {order.package_name || order.package_tier || 'Bestellung'}
        </div>
        <div className="text-[0.65rem] text-ink-400 mt-0.5">
          {new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
          {order.recurring_interval && <> · {order.recurring_interval}</>}
        </div>
      </div>
      <div className="text-sm font-bold text-gold-200 tabular-nums shrink-0">{total}</div>
    </div>
  );
}

function DownloadButton({
  label, icon: Icon, disabled
}: { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className={[
        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
        'border border-white/5',
        disabled
          ? 'bg-white/[0.02] text-ink-500 cursor-not-allowed'
          : 'bg-white/[0.04] hover:bg-white/[0.08] text-ink-100'
      ].join(' ')}
    >
      <Icon size={13} />
      <span className="truncate">{label}</span>
      {disabled && <span className="ml-auto text-[0.55rem] uppercase tracking-wider text-ink-500">Bald</span>}
    </button>
  );
}

function UpgradeBullet({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-200">
      <CheckCircle2 size={14} className="text-gold-300 shrink-0" strokeWidth={2} />
      <span>{text}</span>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="card-premium p-10 text-center">
      <ShoppingBag size={28} className="mx-auto mb-3 text-ink-500" strokeWidth={1.5} />
      <div className="text-sm text-ink-300 mb-1">Noch keine Käufe.</div>
      <div className="text-[0.7rem] text-ink-500 mb-4">Sobald du Blueprints im Shop kaufst, erscheinen sie hier.</div>
      <a href="https://aevum-system.de/shop" className="btn-gold text-sm inline-flex">
        Zum Shop <ArrowRight size={14} />
      </a>
    </div>
  );
}
