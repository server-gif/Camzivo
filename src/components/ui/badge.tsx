import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide [&_svg]:size-3.5',
  {
    variants: {
      variant: {
        demo: 'bg-warning/15 text-warning ring-1 ring-warning/40',
        neutral: 'bg-white/6 text-fg-muted ring-1 ring-white/10',
        accent: 'bg-violet/15 text-violet-soft ring-1 ring-violet/35',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
