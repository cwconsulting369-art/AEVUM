import { Navigate, Route, Routes } from 'react-router';
import { AuthProvider, useAuth } from './lib/auth';
import Layout from './components/Layout';
import CookieBanner from './components/CookieBanner';
import Spinner from './components/Spinner';
import Login from './pages/Login';
import AuthVerify from './pages/AuthVerify';
import AuthToken from './pages/AuthToken';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Permissions from './pages/Permissions';
import Testimonial from './pages/Testimonial';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Documents from './pages/Documents';
import Datenschutz from './pages/Datenschutz';
import Impressum from './pages/Impressum';
import AGB from './pages/AGB';
import Credits from './pages/Credits';
import ScriptFactoryTool from './pages/tools/ScriptFactoryTool';
import DsgvoFactoryTool from './pages/tools/DsgvoFactoryTool';
import TimCustomers from './pages/tools/TimCustomers';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { me, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950 text-ink-100">
        <div className="text-center">
          <div className="flex justify-center mb-4"><Spinner size="md" /></div>
          <div className="text-sm text-ink-400">Lade Portal…</div>
        </div>
      </div>
    );
  }
  if (!me) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Tools sind fuer customer + saas, NICHT fuer shop-User.
function RequireToolsAccess({ children }: { children: React.ReactNode }) {
  const { me } = useAuth();
  if (!me) return null;
  if (me.account.account_type === 'shop') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/verify" element={<AuthVerify />} />
        <Route path="/auth/token" element={<AuthToken />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/agb" element={<AGB />} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/testimonial" element={<Testimonial />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/projects/:slug/documents" element={<Documents />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/tools/script-factory" element={<RequireToolsAccess><ScriptFactoryTool /></RequireToolsAccess>} />
          <Route path="/tools/script-factory/customers" element={<RequireToolsAccess><TimCustomers /></RequireToolsAccess>} />
          <Route path="/tools/dsgvo-factory" element={<RequireToolsAccess><DsgvoFactoryTool /></RequireToolsAccess>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieBanner />
    </AuthProvider>
  );
}
