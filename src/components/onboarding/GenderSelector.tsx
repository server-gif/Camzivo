import type { ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { ChoiceCard } from '@/components/ui/choice-card';
import { FieldError } from '@/components/ui/field-error';
import type { Gender } from '@/features/onboarding/onboarding.types';

/**
 * Each card shows the same gradient avatar disc: dimmed and desaturated while
 * unselected (a muted dark disc), full colour once selected — and the card
 * border turns into a linear violet→magenta gradient ring (see ChoiceCard).
 */
const discClass =
  'size-full rounded-full object-cover opacity-40 grayscale transition duration-200 group-has-[:checked]:opacity-100 group-has-[:checked]:grayscale-0';

export const GENDER_OPTIONS: { value: Gender; label: string; icon: ReactNode; iconLeading: boolean }[] = [
  { value: 'male', label: 'Male', icon: <img src="/icons/male.png" alt="" className={discClass} />, iconLeading: true },
  { value: 'female', label: 'Female', icon: <img src="/icons/female-active.png" alt="" className={discClass} />, iconLeading: false },
];

type GenderSelectorProps = {
  registration: UseFormRegisterReturn<'gender'>;
  error?: string;
};

export function GenderSelector({ registration, error }: GenderSelectorProps) {
  const errorId = 'gender-error';
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="sr-only">How do you identify?</legend>
      <div className="grid gap-4">
        {GENDER_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            value={option.value}
            label={option.label}
            icon={option.icon}
            iconLeading={option.iconLeading}
            showIndicator={false}
            compact
            aria-invalid={error ? true : undefined}
            {...registration}
          />
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
