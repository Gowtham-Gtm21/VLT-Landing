import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * A background video that does not exist until it is needed.
 *
 * `autoPlay` overrides `preload="none"` — the browser fetches and decodes the
 * file immediately even when the element is far below the fold. Measured on
 * this page, an off-screen panel was pulling its clip down at first load for
 * nothing. So: no autoplay attribute, sources attached only once the element
 * is near the viewport, and playback paused again on the way out.
 *
 * Under reduced motion the poster image is rendered instead.
 */
export default function LazyVideo({ mp4, poster, className, alt = '' }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;

    let attached = false;

    const attach = () => {
      if (attached) return;
      attached = true;
      if (mp4) {
        const s = document.createElement('source');
        s.src = mp4;
        s.type = 'video/mp4';
        el.appendChild(s);
      }
      el.load();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          attach();
          el.play?.().catch(() => {});
        } else {
          el.pause?.();
        }
      },
      { threshold: 0.15, rootMargin: '200px 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [mp4, reduced]);

  if (reduced) return <img className={className} src={poster} alt={alt} />;

  return <video ref={ref} className={className} poster={poster} muted loop playsInline preload="none" />;
}
