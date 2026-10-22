import { useEffect, useRef } from 'react';
import { gamEnabled } from '@/config/ads';
import { getGpt, mountRotatingSlot } from '@/lib/gpt';

/**
 * Banner size group — medium rectangle candidates plus 'fluid' so GAM can also
 * serve its responsive fluid creative into the same box. Listing wide
 * leaderboard / mobile-banner sizes is what made GPT serve a short, wide
 * strip; these square-ish sizes keep the box shape.
 */
const BANNER_SIZES: unknown[] = [[336, 280], 'fluid', [300, 250]];

/** Unique div id — GPT requires a globally unique slot element id. */
const BANNER_DIV_ID = 'gam-banner-slot';

/**
 * The boxed top banner, rendered inside the onboarding layout directly above
 * each screen's title. It mounts a GPT in-page slot into a bordered
 * "Advertisement" frame that inherits the card's width and padding. Because it
 * lives in the per-screen layout it remounts on every navigation; mountRotatingSlot
 * destroys the previous screen's slot first, so the fixed div id stays valid.
 * Each remount takes the next banner tag from the odd/even rotation, and if GAM
 * answers with no ad on that tag it immediately retries the other one, so the
 * box fills whenever either live unit has a creative. When `VITE_GAM_ENABLED`
 * is off it renders nothing at all.
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
      mountRotatingSlot(gpt, 'banner', BANNER_SIZES, BANNER_DIV_ID);
    })();
  }, []);

  if (!gamEnabled) return null;

  return (
    <div className="mt-10 flex w-full flex-col items-center">
      <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-wider text-fg-subtle">Advertisement</p>
      {/* The box must never clamp the creative's height: a fixed size plus
          overflow-hidden used to cut taller (e.g. fluid) creatives off. The
          min-height only holds the placeholder area while the slot is empty. */}
      <div className="flex w-full  items-center justify-center">
        <div id={BANNER_DIV_ID} aria-hidden="true" className="flex min-h-full w-full items-center justify-center" />
      </div>
    </div>
  );
}
