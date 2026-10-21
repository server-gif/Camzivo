/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Master switch for Google Ad Manager. When unset/false the GPT script is
   * never loaded and every ad slot plus ad-gated button is a no-op.
   */
  readonly VITE_GAM_ENABLED?: string;

  /** First banner tag; alternates with VITE_GAM_BANNER_AD_UNIT_2 per screen. */
  readonly VITE_GAM_BANNER_AD_UNIT_1?: string;

  /** Second banner tag (optional; leave blank to run a single tag). */
  readonly VITE_GAM_BANNER_AD_UNIT_2?: string;

  /** First interstitial tag; alternates with _2 on every modal refill. */
  readonly VITE_GAM_INTERSTITIAL_AD_UNIT_1?: string;

  /** Second interstitial tag (optional; leave blank to run a single tag). */
  readonly VITE_GAM_INTERSTITIAL_AD_UNIT_2?: string;

  /** Ad unit path for the rewarded ad (single tag). */
  readonly VITE_GAM_REWARDED_AD_UNIT?: string;

  /** First anchor tag; alternates with _2 on every navigation. */
  readonly VITE_GAM_ANCHOR_AD_UNIT_1?: string;

  /** Second anchor tag (optional; leave blank to run a single tag). */
  readonly VITE_GAM_ANCHOR_AD_UNIT_2?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
