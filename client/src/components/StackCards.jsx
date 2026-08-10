import { useRef } from 'react';
import { m, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { Scramble } from './TextEffects';
import { SplitText, Reveal } from './Motion';
import { useEnquiry } from './EnquiryModal';
import { Arrow } from './Icons';

/**
 * Services as a stack of cards that pile up on scroll: each card sticks a
 * little lower than the one before it, and as the next card slides over it the
 * one underneath scales back and dims, so the pile reads as depth rather than
 * a list that scrolled away.
 *
 * No imagery — the hierarchy is carried by an oversized index, the title and a
 * single line of copy. Driven by scroll rather than hover, so it behaves the
 * same on a phone as on a desktop.
 */

// Listed as literals rather than built with a template string: the single-file
// preview inlines assets by finding their paths in the bundle, and a runtime
// template leaves nothing to find.
const CARD_BACKGROUNDS = [
  '/media/card-1.jpg',
  '/media/card-2.jpg',
  '/media/card-3.jpg',
  '/media/card-4.jpg',
  '/media/card-5.jpg',
  '/media/card-6.jpg',
];

function StackCard({ item, index, total, progress }) {
  const reduced = useReducedMotion();
  const { open } = useEnquiry();
  const Icon = item.icon;
  const bg = CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length];

  // Once a card is pinned its own rect stops moving, so its own scroll
  // progress barely advances. Depth is driven from the list's progress
  // instead: each card reads the slice during which it gets buried.
  // the last card is never covered by anything, so it never gets buried
  const isTop = index === total - 1;
  const from = index / total;
  const to = (index + 1) / total;

  const scale = useTransform(progress, [from, to], isTop ? [1, 1] : [1, 0.92], { clamp: true });
  const opacity = useTransform(progress, [from, to], isTop ? [1, 1] : [1, 0.5], { clamp: true });
  const y = useTransform(progress, [from, to], isTop ? [0, 0] : [0, -10], { clamp: true });

  return (
    <div className="stack__slot" style={{ '--i': index }}>
      <m.article
        className="stackcard"
        style={
          reduced
            ? { '--card-bg': `url(${bg})` }
            : { scale, opacity, y, '--card-bg': `url(${bg})` }
        }
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="stackcard__head">
          <span className="stackcard__no">
            {String(index + 1).padStart(2, '0')}
            <i>/{String(total).padStart(2, '0')}</i>
          </span>
          {Icon && (
            <span className="stackcard__icon">
              <Icon />
            </span>
          )}
        </header>

        <h3 className="stackcard__title">{item.title}</h3>
        <p className="stackcard__copy">{item.copy}</p>

        <button type="button" className="btn stackcard__cta" onClick={() => open(item.service)}>
          Talk to us about this
          <Arrow />
        </button>

        <span className="stackcard__rule" aria-hidden="true" />
      </m.article>
    </div>
  );
}

export default function StackCards({ eyebrow, headline, accent, items }) {
  const listRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 0.2', 'end 0.8'],
  });

  return (
    <div className="stack">
      <Reveal className="section-head">
        <Scramble as="p" className="eyebrow" text={eyebrow} />
        <h2 className="display">
          <SplitText as="span" className="display__line" text={headline} />
          <SplitText as="em" className="display__line" text={accent} delay={0.22} />
        </h2>
      </Reveal>

      <div className="stack__list" ref={listRef}>
        {items.map((item, i) => (
          <StackCard
            key={item.title}
            item={item}
            index={i}
            total={items.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
}
