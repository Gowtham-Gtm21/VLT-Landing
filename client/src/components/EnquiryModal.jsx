import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { m, AnimatePresence, useReducedMotion } from 'motion/react';
import LeadForm from './LeadForm';
import { EASE } from '../lib/anim';

const EnquiryContext = createContext({ open: () => {}, close: () => {} });
export const useEnquiry = () => useContext(EnquiryContext);

/**
 * How often the form re-offers itself, in milliseconds.
 * See the note in README — a minute is very frequent for a nudge like this.
 */
export const AUTO_INTERVAL = 60_000;

const SUBMITTED_KEY = 'vlt_submitted';

function alreadySubmitted() {
  try {
    return sessionStorage.getItem(SUBMITTED_KEY) === '1';
  } catch {
    return false;
  }
}

export function EnquiryProvider({ children }) {
  const reduced = useReducedMotion();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState('');
  const dismissed = useRef(0);
  const submitted = useRef(alreadySubmitted());
  const panelRef = useRef(null);
  const lastFocus = useRef(null);

  const openModal = useCallback((service = '') => {
    lastFocus.current = document.activeElement;
    setPreset(service);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    dismissed.current += 1;
    lastFocus.current?.focus?.();
  }, []);

  // Timed nudge, and only on the landing page. Offering the form again on the
  // confirmation page — to someone who has just filled it in — is the one
  // place it would clearly be wrong. It also never fires while the modal is
  // open, never after a submission, and gives up after three dismissals.
  useEffect(() => {
    if (location.pathname !== '/') return undefined;

    const id = setInterval(() => {
      if (open || submitted.current || dismissed.current >= 3) return;
      if (document.hidden) return;
      openModal('');
    }, AUTO_INTERVAL);

    return () => clearInterval(id);
  }, [open, openModal, location.pathname]);

  // A submission anywhere closes the modal and stops the nudge for the session.
  const markSubmitted = useCallback(() => {
    submitted.current = true;
    try {
      sessionStorage.setItem(SUBMITTED_KEY, '1');
    } catch {
      /* private mode */
    }
    setOpen(false);
  }, []);

  // escape to close, and keep tab focus inside the panel while it is up
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => panelRef.current?.querySelector('input')?.focus(), 260);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(t);
    };
  }, [open, closeModal]);

  return (
    <EnquiryContext.Provider value={{ open: openModal, close: closeModal, markSubmitted }}>
      {children}

      <AnimatePresence>
        {open && (
          <m.div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Book a discovery call"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button className="modal__scrim" aria-label="Close" onClick={closeModal} />

            <m.div
              className="modal__panel"
              ref={panelRef}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <button className="modal__close" onClick={closeModal} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

              <LeadForm presetService={preset} onSubmitted={markSubmitted} />
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </EnquiryContext.Provider>
  );
}
