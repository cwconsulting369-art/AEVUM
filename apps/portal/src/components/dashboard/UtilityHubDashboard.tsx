// UtilityHub Dashboard — Mirror der UH-Admin-Sicht im AEVUM-Portal
// Block C der UH-Endstufe (2026-05-26)
//
// Long-term move: Miguel arbeitet im AEVUM-Portal, nicht mehr utility-hub.one/app/*

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import Spinner from '@/components/Spinner';
import { useNavigate, useParams } from 'react-router';
import {
  Building2, Users, Download, Zap, ExternalLink, Search,
  CheckCircle2, Clock, AlertCircle, Building, FileText,
  Briefcase, Database, BookOpen, KeyRound, BarChart3, Phone, Mail, ArrowLeft
} from 'lucide-react';
import { stagger } from '@/lib/animations';

type Overview = {
  ok: boolean;
  kpis: {
    customers_total: number;
    orgs_total: number;
    teleson_records_total: number;
    imports_total: number;
    last_import: { status: string; rows: number } | null;
  };
  recent_imports: Array<{ id: string; status: string; total_rows: number }>;
};

type Customer = {
  id: string; full_name: string; email: string | null; phone: string | null;
  address: string | null; city: string | null; postal_code: string | null;
  status: string; source: string | null; object_type: string | null; created_at: string;
};

type ImportBatch = {
  id: string; source: string; filename: string | null;
  total_rows: number; processed_rows: number; error_rows: number;
  status: string; created_at: string; completed_at: string | null;
};

type TelesonRecord = {
  id: string; customer_id: string; energie: string | null; status: string | null;
  neuer_versorger: string | null; neu_ap: string | null;
  belieferungsdatum: string | null; gebunden_bis: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  active: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
  inactive: 'text-ink-300 bg-white/5 border-white/10',
  blocked: 'text-rose-300 bg-rose-500/10 border-rose-500/25',
  done: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
  pending: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/25',
  failed: 'text-rose-300 bg-rose-500/10 border-rose-500/25',
};

const OBJ_LABEL: Record<string, string> = {
  weg: 'WEG', mfh: 'MFH', efh: 'EFH', gewerbe: 'Gewerbe', sonstige: 'Sonstige'
};

function statusBadge(s: string | null | undefined) {
  const k = (s || 'inactive').toLowerCase();
  return `inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.65rem] border ${STATUS_COLOR[k] || STATUS_COLOR.inactive}`;
}

// ── Overview Section ──────────────────────────────────────────

function OverviewSection({ slug }: { slug: string }) {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api<Overview>(`/api/me/projects/${slug}/uh/overview`)
      .then(d => { if (active) setData(d); })
      .catch(e => toast.error(e?.message || 'Laden fehlgeschlagen'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) return <div className="card-premium p-12 flex justify-center"><Spinner size="md" /></div>;
  if (!data?.ok) return <div className="card-premium p-8 text-sm text-ink-400">UH-Daten nicht erreichbar.</div>;

  const cards = [
    { icon: Building2, label: 'Kunden / Lieferstellen', value: data.kpis.customers_total, color: 'text-blue-300' },
    { icon: Building, label: 'Organisationen', value: data.kpis.orgs_total, color: 'text-purple-300' },
    { icon: Zap, label: 'Teleson-Verträge', value: data.kpis.teleson_records_total, color: 'text-yellow-300' },
    { icon: Download, label: 'Imports', value: data.kpis.imports_total, color: 'text-emerald-300' },
  ];

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <Zap size={16} className="text-gold-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">UtilityHub Dashboard</h1>
          <p className="text-xs text-ink-400 mt-0.5">Energie-Daten-Hub · live aus UH-Supabase</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={c.label} className="card-premium p-5 animate-fade-up" style={stagger(i, 60, 60)}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.65rem] uppercase tracking-wider text-ink-400 font-semibold">{c.label}</span>
              <c.icon size={14} className={c.color} />
            </div>
            <div className="text-3xl font-bold text-white">{c.value.toLocaleString('de-DE')}</div>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Download size={12} className="text-gold-300" /> Letzte Imports
        </h2>
        <div className="card-premium p-4 space-y-2">
          {data.recent_imports.length === 0 && <div className="text-sm text-ink-400 py-4 text-center">Noch keine Imports.</div>}
          {data.recent_imports.map(b => (
            <div key={b.id} className="flex items-center justify-between gap-4 px-2 py-2 rounded-md hover:bg-white/5 transition">
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">{b.total_rows} Rows</div>
                <div className="text-xs text-ink-400 font-mono truncate">{b.id.slice(0, 8)}…</div>
              </div>
              <span className={statusBadge(b.status)}>
                {b.status === 'done' ? <CheckCircle2 size={11} /> : b.status === 'pending' ? <Clock size={11} /> : <AlertCircle size={11} />}
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="card-premium p-4 text-xs text-ink-400 flex items-center justify-between gap-4 flex-wrap">
        <span>Du arbeitest jetzt im AEVUM-Portal. UH-Admin auf <code className="bg-white/5 px-1.5 py-0.5 rounded">utility-hub.one/app/*</code> bleibt parallel verfügbar.</span>
        <a href="https://utility-hub.one/app/dashboard" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-gold-300 hover:text-gold-200 shrink-0">
          Legacy-UI <ExternalLink size={11} />
        </a>
      </div>
    </>
  );
}

// ── Customers Section ──────────────────────────────────────────

function CustomersSection({ slug }: { slug: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    const q = search ? `&q=${encodeURIComponent(search)}` : '';
    api<{ ok: boolean; customers: Customer[]; total: number | null }>(`/api/me/projects/${slug}/uh/customers?limit=50${q}`)
      .then(d => { if (active) { setCustomers(d.customers); setTotal(d.total); } })
      .catch(e => toast.error(e?.message || 'Laden fehlgeschlagen'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, search]);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <Users size={16} className="text-gold-300" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Kunden / Lieferstellen</h1>
          <p className="text-xs text-ink-400 mt-0.5">{total !== null ? `${total} Einträge` : 'Lade …'}</p>
        </div>
      </div>

      <div className="card-premium p-4 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            placeholder="Name, Email oder Stadt suchen…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-premium pl-9 w-full"
            aria-label="Kunden durchsuchen"
          />
        </div>
      </div>

      {loading ? (
        <div className="card-premium p-12 flex justify-center"><Spinner size="md" /></div>
      ) : customers.length === 0 ? (
        <div className="card-premium p-12 text-center text-sm text-ink-400">Keine Treffer.</div>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.7rem] uppercase tracking-wider text-ink-400 border-b border-white/10">
                  <th className="px-4 py-3 font-semibold">Lieferstelle</th>
                  <th className="px-4 py-3 font-semibold">Adresse</th>
                  <th className="px-4 py-3 font-semibold">Typ</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Quelle</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => { window.location.href = `/projects/${slug}?s=customers&id=${c.id}`; }}
                    className="border-b border-white/5 hover:bg-white/[0.04] cursor-pointer animate-fade-up"
                    style={stagger(i, 30, 30)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{c.full_name}</div>
                      {c.email && <div className="text-xs text-ink-400 mt-0.5">{c.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-ink-200 text-xs">
                      {c.address}{c.city ? `, ${c.postal_code || ''} ${c.city}` : ''}
                    </td>
                    <td className="px-4 py-3"><span className="badge">{OBJ_LABEL[c.object_type || ''] || c.object_type || '–'}</span></td>
                    <td className="px-4 py-3"><span className={statusBadge(c.status)}>{c.status}</span></td>
                    <td className="px-4 py-3 text-xs text-ink-400">{c.source || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// ── Imports Section ──────────────────────────────────────────

function ImportsSection({ slug }: { slug: string }) {
  const [imports, setImports] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api<{ ok: boolean; imports: ImportBatch[] }>(`/api/me/projects/${slug}/uh/imports?limit=50`)
      .then(d => { if (active) setImports(d.imports); })
      .catch(e => toast.error(e?.message || 'Laden fehlgeschlagen'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <Download size={16} className="text-gold-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Imports</h1>
          <p className="text-xs text-ink-400 mt-0.5">CSV + Airtable + Notion Sync-Batches</p>
        </div>
      </div>

      {loading ? (
        <div className="card-premium p-12 flex justify-center"><Spinner size="md" /></div>
      ) : imports.length === 0 ? (
        <div className="card-premium p-12 text-center text-sm text-ink-400">Noch keine Imports.</div>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.7rem] uppercase tracking-wider text-ink-400 border-b border-white/10">
                  <th className="px-4 py-3 font-semibold">Quelle</th>
                  <th className="px-4 py-3 font-semibold">Rows</th>
                  <th className="px-4 py-3 font-semibold">Errors</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Gestartet</th>
                </tr>
              </thead>
              <tbody>
                {imports.map((b, i) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02] animate-fade-up" style={stagger(i, 30, 30)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{b.source}</div>
                      {b.filename && <div className="text-xs text-ink-400 mt-0.5 font-mono">{b.filename}</div>}
                    </td>
                    <td className="px-4 py-3 text-white">{b.total_rows}</td>
                    <td className="px-4 py-3"><span className={b.error_rows > 0 ? 'text-rose-300' : 'text-ink-400'}>{b.error_rows}</span></td>
                    <td className="px-4 py-3"><span className={statusBadge(b.status)}>{b.status}</span></td>
                    <td className="px-4 py-3 text-xs text-ink-400">{new Date(b.created_at).toLocaleString('de-DE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// ── Teleson (FG Finanz) Section ──────────────────────────────────────────

function TelesonSection({ slug }: { slug: string }) {
  const [records, setRecords] = useState<TelesonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    api<{ ok: boolean; records: TelesonRecord[]; total: number | null }>(`/api/me/projects/${slug}/uh/teleson?limit=100`)
      .then(d => { if (active) { setRecords(d.records); setTotal(d.total); } })
      .catch(e => toast.error(e?.message || 'Laden fehlgeschlagen'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <Zap size={16} className="text-gold-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">FG Finanz / Provisionen</h1>
          <p className="text-xs text-ink-400 mt-0.5">{total !== null ? `${total} Verträge` : 'Lade …'}</p>
        </div>
      </div>

      {loading ? (
        <div className="card-premium p-12 flex justify-center"><Spinner size="md" /></div>
      ) : records.length === 0 ? (
        <div className="card-premium p-12 text-center text-sm text-ink-400">Noch keine Teleson-Records.</div>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.7rem] uppercase tracking-wider text-ink-400 border-b border-white/10">
                  <th className="px-4 py-3 font-semibold">Energie</th>
                  <th className="px-4 py-3 font-semibold">Versorger</th>
                  <th className="px-4 py-3 font-semibold">AP</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Belieferung</th>
                  <th className="px-4 py-3 font-semibold">Gebunden bis</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] animate-fade-up" style={stagger(i, 30, 30)}>
                    <td className="px-4 py-3 font-medium text-white">{r.energie || '–'}</td>
                    <td className="px-4 py-3 text-ink-200">{r.neuer_versorger || '–'}</td>
                    <td className="px-4 py-3 text-ink-200">{r.neu_ap || '–'}</td>
                    <td className="px-4 py-3"><span className={statusBadge(r.status)}>{r.status || '–'}</span></td>
                    <td className="px-4 py-3 text-xs text-ink-400">{r.belieferungsdatum || '–'}</td>
                    <td className="px-4 py-3 text-xs text-ink-400">{r.gebunden_bis || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// ── Settings Section ──────────────────────────────────────────

function SettingsSection({ slug }: { slug: string }) {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <FileText size={16} className="text-gold-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">UH-Settings</h1>
          <p className="text-xs text-ink-400 mt-0.5">Integrations und Sync-Konfiguration</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {[
          { name: 'Close.com', desc: 'Read-only Leads-Sync (alle 15 min)', status: 'Bald verfügbar' },
          { name: 'Airtable', desc: 'Live-Mirror Records', status: 'Bald verfügbar' },
          { name: 'Notion', desc: 'Pages + DBs Live-Mirror', status: 'Bald verfügbar' },
          { name: 'Teleson', desc: 'CSV-Import-Pipeline', status: 'Aktiv' },
        ].map(int => (
          <div key={int.name} className="card-premium p-4">
            <div className="font-medium text-white text-sm">{int.name}</div>
            <div className="text-xs text-ink-400 mt-1 mb-3">{int.desc}</div>
            <span className={`badge ${int.status === 'Aktiv' ? 'badge-gold' : ''}`}>{int.status}</span>
          </div>
        ))}
      </div>

      <a href={`/projects/${slug}?s=apis`} className="block card-premium p-4 hover:bg-white/[0.02] transition">
        <div className="font-medium text-white text-sm">API-Keys verwalten</div>
        <div className="text-xs text-ink-400 mt-1">Close.com / Airtable / Notion Keys hier einreichen → AES-256-GCM verschlüsselt</div>
      </a>
    </>
  );
}

// ── Close.com Section ──────────────────────────────────────────

type CloseLead = {
  id: string; name: string; status: string | null;
  created_at: string; updated_at: string; url: string;
  contacts: Array<{ name: string; emails: string[]; phones: string[] }>;
};

function CloseSection({ slug }: { slug: string }) {
  const [leads, setLeads] = useState<CloseLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api<{ ok: boolean; leads?: CloseLead[]; error?: string; hint?: string; detail?: string }>(`/api/me/projects/${slug}/uh/close/leads?limit=30`)
      .then(d => {
        if (!active) return;
        if (d.ok && d.leads) { setLeads(d.leads); setError(null); }
        else setError(d.hint || d.detail || d.error || 'Verbindung fehlgeschlagen');
      })
      .catch(e => { if (active) setError(e?.message || 'Laden fehlgeschlagen'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <Briefcase size={16} className="text-gold-300" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Close.com Leads</h1>
          <p className="text-xs text-ink-400 mt-0.5">Live-Sync · Read-only · {leads.length} Leads sichtbar</p>
        </div>
      </div>

      {loading ? (
        <div className="card-premium p-12 flex justify-center"><Spinner size="md" /></div>
      ) : error ? (
        <div className="card-premium p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={18} className="text-yellow-300" />
            <h3 className="font-semibold text-white">Close.com nicht verbunden</h3>
          </div>
          <p className="text-sm text-ink-300 mb-4">{error}</p>
          <a href={`/projects/${slug}?s=apis`} className="inline-flex items-center gap-2 btn-gold text-sm">
            <KeyRound size={13} /> API-Key einreichen
          </a>
        </div>
      ) : leads.length === 0 ? (
        <div className="card-premium p-12 text-center text-sm text-ink-400">Keine Leads in Close.com.</div>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.7rem] uppercase tracking-wider text-ink-400 border-b border-white/10">
                  <th className="px-4 py-3 font-semibold">Lead</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Kontakt</th>
                  <th className="px-4 py-3 font-semibold">Geändert</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l, i) => (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.02] animate-fade-up" style={stagger(i, 30, 30)}>
                    <td className="px-4 py-3 font-medium text-white">{l.name}</td>
                    <td className="px-4 py-3"><span className="badge">{l.status || '–'}</span></td>
                    <td className="px-4 py-3 text-xs text-ink-300">
                      {l.contacts.slice(0, 1).map((c, j) => (
                        <div key={j}>
                          <div>{c.name}</div>
                          {c.emails[0] && <div className="text-ink-400">{c.emails[0]}</div>}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-400">{new Date(l.updated_at).toLocaleDateString('de-DE')}</td>
                    <td className="px-4 py-3">
                      <a href={l.url} target="_blank" rel="noopener" className="text-gold-300 hover:text-gold-200">
                        <ExternalLink size={13} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// ── Airtable Section ──────────────────────────────────────────

type AirtableRecord = { id: string; fields: Record<string, unknown>; created_at: string };

function AirtableSection({ slug }: { slug: string }) {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ base_id: string; table_name: string } | null>(null);

  useEffect(() => {
    let active = true;
    api<{ ok: boolean; records?: AirtableRecord[]; base_id?: string; table_name?: string; error?: string; hint?: string; detail?: string }>(`/api/me/projects/${slug}/uh/airtable/records?limit=30`)
      .then(d => {
        if (!active) return;
        if (d.ok && d.records) {
          setRecords(d.records);
          setMeta({ base_id: d.base_id || '', table_name: d.table_name || '' });
          setError(null);
        } else setError(d.hint || d.detail || d.error || 'Verbindung fehlgeschlagen');
      })
      .catch(e => { if (active) setError(e?.message || 'Laden fehlgeschlagen'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  const fieldKeys = records.length > 0 ? Object.keys(records[0].fields).slice(0, 5) : [];

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <Database size={16} className="text-gold-300" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Airtable Mirror</h1>
          <p className="text-xs text-ink-400 mt-0.5">
            {meta ? `${meta.base_id} · ${meta.table_name}` : 'Live-Mirror · Read-only · 1. Spalten sichtbar'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card-premium p-12 flex justify-center"><Spinner size="md" /></div>
      ) : error ? (
        <div className="card-premium p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={18} className="text-yellow-300" />
            <h3 className="font-semibold text-white">Airtable nicht verbunden</h3>
          </div>
          <p className="text-sm text-ink-300 mb-4">{error}</p>
          <p className="text-xs text-ink-400 mb-4">
            <strong>Setup:</strong> API-Keys → Service <code className="bg-white/5 px-1 rounded">airtable</code>, Label <code className="bg-white/5 px-1 rounded">appXXX/TableName</code>, Key = Personal Access Token.
          </p>
          <a href={`/projects/${slug}?s=apis`} className="inline-flex items-center gap-2 btn-gold text-sm">
            <KeyRound size={13} /> API-Key einreichen
          </a>
        </div>
      ) : records.length === 0 ? (
        <div className="card-premium p-12 text-center text-sm text-ink-400">Keine Records in Airtable-Tabelle.</div>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.7rem] uppercase tracking-wider text-ink-400 border-b border-white/10">
                  {fieldKeys.map(k => <th key={k} className="px-4 py-3 font-semibold">{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] animate-fade-up" style={stagger(i, 30, 30)}>
                    {fieldKeys.map(k => {
                      const v = r.fields[k];
                      const display = v === null || v === undefined ? '–'
                        : typeof v === 'object' ? JSON.stringify(v).slice(0, 80)
                        : String(v).slice(0, 80);
                      return <td key={k} className="px-4 py-3 text-ink-200 text-xs">{display}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// ── Notion Section ──────────────────────────────────────────

type NotionDatabase = { id: string; title: string; url: string; created_time: string; last_edited_time: string };

function NotionSection({ slug }: { slug: string }) {
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api<{ ok: boolean; databases?: NotionDatabase[]; error?: string; hint?: string; detail?: string }>(`/api/me/projects/${slug}/uh/notion/databases`)
      .then(d => {
        if (!active) return;
        if (d.ok && d.databases) { setDatabases(d.databases); setError(null); }
        else setError(d.hint || d.detail || d.error || 'Verbindung fehlgeschlagen');
      })
      .catch(e => { if (active) setError(e?.message || 'Laden fehlgeschlagen'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <BookOpen size={16} className="text-gold-300" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Notion Workspace</h1>
          <p className="text-xs text-ink-400 mt-0.5">Live-Mirror · {databases.length} Datenbanken sichtbar</p>
        </div>
      </div>

      {loading ? (
        <div className="card-premium p-12 flex justify-center"><Spinner size="md" /></div>
      ) : error ? (
        <div className="card-premium p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={18} className="text-yellow-300" />
            <h3 className="font-semibold text-white">Notion nicht verbunden</h3>
          </div>
          <p className="text-sm text-ink-300 mb-4">{error}</p>
          <p className="text-xs text-ink-400 mb-4">
            <strong>Setup:</strong> Notion → Settings → Connections → Internal-Integration anlegen → Token kopieren → hier als API-Key Service <code className="bg-white/5 px-1 rounded">notion</code> einreichen. Dann Notion-Pages für die Integration freigeben.
          </p>
          <a href={`/projects/${slug}?s=apis`} className="inline-flex items-center gap-2 btn-gold text-sm">
            <KeyRound size={13} /> API-Key einreichen
          </a>
        </div>
      ) : databases.length === 0 ? (
        <div className="card-premium p-12 text-center text-sm text-ink-400">
          Keine Datenbanken sichtbar. Notion-Pages müssen für die Integration freigegeben werden.
        </div>
      ) : (
        <div className="space-y-2">
          {databases.map((db, i) => (
            <a key={db.id} href={db.url} target="_blank" rel="noopener" className="card-premium p-4 flex items-center justify-between hover:bg-white/[0.02] transition animate-fade-up" style={stagger(i, 40, 40)}>
              <div className="min-w-0">
                <div className="font-medium text-white">{db.title}</div>
                <div className="text-xs text-ink-400 mt-1">Geändert: {new Date(db.last_edited_time).toLocaleDateString('de-DE')}</div>
              </div>
              <ExternalLink size={13} className="text-gold-300 shrink-0" />
            </a>
          ))}
        </div>
      )}
    </>
  );
}

// ── Customer-Detail Section ──────────────────────────────────

type CustomerDetail = {
  customer: Customer | null;
  identities: Array<{ id: string; identity_type: string; identity_value: string }>;
  teleson_records: TelesonRecord[];
  notes: Array<{ id: string; note: string; created_at: string; author?: string }>;
};

function CustomerDetailSection({ slug, customerId, onBack }: { slug: string; customerId: string; onBack: () => void }) {
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api<{ ok: boolean } & CustomerDetail>(`/api/me/projects/${slug}/uh/customers/${customerId}`)
      .then(d => { if (active) setData(d); })
      .catch(e => toast.error(e?.message || 'Laden fehlgeschlagen'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, customerId]);

  if (loading) return <div className="card-premium p-12 flex justify-center"><Spinner size="md" /></div>;
  if (!data?.customer) return (
    <div className="card-premium p-8">
      <button onClick={onBack} className="text-xs text-ink-400 hover:text-white mb-4 inline-flex items-center gap-1">
        <ArrowLeft size={11} /> Zurück zur Liste
      </button>
      <div className="text-sm text-ink-400">Lieferstelle nicht gefunden.</div>
    </div>
  );

  const c = data.customer;
  return (
    <>
      <button onClick={onBack} className="text-xs text-ink-400 hover:text-white mb-4 inline-flex items-center gap-1">
        <ArrowLeft size={11} /> Zurück zur Liste
      </button>

      <div className="card-premium p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">{c.full_name}</h1>
            <div className="text-sm text-ink-300">
              {c.address}{c.city ? `, ${c.postal_code || ''} ${c.city}` : ''}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className={statusBadge(c.status)}>{c.status}</span>
            <span className="badge">{OBJ_LABEL[c.object_type || ''] || c.object_type || '–'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {c.email && <div><span className="text-ink-400 text-xs uppercase tracking-wider">Email</span><div className="text-white">{c.email}</div></div>}
          {c.phone && <div><span className="text-ink-400 text-xs uppercase tracking-wider">Phone</span><div className="text-white">{c.phone}</div></div>}
          <div><span className="text-ink-400 text-xs uppercase tracking-wider">Quelle</span><div className="text-white">{c.source || '–'}</div></div>
          <div><span className="text-ink-400 text-xs uppercase tracking-wider">Angelegt</span><div className="text-white">{new Date(c.created_at).toLocaleDateString('de-DE')}</div></div>
        </div>
      </div>

      {data.identities.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Externe IDs ({data.identities.length})</h2>
          <div className="card-premium p-4 space-y-2">
            {data.identities.map(id => (
              <div key={id.id} className="flex justify-between text-sm">
                <span className="text-ink-400">{id.identity_type}</span>
                <span className="font-mono text-white">{id.identity_value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.teleson_records.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Teleson-Verträge ({data.teleson_records.length})</h2>
          <div className="card-premium overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.7rem] uppercase tracking-wider text-ink-400 border-b border-white/10">
                  <th className="px-4 py-3">Energie</th><th className="px-4 py-3">Versorger</th><th className="px-4 py-3">AP</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Belieferung</th>
                </tr>
              </thead>
              <tbody>
                {data.teleson_records.map(r => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="px-4 py-3 font-medium text-white">{r.energie || '–'}</td>
                    <td className="px-4 py-3 text-ink-200">{r.neuer_versorger || '–'}</td>
                    <td className="px-4 py-3 text-ink-200">{r.neu_ap || '–'}</td>
                    <td className="px-4 py-3"><span className={statusBadge(r.status)}>{r.status || '–'}</span></td>
                    <td className="px-4 py-3 text-xs text-ink-400">{r.belieferungsdatum || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {data.notes.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Notizen ({data.notes.length})</h2>
          <div className="card-premium p-4 space-y-3">
            {data.notes.map(n => (
              <div key={n.id} className="border-b border-white/5 last:border-0 pb-3 last:pb-0">
                <div className="text-sm text-ink-200 whitespace-pre-wrap">{n.note}</div>
                <div className="text-xs text-ink-400 mt-1">{new Date(n.created_at).toLocaleString('de-DE')}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <a href={`https://utility-hub.one/app/customers/${c.id}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-gold-300 hover:text-gold-200">
        Im Legacy-UI öffnen <ExternalLink size={11} />
      </a>
    </>
  );
}

// ── Organizations Section ──────────────────────────────────────

type Organization = { id: string; name: string; kind?: string; created_at: string };

function OrganizationsSection({ slug }: { slug: string }) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api<{ ok: boolean; organizations: Organization[] }>(`/api/me/projects/${slug}/uh/organizations`)
      .then(d => { if (active) setOrgs(d.organizations || []); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <Building size={16} className="text-gold-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Organisationen</h1>
          <p className="text-xs text-ink-400 mt-0.5">{orgs.length} Hausverwaltungen / Bestandshalter</p>
        </div>
      </div>

      {loading ? <div className="card-premium p-12 flex justify-center"><Spinner size="md" /></div> :
       orgs.length === 0 ? <div className="card-premium p-12 text-center text-sm text-ink-400">Noch keine Orgs.</div> :
       <div className="space-y-2">
         {orgs.map((o, i) => (
           <div key={o.id} className="card-premium p-4 flex items-center justify-between animate-fade-up" style={stagger(i, 40, 40)}>
             <div>
               <div className="font-medium text-white">{o.name}</div>
               <div className="text-xs text-ink-400 mt-0.5">{o.kind || 'Organisation'} · seit {new Date(o.created_at).toLocaleDateString('de-DE')}</div>
             </div>
           </div>
         ))}
       </div>
      }
    </>
  );
}

// ── Reports Section ──────────────────────────────────────

type ReportData = {
  customers_by_object_type: Array<{ label: string; count: number }>;
  customers_by_status: Array<{ label: string; count: number }>;
  customers_by_source: Array<{ label: string; count: number }>;
  teleson_by_energie: Array<{ label: string; count: number }>;
  teleson_by_status: Array<{ label: string; count: number }>;
};

function ReportsSection({ slug }: { slug: string }) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api<{ ok: boolean } & ReportData>(`/api/me/projects/${slug}/uh/reports`)
      .then(d => { if (active) setData(d); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) return <div className="card-premium p-12 flex justify-center"><Spinner size="md" /></div>;
  if (!data) return <div className="card-premium p-8 text-sm text-ink-400">Reports nicht ladbar.</div>;

  const groups = [
    { title: 'Lieferstellen nach Typ', items: data.customers_by_object_type },
    { title: 'Lieferstellen nach Status', items: data.customers_by_status },
    { title: 'Lieferstellen nach Quelle', items: data.customers_by_source },
    { title: 'Teleson nach Energie', items: data.teleson_by_energie },
    { title: 'Teleson nach Status', items: data.teleson_by_status },
  ];
  const totalFor = (items: Array<{ count: number }>) => items.reduce((s, i) => s + i.count, 0);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <BarChart3 size={16} className="text-gold-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Reports</h1>
          <p className="text-xs text-ink-400 mt-0.5">Live-Aggregate aus der UH-DB</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {groups.map((g, gi) => {
          const total = totalFor(g.items);
          return (
            <div key={g.title} className="card-premium p-4 animate-fade-up" style={stagger(gi, 60, 60)}>
              <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">{g.title}</h2>
              <div className="space-y-2">
                {g.items.map(item => {
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-ink-200">{item.label}</span>
                        <span className="text-white font-medium">{item.count} <span className="text-xs text-ink-400">({pct}%)</span></span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gold-400/60" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Contacts Section ──────────────────────────────────────

type Contact = { id: string; full_name?: string; email?: string; phone?: string; organization_id?: string; role?: string };

function ContactsSection({ slug }: { slug: string }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api<{ ok: boolean; contacts: Contact[] }>(`/api/me/projects/${slug}/uh/contacts`)
      .then(d => { if (active) setContacts(d.contacts || []); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
          <Users size={16} className="text-gold-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Kontakte</h1>
          <p className="text-xs text-ink-400 mt-0.5">{contacts.length} Ansprechpartner</p>
        </div>
      </div>
      {loading ? <div className="card-premium p-12 flex justify-center"><Spinner size="md" /></div> :
       contacts.length === 0 ? <div className="card-premium p-12 text-center text-sm text-ink-400">Noch keine Kontakte.</div> :
       <div className="space-y-2">
         {contacts.map((c, i) => (
           <div key={c.id} className="card-premium p-4 animate-fade-up" style={stagger(i, 30, 30)}>
             <div className="font-medium text-white">{c.full_name || '–'}</div>
             {c.role && <div className="text-xs text-ink-400 mt-0.5">{c.role}</div>}
             <div className="flex gap-4 mt-2 text-xs">
               {c.email && <span className="inline-flex items-center gap-1 text-ink-300"><Mail size={11} /> {c.email}</span>}
               {c.phone && <span className="inline-flex items-center gap-1 text-ink-300"><Phone size={11} /> {c.phone}</span>}
             </div>
           </div>
         ))}
       </div>
      }
    </>
  );
}

// ── Coming-Soon Section (Documents/Incentives/Support/Roadmap) ─────────

function ComingSoonSection({ slug, title, desc, legacyPath }: { slug: string; title: string; desc: string; legacyPath: string }) {
  return (
    <div className="card-premium p-8">
      <div className="flex items-center gap-3 mb-4">
        <FileText size={20} className="text-gold-300" />
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>
      <p className="text-sm text-ink-300 mb-6">{desc}</p>
      <p className="text-xs text-ink-400 mb-4">
        Diese Section wird aktuell ins AEVUM-Portal portiert. Bis dahin verfügbar im Legacy-UI:
      </p>
      <a href={`https://utility-hub.one${legacyPath}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 btn-gold text-sm">
        Im UH-Admin öffnen <ExternalLink size={13} />
      </a>
    </div>
  );
}

// ── Wrapper für Customer-Detail mit URL-Routing ──────────────

function CustomersWrapper({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const params = useParams();
  const detailId = (params as { '*'?: string })['*'] || new URLSearchParams(window.location.search).get('id') || '';

  if (detailId) {
    return <CustomerDetailSection slug={slug} customerId={detailId} onBack={() => {
      const params = new URLSearchParams(window.location.search);
      params.delete('id');
      navigate(`/projects/${slug}?s=customers${params.toString() ? '&' + params.toString() : ''}`);
    }} />;
  }
  return <CustomersSection slug={slug} />;
}

// ── Router Switch ──────────────────────────────────────────

export default function UtilityHubDashboard({ slug, section }: { slug: string; section: string }) {
  if (section === 'customers') return <CustomersWrapper slug={slug} />;
  if (section === 'organizations') return <OrganizationsSection slug={slug} />;
  if (section === 'contacts') return <ContactsSection slug={slug} />;
  if (section === 'reports') return <ReportsSection slug={slug} />;
  if (section === 'imports') return <ImportsSection slug={slug} />;
  if (section === 'teleson' || section === 'fg-finanz') return <TelesonSection slug={slug} />;
  if (section === 'close') return <CloseSection slug={slug} />;
  if (section === 'airtable') return <AirtableSection slug={slug} />;
  if (section === 'notion') return <NotionSection slug={slug} />;
  if (section === 'uh-documents') return <ComingSoonSection slug={slug} title="UH-Dokumente" desc="Dokumenten-Verwaltung pro Lieferstelle (Verträge, Rechnungen, Korrespondenz)." legacyPath="/app/documents" />;
  if (section === 'uh-incentives') return <ComingSoonSection slug={slug} title="Incentives / Provisionen" desc="Provisions-Tracking für Vertriebsmitarbeiter." legacyPath="/app/incentives" />;
  if (section === 'uh-support') return <ComingSoonSection slug={slug} title="Support" desc="Support-Tickets + Kunden-Anfragen." legacyPath="/app/support" />;
  if (section === 'uh-roadmap') return <ComingSoonSection slug={slug} title="UH-Roadmap" desc="Produkt-Roadmap und Releases." legacyPath="/app/roadmap" />;
  if (section === 'uh-settings') return <SettingsSection slug={slug} />;
  return <OverviewSection slug={slug} />;
}
