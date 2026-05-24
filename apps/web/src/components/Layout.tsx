import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieBanner from './CookieBanner';
import MaintenanceBanner from './MaintenanceBanner';
import MaintenanceModal from './MaintenanceModal';
import { closeMaintenanceModal, useMaintenanceModalState } from '@/lib/maintenance-bus';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useEffect(() => {
    const handleHash = () => window.scrollTo({ top: 0, behavior: 'instant' });
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const { open, payload } = useMaintenanceModalState();

  return (
    <div className="min-h-screen bg-bg-primary text-[#F9FAFB]">
      <MaintenanceBanner />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CookieBanner />
      <MaintenanceModal
        open={open}
        onClose={closeMaintenanceModal}
        interest={payload?.interest}
        source={payload?.source}
        title={payload?.title}
        message={payload?.message}
      />
    </div>
  );
}
