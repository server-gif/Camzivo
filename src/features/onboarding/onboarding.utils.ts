import { initialOnboardingState, type OnboardingState } from './onboarding.types';

export const ONBOARDING_STORAGE_KEY = 'rvcd:onboarding:v1';

/** The only fields that ever reach storage: three booleans, no age, no gender. */
type PersistedOnboarding = Pick<OnboardingState, 'ageConfirmed' | 'ageDenied' | 'genderCompleted'>;

function getSessionStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    // Storage can throw in private modes or when blocked by the browser.
    return null;
  }
}

export function loadOnboardingState(): OnboardingState {
  const storage = getSessionStorage();
  if (!storage) return initialOnboardingState;
  try {
    const raw = storage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return initialOnboardingState;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return initialOnboardingState;
    const record = parsed as Record<string, unknown>;
    const ageDenied = record.ageDenied === true;
    const ageConfirmed = !ageDenied && record.ageConfirmed === true;
    return {
      ...initialOnboardingState,
      ageDenied,
      ageConfirmed,
      genderCompleted: ageConfirmed && record.genderCompleted === true,
    };
  } catch {
    return initialOnboardingState;
  }
}

export function saveOnboardingState(state: OnboardingState): void {
  const storage = getSessionStorage();
  if (!storage) return;
  const persisted: PersistedOnboarding = {
    ageConfirmed: state.ageConfirmed,
    ageDenied: state.ageDenied,
    genderCompleted: state.genderCompleted,
  };
  try {
    storage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // Ignore quota or permission errors; the in-memory state still works.
  }
}

export function clearOnboardingState(): void {
  try {
    getSessionStorage()?.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

/** Which route a visitor should be on, given their progress. */
export function getRequiredStep(state: OnboardingState): '/age' | '/gender' | '/clips' {
  if (!state.ageConfirmed) return '/age';
  if (!state.genderCompleted) return '/gender';
  return '/clips';
}
