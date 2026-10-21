import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Footer } from './Footer';
import { Header } from './Header';

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  showNav?: boolean;
  showFooter?: boolean;
  /** Set false on the focused flow screens to drop the top header bar entirely. */
  showHeader?: boolean;
  headerActions?: ReactNode;
};

/** Page shell: skip link, header, a single <main> landmark and an optional footer. */
export function PageContainer({ children, className, showNav = true, showFooter = true, showHeader = true, headerActions }: PageContainerProps) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-cyan px-4 py-2 font-semibold text-ink-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      {showHeader ? <Header showNav={showNav} actions={headerActions} /> : null}
      <main id="main" tabIndex={-1} className={cn('flex-1 outline-none', className)}>
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </>
  );
}

/** Centered content column. */
export function Section({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6', className)} {...props} />;
}
