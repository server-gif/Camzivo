/**
 * Google Ad Manager GPT (Google Publisher Tags) loader and helpers.
 *
 * The whole module is a thin, defensive wrapper over the one global `googletag`
 * object the GPT script (`gpt.js`) installs. It is the only place that touches
 * `window.googletag`, so the React side stays declarative.
 *
 * Everything short-circuits when `gamEnabled` is false: no script is injected
 * and `showInterstitial` / `showRewarded` resolve immediately, so a caller can
 * always `await` them before navigating without ever being blocked when ads are
 * off (which is how the test suite runs). Failures inside the ad stack are
 * swallowed on purpose — an ad error must never strand the user on a page.
 *
 * The rewarded placement uses GPT's *out-of-page* REWARDED format (the only way
 * the `rewarded_web_example` dummy tag renders). The interstitial instead uses
 * an ordinary *in-page* slot that lives inside a custom blurred full-screen
 * modal (`.inter` in globals.css), mirroring the reference site: the modal is
 * kept in the DOM permanently and pre-filled, and `showInterstitial` reveals it
 * on every Continue click. Navigation is held until the user taps Close (or
 * presses Escape), then the slot is re-requested so the next click is ready.
 */

import { adUnits, gamEnabled } from '@/config/ads';

const GPT_SRC = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
const GPT_SCRIPT_ID = 'gam-gpt-loader';

/** How long a rewarded creative may take to arrive before we stop waiting. */
const REWARDED_FILL_TIMEOUT_MS = 3500;
/** Cap on how long a *shown* rewarded overlay may hold the app before we move on. */
const REWARDED_SHOW_TIMEOUT_MS = 20000;
/** The interstitial in-page slot's div id; it lives inside the modal in the DOM. */
const INTERSTITIAL_DIV_ID = 'gam-interstitial-slot';
/** Creative sizes GPT can serve into the modal card for the interstitial unit. */
const INTERSTITIAL_SIZES: unknown[] = [[300, 250], [300, 357], [320, 480]];

// A minimal surface of the GPT API — only the pieces this app actually calls.
type GptSlot = {
  addService: (service: GptPubAds) => GptSlot;
  getSlotElementId: () => string;
  setTargeting?: (key: string, value: string) => void;
  setConfig?: (config: Record<string, unknown>) => void;
  setResponsiveOverlayFormat?: (format: number) => void;
};

type GptEvent = {
  slot?: GptSlot;
  isEmpty?: boolean;
  makeRewardedVisible?: () => void;
};

type GptListener = (event: GptEvent) => void;

type GptPubAds = {
  addEventListener: (event: string, listener: GptListener) => void;
  removeEventListener: (event: string, listener: GptListener) => void;
  getSlots: () => GptSlot[];
  // GPT's refresh is overloaded: refresh(options) for a full refresh, or
  // refresh(slots, options) for a targeted one. Accept both shapes.
  refresh: (slotsOrOptions?: unknown, options?: Record<string, unknown>) => void;
};

type Googletag = {
  cmd: { push: (fn: () => void) => void };
  pubads: () => GptPubAds;
  defineSlot: (adUnit: string, size: unknown, divId: string) => GptSlot | null;
  defineOutOfPageSlot: (adUnit: string, format?: number) => GptSlot | null;
  display: (target: GptSlot | string) => void;
  destroySlots: (slots: GptSlot[]) => void;
  enableServices: () => void;
  enums?: {
    OutOfPageFormat?: Record<string, number | undefined>;
    ResponsiveOverlayFormat?: Record<string, number | undefined>;
  };
};

type GptWindow = Window & { googletag?: Googletag };

/** Resolve once, at most, after gpt.js has loaded and services are enabled. */
let bootPromise: Promise<Googletag | null> | null = null;

// Native out-of-page rewarded is kept ONLY as a fallback for when the rewarded
// creative will not fill our custom in-page modal slot (see showRewarded). It is
// defined before enableServices() so its initial request is fetched; the
// `rewardedWanted` gate stops it popping up without the app asking.
let rewardedSlot: GptSlot | null = null;
let rewardedReadyEvent: GptEvent | null = null;
let rewardedWanted = false;

// Persistent custom modal for the interstitial. It is built once at boot and
// kept in the DOM (hidden) so GPT renders the creative into an in-page slot
// inside it; we reveal/hide it on demand. `hasAd` tracks whether the last
// request filled the slot, so the modal only opens when there is a real
// creative to show. Rewarded is NOT shown this way — rewarded creatives never
// fill an in-page slot, so they can only appear via GPT's native out-of-page
// overlay (see showRewardedNative), whose white desktop backdrop we cannot restyle.
type AdModal = {
  root: HTMLElement;
  closeBtn: HTMLElement;
  slot: GptSlot | null;
  hasAd: boolean;
};
let interstitialModal: AdModal | null = null;

// Fill-state listener registered by `mountInPageSlot`, keyed by div id so a
// remount of the same slot replaces (instead of stacks) its listener.
const fillListeners = new Map<string, GptListener>();

export function getGpt(): Promise<Googletag | null> {
  if (!gamEnabled || typeof document === 'undefined') return Promise.resolve(null);
  if (bootPromise) return bootPromise;

  bootPromise = new Promise<Googletag | null>((resolve) => {
    const w = window as GptWindow;
    if (!w.googletag) {
      // Standard GPT bootstrap: an object whose `cmd` is a real array of
      // queued callbacks that gpt.js flushes as soon as it is ready.
      w.googletag = { cmd: [] } as unknown as Googletag;
    }
    const gpt = w.googletag;

    // Whatever runs in this queue executes the moment the script is loaded, and
    // any later push runs synchronously, so services are enabled exactly once.
    gpt.cmd.push(() => {
      const pubads = gpt.pubads();
      const oop = gpt.enums?.OutOfPageFormat;

      // Define the native out-of-page rewarded slot now (fallback only), before
      // enableServices(), so its first request is fetched and ready on demand.
      try {
        rewardedSlot = gpt.defineOutOfPageSlot(adUnits.rewarded, oop?.REWARDED) ?? null;
        if (rewardedSlot) rewardedSlot.addService(pubads);
      } catch {
        rewardedSlot = null;
      }

      // Rewarded fires this when the fetched ad is ready. Only reveal it once the
      // app has asked (Welcome page calls showRewarded); never pop it unprompted.
      try {
        pubads.addEventListener('rewardedSlotReady', (event) => {
          rewardedReadyEvent = event;
          if (rewardedWanted) event.makeRewardedVisible?.();
        });
      } catch {
        /* older builds without the event still resolve via the timeout */
      }

      // Deliberately NOT enabling single-request mode: the in-page banner and
      // anchor are defined from React effects that run *after* enableServices(),
      // so each has to fetch on its own (async rendering) via a targeted refresh.
      gpt.enableServices();

      // Render the rewarded slot now rather than at ask time: the overlay can
      // only be shown once GPT has built it, so warming it here is what lets a
      // page deeper in the flow (the girl-find screen) show it immediately.
      if (rewardedSlot) reveal(gpt, rewardedSlot);

      // Build the custom interstitial modal and fire its first request now, so
      // the creative is loaded before the user acts.
      interstitialModal = createAdModal(gpt, {
        adUnit: adUnits.interstitial,
        divId: INTERSTITIAL_DIV_ID,
        sizes: INTERSTITIAL_SIZES,
        targeting: { format: 'interstitial' },
      });

      resolve(gpt);
    });

    if (!document.getElementById(GPT_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = GPT_SCRIPT_ID;
      script.async = true;
      script.src = GPT_SRC;
      document.head.appendChild(script);
    }
  });

  return bootPromise;
}

/**
 * Define an ordinary in-page slot (banner / sticky anchor) and render it into
 * the div identified by `divId`, which must already exist in the document.
 *
 * Self-healing across remounts: the banner lives inside the per-screen layout,
 * so it unmounts and mounts again on every navigation. A slot left registered
 * under the same div id would make `defineSlot` bail out (GPT rejects duplicate
 * ids) and the fresh box would stay empty — so any stale slot for this id is
 * destroyed first, then a new one is defined and refreshed.
 *
 * When `onFilled` is given it is called with `true` once GPT actually renders a
 * creative into this slot and with `false` on an empty/no-fill render, so a
 * caller can keep the ad container collapsed until there is something to show.
 */
export function mountInPageSlot(
  gpt: Googletag,
  adUnit: string,
  size: unknown,
  divId: string,
  onFilled?: (filled: boolean) => void,
): GptSlot | null {
  try {
    const pubads = gpt.pubads();
    const stale = pubads
      .getSlots()
      .filter((existing) => existing.getSlotElementId() === divId);
    if (stale.length > 0) gpt.destroySlots(stale);

    // Captured by the fill listeners below; assigned right after the slot is
    // defined. Events only fire asynchronously, well after the assignment.
    let filledSlot: GptSlot | null = null;

    if (onFilled) {
      const previous = fillListeners.get(divId);
      if (previous) {
        try {
          pubads.removeEventListener('slotRenderEnded', previous);
        } catch {
          /* removal is best-effort */
        }
      }
      const render: GptListener = (event) => {
        if (event.slot === filledSlot) onFilled(event.isEmpty !== true);
      };
      fillListeners.set(divId, render);
      try {
        pubads.addEventListener('slotRenderEnded', render);
      } catch {
        /* without the event the container simply stays in its default state */
      }
    }

    const slot = gpt.defineSlot(adUnit, size, divId);
    if (!slot) return null;
    filledSlot = slot;
    slot.addService(pubads);
    gpt.display(divId);
    // Services were enabled before this slot existed (React mounts later), so
    // ask for it explicitly. This is the call that actually fills the box.
    pubads.refresh([slot], { changeCorrelator: false });
    return slot;
  } catch {
    /* an ad that cannot be shown should not take the page down with it */
    return null;
  }
}

/**
 * Show the interstitial for the current Continue click: reveal the persistent
 * modal (holding navigation) when a creative is loaded, resolve once the user
 * taps Close / presses Escape, then re-request so the next click is ready. Await
 * this before navigating.
 */
export function showInterstitial(): Promise<void> {
  if (!gamEnabled || typeof document === 'undefined') return Promise.resolve();

  return getGpt().then((gpt) => {
    if (!gpt || !interstitialModal) return;
    return openAdModal(interstitialModal, gpt);
  });
}

/**
 * Show the rewarded ad (Welcome on mount; girl-find when the Connect button
 * appears) via GPT's native out-of-page REWARDED overlay, using the rewarded
 * unit `adUnits.rewarded`. Rewarded creatives only render through this native
 * overlay — they never fill an in-page slot, so we cannot host them in our own
 * dark modal. The overlay is a cross-origin frame whose look is Google's own: a
 * white backdrop when tested on desktop, a full-screen video on a real mobile
 * viewport. Resolves once the user dismisses it.
 */
export function showRewarded(): Promise<void> {
  if (!gamEnabled || typeof document === 'undefined') return Promise.resolve();

  return getGpt().then((gpt) => {
    if (!gpt) return;
    return showRewardedNative(gpt);
  });
}

/**
 * Pre-fetch a rewarded creative WITHOUT showing it, so a later `showRewarded()`
 * reveals instantly instead of waiting for the network. Call this as early as
 * convenient (e.g. the girl-find page fires it on mount, during its "finding"
 * countdown, so the ad is ready the moment the Connect button appears). It is a
 * no-op when a creative is already on hand or GAM is off; the boot listener
 * stores the fill but only reveals it once `showRewarded` opts in.
 */
export function warmRewarded(): void {
  if (!gamEnabled || typeof document === 'undefined') return;
  void getGpt().then((gpt) => {
    if (gpt && !rewardedReadyEvent) requestRewarded(gpt);
  });
}

/** Reveal a modal (if filled), resolve on Close/Escape, then refill for next time. */
function openAdModal(modal: AdModal, gpt: Googletag): Promise<void> {
  if (!modal.slot) return Promise.resolve();

  // No creative loaded → don't block; fetch one for next time and resolve now.
  if (!modal.hasAd) {
    refillAdModal(modal, gpt);
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const finish = () => {
      modal.root.classList.remove('inter--open');
      modal.root.setAttribute('aria-hidden', 'true');
      modal.closeBtn.removeEventListener('click', finish);
      document.removeEventListener('keydown', onCloseKey);
      document.body.style.overflow = '';
      refillAdModal(modal, gpt);
      resolve();
    };
    const onCloseKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish();
    };

    modal.root.classList.add('inter--open');
    modal.root.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.closeBtn.addEventListener('click', finish);
    document.addEventListener('keydown', onCloseKey);
  });
}

type AdModalSpec = {
  adUnit: string;
  divId: string;
  sizes: unknown[];
  targeting?: Record<string, string>;
};

/**
 * Build (once) an always-present hidden modal and define an in-page slot into
 * its card, then request the first creative. A persistent `slotRenderEnded`
 * listener keeps `hasAd` current so the modal only opens when there is really
 * something to show.
 */
function createAdModal(gpt: Googletag, spec: AdModalSpec): AdModal | null {
  if (typeof document === 'undefined') return null;

  const root = document.createElement('div');
  root.className = 'inter';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Advertisement');
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML =
    '<div class="inter__stack">' +
    '<button type="button" class="inter__close">Close</button>' +
    `<div class="inter__card"><div id="${spec.divId}" class="inter__ad"></div></div>` +
    '</div>';
  document.body.appendChild(root);

  const closeBtn = root.querySelector('.inter__close') as HTMLElement;
  const modal: AdModal = { root, closeBtn, slot: null, hasAd: false };

  try {
    const pubads = gpt.pubads();
    pubads.addEventListener('slotRenderEnded', (event) => {
      if (event.slot && event.slot.getSlotElementId() === spec.divId) {
        modal.hasAd = event.isEmpty !== true;
      }
    });

    const slot = gpt.defineSlot(spec.adUnit, spec.sizes, spec.divId);
    if (slot) {
      try {
        // setConfig is the current API (slot.setTargeting is deprecated); fall
        // back to it on builds without setConfig. Purely a nicety — the unit path
        // already declares the format.
        if (spec.targeting) {
          if (typeof slot.setConfig === 'function') slot.setConfig({ targeting: spec.targeting });
          else {
            for (const [key, value] of Object.entries(spec.targeting)) slot.setTargeting?.(key, value);
          }
        }
      } catch {
        /* targeting is a nicety; the unit path already describes the format */
      }
      slot.addService(pubads);
      modal.slot = slot;
      gpt.display(spec.divId);
      // Services were already enabled, so request this slot explicitly.
      pubads.refresh([slot]);
    }
  } catch {
    /* modal stays but never opens; callers fall back / proceed without an ad */
  }
  return modal;
}

/** Re-request a modal's creative (full refresh) so the next open is filled. */
function refillAdModal(modal: AdModal, gpt: Googletag): void {
  if (!modal.slot) return;
  try {
    // A full refresh (default correlator) is required to re-fill the same slot;
    // a targeted changeCorrelator:false one will not return a new creative.
    gpt.pubads().refresh([modal.slot]);
  } catch {
    /* best-effort */
  }
}

/**
 * GPT's native out-of-page rewarded overlay.
 *
 * The slot is rendered at boot (see `getGpt`), so a creative is normally already
 * fetched by the time a page asks and showing it is one `makeRewardedVisible()`
 * call. When nothing is on hand the slot is re-requested and the wait is capped
 * by `REWARDED_FILL_TIMEOUT_MS` — a slow or unfilled ad must not strand the
 * page. Once the overlay is actually up, that short timer is dropped in favour
 * of the longer `REWARDED_SHOW_TIMEOUT_MS`, and `rewardedSlotClosed` normally
 * resolves well before it.
 */
function showRewardedNative(gpt: Googletag): Promise<void> {
  if (!rewardedSlot) return Promise.resolve();
  const pubads = gpt.pubads();

  return new Promise<void>((resolve) => {
    let settled = false;
    let fillTimer = 0;
    let showTimer = 0;

    function onReady() {
      if (settled) return;
      // Filled: stop counting the wait and let the ad run under its own cap.
      window.clearTimeout(fillTimer);
      showTimer = window.setTimeout(finish, REWARDED_SHOW_TIMEOUT_MS);
      setAdBlur(true);
    }

    function finish() {
      if (settled) return;
      settled = true;
      rewardedWanted = false;
      window.clearTimeout(fillTimer);
      window.clearTimeout(showTimer);
      try {
        pubads.removeEventListener('rewardedSlotReady', onReady);
        pubads.removeEventListener('rewardedSlotClosed', finish);
      } catch {
        /* removal is best-effort */
      }
      setAdBlur(false);
      // Queue the next creative straight away so a later ask is already warm.
      requestRewarded(gpt);
      resolve();
    }

    rewardedWanted = true;

    try {
      pubads.addEventListener('rewardedSlotReady', onReady);
      pubads.addEventListener('rewardedSlotClosed', finish);
    } catch {
      /* older builds without the events still resolve via the timeouts */
    }

    // Consume the stored event: showing it twice is not possible, and holding on
    // to a spent one would make every later ask wait for nothing.
    const ready = rewardedReadyEvent;
    rewardedReadyEvent = null;
    if (ready) {
      try {
        ready.makeRewardedVisible?.();
      } catch {
        requestRewarded(gpt);
      }
    } else {
      // Nothing pre-fetched is on hand, so ask for one now. The boot listener
      // shows it the instant it fills, because `rewardedWanted` is set.
      requestRewarded(gpt);
    }

    fillTimer = window.setTimeout(finish, REWARDED_FILL_TIMEOUT_MS);
  });
}

/** Ask GPT for a fresh rewarded creative so the next `showRewarded` is warm. */
function requestRewarded(gpt: Googletag): void {
  if (!rewardedSlot) return;
  try {
    // A full refresh (default correlator) is what returns a new creative; a
    // changeCorrelator:false one would hand back the spent one (see refillAdModal).
    gpt.pubads().refresh([rewardedSlot]);
  } catch {
    /* best-effort: without a fill the caller falls back to its timeout */
  }
}

/**
 * Reveal a pre-fetched out-of-page slot. Interstitials take a responsive overlay
 * format first (Google's recommended call before display).
 */
function reveal(gpt: Googletag, slot: GptSlot, overlayFormat?: 'TOP'): void {
  try {
    const format = overlayFormat ? gpt.enums?.ResponsiveOverlayFormat?.[overlayFormat] : undefined;
    if (format != null) slot.setResponsiveOverlayFormat?.(format);
  } catch {
    /* the overlay format is a nicety; display still proceeds */
  }
  try {
    gpt.display(slot.getSlotElementId());
  } catch {
    /* out-of-page slots sometimes have no div to render into */
  }
}

/** Toggle the blurred-app backdrop while a full-screen ad is open. */
function setAdBlur(on: boolean): void {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('gam-ad-open', on);
}
