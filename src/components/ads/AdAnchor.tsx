import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { gamEnabled } from '@/config/ads';
import { getGpt, rotateAnchor } from '@/lib/gpt';

/**
 * The anchor ad shown on every screen. It is the GAM equivalent of an AdSense
 * anchor ad (see the referenced support doc): a Google-managed, dismissible
 * strip that sticks to the edge of the viewport — bottom on mobile, side rail on
 * desktop — and serves on both. The out-of-page slot is defined and revealed
 * once inside `getGpt` (see `src/lib/gpt.ts`), so this component's first job is
 * to make sure GPT has booted; Google injects and manages the overlay itself,
 * so we render no DOM of our own. When `VITE_GAM_ENABLED` is off it does
 * nothing. Because it lives in RootLayout, booting it here puts the anchor on
 * every page.
 *
 * Odd/even tag rotation: on every navigation the component asks `rotateAnchor`
 * to rebuild the slot on the *other* configured anchor unit, so both live tags
 * keep getting requests across the session. The very first render only boots
 * GPT (boot already defined the first tag), and the pathname guard makes
 * StrictMode's double-invoke a no-op.
 */
export function AdAnchor() {
  const location = useLocation();
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    if (!gamEnabled) return;
    if (lastPathname.current === null) {
      // First mount: booting GPT defines + reveals the anchor on the first tag.
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
