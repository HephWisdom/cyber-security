import { useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '@platform/shared';
import { Button } from './ui/button';

export function ConsentBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('analytics-consent'));
  const choose = (value: 'granted' | 'denied') => {
    localStorage.setItem('analytics-consent', value);
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <aside
      className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-3xl rounded-2xl border border-white/15 bg-[#0b1728] p-5 shadow-2xl"
      aria-label="Privacy choices"
    >
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 className="text-base font-semibold">Your privacy choices</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Necessary storage keeps the site and secure portal working. Optional, privacy-conscious
            analytics remain disabled unless you allow them. Sensitive form and portal data are
            never analytics events.{' '}
            <Link className="text-slate-200 underline" to={routes.cookies}>
              Cookie policy
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => choose('denied')}>
            Decline optional
          </Button>
          <Button size="sm" onClick={() => choose('granted')}>
            Allow analytics
          </Button>
        </div>
      </div>
    </aside>
  );
}
