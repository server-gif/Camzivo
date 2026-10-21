import { useEffect } from 'react';
import { BRAND_NAME } from '@/components/layout/Logo';

/** Sets a descriptive document title for each route (helps screen-reader users). */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${BRAND_NAME}`;
  }, [title]);
}
