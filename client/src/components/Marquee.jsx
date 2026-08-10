import { useRef } from 'react';
import {
  m,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
} from 'motion/react';
import { wrap } from '../lib/anim';

/**
 * A marquee whose speed and direction respond to how fast the page is being
 * scrolled — scroll down and it runs faster, scroll up and it reverses.
 * Falls back to a plain static row under reduced-motion.
 */
export default function Marquee({ items, baseVelocity = -2.4 }) {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const directionRef = useRef(1);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 48, stiffness: 380 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 4], { clamp: false });

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((t, delta) => {
    if (reduced) return;

    let moveBy = directionRef.current * baseVelocity * (delta / 1000);
    const factor = velocityFactor.get();

    if (factor < 0) directionRef.current = -1;
    else if (factor > 0) directionRef.current = 1;

    moveBy += directionRef.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  const row = [...items, ...items, ...items, ...items];

  return (
    <div className="marquee">
      <m.div className="marquee__track" style={reduced ? undefined : { x }}>
        {row.map((name, i) => (
          <span key={`${name}-${i}`}>{name}</span>
        ))}
      </m.div>
    </div>
  );
}
