import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { LoaderCircle } from 'lucide-react';
import { Lottie } from 'lottie-react';
import { AdBanner } from '@/components/ads/AdBanner';
import { CrmNote } from '@/components/onboarding/CrmNote';
import { FlowPanel } from '@/components/layout/FlowPanel';
import { buttonVariants } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showRewarded, warmRewarded } from '@/lib/gpt';
import { cn } from '@/lib/utils';

/** Playback rate for the scene; `1` is its authored speed, above it runs faster. */
const LOTTIE_SPEED = 1.15;
/** How long the "finding someone" phase lasts before Connect is handed over. */
const FINDING_MS = 6000;

/**
 * Reached by tapping a "Live Video" card on the clips grid. It plays the
 * "Search Girl" Lottie scene (public/animations/girl-find.json) dead-centre in
 * the shared flow panel.
 *
 * On arrival a "finding someone" countdown runs (the Connect button is withheld
 * and a status line takes its place) until the search is reported as done after
 * `FINDING_MS`. The rewarded ad is NOT played on arrival: it now loads the
 * moment the Connect button appears, i.e. once `finding` flips to false.
 * Tapping Connect (or the scene) opens /connect, which reports that no new
 * user was found and offers to search again.
 */
export default function GirlFindPage() {
  usePageTitle('Live Video');

  const [animationData, setAnimationData] = useState<object | null>(null);
  const [failed, setFailed] = useState(false);
  const [finding, setFinding] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/animations/girl-find.json')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
      .then((json) => {
        if (active) setAnimationData(json as object);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // The "finding someone" countdown starts on arrival (no ad in front of it);
  // when it elapses the Connect button is revealed. We also pre-warm the
  // rewarded creative now, during the countdown, so it is already fetched and
  // pops instantly the moment the button appears below.
  useEffect(() => {
    warmRewarded();
    const timer = window.setTimeout(() => setFinding(false), FINDING_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // The rewarded ad plays when the Connect button appears (search done),
  // not on arrival. `showRewarded` is a no-op when GAM is off.
  useEffect(() => {
    if (finding) return;
    void showRewarded();
  }, [finding]);

  const scene = failed ? (
    <img
      src="/icons/Frame 1851.png"
      alt="Searching for someone to connect you with"
      className="mx-auto aspect-square w-full max-w-[20rem] object-contain"
    />
  ) : animationData ? (
    // The scene's own canvas is a 1000x1000 square.
    <Lottie src={animationData} autoplay loop speed={LOTTIE_SPEED} className="mx-auto aspect-square w-full max-w-[20rem]" />
  ) : (
    <div aria-hidden="true" className="mx-auto aspect-square w-full max-w-[20rem]" />
  );

  return (
    <FlowPanel>
      {/* Same staging as the other flow screens: the first block fills the
          viewport so the Connect button rests at the bottom edge, and the CTA
          bar is sticky so it stays pinned to the screen bottom even while the
          long CRM note below makes the page scrollable on small phones. */}
      <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col">
        <div className="flex flex-1 flex-col">
          <AdBanner />
          <div className="flex flex-1 items-center justify-center">
            {/* Tapping the scene only continues once a match has been "found". */}
            {finding ? (
              <div className="w-full max-w-[20rem]">{scene}</div>
            ) : (
              <Link
                to="/connect"
                aria-label="Continue"
                className="block w-full max-w-[20rem] rounded-3xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-violet-soft"
              >
                {scene}
              </Link>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 z-10 -mx-5 -mb-5 bg-plum-950/90 px-5 pb-5 pt-4">
          {finding ? (
            <p
              role="status"
              className="flex items-center justify-center gap-2 rounded-2xl bg-plum-900/80 px-4 py-4 text-[13px] font-medium text-fg-muted ring-1 ring-white/8"
            >
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none text-violet-soft" />
              Finding the right person for you…
            </p>
          ) : (
            <Link to="/connect" className={cn(buttonVariants({ variant: 'gradient', size: 'lg' }), 'w-full')}>
              Connect
            </Link>
          )}
        </div>
      </div>

      <div className="pt-6 text-center text-[12.5px] leading-relaxed text-fg-muted">
        <CrmNote
          featuresTitle="Why quick matching works"
          features={[
            {
              emoji: '⚡',
              title: 'Instant matches',
              text: 'No profiles to scroll and no waiting — the right stranger appears within seconds.',
            },
            {
              emoji: '🔒',
              title: 'Zero sign-up',
              text: 'No account, no password and nothing to fill in before the first conversation.',
            },
            {
              emoji: '🌍',
              title: 'Meet anyone',
              text: 'Every match comes from a different city, background or timezone.',
            },
            {
              emoji: '👋',
              title: 'Leave anytime',
              text: 'One tap ends a conversation and starts a brand-new match — no awkward goodbyes.',
            },
          ]}
          funFact='Most random-chat users stay in the app when their first match arrives in under 30 seconds — patience is literally the product.'
          stepsTitle="How the matching works?"
          steps={[
            'You confirm your age and pick who you want to meet.',
            'The queue pairs you with the next available stranger.',
            'The video opens the moment both sides are ready.',
            'Tap Next and you are back in the queue in one second.',
          ]}
        />
      </div>
    </FlowPanel>
  );
}
