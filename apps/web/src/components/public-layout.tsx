import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './footer';
import { Header } from './header';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export function PublicLayout() {
  return (
    <div className="bg-ink min-h-screen text-slate-100">
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
