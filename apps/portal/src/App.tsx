import { Navigate, Route, Routes } from 'react-router';
import { AuthProvider, useAuth } from './lib/auth';
import Layout from './components/Layout';
import CookieBanner from './components/CookieBanner';
import Login from './pages/Login';
import AuthVerify from './pages/AuthVerify';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Permissions from './pages/Permissions';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Datenschutz from './pages/Datenschutz';
import Impressum from './pages/Impressum';
import AGB from './pages/AGB';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { me, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">Lade…</div>;
  if (!me) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/verify" element={<AuthVerify />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/agb" element={<AGB />} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieBanner />
    </AuthProvider>
  );
}
