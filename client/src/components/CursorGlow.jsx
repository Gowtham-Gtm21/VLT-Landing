import { useEffect } from 'react';
import { m, useMotionValue, useSpring, useReducedMotion } from 'motion/react';

/**
 * The soft indigo orb that trails the pointer, rebuilt from the reference
 * recording. Motion's spring gives it the lag-then-settle behaviour measured
 * in that video, without a hand-written lerp loop.
 *
 * It blends with `screen`, so it lightens the dark sections and disappears
 * over the light footer. The native cursor is left visible on purpose.
 */
export default function CursorGlow() {
  const reduced = useReducedMotion();

  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const opacity = useMotionValue(0);

  const sx = useSpring(x, { stiffness: 260, damping: 34, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 260, damping: 34, mass: 0.7 });

  useEffect(() => {
    if (reduced) return undefined;
    if (!window.matchMedia?.('(pointer: fine)').matches) return undefined;

    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      opacity.set(1);
    };
    const onLeave = () => opacity.set(0);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced, x, y, opacity]);

  if (reduced) return null;

  return (
    <m.div
      className="cursor-glow"
      aria-hidden="true"
      style={{ x: sx, y: sy, opacity }}
      transition={{ opacity: { duration: 0.45 } }}
    />
  );
}
