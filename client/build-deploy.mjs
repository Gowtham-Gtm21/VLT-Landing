/**
 * Builds ../deploy/ — the folder you drag onto Netlify.
 *
 * Unlike preview.html this keeps CSS, JS and media as separate files, which is
 * what you want on a real host: smaller HTML and everything cacheable.
 *
 *   npm run deploy:build
 */
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const outDir = resolve('../deploy');

await build({
  configFile: false,
  plugins: [react()],
  publicDir: resolve('public'),
  define: { 'import.meta.env.VITE_DEMO': JSON.stringify('true') },
  build: { outDir, emptyOutDir: true },
});

const indexPath = `${outDir}/index.html`;
let html = readFileSync(indexPath, 'utf8');

// the preview must not fire real tracking pixels
html = html.replace(/\s*<!-- Meta Pixel[\s\S]*?<\/script>/, '');
html = html.replace(/\s*<noscript>[\s\S]*?<\/noscript>/, '');

// a review URL must never be indexed — it would compete with vulturelines.com
if (!html.includes('name="robots"')) {
  html = html.replace(
    '    <meta name="viewport"',
    '    <meta name="robots" content="noindex, nofollow" />\n' +
      '    <meta name="googlebot" content="noindex, nofollow" />\n' +
      '    <meta name="viewport"'
  );
}

html = html.replace(
  '<title>Book a discovery call | Vulture Lines Tech</title>',
  '<title>Design preview — Vulture Lines Tech landing page</title>'
);

writeFileSync(indexPath, html);
writeFileSync(`${outDir}/robots.txt`, 'User-agent: *\nDisallow: /\n');

console.log('deploy/ ready — drag the whole folder onto Netlify');
