import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Ban } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { AgeSelector } from '@/components/onboarding/AgeSelector';
import { CrmNote } from '@/components/onboarding/CrmNote';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';
import { ageFormSchema, type AgeFormInput, type AgeFormValues } from '@/features/onboarding/onboarding.schema';
import { useAdNavigation } from '@/hooks/useAdNavigation';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AgePage() {
  usePageTitle('Age');
  const navigate = useNavigate();
  const { navigateWithAd } = useAdNavigation();
  const { state, confirmAge, clearAgeDenial } = useOnboarding();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AgeFormInput, unknown, AgeFormValues>({
    resolver: zodResolver(ageFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  if (state.ageDenied) {
    return (
      <OnboardingLayout step={1} title="This demo is for adults only" description="Thanks for being honest.">
        <div className="flex flex-col items-center gap-4 text-center" role="status">
          <span className="grid size-12 place-items-center rounded-2xl bg-danger-bg text-danger">
            <Ban aria-hidden="true" />
          </span>
          <p className="text-fg-muted">
            You indicated that you are under 18, so the demo is not available. Returning home ends this age check; you can start the flow again anytime.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              clearAgeDenial();
              navigate('/');
            }}
          >
            <ArrowLeft aria-hidden="true" /> Back to home
          </Button>
        </div>
      </OnboardingLayout>
    );
  }

  const onValid = () => {
    confirmAge();
    // The interstitial plays once the age is confirmed, then we move on.
    void navigateWithAd('interstitial', '/gender');
  };

  return (
    <OnboardingLayout
      step={1}
      title="How old are you?"
      description="Choose your range to personalize your profile and experience."
      footer={
        <Button type="submit" form="age-form" disabled={isSubmitting} variant="gradient" size="lg" className="w-full">
          Continue
        </Button>
      }
      footerNote={
        <CrmNote
          featuresTitle="Why businesses choose a CRM"
          features={[
            {
              emoji: '📇',
              title: 'Centralised customer data',
              text: 'Every contact, note and purchase history lives in one place your whole team can reach.',
            },
            {
              emoji: '⚡',
              title: 'Automated follow-ups',
              text: 'Reminders and email sequences run on autopilot, so no lead ever slips through.',
            },
            {
              emoji: '📊',
              title: 'Pipeline visibility',
              text: 'Dashboards show exactly which deals are closing and where revenue is stuck.',
            },
            {
              emoji: '🤝',
              title: 'Better customer retention',
              text: 'Timely, personalised service keeps customers coming back instead of switching.',
            },
          ]}
          funFact="Companies that implement a CRM see an average $5.60 return for every $1 spent, according to Nucleus Research."
          stepsTitle="How a CRM works?"
          steps={[
            'Capture leads from calls, chats and emails into one database.',
            'Organise them into stages of your sales pipeline.',
            'Automate follow-ups and schedule every task.',
            'Track reports and grow revenue with data-driven decisions.',
          ]}
        />
      }
    >
      <form id="age-form" noValidate onSubmit={handleSubmit(onValid)} className="flex h-full flex-col">
        <AgeSelector registration={register('ageRange')} error={errors.ageRange?.message} />
      </form>
    </OnboardingLayout>
  );
}
