import { useEffect, useState } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'motion/react';
import { EASE } from '../lib/anim';

const DURATION = 1400;

/**
 * A short intro: a counter runs to 100, then the panel splits and lifts away.
 *
 * The number is animated with a registered CSS custom property rather than
 * per-frame React state. At load the main thread is busy — Motion is mounting
 * a few hundred elements and the videos are decoding — and a rAF-driven
 * counter visibly froze. A `@property` animation is driven by the style
 * engine, so it keeps moving through that. React is left with one job: decide
 * when the intro is over.
 *
 * Runs once per session and is skipped entirely under reduced motion.
 */
export default function Preloader() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return sessionStorage.getItem('vlt_intro') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (done || reduced) return undefined;

    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setDone(true);
      try {
        sessionStorage.setItem('vlt_intro', '1');
      } catch {
        /* private mode */
      }
    }, DURATION);

    return () => clearTimeout(timer);
  }, [done, reduced]);

  useEffect(() => {
    if (done) document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [done]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {!done && (
        <m.div className="preloader" exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: 0.45 }}>
          <m.span
            className="preloader__half preloader__half--top"
            initial={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.75, ease: EASE }}
          />
          <m.span
            className="preloader__half preloader__half--bottom"
            initial={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.75, ease: EASE }}
          />

          <m.div className="preloader__inner" exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }}>
            <span className="preloader__label">Vulture Lines Tech</span>
            <span className="preloader__count" aria-hidden="true" />
            <span className="preloader__bar">
              <span className="preloader__fill" />
            </span>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
