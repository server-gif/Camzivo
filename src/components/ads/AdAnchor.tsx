import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Minus } from 'lucide-react';
import { gamEnabled } from '@/config/ads';
import { getGpt, mountRotatingSlot } from '@/lib/gpt';
import { cn } from '@/lib/utils';

/** Mobile-first sizes for the bottom anchor strip. */
const ANCHOR_SIZES: unknown[] = [
  [320, 50],
  [320, 100],
  [300, 100],
  // Live GAM check: the anchor units returned no-ad for the mobile strip sizes
  // only, so also accept the standard box sizes the account's creatives are
  // booked at (same inventory the banner/interstitial slots serve).
  [300, 250],
  [320, 480],
];

/** Unique div id — GPT requires a globally unique slot element id. */
const ANCHOR_DIV_ID = 'gam-anchor-slot';

/**
 * The anchor ad pinned to the bottom of the viewport on every screen (it lives
 * in RootLayout, which persists across navigation). It is a custom in-page slot
 * inside a bar we own — NOT Google's managed out-of-page ANCHOR overlay — so any
 * standard ad unit path fills it and we can add our own minimize control.
 *
 * Odd/even tag rotation: on every navigation the component takes the *next*
 * anchor tag from the rotation via mountRotatingSlot, which destroys the
 * previous slot and, if GAM answers with no ad, immediately retries the *other*
 * configured tag — so an empty unit transparently falls back to its pair
 * instead of leaving the bar collapsed all page view.
 *
 * Behaviour: while the creative fills it shows at full size; the minimize button
 * removes the whole bar in one tap. Until an ad actually fills, the strip stays
 * collapsed (zero height) so an empty placeholder never floats over the page.
 * When `VITE_GAM_ENABLED` is off the component renders nothing at all.
 */
export function AdAnchor() {
  const location = useLocation();
  const lastPathname = useRef<string | null>(null);
  const [filled, setFilled] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (!gamEnabled || minimized) return;
    const first = lastPathname.current === null;
    if (!first && lastPathname.current === location.pathname) return;
    lastPathname.current = location.pathname;

    void (async () => {
      const gpt = await getGpt();
      if (!gpt) return;
      // mountRotatingSlot destroys the stale slot from the previous page, takes
      // the next tag in the odd/even rotation, and retries the other tag on a
      // no-fill response.
      mountRotatingSlot(gpt, 'anchor', ANCHOR_SIZES, ANCHOR_DIV_ID, setFilled);
    })();
  }, [location.pathname, minimized]);

  // Once minimized the bar (and its GPT div) is removed entirely for the
  // session: the ad is gone and the underlying CTA buttons are revealed.
  if (!gamEnabled || minimized) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div
        className={
          cn(
            'relative w-full max-w-[393px]',
            filled
              ? 'pointer-events-auto border-t border-white/8 bg-plum-950/90 backdrop-blur-sm'
              : 'pointer-events-auto h-0 overflow-hidden',
          )
        }
      >
        {filled ? (
          <button
            type="button"
            onClick={() => setMinimized(true)}
            aria-label="Minimize ad"
            className="absolute right-1.5 top-1.5 z-10 grid size-7 place-items-center rounded-full bg-black/55 text-white/85 transition-colors hover:bg-black/75"
          >
            <Minus aria-hidden="true" className="size-4" />
          </button>
        ) : null}
        <div
          id={ANCHOR_DIV_ID}
          aria-hidden="true"
          className="mx-auto flex min-h-[50px] w-full items-center justify-center overflow-hidden pb-[env(safe-area-inset-bottom)]"
        />
      </div>
    </div>
  );
}
