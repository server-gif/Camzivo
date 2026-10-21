import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';

/** Blocks the gender step until the 18+ confirmation has passed. */
export function RequireAge({ children }: { children: ReactNode }) {
  const { state } = useOnboarding();
  if (!state.ageConfirmed) return <Navigate to="/age" replace />;
  return children;
}

/** Blocks the demo until both onboarding steps are complete. */
export function RequireOnboarding({ children }: { children: ReactNode }) {
  const { state } = useOnboarding();
  if (!state.ageConfirmed) return <Navigate to="/age" replace />;
  if (!state.genderCompleted) return <Navigate to="/gender" replace />;
  return children;
}
