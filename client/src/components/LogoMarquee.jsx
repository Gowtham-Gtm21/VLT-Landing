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
import { useRef } from 'react';
import { wrap } from '../lib/anim';

/**
 * A client logo strip. Takes the supplied banner image and scrolls it, rather
 * than re-typesetting the names — the logos are the artwork, and the banners
 * already have them at consistent sizes.
 *
 * Two of these, running opposite ways, is the pattern on vulturelines.com.
 * Speed responds to scroll velocity like the text marquee does.
 */
export default function LogoMarquee({ src, alt = 'Clients of Vulture Lines Tech', baseVelocity = -1.6 }) {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const directionRef = useRef(1);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 380 });
  const factor = useTransform(smooth, [0, 1200], [0, 3], { clamp: false });

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((t, delta) => {
    if (reduced) return;
    let moveBy = directionRef.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) directionRef.current = -1;
    else if (f > 0) directionRef.current = 1;
    moveBy += directionRef.current * moveBy * f;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="logostrip">
      <m.div className="logostrip__track" style={reduced ? undefined : { x }}>
        {[0, 1, 2, 3].map((i) => (
          // No lazy loading here. These images are sized `width: auto`, so
          // before they load they occupy no space — which means the browser
          // never sees them enter the viewport, so lazy loading never fires
          // and they never load at all. The intrinsic size below also stops
          // the strip collapsing while they arrive.
          <img
            key={i}
            src={src}
            alt={i === 0 ? alt : ''}
            aria-hidden={i > 0}
            width="1600"
            height="100"
          />
        ))}
      </m.div>
    </div>
  );
}
