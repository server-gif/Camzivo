import { cn } from '@/lib/utils';

/**
 * The four flow steps shown on every screen — the live-video grid, age, gender
 * and the search (girl-find) screen. The connect result screen intentionally
 * hides the bar. Icons live in `public/icons/`; each step has a muted (inactive)
 * and a gradient (active/completed) variant.
 */
export const ONBOARDING_STEPS = [
  { label: 'Live Video', icon: '/icons/Group 1171279948.png', activeIcon: '/icons/Group 1171279949.png' },
  { label: 'Age', icon: '/icons/Group 1171279947.png', activeIcon: '/icons/Group 1171279947 (1).png' },
  { label: 'Gender', icon: '/icons/Group 1171279946.png', activeIcon: '/icons/Group 1171279946 (1).png' },
  { label: 'Search', icon: '/icons/Group 1171279948.png', activeIcon: '/icons/Group 1171279949 (1).png' },
] as const;

type ProgressIndicatorProps = {
  /** Zero-based index into ONBOARDING_STEPS. */
  current: number;
  className?: string;
};

export function ProgressIndicator({ current, className }: ProgressIndicatorProps) {
  return (
    <nav aria-label="Progress" className={cn('mx-auto w-full max-w-md', className)}>
      <p className="sr-only">
        Step {current + 1} of {ONBOARDING_STEPS.length}: {ONBOARDING_STEPS[current]?.label ?? 'Search'}
      </p>
      <ol className="flex items-start">
        {ONBOARDING_STEPS.map((step, index) => {
          const reached = index <= current;
          const active = index === current;
          return (
            <li key={step.label} aria-current={active ? 'step' : undefined} className={cn('flex items-start', index > 0 && 'flex-1')}>
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn('-mx-1 mt-[16px] h-0.5 flex-1 min-w-6', index <= current ? 'bg-white' : 'bg-white/10')}
                />
              ) : null}
              <div className="relative z-10 flex shrink-0 flex-col items-center gap-1.5">
                <img
                  src={reached ? step.activeIcon : step.icon}
                  alt=""
                  aria-hidden="true"
                  className="size-9 rounded-full"
                />
                <span className={cn('whitespace-nowrap text-[11px] font-medium leading-none', active ? 'text-fg' : 'text-fg-subtle')}>{step.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
