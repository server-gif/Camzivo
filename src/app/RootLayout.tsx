import { LoaderCircle } from 'lucide-react';
import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { AdAnchor } from '@/components/ads/AdAnchor';
import { ScrollManager } from './ScrollManager';

export function PageFallback() {
  return (
    <div role="status" className="grid flex-1 place-items-center py-32 text-fg-muted">
      <LoaderCircle aria-hidden="true" className="size-8 animate-spin motion-reduce:animate-none" />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}

export function RootLayout() {
  return (
    <>
      <ScrollManager />
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
      {/* Bottom-anchored ad overlays every screen while GAM is enabled. The top
          banner is not here — it renders inside OnboardingLayout above the title. */}
      <AdAnchor />
    </>
  );
}
