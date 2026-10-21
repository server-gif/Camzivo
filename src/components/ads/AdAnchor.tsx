import { useEffect, useRef, useState } from 'react';
import { adUnits, gamEnabled } from '@/config/ads';
import { getGpt, mountInPageSlot } from '@/lib/gpt';

/** Mobile-first sizes for the bottom anchor strip. */
const ANCHOR_SIZES: unknown[] = [
  [320, 50],
  [320, 100],
  [300, 100],
];

/** Unique div id — GPT requires a globally unique slot element id. */
const ANCHOR_DIV_ID = 'gam-anchor-slot';

/**
 * The anchor ad pinned to the bottom of the viewport on every screen. It is a
 * fixed, centered strip that sits above the page but below dialogs; when
 * `VITE_GAM_ENABLED` is off it renders nothing at all. While no ad has filled
 * the slot the strip stays collapsed (zero height), so an empty placeholder
 * never floats above the page — the GPT div is still in the DOM (display:none
 * would break the render), just clipped by a zero-height overflow-hidden box.
 */
export function AdAnchor() {
  const mounted = useRef(false);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    // Same StrictMode-safe pattern as AdBanner: the `mounted` guard prevents a
    // double-mount, and there is no cancelling cleanup that would otherwise
    // abort the run that defines the slot.
    if (!gamEnabled || mounted.current) return;
    mounted.current = true;

    void (async () => {
      const gpt = await getGpt();
      if (!gpt) return;
      mountInPageSlot(gpt, adUnits.anchor, ANCHOR_SIZES, ANCHOR_DIV_ID, setFilled);
    })();
  }, []);

  if (!gamEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div
        className={
          filled
            ? 'pointer-events-auto w-full max-w-[393px] border-t border-white/8 bg-plum-950/90 backdrop-blur-sm'
            : 'pointer-events-auto h-0 w-full max-w-[393px] overflow-hidden'
        }
      >
        <div
          id={ANCHOR_DIV_ID}
          aria-hidden="true"
          className="mx-auto flex min-h-[50px] w-full items-center justify-center overflow-hidden pb-[env(safe-area-inset-bottom)]"
        />
      </div>
    </div>
  );
}
