import { useRef, useState } from 'react';
import { m, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'motion/react';
import { SPRING } from '../lib/anim';

/**
 * The booking flow as a pinned, scroll-scrubbed sequence: the section sticks
 * while the page scrolls through it, and each step lights up in turn. This is
 * the one place the page slows the visitor down on purpose — the form sits
 * above it, so it never stands between anyone and the CTA.
 */
export default function ProcessScroll({ steps, pinned = true }) {
  const reduced = useReducedMotion();
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const lineScale = useTransform(scrollYProgress, [0.08, 0.92], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(steps.length - 1, Math.floor(p * steps.length * 1.08));
    setActive(next < 0 ? 0 : next);
  });

  // `pinned={false}` drops the 240vh scroll track and renders a plain row —
  // useful if the client wants a shorter page.
  if (reduced || !pinned) {
    return (
      <div className="steps steps--static">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <article className="step is-active" key={s.title}>
              <div className="step__icon">
                <Icon />
                <span className="step__no">{i + 1}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.copy}</p>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="process-track" ref={trackRef}>
      <div className="process-pin">
        <div className="steps">
          <m.span className="steps__line" style={{ scaleX: lineScale }} aria-hidden="true" />

          {steps.map((s, i) => {
            const Icon = s.icon;
            const on = i <= active;

            return (
              <m.article
                className={`step ${on ? 'is-active' : ''}`}
                key={s.title}
                animate={{ opacity: on ? 1 : 0.32, y: on ? 0 : 14 }}
                transition={SPRING}
              >
                <m.div
                  className="step__icon"
                  animate={{ scale: i === active ? 1.12 : 1 }}
                  transition={SPRING}
                >
                  <Icon />
                  <span className="step__no">{i + 1}</span>
                </m.div>
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
              </m.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
