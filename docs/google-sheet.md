# Sending leads to Google Sheets

Every enquiry lands in a Google Sheet, and the same row is rewritten when the appointment is
booked or the team changes the lead's status. Setup is about ten minutes and needs no Google Cloud project, no service-account
key file and no OAuth — just a script pasted into the sheet itself.

The lead is saved to MongoDB first and the sheet is written afterwards, fire-and-forget. If
the script URL is wrong, or Google is down, the visitor's submission still succeeds and the
lead is not lost.

---

## 1. Make the sheet

Create a new Google Sheet. Name it something like **VLT Leads**. Leave it empty — the
script writes its own header row the first time it runs.

## 2. Add the script

In the sheet: **Extensions → Apps Script**. Delete whatever is in the editor and paste the
whole of `server/google-apps-script.gs`.

At the top, change this line to a long random string:

```js
const SHARED_SECRET = 'change-this-to-a-long-random-string';
```

Save (the disk icon).

## 3. Deploy it as a web app

**Deploy → New deployment**, then:

| Field | Value |
| --- | --- |
| Type (gear icon) | Web app |
| Description | VLT leads |
| Execute as | **Me** |
| Who has access | **Anyone** |

"Anyone" sounds alarming but is required — the server calls this URL without a Google
login. The shared secret is what actually protects it: a request without the right secret
is rejected.

Google will ask you to authorise the script. It warns that the app is not verified; choose
**Advanced → Go to (project name)** and allow it. It is your own script.

Copy the **Web app URL** it gives you. It ends in `/exec`.

## 4. Point the site at it

There are two ways to wire this up. Pick the one that matches how you deployed.

### A. Static site only, no API running

This is the setup on Netlify right now: the built front end and nothing else. The browser
posts leads straight to Apps Script and **the sheet is the lead store**.

In `client/.env`:

```bash
VITE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/AKfy...../exec
VITE_SHEET_SECRET=the-same-long-random-string-you-set-in-the-script
```

Then `npm run deploy:build` and re-upload the `deploy` folder.

Two honest limitations of this route:

- The script URL and secret end up in the page source. Anyone who views source can find
  them and post junk rows. For a lead form that is usually tolerable; if it becomes a
  problem, move to option B.
- Apps Script sends no CORS headers, so the browser request has to go out in `no-cors`
  mode. The row is written, but the page cannot read the reply — a failed write is
  invisible. Nothing retries it.

### B. With the Express API deployed

Leave the two `VITE_` variables **blank**. The API writes to the sheet server-side, where
the secret stays private, failures are logged, and MongoDB holds the real record with the
sheet as a mirror.

## 4b. Point the server at it (option B only)

In `server/.env`:

```bash
GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/AKfy...../exec
GOOGLE_SHEET_SECRET=the-same-long-random-string-you-set-in-the-script
```

Restart the API. That is it.

---

## Checking it works

Open the `/exec` URL in a browser. You should see:

```json
{"ok":true,"service":"vlt-lead-sheet"}
```

Then submit the form on the site and watch the sheet — a row should appear within a second
or two, with **Status** `enquiry_received`. Book a slot and that same row updates to
`appointment_booked` with **Scheduled at** filled in, rather than a second row appearing.

If nothing appears, the API logs the reason with a `[sheets]` prefix. The usual causes are
a URL that stops at `/dev` instead of `/exec`, a secret that does not match the script, or
a deployment set to "Only myself" rather than "Anyone".

---

## What lands in the sheet

| Column | Notes |
| --- | --- |
| Submitted at | ISO timestamp |
| Name, Email, Phone, Company | as entered |
| Service | what they picked, or what a "pick the closest fit" card preselected |
| Project details | free text |
| Status | `enquiry_received`, then `appointment_booked` |
| Scheduled at | fills in when the Calendly slot is confirmed |
| Notes | whatever the team records against the lead |
| Source, Medium, Campaign | from the Meta ad's UTM parameters |
| Landing path, Referrer | where they arrived |
| Lead ID | the MongoDB id — this is what matches a booking back to its row |

Booking and status updates find the row by **Lead ID**, so one lead never produces two rows.

---

## Changing a deployed script

Editing the script is not enough — Apps Script serves the deployed version. After any
change: **Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy**.
The URL stays the same.

---

## A note on this versus a spreadsheet-only setup

A common shortcut is to have the browser post straight to Apps Script and skip the backend
entirely. That works, but it puts the script URL in the page source where anyone can find
and spam it, and it leaves the sheet as the only copy of your leads.

Here the sheet is a mirror, not the database. Leads live in MongoDB, and the sheet is a
convenient place for the sales team to read and filter them. If a Google outage loses a
write, the lead is still in the database and `GET /api/leads` will return it.
