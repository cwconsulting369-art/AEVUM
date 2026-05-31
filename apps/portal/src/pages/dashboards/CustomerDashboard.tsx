// Customer-Dashboard — fuer Vollkunden (account_type='customer', has_agent_access=true).
// Original Dashboard-Layout: Projekte, Onboarding-Checkliste, Status, Agent.
// Project-Detail mit Quicklinks/Docs/Agent ist nur fuer diese User-Klasse erreichbar.

import { useAuth } from '@/lib/auth';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FolderGit2, Activity, Bot, CheckCircle2, Circle, ArrowRight, Sparkles, TrendingUp, Send } from 'lucide-react';
import { stagger } from '@/lib/animations';

// Account-Slug → Telegram-Bot-Username Mapping (Fallback wenn contact_data.bot_username fehlt)
const BOT_USERNAME_MAP: Record<string, string> = {
  carlos: 'aevumsystem_bot',
  ketolabs: 'ketolabsbot',
  'patrick-roth': 'thailandre_bot',
  goldtradersociety: 'goldtradersociety_bot'
};

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const { me } = useAuth();
  if (!me) return null;

  const completedSteps = [
    !!me.profile?.industry,
    !!me.permissions?.consent_date,
    me.projects.length > 0
  ];
  const progress = Math.round((completedSteps.filter(Boolean).length / completedSteps.length) * 100);

  return (
    <div className="dashboard-stack @container">
      {/* Hero header — compact on desktop */}
      <header>
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-2 uppercase tracking-wider font-semibold">
          <Sparkles size={12} /> {t('dashboards.customer.welcomeBack')}
        </div>
        <h1 className="text-2xl sm:text-3xl xl:text-3xl font-bold tracking-tight text-white">
          {me.account.name || t('dashboards.customer.operator')}
        </h1>
        <p className="text-ink-400 mt-1 text-sm">
          {t('dashboards.customer.osTagline')}
        </p>
      </header>

      {/* KPI Strip — dense grid auf Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--dashboard-gap)] items-stretch">
        <KpiCard
          i={0}
          icon={FolderGit2}
          label={t('dashboards.customer.kpiProjects')}
          value={me.projects.length.toString()}
          accent={me.projects.length > 0}
        />
        <KpiCard
          i={1}
          icon={Activity}
          label={t('dashboards.customer.kpiStatus')}
          value={me.account.status}
          accent={me.account.status === 'active'}
        />
        <KpiCard
          i={2}
          icon={Bot}
          label={t('dashboards.customer.kpiAgent')}
          value={me.agent?.deployment_status || '—'}
          accent={me.agent?.deployment_status === 'deployed'}
        />
        <KpiCard
          i={3}
          icon={TrendingUp}
          label={t('dashboards.customer.kpiOnboarding')}
          value={`${progress}%`}
          accent={progress === 100}
          highlight
        />
      </div>

      {/* Onboarding + Telegram-Hint — auf xl side-by-side fuer Viewport-Fit */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[var(--dashboard-gap)]">
        {/* Onboarding nimmt 2/3 */}
        <section className="card-premium card-pad animate-fade-up xl:col-span-2" style={{ animationDelay: '280ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">{t('dashboards.customer.onboardingTitle')}</h2>
              <p className="text-xs text-ink-400 mt-0.5">{t('dashboards.customer.onboardingSub')}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 sm:w-32 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gold-gradient transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gold-200 font-semibold tabular-nums w-9 text-right">{progress}%</span>
            </div>
          </div>
          <ul className="space-y-1.5">
            <ChecklistItem label={t('dashboards.customer.checkProfile')} done={!!me.profile?.industry} to="/profile" />
            <ChecklistItem label={t('dashboards.customer.checkPermissions')} done={!!me.permissions?.consent_date} to="/permissions" />
            <ChecklistItem label={t('dashboards.customer.checkProject')} done={me.projects.length > 0} to="/projects" />
          </ul>
        </section>

        {/* Telegram-Bot Hint — 1/3 auf xl */}
        <TelegramHintCard accountSlug={me.account.slug} botUsername={(me.account.contact_data as any)?.bot_username} />
      </div>

      {/* Projects — auto-fit-grid: passt sich Viewport an */}
      <section className="animate-fade-up" style={{ animationDelay: '360ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">{t('dashboards.customer.yourProjects')}</h2>
          <Link
            to="/projects"
            className="text-xs text-ink-300 hover:text-gold-300 transition inline-flex items-center gap-1"
          >
            {t('dashboards.customer.showAll')} <ArrowRight size={12} />
          </Link>
        </div>
        {me.projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="dashboard-grid">
            {me.projects.slice(0, 4).map((p, i) => (
              <Link
                key={p.id}
                to={`/projects/${p.slug}`}
                className="card-premium block card-compact group animate-fade-up"
                style={stagger(i, 50, 80)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate group-hover:text-gold-100 transition">{p.name}</div>
                    <div className="text-[0.7rem] text-ink-400 mt-0.5 font-mono">/{p.slug}</div>
                  </div>
                  <span className={`badge ${p.status === 'active' ? 'badge-emerald' : ''}`}>
                    <span className={`dot ${p.status === 'active' ? 'dot-ok' : 'dot-off'}`} />
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-[0.7rem] text-ink-400">{t('dashboards.customer.open')}</span>
                  <ArrowRight size={14} className="text-ink-500 group-hover:text-gold-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
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
    <div
      className="card-premium card-compact animate-fade-up h-full flex flex-col"
      style={stagger(i, 60, 60)}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon size={16} className={accent ? 'text-gold-300' : 'text-ink-400'} strokeWidth={1.8} />
        <span className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-400 font-semibold">{label}</span>
      </div>
      <div className={`mt-auto text-xl sm:text-2xl xl:text-2xl font-bold tracking-tight ${highlight ? 'text-gold-gradient' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function ChecklistItem({ label, done, to }: { label: string; done: boolean; to: string }) {
  const { t } = useTranslation();
  return (
    <li className="flex items-center gap-3 group">
      {done ? (
        <CheckCircle2 size={20} className="text-emerald-400 shrink-0" strokeWidth={1.8} />
      ) : (
        <Circle size={20} className="text-ink-600 shrink-0" strokeWidth={1.8} />
      )}
      <span className={done ? 'text-ink-400 line-through text-sm' : 'text-ink-100 text-sm'}>{label}</span>
      {!done && (
        <Link
          to={to}
          className="ml-auto text-[0.7rem] text-gold-300 hover:text-gold-200 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
        >
          {t('dashboards.customer.doIt')} <ArrowRight size={11} />
        </Link>
      )}
    </li>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="relative card-premium p-10 text-center overflow-hidden">
      <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto mb-4 opacity-70">
        <defs>
          <linearGradient id="empty-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0a458" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#a86d27" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <rect x="14" y="20" width="52" height="42" rx="6" fill="none" stroke="url(#empty-grad)" strokeWidth="1.5" strokeDasharray="3 4" />
        <path d="M14 30 L40 30" stroke="url(#empty-grad)" strokeWidth="1.5" />
        <circle cx="20" cy="25" r="1.5" fill="#e0a458" />
        <circle cx="26" cy="25" r="1.5" fill="#e0a458" opacity="0.6" />
        <path d="M30 46 L50 46 M30 52 L42 52" stroke="url(#empty-grad)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div className="text-sm text-ink-300 mb-4">{t('dashboards.customer.emptyNoProject')}</div>
      <Link to="/projects" className="btn-gold text-sm inline-flex">
        {t('dashboards.customer.startNow')} <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function TelegramHintCard({ accountSlug, botUsername }: { accountSlug: string; botUsername?: string }) {
  const { t } = useTranslation();
  const username = botUsername || BOT_USERNAME_MAP[accountSlug];
  if (!username) return null;
  const deepLink = `https://t.me/${username}?start=login`;
  return (
    <aside
      className="card-premium card-pad flex flex-col xl:flex-col sm:flex-row xl:items-start sm:items-center gap-4 animate-fade-up"
      style={{ animationDelay: '220ms' }}
    >
      <div className="shrink-0 size-10 rounded-xl bg-sky-500/10 border border-sky-400/20 grid place-items-center text-sky-300">
        <Send size={18} strokeWidth={1.7} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white">{t('dashboards.customer.telegramTitle')}</div>
        <p className="text-xs text-ink-400 mt-0.5">
          {t('dashboards.customer.telegramText')}
          <span className="text-ink-200"> @{username}</span>
        </p>
      </div>
      <a
        href={deepLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-gold text-xs inline-flex items-center gap-1.5 shrink-0 self-start xl:self-stretch sm:self-auto"
      >
        {t('dashboards.customer.openBot')} <ArrowRight size={12} />
      </a>
    </aside>
  );
}
