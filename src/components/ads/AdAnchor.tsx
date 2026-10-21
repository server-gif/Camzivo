import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { gamEnabled } from '@/config/ads';
import { clearAnchor, rotateAnchor } from '@/lib/gpt';

/** The home/welcome route, where the anchor ad must NOT appear. */
const HOME_PATH = '/';

/**
 * The Google-managed anchor ad — the GPT equivalent of an AdSense anchor ad
 * (support.google.com/adsense/answer/15484692): a dismissible BOTTOM_ANCHOR
 * strip that sticks to the bottom edge and can expand into a dynamic anchor.
 * Google injects and owns the overlay (collapse/dismiss UI included), so this
 * component renders no DOM of its own; the slot is mounted, swapped and torn
 * down through `rotateAnchor` / `clearAnchor` in `src/lib/gpt.ts`. When
 * `VITE_GAM_ENABLED` is off it does nothing.
 *
 * Placement rule: the anchor is intentionally kept OFF the home/welcome screen
 * and ON every other route. On a non-home path the effect calls `rotateAnchor`,
 * which both mounts the anchor (first eligible view) and swaps it to the next
 * tag in the odd/even rotation (later navigations), so an empty unit hands over
 * to its pair across page views. On the home path it calls `clearAnchor`, which
 * tears the overlay down. The same-pathname guard makes StrictMode's immediate
 * double-invoke a no-op.
 */
export function AdAnchor() {
  const location = useLocation();
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    if (!gamEnabled) return;
    const path = location.pathname;
    // Ignore a re-run for the pathname we already handled (StrictMode's
    // double-invoke, or any effect re-trigger without a real navigation).
    if (lastPathname.current === path) return;
    lastPathname.current = path;
    if (path === HOME_PATH) clearAnchor();
    else rotateAnchor();
  }, [location.pathname]);

  return null;
}
