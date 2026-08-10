# Deploying the design preview

## Two builds — this matters

| Command | Output | Form behaviour |
| --- | --- | --- |
| `npm run deploy:build` | `deploy/` | **Fakes** a submission. Nothing is stored anywhere. `noindex`. |
| `npm run live:build` | `live/` | **Real.** Sends leads to your Google Sheet or API. Indexable. |

If you have been uploading `deploy/`, the form has been collecting nothing — that build
exists so the design can be reviewed without a backend. Once the design is signed off,
follow `docs/google-sheet.md`, fill in `client/.env`, then run `live:build` and upload
`live/` instead. `live:build` refuses to run if there is nowhere for the leads to go.

---

`deploy/` is the **design review build**, not the live landing page. It is a build
output — regenerate it with `npm run deploy:build`, don't edit it by hand.

- The form does not reach the API — it fakes a response
- Meta Pixel is stripped out, so nothing is tracked
- `noindex, nofollow` and `robots.txt` keep it out of Google

Use it to get design approval over a link. Do **not** point a Meta campaign at it —
no lead would be saved and no appointment would be booked.

---

## Important: `deploy/index.html` will not open by double-clicking

It links `/assets/...` and `/media/...` from the site root, which only resolves when
something is serving the folder. Opened straight off the disk you get a blank page and no
video. That is expected — it works as soon as it is on a host.

To check it locally first:

```bash
cd deploy && python3 -m http.server 8000
# then open http://localhost:8000
```

For sending over WhatsApp use `preview.html` instead — that one is a single self-contained
file with the video embedded, and it does open from disk.

---

## Fastest: Netlify Drop (about 60 seconds, no account needed to start)

1. Run `cd client && npm run deploy:build` (this regenerates the `deploy` folder)
2. Go to https://app.netlify.com/drop and drag the whole `deploy` folder onto the page
3. You get a URL like `https://random-name-123.netlify.app` — share that

To rename it: Site configuration → Change site name → e.g. `vlt-landing-preview`.

## GitHub Pages

```bash
git init && git add . && git commit -m "VLT landing preview"
git branch -M main
git remote add origin https://github.com/<you>/vlt-preview.git
git push -u origin main
```

Then Settings → Pages → Source: `main` / root. URL: `https://<you>.github.io/vlt-preview/`

## Vercel

```bash
npx vercel --prod
```

Pick this folder when prompted. No build command, no framework.

## Cloudflare Pages

Dashboard → Workers & Pages → Create → Pages → Upload assets → drag the folder.

## Surge

```bash
npx surge . vlt-landing-preview.surge.sh
```

---

## Making a change after it is live

`index.html` is a build output — the whole React app is minified inside its `<script>`
tag. Editing that by hand breaks it, and the next build overwrites it anyway.

Edit the source, then rebuild:

| What you want to change | File to edit |
| --- | --- |
| Any wording on the page | `client/src/pages/Landing.jsx` (the arrays at the top) |
| Form fields, labels, validation | `client/src/components/LeadForm.jsx` |
| Thank You page copy | `client/src/pages/ThankYou.jsx` |
| Colours, fonts, spacing | `client/src/styles/global.css` (tokens are at the top) |
| Animation timing and easing | `client/src/lib/anim.js` |
| Phone, email, footer links | `client/src/components/Chrome.jsx` |
| Browser tab title, meta description | `client/index.html` |

Then, one command:

```bash
cd client && npm run deploy:build
```

That rebuilds the whole `deploy` folder — HTML, CSS, JS and media — with the noindex tags
already in place. Drag the
`deploy` folder onto your Netlify site again (Deploys tab → drag anywhere on the page)
and the live URL updates in a few seconds.

**Tip:** connect the project to a GitHub repo in Netlify instead, and every `git push`
redeploys automatically — no more dragging.

### The exception

The plain HTML in the `<head>` — `<title>`, meta description, `theme-color` — is real
text near the top of the file and can be edited by hand if you have no Node set up.
Anything below `<style>` should not be touched.

---

## One requirement

The page pulls Cormorant Garamond and Poppins from Google Fonts, so the device needs
internet. That is fine once deployed — it was only an issue when opening the file
from WhatsApp on a phone with no connection.

---

## When the design is approved

Deploy the real thing instead, from the parent folder:

```bash
cd ../client && npm install && npm run build   # produces client/dist
cd ../server && npm install && npm start       # the API
```

`client/live` goes to the same static host; the API needs a Node host (Render, Railway, a
VPS) plus MongoDB. To send leads to Google Sheets as well, follow `docs/google-sheet.md` —
about ten minutes, no Google Cloud project needed. Set `MONGO_URI` and `CLIENT_URLS` first, and put the
real Meta Pixel ID into `client/index.html`. Full checklist is in the main `README.md`.
