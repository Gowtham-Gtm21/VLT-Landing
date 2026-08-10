import { useRef, useMemo } from 'react';
import { m, useScroll, useTransform, useReducedMotion } from 'motion/react';

// Deterministic pseudo-random so the field is identical on every render.
function seeded(i) {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Atmosphere layer: azure/indigo glows that parallax against the scroll,
 * a slowly rotating orbit ring, and a drifting particle field.
 * The parallax is scroll-linked through Motion rather than a scroll listener,
 * so it stays in sync with Lenis's eased scrolling.
 */
/**
 * Drifting geometry, measured off vulturelines.com's own hero:
 * roughly 6–7 shapes on screen at ~110 px, outlined rather than solid
 * (fill ratio ~0.32), mixed squares / circles / capsules / wireframes,
 * moving very slowly — about 12 px a second.
 */
const SHAPES = [
  { kind: 'square', size: 96, left: '12%', top: '22%', dur: 26, delay: 0, rot: 18 },
  { kind: 'circle', size: 128, left: '78%', top: '16%', dur: 34, delay: -8, rot: 0 },
  { kind: 'capsule', size: 64, left: '62%', top: '68%', dur: 30, delay: -15, rot: -24 },
  { kind: 'square', size: 72, left: '32%', top: '74%', dur: 38, delay: -22, rot: 42 },
  { kind: 'diamond', size: 110, left: '88%', top: '58%', dur: 32, delay: -5, rot: 0 },
  { kind: 'circle', size: 58, left: '46%', top: '12%', dur: 28, delay: -18, rot: 0 },
  { kind: 'capsule', size: 84, left: '6%', top: '58%', dur: 36, delay: -11, rot: 62 },
];

export default function Ambient({ orbit = false, particles = 18, shapes = true }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const glowA = useTransform(scrollYProgress, [0, 1], ['-14%', '14%']);
  const glowB = useTransform(scrollYProgress, [0, 1], ['12%', '-12%']);
  const orbitY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const orbitRotate = useTransform(scrollYProgress, [0, 1], [0, 42]);

  const dots = useMemo(
    () =>
      Array.from({ length: particles }, (_, i) => ({
        left: `${seeded(i) * 100}%`,
        top: `${seeded(i + 50) * 100}%`,
        size: 2 + seeded(i + 100) * 3,
        delay: `${-seeded(i + 150) * 14}s`,
        duration: `${11 + seeded(i + 200) * 10}s`,
        opacity: 0.18 + seeded(i + 250) * 0.4,
      })),
    [particles]
  );

  return (
    <div className="ambient" ref={ref} aria-hidden="true">
      <m.span
        className="ambient__glow ambient__glow--a"
        style={reduced ? undefined : { y: glowA }}
      />
      <m.span
        className="ambient__glow ambient__glow--b"
        style={reduced ? undefined : { y: glowB }}
      />

      {orbit && (
        <m.svg
          className="ambient__orbit"
          viewBox="0 0 600 600"
          style={reduced ? undefined : { y: orbitY, rotate: orbitRotate }}
        >
          <circle cx="300" cy="300" r="238" className="orbit__ring orbit__ring--dashed" />
          <circle cx="300" cy="300" r="186" className="orbit__ring" />
          <circle cx="300" cy="300" r="132" className="orbit__ring orbit__ring--dashed" />
          <g className="orbit__spin">
            <circle cx="538" cy="300" r="4.5" className="orbit__dot" />
            <circle cx="300" cy="114" r="3" className="orbit__dot orbit__dot--soft" />
          </g>
          <g className="orbit__spin orbit__spin--reverse">
            <circle cx="168" cy="300" r="3.5" className="orbit__dot" />
          </g>
        </m.svg>
      )}

      {shapes &&
        SHAPES.map((sh, i) => (
          <span
            key={`shape-${i}`}
            className={`ambient__shape ambient__shape--${sh.kind}${i >= 3 ? ' is-sm-hidden' : ''}`}
            style={{
              left: sh.left,
              top: sh.top,
              width: sh.size,
              height: sh.kind === 'capsule' ? sh.size * 2 : sh.size,
              transform: `rotate(${sh.rot}deg)`,
              animationDuration: `${sh.dur}s`,
              animationDelay: `${sh.delay}s`,
            }}
          />
        ))}

      {dots.map((d, i) => (
        <span
          key={i}
          className={`ambient__particle${i >= 12 ? ' is-sm-hidden' : ''}`}
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
    </div>
  );
}
