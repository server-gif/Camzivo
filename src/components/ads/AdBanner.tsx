import { useEffect, useRef } from 'react';
import { gamEnabled, nextAdUnit } from '@/config/ads';
import { getGpt, mountInPageSlot } from '@/lib/gpt';

/**
 * A single medium-rectangle (300x250) — the classic Google "box" ad. Listing
 * wide leaderboard / mobile-banner sizes is what made GPT serve a short, wide
 * strip; pinning one square-ish size forces the box shape.
 */
const BANNER_SIZES: unknown[] = [[300, 250]];

/** Unique div id — GPT requires a globally unique slot element id. */
const BANNER_DIV_ID = 'gam-banner-slot';

/**
 * The boxed top banner, rendered inside the onboarding layout directly above
 * each screen's title. It mounts a GPT in-page slot into a bordered
 * "Advertisement" frame that inherits the card's width and padding. Because it
 * lives in the per-screen layout it remounts on every navigation; mountInPageSlot
 * destroys the previous screen's slot first, so the fixed div id stays valid.
 * Each remount takes the next banner tag from the odd/even rotation, so both
 * configured units keep receiving requests. When `VITE_GAM_ENABLED` is off it
 * renders nothing at all.
 */
export function AdBanner() {
  const mounted = useRef(false);

  useEffect(() => {
    // `mounted` keeps React StrictMode's double-invoke from defining the slot
    // twice within one screen. There is deliberately no cancelling cleanup: the
    // guard already makes the second run a no-op, and the previous screen's slot
    // is torn down on the *next* mount inside mountInPageSlot.
    if (!gamEnabled || mounted.current) return;
    mounted.current = true;

    void (async () => {
      const gpt = await getGpt();
      if (!gpt) return;
      mountInPageSlot(gpt, nextAdUnit('banner'), BANNER_SIZES, BANNER_DIV_ID);
    })();
  }, []);

  if (!gamEnabled) return null;

  return (
    <div className="mt-10 flex w-full flex-col items-center">
      <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-wider text-fg-subtle">Advertisement</p>
      <div className="flex h-[250px] w-[300px] max-w-full items-center justify-center overflow-hidden ">
        <div id={BANNER_DIV_ID} aria-hidden="true" className="flex h-full w-full items-center justify-center" />
      </div>
    </div>
  );
}
