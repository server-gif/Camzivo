import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { buttonVariants } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <PageContainer className="bg-glow">
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:py-32">
        <p className="font-display text-7xl font-extrabold text-gradient sm:text-8xl" aria-hidden="true">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">This page skipped to the next clip</h1>
        <p className="mt-3 text-fg-muted">The address you followed doesn’t exist. Check the URL or head back to the start.</p>
        <Link to="/" className={`${buttonVariants()} mt-8`}>
          <ArrowLeft aria-hidden="true" /> Back to home
        </Link>
      </div>
    </PageContainer>
  );
}
