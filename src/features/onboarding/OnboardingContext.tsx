import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { initialOnboardingState, type Gender, type OnboardingState } from './onboarding.types';
import { loadOnboardingState, saveOnboardingState } from './onboarding.utils';

type OnboardingContextValue = {
  state: OnboardingState;
  confirmAge: () => void;
  denyAge: () => void;
  selectGender: (gender: Gender) => void;
  /** Clears progress and the gender choice. */
  resetSession: () => void;
  /** Visitor chose "Under 18" but is leaving the gate; lets them restart the flow. */
  clearAgeDenial: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

type OnboardingProviderProps = {
  children: ReactNode;
  /** For tests: start from a known state instead of sessionStorage. */
  initialState?: Partial<OnboardingState>;
};

export function OnboardingProvider({ children, initialState }: OnboardingProviderProps) {
  const [state, setState] = useState<OnboardingState>(() =>
    initialState ? { ...initialOnboardingState, ...initialState } : loadOnboardingState(),
  );

  useEffect(() => {
    saveOnboardingState(state);
  }, [state]);

  const confirmAge = useCallback(() => {
    setState((prev) => (prev.ageDenied ? prev : { ...prev, ageConfirmed: true }));
  }, []);

  const denyAge = useCallback(() => {
    setState({ ...initialOnboardingState, ageDenied: true });
  }, []);

  const selectGender = useCallback((gender: Gender) => {
    setState((prev) => (prev.ageConfirmed ? { ...prev, gender, genderCompleted: true } : prev));
  }, []);

  const resetSession = useCallback(() => {
    setState((prev) => ({ ...initialOnboardingState, ageDenied: prev.ageDenied }));
  }, []);

  const clearAgeDenial = useCallback(() => {
    setState((prev) => (prev.ageDenied ? initialOnboardingState : prev));
  }, []);

  const value = useMemo(
    () => ({ state, confirmAge, denyAge, selectGender, resetSession, clearAgeDenial }),
    [state, confirmAge, denyAge, selectGender, resetSession, clearAgeDenial],
  );

  return <OnboardingContext value={value}>{children}</OnboardingContext>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = use(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>.');
  return ctx;
}
