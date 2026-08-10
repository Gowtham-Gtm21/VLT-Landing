import { useRef } from 'react';
import { m, useScroll, useTransform, useVelocity, useSpring, useReducedMotion } from 'motion/react';

/**
 * The timeline as a pinned horizontal track, the same pattern Selected Work
 * uses: the section sticks while the page scrolls through it, and that
 * vertical scroll drives the row sideways. No separate scrollbar and nothing
 * for the visitor to discover — they just keep scrolling.
 *
 * Milestones alternate above and below the line, the way the corporate profile
 * draws them. Under reduced motion, and on narrow screens, it becomes a plain
 * vertical list — a two-sided layout is unreadable on a phone, and a pinned
 * section that hijacks scroll is the wrong thing to force on anyone who has
 * asked for less movement.
 */
export default function PinnedTimeline({ items }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress, scrollY } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 340 });
  const skew = useTransform(smooth, [-2400, 0, 2400], [1.6, 0, -1.6], { clamp: true });

  // starts just inset, ends with the last milestone clear of the right edge
  const x = useTransform(scrollYProgress, [0, 1], ['2%', '-58%']);
  const lineScale = useTransform(scrollYProgress, [0, 0.9], [0.06, 1]);

  const list = (
    <div className="road__items">
      {items.map((t, i) => (
        <article className={`stop ${i % 2 ? 'stop--below' : ''}`} key={t.when}>
          <span className="stop__dot" aria-hidden="true">
            <i />
          </span>
          <span className="stop__when">{t.when}</span>
          <h3>{t.title}</h3>
          <p>{t.copy}</p>
        </article>
      ))}
    </div>
  );

  if (reduced) {
    return <div className="road road--static">{list}</div>;
  }

  return (
    <div className="htimeline" ref={ref} style={{ height: `${items.length * 34 + 60}vh` }}>
      <div className="htimeline__pin">
        <m.span className="htimeline__line" style={{ scaleX: lineScale }} aria-hidden="true" />
        <m.div className="htimeline__row" style={{ x, skewX: skew }}>
          {list}
        </m.div>
      </div>
    </div>
  );
}
