import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ShieldCheck, Megaphone, Share2, EyeOff, Save, Lock } from 'lucide-react';

const FLAGS = [
  { key: 'share_logo', labelKey: 'permissions.flagLogo' },
  { key: 'share_company_name', labelKey: 'permissions.flagCompanyName' },
  { key: 'share_industry', labelKey: 'permissions.flagIndustry' },
  { key: 'share_revenue_band', labelKey: 'permissions.flagRevenueBand' },
  { key: 'share_team_size', labelKey: 'permissions.flagTeamSize' },
  { key: 'share_kpis', labelKey: 'permissions.flagKpis' },
  { key: 'share_kpi_deltas', labelKey: 'permissions.flagKpiDeltas' },
  { key: 'share_case_study', labelKey: 'permissions.flagCaseStudy' },
  { key: 'share_testimonial_quote', labelKey: 'permissions.flagTestimonialQuote' },
  { key: 'share_video_testimonial', labelKey: 'permissions.flagVideoTestimonial' }
];
const CHANNELS = [
  { key: 'channel_website', labelKey: 'permissions.channelWebsite' },
  { key: 'channel_linkedin', labelKey: 'permissions.channelLinkedin' },
  { key: 'channel_pitchdeck', labelKey: 'permissions.channelPitchdeck' },
  { key: 'channel_internal_network', labelKey: 'permissions.channelInternalNetwork' }
];
const ANONYMIZE = [
  { key: 'anonymize_revenue', labelKey: 'permissions.anonRevenue' },
  { key: 'anonymize_industry_detail', labelKey: 'permissions.anonIndustryDetail' }
];

export default function Permissions() {
  const { t } = useTranslation();
  const { me, refresh } = useAuth();
  const [state, setState] = useState<Record<string, boolean>>({ ...(me?.permissions || {}) });
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const toggle = (k: string) => setState(s => ({ ...s, [k]: !s[k] }));

  const doSave = async () => {
    setSaving(true);
    setConfirm(false);
    try {
      const patch: Record<string, boolean> = {};
      for (const arr of [FLAGS, CHANNELS, ANONYMIZE]) {
        for (const f of arr) patch[f.key] = !!state[f.key];
      }
      await api('/api/me/permissions', { method: 'PATCH', body: JSON.stringify(patch) });
      toast.success(t('permissions.saved'));
      await refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('permissions.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="mb-10">
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-3 uppercase tracking-wider font-semibold">
          <ShieldCheck size={12} /> {t('permissions.eyebrow')}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{t('permissions.title')}</h1>
        <p className="text-ink-400 mt-2">{t('permissions.subtitle')}</p>
        {me?.permissions?.consent_date && (
          <div className="mt-4 inline-flex items-center gap-2 badge badge-gold">
            <Lock size={11} />
            {t('permissions.lastSigned', { date: new Date(me.permissions.consent_date).toLocaleString('de-DE') })}
          </div>
        )}
      </header>

      <div className="space-y-6 max-w-3xl">
        <Section title={t('permissions.sectionShow')} icon={Megaphone}>
          {FLAGS.map(f => <Toggle key={f.key} flag={f.key} label={t(f.labelKey)} on={!!state[f.key]} onToggle={toggle} />)}
        </Section>

        <Section title={t('permissions.sectionChannels')} icon={Share2}>
          {CHANNELS.map(f => <Toggle key={f.key} flag={f.key} label={t(f.labelKey)} on={!!state[f.key]} onToggle={toggle} />)}
        </Section>

        <Section title={t('permissions.sectionAnonymize')} icon={EyeOff}>
          {ANONYMIZE.map(f => <Toggle key={f.key} flag={f.key} label={t(f.labelKey)} on={!!state[f.key]} onToggle={toggle} />)}
        </Section>

        <div className="sticky bottom-4 z-10">
          <div className="glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-ink-300">
              {t('permissions.signNotice')}
            </div>
            <button disabled={saving} onClick={() => setConfirm(true)} className="btn-gold w-full sm:w-auto justify-center">
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-ink-950/50 border-t-ink-950 rounded-full animate-spin" />
                  {t('permissions.saving')}
                </>
              ) : (
                <>
                  <Save size={16} /> {t('permissions.saveSign')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-fade-in">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={() => setConfirm(false)} />
          <div className="relative glass rounded-2xl p-7 max-w-md w-full animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-gold-400/15 border border-gold-400/30 flex items-center justify-center mb-4">
              <ShieldCheck size={22} className="text-gold-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{t('permissions.confirmTitle')}</h3>
            <p className="text-sm text-ink-300 leading-relaxed">
              {t('permissions.confirmBody')}
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirm(false)} className="btn-ghost flex-1">{t('permissions.cancel')}</button>
              <button onClick={doSave} className="btn-gold flex-1">{t('permissions.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title, icon: Icon, children
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode
}) {
  return (
    <div className="card-premium p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
        <Icon size={14} className="text-gold-300" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h2>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Toggle({ flag, label, on, onToggle }: { flag: string; label: string; on: boolean; onToggle: (k: string) => void }) {
  return (
    <button
      onClick={() => onToggle(flag)}
      type="button"
      className="flex items-center justify-between w-full px-3 py-2.5 rounded-md hover:bg-white/[0.03] transition text-left group"
    >
      <span className={`text-sm transition ${on ? 'text-white' : 'text-ink-200'} group-hover:text-white`}>{label}</span>
      <span className="toggle-track" data-on={on ? 'true' : 'false'} aria-pressed={on}>
        <span className="toggle-thumb" />
      </span>
    </button>
  );
}
