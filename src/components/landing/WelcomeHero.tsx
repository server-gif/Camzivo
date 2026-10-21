import { useEffect, useState } from 'react';
import { Lottie } from 'lottie-react';
import { cn } from '@/lib/utils';

/**
 * The welcome-page hero. It's now a single self-contained Lottie scene
 * (public/animations/video-call-scene.json — "Video Call Scene", 408x337) that
 * already contains the camera, avatars and orbiting artwork, so none of the
 * previous hand-built orbit layers/satellites are needed. We just fetch the
 * animation and let lottie-react play it. If the fetch fails we fall back to
 * the original static image.
 */

type WelcomeHeroProps = { className?: string };

/** Playback rate for the hero scene; `1` is its authored speed, above it runs faster. */
const LOTTIE_SPEED = 1.15;

export function WelcomeHero({ className }: WelcomeHeroProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/animations/video-call-scene.json')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
      .then((json) => {
        if (active) setAnimationData(json as object);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Graceful fallback: keep the original static hero if the Lottie can't load.
  if (failed) {
    return (
      <img
        src="/icons/Frame 1851.png"
        alt="A video-call camera surrounded by profile avatars of people connecting"
        className={cn('mx-auto w-full max-w-[19rem] sm:max-w-[22rem]', className)}
      />
    );
  }

  return (
    <div className={cn('mx-auto w-full max-w-[22rem]', className)}>
      {/* The scene's own canvas is 408x337, so keep that aspect ratio. */}
      {animationData ? <Lottie src={animationData} autoplay loop speed={LOTTIE_SPEED} className="aspect-[408/337] w-full" /> : null}
    </div>
  );
}
