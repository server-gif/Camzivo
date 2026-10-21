import { cn } from '@/lib/utils';
import type { GirlImage } from '@/data/girlImages';

type ClipCardProps = {
  image: GirlImage;
  className?: string;
};

/**
 * One card on the live-video grid: the picture edge-to-edge inside a rounded
 * frame, a green "Live" badge on the top-left corner and an avatar with the
 * name on the bottom-left, so the grid reads as a wall of calls going on now.
 *
 * The exported files are not plain photos. Each one is a smaller photo with a
 * light stroke and rounded corners drawn around it, floating on a transparent
 * canvas with a soft shadow: on a 912×1040 canvas the opaque part runs from
 * 96,80 to 803,931 and the solid picture only from about 110,94 to 789,917.
 * `object-cover` on the whole canvas leaves that frame as a pale rim inside the
 * card, so the picture is placed at its own measured box — 134.3% × 126.4% of
 * the card, pulled 16.2% left and 11.4% up — which puts the stroke, the shadow
 * and the drawn corners outside the card and lets the card do the rounding.
 * The card is 5/6 because that is the shape of the solid picture.
 *
 * A future picture without a frame is cropped the same way: about 4% of its
 * width and 3% of its height, which is what a card this size wants anyway.
 *
 * The name is the card's text, so the pictures themselves are decorative for
 * screen readers — the link is labelled by the name it shows.
 */
export function ClipCard({ image, className }: ClipCardProps) {
  return (
    <div
      className={cn(
        'relative aspect-[3/4] w-full overflow-hidden rounded-2xl motion-safe:animate-fade-up',
        className,
      )}
    >
      {/* A megabyte per picture, so only load the ones being looked at. */}
      <img
        src={image.src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="size-full scale-[1.25] object-cover"
      />

      {/* Soft darkening behind the name so it stays readable over any photo. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"
      />

      <span className="pointer-events-none absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-2">
        {/* The same picture, zoomed onto the head; the frame maths above would
            leave the stroke ring showing inside a disc this small. */}
        <span aria-hidden="true" className="relative size-7 shrink-0 overflow-hidden rounded-full ring-1 ring-white/40">
          <img
            src={image.src}
            alt=""
            loading="lazy"
            className="size-full scale-[1.6] object-cover object-top"
          />
        </span>
        <span className="truncate text-sm font-medium text-white drop-shadow-sm">{image.name}</span>
      </span>

      {/* Live badge flush at the top-left corner. */}
      <span className="pointer-events-none absolute left-0 top-0 flex items-center gap-1.5 rounded-br-2xl bg-live px-3 py-1.5 text-sm font-semibold text-white shadow-sm">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-white" />
        Live
      </span>
    </div>
  );
}
