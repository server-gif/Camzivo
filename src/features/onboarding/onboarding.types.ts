export const AGE_RANGES = ['18-24', '25-31', '32-39', '40+'] as const;
export type AgeRange = (typeof AGE_RANGES)[number];

export const GENDERS = ['male', 'female'] as const;
export type Gender = (typeof GENDERS)[number];

/**
 * Minimal onboarding state. Note what is NOT here: the chosen age range is
 * never stored — only whether the 18+ confirmation passed.
 */
export type OnboardingState = {
  /** The visitor confirmed they are 18 or older. */
  ageConfirmed: boolean;
  /** The visitor chose "Under 18" this session; the gate stays closed until the tab is closed. */
  ageDenied: boolean;
  /** Gender choice. Kept in memory only, never written to storage. */
  gender: Gender | null;
  /** The gender step was completed (persisted as a boolean so a refresh keeps progress). */
  genderCompleted: boolean;
};

export const initialOnboardingState: OnboardingState = {
  ageConfirmed: false,
  ageDenied: false,
  gender: null,
  genderCompleted: false,
};