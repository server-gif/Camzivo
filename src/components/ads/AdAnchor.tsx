import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Minus } from 'lucide-react';
import { gamEnabled, nextAdUnit } from '@/config/ads';
import { getGpt, mountInPageSlot } from '@/lib/gpt';
import { cn } from '@/lib/utils';

/** Mobile-first sizes for the bottom anchor strip. */
const ANCHOR_SIZES: unknown[] = [
  [320, 50],
  [320, 100],
  [300, 100],
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
 * anchor tag from the rotation and calls mountInPageSlot which destroys the
 * previous slot and redefines a new one on the other unit. This keeps both live
 * anchor tags receiving traffic without depending on the out-of-page ANCHOR
 * format (which requires a special anchor-enabled unit and mobile-optimized
 * page eligibility that live GAM units often lack).
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
      // mountInPageSlot destroys the stale slot from the previous page before
      // defining a new one on the next tag in the odd/even rotation.
      mountInPageSlot(gpt, nextAdUnit('anchor'), ANCHOR_SIZES, ANCHOR_DIV_ID, setFilled);
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
