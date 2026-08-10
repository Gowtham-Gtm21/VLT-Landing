/**
 * Drops your own footage into the page.
 *
 *   npm run media:add -- "<source file>" <slot>
 *
 * Slots: hero, work-1, work-2, work-3, work-4, work-5, band-1
 *
 * Produces WebM + MP4 (+ a poster for hero and band-1) at the exact filenames
 * the page already points at, so nothing in the code needs editing afterwards.
 *
 * Requires ffmpeg on your PATH:
 *   Windows   winget install Gyan.FFmpeg      (then reopen the terminal)
 *   macOS     brew install ffmpeg
 *   Linux     sudo apt install ffmpeg
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { homedir } from 'node:os';

const SLOTS = ['hero', 'work-1', 'work-2', 'work-3', 'work-4', 'work-5', 'band-1'];
const args = process.argv.slice(2);

function fail(msg) {
  console.error(`\n${msg}\n`);
  console.error('usage:  npm run media:add -- "<source file>" <slot>');
  console.error(`slots:  ${SLOTS.join(', ')}`);
  console.error('\nexample (quotes matter when the path has spaces):');
  console.error('  npm run media:add -- "C:\\\\Users\\\\you\\\\Videos\\\\my clip.mp4" hero\n');
  process.exit(1);
}

if (args.length < 2) fail('Need a source file and a slot.');

// An unquoted Windows path with spaces arrives as several arguments, so treat
// the last one as the slot and glue everything before it back together.
const slot = args[args.length - 1];
let src = args.slice(0, -1).join(' ');

if (!SLOTS.includes(slot)) {
  fail(`"${slot}" is not a slot. Did you forget to quote a path containing spaces?`);
}

// node does not expand ~ the way a shell does
if (src.startsWith('~')) src = src.replace(/^~/, homedir());
src = resolve(src);

if (!existsSync(src)) {
  fail(`Cannot find that file:\n  ${src}\n\nIf the path has spaces, wrap it in quotes.`);
}

try {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
} catch {
  fail(
    'ffmpeg is not on your PATH.\n' +
      '  Windows:  winget install Gyan.FFmpeg   (then reopen the terminal)\n' +
      '  macOS:    brew install ffmpeg\n' +
      '  Linux:    sudo apt install ffmpeg\n\n' +
      'No ffmpeg? Rename your clip to ' +
      `${slot}.mp4, put it in client/public/media/, and delete ${slot}.webm — ` +
      'the page falls back to the MP4 on its own.'
  );
}

const dir = resolve('public/media');
mkdirSync(dir, { recursive: true });

const big = slot === 'hero' || slot === 'band-1';
const width = big ? 1280 : 960;
const seconds = big ? '12' : '8';
const run = (a) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...a], { stdio: 'inherit' });

console.log(`\nsource : ${src}`);
console.log(`slot   : ${slot}  (${width}px wide, first ${seconds}s)\n`);

console.log('encoding webm ...');
run(['-i', src, '-t', seconds, '-vf', `scale=${width}:-2`, '-c:v', 'libvpx-vp9',
     '-crf', big ? '40' : '44', '-b:v', '0', '-deadline', 'good', '-cpu-used', '4',
     '-row-mt', '1', '-pix_fmt', 'yuv420p', '-an', `${dir}/${slot}.webm`]);

console.log('encoding mp4 ...');
run(['-i', src, '-t', seconds, '-vf', `scale=${width}:-2`, '-c:v', 'libx264',
     '-crf', big ? '30' : '32', '-preset', 'slow', '-pix_fmt', 'yuv420p',
     '-movflags', '+faststart', '-an', `${dir}/${slot}.mp4`]);

if (big) {
  const poster = slot === 'hero' ? 'hero-poster.jpg' : 'band-poster.jpg';
  console.log('grabbing poster ...');
  run(['-i', src, '-vframes', '1', '-vf', 'scale=960:-2', '-q:v', '5', `${dir}/${poster}`]);
}

console.log(`\ndone. now run:  npm run deploy:build\n`);
