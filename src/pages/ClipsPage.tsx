import { FolderOpen } from 'lucide-react';
import { Link } from 'react-router';
import { AdBanner } from '@/components/ads/AdBanner';
import { FlowPanel } from '@/components/layout/FlowPanel';
import { CrmNote } from '@/components/onboarding/CrmNote';
import { ClipCard } from '@/components/video/ClipCard';
import { girlImages } from '@/data/girlImages';
import { useAdNavigation } from '@/hooks/useAdNavigation';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function ClipsPage() {
  usePageTitle('Live Video');
  const { guardLink } = useAdNavigation();

  return (
    <FlowPanel>
      {/* Boxed Google ad sits directly above the screen title, like every page. */}
      <AdBanner />
      <div className="pt-4.5 pb-4.5">
        <h1 className="text-center text-[20px] font-bold text-white">Live Video Call</h1>
      </div>

      <div className="flex flex-1 flex-col">
        {girlImages.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4">
            {girlImages.map((image) => (
              <li key={image.file}>
                <Link
                  to="/girl-find"
                  onClick={guardLink('interstitial', '/girl-find')}
                  className="block h-full rounded-2xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-violet-soft"
                >
                  <ClipCard image={image} className="h-full" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="surface flex flex-col items-start gap-4 p-6 sm:p-8">
            <span className="grid size-12 place-items-center rounded-2xl bg-violet/15 text-violet-soft">
              <FolderOpen aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">No pictures are available yet</h2>
              <p className="mt-2 max-w-prose text-fg-muted">
                This grid shows every picture in{' '}
                <code className="rounded bg-white/8 px-1.5 py-0.5 text-fg">public/Video_Girl_image/</code>. Put a
                png, jpg, webp, gif or avif picture in that folder and reload this page.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Same CRM note the onboarding screens show under the Continue button. */}
      <div className="pt-6 text-center text-[12.5px] leading-relaxed text-fg-muted">
        <CrmNote
          featuresTitle="How a CRM keeps every conversation"
          features={[
            {
              emoji: '💬',
              title: 'Unified inbox',
              text: 'Chat, email and call history land in one shared thread instead of separate apps.',
            },
            {
              emoji: '🕒',
              title: 'Response tracking',
              text: 'Every message is timestamped, so slow replies show up in the report, not in guesses.',
            },
            {
              emoji: '🔁',
              title: 'Purchase history',
              text: 'Past orders reveal when a customer is due to buy again and what they prefer.',
            },
            {
              emoji: '🎁',
              title: 'Targeted offers',
              text: 'Campaigns reach only the segment most likely to respond, never the whole list.',
            },
          ]}
          funFact="Winning a new customer costs five to seven times more than keeping an existing one — and retention is exactly what a CRM is built for."
          stepsTitle="How the follow-up works?"
          steps={[
            'The conversation is logged on the customer profile.',
            'The next best action is suggested from their history.',
            'Reminders and replies go out on their own schedule.',
            'Satisfaction is measured and the relationship deepens.',
          ]}
        />
      </div>
    </FlowPanel>
  );
}
