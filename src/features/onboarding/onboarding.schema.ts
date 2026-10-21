import { z } from 'zod';
import { AGE_RANGES, GENDERS } from './onboarding.types';
/** Any listed range is 18+; under-18 visitors use the explicit opt-out on the age step. */
export const ageFormSchema = z.object({
  ageRange: z.enum(AGE_RANGES, { error: 'Select your age range to continue.' }),
});

export type AgeFormInput = z.input<typeof ageFormSchema>;
export type AgeFormValues = z.output<typeof ageFormSchema>;

export const genderFormSchema = z.object({
  gender: z.enum(GENDERS, { error: 'Choose an option to continue.' }),
});

export type GenderFormInput = z.input<typeof genderFormSchema>;
export type GenderFormValues = z.output<typeof genderFormSchema>;
