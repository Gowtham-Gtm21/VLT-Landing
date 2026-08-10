import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'motion/react';
import Progress from '../components/Progress';
import { BrandMark, Footer, WhatsAppButton, EMAIL } from '../components/Chrome';
import { readLead, saveLead } from '../lib/session';
import { readAttribution } from '../lib/attribution';
import { markScheduled } from '../lib/api';
import { track } from '../lib/tracking';
import { IS_DEMO } from '../lib/demo';

const WIDGET_JS = 'https://assets.calendly.com/assets/external/widget.js';
const WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css';

// The sample link in .env.example. Calendly has no such event, so it serves
// its own marketing homepage inside the iframe — which looks like a broken
// site when it is only an unconfigured one.
const PLACEHOLDER = 'calendly.com/your-name/30min';

/** A usable link is calendly.com/<user>/<event>, and not the sample one. */
export function isRealCalendlyUrl(url) {
  if (!url || url.includes(PLACEHOLDER)) return false;
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith('calendly.com')) return false;
    return u.pathname.split('/').filter(Boolean).length >= 2;
  } catch {
    return false;
  }
}

function loadCalendlyAssets() {
  if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = WIDGET_CSS;
    document.head.appendChild(link);
  }

  return new Promise((resolve, reject) => {
    if (window.Calendly) return resolve();
    const existing = document.querySelector(`script[src="${WIDGET_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = WIDGET_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function isCalendlyMessage(e) {
  return (
    e.origin === 'https://calendly.com' &&
    e.data &&
    typeof e.data.event === 'string' &&
    e.data.event.startsWith('calendly.')
  );
}

export default function Schedule() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [lead] = useState(() => readLead());
  const [status, setStatus] = useState('loading'); // loading | ready | error | unconfigured

  // Guard: nobody reaches the calendar without submitting the form first.
  useEffect(() => {
    if (!lead) navigate('/', { replace: true });
  }, [lead, navigate]);

  // Land at the top — Lenis keeps its scroll position across a route change.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
  }, []);

  // Mount the inline widget with the visitor's details prefilled.
  useEffect(() => {
    if (!lead) return undefined;

    if (IS_DEMO) {
      setStatus('demo');
      return undefined;
    }

    const url = lead.calendlyUrl || import.meta.env.VITE_CALENDLY_URL;
    if (!isRealCalendlyUrl(url)) {
      setStatus('unconfigured');
      return undefined;
    }

    let cancelled = false;

    loadCalendlyAssets()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const attribution = readAttribution();

        window.Calendly.initInlineWidget({
          url,
          parentElement: containerRef.current,
          prefill: {
            name: lead.name,
            email: lead.email,
            customAnswers: { a1: lead.phone },
          },
          utm: {
            utmSource: attribution.utm_source,
            utmMedium: attribution.utm_medium,
            utmCampaign: attribution.utm_campaign,
            utmContent: lead.id, // carries the lead id into Calendly's webhook
          },
        });

        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));

    return () => {
      cancelled = true;
    };
  }, [lead]);

  // The booking is confirmed: record it, then move to the confirmation page.
  async function confirmBooking(payload = {}) {
    saveLead({ ...lead, booked: true });
    track('Schedule', { content_category: 'discovery_call' });

    if (lead?.id) {
      try {
        await markScheduled(lead.id, {
          eventUri: payload.event?.uri || '',
          inviteeUri: payload.invitee?.uri || '',
        });
      } catch {
        // The Calendly webhook is the server-side backup, so never block here.
      }
    }

    navigate('/thank-you', { replace: true });
  }

  useEffect(() => {
    function onMessage(e) {
      if (!isCalendlyMessage(e) || e.data.event !== 'calendly.event_scheduled') return;
      confirmBooking(e.data.payload || {});
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead, navigate]);

  if (!lead) return null;

  return (
    <m.div
      className="booking"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="booking__head">
        <div className="shell booking__head-inner">
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <BrandMark />
            <div>
              <h1>Pick a time, {lead.name.split(' ')[0]}</h1>
              <p>Your enquiry is saved. Choose any open slot below and you are done.</p>
            </div>
          </div>
          <Progress current={2} />
        </div>
      </header>

      <div className="booking__body shell">
        {status === 'loading' && (
          <p className="loading">
            <span className="spinner" aria-hidden="true" />
            Loading the calendar
          </p>
        )}

        {status === 'error' && (
          <p className="alert" role="alert">
            The calendar could not load. Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we will
            send you a few times directly.
          </p>
        )}

        {status === 'demo' && (
          <div className="setup-note">
            <p className="eyebrow">Design preview</p>
            <h2>The Calendly calendar sits here</h2>
            <p>
              In the live build this is the real calendar, with the name, email and phone already
              filled in. Booking a slot records it and moves straight to the confirmation page.
            </p>
            <button className="btn" type="button" onClick={() => confirmBooking()}>
              Simulate a booking
            </button>
          </div>
        )}

        {status === 'unconfigured' && (
          <div className="setup-note">
            <p className="eyebrow">Calendar not connected yet</p>
            <h2>Your enquiry is saved</h2>
            <p>
              The booking calendar has not been linked to this site yet. Your details have already
              reached the team — they will email you a few times to choose from.
            </p>
            <p className="setup-note__dev">
              <strong>Setting this up?</strong> <code>VITE_CALENDLY_URL</code> is empty or still the
              sample value. Point it at a real event type, for example{' '}
              <code>https://calendly.com/vlt-sutheesh/30min</code>, then restart the dev server. See
              <code>docs/calendly.md</code>.
            </p>
            <a className="btn" href={`mailto:${EMAIL}`}>
              Email the team instead
            </a>
          </div>
        )}

        <div
          className="calendly-frame"
          ref={containerRef}
          style={{ display: status === 'ready' || status === 'loading' ? 'block' : 'none' }}
        />
      </div>

      <Footer />
      <WhatsAppButton />
    </m.div>
  );
}
