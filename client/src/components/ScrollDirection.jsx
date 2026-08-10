import { useState } from 'react';
import { m, useScroll, useMotionValueEvent, useReducedMotion } from 'motion/react';

/**
 * Fixed bottom-right readout of which way the page is moving — the small
 * "Down / Up" indicator from thewisecrack.in, rebuilt in VLT's palette.
 */
export default function ScrollDirection() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const [dir, setDir] = useState('down');
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (Math.abs(v - prev) > 1) setDir(v > prev ? 'down' : 'up');
    setVisible(v > 120);
  });

  if (reduced) return null;

  return (
    <m.div
      className="scroll-dir"
      aria-hidden="true"
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
      transition={{ duration: 0.35 }}
    >
      <m.svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ rotate: dir === 'down' ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <path d="M12 5v14M6 13l6 6 6-6" />
      </m.svg>
      {dir === 'down' ? 'Down' : 'Up'}
    </m.div>
  );
}
