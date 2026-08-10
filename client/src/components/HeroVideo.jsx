import { useRef, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Full-bleed background video with a poster fallback and a gradient scrim so
 * the copy over it always clears contrast. Autoplay only works muted and with
 * `playsInline`, which is also what stops iOS opening it fullscreen.
 *
 * Under reduced-motion the poster image is shown instead of the video.
 */
export default function HeroVideo({
  src = '/media/hero.mp4',
  poster = '/media/hero-poster.jpg',
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;

    // some browsers reject the autoplay promise; the poster stays up, which is fine
    el.play?.().catch(() => {});

    // don't burn battery animating a video that is scrolled out of view
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? el.play?.().catch(() => {}) : el.pause?.()),
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div className="hero-video" aria-hidden="true">
      {reduced ? (
        <img src={poster} alt="" className="hero-video__el" />
      ) : (
        <video
          ref={ref}
          className="hero-video__el"
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          src={src}
        />
      )}
      <span className="hero-video__scrim" />
    </div>
  );
}
