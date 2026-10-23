import { useEffect, useMemo, useState } from 'react';
import { UserX } from 'lucide-react';
import { Link } from 'react-router';
import { AdBanner } from '@/components/ads/AdBanner';
import { FlowPanel } from '@/components/layout/FlowPanel';
import { CrmNote } from '@/components/onboarding/CrmNote';
import { buttonVariants } from '@/components/ui/button';
import { useAdNavigation } from '@/hooks/useAdNavigation';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/lib/utils';

/** ms per character for the description typewriter */
const DESC_SPEED = 38;

/**
 * Reveals `text` one code-point at a time (so emoji are never split) once
 * `enabled` becomes true. Returns the visible slice and whether it is done.
 * Resets to empty if `enabled` goes back to false.
 */
function useTypewriter(text: string, enabled: boolean, speed: number) {
  // Array.from splits by code-points, keeping multi-byte emoji intact.
  const chars = useMemo(() => Array.from(text), [text]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setCount(0);
      return;
    }
    if (count >= chars.length) return;
    const timer = window.setTimeout(() => setCount((c) => c + 1), speed);
    return () => window.clearTimeout(timer);
  }, [enabled, count, chars, speed]);

  return { display: chars.slice(0, count).join(''), done: count >= chars.length };
}

/** Blinking cursor shown only while the active line is still typing. */
function Cursor({ hidden }: { hidden: boolean }) {
  if (hidden) return null;
  return <span aria-hidden="true" className="ml-0.5 inline-block w-[2px] animate-blink bg-cyan align-middle" style={{ height: '1em' }} />;
}

/**
 * Reached by tapping Connect on the girl-find screen. The "match" never
 * resolves in this demo, so the screen apologises with a "new user not found"
 * notice and offers a single way out: a "meet someone new!" button that sends
 * the visitor back to the home page (/) to restart the flow from the top.
 *
 * The description is revealed with a typewriter effect and the CTA fades in
 * once it finishes.
 */
export default function UserNotFoundPage() {
  usePageTitle('Live Video');
  const { guardLink } = useAdNavigation();

  const desc = useTypewriter(
    "No one's available right now! 😕 Try again to meet someone new.",
    true,
    DESC_SPEED,
  );

  return (
    <FlowPanel>
      {/* Same staging as the Connect screen: the first block fills the viewport
          so the “meet someone new!” button rests at the bottom edge, and the
          CRM note sits below it in normal flow — the page scrollbar reaches it. */}
      <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col">
        <AdBanner />
        <div className="flex flex-1 flex-col items-center justify-center text-center ">
          <span aria-hidden="true" className="flex size-20 items-center justify-center rounded-full bg-plum-900/80 ring-1 ring-white/8">
            <UserX className="size-9 text-violet-soft" />
          </span>

          <p className="mt-6 min-h-[3rem] max-w-[20rem] text-[16px] leading-relaxed text-fg-muted">
            {desc.display}
            <Cursor hidden={desc.done} />
          </p>
        </div>

        <div className="pt-4">
          <Link
            to="/"
            onClick={guardLink('interstitial', '/')}
            className={cn(
              buttonVariants({ variant: 'gradient', size: 'lg' }),
              'w-full transition-opacity duration-500',
              desc.done ? 'opacity-100' : 'opacity-0',
            )}
          >
            meet someone new!
          </Link>
        </div>
      </div>

      {/* CRM note below the button — same style as the other flow screens. */}
      <div className="pt-6 text-center text-[12.5px] leading-relaxed text-fg-muted">
        <CrmNote
          featuresTitle="Why a missed connection is not the end"
          features={[
            {
              emoji: '🔁',
              title: 'Automatic re-engagement',
              text: 'A CRM nudges a cold lead at the right moment, so no opportunity is silently lost.',
            },
            {
              emoji: '📝',
              title: 'Context is never lost',
              text: 'Every prior interaction is logged, so the next attempt picks up exactly where the last one stopped.',
            },
            {
              emoji: '🎯',
              title: 'Smarter timing',
              text: 'Response patterns tell the system when a contact is most likely to reply, not just that they didn\'t.',
            },
            {
              emoji: '📉',
              title: 'Drop-off tracking',
              text: 'Funnel reports show exactly where prospects stall, so the process improves over time.',
            },
          ]}
          funFact="80% of sales require five follow-ups after the initial meeting — yet 44% of reps give up after just one. A CRM removes the guesswork."
          stepsTitle="What happens after a no-match?"
          steps={[
            'The attempt is logged against the contact profile automatically.',
            'A follow-up task is scheduled at an optimal time.',
            'The next outreach uses context from the previous one.',
            'The pipeline report updates so nothing slips through.',
          ]}
        />
      </div>
    </FlowPanel>
  );
}
