import type { ReactNode } from 'react';
import { AdBanner } from '@/components/ads/AdBanner';
import { FlowPanel } from '@/components/layout/FlowPanel';
import { ProgressIndicator } from './ProgressIndicator';

type OnboardingLayoutProps = {
  /** Position in the onboarding stepper. Omit to hide the progress bar entirely. */
  step?: number;
  title: string;
  /** Renders the title with the gradient + type-on animation (main page only). */
  titleTyping?: boolean;
  description?: ReactNode;
  children?: ReactNode;
  /** Pinned to the bottom of the panel — the Continue/Enter CTA. */
  footer?: ReactNode;
  /** Optional note rendered below the footer button (e.g. legal, tips). */
  footerNote?: ReactNode;
  className?: string;
};

/**
 * Shared frame for every onboarding screen: a single dark panel that fills the
 * viewport on phones and becomes a centered, portrait card on desktop.
 *
 * The first screen (progress + ad/title/hero + CTA) is forced to exactly the
 * viewport height — `100dvh` minus the panel's vertical padding (`p-5` = 2.5rem
 * top+bottom) — so on short screens the Continue button already rests at the
 * bottom edge. The CTA bar is additionally `sticky bottom-0`, so whenever the
 * page is taller than the viewport (long CRM note on small phones) the button
 * still floats at the very bottom of the screen on every breakpoint, fully
 * visible and never clipped. The CRM note renders BELOW that block in normal
 * document flow, so the page's main scrollbar scrolls through it under the
 * button. There is no fixed overlay and no inner scrollbar.
 */
export function OnboardingLayout({ step, title, titleTyping, description, children, footer, footerNote, className }: OnboardingLayoutProps) {
  return (
    <FlowPanel className={className}>
      <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col">
        {step != null ? (
          <div className="shrink-0">
            <ProgressIndicator current={step} />
          </div>
        ) : null}

        <div className="flex flex-1 flex-col">
          {/* Boxed Google ad sits directly above the screen title. */}
          <AdBanner />
          <div className="pt-[38px] text-center">
            <h1 className={`font-bold ${titleTyping ? 'text-[28px]' : 'text-[20px]'}`}>
              {titleTyping ? (
                <span className="typing-text">
                  <span>{title}</span>
                </span>
              ) : (
                title
              )}
            </h1>
            {description ? <div className="mx-auto mt-2.5 max-w-sm text-[12px] leading-relaxed text-fg-muted">{description}</div> : null}
          </div>
          {children ? <div className="mt-[52px] flex-1">{children}</div> : <div className="flex-1" />}
        </div>

        {footer ? (
          /* Sticky bottom bar: bleeds over the panel's p-5 padding (negative
             margins + matching padding) and paints the panel surface behind the
             CTA, so note content scrolls cleanly underneath it. */
          <div className="sticky bottom-0 z-10 -mx-5 -mb-5 bg-plum-950/90 px-5 pb-5">{footer}</div>
        ) : null}
      </div>

      {footerNote ? <div className="pt-6 text-center text-[12.5px] leading-relaxed text-fg-muted">{footerNote}</div> : null}
    </FlowPanel>
  );
}
