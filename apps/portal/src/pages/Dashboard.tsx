// Dashboard Role-Router — Wave B1-v2
// Routet auf einen von drei Dashboards basierend auf account.account_type.
// Default (legacy / unbekannt) = CustomerDashboard (= bisheriges Verhalten, sicher).
//
// account_type:
//   'customer'  → CustomerDashboard (Vollkunden, Projects+Agent+Docs+Quicklinks)
//   'shop'      → ShopDashboard (Blueprint-Käufer, Orders+Downloads+Credits+Helpbot)
//   'saas'      → SaaSDashboard (SaaS-Tools, mostly Coming-Soon, Credits)

import { useAuth } from '@/lib/auth';
import CustomerDashboard from './dashboards/CustomerDashboard';
import ShopDashboard from './dashboards/ShopDashboard';
import SaaSDashboard from './dashboards/SaaSDashboard';

export default function Dashboard() {
  const { me } = useAuth();
  if (!me) return null;

  switch (me.account.account_type) {
    case 'shop':
      return <ShopDashboard />;
    case 'saas':
      return <SaaSDashboard />;
    case 'customer':
    default:
      // Legacy accounts (pre-mig019) ohne explizites account_type fallen hier rein.
      // Safe default — bisheriges Verhalten bleibt erhalten.
      return <CustomerDashboard />;
  }
}
