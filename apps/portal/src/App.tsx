import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { AuthProvider, useAuth } from './lib/auth';
import Layout from './components/Layout';
import CookieBanner from './components/CookieBanner';
import Spinner from './components/Spinner';

// Route-level code-splitting: pages are lazy-loaded so the initial bundle stays lean.
// Layout, AuthProvider, RequireAuth and Spinner remain eager (critical shell).
const Login = lazy(() => import('./pages/Login'));
const AuthVerify = lazy(() => import('./pages/AuthVerify'));
const AuthToken = lazy(() => import('./pages/AuthToken'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CommandPreview = lazy(() => import('./pages/CommandPreview'));
const Profile = lazy(() => import('./pages/Profile'));
const Permissions = lazy(() => import('./pages/Permissions'));
const Testimonial = lazy(() => import('./pages/Testimonial'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Documents = lazy(() => import('./pages/Documents'));
const CustomerDocs = lazy(() => import('./components/CustomerDocs'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const Impressum = lazy(() => import('./pages/Impressum'));
const AGB = lazy(() => import('./pages/AGB'));
const Credits = lazy(() => import('./pages/Credits'));
const ScriptFactoryTool = lazy(() => import('./pages/tools/ScriptFactoryTool'));
const DsgvoFactoryTool = lazy(() => import('./pages/tools/DsgvoFactoryTool'));
const TimCustomers = lazy(() => import('./pages/tools/TimCustomers'));
const LeadScraperTool = lazy(() => import('./pages/tools/LeadScraperTool'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 text-ink-100">
      <Spinner size="md" />
    </div>
  );
}

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
      <Suspense fallback={<RouteFallback />}>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/verify" element={<AuthVerify />} />
        <Route path="/auth/token" element={<AuthToken />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/agb" element={<AGB />} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cmd" element={<CommandPreview />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/testimonial" element={<Testimonial />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/projects/:slug/documents" element={<Documents />} />
          <Route path="/documents" element={<CustomerDocs />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/tools/script-factory" element={<RequireToolsAccess><ScriptFactoryTool /></RequireToolsAccess>} />
          <Route path="/tools/script-factory/customers" element={<RequireToolsAccess><TimCustomers /></RequireToolsAccess>} />
          <Route path="/tools/dsgvo-factory" element={<RequireToolsAccess><DsgvoFactoryTool /></RequireToolsAccess>} />
          <Route path="/tools/lead-scraper" element={<RequireToolsAccess><LeadScraperTool /></RequireToolsAccess>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <CookieBanner />
    </AuthProvider>
  );
}
