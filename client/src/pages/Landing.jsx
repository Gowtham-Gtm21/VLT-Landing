import { useEffect } from 'react';
import { m } from 'motion/react';
import Ambient from '../components/Ambient';
import HeroVideo from '../components/HeroVideo';
import ScrollDirection from '../components/ScrollDirection';
import LazyVideo from '../components/LazyVideo';
import { Scramble, VideoText } from '../components/TextEffects';
import { HorizontalWork, PathPicker, ContactBlock } from '../components/Sections';
import StackCards from '../components/StackCards';
import { useEnquiry } from '../components/EnquiryModal';
import Marquee from '../components/Marquee';
import LogoMarquee from '../components/LogoMarquee';
import ProcessScroll from '../components/ProcessScroll';
import PinnedTimeline from '../components/PinnedTimeline';
import GalleryGrid from '../components/GalleryGrid';
import { Reveal, Stagger, SplitText, ScrollText, CountUp } from '../components/Motion';
import { fadeUp, scaleIn, slideRight, EASE } from '../lib/anim';
import LeadForm from '../components/LeadForm';
import { Masthead, Footer, WhatsAppButton } from '../components/Chrome';
import {
  Check,
  Arrow,
  FormIcon,
  CalendarIcon,
  ConfirmIcon,
  Layers,
  Brain,
  Signal,
  Devices,
  Drone,
  Cloud,
  Factory,
  Shield,
  Leaf,
  Truck,
  City,
  Heart,
} from '../components/Icons';
import { captureAttribution } from '../lib/attribution';

const STATS = [
  { value: '3+', label: 'Years of Excellence' },
  { value: '50+', label: 'Products Delivered' },
  { value: '20+', label: 'Team Members' },
  { value: '100%', label: 'Client Satisfaction' },
];

const STEPS = [
  {
    icon: FormIcon,
    title: 'Share the brief',
    copy: 'A minute of typing. Scope, timeline, anything already built — whatever you have.',
  },
  {
    icon: CalendarIcon,
    title: 'We reply in a day',
    copy: 'A short email with a few times to choose from, and who will be on the call.',
  },
  {
    icon: ConfirmIcon,
    title: 'Thirty minutes',
    copy: 'An approach, a stack and an honest cost range. No deck, no pitch.',
  },
];

const SERVICES = [
  {
    icon: Layers,
    title: 'One Technology',
    service: 'Product engineering',
    copy: 'Unified technology solutions that integrate seamlessly across your entire business ecosystem.',
  },
  {
    icon: Brain,
    title: 'Artificial Intelligence',
    service: 'AI & Cloud',
    copy: 'Cutting-edge AI solutions through machine learning and intelligent automation.',
  },
  {
    icon: Signal,
    title: 'IoT Development',
    service: 'IoT platform',
    copy: 'Smart, interconnected ecosystems with scalable IoT platforms.',
  },
  {
    icon: Devices,
    title: 'Application Development',
    service: 'Web & mobile application',
    copy: 'Custom applications for web, mobile, and desktop platforms.',
  },
  {
    icon: Drone,
    title: 'Drone Technology',
    service: 'Drone & UAV systems',
    copy: 'Advanced UAV solutions for surveillance, mapping, and automation.',
  },
  {
    icon: Cloud,
    title: 'Cloud Services',
    service: 'AI & Cloud',
    copy: 'Scale and automate with AWS, Azure, and GCP expertise.',
  },
];

const INDUSTRIES = [
  { icon: Factory, label: 'Smart Manufacturing' },
  { icon: Shield, label: 'Defense & Surveillance' },
  { icon: Leaf, label: 'Smart Agriculture' },
  { icon: Truck, label: 'Logistics & Supply Chain' },
  { icon: City, label: 'Smart Cities' },
  { icon: Heart, label: 'Healthcare & Wearables' },
];

const WORKS = [
  {
    tag: 'MERN · AI',
    title: 'MedxBay',
    mp4: '/media/work-1.mp4',
    poster: '/media/hero-poster.jpg',
  },
  {
    tag: 'IoT · Flutter · Laravel',
    title: 'Long Life Care',
    mp4: '/media/work-2.mp4',
    poster: '/media/band-poster.jpg',
  },
  {
    tag: 'Python · React',
    title: 'Reltime',
    mp4: '/media/work-3.mp4',
    poster: '/media/hero-poster.jpg',
  },
  {
    tag: 'React · Firebase',
    title: 'C-Suite Academy',
    mp4: '/media/work-4.mp4',
    poster: '/media/band-poster.jpg',
  },
  {
    tag: 'React',
    title: 'WoW HR',
    mp4: '/media/work-5.mp4',
    poster: '/media/hero-poster.jpg',
  },
  {
    tag: 'Laravel',
    title: 'Thozhil',
    mp4: '/media/band-1.mp4',
    poster: '/media/band-poster.jpg',
  },
];

const TIMELINE = [
  { when: 'Feb 2021', title: 'Our small step', copy: 'We started the company.' },
  { when: 'Mar 2021', title: 'The big bang', copy: 'We got our first project in web development.' },
  { when: 'Jul 2021', title: 'A giant leap', copy: 'Started production on the web development project.' },
  { when: 'Aug 2021', title: 'The ultimate test', copy: 'Successfully launched the web app.' },
  { when: 'Jan 2022', title: 'The cycle', copy: 'We had projects lined up.' },
  { when: 'Aug 2023', title: 'The expansion', copy: 'The team got bigger, and so did the projects.' },
  { when: 'Jun 2024', title: 'New doors', copy: 'We began collaborating with a Sri Lankan organisation.' },
];

const GALLERY = [
  '/media/gallery-1.jpg',
  '/media/gallery-2.jpg',
  '/media/gallery-3.jpg',
  '/media/gallery-4.jpg',
  '/media/gallery-5.jpg',
  '/media/gallery-6.jpg',
  '/media/gallery-7.jpg',
  '/media/gallery-8.jpg',
  '/media/gallery-9.jpg',
  '/media/gallery-10.jpg',
  '/media/gallery-11.jpg',
];

const COUNTRIES = [
  'USA', 'Canada', 'Germany', 'UK', 'Spain',
  'Switzerland', 'UAE', 'India', 'Sri Lanka', 'Japan',
];

const ROLES = [
  {
    title: 'MERN Stack Developer',
    tags: ['Chennai', 'Full time'],
    level: '1–4 years',
    stack: ['React', 'Node', 'Express', 'MongoDB'],
    copy: 'Own features end to end — schema, API, screen. You will ship to real users in your first month.',
  },
  {
    title: 'Python Developer',
    tags: ['Chennai', 'Full time'],
    level: '1–4 years',
    stack: ['Python', 'FastAPI', 'Pandas', 'PostgreSQL'],
    copy: 'Services, data pipelines and the automation that keeps fleets and dashboards fed.',
  },
  {
    title: 'DevOps Engineer',
    tags: ['Chennai / Remote', 'Full time'],
    level: '2–5 years',
    stack: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
    copy: 'Own the pipelines, the observability and the bill. If a deploy is scary, that is the problem to fix.',
  },
  {
    title: 'Embedded / Flight Software',
    tags: ['Chennai', 'Full time'],
    level: '2–6 years',
    stack: ['C', 'C++', 'RTOS', 'MAVLink'],
    copy: 'Flight controllers, ground-station links and code that runs on real hardware. UAV experience welcome, not required.',
  },
  {
    title: 'IoT Platform Engineer',
    tags: ['Chennai / Remote', 'Full time'],
    level: '2–5 years',
    stack: ['MQTT', 'Node', 'TimescaleDB', 'Edge'],
    copy: 'Devices, gateways and telemetry that stay up once the fleet grows past a pilot.',
  },
  {
    title: 'Internships',
    tags: ['Chennai', '6 months'],
    level: 'Final year / fresher',
    stack: ['MERN', 'Python', 'IoT'],
    copy: 'Open through the year. You get a real ticket, a real reviewer and something to show for it.',
  },
];

const PERKS = [
  'Work directly with the people who make the decisions',
  'Hardware and cloud budget you do not have to argue for',
  'Chennai office, remote-friendly for the platform roles',
  'One Friday a month on whatever you want to build',
];

const PATHS = [
  {
    label: 'I have a project ready to build',
    note: 'Scope is roughly known, you want a team and a timeline.',
    service: 'Product engineering',
  },
  {
    label: 'I need drone or UAV capability',
    note: 'Surveillance, mapping, inspection or automation.',
    service: 'Drone & UAV systems',
  },
  {
    label: 'I have devices that need connecting',
    note: 'Sensors, gateways, dashboards, fleets that must scale.',
    service: 'IoT platform',
  },
  {
    label: 'I need an app for web or mobile',
    note: 'Customer-facing, and it has to survive real traffic.',
    service: 'Web & mobile application',
  },
  {
    label: 'I want AI or automation built in',
    note: 'Models, vision, or the boring work a machine should do.',
    service: 'AI & Cloud',
  },
  {
    label: 'I am still working out what I need',
    note: 'Bring the problem, we will help shape the brief.',
    service: 'Not sure yet',
  },
];

const CLIENTS = [
  'Neyes',
  'Sharp',
  'SSC MAX Academy',
  'Sunshine Education Academy',
  'The Rise',
  'WoW HR',
  'MedxBay',
  'Infoziant',
  'iSnap',
  'Reltime',
  'WiseWorld',
  'Yes Panchi',
  'BGS',
  'ibots',
];

const AGENDA = [
  'Your problem in detail, before anyone mentions a technology.',
  'A recommended approach: stack, architecture, and the smallest version worth building first.',
  'An honest cost and timeline range, and what would move it either way.',
];

export default function Landing() {
  const { open: openEnquiry, markSubmitted } = useEnquiry();

  useEffect(() => {
    captureAttribution();
  }, []);

  // The path cards open the form where the visitor already is, rather than
  // scrolling them back up the page to the inline one.
  const pickPath = (service) => openEnquiry(service);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <a className="skip-link" href="#enquiry">
        Skip to the enquiry form
      </a>

      <Masthead />

      <main id="main">
        {/* ---------- hero: full-bleed video, type edge to edge ---------- */}
        <section className="hero hero--full">
          <HeroVideo />
          <Ambient particles={16} shapes />

          <m.div
            className="shell hero__center"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { delayChildren: 0.1, staggerChildren: 0.1 } } }}
          >
            <m.p variants={fadeUp}>
              <Scramble as="span" className="eyebrow" text="Product Engineering · UAV · IoT" />
            </m.p>

            <h1 className="display" aria-label="Engineering without the guesswork">
              <SplitText as="span" className="display__line" text="Engineering" delay={0.2} animate="show" />
              <SplitText as="em" className="display__line" text="Without the guesswork" delay={0.5} animate="show" />
            </h1>

            <m.p className="hero__lede" variants={fadeUp}>
              Drone systems, IoT platforms and production software, built from Chennai, Dubai and
              Sri Lanka. Send a brief and get a 30-minute call with the engineers who would build it.
            </m.p>

            <m.div variants={fadeUp} className="hero__cta">
                              <a className="btn" href="#enquiry">
                  Start an enquiry
                  <Arrow />
                </a>
            </m.div>
          </m.div>
        </section>

        {/* ---------- the form, immediately after ---------- */}
        <section className="section enquiry-band" id="enquiry-section">
          <div className="shell enquiry-band__grid">
            <Reveal>
              <Scramble as="p" className="eyebrow" text="Start here" />
              <h2 className="display">
                <SplitText as="span" className="display__line" text="Tell us" />
                <SplitText as="em" className="display__line" text="what you're building" delay={0.22} />
              </h2>
              <p style={{ maxWidth: '40ch', marginTop: 26 }}>
                Tell us what you need. We reply within one working day with times and the right
                person on the call.
              </p>

              <Stagger as="ul" className="hero__points" delayChildren={0.2} gap={0.1} style={{ marginTop: 30 }}>
                {AGENDA.map((point) => (
                  <m.li variants={slideRight} key={point}>
                    <Check />
                    <span>{point}</span>
                  </m.li>
                ))}
              </Stagger>
            </Reveal>

            <Reveal delay={0.15}>
              <LeadForm onSubmitted={markSubmitted} />
            </Reveal>
          </div>
        </section>

        {/* ---------- stats ---------- */}
        <section className="section section--tight">
          <Ambient particles={8} shapes={false} />
          <div className="shell">
            <Stagger className="stats" gap={0.1}>
              {STATS.map((item) => (
                <m.div className="stat" variants={fadeUp} key={item.label}>
                  <div className="stat__value">
                    <CountUp value={item.value} />
                  </div>
                  <div className="stat__label">{item.label}</div>
                </m.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ---------- services: cards that stack on scroll ---------- */}
        <section className="section">
          <Ambient particles={10} shapes={false} />
          <div className="shell">
            <StackCards
              eyebrow="What we build"
              headline="Six disciplines,"
              accent="one delivery team"
              items={SERVICES}
            />
          </div>
        </section>

        {/* ---------- full-bleed media band ---------- */}
        <section className="bleed">
          <div className="bleed__media">
            <LazyVideo mp4="/media/band-1.mp4" poster="/media/band-poster.jpg" />
            <span className="bleed__scrim" />
          </div>
          <div className="shell bleed__inner">
            <Reveal>
              <Scramble as="p" className="eyebrow" text="In the field" />
              <h2 className="display">
                <SplitText as="span" className="display__line" text="Built to run" />
                <SplitText as="em" className="display__line" text="in the real world" delay={0.24} />
              </h2>
            </Reveal>
          </div>
        </section>

        {/* ---------- selected work: pinned horizontal scroll ---------- */}
        <section className="section">
          <div className="shell">
            <Reveal className="section-head">
              <Scramble as="p" className="eyebrow" text="Selected work" />
              <h2 className="display">
                <SplitText as="span" className="display__line" text="Powerful work" />
                <SplitText as="em" className="display__line" text="built to ship" delay={0.24} />
              </h2>
            </Reveal>
          </div>

          <HorizontalWork items={WORKS} />
        </section>

        {/* ---------- offset media panel ---------- */}
        <section className="section">
          <div className="shell offset offset--flip">
            <div className="offset__media">
              <LazyVideo mp4="/media/work-2.mp4" poster="/media/hero-poster.jpg" />
            </div>
            <Reveal className="offset__copy">
              <Scramble as="p" className="eyebrow" text="How we work" />
              <h2 className="display">
                <SplitText as="span" className="display__line" text="In the trenches" />
                <SplitText as="em" className="display__line" text="not at a distance" delay={0.22} />
              </h2>
              <p>
                You talk to the engineers who would do the work. Scope, stack and a realistic
                timeline — on the first call, not after three rounds of email.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------- second offset panel ---------- */}
        <section className="section">
          <div className="shell offset">
            <Reveal className="offset__copy">
              <Scramble as="p" className="eyebrow" text="What you get" />
              <h2 className="display">
                <SplitText as="span" className="display__line" text="A plan you can" />
                <SplitText as="em" className="display__line" text="actually act on" delay={0.22} />
              </h2>
              <p>
                Scope, a suggested stack, and an honest cost and timeline range — inside the first
                thirty minutes, not after three rounds of email.
              </p>
            </Reveal>
            <div className="offset__media">
              <LazyVideo mp4="/media/work-4.mp4" poster="/media/band-poster.jpg" />
            </div>
          </div>
        </section>

        {/* ---------- video knocked out of the type ---------- */}
        <section className="section statement">
          <Ambient particles={10} shapes={false} />
          <div className="shell">
            <Reveal>
              <VideoText
                id="vt-hero"
                lines={['THE RIGHT', 'PEOPLE']}
                mp4="/media/band-1.mp4"
                poster="/media/band-poster.jpg"
              />
            </Reveal>
            <ScrollText
              as="p"
              className="scroll-text"
              text="Right there with you, not managing from a distance."
            />
          </div>
        </section>

        {/* ---------- industries ---------- */}
        <section className="section">
          <Ambient particles={8} shapes={false} />
          <div className="shell">
            <Reveal className="section-head">
              <Scramble as="p" className="eyebrow" text="Industries" />
              <h2 className="display">
                <SplitText as="span" className="display__line" text="Backing the teams" />
                <SplitText as="em" className="display__line" text="that redefine industries" delay={0.24} />
              </h2>
            </Reveal>

            <Stagger className="pills" gap={0.06}>
              {INDUSTRIES.map((it) => {
                const Icon = it.icon;
                return (
                  <m.span className="pill" variants={scaleIn} whileHover={{ y: -4, scale: 1.04 }} key={it.label}>
                    <Icon />
                    {it.label}
                  </m.span>
                );
              })}
            </Stagger>
          </div>
        </section>

        {/* ---------- clients ---------- */}
        <section className="section section--tight">
          <div className="shell">
            <Reveal className="section-head section-head--center">
              <Scramble as="p" className="eyebrow" text="Trusted by Industry Leaders" />
              <h2 className="display">
                <SplitText as="span" className="display__line" text="Our" />
                <SplitText as="em" className="display__line" text="clients" delay={0.18} />
              </h2>
            </Reveal>
          </div>

          <LogoMarquee src="/media/clients-1.png" baseVelocity={-1.8} />
          <LogoMarquee src="/media/clients-2.png" baseVelocity={1.8} />
        </section>

        {/* ---------- where are you at? ---------- */}
        <section className="section">
          <Ambient particles={8} shapes={false} />
          <div className="shell">
            <Reveal className="section-head">
              <Scramble as="p" className="eyebrow" text="So, where are you at?" />
              <h2 className="display">
                <SplitText as="span" className="display__line" text="Pick the closest fit" />
              </h2>
            </Reveal>

            <PathPicker options={PATHS} onPick={pickPath} />
          </div>
        </section>

        {/* ---------- how it works ---------- */}
        <section className="section">
          <Ambient particles={8} shapes={false} />
          <div className="shell">
            <Reveal className="section-head">
              <Scramble as="p" className="eyebrow" text="Our process" />
              <h2 className="display">
                <SplitText as="span" className="display__line" text="From brief to" />
                <SplitText as="em" className="display__line" text="a plan you can act on" delay={0.22} />
              </h2>
            </Reveal>
          </div>

          <ProcessScroll steps={STEPS} />
        </section>

        {/* ---------- direct contact ---------- */}
        <section className="section section--tight">
          <div className="shell">
            <Reveal className="section-head">
              <Scramble as="p" className="eyebrow" text="Contact us" />
              <h2 className="display">
                <SplitText as="span" className="display__line" text="Rather just" />
                <SplitText as="em" className="display__line" text="talk to a human?" delay={0.22} />
              </h2>
            </Reveal>

            <ContactBlock emails={['sutheesh.s@vulturelines.com']} phones={['+91 93422 16211']} />

            <Reveal>
              <p className="eyebrow" style={{ marginTop: 44 }}>Office</p>
              <p style={{ maxWidth: '34ch', color: 'var(--white)', fontSize: '1.05rem' }}>
                7th Floor, Awfis, 2/4, Mount Poonamallee Road, Manapakkam, Porur, Chennai 600089
              </p>
            </Reveal>

            <Reveal>
              <p className="eyebrow" style={{ marginTop: 44 }}>Global delivery network</p>
              <div className="countries">
                {COUNTRIES.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- closing cta ---------- */}
        <section className="closing">
          <Ambient particles={10} />
          <Reveal className="shell closing__inner">
            <Scramble as="p" className="eyebrow" text="Ready to begin?" />
            <h2 className="display">
              <SplitText as="span" className="display__line" text="Let's build" />
              <SplitText as="em" className="display__line" text="something extraordinary" delay={0.26} />
            </h2>
            <p>One form, one slot, and the conversation starts.</p>
                          <a className="btn" href="#enquiry">
                Start the conversation
                <Arrow />
              </a>
          </Reveal>
        </section>

        {/* ---------- career ---------- */}
        <section className="section" id="career">
          <Ambient particles={8} shapes={false} />
          <div className="shell">
            <Reveal className="section-head">
              <Scramble as="p" className="eyebrow" text="Career" />
              <h2 className="display">
                <SplitText as="span" className="display__line" text="Build the things" />
                <SplitText as="em" className="display__line" text="you would want to use" delay={0.22} />
              </h2>
            </Reveal>

            {/* our story */}
            <Reveal className="story">
              <div>
                <p className="eyebrow">Our story</p>
                <h3 className="story__title">From a small step to a delivery team</h3>
                <p>
                  We are a technology and marketing firm specialising in product development. It
                  started in February 2021 with a handful of people and one web project; by that
                  August we had launched a live web app, and by 2023 the team and the work had both
                  outgrown the room we started in.
                </p>
                <p>
                  Our expansion underscores our dedication to delivering quality solutions.
                  Grounded in technology, we promote continuous learning so the next thing we build
                  is better than the last.
                </p>
              </div>
              <div className="story__media">
                <img src="/media/about-1.jpg" alt="The team representing Vulture Lines Tech at an industry event" loading="lazy" />
                <img src="/media/about-2.jpg" alt="A working session at the Chennai office" loading="lazy" />
              </div>
            </Reveal>

            {/* mission and vision */}
            <Reveal className="story story--flip">
              <div className="story__media">
                <img src="/media/about-3.jpg" alt="Vulture Lines Tech at a technology conclave" loading="lazy" />
                <img src="/media/about-4.jpg" alt="The team receiving recognition at an industry forum" loading="lazy" />
              </div>
              <div>
                <p className="eyebrow">Mission and vision</p>
                <h3 className="story__title">Bespoke software, built on collaboration and integrity</h3>
                <p>
                  We are dedicated to delivering bespoke software solutions with excellence,
                  fostering a culture of collaboration and integrity to drive transformative impact.
                </p>
                <p>
                  The longer aim is to pioneer technology for a seamlessly connected world —
                  enhancing lives and businesses globally, not just locally.
                </p>
              </div>
            </Reveal>

            {/* timeline: pinned horizontal track, driven by page scroll */}
            <Reveal>
              <p className="eyebrow" style={{ marginTop: 56 }}>Timeline</p>
            </Reveal>

            <PinnedTimeline items={TIMELINE} />

            {/* gallery: every photo from the deck, as an even masonry grid */}
            <Reveal>
              <p className="eyebrow" style={{ marginTop: 56 }}>Life at VLT</p>
              <p style={{ maxWidth: '46ch', margin: '10px 0 0', color: 'var(--text)' }}>
                Conferences, client sessions and the odd ribbon-cutting — a few frames from
                along the way.
              </p>
              <div style={{ marginTop: 24 }}>
                <GalleryGrid items={GALLERY} />
              </div>
            </Reveal>

            {/* recognition */}
            <Reveal className="recognition">
              <div className="recognition__head">
                <p className="eyebrow">Recognition</p>
                <h3 className="story__title" style={{ maxWidth: '30ch', margin: '14px 0 18px' }}>
                  Recognised for outstanding IT support
                </h3>
                <p style={{ maxWidth: '46ch', color: 'var(--text)' }}>
                  Vulture Lines Tech Management Pvt Ltd was recognised by two HR-industry bodies
                  for the quality of our IT support work.
                </p>

                <div className="recognition__badges">
                  <span className="badge">
                    <Check />
                    WoW HR
                  </span>
                  <span className="badge">
                    <Check />
                    Sharp HR Forum
                  </span>
                </div>
              </div>

              <div className="awards">
                <img
                  className="awards__wide"
                  src="/media/award-1.jpg"
                  alt="The Vulture Lines Tech team at an HR annual conclave"
                  loading="lazy"
                />
                <img src="/media/award-2.jpg" alt="Receiving recognition from WoW HR" loading="lazy" />
                <img src="/media/award-3.jpg" alt="Receiving an award at the Sharp HR Forum conclave" loading="lazy" />
                <img src="/media/award-4.jpg" alt="Attendees at the Sharp HR Forum annual conclave" loading="lazy" />
                <img src="/media/award-5.jpg" alt="The Sharp HR Forum 10th annual conclave stage" loading="lazy" />
              </div>
            </Reveal>

            <Reveal>
              <p className="eyebrow" style={{ marginTop: 56 }}>Open roles</p>
            </Reveal>

            <Stagger className="career__grid" gap={0.09}>
              {ROLES.map((role) => (
                <m.article className="role" variants={fadeUp} key={role.title}>
                  <span className="role__meta">
                    {role.tags.map((t) => (
                      <span className="role__tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </span>

                  <h3>{role.title}</h3>
                  <span className="role__level">{role.level}</span>
                  <p>{role.copy}</p>

                  <span className="role__stack">
                    {role.stack.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>

                  <a
                    className="role__apply"
                    href={`mailto:sutheesh.s@vulturelines.com?subject=${encodeURIComponent(`Application — ${role.title}`)}`}
                  >
                    Apply
                    <Arrow />
                  </a>
                </m.article>
              ))}
            </Stagger>

            <Stagger as="ul" className="perks" gap={0.07}>
              {PERKS.map((perk) => (
                <m.li variants={fadeUp} key={perk}>
                  <Check />
                  <span>{perk}</span>
                </m.li>
              ))}
            </Stagger>

            <Reveal className="career__note">
              Nothing here that fits? Send what you have built to{' '}
              <a href="mailto:sutheesh.s@vulturelines.com?subject=Open%20application">
                sutheesh.s@vulturelines.com
              </a>{' '}
              — we read every one.
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollDirection />
    </m.div>
  );
}
