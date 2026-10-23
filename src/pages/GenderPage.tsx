import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { GenderSelector } from '@/components/onboarding/GenderSelector';
import { CrmNote } from '@/components/onboarding/CrmNote';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';
import { genderFormSchema, type GenderFormInput, type GenderFormValues } from '@/features/onboarding/onboarding.schema';
import { useAdNavigation } from '@/hooks/useAdNavigation';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function GenderPage() {
  usePageTitle('Gender');
  const { navigateWithAd } = useAdNavigation();
  const { state, selectGender } = useOnboarding();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GenderFormInput, unknown, GenderFormValues>({
    resolver: zodResolver(genderFormSchema),
    defaultValues: state.gender ? { gender: state.gender } : {},
    reValidateMode: 'onChange',
  });

  const onValid = (values: GenderFormValues) => {
    selectGender(values.gender);
    // The interstitial plays once the gender is stored, then we reach the call.
    void navigateWithAd('interstitial', '/girl-find');
  };

  return (
    <OnboardingLayout
      step={2}
      title="What's your Gender?"
      description="Select your gender and let's create a more tailored experience."
      footer={
        <Button type="submit" form="gender-form" disabled={isSubmitting} variant="gradient" size="lg" className="w-full cursor-pointer">
          Continue
        </Button>
      }
      footerNote={
        <CrmNote
          featuresTitle="Who uses a CRM every day"
          features={[
            {
              emoji: '💼',
              title: 'Sales team',
              text: 'More time talking to customers, far less time copying details into spreadsheets.',
            },
            {
              emoji: '🎧',
              title: 'Support team',
              text: 'Tickets resolve faster when the whole customer history opens on one screen.',
            },
            {
              emoji: '📣',
              title: 'Marketing team',
              text: 'Audiences get segmented automatically and campaigns reach the right people.',
            },
            {
              emoji: '👔',
              title: 'Management',
              text: 'Real-time dashboards replace end-of-month guesswork and static report files.',
            },
          ]}
          funFact="Teams working inside a CRM close 23% more deals and 29% more revenue than teams without one, per Nucleus Research."
          stepsTitle="How to pick the right CRM?"
          steps={[
            'List the repetitive tasks you want removed in the first month.',
            'Shortlist tools your team will actually open every single day.',
            'Launch with one pipeline, then add automations once it sticks.',
            'Measure adoption, reply time and closed deals every month.',
          ]}
        />
      }
    >
      <form id="gender-form" noValidate onSubmit={handleSubmit(onValid)} className="flex h-full flex-col">
        <GenderSelector registration={register('gender')} error={errors.gender?.message} />
      </form>
    </OnboardingLayout>
  );
}
