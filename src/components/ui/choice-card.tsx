import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ChoiceCardProps = Omit<ComponentProps<'input'>, 'type' | 'children'> & {
  label: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  /** Optional artwork swapped in while the card is selected. */
  activeIcon?: ReactNode;
  /** Renders the icon after the label (right side) instead of before it. */
  iconLeading?: boolean;
  /** Hide the round radio/check indicator; selection still shows via border and artwork. */
  showIndicator?: boolean;
  /** Tighter card: smaller avatar disc and less inner padding (used by the gender step). */
  compact?: boolean;
  type?: 'radio' | 'checkbox';
};

/**
 * A native radio/checkbox styled as a selectable card. Keyboard and
 * screen-reader behaviour come from the real input; selection is shown
 * via the radio indicator dot, not by changing the card background.
 */
export function ChoiceCard({ label, hint, icon, activeIcon, iconLeading = true, showIndicator = true, compact = false, className, type = 'radio', ...inputProps }: ChoiceCardProps) {
  const iconNode = icon ? (
    <span
      aria-hidden="true"
      className={cn('relative grid shrink-0 place-items-center overflow-hidden rounded-full', compact ? 'size-20' : 'size-28')}
    >
      {icon}
      {activeIcon ? <span className="absolute inset-0 hidden group-has-[:checked]:block">{activeIcon}</span> : null}
    </span>
  ) : null;

  return (
    <label
      className={cn(
        'group relative flex cursor-pointer items-center rounded-2xl border border-white/8 bg-plum-900/80 transition-all motion-safe:animate-fade-up',
        compact ? 'gap-4 px-5 py-4' : 'gap-6 px-6 py-7',
        'hover:border-violet/40',
        'has-[:checked]:border-transparent has-[:checked]:bg-gradient-to-r has-[:checked]:from-plum-900 has-[:checked]:to-violet/20',
        'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-violet',
        'has-[[aria-invalid=true]]:border-danger/60',
        className,
      )}
    >
      <input type={type} className="peer sr-only" {...inputProps} />
      {/* Linear-gradient border ring, shown only while the card is selected.
          Set via inline style so the `mask` shorthand is declared *before*
          `mask-composite` (Tailwind would emit them the other way and the
          shorthand resets the composite, filling the whole card). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-has-[:checked]:opacity-100"
        style={{
          padding: '2px',
          background: 'linear-gradient(120deg, var(--color-brand-violet), var(--color-brand-magenta))',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
        }}
      />
      {iconLeading ? iconNode : null}
      <span className="min-w-0 flex-1">
        <span className="block  font-semibold text-[16px]">{label}</span>
        {hint ? <span className="mt-0.5 block text-sm text-fg-muted">{hint}</span> : null}
      </span>
      {!iconLeading ? iconNode : null}
      {showIndicator ? (
        <span
          aria-hidden="true"
          className={cn(
            'grid size-[20px] shrink-0 place-items-center border-2 border-white/25 bg-transparent transition-colors',
            type === 'radio' ? 'rounded-full' : 'rounded-md',
            'group-has-[:checked]:border-white group-has-[:checked]:bg-white',
          )}
        >
          {type === 'radio' ? (
            <span className="size-2 rounded-full bg-plum-900 opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
          ) : null}
        </span>
      ) : null}
    </label>
  );
}
