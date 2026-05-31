// WebsiteSection — Website-Bereich eines Kunden: Site-Status + Referral-System.
// Referral gehört zur WEBSITE (nicht zum Funnel): Referrer anlegen + echte
// Tracking-Links (api/referrals/r/CODE → redirect + click/visit/conversion-Tracking).
// Voll funktional gegen das live referralsRouter-Backend. (Site-Analytics folgt.)
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Globe, Users, Plus, Link2, Copy, Check, Gift, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import Spinner from '@/components/Spinner';

type Program = { id: string; name: string; status: string; referrer_reward_description?: string | null };
type Code = {
  id: string; code: string; referrer_name?: string | null; referrer_email?: string | null;
  active?: boolean; click_count?: number; uses_count?: number;
  qualified_count?: number; closed_won_count?: number; total_reward_earned_eur?: number;
};

export default function WebsiteSection({ siteUrl = 'leben-in-thailand.vercel.app' }: { siteUrl?: string }) {
  // Geteilter Reflink = Patricks EIGENE Domain (?ref wird von der Site getrackt),
  // NICHT die AEVUM-API-URL. Dynamisch pro Kunde via siteUrl.
  const refLink = (code: string) => `https://${siteUrl}/?ref=${code}`;
  const { t } = useTranslation();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const program = programs[0] || null;

  const loadCodes = async (programId: string) => {
    try {
      const r = await api<{ ok?: boolean; codes?: Code[] }>(`/api/referrals/me/programs/${programId}/codes`);
      setCodes(Array.isArray(r.codes) ? r.codes : []);
    } catch { setCodes([]); }
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await api<{ ok?: boolean; programs?: Program[] }>(`/api/referrals/me/programs`);
      const progs = Array.isArray(r.programs) ? r.programs : [];
      setPrograms(progs);
      if (progs[0]) await loadCodes(progs[0].id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.webRefLoadFailed'));
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const createReferrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !name.trim()) return;
    setCreating(true);
    try {
      await api(`/api/referrals/me/programs/${program.id}/codes`, {
        method: 'POST',
        body: JSON.stringify({ referrer_name: name.trim(), referrer_email: email.trim() || null }),
      });
      toast.success(t('dashboards.funnel.webRefCreated', { name: name.trim() }));
      setName(''); setEmail('');
      await loadCodes(program.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('dashboards.funnel.webRefCreateFailed'));
    } finally { setCreating(false); }
  };

  const copyLink = (code: string) => {
    const link = refLink(code);
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(code); setTimeout(() => setCopied(null), 1800);
    }).catch(() => {});
  };

  return (
    <div className="space-y-4">
      {/* Site-Status */}
      <div className="card-premium p-5">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-emerald-300"><Globe size={17} /></span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white flex items-center gap-2">{siteUrl}
              <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300">{t('dashboards.funnel.webLive')}</span></div>
            <a href={`https://${siteUrl}`} target="_blank" rel="noopener noreferrer" className="text-[0.7rem] text-ink-400 hover:text-gold-300 inline-flex items-center gap-1">{t('dashboards.funnel.webOpenSite')} <ExternalLink size={10} /></a>
          </div>
        </div>
        <p className="text-[0.65rem] text-ink-500 mt-3">{t('dashboards.funnel.webAnalyticsSoon')}</p>
      </div>

      {/* Referral-System */}
      <div className="card-premium p-5">
        <div className="flex items-center gap-2 mb-1"><Gift size={15} className="text-gold-300" />
          <h3 className="text-sm font-semibold text-white">{t('dashboards.funnel.webRefTitle')}</h3></div>
        {loading ? (
          <div className="py-8 flex justify-center"><Spinner size="md" /></div>
        ) : !program ? (
          <p className="text-xs text-ink-400 mt-2">{t('dashboards.funnel.webRefNoProgram')}</p>
        ) : (
          <>
            {program.referrer_reward_description && (
              <div className="mt-2 mb-4 text-xs text-ink-200 bg-gold-400/5 border border-gold-400/15 rounded-lg px-3 py-2">
                <span className="text-gold-300 font-semibold">{t('dashboards.funnel.webRefReward')}:</span> {program.referrer_reward_description}
              </div>
            )}

            {/* Referrer anlegen */}
            <form onSubmit={createReferrer} className="flex flex-wrap gap-2 items-end mb-4">
              <div className="flex-1 min-w-[140px]">
                <label className="text-[0.6rem] uppercase tracking-wider text-ink-400">{t('dashboards.funnel.webRefName')}</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder={t('dashboards.funnel.webRefNamePlaceholder')} className="input-premium text-sm w-full mt-0.5" />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-[0.6rem] uppercase tracking-wider text-ink-400">{t('dashboards.funnel.webRefEmail')}</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="optional" className="input-premium text-sm w-full mt-0.5" />
              </div>
              <button disabled={creating || !name.trim()} className="btn-gold text-sm"><Plus size={13} /> {t('dashboards.funnel.webRefCreate')}</button>
            </form>

            {/* Referrer-Liste mit Tracking-Links + echten Stats */}
            {codes.length === 0 ? (
              <p className="text-xs text-ink-400">{t('dashboards.funnel.webRefNoCodes')}</p>
            ) : (
              <div className="space-y-2">
                {codes.map(c => {
                  const link = refLink(c.code);
                  return (
                    <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-ink-300"><Users size={12} /></span>
                          <span className="text-sm font-medium text-white truncate">{c.referrer_name || c.code}</span>
                          <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-gold-400/10 text-gold-300">{c.code}</span>
                        </div>
                        <button onClick={() => copyLink(c.code)} className="text-[0.7rem] inline-flex items-center gap-1 text-ink-300 hover:text-gold-300">
                          {copied === c.code ? <><Check size={11} /> {t('dashboards.funnel.webRefCopied')}</> : <><Copy size={11} /> {t('dashboards.funnel.webRefCopyLink')}</>}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-[0.65rem] text-ink-400">
                        <Link2 size={11} className="shrink-0" />
                        <span className="font-mono truncate">{link}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 mt-2.5 pt-2.5 border-t border-white/5 text-center">
                        <div><div className="text-[0.55rem] uppercase tracking-wider text-ink-500">{t('dashboards.funnel.webRefClicks')}</div><div className="text-sm font-bold text-white">{c.click_count ?? 0}</div></div>
                        <div><div className="text-[0.55rem] uppercase tracking-wider text-ink-500">{t('dashboards.funnel.webRefLeads')}</div><div className="text-sm font-bold text-white">{c.uses_count ?? 0}</div></div>
                        <div><div className="text-[0.55rem] uppercase tracking-wider text-ink-500">{t('dashboards.funnel.webRefConv')}</div><div className="text-sm font-bold text-white">{c.closed_won_count ?? 0}</div></div>
                        <div><div className="text-[0.55rem] uppercase tracking-wider text-ink-500">{t('dashboards.funnel.webRefEarned')}</div><div className="text-sm font-bold text-gold-300">€{c.total_reward_earned_eur ?? 0}</div></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
