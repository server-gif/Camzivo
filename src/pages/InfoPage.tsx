import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { FlowPanel } from '@/components/layout/FlowPanel';
import { BRAND_NAME } from '@/components/layout/Logo';
import { usePageTitle } from '@/hooks/usePageTitle';

export type InfoPageKind = 'about' | 'privacy' | 'terms' | 'contact';

/** Replace before publishing. */
const CONTACT_EMAIL = 'camzivo@gmail.com';

type PageContent = { title: string; draft: boolean; intro: string; body: ReactNode };

const prose = 'space-y-4 leading-relaxed text-fg-muted [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-fg [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-fg';

const CONTENT: Record<InfoPageKind, PageContent> = {
  about: {
    title: `About ${BRAND_NAME}`,
    draft: false,
    intro: 'A design and engineering demo of a random video chat interface.',
    body: (
      <>
        <h2>What is {BRAND_NAME}?</h2>
        <p>
          {BRAND_NAME} shows how a random video chat product could feel — onboarding, a focused player, and a quick “Next” action — without connecting anyone to anyone. Every clip is pre-recorded and
          shipped with the site.
        </p>
        <p>There are no accounts, no chat, no matching and no live video. The project exists to prototype the experience safely and honestly.</p>
  
        <h2>How it works</h2>
        <p>
          The flow is deliberately short: confirm your age, pick a gender preference, browse a grid of pre-recorded clips, and tap one to see a “finding someone” animation. At no point is a real
          connection made or any data sent to a server.
        </p>
        <p>The age gate is self-declared — it is a courtesy check, not identity verification — and all progress is cleared the moment you close the browser tab.</p>
  
        <h2>Privacy first</h2>
        <p>
          {BRAND_NAME} collects zero personal data. There is no backend, no analytics script, no tracking pixel, and no camera or microphone access. Your choices live only in temporary session
          storage and disappear when the tab closes.
        </p>
  
        <h2>Who is it for?</h2>
        <p>
          {BRAND_NAME} is a portfolio and learning project aimed at designers and developers who want to see how a video-chat UI can be structured without putting real users at risk. Feel free to
          fork, adapt, or use it as a reference.
        </p>
  
        <p>
          Ready to look around? <Link to="/" className="font-medium  text-cyan underline">Start a welcome</Link>.
        </p>
      </>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    draft: true,
    intro: 'Draft for review. Have this reviewed by a qualified professional before publishing.',
    body: (
      <>
        <h2>What we collect</h2>
        <p>
          The demo does not collect personal information on a server. It has no backend, no accounts and no analytics or advertising scripts.
        </p>
        <h2>What is stored in your browser</h2>
        <ul>
          <li>Three yes/no flags in session storage: whether you confirmed you are 18+, whether you chose “Under 18”, and whether you completed the gender step.</li>
          <li>Your age range and gender choice are <strong>not</strong> stored. The gender choice is held in memory only while the tab is open.</li>
          <li>Session storage is cleared when you close the tab. “Exit demo” clears your progress immediately.</li>
        </ul>
        <h2>Camera and microphone</h2>
        <p>The demo never requests camera or microphone access.</p>
        <h2>Hosting</h2>
        <p>The site is served by a static hosting provider, which may process standard request logs (such as IP address and user agent) under its own policy.</p>
        <h2>Contact</h2>
        <p>Questions: {CONTACT_EMAIL}</p>
  
        <p>
          Ready to look around? <Link to="/" className="font-medium text-cyan underline">Start a welcome</Link>.
        </p>
      </>
    ),
  },
  terms: {
    title: 'Terms & Conditions',
    draft: true,
    intro: 'Draft for review. Have this reviewed by a qualified professional before publishing.',
    body: (
      <>
        <h2>The service</h2>
        <p>{BRAND_NAME} is a demonstration that plays pre-recorded video clips. It does not connect you with other people and provides no live communication.</p>
        <h2>Eligibility</h2>
        <p>You must be 18 or older to use the demo. The in-browser age check is self-declared and is not identity verification.</p>
        <h2>Content</h2>
        <p>Demo clips are provided for illustration only. Do not copy or redistribute them unless their licence allows it.</p>
        <h2>No warranty</h2>
        <p>The demo is provided “as is”, without warranties of any kind, and may change or go offline at any time.</p>
  
        <p>
          Ready to look around? <Link to="/" className="font-medium text-cyan underline">Start a welcome</Link>.
        </p>
      </>
    ),
  },
  contact: {
    title: 'Contact',
    draft: true,
    intro: 'Placeholder contact details — replace before publishing.',
    body: (
      <>
        <p>
          For questions about the demo, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-cyan hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <p>There is no contact form, so nothing you type on this site is sent anywhere.</p>
      </>
    ),
  },
};

export default function InfoPage({ kind }: { kind: InfoPageKind }) {
  const page = CONTENT[kind];
  usePageTitle(page.title);
  return (
    <FlowPanel>
      <article className="flex-1">
        <h1 className="text-2xl font-bold">{page.title}</h1>
        <p className="mt-2 text-sm text-fg-muted">{page.intro}</p>
        <div className={`mt-6 text-[13px] ${prose}`}>{page.body}</div>
      </article>
    </FlowPanel>
  );
}
