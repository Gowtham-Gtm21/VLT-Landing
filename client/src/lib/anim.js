/**
 * Shared Motion variants and easings.
 *
 * One easing curve and one spring are reused everywhere so the whole site
 * feels like a single piece rather than a pile of separate effects.
 */

// ease-out-expo: quick departure, long soft landing
export const EASE = [0.16, 1, 0.3, 1];

export const SPRING = { type: 'spring', stiffness: 220, damping: 30, mass: 0.9 };
export const SOFT_SPRING = { type: 'spring', stiffness: 120, damping: 22, mass: 1 };

/** Parent that releases its children one after another. */
export const stagger = (delayChildren = 0, staggerChildren = 0.08) => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

export const fadeUp = {
  hidden: { opacity: 0, y: 34, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: EASE },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: SPRING },
};

export const slideRight = {
  hidden: { opacity: 0, x: -36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } },
};

/** Viewport settings used by every scroll-triggered block. */
export const VIEWPORT = { once: true, amount: 0.25, margin: '0px 0px -8% 0px' };

/** Keeps a value inside a range — used by the looping marquee. */
export function wrap(min, max, v) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}
