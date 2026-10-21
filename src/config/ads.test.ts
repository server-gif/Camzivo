import { describe, expect, it } from 'vitest';
import { DEFAULT_AD_UNITS, resolveAdUnitList, resolveAdUnits, resolveGamEnabled, rotateAdUnit } from './ads';

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
      VITE_GAM_BANNER_AD_UNIT_1: '/123/site/banner-1',
      VITE_GAM_BANNER_AD_UNIT_2: '/123/site/banner-2',
      VITE_GAM_INTERSTITIAL_AD_UNIT_1: '/123/site/interstitial',
      VITE_GAM_REWARDED_AD_UNIT: '/123/site/rewarded',
      VITE_GAM_ANCHOR_AD_UNIT_1: '/123/site/anchor',
    });
    expect(units).toEqual({
      banner: ['/123/site/banner-1', '/123/site/banner-2'],
      interstitial: ['/123/site/interstitial'],
      rewarded: '/123/site/rewarded',
      anchor: ['/123/site/anchor'],
    });
  });

  it('falls back to Google sample units for blank or missing values', () => {
    // A placement with no configured tag resolves to a single-item list holding
    // its first sample unit (rotation then keeps reusing it).
    expect(resolveAdUnits({ VITE_GAM_BANNER_AD_UNIT_1: '  ', VITE_GAM_REWARDED_AD_UNIT: '/x/y' })).toEqual({
      banner: [DEFAULT_AD_UNITS.banner[0]],
      interstitial: [DEFAULT_AD_UNITS.interstitial[0]],
      anchor: [DEFAULT_AD_UNITS.anchor[0]],
      rewarded: '/x/y',
    });
  });
});

describe('rotation', () => {
  it('collects both configured tags and drops blanks', () => {
    expect(resolveAdUnitList(' /a/one ', '  ', '/a/default')).toEqual(['/a/one']);
    expect(resolveAdUnitList('/a/one', '/a/two', undefined)).toEqual(['/a/one', '/a/two']);
  });

  it('alternates odd/even across the configured tags', () => {
    const units = ['/a/one', '/a/two'];
    expect(rotateAdUnit(units, 0)).toBe('/a/one');
    expect(rotateAdUnit(units, 1)).toBe('/a/two');
    expect(rotateAdUnit(units, 2)).toBe('/a/one');
    // A placement with a single tag just keeps reusing it.
    expect(rotateAdUnit(['/a/only'], 5)).toBe('/a/only');
  });
});
