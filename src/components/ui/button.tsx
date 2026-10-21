import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * shadcn/ui-style button. Use `buttonVariants()` to give a router <Link>
 * the same appearance without nesting interactive elements.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap select-none transition-[background-color,background-image,color,box-shadow,transform,opacity] duration-200 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] [&_svg]:size-[1.1em] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-violet-strong to-[#2563eb] text-white shadow-[0_8px_30px_-8px] shadow-violet/60 hover:shadow-violet/90 hover:brightness-110',
        gradient: 'btn-gradient shadow-[0_10px_32px_-10px] shadow-violet/70 hover:brightness-110',
        secondary: 'bg-ink-800 text-fg ring-1 ring-white/10 hover:bg-ink-700',
        ghost: 'text-fg-muted hover:bg-white/5 hover:text-fg',
        outline: 'text-fg ring-1 ring-white/20 hover:bg-white/5 hover:ring-white/35',
        danger: 'bg-danger-bg text-danger ring-1 ring-danger/40 hover:bg-danger/20',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-[0.95rem]',
        lg: 'h-13 px-7 text-base',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
