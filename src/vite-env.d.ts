/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Master switch for Google Ad Manager. When unset/false the GPT script is
   * never loaded and every ad slot plus ad-gated button is a no-op.
   */
  readonly VITE_GAM_ENABLED?: string;

  /** Ad unit path for the top banner shown on every screen. */
  readonly VITE_GAM_BANNER_AD_UNIT?: string;

  /** Ad unit path for the interstitial fired on Continue and clip taps. */
  readonly VITE_GAM_INTERSTITIAL_AD_UNIT?: string;

  /** Ad unit path for the rewarded ad fired on the Connect button. */
  readonly VITE_GAM_REWARDED_AD_UNIT?: string;

  /** Ad unit path for the anchor ad pinned to the bottom of the viewport. */
  readonly VITE_GAM_ANCHOR_AD_UNIT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
