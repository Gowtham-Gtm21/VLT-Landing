import { useRef, useEffect } from 'react';
import {
  m,
  useScroll,
  useTransform,
  useVelocity,
  useSpring,
  useReducedMotion,
} from 'motion/react';
import { Reveal, Stagger, SplitText } from './Motion';
import { Scramble } from './TextEffects';
import { fadeUp, EASE } from '../lib/anim';
import { Arrow } from './Icons';

/* ------------------------------------------------------------------
   StickyServices — headline pins on the left while the numbered list
   scrolls past on the right (the "Kit. Crew. Creativity." pattern).
   ------------------------------------------------------------------ */

export function StickyServices({ eyebrow, headline, accent, items }) {
  return (
    <div className="sticky-split">
      <div className="sticky-split__aside">
        <div className="sticky-split__pin">
          <Scramble as="p" className="eyebrow" text={eyebrow} />
          <h2 className="display">
            <SplitText as="span" className="display__line" text={headline} />
            <SplitText as="em" className="display__line" text={accent} delay={0.25} />
          </h2>
        </div>
      </div>

      <Stagger className="sticky-split__list" gap={0.1}>
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <m.article className="numbered" variants={fadeUp} key={item.title}>
              <span className="numbered__no">({String(i + 1).padStart(2, '0')})</span>
              <div className="numbered__body">
                <h3>
                  {Icon && <Icon />}
                  {item.title}
                </h3>
                <p>{item.copy}</p>
              </div>
            </m.article>
          );
        })}
      </Stagger>
    </div>
  );
}

/* ------------------------------------------------------------------
   WorkGrid — muted looping video tiles that only play while on screen.
   ------------------------------------------------------------------ */

function WorkTile({ item, index, horizontal = false }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? el.play?.().catch(() => {}) : el.pause?.()),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <m.article
      className={`work ${horizontal ? 'work--h' : index === 0 ? 'work--wide' : ''}`}
      variants={fadeUp}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <div className="work__media">
        {reduced ? (
          <img src={item.poster} alt="" />
        ) : (
          <video ref={ref} src={item.mp4} poster={item.poster} muted loop playsInline preload="none" />
        )}
      </div>
      <div className="work__meta">
        <span className="work__tag">{item.tag}</span>
        <h3>{item.title}</h3>
      </div>
    </m.article>
  );
}

/**
 * HorizontalWork — the work tiles travel sideways while the section is
 * pinned, so a vertical scroll reads as a horizontal pan. The row also
 * skews very slightly with scroll velocity, which sells the momentum.
 * Reduced-motion and narrow screens get the plain stacked grid instead.
 */
export function HorizontalWork({ items }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress, scrollY } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 340 });
  const skew = useTransform(smoothVelocity, [-2400, 0, 2400], [2.4, 0, -2.4], { clamp: true });

  const x = useTransform(scrollYProgress, [0, 1], ['1%', '-64%']);

  if (reduced) return <WorkGrid items={items} />;

  return (
    <div className="hwork" ref={ref} style={{ height: `${items.length * 78 + 40}vh` }}>
      <div className="hwork__pin">
        <m.div className="hwork__row" style={{ x, skewX: skew }}>
          {items.map((item, i) => (
            <WorkTile item={item} index={i} key={item.title} horizontal />
          ))}
        </m.div>
      </div>
    </div>
  );
}

export function WorkGrid({ items }) {
  return (
    <Stagger className="works" gap={0.1}>
      {items.map((item, i) => (
        <WorkTile item={item} index={i} key={item.title} />
      ))}
    </Stagger>
  );
}

/* ------------------------------------------------------------------
   PathPicker — "So, where are you at?" Each option preselects the
   service in the form and takes the visitor straight to it, so the
   choice does real work instead of being decoration.
   ------------------------------------------------------------------ */

export function PathPicker({ options, onPick }) {
  return (
    <Stagger className="paths" gap={0.08}>
      {options.map((opt) => (
        <m.button
          type="button"
          className="path"
          variants={fadeUp}
          key={opt.label}
          onClick={() => onPick(opt.service)}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="path__label">{opt.label}</span>
          <span className="path__note">{opt.note}</span>
          <Arrow />
        </m.button>
      ))}
    </Stagger>
  );
}

/* ------------------------------------------------------------------
   ContactBlock — the direct-contact panel, for visitors who would
   rather not fill in a form at all.
   ------------------------------------------------------------------ */

export function ContactBlock({ emails, phones }) {
  return (
    <Reveal className="contact-block">
      <div>
        <p className="eyebrow">Emails</p>
        <ul>
          {emails.map((e) => (
            <li key={e}>
              <a href={`mailto:${e}`}>{e}</a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow">Contact number</p>
        <ul>
          {phones.map((p) => (
            <li key={p}>
              <a href={`tel:${p.replace(/[^\d+]/g, '')}`}>{p}</a>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
