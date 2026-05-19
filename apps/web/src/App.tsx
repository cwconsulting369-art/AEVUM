import { useState, useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';

const Services = lazy(() => import('./pages/Services'));
const Websites = lazy(() => import('./pages/services/Websites'));
const LeadGeneration = lazy(() => import('./pages/services/LeadGeneration'));
const ContentWorkflows = lazy(() => import('./pages/services/ContentWorkflows'));
const AIAutomation = lazy(() => import('./pages/services/AIAutomation'));
const WorkflowAudit = lazy(() => import('./pages/WorkflowAudit'));
const Cases = lazy(() => import('./pages/Cases'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const Impressum = lazy(() => import('./pages/Impressum'));

// Legacy services from lennoxOS
const LegacyAIAutomation = lazy(() => import('./pages/legacy/AIAutomation'));
const LegacyAutomationAudit = lazy(() => import('./pages/legacy/AutomationAudit'));
const LegacyBusinessOS = lazy(() => import('./pages/legacy/BusinessOS'));
const LegacyCommandCenter = lazy(() => import('./pages/legacy/CommandCenter'));
const LegacyContentEngine = lazy(() => import('./pages/legacy/ContentEngine'));
const LegacyContentWorkflows = lazy(() => import('./pages/legacy/ContentWorkflows'));
const LegacyDatabaseSystem = lazy(() => import('./pages/legacy/DatabaseSystem'));
const LegacyECommerceOS = lazy(() => import('./pages/legacy/ECommerceOS'));
const LegacyLeadEngine = lazy(() => import('./pages/legacy/LeadEngine'));
const LegacyPersonalAgent = lazy(() => import('./pages/legacy/PersonalAgent'));
const LegacySalesOS = lazy(() => import('./pages/legacy/SalesOS'));
const LegacyWebsiteCRM = lazy(() => import('./pages/legacy/WebsiteCRM'));

function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function getHashRoute() {
  const hash = window.location.hash;
  if (!hash || hash === '#/' || hash === '') return '/';
  return hash.replace('#', '');
}

const routeComponents: Record<string, React.ComponentType> = {
  '/': Home,
  '/services': Services,
  '/services/websites': Websites,
  '/services/lead-generation': LeadGeneration,
  '/services/content-workflows': ContentWorkflows,
  '/services/ai-automation': AIAutomation,
  '/workflow-audit': WorkflowAudit,
  '/cases': Cases,
  '/datenschutz': Datenschutz,
  '/impressum': Impressum,
  // Legacy lennoxOS services
  '/legacy/ai-automation': LegacyAIAutomation,
  '/legacy/automation-audit': LegacyAutomationAudit,
  '/legacy/business-os': LegacyBusinessOS,
  '/legacy/command-center': LegacyCommandCenter,
  '/legacy/content-engine': LegacyContentEngine,
  '/legacy/content-workflows': LegacyContentWorkflows,
  '/legacy/database-system': LegacyDatabaseSystem,
  '/legacy/ecommerce-os': LegacyECommerceOS,
  '/legacy/lead-engine': LegacyLeadEngine,
  '/legacy/personal-agent': LegacyPersonalAgent,
  '/legacy/sales-os': LegacySalesOS,
  '/legacy/website-crm': LegacyWebsiteCRM,
};

export default function App() {
  const [route, setRoute] = useState(getHashRoute);

  useEffect(() => {
    const handleHash = () => setRoute(getHashRoute());
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const Page = routeComponents[route] || Home;
  const isHome = route === '/';

  return (
    <Layout>
      {isHome ? (
        <Page />
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          <Page />
        </Suspense>
      )}
    </Layout>
  );
}
