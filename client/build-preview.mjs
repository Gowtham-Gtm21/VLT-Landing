/**
 * Builds ../preview.html: one self-contained file containing the real
 * components and stylesheet, running in demo mode. Run with `npm run preview:build`.
 */
import { build } from 'vite';
import { readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

await build({ configFile: resolve('vite.preview.config.js') });

const dir = resolve('preview-dist');
let html = readFileSync(`${dir}/index.html`, 'utf8');
const css = readFileSync(`${dir}/app.css`, 'utf8');
const js = readFileSync(`${dir}/app.js`, 'utf8');

// the preview must not fire real tracking pixels
html = html.replace(/\s*<!-- Meta Pixel[\s\S]*?<\/script>/, '');
html = html.replace(/\s*<noscript>[\s\S]*?<\/noscript>/, '');

html = html.replace('<link rel="stylesheet" crossorigin href="/app.css">', `<style>\n${css}\n</style>`);

// move the bundle to the end of body: an inline script is not deferred,
// so in <head> it would run before #root exists
html = html.replace(/\s*<script[^>]*src="\/app\.js"[^>]*><\/script>/, '');
html = html.replace('</body>', () => `  <script>\n${js}\n  </script>\n</body>`);

html = html.replace(
  '<title>Book a discovery call | Vulture Lines Tech</title>',
  '<title>Design preview — Vulture Lines Tech landing page</title>'
);

// public/ media is referenced by absolute path, so Vite copies it rather than
// inlining it. For a file that has to work from disk, fold it in as data URIs.
const mime = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
};

// Walk all of public/, not just public/media — the logo sits at the root and
// was being left as a broken absolute path in the single-file build.
function inlineDir(dir, urlPrefix) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const names = entries.filter((e) => e.isFile()).map((e) => e.name);

  for (const entry of entries) {
    if (entry.isDirectory()) {
      inlineDir(`${dir}/${entry.name}`, `${urlPrefix}${entry.name}/`);
      continue;
    }
    const ext = entry.name.split('.').pop().toLowerCase();
    if (!mime[ext]) continue;

    // MP4 is only a fallback for old Safari; WebM is listed first and always
    // wins, so inlining both would double this file for nothing.
    if (ext === 'mp4' && names.includes(entry.name.replace(/\.mp4$/, '.webm'))) continue;

    const b64 = readFileSync(`${dir}/${entry.name}`).toString('base64');
    html = html.replaceAll(`${urlPrefix}${entry.name}`, `data:${mime[ext]};base64,${b64}`);
  }
}

inlineDir(resolve('public'), '/');

writeFileSync(resolve('../preview.html'), html);
rmSync(dir, { recursive: true, force: true });

console.log(`preview.html written (${(html.length / 1024).toFixed(0)} kB)`);
