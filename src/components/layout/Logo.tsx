import { useId } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';

export const BRAND_NAME = 'Camzivo';

/** Original wordmark: a rounded "lens" with a play notch. */
export function Logo({ className }: { className?: string }) {
  const gradientId = useId();
  return (
    <Link to="/" aria-label={`${BRAND_NAME} — Random Video Chat Demo, home`} className={cn('inline-flex items-center gap-2.5 rounded-lg font-display text-lg font-bold tracking-tight text-fg', className)}>
      <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="#141b34" />
        <rect x="5" y="9" width="15" height="14" rx="4" fill={`url(#${gradientId})`} />
        <path d="M22 13.5l5-3v11l-5-3z" fill="#22d3ee" />
        <circle cx="12.5" cy="16" r="2.5" fill="#0b1020" />
      </svg>
      <span>{BRAND_NAME}</span>
    </Link>
  );
}
