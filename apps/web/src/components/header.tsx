import * as Dialog from '@radix-ui/react-dialog';
import { activeIndustries, activeServices, activeSolutions, routes } from '@platform/shared';
import { ChevronDown, Globe2, LogIn, Menu, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BrandMark } from './brand-mark';
import { Button } from './ui/button';

type MenuName = 'services' | 'solutions' | null;

export function Header() {
  const [openMenu, setOpenMenu] = useState<MenuName>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && setOpenMenu(null);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-[#dfe9f3] bg-white text-[#0b1f38]"
    >
      <div className="hidden border-b border-[#e7eef6] lg:block">
        <div className="shell flex h-9 items-center justify-end gap-7 text-xs font-medium text-[#34343a]">
          <button
            className="inline-flex items-center gap-2 transition hover:text-[#0b63f6]"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
          <Link className="transition hover:text-[#0b63f6]" to={routes.contact}>
            Contact
          </Link>
          <a className="transition hover:text-[#0b63f6]" href="tel:+000000000000">
            Sales: +000 000 000 000
          </a>
          <button
            className="inline-flex items-center gap-1.5 transition hover:text-[#0b63f6]"
            aria-label="Choose language"
          >
            <Globe2 className="h-4 w-4" />
            EN <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="shell flex h-[74px] items-center justify-between gap-5 lg:h-[82px]">
        <BrandMark />
        <nav className="hidden h-full items-center gap-1 lg:flex" aria-label="Primary navigation">
          <MegaButton label="Services" name="services" open={openMenu} onOpen={setOpenMenu} />
          <MegaButton label="Solutions" name="solutions" open={openMenu} onOpen={setOpenMenu} />
          <TopLink to={routes.industries}>Industries</TopLink>
          <TopLink to={routes.resources}>Insights</TopLink>
          <TopLink to={routes.trust}>Trust</TopLink>
          <TopLink to={routes.about}>Company</TopLink>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="secondary" size="sm">
            <Link to={routes.login}>
              <LogIn aria-hidden="true" className="h-4 w-4" />
              Portal
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to={routes.assessment}>Request assessment</Link>
          </Button>
        </div>

        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Trigger asChild>
            <button
              className="grid h-11 w-11 place-items-center rounded-md border border-[#0b63f6] text-[#0b63f6] transition hover:bg-[#0b63f6] hover:text-white lg:hidden"
              aria-label="Open navigation"
            >
              <Menu aria-hidden="true" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm" />
            <Dialog.Content className="fixed inset-y-0 right-0 z-[61] w-full max-w-sm overflow-y-auto bg-white p-6 text-[#17171b] shadow-2xl">
              <div className="mb-8 flex items-center justify-between">
                <Dialog.Title>
                  <BrandMark compact />
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    className="grid h-11 w-11 place-items-center rounded-md border border-[#d8e5f1] text-[#243b53] transition hover:border-[#0b63f6] hover:bg-[#0b63f6] hover:text-white"
                    aria-label="Close navigation"
                  >
                    <X />
                  </button>
                </Dialog.Close>
              </div>
              <MobileNav />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <nav
        className="hidden border-t border-[#e7eef6] bg-[#f6f9fc] lg:block"
        aria-label="Page navigation"
      >
        <div className="shell flex h-12 items-center gap-8 text-sm font-medium">
          <Link className="relative flex h-full items-center font-semibold" to="/">
            Cybersecurity services
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0b63f6]" />
          </Link>
          <a className="transition hover:text-[#0b63f6]" href="/#how-it-works">
            How it works
          </a>
          <a className="transition hover:text-[#0b63f6]" href="/#solutions">
            Solutions
          </a>
          <a className="transition hover:text-[#0b63f6]" href="/#resources">
            Resources
          </a>
        </div>
      </nav>

      {openMenu && <MegaPanel type={openMenu} />}
    </header>
  );
}

function MegaButton({
  label,
  name,
  open,
  onOpen,
}: {
  label: string;
  name: Exclude<MenuName, null>;
  open: MenuName;
  onOpen: (value: MenuName) => void;
}) {
  const active = open === name;
  return (
    <button
      className={`inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-medium transition hover:bg-[#eaf4ff] hover:text-[#0b63f6] ${active ? 'bg-[#eaf4ff] text-[#0b63f6]' : 'text-[#243b53]'}`}
      aria-expanded={active}
      aria-controls={`${name}-menu`}
      onClick={() => onOpen(active ? null : name)}
    >
      {label}
      <ChevronDown
        className={`h-4 w-4 transition-transform ${active ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}

function TopLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition hover:bg-[#eaf4ff] hover:text-[#0b63f6] ${isActive ? 'text-[#0b63f6]' : 'text-[#243b53]'}`
      }
    >
      {children}
    </NavLink>
  );
}

function MegaPanel({ type }: { type: Exclude<MenuName, null> }) {
  const serviceMenu = type === 'services';
  const items = serviceMenu ? activeServices : activeSolutions;
  return (
    <div
      id={`${type}-menu`}
      className="absolute inset-x-0 top-full border-y border-[#d9e6f2] bg-white shadow-[0_30px_65px_rgba(6,37,75,.13)]"
      role="region"
      aria-label={`${type} menu`}
    >
      <div className="shell grid grid-cols-[.65fr_1.6fr_.8fr] gap-10 py-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-[#0b63f6]">
            {serviceMenu ? 'Expert services' : 'Business outcomes'}
          </p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight text-[#17171b]">
            {serviceMenu ? 'Clarity before complexity.' : 'Start with the risk you need to change.'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#66666e]">
            Focused security work connected to a practical decision and a clear next step.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <Link
              key={item.slug}
              to={serviceMenu ? routes.service(item.slug) : routes.solution(item.slug)}
              className="group rounded-lg border border-transparent p-4 transition hover:border-[#b9d9f5] hover:bg-[#f1f8ff]"
            >
              <span className="block text-sm font-semibold text-[#12263f] group-hover:text-[#0b63f6]">
                {item.name}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[#686870]">{item.summary}</span>
            </Link>
          ))}
        </div>
        <div className="rounded-xl bg-gradient-to-br from-[#0b63f6] to-[#4338ca] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[.15em] text-[#bae6fd]">
            Need a starting point?
          </p>
          <p className="mt-4 text-sm leading-6 text-white/90">
            Tell us what changed or what decision you need to make. We will help frame the next
            step.
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
            to={routes.contact}
          >
            Talk to an expert <ChevronDown className="h-4 w-4 -rotate-90" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MobileNav() {
  return (
    <nav className="space-y-8" aria-label="Mobile navigation">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0b63f6]">Services</p>
        {activeServices.map((item) => (
          <Link
            className="block min-h-11 border-b border-[#e1ebf4] py-3 text-sm font-medium"
            key={item.slug}
            to={routes.service(item.slug)}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0b63f6]">Solutions</p>
        {activeSolutions.map((item) => (
          <Link
            className="block min-h-11 border-b border-[#e1ebf4] py-3 text-sm font-medium"
            key={item.slug}
            to={routes.solution(item.slug)}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0b63f6]">
          Industries
        </p>
        {activeIndustries.map((item) => (
          <Link
            className="block min-h-11 border-b border-[#e1ebf4] py-3 text-sm font-medium"
            key={item.slug}
            to={routes.industry(item.slug)}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="grid gap-2 border-t border-[#e1ebf4] pt-6">
        <TopLink to={routes.resources}>Insights</TopLink>
        <TopLink to={routes.trust}>Trust centre</TopLink>
        <TopLink to={routes.about}>Company</TopLink>
        <TopLink to={routes.login}>Client portal</TopLink>
      </div>
      <Button className="w-full" asChild>
        <Link to={routes.assessment}>Request an assessment</Link>
      </Button>
    </nav>
  );
}
