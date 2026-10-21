import { Link } from 'react-router';
import { BRAND_NAME, Logo } from './Logo';

const FOOTER_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms & Conditions' },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/6 bg-ink-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            {BRAND_NAME} is a demonstration of a random video chat interface. Every clip is pre-recorded. Nobody is watching, and no camera or microphone is used.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:flex sm:gap-6">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="rounded text-fg-muted transition-colors hover:text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/6">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-xs text-fg-subtle sm:px-6">
          © {new Date().getFullYear()} {BRAND_NAME}. Demo project — not a live chat service.
        </p>
      </div>
    </footer>
  );
}
