import { Menu, X } from 'lucide-react';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

const NAV_LINKS = [
  { to: '/', label: 'Welcome' },
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/contact', label: 'Contact' },
] as const;

type HeaderProps = {
  /** Show the marketing navigation (landing and info pages). */
  showNav?: boolean;
  /** Extra controls on the right, e.g. Exit on the demo page. */
  actions?: ReactNode;
};

export function Header({ showNav = true, actions }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const location = useLocation();

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-ink-950/80 backdrop-blur-lg supports-[backdrop-filter]:bg-ink-950/65">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        {showNav ? (
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="rounded-full px-3.5 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-white/5 hover:text-fg">
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-2">
          {actions}
          {showNav ? (
            <>
              <Link to="/" className={cn(buttonVariants({ size: 'sm' }), 'hidden sm:inline-flex')}>
                Start chatting
              </Link>
              <button
                type="button"
                className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={open ? 'Close menu' : 'Open menu'}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {showNav ? (
        <nav id={menuId} aria-label="Mobile" hidden={!open} className="border-t border-white/6 px-4 pb-5 pt-2 md:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="block rounded-xl px-3 py-3 font-medium text-fg-muted hover:bg-white/5 hover:text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/" className={cn(buttonVariants(), 'mt-3 w-full')}>
            Start chatting
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
