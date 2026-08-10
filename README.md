# Vulture Lines Tech — Landing Page Conversion Flow (MERN)

A lead-generation landing page. One flow, no dead ends:

```
Meta ad → Landing page → Enquiry form ─┬→ MongoDB
                                       ├→ WhatsApp
                                       └→ Google Sheet
                                        ↓
                              Calendly — pick a time
                                        ↓
                                Confirmation page
```

| Step | Where it lives |
| --- | --- |
| Enquiry form | `client/src/components/LeadForm.jsx` |
| Submission stored | `POST /api/leads` → `server/controllers/leadController.js` |
| WhatsApp alert | `server/utils/whatsapp.js` |
| Google Sheet row | `server/utils/sheets.js` + `server/google-apps-script.gs` |
| Automatic step to the calendar | `LeadForm.jsx` → `navigate('/schedule')`, no extra click |
| Booking | `client/src/pages/Schedule.jsx` — inline Calendly widget, details prefilled |
| Booking recorded | `PATCH /api/leads/:id/scheduled`, plus the Calendly webhook as backup |
| Confirmation page | `client/src/pages/ThankYou.jsx` — the conversion event fires here |
| Pipeline status | `PATCH /api/leads/:id/status`, mirrored back into the sheet |

Setup guides: `docs/calendly.md` and `docs/google-sheet.md`.

**The booking step fails safe.** If `VITE_CALENDLY_URL` is empty or points at an event that
does not exist, Calendly serves its own marketing page inside the frame — which reads as a
broken site rather than an unconfigured one. The URL is checked before the widget mounts:
anything that is not `calendly.com/<user>/<event>` shows a short notice saying the enquiry
was saved, plus a setup hint for whoever is building. No request is made to calendly.com in
that state.

---

## Stack

- **MongoDB** + Mongoose — every enquiry stored with its campaign attribution
- **Express** — REST API, rate limiting, honeypot, admin-key protected lead export
- **React** (Vite) + React Router — three routes: `/`, `/schedule`, `/thank-you`
- **Node 18+**

---

## Run it locally

```bash
# 1. API
cd server
cp .env.example .env          # fill MONGO_URI at minimum
npm install
npm run dev                   # http://localhost:5000

# 2. Front end (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

Vite proxies `/api` to `localhost:5000`, so no CORS work is needed in development.

---

## Conversion tracking

Replace `YOUR_PIXEL_ID` in `client/index.html` with the real Meta Pixel ID.

| Event | Fires on |
| --- | --- |
| `PageView` | every page |
| `Lead` | form submitted |
| `Schedule` | Booking confirmed on the calendar |
| `CompleteRegistration` | Confirmation page — use this as the campaign's conversion objective |

`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` and `fbclid` are captured on first load, stored in the session and saved with the lead, so every enquiry can be traced back to the exact ad. They are written into the Google Sheet as their own columns.

Set the Meta ad destination URL like this:

```
https://yourdomain.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=drone_q3&utm_content=video_a
```

---

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/leads` | Store the enquiry, then notify WhatsApp and the sheet |
| `PATCH` | `/api/leads/:id/scheduled` | Record a booking, update the sheet, alert WhatsApp |
| `POST` | `/api/webhooks/calendly` | Calendly `invitee.created` / `invitee.canceled` |
| `PATCH` | `/api/leads/:id/status` | Move a lead along the pipeline (admin key) |
| `GET` | `/api/leads` | Lead export, header `x-admin-key: <ADMIN_API_KEY>` |
| `GET` | `/api/health` | Uptime check |

Pull the leads any time:

```bash
curl -H "x-admin-key: YOUR_KEY" https://api.yourdomain.com/api/leads?status=appointment_booked
```

---

## Two builds, and which one captures leads

`npm run deploy:build` produces the **demo** build. `submitLead` short-circuits on
`IS_DEMO` and returns a fake response, so the form appears to work and stores nothing. It
carries `noindex` and exists so the design can be reviewed over a link with no backend, no
database and no external services.

`npm run live:build` produces the **real** build, in `live/`. No demo flag, so the form
submits for real — to the Google Sheet if `VITE_SHEET_WEBHOOK_URL` is set, otherwise to the
API at `VITE_API_URL`. It refuses to build with neither configured, because a landing page
that silently drops enquiries is worse than one that fails loudly.

Verified end to end: a real browser loading the `live` build, filling the form and
submitting, produces one POST to the Apps Script endpoint carrying every field and the
shared secret.

---

## Deploy

**Front end** — `cd client && npm run build`, publish `client/dist`. On Netlify, Vercel, Nginx or S3 you must send unknown paths to `index.html` or `/thank-you` will 404 on refresh. `client/public/_redirects` and `client/vercel.json` are already included; for Nginx use `try_files $uri /index.html;`.

**API** — deploy `server/` to Render, Railway, or a VPS with PM2. Set every variable from `.env.example`, and list the live front-end origin in `CLIENT_URLS`.

**Database** — MongoDB Atlas free tier is enough. Whitelist the API server's IP.

---

## Before handover — checklist

- [ ] Real Meta Pixel ID in `client/index.html`
- [ ] `CLIENT_URLS` contains the production domain
- [ ] `ADMIN_API_KEY` changed from the placeholder
- [ ] SMTP filled in if the team wants instant lead alerts
- [ ] Test the full flow once on mobile: submit → calendar → book → confirmation, and check the sheet and WhatsApp
- [ ] Confirm `Lead`, `Schedule` and `CompleteRegistration` appear in Meta Events Manager
- [ ] `CALENDLY_URL` points at a real event, with phone as the first custom question
- [ ] Calendly webhook subscribed and its signing key set

---

## Structure and type

Rebuilt to the reference site's layout language — giant all-caps type set edge to edge,
full-bleed media behind it, offset media panels between sections — in VLT's palette only.
Nothing of the reference's own colour or accent is used.

### Typeface

Back to Vulture Lines Tech's own faces — **Cormorant Garamond** for display and
**Poppins** for body — with the white-line / blue-line headline treatment from the site.

The scale is measured off vulturelines.com's own hero rather than picked: on a 1916 px
capture the "A New Era of / Innovation" lines run about 120–130 px of ink, which works out
at roughly **9vw**. So `h1: clamp(2.9rem, 9vw, 9.5rem)` → 152 px at 1920, 130 px at 1440,
46 px at 360. Checked at twelve widths from 1920 down to 360: no word exceeds its
container, no sideways scroll.

### Background movement

The drifting geometry is measured off the hero of vulturelines.com, not invented:

| Measurement | Reference | Built |
| --- | --- | --- |
| large shapes on screen | 6–7 per frame | 7 per band |
| shape size | ~110 px (54 px on a 958 px capture) | 58–128 px |
| fill ratio | 0.32 median (0.18–0.48) | outlined, 1.5 px stroke on a 7% wash |
| aspect ratio | 1.34 median, 2.71 p90 | squares, circles, capsules, diamonds |
| drift speed | ~12 px per second | 26–38 s loops over a ~40 px path |
| small dots | ~50 per frame, ~10–16 px | 16 per band, 2–5 px |
| colour | RGB (29,32,67) large, (33,39,61) small | indigo `#4B4BE0` and azure at low alpha |

Shapes are outlined rather than solid because the reference's average fill ratio is 0.32 —
a solid block would read as roughly 1.0.

### Scrollbar

The native scrollbar track is hidden (`scrollbar-width: none` plus the WebKit
pseudo-element). Scroll position is still communicated two other ways, so nothing is lost:
the azure progress bar under the header fills as you go, and the fixed Down / Up readout
shows direction. Wheel, keyboard and touch scrolling are untouched — only the visual track
is removed.

### Hero sizing

The hero is one viewport tall and everything has to fit inside it. At the page-wide 9vw
step the second headline line wrapped to three rows and pushed the lede and CTA off-screen
on shorter laptops, so the hero carries its own smaller step — `clamp(2.4rem, 6.1vw, 6.2rem)`
— plus a shorter one again below 860 px of viewport height.

Measured CTA position against the fold:

| Viewport | Headline | CTA bottom |
| --- | --- | --- |
| 1920 × 1080 | 99 px, 2 lines | 848 of 1080 |
| 1920 × 900 | 99 px, 2 lines | 758 of 900 |
| 1440 × 800 | 73 px, 2 lines | 681 of 800 |
| 1366 × 768 | 70 px, 2 lines | 661 of 768 |
| 1280 × 720 | 65 px, 2 lines | 633 of 720 |

### Layout

| Reference pattern | Here |
| --- | --- |
| Full-screen video hero, huge centred type | `hero--full` + `HeroVideo`, CTA scrolls to the form |
| Full-bleed media behind a headline | `.bleed` band |
| Offset media panel beside type (40–48% width in the capture) | `.offset` / `.offset--flip` |
| Numbered service list, oversized numerals | `StickyServices` with `clamp(1.6rem, 3vw, 2.6rem)` numbers |
| Horizontal work reel | `HorizontalWork`, pinned |
| "So, where are you at?" options | `PathPicker` — opens the enquiry modal with that service preselected, rather than scrolling back up to the inline form |
| Contact block, emails and numbers | `ContactBlock` |
| Fixed "Down / Up" readout | `ScrollDirection` |

The form moved out of the hero into its own band directly below it, so the hero can be
full-screen video the way the reference is. It is one click from the hero CTA and one
scroll from the top — worth watching in the campaign data, since a form above the fold
usually converts better.

### Video

There are nine videos on the page: the full-bleed hero, the "In the field" band, two offset
panels, and five work-reel tiles — six distinct generated loops, so no clip repeats
back-to-back. All muted, looping, `playsInline`,
and paused by an IntersectionObserver whenever they scroll out of view.

Verified over HTTP: the hero autoplays under normal browser policy with no flags, work
tiles start only once they enter the viewport, no failed requests, no JS errors.

**What ships is a placeholder.** `client/public/media/` contains a generated loop — a
drifting network of nodes in VLT's azure and indigo, which reads as drone-swarm/IoT rather
than generic stock. It is not real footage, and real footage will look considerably better.

To put your own clips in, one command per slot:

```bash
cd client
npm run media:add -- "C:\Users\you\Videos\drone flight.mp4" hero
npm run media:add -- "~/Downloads/factory-line.mov"            work-1
npm run deploy:build
```

Slots: `hero`, `work-1` … `work-5`, `band-1`.

**Quote the path if it contains spaces.** Without quotes the shell splits it into separate
arguments — the script now stitches them back together, but quoting is the reliable habit.
`~` is expanded for you, since Node does not do it the way a shell does.

It encodes WebM + MP4 (+ a poster for `hero` and `band-1`) at the filenames the page already
points at, so no code changes are needed. Needs `ffmpeg` on your PATH:

| | |
| --- | --- |
| Windows | `winget install Gyan.FFmpeg` then reopen the terminal |
| macOS | `brew install ffmpeg` |
| Linux | `sudo apt install ffmpeg` |

**No ffmpeg?** Rename your clip to `hero.mp4`, drop it in `client/public/media/`, and delete
`hero.webm`. The page lists WebM first and MP4 second, so the browser skips the missing WebM
and uses your MP4 — tested and working. WebM is only there because it is roughly half the
file size.

Free stock sources: Pexels Videos, Coverr, Mixkit, Pixabay. Useful searches: "drone aerial",
"circuit board macro", "data centre", "engineer laptop". VLT's own drone footage would beat
any of them — it matches the reference site's video-led feel and is on-brand in a way stock
cannot be.

### If your footage does not show up

Two dials at the top of `client/src/styles/global.css`:

```css
--video-opacity: 0.8;   /* how much of the footage shows through */
--video-scrim:   0.62;  /* darkness of the pool behind the headline */
```

The scrim was originally tuned for a bright clip and buried dark footage — behind the copy
it let only 28% of the video through, and at the edges 6%. It is now a tight pool of
darkness behind the text and a much lighter wash elsewhere: 30% behind the copy, 48% at
mid-radius, 72% at the edges. Headline contrast still measures 233 (anything above 150 is
comfortable), and the hero copy carries a soft text-shadow as insurance.

Dark footage is still the hardest case. A screen recording of a dark UI is close to black
to begin with, so no amount of opacity will make it read — bright, high-contrast, moving
footage works far better as a hero background.

Under reduced-motion every video is replaced by its poster image, verified.

---

## Animation layer

Built on the current React animation stack — no AOS, no scroll-listener hand-rolling.

| Library | Version | Role |
| --- | --- | --- |
| [Motion](https://motion.dev) (`motion`) | 12 | All animation: variants, springs, scroll-linked values, `AnimatePresence` |
| [Lenis](https://lenis.darkroom.engineering) | 1.3 | Inertia smooth scrolling |
| React | 19 | — |
| React Router | 7 | — |

`LazyMotion` + the `m` components ship only the features this site uses, in `strict`
mode so a stray full-fat `motion` import fails the build rather than silently doubling
the bundle.

| Effect | Where | How |
| --- | --- | --- |
| Character-by-character headline reveal | Every section headline | `SplitText by="char"` — each glyph masked, rises on `rotateX` with a 22 ms stagger |
| Scroll-scrubbed statement | "In the trenches with you" band | `ScrollText` — each character reads its own slice of the section's scroll progress |
| Pinned horizontal work scroll | Selected Work | `useScroll` on a tall track → `x`, plus a velocity-driven `skewX` |
| Scroll-triggered entrances | All sections | `whileInView` + shared variants in `lib/anim.js` |
| Staggered groups | Stats, bullets, services, industries, next-steps | `Stagger` → `staggerChildren` |
| Pinned, scroll-scrubbed process | "From Enquiry to Confirmed Call" | `useScroll` on a 240vh track + `position: sticky` |
| Display type at reference scale | Headlines | `clamp(3.2rem, 9.4vw, 9.5rem)` — 135 px at 1440, 51 px at 390 |
| Counting statistics | 3+ / 50+ / 20+ / 100% | `useMotionValue` + `animate()` — no React re-render per frame |
| Velocity-reactive marquee | Clients | `useVelocity` on scroll → speeds up, reverses on scroll-up |
| 3D tilt cards with sheen | Service cards | `useSpring` on rotateX/rotateY + pointer-tracked gradient |
| Magnetic buttons | Primary CTAs | `useSpring` pulling toward the pointer |
| Cursor-following glow | Whole site | `useSpring` on pointer position |
| Scroll-linked parallax | Ambient glows, orbit rings | `useScroll` + `useTransform` |
| Scroll progress bar | Sticky header | `useScroll` → `scaleX` |
| Page transitions | Between the three screens | `AnimatePresence mode="wait"` |
| Shimmer, pulse rings, hover lifts | Headlines, step numbers, pills | CSS keyframes |

### Type scale

Headlines run at the reference site's scale rather than a conservative one: h1 is
`clamp(2.7rem, 7.1vw, 5.7rem)` and h2 `clamp(2.2rem, 5.4vw, 4.8rem)`. Measured: 91 px at
1440 wide, 73 px at 1024, 55 px at 768, 43 px at 390.

The h1 maximum is capped at 5.7rem rather than left to the `vw` term. Above roughly
1350 px the viewport keeps growing but the headline column does not — the shell is capped
at 1200 px — so an uncapped size pushed \Extraordinary\ to 531 px inside a 482 px column.
Checked at twelve widths from 1920 down to 360: no word exceeds its container and the page
never scrolls sideways.

The hero form sits in the wider column (0.88fr / 1.12fr) at 614 px on desktop, up from
522 px, with roomier field padding to match.

Around 340 characters animate independently across the page. `will-change` is deliberately
**not** set on them — Motion adds it for the duration of each animation and removes it
after, whereas a permanent one would promote every glyph to its own compositor layer and
cost far more than it saved on a mid-range phone.

### Reduced motion

`<MotionConfig reducedMotion="user">` wraps the app, so every Motion animation drops its
movement and keeps only opacity when the OS setting is on. Lenis, the cursor glow and the
pinned process section switch off entirely — verified: with reduced motion enabled, all 29
headline words still reveal on scroll with no transform applied.

### Cursor glow

Rebuilt from the reference recording rather than guessed at. Frame analysis isolated one
large soft blob travelling smoothly with the pointer, roughly 110 × 130 px above threshold,
mean colour **RGB (34, 39, 87)**. The implementation measures **RGB (33, 41, 88)** over the
same dark background. It blends with `screen`, so it lightens the dark sections and
disappears over the light footer, and the native cursor stays visible.

### Weight — worth a conversation

The animated build is **125 kB gzipped** (was 62 kB with the hand-rolled CSS version).
Motion, Lenis, React 19 and Router 7 account for most of it. On a landing page paid for by
Meta ad clicks, that extra ~60 kB is a real cost on slow mobile connections.

Two dials if it matters:

- `<ProcessScroll steps={STEPS} pinned={false} />` in `pages/Landing.jsx` removes the 240vh
  pinned section, shortening the page and getting visitors to the CTA sooner.
- Dropping Lenis alone saves ~4 kB and removes the scroll hijacking, which some visitors
  dislike on long pages.

Measure with the real Meta campaign before assuming heavier is better.

---

## preview.html

A single self-contained file: the real components and stylesheet, built in demo mode so
the API call is stubbed. It opens straight from disk with no server and no database — use
it to get design approval before wiring anything up. Rebuild it after design changes with:

```bash
cd client && npm run preview:build
```

Demo mode is driven by `VITE_DEMO`, which production builds never set.
