import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Providers } from '@/app/providers';
import { routes } from '@/app/router';
import type { OnboardingState } from '@/features/onboarding/onboarding.types';

/** Renders the real route tree at `path` with an in-memory history. */
export function renderRoute(path: string, initialOnboarding?: Partial<OnboardingState>) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const user = userEvent.setup();
  const utils = render(
    <Providers initialOnboarding={initialOnboarding}>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { ...utils, router, user };
}
