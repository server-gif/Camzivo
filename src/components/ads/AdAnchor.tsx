import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { gamEnabled } from '@/config/ads';
import { getGpt, rotateAnchor } from '@/lib/gpt';

/**
 * The anchor ad shown on every screen. It is the GAM equivalent of an AdSense
 * anchor ad (support.google.com/adsense/answer/15484692): a Google-managed,
 * dismissible strip that sticks to the edge of the viewport — bottom on mobile,
 * side rail on desktop — can expand into a *dynamic anchor*, and serves on both
 * form factors. The out-of-page ANCHOR slot is defined and revealed once inside
 * `getGpt` (see `src/lib/gpt.ts`), so this component's first job is to make sure
 * GPT has booted; Google injects and owns the overlay (collapse/dismiss UI
 * included), so we render no DOM of our own. When `VITE_GAM_ENABLED` is off it
 * does nothing. Because it lives in RootLayout, booting it here puts the anchor
 * on every page.
 *
 * Odd/even tag rotation: on every navigation the component asks `rotateAnchor`
 * to destroy the slot and rebuild it on the *other* configured anchor unit, so
 * both live tags get requests and an empty one hands over to its pair on the
 * next page view. The first render only boots GPT (boot already defined the
 * first tag), and the pathname guard makes StrictMode's double-invoke a no-op.
 */
export function AdAnchor() {
  const location = useLocation();
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    if (!gamEnabled) return;
    if (lastPathname.current === null) {
      // First mount: booting GPT defines + reveals the managed anchor on the
      // first tag of the rotation.
      lastPathname.current = location.pathname;
      void getGpt();
      return;
    }
    if (lastPathname.current !== location.pathname) {
      // A real navigation: swap the anchor to the next tag in the rotation.
      lastPathname.current = location.pathname;
      rotateAnchor();
    }
  }, [location.pathname]);

  return null;
}
