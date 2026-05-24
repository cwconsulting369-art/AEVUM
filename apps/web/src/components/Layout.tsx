import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieBanner from './CookieBanner';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useEffect(() => {
    const handleHash = () => window.scrollTo({ top: 0, behavior: 'instant' });
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-[#F9FAFB]">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
