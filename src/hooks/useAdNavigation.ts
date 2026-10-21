import { useCallback, type MouseEvent } from 'react';
import { useNavigate, type To } from 'react-router';
import { showInterstitial, showRewarded } from '@/lib/gpt';

/** Which full-screen ad plays before the navigation completes. */
export type AdKind = 'interstitial' | 'rewarded';

/**
 * Navigates behind an ad: the interstitial (Continue / clip taps) plays first,
 * then the route changes. The interstitial is the custom blurred modal in
 * gpt.ts; the rewarded ad (kept here for any click-gated use, though it now
 * auto-plays on the Welcome page mount) is GPT's native out-of-page format.
 * When GAM is off the ad promise resolves immediately, so this behaves like a
 * plain `navigate(to)` — which is exactly how the tests exercise the flow.
 */
export function useAdNavigation() {
  const navigate = useNavigate();

  const runAd = useCallback(async (kind: AdKind): Promise<void> => {
    try {
      await (kind === 'rewarded' ? showRewarded() : showInterstitial());
    } catch {
      /* an ad that throws must never trap the user on the current screen */
    }
  }, []);

  /** Await the ad, then go to `to`. Use from a form submit handler. */
  const navigateWithAd = useCallback(
    async (kind: AdKind, to: To): Promise<void> => {
      await runAd(kind);
      navigate(to);
    },
    [navigate, runAd],
  );

  /**
   * onClick handler for a <Link>: plays the ad, then navigates to `to`. The
   * link keeps its real href so middle-click / "open in new tab" and no-JS
   * still work — those are left untouched and only a plain left click is gated.
   */
  const guardLink = useCallback(
    (kind: AdKind, to: To) => (event: MouseEvent<HTMLAnchorElement>): void => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      void navigateWithAd(kind, to);
    },
    [navigateWithAd],
  );

  return { runAd, navigateWithAd, guardLink };
}
