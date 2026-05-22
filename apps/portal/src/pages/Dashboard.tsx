import { useAuth } from '@/lib/auth';
import { Link } from 'react-router';

export default function Dashboard() {
  const { me } = useAuth();
  if (!me) return null;
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Willkommen, {me.account.name}</h1>
      <p className="text-neutral-400 mb-10">Dein AEVUM-Operating-System auf einen Blick.</p>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <Card label="Projekte" value={me.projects.length.toString()} />
        <Card label="Status" value={me.account.status} />
        <Card label="Agent" value={me.agent?.deployment_status || '—'} />
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Onboarding-Checkliste</h2>
        <ul className="space-y-2 text-sm">
          <Checklist label="Account-Profil ausfüllen" done={!!me.profile?.industry} to="/profile" />
          <Checklist label="Permissions konfigurieren" done={!!me.permissions?.consent_date} to="/permissions" />
          <Checklist label="Erstes Projekt anlegen" done={me.projects.length > 0} to="/projects" />
        </ul>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Deine Projekte</h2>
          <Link to="/projects" className="text-sm underline text-neutral-400 hover:text-neutral-200">Alle anzeigen →</Link>
        </div>
        {me.projects.length === 0 ? (
          <div className="text-neutral-500 text-sm border border-dashed border-neutral-800 rounded-lg p-6 text-center">
            Noch kein Projekt angelegt. <Link to="/projects" className="underline">Jetzt starten →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {me.projects.slice(0, 5).map(p => (
              <Link key={p.id} to={`/projects/${p.slug}`}
                className="block border border-neutral-800 rounded-lg p-4 hover:border-neutral-600 transition">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-neutral-500 mt-1">/{p.slug}</div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-neutral-800 rounded">{p.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-neutral-800 rounded-lg p-5 bg-neutral-900/50">
      <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Checklist({ label, done, to }: { label: string; done: boolean; to: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className={`w-5 h-5 rounded-full border ${done ? 'bg-emerald-500 border-emerald-500' : 'border-neutral-700'}`} />
      <span className={done ? 'text-neutral-500 line-through' : 'text-neutral-200'}>{label}</span>
      {!done && <Link to={to} className="ml-auto text-xs underline text-neutral-500 hover:text-neutral-200">erledigen →</Link>}
    </li>
  );
}
