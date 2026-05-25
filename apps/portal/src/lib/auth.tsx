import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, clearTokens, getAccessToken } from './api';

export type AccountType = 'customer' | 'shop' | 'saas';

export type Me = {
  account: {
    id: string;
    slug: string;
    name: string;
    email: string;
    status: string;
    client_zero: boolean;
    account_type?: AccountType;
    has_agent_access?: boolean;
  };
  profile: any;
  permissions: any;
  agent: any;
  projects: Array<{
    id: string;
    slug: string;
    name: string;
    status: string;
    _operator_view?: boolean;
    owner_slug?: string;
    owner_name?: string;
  }>;
  is_operator?: boolean;
};

type AuthState = {
  loading: boolean;
  me: Me | null;
  refresh: () => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);

  const load = async () => {
    if (!getAccessToken()) { setMe(null); setLoading(false); return; }
    try {
      const data = await api<{ ok: boolean } & Me>('/api/me');
      setMe(data);
    } catch (e) {
      console.error('load me failed', e);
      clearTokens();
      setMe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const logout = () => {
    clearTokens();
    setMe(null);
    window.location.assign('/');
  };

  return (
    <AuthCtx.Provider value={{ loading, me, refresh: load, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
