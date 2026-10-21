import type { ReactNode } from 'react';
import { OnboardingProvider } from '@/features/onboarding/OnboardingContext';
import type { OnboardingState } from '@/features/onboarding/onboarding.types';

type ProvidersProps = { children: ReactNode; initialOnboarding?: Partial<OnboardingState> };

export function Providers({ children, initialOnboarding }: ProvidersProps) {
  return (
    <OnboardingProvider initialState={initialOnboarding}>{children}</OnboardingProvider>
  );
}
