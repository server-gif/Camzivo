/**
 * Google Ad Manager (GAM) configuration.
 *
 * Every ad unit path and the master on/off switch come from `VITE_GAM_*`
 * environment variables, so switching from Google's sample/test units to real
 * production units is a config change and never a code change. See `.env`.
 *
 * When `VITE_GAM_ENABLED` is unset or false the whole ad layer is inert: the
 * GPT script is never loaded (see `src/lib/gpt.ts`), the banner and anchor
 * render nothing, and the Continue / Connect / clip buttons navigate straight
 * away with no ad in the way. That is also what the test suite pins.
 */

/** The four placements the app fills. */
export type GamAdUnits = {
  /** Top banner shown on every screen. */
  banner: string;
  /** Interstitial fired on Continue and when a clip card is tapped. */
  interstitial: string;
  /** Rewarded ad fired on the Connect button. */
  rewarded: string;
  /** Anchor ad pinned to the bottom of the viewport. */
  anchor: string;
};

/**
 * Google's official sample units, used when an env value is left blank so a
 * developer who only flips `VITE_GAM_ENABLED` still sees real test creatives
 * without a live GAM account.
 */
export const DEFAULT_AD_UNITS: GamAdUnits = {
  banner: '/21775744923/example/banner',
  interstitial: '/21775744923/example/interstitial',
  rewarded: '/22639388115/rewarded_web_example',
  anchor: '/21775744923/example/adaptive-banner',
};

const TRUTHY = new Set(['1', 'true', 'yes', 'on']);

/** Parse the master switch: only an explicit truthy value turns ads on. */
export function resolveGamEnabled(raw: string | undefined): boolean {
  return TRUTHY.has((raw ?? '').trim().toLowerCase());
}

/** Fall back to the sample unit when an env path is blank. */
export function resolveAdUnits(env: {
  VITE_GAM_BANNER_AD_UNIT?: string;
  VITE_GAM_INTERSTITIAL_AD_UNIT?: string;
  VITE_GAM_REWARDED_AD_UNIT?: string;
  VITE_GAM_ANCHOR_AD_UNIT?: string;
}): GamAdUnits {
  const pick = (value: string | undefined, fallback: string): string => {
    const trimmed = (value ?? '').trim();
    return trimmed === '' ? fallback : trimmed;
  };
  return {
    banner: pick(env.VITE_GAM_BANNER_AD_UNIT, DEFAULT_AD_UNITS.banner),
    interstitial: pick(env.VITE_GAM_INTERSTITIAL_AD_UNIT, DEFAULT_AD_UNITS.interstitial),
    rewarded: pick(env.VITE_GAM_REWARDED_AD_UNIT, DEFAULT_AD_UNITS.rewarded),
    anchor: pick(env.VITE_GAM_ANCHOR_AD_UNIT, DEFAULT_AD_UNITS.anchor),
  };
}

/** True when the build was told to load and show GAM ads. */
export const gamEnabled = resolveGamEnabled(import.meta.env.VITE_GAM_ENABLED);

/** The resolved ad unit paths, env-overridden with sample-unit fallbacks. */
export const adUnits: GamAdUnits = resolveAdUnits(import.meta.env);
