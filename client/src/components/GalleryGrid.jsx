import { useState, useEffect, useCallback } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'motion/react';
import { Stagger } from './Motion';
import { fadeUp } from '../lib/anim';

/**
 * A masonry gallery built with CSS multi-column layout — no JS measuring, no
 * layout thrash. Each figure carries its own natural aspect ratio, so the
 * columns settle at whatever height the photo actually is.
 *
 * Clicking a photo opens it full-size in a lightbox; arrow keys and Escape
 * navigate it, matching the enquiry modal's focus/keyboard handling rather
 * than introducing a second pattern.
 */
export default function GalleryGrid({ items }) {
  const reduced = useReducedMotion();
  const [openAt, setOpenAt] = useState(-1);

  const close = useCallback(() => setOpenAt(-1), []);
  const step = useCallback(
    (dir) => setOpenAt((i) => (i + dir + items.length) % items.length),
    [items.length]
  );

  useEffect(() => {
    if (openAt < 0) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [openAt, close, step]);

  return (
    <>
      <Stagger as="div" className="gallery-grid" gap={0.04}>
        {items.map((src, i) => (
          <m.button
            type="button"
            className="gallery-grid__item"
            variants={fadeUp}
            key={src}
            onClick={() => setOpenAt(i)}
            aria-label={`Open photo ${i + 1} of ${items.length}`}
          >
            <img src={src} alt="" loading="lazy" />
            <span className="gallery-grid__zoom" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
              </svg>
            </span>
          </m.button>
        ))}
      </Stagger>

      <AnimatePresence>
        {openAt >= 0 && (
          <m.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <button className="lightbox__scrim" aria-label="Close" onClick={close} />

            <button className="lightbox__nav lightbox__nav--prev" aria-label="Previous photo" onClick={() => step(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>

            <m.img
              key={openAt}
              className="lightbox__img"
              src={items[openAt]}
              alt={`Photo ${openAt + 1} of ${items.length}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            />

            <button className="lightbox__nav lightbox__nav--next" aria-label="Next photo" onClick={() => step(1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>

            <button className="lightbox__close" aria-label="Close" onClick={close}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <span className="lightbox__count">
              {openAt + 1} / {items.length}
            </span>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
