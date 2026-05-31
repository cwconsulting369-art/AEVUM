// CustomerSwitcher — Operator-Zugang (client_zero): schnell in JEDES Kunden-Dashboard
// springen. Nur für Operator (client_zero) sichtbar. Nutzt die Manifest-Registry.
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { resolveCustomerOptions, getManifest } from '@/lib/manifests';

export default function CustomerSwitcher() {
  const { me } = useAuth();
  const nav = useNavigate();
  const { t } = useTranslation();
  if (!me?.account.client_zero) return null;
  const options = resolveCustomerOptions(me);
  if (options.length === 0) return null;
  return (
    <div className="inline-flex items-center gap-1.5 px-2 h-7 rounded-full border border-gold-400/25 bg-gold-400/10">
      <Users size={12} className="text-gold-300 shrink-0" />
      <select
        aria-label={t('nav.openCustomer')}
        className="bg-transparent text-[0.7rem] text-gold-200 font-medium outline-none cursor-pointer pr-1"
        value=""
        onChange={(e) => {
          const slug = e.target.value;
          if (!slug) return;
          const m = getManifest(slug);
          if (m) nav(`/projects/${m.project.slug}`);
        }}
      >
        <option value="" disabled className="bg-ink-900 text-ink-300">{t('nav.openCustomer')}</option>
        {options.map((o) => (
          <option key={o.slug} value={o.slug} className="bg-ink-900 text-ink-100">{o.label}</option>
        ))}
      </select>
    </div>
  );
}
