# Connecting Calendly

About fifteen minutes. This is what turns the "Pick a time" step from a placeholder notice
into a real calendar.

The visitor never types anything twice — their name, email and phone travel from the form
into the booking screen automatically.

---

## Step 1 — Create the account

Go to [calendly.com](https://calendly.com) and sign up. The free plan is enough: it allows
one event type, which is all this needs.

Connect the calendar the team actually uses (Google, Outlook or Office 365) when it asks.
Without this, Calendly cannot see when you are busy and will offer slots you cannot make.

---

## Step 2 — Create the event type

**Event Types → + Create → One-on-One.**

| Field | Suggested value |
| --- | --- |
| Event name | Discovery Call |
| Duration | 30 minutes |
| Location | Google Meet or Zoom — pick one, or Calendly will not send a joining link |
| Description | A short line on what the call covers |

Under **Availability**, set the hours the team can genuinely take calls. Add buffer time
before and after if back-to-back calls are a problem.

---

## Step 3 — Add the phone question (important)

This step is what lets the phone number carry across from your form.

In the event type: **Invitee Questions → + Add New Question**

| Field | Value |
| --- | --- |
| Question | Phone number |
| Answer type | One line |
| Required | Yes |

**It must be the first custom question in the list.** Calendly names custom questions
`a1`, `a2`, `a3` in order, and the code prefills `a1`. If it sits second, the visitor's
phone number will land in the wrong box. Drag it to the top if it is not already there.

---

## Step 4 — Copy the link

At the top of the event type, **Copy link**. It looks like:

```
https://calendly.com/vlt-sutheesh/30min
```

It must have both parts — a username and an event slug. A bare `calendly.com/username` is
not an event and will not work.

---

## Step 5 — Put it in the project

Two files, the same link in both.

`client/.env`:

```bash
VITE_CALENDLY_URL=https://calendly.com/vlt-sutheesh/30min
VITE_CALENDLY_MODE=embed
```

`server/.env`:

```bash
CALENDLY_URL=https://calendly.com/vlt-sutheesh/30min
```

**Restart both servers.** Vite does not pick up `.env` changes while running.

---

## Step 6 — Add the webhook (optional)

Two things to settle before spending time on this.

**It needs a paid plan.** Webhook subscriptions require Calendly Standard or above. On the
free plan the call below returns a permission error — that is a plan limit, not a fault.

**It needs the API deployed.** Calendly has to reach your server from the internet, so
`localhost` will not work. This is a launch-day task.

**What you lose by skipping it:** very little. The browser already reports a booking the
moment it happens, so the normal path is covered. The webhook catches two edge cases only:
someone closing the tab in the split second after booking, and **cancellations**, which the
browser can never see. Without it, a cancelled call would still read `appointment_booked`
in your sheet until someone checks the Calendly dashboard.

### Creating it

Calendly has no click-and-fill form for this — subscriptions are made through their API.
`server/create-webhook.mjs` wraps the two calls it takes.

**1.** In Calendly: **Integrations & apps → API and webhooks → Personal access tokens →
Get a token now.** Copy it immediately; Calendly shows it once.

When it asks for scopes, tick **all four** of these and nothing else:

| Group | Scope | Why |
| --- | --- | --- |
| User management | `users:read` | Looks up your organization, which the subscription is attached to |
| Webhooks | `webhooks:read` | Needed for `--list` |
| Webhooks | `webhooks:write` | Creates and deletes the subscription |
| Scheduling | `scheduled_events:read` | Required by the `invitee.created` and `invitee.canceled` events |

Ticking `webhooks:write` selects `webhooks:read` automatically and greys it out — that is
expected, not a failure to register your click.

Calendly reveals these requirements one failure at a time, so a token missing any of them
fails with a message naming it. The script reads that message back to you rather than
guessing at the cause.

**2.** Run:

```bash
cd server
node create-webhook.mjs YOUR_TOKEN https://api.yourdomain.com/api/webhooks/calendly
```

The endpoint must be `https`. Calendly rejects plain http.

**3.** It prints a signing key. Put it in `server/.env` and restart the API:

```bash
CALENDLY_WEBHOOK_SECRET=the-key-it-printed
```

Other things the script can do:

```bash
node create-webhook.mjs YOUR_TOKEN --list            # what is registered
node create-webhook.mjs YOUR_TOKEN --delete <uri>    # remove one
```

**Testing it:** book a slot on your own site, then cancel it from the Calendly dashboard.
The sheet row should change to `appointment_cancelled`, and a WhatsApp message should say
the same.

### Testing locally, if you want to

`ngrok` gives your local server a temporary public URL:

```bash
npx ngrok http 5000
```

Use the `https://…ngrok-free.app/api/webhooks/calendly` address it prints as the endpoint.
The URL changes each time ngrok restarts, so you would re-register the webhook each time —
fine for one test, not for daily work.

## Checking it works

1. Open the site and submit the form
2. The calendar should appear with **name, email and phone already filled in** — if the
   phone box is empty, revisit step 3
3. Book a slot
4. You should land on the confirmation page automatically, with no extra click

Then confirm the rest fired:

- an invite in the visitor's inbox and on the team's calendar
- a second WhatsApp message reading **Appointment booked**
- the Google Sheet row updating to `appointment_booked`, with **Scheduled at** filled in —
  the same row as the enquiry, not a new one

---

## If something is wrong

**Calendly's own marketing page appears instead of a calendar.** The link points at an
event that does not exist. Re-copy it from step 4.

**A "calendar not connected yet" notice appears.** `VITE_CALENDLY_URL` is empty or still
the sample. Check `client/.env` and restart the dev server.

**The phone box is empty on the booking screen.** The phone question is not the first
custom question. Drag it to the top of Invitee Questions.

**Booking works but the sheet row does not update.** The browser call is failing quietly.
Check the API logs, and add the webhook from step 6 as a backstop.

---

## Two modes

`VITE_CALENDLY_MODE` in `client/.env`:

**`embed`** (recommended) — the calendar loads inside `/schedule` on your own domain. The
visitor never leaves, and the Meta Pixel sees the whole funnel, which matters for
attribution.

**`redirect`** — the browser jumps to calendly.com. If you use this, open the event type →
**Confirmation Page → Redirect to an external site** → `https://yourdomain.com/thank-you`,
and tick *Pass event details to your redirected page*. Otherwise the visitor is stranded on
Calendly's own confirmation and your conversion event never fires.
