import { RefreshCw } from 'lucide-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { Button, buttonVariants } from '@/components/ui/button';

/** Shown if a route throws, e.g. a lazy chunk fails to download after a redeploy. */
export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'The page failed to load. This can happen after the site is updated.';
  return (
    <main id="main" className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-fg-muted">{message}</p>
      <div className="flex gap-3">
        <Button onClick={() => window.location.reload()}>
          <RefreshCw aria-hidden="true" /> Reload
        </Button>
        <Link to="/" className={buttonVariants({ variant: 'secondary' })}>
          Home
        </Link>
      </div>
    </main>
  );
}
