import { describe, expect, it } from 'vitest';
import { ONBOARDING_STORAGE_KEY, getRequiredStep, loadOnboardingState, saveOnboardingState } from './onboarding.utils';
import { initialOnboardingState } from './onboarding.types';

describe('onboarding storage', () => {
  it('persists only booleans — never the gender value', () => {
    saveOnboardingState({ ...initialOnboardingState, ageConfirmed: true, gender: 'female', genderCompleted: true });
    const raw = sessionStorage.getItem(ONBOARDING_STORAGE_KEY) ?? '';
    expect(JSON.parse(raw)).toEqual({ ageConfirmed: true, ageDenied: false, genderCompleted: true });
    expect(raw).not.toContain('female');
  });

  it('ignores tampered values and lets a denial override confirmation', () => {
    sessionStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ ageConfirmed: true, ageDenied: true, genderCompleted: true }));
    expect(loadOnboardingState()).toMatchObject({ ageConfirmed: false, ageDenied: true, genderCompleted: false });
    sessionStorage.setItem(ONBOARDING_STORAGE_KEY, '{not json');
    expect(loadOnboardingState()).toEqual(initialOnboardingState);
  });

  it('reports the next required step', () => {
    expect(getRequiredStep(initialOnboardingState)).toBe('/age');
    expect(getRequiredStep({ ...initialOnboardingState, ageConfirmed: true })).toBe('/gender');
    expect(getRequiredStep({ ...initialOnboardingState, ageConfirmed: true, genderCompleted: true })).toBe('/');
  });
});
