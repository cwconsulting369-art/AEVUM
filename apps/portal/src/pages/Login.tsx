import { useState } from 'react';
import { toast } from 'sonner';
import { requestMagicLink } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestMagicLink(email, 'login');
      setSent(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown';
      toast.error(`Fehler: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-neutral-950 text-neutral-100">
      <div className="max-w-md w-full">
        <div className="mb-10">
          <div className="text-3xl font-bold tracking-tight">AEVUM</div>
          <div className="text-sm text-neutral-500 mt-1">Customer Portal</div>
        </div>
        {!sent ? (
          <form onSubmit={onSubmit} className="space-y-5">
            <label className="block">
              <span className="block text-sm font-medium mb-2">Deine Email-Adresse</span>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:border-neutral-600 transition"
                placeholder="du@firma.de"
              />
            </label>
            <button
              type="submit" disabled={loading || !email}
              className="w-full py-3 bg-white text-neutral-950 font-medium rounded-md hover:bg-neutral-200 transition disabled:opacity-50"
            >
              {loading ? 'Sende…' : 'Magic-Link anfordern'}
            </button>
            <p className="text-xs text-neutral-500 pt-2">
              Wir senden dir einen einmal-gültigen Login-Link per Mail (30 Min gültig).
              Kein Passwort nötig.
            </p>
          </form>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="text-lg font-medium mb-2">Check deine Mails</div>
            <p className="text-sm text-neutral-400">
              Falls die Adresse <span className="text-neutral-200">{email}</span> bei uns registriert ist,
              haben wir dir gerade einen Login-Link gesendet. Schau in deinen Posteingang.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
