import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

/**
 * Scrolls to `#hash` targets and to the top on new pages. Browser back/forward
 * (POP) navigations are left alone so the browser can restore position.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (hash) {
      // Wait a frame so lazily rendered sections exist before scrolling.
      const id = decodeURIComponent(hash.slice(1));
      const frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' });
      });
      return () => cancelAnimationFrame(frame);
    }
    if (navigationType !== 'POP') window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash, navigationType]);

  return null;
}
