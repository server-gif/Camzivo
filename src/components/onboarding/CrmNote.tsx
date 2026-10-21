/**
 * CRM-themed note shown under the Continue button on the onboarding screens.
 *
 * Mirrors the reference layout: a "Why …" block of emoji feature cards, a
 * single "#Fun Fact" card, and a numbered "How …" step list. Every page passes
 * its own copy so no two screens repeat the same content.
 */

export type CrmFeature = {
  emoji: string;
  title: string;
  text: string;
};

export type CrmNoteProps = {
  featuresTitle: string;
  features: CrmFeature[];
  funFact: string;
  stepsTitle: string;
  steps: string[];
};

export function CrmNote({ featuresTitle, features, funFact, stepsTitle, steps }: CrmNoteProps) {
  return (
    <div className="space-y-4 text-left">
      <div>
        <p className="text-center text-[13.5px] font-bold text-fg">{featuresTitle}</p>
        <div className="mt-3 space-y-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl bg-plum-900/80 p-3 ring-1 ring-white/8">
              <p className="font-bold text-fg">
                <span aria-hidden="true">{feature.emoji}</span> {feature.title}
              </p>
              <p className="mt-1 font-medium text-fg-muted">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-plum-900/80 p-3 ring-1 ring-white/8">
        <p className="font-bold text-fg">#Fun Fact</p>
        <p className="mt-1 font-medium text-fg-muted">{funFact}</p>
      </div>

      <div>
        <p className="text-center text-[13.5px] font-bold text-fg">{stepsTitle}</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 font-medium marker:font-bold marker:text-fg">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
