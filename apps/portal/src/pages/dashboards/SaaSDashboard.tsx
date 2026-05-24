// SaaS-Dashboard — fuer SaaS-Tool-Nutzer (account_type='saas', has_agent_access=false).
// Aktuell mostly Coming-Soon: Factory-Slots gedimmt, Credits-Sektion live.
// Sobald Script-Factory (C1) live ist, wird die "Verfuegbar"-Sektion gefuellt.

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Link } from 'react-router';
import {
  Sparkles, Coins, Zap, Film, Shield, Users, FileText,
  ArrowRight, Wrench, Clock
} from 'lucide-react';
import { stagger } from '@/lib/animations';
import Spinner from '@/components/Spinner';

interface CreditsSnapshot {
  balance: number;
  lifetime_earned: number;
}

type FactoryStatus = 'in_bau' | 'geplant' | 'konzept';

interface FactorySlot {
  key: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  status: FactoryStatus;
  eta?: string;
}

const FACTORY_SLOTS: FactorySlot[] = [
  {
    key: 'script',
    title: 'Script-Factory',
    desc: 'E-Commerce Ad-Scripts auf Knopfdruck. Hook-Library, Test-Varianten, Brand-Tone-Tuning.',
    icon: Film,
    status: 'in_bau',
    eta: 'In Bau'
  },
  {
    key: 'dsgvo',
    title: 'DSGVO-Factory',
    desc: 'Datenschutz, AGB, Impressum & Cookie-Banner — fertig generiert für deinen Business-Type.',
    icon: Shield,
    status: 'geplant',
    eta: 'Geplant Q3-2026'
  },
  {
    key: 'lead',
    title: 'Lead-Factory',
    desc: 'Qualifizierte Leads aus deiner Zielgruppe. Outbound-Sequencing, Reply-Handling, Routing.',
    icon: Users,
    status: 'konzept',
    eta: 'Konzept'
  },
  {
    key: 'content',
    title: 'Content-Factory',
    desc: 'Posts, Newsletter, Blog-Drafts in deiner Brand-Stimme. Self-Service-SaaS-Variante.',
    icon: FileText,
    status: 'konzept',
    eta: 'Konzept'
  }
];

export default function SaaSDashboard() {
  const { me } = useAuth();
  const [credits, setCredits] = useState<CreditsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api<{ ok: boolean; credits: CreditsSnapshot }>('/api/me/credits')
      .then(r => setCredits(r.credits ?? { balance: 0, lifetime_earned: 0 }))
      .catch(() => setCredits({ balance: 0, lifetime_earned: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  if (!me) return null;
  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="md" /></div>;
  }

  return (
    <div className="space-y-12">
      {/* Hero */}
      <header>
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-3 uppercase tracking-wider font-semibold">
          <Sparkles size={12} /> AEVUM SaaS-Tools
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          {me.account.name || 'Operator'}
        </h1>
        <p className="text-ink-400 mt-2 text-sm sm:text-base">
          Self-Service-Factories für die wichtigsten Geschäfts-Bausteine.
        </p>
      </header>

      {/* Verfuegbar (leer initial) */}
      <section className="animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Verfügbar</h2>
            <p className="text-xs text-ink-400 mt-0.5">Tools, die du jetzt direkt nutzen kannst.</p>
          </div>
        </div>
        <div className="card-premium p-8 text-center">
          <Wrench size={28} className="mx-auto mb-3 text-ink-500" strokeWidth={1.5} />
          <div className="text-sm text-ink-300 mb-1">Erste Factory in Vorbereitung.</div>
          <div className="text-[0.7rem] text-ink-500">
            Script-Factory startet als erstes — sobald live, erscheint sie hier.
          </div>
        </div>
      </section>

      {/* Coming Soon Factories */}
      <section className="animate-fade-up" style={{ animationDelay: '280ms' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Coming Soon</h2>
            <p className="text-xs text-ink-400 mt-0.5">Factory-Slots in Planung & Konzept.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {FACTORY_SLOTS.map((slot, i) => (
            <FactoryCard
              key={slot.key}
              slot={slot}
              i={i}
              onClick={() => showToast(`${slot.title} — bald verfügbar`)}
            />
          ))}
        </div>
      </section>

      {/* Credits */}
      <section className="animate-fade-up" style={{ animationDelay: '380ms' }}>
        <div className="card-premium p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0">
                <Coins size={22} className="text-gold-300" />
              </div>
              <div>
                <div className="text-[0.6rem] uppercase tracking-[0.3em] text-gold-400/70 mb-1">Dein Credit-Konto</div>
                <div className="text-3xl font-bold text-gold-gradient tabular-nums leading-none">
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="card-premium px-5 py-3 text-sm text-ink-100 flex items-center gap-2">
            <Clock size={14} className="text-gold-300" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function FactoryCard({
  slot, i, onClick
}: { slot: FactorySlot; i: number; onClick: () => void }) {
  const Icon = slot.icon;
  const badgeColor: Record<FactoryStatus, string> = {
    in_bau: 'bg-gold-400/15 border-gold-400/30 text-gold-200',
    geplant: 'bg-emerald-400/10 border-emerald-400/25 text-emerald-200',
    konzept: 'bg-white/[0.04] border-white/10 text-ink-300'
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left card-premium p-5 group transition opacity-60 hover:opacity-80 animate-fade-up relative overflow-hidden"
      style={{ ...stagger(i, 60, 60), borderStyle: 'dashed' }}
    >
      <div className="absolute top-3 right-3">
        <span className={`text-[0.55rem] uppercase tracking-wider font-semibold px-2 py-1 rounded-full border ${badgeColor[slot.status]}`}>
          {slot.eta}
        </span>
      </div>
      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center mb-4">
        <Icon size={18} className="text-gold-300" strokeWidth={1.6} />
      </div>
      <div className="text-base font-semibold text-white mb-1.5">{slot.title}</div>
      <div className="text-[0.72rem] text-ink-400 leading-relaxed pr-12">{slot.desc}</div>
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[0.65rem] text-ink-500 inline-flex items-center gap-1">
          <Zap size={11} /> Self-Service-SaaS
        </span>
        <ArrowRight size={12} className="text-ink-500 group-hover:text-gold-300 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}
