import { lazy } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import ClipsPage from '@/pages/ClipsPage';
import { RequireAge } from './guards';
import { RootLayout } from './RootLayout';
import { RouteError } from './RouteError';

// The live grid is the landing screen and ships in the main bundle; everything
// else is code-split.
const AgePage = lazy(() => import('@/pages/AgePage'));
const GenderPage = lazy(() => import('@/pages/GenderPage'));
const GirlFindPage = lazy(() => import('@/pages/GirlFindPage'));
const UserNotFoundPage = lazy(() => import('@/pages/UserNotFoundPage'));
const InfoPage = lazy(() => import('@/pages/InfoPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      // The live grid is the first screen; tapping a card starts the flow.
      { path: '/', element: <ClipsPage /> },
      { path: '/age', element: <AgePage /> },
      {
        path: '/gender',
        element: (
          <RequireAge>
            <GenderPage />
          </RequireAge>
        ),
      },
      // The grid moved to the home route; keep old /clips links working.
      { path: '/clips', element: <Navigate to="/" replace /> },
      { path: '/girl-find', element: <GirlFindPage /> },
      { path: '/connect', element: <UserNotFoundPage /> },
      { path: '/about', element: <InfoPage kind="about" /> },
      { path: '/privacy', element: <InfoPage kind="privacy" /> },
      { path: '/terms', element: <InfoPage kind="terms" /> },
      { path: '/contact', element: <InfoPage kind="contact" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
