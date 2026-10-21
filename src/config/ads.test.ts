import { describe, expect, it } from 'vitest';
import { DEFAULT_AD_UNITS, resolveAdUnits, resolveGamEnabled } from './ads';

describe('resolveGamEnabled', () => {
  it('turns ads on only for an explicit truthy switch', () => {
    for (const value of ['1', 'true', 'TRUE', ' yes ', 'on']) {
      expect(resolveGamEnabled(value)).toBe(true);
    }
  });

  it('keeps ads off when the switch is missing or anything else', () => {
    for (const value of [undefined, '', '0', 'false', 'nope']) {
      expect(resolveGamEnabled(value)).toBe(false);
    }
  });
});

describe('resolveAdUnits', () => {
  it('uses the env-provided paths when present', () => {
    const units = resolveAdUnits({
      VITE_GAM_BANNER_AD_UNIT: '/123/site/banner',
      VITE_GAM_INTERSTITIAL_AD_UNIT: '/123/site/interstitial',
      VITE_GAM_REWARDED_AD_UNIT: '/123/site/rewarded',
      VITE_GAM_ANCHOR_AD_UNIT: '/123/site/anchor',
    });
    expect(units).toEqual({
      banner: '/123/site/banner',
      interstitial: '/123/site/interstitial',
      rewarded: '/123/site/rewarded',
      anchor: '/123/site/anchor',
    });
  });

  it('falls back to Google sample units for blank or missing values', () => {
    expect(resolveAdUnits({ VITE_GAM_BANNER_AD_UNIT: '  ', VITE_GAM_REWARDED_AD_UNIT: '/x/y' })).toEqual({
      ...DEFAULT_AD_UNITS,
      rewarded: '/x/y',
    });
  });
});
