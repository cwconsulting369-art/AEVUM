import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { User, Building2, Users, Banknote, Eye, Save, Sparkles } from 'lucide-react';

const INDUSTRIES = ['real-estate','e-commerce','b2b-saas','consulting','agency','finance','healthcare','manufacturing','education','hospitality','energy-consulting','ai-systems','other'];
const TEAM_SIZES = ['1-5','6-20','21-100','101-500','500+'];
const REVENUE_BANDS = ['<100k','100k-1M','1M-10M','10M-100M','100M+'];

export default function Profile() {
  const { t } = useTranslation();
  const VISIBILITIES = [
    { value: 'private', label: t('profile.visPrivate') },
    { value: 'network', label: t('profile.visNetwork') },
    { value: 'public', label: t('profile.visPublic') }
  ];
  const { me, refresh } = useAuth();
  const [form, setForm] = useState({
    display_name: me?.profile?.display_name || '',
    industry: me?.profile?.industry || '',
    team_size: me?.profile?.team_size || '',
    revenue_band: me?.profile?.revenue_band || '',
    vision: me?.profile?.vision || '',
    bio: me?.profile?.bio || '',
    visibility: me?.profile?.visibility || 'private'
  });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/me/profile', { method: 'PATCH', body: JSON.stringify(form) });
      toast.success(t('profile.saved'));
      await refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const completeness = (() => {
    const fields = [form.display_name, form.industry, form.team_size, form.revenue_band, form.vision, form.bio];
    const filled = fields.filter(v => v && v.length > 0).length;
    return Math.round((filled / fields.length) * 100);
  })();

  const initials = (form.display_name || me?.account.name || me?.account.email || '?')
    .split(/[\s@.]+/).filter(Boolean).map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      <header className="mb-10">
        <div className="flex items-center gap-2 text-xs text-gold-300 mb-3 uppercase tracking-wider font-semibold">
          <User size={12} /> {t('profile.eyebrow')}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{t('profile.title')}</h1>
        <p className="text-ink-400 mt-2">{t('profile.subtitle')}</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_22rem] gap-8">
        {/* FORM */}
        <form onSubmit={save} className="space-y-5">
          <Section title={t('profile.sectionIdentity')} icon={User}>
            <Field label={t('profile.fieldDisplayName')}>
              <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} className="input-premium" placeholder={t('profile.displayNamePlaceholder')} />
            </Field>
          </Section>

          <Section title={t('profile.sectionCompany')} icon={Building2}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t('profile.fieldIndustry')}>
                <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="input-premium">
                  <option value="">{t('profile.selectPlaceholder')}</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label={t('profile.fieldTeamSize')}>
                <select value={form.team_size} onChange={e => setForm({ ...form, team_size: e.target.value })} className="input-premium">
                  <option value="">{t('profile.selectPlaceholder')}</option>
                  {TEAM_SIZES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
            </div>
            <Field label={t('profile.fieldRevenue')} icon={Banknote}>
              <select value={form.revenue_band} onChange={e => setForm({ ...form, revenue_band: e.target.value })} className="input-premium">
                <option value="">{t('profile.selectPlaceholder')}</option>
                {REVENUE_BANDS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
          </Section>

          <Section title={t('profile.sectionVisionBio')} icon={Sparkles}>
            <Field label={t('profile.fieldVision')}>
              <textarea value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} rows={3} className="input-premium resize-none" placeholder={t('profile.visionPlaceholder')} />
            </Field>
            <Field label={t('profile.fieldBio')}>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} className="input-premium resize-none" placeholder={t('profile.bioPlaceholder')} />
            </Field>
          </Section>

          <Section title={t('profile.sectionVisibility')} icon={Eye}>
            <Field label={t('profile.fieldVisibility')}>
              <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })} className="input-premium">
                {VISIBILITIES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </Field>
          </Section>

          <div className="pt-2">
            <button disabled={saving} className="btn-gold w-full sm:w-auto justify-center">
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-ink-950/50 border-t-ink-950 rounded-full animate-spin" />
                  {t('profile.saving')}
                </>
              ) : (
                <>
                  <Save size={16} /> {t('profile.save')}
                </>
              )}
            </button>
          </div>
        </form>

        {/* PREVIEW */}
        <aside className="lg:sticky lg:top-24 self-start space-y-4">
          <div className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-400 font-semibold flex items-center gap-2">
            <Eye size={11} /> {t('profile.livePreview')}
          </div>
          <div className="card-premium p-6 noise-overlay relative overflow-hidden">
            <div className="relative">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-gold-gradient flex items-center justify-center text-lg font-bold text-ink-950 shadow-glow-gold">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white truncate">{form.display_name || me?.account.name || t('profile.displayNameFallback')}</div>
                  <div className="text-xs text-ink-400 truncate break-all">{me?.account.email}</div>
                </div>
              </div>

              <div className="divider mb-4" />

              <div className="space-y-2.5 text-xs">
                <PreviewRow label={t('profile.previewIndustry')} value={form.industry} />
                <PreviewRow label={t('profile.previewTeam')} value={form.team_size} />
                <PreviewRow label={t('profile.previewRevenue')} value={form.revenue_band} />
                <PreviewRow label={t('profile.previewVisible')} value={form.visibility} />
              </div>

              {form.vision && (
                <>
                  <div className="divider my-4" />
                  <div className="text-[0.65rem] uppercase tracking-wider text-ink-400 mb-1.5">{t('profile.previewVision')}</div>
                  <div className="text-xs text-ink-200 leading-relaxed">{form.vision.slice(0, 120)}{form.vision.length > 120 && '…'}</div>
                </>
              )}
            </div>
          </div>

          {/* Completeness */}
          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-ink-300">{t('profile.completeness')}</span>
              <span className="text-xs font-semibold text-gold-200 tabular-nums">{completeness}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-gold-gradient transition-all duration-700" style={{ width: `${completeness}%` }} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title, icon: Icon, children
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  children: React.ReactNode
}) {
  return (
    <fieldset className="card-premium p-5 sm:p-6 space-y-4">
      <legend className="px-2 -ml-2 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-ink-300 font-semibold">
        {Icon && <Icon size={12} className="text-gold-300" />} {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, children }: {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1.5 text-ink-200">{label}</span>
      {children}
    </label>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-ink-400">{label}</span>
      <span className={value ? 'text-ink-100 font-medium' : 'text-ink-500 italic'}>{value || '—'}</span>
    </div>
  );
}
