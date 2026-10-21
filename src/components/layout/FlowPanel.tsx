import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { cn } from '@/lib/utils';

type FlowPanelProps = {
  children: ReactNode;
  className?: string;
  /**
   * Whether the thin “About · Privacy Policy · Terms & Conditions” line is
   * rendered at the bottom of the panel. Defaults to `true` — every flow screen
   * shows it, except the final Lottie screen which opts out to keep its
   * single-frame “finding someone” staging clean.
   *
   * This is deliberately NOT the full site `<Footer />` (that one is reserved
   * for the standalone info pages); here we only need a quiet legal line under
   * the existing content.
   */
  showLegalLine?: boolean;
};

const LEGAL_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms & Conditions' },
] as const;

/**
 * The single bordered panel every flow screen renders inside — welcome, age,
 * gender and the live-video grid all share it, so the content always sits in
 * the same centered card on phones and desktop instead of spreading full width.
 * The panel grows with its content (`min-h-dvh`) so the whole page uses the
 * browser's main scrollbar — there is deliberately no inner scroll container.
 */
export function FlowPanel({ children, className, showLegalLine = true }: FlowPanelProps) {
  return (
    <PageContainer showNav={false} showFooter={false} showHeader={false} className="bg-glow">
      <div
        className={cn(
          'mx-auto flex min-h-dvh w-full max-w-[393px] flex-col gap-0 bg-plum-950/90  shadow-[0_24px_80px_-32px] shadow-black/70',
          className,
        )}
      >
        {children}
        {showLegalLine ? (
          <nav
            aria-label="Legal"
            className="mt-6 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 pb-1 text-center text-[11.5px] leading-relaxed text-fg-subtle"
          >
            {LEGAL_LINKS.map((link, index) => (
              <span key={link.to} className="inline-flex items-center gap-x-2.5">
                {index > 0 ? <span aria-hidden="true">·</span> : null}
                <Link to={link.to} className="rounded transition-colors hover:text-fg hover:underline">
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        ) : null}
      </div>
    </PageContainer>
  );
}
