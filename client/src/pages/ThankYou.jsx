import { useEffect } from 'react';
import { m } from 'motion/react';
import Ambient from '../components/Ambient';
import Progress from '../components/Progress';
import { Reveal, Stagger, SplitText } from '../components/Motion';
import { Masthead, Footer, WhatsAppButton, EMAIL, PHONE_DISPLAY, WHATSAPP_HREF } from '../components/Chrome';
import { Check, Arrow } from '../components/Icons';
import { fadeUp, scaleIn, EASE } from '../lib/anim';
import { readLead } from '../lib/session';
import { track } from '../lib/tracking';

const NEXT = [
  {
    when: 'Now',
    title: 'Calendar invite is on its way',
    copy: 'Check your inbox for the invite and the meeting link. Add it to your calendar so nothing clashes.',
  },
  {
    when: 'Before',
    title: 'Send anything that helps',
    copy: 'Reply to the invite with a deck, a spec, a Figma link, or screenshots of what exists today.',
  },
  {
    when: 'On the call',
    title: '30 minutes, no pitch',
    copy: 'We go through your brief, suggest an approach, and give you a cost and timeline range.',
  },
];

export default function ThankYou() {
  const lead = readLead();

  useEffect(() => {
    // Lenis keeps its scroll position across a route change, so a visitor who
    // submitted from part-way down the page would land part-way down this one.
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;

    // Final conversion event for the campaign.
    track('CompleteRegistration', {
      content_category: 'appointment_booked',
      value: 1,
      currency: 'INR',
    });
  }, []);

  return (
    <m.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <Masthead />

      <main className="thanks">
        <Ambient orbit particles={16} />
        <div className="shell">
          <div className="thanks__inner">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <Progress current={3} />
            </div>

            <m.p className="thanks__badge" variants={scaleIn} initial="hidden" animate="show">
              <Check />
              Appointment confirmed
            </m.p>

            <h1 className="display">
              <SplitText
                as="span"
                className="display__line"
                text={lead?.name ? `Thank you, ${lead.name.split(' ')[0]}.` : 'Thank you.'}
                delay={0.15}
              />
              <SplitText
                as="em"
                className="display__line"
                text="Your call is booked."
                delay={0.45}
              />
            </h1>

            <m.p
              className="thanks__lede"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.7 }}
            >
              We have your enquiry and your slot. Nothing else is needed from you right now — the
              invite lands in your inbox within a minute.
            </m.p>

            <Stagger as="ul" className="next" delayChildren={0.2} gap={0.12}>
              {NEXT.map((n) => (
                <m.li variants={fadeUp} key={n.title}>
                  <span className="next__when">{n.when}</span>
                  <span>
                    <strong>{n.title}</strong>
                    <span>{n.copy}</span>
                  </span>
                </m.li>
              ))}
            </Stagger>

            <Reveal className="thanks__urgent" variants={fadeUp}>
              <p className="eyebrow">In a hurry?</p>
              <p>
                Message us on WhatsApp at <a href={WHATSAPP_HREF}>{PHONE_DISPLAY}</a>{' '}
                or email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we will pick it up sooner.
              </p>
            </Reveal>

            <Reveal className="thanks__actions" variants={fadeUp}>
                              <a className="btn" href="https://vulturelines.com" rel="noopener">
                  Visit vulturelines.com
                  <Arrow />
                </a>
                              <a className="btn btn--ghost" href={`mailto:${EMAIL}`}>
                  Email the team
                </a>
            </Reveal>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </m.div>
  );
}
