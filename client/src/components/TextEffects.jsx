import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const GLYPHS = '!<>-_\\/[]{}—=+*^?#________';

/**
 * Scramble — the label shuffles through random glyphs and resolves into place.
 * Used on the small uppercase eyebrows, where it reads as a readout settling
 * rather than decoration.
 */
export function Scramble({ text, as: Tag = 'span', className, trigger = 'view', ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [out, setOut] = useState(reduced ? text : '');

  const run = () => {
    if (reduced) return;
    const len = text.length;
    let frame = 0;
    const queue = Array.from({ length: len }, (_, i) => ({
      to: text[i],
      start: Math.floor(Math.random() * 12) + i * 2,
      end: Math.floor(Math.random() * 14) + i * 2 + 12,
    }));

    let raf;
    const tick = () => {
      let done = 0;
      const next = queue
        .map(({ to, start, end }) => {
          if (frame >= end) {
            done += 1;
            return to;
          }
          if (frame < start) return ' ';
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join('');
      setOut(next);
      frame += 1;
      if (done < len) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  };

  useEffect(() => {
    if (reduced) {
      setOut(text);
      return undefined;
    }
    const el = ref.current;
    if (!el || trigger !== 'view') return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reduced, trigger]);

  return (
    <Tag
      ref={ref}
      className={className}
      aria-label={text}
      onPointerEnter={trigger === 'hover' ? run : undefined}
      {...rest}
    >
      <span aria-hidden="true">{out || '\u00A0'}</span>
    </Tag>
  );
}

/**
 * VideoText — the headline is knocked out of a solid panel that covers a
 * video, so the footage plays inside the letterforms. Done with an SVG mask
 * rather than `background-clip`, which cannot take a video.
 */
export function VideoText({ lines, mp4, poster, id = 'vt' }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? el.play?.().catch(() => {}) : el.pause?.()),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const vb = { w: 1000, h: lines.length * 210 + 40 };

  return (
    <div className="videotext" aria-label={lines.join(' ')} role="img">
      {reduced ? (
        <img src={poster} alt="" className="videotext__media" />
      ) : (
        <video ref={ref} className="videotext__media" poster={poster} muted loop playsInline preload="none">
          <source src={mp4} type="video/mp4" />
        </video>
      )}

      <svg className="videotext__mask" viewBox={`0 0 ${vb.w} ${vb.h}`} preserveAspectRatio="none">
        <defs>
          <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width={vb.w} height={vb.h}>
            <rect width={vb.w} height={vb.h} fill="#fff" />
            {lines.map((line, i) => (
              <text
                key={line}
                x="50%"
                y={165 + i * 200}
                textAnchor="middle"
                fill="#000"
                className="videotext__type"
              >
                {line}
              </text>
            ))}
          </mask>
        </defs>
        <rect width={vb.w} height={vb.h} fill="var(--bg)" mask={`url(#${id})`} />
      </svg>
    </div>
  );
}
