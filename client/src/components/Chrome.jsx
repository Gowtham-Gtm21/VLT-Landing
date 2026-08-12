import { useState } from 'react';
import { m, useScroll, useSpring, useMotionValueEvent } from 'motion/react';
import { Mail, Phone, Pin, LinkedIn, Instagram, WhatsApp } from './Icons';

export const WHATSAPP_NUMBER = '9791670504';
export const PHONE_DISPLAY = '+91 93422 16211';
export const EMAIL = 'sutheesh.s@vulturelines.com';

/**
 * The official vlt wordmark. Two versions are shipped: the supplied navy for
 * light surfaces, and a recoloured white one for the dark header — the navy
 * is invisible against a near-black background. Both have had their white
 * backing removed so they sit on anything.
 */
export function BrandMark({ variant = 'light', className = 'brand__mark' }) {
  const src = variant === 'dark' ? '/logo-dark.png' : '/logo-light.png';
  return <img className={className} src={src} alt="Vulture Lines Tech" width="436" height="249" />;
}

/** Thin azure bar showing how far down the page the visitor is. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  return <m.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

export function Masthead() {
  const { scrollY } = useScroll();
  const [stuck, setStuck] = useState(false);

  useMotionValueEvent(scrollY, 'change', (v) => setStuck(v > 24));

  return (
    <m.header
      className={`masthead ${stuck ? 'is-stuck' : ''}`}
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="shell masthead__inner">
        <a className="brand" href="https://vulturelines.com" rel="noopener">
          <BrandMark />
        </a>

        <div className="masthead__meta">
          <span className="masthead__locations">Chennai · Dubai · Sri Lanka</span>
          <a href={`tel:+${WHATSAPP_NUMBER}`}>{PHONE_DISPLAY}</a>
        </div>
      </div>
      <ScrollProgress />
    </m.header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__grid">
          <div>
            <BrandMark variant="dark" className="brand__mark brand__mark--footer" />
            <p className="footer__blurb">
              With strategic design and cutting-edge development. Engineering intelligent products
              for a smarter future.
            </p>
            <ul className="footer__contact">
              <li>
                <Mail />
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </li>
              <li>
                <Phone />
                <a href={`tel:+${WHATSAPP_NUMBER}`}>{PHONE_DISPLAY}</a>
              </li>
              <li>
                <Pin />
                <span>Chennai, Dubai, Sri Lanka</span>
              </li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul className="footer__links">
              <li><a href="https://vulturelines.com/about">About Us</a></li>
              <li><a href="https://vulturelines.com/services">Services</a></li>
              <li><a href="https://vulturelines.com/industries">Industries</a></li>
              <li><a href="#career">Career</a></li>
              <li><a href="https://vulturelines.com/contact">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4>Services</h4>
            <ul className="footer__links">
              <li><a href="https://vulturelines.com/services">Product Engineering</a></li>
              <li><a href="https://vulturelines.com/services">Drone Technology</a></li>
              <li><a href="https://vulturelines.com/services">IoT Solutions</a></li>
              <li><a href="https://vulturelines.com/services">Cloud &amp; AI</a></li>
            </ul>
          </div>

          <div>
            <h4>Industries</h4>
            <ul className="footer__links">
              <li><a href="https://vulturelines.com/industries">Smart Manufacturing</a></li>
              <li><a href="https://vulturelines.com/industries">Defense &amp; Surveillance</a></li>
              <li><a href="https://vulturelines.com/industries">Agriculture</a></li>
              <li><a href="https://vulturelines.com/industries">Healthcare</a></li>
            </ul>
          </div>
        </div>

        <div className="footer__base">
          <span>© {new Date().getFullYear()} Vulturelines. All rights reserved.</span>
          <div className="footer__social">
            <a href="https://in.linkedin.com/company/vulture-lines" aria-label="Vulture Lines Tech on LinkedIn" rel="noopener">
              <LinkedIn />
            </a>
            <a href="https://instagram.com/vulturelines" aria-label="Vulture Lines Tech on Instagram" rel="noopener">
              <Instagram />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppButton() {
  return (
    <a
      className="wa"
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <WhatsApp />
    </a>
  );
}
