# Vulture Lines Tech — landing page

A MERN application. A visitor fills the enquiry form, the lead is stored in MongoDB and
pushed to **WhatsApp** and a **Google Sheet** at the same moment, then they go straight to
**Calendly** to pick a slot. Booking the slot updates the same sheet row and sends a second
WhatsApp message.

```
Meta ad → Landing page → Enquiry form ─┬→ MongoDB
                                       ├→ WhatsApp   +91 97916 70504
                                       └→ Google Sheet   (status: enquiry_received)
                                        ↓
                              Calendly — pick a time
                                        ↓
                              Booking confirmed ─┬→ WhatsApp (2nd message)
                                                 └→ same sheet row updated
                                        ↓
                                Confirmation page
```

---

## Running it locally

Two terminals. Node 18 or newer.

### Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev            # http://localhost:5000
```

### Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

Leave `VITE_API_URL` empty in development — Vite proxies `/api` to port 5000.

The site runs immediately. The form saves to the database, and the parts that need external
accounts show a clear notice until you connect them, rather than failing.

---

## The three setup jobs

Each takes ten to fifteen minutes, and each has its own guide.

| # | What | Guide | Without it |
| --- | --- | --- | --- |
| 1 | **Google Sheet** — leads land in a spreadsheet | `docs/google-sheet.md` | Leads still save to MongoDB |
| 2 | **Calendly** — the "Pick a time" step | `docs/calendly.md` | A "calendar not connected" notice appears |
| 3 | **WhatsApp** — lead alerts | below | Leads still save; no alert is sent |

Nothing is blocking. Anything left unconfigured is skipped and logged, never fatal.

### 1. Google Sheet — `docs/google-sheet.md`

Create a sheet, paste `server/google-apps-script.gs` into **Extensions → Apps Script**,
deploy it as a web app, and copy the `/exec` URL into `server/.env`. No Google Cloud
project and no service-account key file.

```bash
GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/AKfy...../exec
GOOGLE_SHEET_SECRET=a-long-random-string
```

### 2. Calendly — `docs/calendly.md`

Create a free account and a 30-minute event type, **add a phone question as the first
custom question**, then copy the event link into both env files:

```bash
# client/.env
VITE_CALENDLY_URL=https://calendly.com/vlt-sutheesh/30min
VITE_CALENDLY_MODE=embed

# server/.env
CALENDLY_URL=https://calendly.com/vlt-sutheesh/30min
```

The phone question must be first — Calendly names custom questions `a1`, `a2`, `a3` in
order and the code prefills `a1`. The guide covers the webhook too — optional, and only adds cancellation handling. Note
that its token needs three scopes: `users:read`, `webhooks:read` and `webhooks:write`.

### 3. WhatsApp — Meta Cloud API

Get a token and phone number ID from developers.facebook.com → WhatsApp, then:

```bash
WHATSAPP_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_NOTIFY_TO=919342216211
```

**One constraint to know before testing.** Meta only permits free-form business messages
within **24 hours** of the recipient last messaging your business number. Outside that
window an approved template is required — name it in `WHATSAPP_TEMPLATE`. If the notified
number replies to the thread daily this rarely bites, but a template is the dependable
route. Indian resellers such as AiSensy, WATI or Interakt handle the approval process more
gently than the Meta console does.

---

## Everything in `server/.env`

Only `MONGO_URI` is required to start.

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | The database — Atlas free tier, or `mongodb://127.0.0.1:27017/vlt_landing` |
| `CALENDLY_URL` | The event link visitors book through |
| `CALENDLY_WEBHOOK_SECRET` | Optional. Catches bookings and cancellations the browser misses |
| `GOOGLE_SHEET_WEBHOOK_URL`, `GOOGLE_SHEET_SECRET` | Leads into a spreadsheet |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_NOTIFY_TO` | Lead alerts |
| `ADMIN_API_KEY` | Protects the lead export and status endpoint |
| `CLIENT_URLS` | Comma-separated front-end origins allowed by CORS |
| `SMTP_*`, `NOTIFY_TO` | Optional email copy of each lead |

The lead is written to MongoDB **before** any notification is attempted, and the
notifications are fire-and-forget. A WhatsApp outage or a wrong sheet URL therefore cannot
fail a visitor's submission.

---

## Confirming the whole thing works

Submit the form at `localhost:5173`, then check, in order:

1. **Sheet** — a row appears with **Status** `enquiry_received`
2. **WhatsApp** — a message on `+91 97916 70504` beginning `*New enquiry*`
3. **Browser** — the calendar loads with name, email and phone already filled in
4. Book a slot — you land on the confirmation page with no extra click
5. **Sheet again** — the *same* row updates to `appointment_booked`, **Scheduled at** filled
6. **WhatsApp again** — a second message, `*Appointment booked*`

Failures are logged with a `[sheets]` or `[whatsapp]` prefix; nothing fails silently. The
lead is stored either way:

```bash
curl -H "x-admin-key: YOUR_ADMIN_API_KEY" http://localhost:5000/api/leads
```

---

## Working the leads

Each lead carries a status. Moving it also rewrites its sheet row, so the sales view stays
current:

```bash
curl -X PATCH http://localhost:5000/api/leads/LEAD_ID/status \
  -H "x-admin-key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status":"contacted","notes":"Spoke on the call, sending a proposal."}'
```

Valid values: `enquiry_received`, `appointment_booked`, `appointment_cancelled`,
`contacted`, `closed`.

---

## Going live

```bash
cd client && npm run live:build      # outputs ../live
```

Upload `live/` to Netlify, Vercel or any static host. Deploy `server/` to Render, Railway or
a VPS, set `CLIENT_URLS` to your front-end domain so CORS permits it, and set `VITE_API_URL`
in `client/.env` to the deployed API before building.

`npm run deploy:build` is a **different, demo build** — the form fakes a response and stores
nothing, and the booking step shows a stand-in. It exists so the design can be reviewed over
a link without any backend. Do not point a campaign at it.

Before launch, also replace `YOUR_PIXEL_ID` in `client/index.html` with the real Meta Pixel
ID, or none of the conversion events will reach Meta.

Further reading: `DEPLOY.md` for hosting, `README.md` for design and implementation notes.
