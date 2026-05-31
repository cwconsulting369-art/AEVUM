import { useEffect, useState } from 'react';
import { Coins, Star, Gift, TrendingUp, Zap, Lock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [data, setData] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ ok: boolean; credits: CreditsData }>('/api/credits')
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
          {t('credits.title')}
        </h1>
        <p className="text-sm text-ink-400 mt-1">
          {t('credits.subtitle')}
        </p>
      </div>

      {/* Balance card */}
      <div className="card-premium p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0">
          <Coins size={28} className="text-gold-300" />
        </div>
        <div className="flex-1">
          <div className="text-[0.6rem] uppercase tracking-[0.3em] text-gold-400/70 mb-1">{t('credits.currentBalance')}</div>
          <div className="text-5xl font-bold text-gold-gradient tabular-nums">
            {(data?.balance ?? 0).toLocaleString('de-DE')}
          </div>
          <div className="text-xs text-ink-400 mt-1">
            {t('credits.balanceFooter', { lifetime: (data?.lifetime_earned ?? 0).toLocaleString('de-DE') })}
          </div>
        </div>
      </div>

      {/* How it works */}
      <section>
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap size={12} className="text-gold-300" /> {t('credits.howItWorks')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: TrendingUp,
              title: t('credits.earnTitle'),
              desc: t('credits.earnDesc'),
              color: 'text-emerald-300'
            },
            {
              icon: Star,
              title: t('credits.stampsTitle'),
              desc: t('credits.stampsDesc'),
              color: 'text-gold-300'
            },
            {
              icon: Gift,
              title: t('credits.redeemTitle'),
              desc: t('credits.redeemDesc'),
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
            <Star size={12} className="text-gold-300" /> {t('credits.loyaltyCards')}
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
          <TrendingUp size={12} className="text-gold-300" /> {t('credits.howCalculated')}
        </h2>
        <div className="card-premium divide-y divide-white/5">
          {[
            { action: t('credits.rateAudit'),       credits: t('credits.creditsUnit', { n: '+50' }) },
            { action: t('credits.rateOnboarding'),  credits: t('credits.creditsUnit', { n: '+100' }) },
            { action: t('credits.ratePayment'),     credits: t('credits.creditsUnit', { n: '+20' }) },
            { action: t('credits.rateTestimonial'), credits: t('credits.creditsUnit', { n: '+150' }) },
            { action: t('credits.rateReferral'),    credits: t('credits.creditsUnit', { n: '+500' }) },
            { action: t('credits.rateRenewal'),     credits: t('credits.creditsUnit', { n: '+200' }) },
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
          <Gift size={12} className="text-gold-300" /> {t('credits.redeemHeading')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: t('credits.redeemRetainer'), cost: t('credits.costCredits', { n: '500' }), available: true },
            { label: t('credits.redeemReport'),   cost: t('credits.costCredits', { n: '300' }), available: true },
            { label: t('credits.redeemCall'),     cost: t('credits.costCredits', { n: '400' }), available: true },
            { label: t('credits.redeemPriority'), cost: t('credits.costCredits', { n: '200' }), available: false },
          ].map(({ label, cost, available }) => (
            <div key={label} className={`card-premium p-4 flex items-center justify-between gap-4 ${!available ? 'opacity-50' : ''}`}>
              <div>
                <div className="text-sm font-medium text-white">{label}</div>
                <div className="text-[0.65rem] text-gold-400 mt-0.5">{cost}</div>
              </div>
              {available ? (
                <button className="btn-gold py-1.5 px-3 text-[0.65rem] tracking-wide shrink-0">
                  {t('credits.redeemButton')}
                </button>
              ) : (
                <div className="flex items-center gap-1 text-[0.65rem] text-ink-500 shrink-0">
                  <Lock size={11} /> {t('credits.soon')}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-[0.65rem] text-ink-500 mt-3">
          {t('credits.redeemFooter')}
        </p>
      </section>

      {/* Recent transactions */}
      {(data?.recent_transactions?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-4">
            {t('credits.recentTransactions')}
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
  const { t } = useTranslation();
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
        {t('credits.rewardPrefix')}<span className="text-gold-300">{card.reward_description}</span>
      </div>
    </div>
  );
}
