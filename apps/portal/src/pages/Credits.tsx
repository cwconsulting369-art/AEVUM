import { useEffect, useState } from 'react';
import { Coins, Star, Gift, TrendingUp, Zap, Lock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '@/lib/api';
import Spinner from '@/components/Spinner';

interface CreditsData {
  balance: number;
  lifetime_earned: number;
  stamp_cards: StampCard[];
  recent_transactions: Transaction[];
}

interface StampCard {
  id: string;
  card_type: string;
  current_stamps: number;
  required_stamps: number;
  reward_description: string;
  is_complete: boolean;
}

interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'bonus' | 'refund';
  amount: number;
  note: string | null;
  created_at: string;
}

export default function Credits() {
  const [data, setData] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ ok: boolean; credits: CreditsData }>('/api/me/credits')
      .then(r => setData(r.credits))
      .catch(() => setData({
        balance: 0, lifetime_earned: 0,
        stamp_cards: [], recent_transactions: []
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Coins size={22} className="text-gold-300" />
          AEVUM Credits
        </h1>
        <p className="text-sm text-ink-400 mt-1">
          Dein Loyalitätssystem — für jede Zusammenarbeit wachsen deine Vorteile.
        </p>
      </div>

      {/* Balance card */}
      <div className="card-premium p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0">
          <Coins size={28} className="text-gold-300" />
        </div>
        <div className="flex-1">
          <div className="text-[0.6rem] uppercase tracking-[0.3em] text-gold-400/70 mb-1">Aktuelles Guthaben</div>
          <div className="text-5xl font-bold text-gold-gradient tabular-nums">
            {(data?.balance ?? 0).toLocaleString('de-DE')}
          </div>
          <div className="text-xs text-ink-400 mt-1">
            Credits · Gesamt verdient: {(data?.lifetime_earned ?? 0).toLocaleString('de-DE')} Credits
          </div>
        </div>
      </div>

      {/* How it works */}
      <section>
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap size={12} className="text-gold-300" /> Wie es funktioniert
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: TrendingUp,
              title: 'Credits verdienen',
              desc: 'Für jede abgeschlossene Maßnahme, pünktliche Zahlung oder Feedback erhältst du Credits automatisch gutgeschrieben.',
              color: 'text-emerald-300'
            },
            {
              icon: Star,
              title: 'Treuemarken sammeln',
              desc: 'Jede Zusammenarbeit bringt eine Marke auf deiner Treuekarte. Bei vollem Set wartet eine Belohnung.',
              color: 'text-gold-300'
            },
            {
              icon: Gift,
              title: 'Credits einlösen',
              desc: 'Nutze Credits für Rabatte auf Retainer, Bonus-Leistungen oder zusätzliche Analyse-Reports.',
              color: 'text-purple-300'
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card-premium p-5">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-3">
                <Icon size={16} className={color} />
              </div>
              <div className="text-sm font-semibold text-white mb-1">{title}</div>
              <div className="text-[0.7rem] text-ink-400 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stamp cards */}
      {(data?.stamp_cards?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Star size={12} className="text-gold-300" /> Treuekarten
          </h2>
          <div className="space-y-3">
            {data!.stamp_cards.map(card => (
              <StampCardRow key={card.id} card={card} />
            ))}
          </div>
        </section>
      )}

      {/* Credit rates */}
      <section>
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp size={12} className="text-gold-300" /> Wie Credits berechnet werden
        </h2>
        <div className="card-premium divide-y divide-white/5">
          {[
            { action: 'Audit abgeschlossen',           credits: '+50 Credits' },
            { action: 'Onboarding abgeschlossen',       credits: '+100 Credits' },
            { action: 'Pünktliche Zahlung (Monat)',     credits: '+20 Credits' },
            { action: 'Testimonial / Feedback gegeben', credits: '+150 Credits' },
            { action: 'Referral (Weiterempfehlung)',    credits: '+500 Credits' },
            { action: 'Retainer-Verlängerung (+3 Mo)',  credits: '+200 Credits' },
          ].map(({ action, credits }) => (
            <div key={action} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-ink-300">{action}</span>
              <span className="text-sm font-semibold text-gold-300 tabular-nums">{credits}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Redeem options */}
      <section>
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Gift size={12} className="text-gold-300" /> Einlösen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: '1 Monat Retainer −10%', cost: '500 Credits', available: true },
            { label: 'Bonus Analytics-Report',  cost: '300 Credits', available: true },
            { label: 'Extra Strategie-Call (30 Min)', cost: '400 Credits', available: true },
            { label: 'Priority Support (1 Mo)',   cost: '200 Credits', available: false },
          ].map(({ label, cost, available }) => (
            <div key={label} className={`card-premium p-4 flex items-center justify-between gap-4 ${!available ? 'opacity-50' : ''}`}>
              <div>
                <div className="text-sm font-medium text-white">{label}</div>
                <div className="text-[0.65rem] text-gold-400 mt-0.5">{cost}</div>
              </div>
              {available ? (
                <button className="btn-gold py-1.5 px-3 text-[0.65rem] tracking-wide shrink-0">
                  Einlösen
                </button>
              ) : (
                <div className="flex items-center gap-1 text-[0.65rem] text-ink-500 shrink-0">
                  <Lock size={11} /> Bald
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-[0.65rem] text-ink-500 mt-3">
          Einlösungen werden von deinem AEVUM-Ansprechpartner bestätigt.
          Credits verfallen nicht, sind nicht übertragbar und haben keinen Geldwert.
        </p>
      </section>

      {/* Recent transactions */}
      {(data?.recent_transactions?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-4">
            Letzte Transaktionen
          </h2>
          <div className="card-premium divide-y divide-white/5">
            {data!.recent_transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                <div className={`shrink-0 ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.amount > 0
                    ? <ArrowUpRight size={14} />
                    : <ArrowDownRight size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{tx.note || tx.type}</div>
                  <div className="text-[0.6rem] text-ink-500">
                    {new Date(tx.created_at).toLocaleDateString('de-DE')}
                  </div>
                </div>
                <div className={`text-sm font-bold tabular-nums shrink-0 ${tx.amount > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

function StampCardRow({ card }: { card: StampCard }) {
  const pct = Math.min(card.current_stamps / card.required_stamps, 1);

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-white capitalize">
          {card.card_type.replace(/-/g, ' ')}
        </div>
        <div className="text-[0.65rem] text-ink-400">
          {card.current_stamps} / {card.required_stamps}
        </div>
      </div>

      {/* Stamps */}
      <div className="flex gap-2 flex-wrap mb-3">
        {Array.from({ length: card.required_stamps }).map((_, i) => (
          <div
            key={i}
            className={[
              'w-7 h-7 rounded-full border flex items-center justify-center text-[0.6rem]',
              i < card.current_stamps
                ? 'bg-gold-400/20 border-gold-400/50 text-gold-300'
                : 'bg-white/[0.02] border-white/10 text-ink-600'
            ].join(' ')}
          >
            <Star size={12} fill={i < card.current_stamps ? 'currentColor' : 'none'} />
          </div>
        ))}
      </div>

      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gold-gradient transition-all duration-500"
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      <div className="text-[0.65rem] text-ink-400 mt-2">
        Belohnung: <span className="text-gold-300">{card.reward_description}</span>
      </div>
    </div>
  );
}
