import type { UseFormRegisterReturn } from 'react-hook-form';
import { ChoiceCard } from '@/components/ui/choice-card';
import { FieldError } from '@/components/ui/field-error';
import type { AgeRange } from '@/features/onboarding/onboarding.types';

/** The four 18+ ranges shown as cards; under-18 visitors use the opt-out link. */
export const AGE_OPTIONS: { value: AgeRange; label: string; hint?: string }[] = [
  { value: '18-24', label: '18-24' },
  { value: '25-31', label: '25-31' },
  { value: '32-39', label: '32-39' },
  { value: '40+', label: '40+' },
];

type AgeSelectorProps = {
  registration: UseFormRegisterReturn<'ageRange'>;
  error?: string;
};

export function AgeSelector({ registration, error }: AgeSelectorProps) {
  const errorId = 'age-range-error';
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="sr-only">Your age range</legend>
      <div className="grid gap-5 grid-cols-2">
        {AGE_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            value={option.value}
            label={option.label}
            hint={option.hint}
            aria-invalid={error ? true : undefined}
            {...registration}
          />
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
