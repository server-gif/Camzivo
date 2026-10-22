import { Link } from 'react-router';
import { WelcomeHero } from '@/components/landing/WelcomeHero';
import { CrmNote } from '@/components/onboarding/CrmNote';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { buttonVariants } from '@/components/ui/button';
import { useAdNavigation } from '@/hooks/useAdNavigation';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/lib/utils';

export default function WelcomePage() {
  usePageTitle('Welcome');
  const { guardLink } = useAdNavigation();

  return (
    <OnboardingLayout
      step={0}
      title="Random Video Call"
      titleTyping
      description="Select your range to help customize your profile and interactions."
      footer={
        <Link
          to="/age"
          onClick={guardLink('interstitial', '/age')}
          className={cn(buttonVariants({ variant: 'gradient', size: 'lg' }), 'w-full cursor-pointer')}
        >
          Continue
        </Link>
      }
      footerNote={
        <CrmNote
          featuresTitle="What a CRM does for you"
          features={[
            {
              emoji: '📥',
              title: 'Lead capture',
              text: 'Forms, chats, emails and landing pages drop every new prospect into one inbox.',
            },
            {
              emoji: '🗂️',
              title: '360° customer view',
              text: 'Calls, meetings, notes and past orders sit together on a single contact profile.',
            },
            {
              emoji: '📈',
              title: 'Sales forecasting',
              text: 'Live pipeline numbers tell you what next quarter is likely to look like.',
            },
            {
              emoji: '🔌',
              title: 'App integrations',
              text: 'Email, calendar, WhatsApp and billing tools sync in a few clicks, not spreadsheets.',
            },
          ]}
          funFact="91% of companies with more than 11 employees already run a CRM — the most widely adopted business software in the world."
          stepsTitle="How to start with a CRM?"
          steps={[
            'Import your existing contacts and leads into one clean list.',
            'Build a simple pipeline that mirrors how you actually sell.',
            'Set automatic follow-ups, task reminders and email templates.',
            'Review the weekly reports and improve one step at a time.',
          ]}
        />
      }
    >
      <WelcomeHero />
    </OnboardingLayout>
  );
}
