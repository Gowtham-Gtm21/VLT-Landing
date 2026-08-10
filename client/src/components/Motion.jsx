import { useEffect, useRef } from 'react';
import {
  m,
  useScroll,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  animate,
} from 'motion/react';
import { fadeUp, stagger, VIEWPORT, SPRING, EASE } from '../lib/anim';

/* ------------------------------------------------------------------
   Reveal — the standard scroll-triggered entrance.
   ------------------------------------------------------------------ */

export function Reveal({
  children,
  as = 'div',
  variants = fadeUp,
  delay = 0,
  className,
  ...rest
}) {
  const Comp = m[as] || m.div;

  return (
    <Comp
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Parent for staggered groups — children just need `variants`. */
export function Stagger({ children, as = 'div', delayChildren = 0, gap = 0.09, ...rest }) {
  const Comp = m[as] || m.div;

  return (
    <Comp
      variants={stagger(delayChildren, gap)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/* ------------------------------------------------------------------
   SplitText — headline revealed one character (or word) at a time.
   Each piece sits in an overflow-hidden box so it rises out of a mask
   rather than just fading, and tilts on rotateX for depth.
   ------------------------------------------------------------------ */

const charUp = {
  hidden: { y: '110%', rotateX: -55, opacity: 0 },
  show: {
    y: '0%',
    rotateX: 0,
    opacity: 1,
    transition: { duration: 0.85, ease: EASE },
  },
};

export function SplitText({
  text,
  as = 'span',
  by = 'char',
  className,
  delay = 0,
  gap,
  once = true,
  animate: animateProp,
  ...rest
}) {
  const Comp = m[as] || m.span;
  const step = gap ?? (by === 'char' ? 0.022 : 0.055);
  const words = String(text).split(' ');

  // whileInView for scroll-triggered headlines, animate for above-the-fold ones
  const trigger = animateProp
    ? { animate: animateProp }
    : { whileInView: 'show', viewport: { ...VIEWPORT, once } };

  return (
    <Comp
      className={className}
      variants={stagger(delay, step)}
      initial="hidden"
      {...trigger}
      aria-label={text}
      {...rest}
    >
      {words.map((word, wi) => (
        <span className="word" key={`${word}-${wi}`} aria-hidden="true">
          {by === 'char'
            ? Array.from(word).map((ch, ci) => (
                <span className="char" key={`${ch}-${ci}`}>
                  <m.span className="char__inner" variants={charUp}>
                    {ch}
                  </m.span>
                </span>
              ))
            : (
              <span className="char">
                <m.span className="char__inner" variants={charUp}>
                  {word}
                </m.span>
              </span>
            )}
          {wi < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Comp>
  );
}

/* ------------------------------------------------------------------
   ScrollText — characters brighten one by one as the block is scrolled
   through, rather than all at once on entry. Each character reads its
   own slice of the section's scroll progress.
   ------------------------------------------------------------------ */

function ScrollChar({ children, progress, from, to }) {
  const opacity = useTransform(progress, [from, to], [0.16, 1]);
  const y = useTransform(progress, [from, to], [10, 0]);
  return (
    <m.span className="char__inner" style={{ opacity, y }}>
      {children}
    </m.span>
  );
}

export function ScrollText({ text, as = 'p', className, ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.45'],
  });

  const Comp = m[as] || m.p;
  const words = String(text).split(' ');
  const total = words.join('').length;
  let seen = 0;

  if (reduced) {
    return (
      <Comp ref={ref} className={className} {...rest}>
        {text}
      </Comp>
    );
  }

  return (
    <Comp ref={ref} className={className} aria-label={text} {...rest}>
      {words.map((word, wi) => (
        <span className="word" key={`${word}-${wi}`} aria-hidden="true">
          {Array.from(word).map((ch, ci) => {
            const from = seen / total;
            seen += 1;
            const to = Math.min(1, from + 0.22);
            return (
              <span className="char" key={`${ch}-${ci}`}>
                <ScrollChar progress={scrollYProgress} from={from} to={to}>
                  {ch}
                </ScrollChar>
              </span>
            );
          })}
          {wi < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Comp>
  );
}

/* ------------------------------------------------------------------
   CountUp — figures animate on a Motion value, so React never re-renders.
   ------------------------------------------------------------------ */

export function CountUp({ value, duration = 1.7 }) {
  const [, prefix = '', digits = '0', suffix = ''] =
    String(value).match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/) || [];
  const target = Number(digits);

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();

  const count = useMotionValue(reduced ? target : 0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (!inView || reduced) return undefined;
    const controls = animate(count, target, { duration, ease: EASE });
    return () => controls.stop();
  }, [inView, reduced, count, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      <m.span>{rounded}</m.span>
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------
   Magnetic — the element leans toward the pointer, then springs back.
   ------------------------------------------------------------------ */

export function Magnetic({ children, strength = 0.32, className, ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, SPRING);
  const y = useSpring(my, SPRING);

  const onMove = (e) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <m.div
      ref={ref}
      className={className}
      style={{ x, y, display: 'inline-flex' }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      {...rest}
    >
      {children}
    </m.div>
  );
}

/* ------------------------------------------------------------------
   Tilt — 3D card tilt driven by springs, plus a pointer-tracked sheen.
   ------------------------------------------------------------------ */

export function Tilt({ children, className, max = 9, ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), SPRING);

  const onMove = (e) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    px.set(nx);
    py.set(ny);
    ref.current.style.setProperty('--mx', `${nx * 100}%`);
    ref.current.style.setProperty('--my', `${ny * 100}%`);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <m.div
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{
        rotateX: reduced ? 0 : rotateX,
        rotateY: reduced ? 0 : rotateY,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
      }}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={SPRING}
      {...rest}
    >
      {children}
    </m.div>
  );
}
