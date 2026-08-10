/**
 * Builds ../live/ — the real site, the one that actually captures leads.
 *
 *   npm run live:build
 *
 * The difference from `deploy:build` is that this does NOT set VITE_DEMO, so
 * the form submits for real instead of faking a response, and it does not add
 * the noindex tags, because this is the page you want found.
 *
 * It refuses to build without somewhere for the leads to go, since a landing
 * page that silently drops enquiries is worse than one that fails loudly.
 * Set either VITE_SHEET_WEBHOOK_URL (Google Sheet, no backend) or VITE_API_URL
 * (the Express API) in client/.env — see docs/google-sheet.md.
 */
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const outDir = resolve('../live');

function readEnv() {
  const path = resolve('.env');
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      })
  );
}

const env = readEnv();
const sheet = env.VITE_SHEET_WEBHOOK_URL;
const api = env.VITE_API_URL;

if (!sheet && !api) {
  console.error(`
Nothing is set up to receive leads, so this build would collect nothing.

Set ONE of these in client/.env and run again:

  VITE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/AKfy...../exec
  VITE_SHEET_SECRET=the-secret-from-your-apps-script

    ...for the no-backend setup, where the Google Sheet is the lead store.
    Walkthrough: docs/google-sheet.md

  VITE_API_URL=https://api.yourdomain.com/api

    ...if you have deployed the Express server.
`);
  process.exit(1);
}

await build({
  configFile: false,
  plugins: [react()],
  publicDir: resolve('public'),
  envDir: resolve('.'),
  build: { outDir, emptyOutDir: true },
});

const indexPath = `${outDir}/index.html`;
let html = readFileSync(indexPath, 'utf8');

if (html.includes('YOUR_PIXEL_ID')) {
  console.warn('Warning: the Meta Pixel ID in index.html is still the placeholder.');
}

writeFileSync(indexPath, html);
writeFileSync(`${outDir}/_redirects`, '/*    /index.html   200\n');

console.log(`
live/ is ready — this build submits real leads.
  leads go to: ${sheet ? 'the Google Sheet (browser -> Apps Script)' : `the API at ${api}`}

Drag the live folder onto Netlify.
`);
