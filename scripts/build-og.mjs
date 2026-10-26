// Makes the link previews in the site's design: for each page and language a still
// (public/og/*.png, 1200 x 630) and a short video (public/og/*.mp4) for the apps that
// play og:video. Each still is a frame of its own video, so the two always match:
// the home still is the last frame (tags written), a film still is the first frame.
// Also makes the favicons (public/favicon.ico, public/apple-touch-icon.png) from public/favicon.svg.
// Run with: npm run og   (needs ffmpeg, and media/web/ for the film frames; first time: npx playwright install chromium)
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { timeMark } from '../src/lib/mark-timing.mjs';

const pub = resolve('public');
const url = (p) => pathToFileURL(resolve(pub, p)).href;
const en = JSON.parse(await readFile('src/i18n/en.json', 'utf8'));
const pl = JSON.parse(await readFile('src/i18n/pl.json', 'utf8'));
const strokes = JSON.parse(await readFile('src/data/strokes.json', 'utf8'));
const work = join(tmpdir(), 'oskarpajka-og');

const ffmpeg = (...args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
const timecode = (frame) => {
  const two = (n) => String(n).padStart(2, '0');
  const s = Math.floor(frame / 24);
  return `${Math.floor(s / 3600)}:${two(Math.floor(s / 60) % 60)}:${two(s % 60)}:${two(frame % 24)}`;
};

// A marker tag with its traced mask, written on by CSS like Mark.astro on the site.
const mark = (name, timing, style) => {
  const m = strokes[name];
  const { timed, end } = timeMark(m, { name, ...timing });
  const id = `m-${name}`;
  const paths = timed
    .map(({ seg, d, t }) => `<path d="${seg.d}" stroke-width="${seg.w}" pathLength="1" style="--d:${d}ms;--t:${t}ms"/>`)
    .join('');
  return {
    end,
    svg: `<svg class="mark" viewBox="0 0 ${m.w} ${m.h}" style="${style}"><defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${m.w}" height="${m.h}"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">${paths}</g><rect class="lift" width="${m.w}" height="${m.h}" fill="#fff" style="--d:${end}ms"/></mask></defs><image href="${url(`marks/${name}.svg`)}" width="${m.w}" height="${m.h}" mask="url(#${id})"/></svg>`,
  };
};

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Geist";src:url("${url('fonts/site/geist-latin.woff2')}") format("woff2");font-weight:100 900}
@font-face{font-family:"Geist";src:url("${url('fonts/site/geist-latin-ext.woff2')}") format("woff2");font-weight:100 900;unicode-range:U+0100-02BA,U+1E00-1E9F}
@font-face{font-family:"Geist Mono";src:url("${url('fonts/site/geist-mono-latin.woff2')}") format("woff2");font-weight:100 900}
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;overflow:hidden;background:#e9e9e6;color:#111110;font-family:"Geist",sans-serif;-webkit-font-smoothing:antialiased}
.f{width:1200px;height:630px;display:flex;flex-direction:column}
.bar{flex:0 0 72px;display:flex;border-bottom:1px solid #111110}
.bar div{display:flex;align-items:center;padding:0 32px;font-size:24px;font-weight:500;line-height:1}
.bar div:first-child{flex:1 1 auto}
.bar div+div{border-left:1px solid #111110;font-family:"Geist Mono",monospace;font-weight:400;font-size:22px}
.name{font-weight:700 !important;letter-spacing:-0.04em;text-transform:uppercase}
.big{flex:0 0 auto;display:flex;border-bottom:1px solid #111110}
.big .t{flex:1 1 auto;padding:26px 32px 28px}
.big .t div{margin:0 0 0 -0.04em;font-weight:600;font-size:124px;line-height:0.9;letter-spacing:-0.045em;white-space:nowrap}
.big .tc{flex:0 0 auto;display:flex;align-items:flex-end;padding:0 32px 30px;font-family:"Geist Mono",monospace;font-size:22px;line-height:1;font-variant-numeric:tabular-nums}
.media{flex:1 1 auto;min-height:0;display:flex;gap:1px;background:#111110}
.media img{display:block;flex:1 1 0;min-width:0;height:100%;object-fit:cover}
.mark{position:absolute;overflow:visible}
.mark path{stroke-dasharray:1 2;visibility:hidden;stroke-dashoffset:1;animation:stroke var(--t) linear var(--d) forwards}
.mark .lift{opacity:0;animation:lift 120ms linear var(--d) forwards}
@keyframes stroke{from{visibility:visible;stroke-dashoffset:1}to{visibility:visible;stroke-dashoffset:0}}
@keyframes lift{to{opacity:1}}
</style></head><body>${body}</body></html>`;

// The home hero: the tags write on above the name, as on the site (CODE first, then FRAMES).
const home = (t) => {
  const frames = mark('frames', { dur: 1250, delay: 1300 }, 'left:56px;top:46px;width:600px');
  const code = mark('code', { dur: 1000, delay: 200 }, 'right:48px;top:52px;width:500px');
  return {
    end: Math.max(frames.end, code.end),
    html: page(`<div class="f">
  <div class="bar"><div>${t.nav.tagline}</div><div>oskarpajka.com</div></div>
  <div style="position:relative;flex:1 1 auto">${frames.svg}${code.svg}</div>
  <div style="padding:0 32px 34px;margin-top:-26px;position:relative"><div style="margin:0 0 0 -0.04em;font-weight:700;font-size:170px;line-height:0.8;letter-spacing:-0.06em;white-space:nowrap;text-transform:uppercase">oskar pajka</div></div>
  </div>`),
  };
};

// A film card: title and timecode over panels of the film playing.
const film = (t, name, length, panels) =>
  page(`<div class="f">
  <div class="bar"><div class="name">oskar pajka</div><div>${t.project.kind}</div></div>
  <div class="big"><div class="t"><div>${name}</div></div><div class="tc" data-tc>${length}</div></div>
  <div class="media">${panels.map(() => '<img data-panel>').join('')}</div></div>`);

// Each film: its master for the web, and the moments its panels play from (seconds).
const FILM_SECONDS = 5;
const films = {
  hoplite: { name: 'Hoplite', file: 'media/web/hoplite-1080.mp4', frames: 784, panels: [22], countTc: true },
  bridgemind: { name: 'BridgeMind', file: 'media/web/bridgemind-1080.mp4', frames: 720, panels: [7, 13, 20], countTc: false },
};

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const show = async (html) => {
  const file = join(work, 'card.html');
  await writeFile(file, html);
  await tab.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
};
// Frames as PNGs into a folder, then one H.264 MP4 every app can play.
const encode = async (dir, fps, out) => {
  ffmpeg('-framerate', String(fps), '-i', join(dir, '%04d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '24',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', resolve(pub, 'og', out));
};
const fresh = async (dir) => {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
};

await mkdir(work, { recursive: true });
await mkdir(resolve(pub, 'og'), { recursive: true });

// Film panels: extract the frames once per film and panel size.
const panelFrames = {};
for (const [key, f] of Object.entries(films)) {
  await show(film(en, f.name, timecode(f.frames), f.panels));
  const box = await tab.evaluate(() => {
    const r = document.querySelector('[data-panel]').getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  });
  panelFrames[key] = [];
  for (const [i, start] of f.panels.entries()) {
    const dir = join(work, `${key}-${i}`);
    await fresh(dir);
    ffmpeg('-ss', String(start), '-t', String(FILM_SECONDS), '-i', resolve(f.file),
      '-vf', `fps=24,scale=${box.w * 2}:${box.h * 2}:force_original_aspect_ratio=increase,crop=${box.w * 2}:${box.h * 2}`,
      '-q:v', '3', join(dir, '%04d.jpg'));
    panelFrames[key].push((await readdir(dir)).sort().map((n) => pathToFileURL(join(dir, n)).href));
  }
}

for (const [lang, t] of [['en', en], ['pl', pl]]) {
  const sfx = lang === 'pl' ? '-pl' : '';

  // Home: step the write-on animation frame by frame, then hold the finished tags.
  {
    const card = home(t);
    const fps = 30;
    const total = Math.ceil(((card.end + 1300) / 1000) * fps);
    const dir = join(work, `home${sfx}`);
    await fresh(dir);
    await show(card.html);
    for (let i = 0; i < total; i++) {
      await tab.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), (i * 1000) / fps);
      await tab.screenshot({ path: join(dir, `${String(i + 1).padStart(4, '0')}.png`) });
    }
    await encode(dir, fps, `home${sfx}.mp4`);
    await tab.screenshot({ path: resolve(pub, 'og', `home${sfx}.png`) }); // the last frame
    console.log(`Saved public/og/home${sfx}.png and .mp4`);
  }

  // Films: swap in the next frame of each panel and count the timecode.
  for (const [key, f] of Object.entries(films)) {
    const dir = join(work, `${key}${sfx}`);
    await fresh(dir);
    await show(film(t, f.name, timecode(f.frames), f.panels));
    const count = Math.min(...panelFrames[key].map((p) => p.length));
    for (let i = 0; i < count; i++) {
      const srcs = panelFrames[key].map((p) => p[i]);
      const tc = f.countTc ? `${timecode(f.panels[0] * 24 + i)} / ${timecode(f.frames)}` : null;
      await tab.evaluate(async ({ srcs, tc }) => {
        const imgs = [...document.querySelectorAll('[data-panel]')];
        imgs.forEach((img, n) => (img.src = srcs[n]));
        await Promise.all(imgs.map((img) => img.decode()));
        if (tc) document.querySelector('[data-tc]').textContent = tc;
      }, { srcs, tc });
      const frame = join(dir, `${String(i + 1).padStart(4, '0')}.png`);
      await tab.screenshot({ path: frame });
      if (i === 0) await tab.screenshot({ path: resolve(pub, 'og', `${key}${sfx}.png`) }); // the first frame
    }
    await encode(dir, 24, `${key}${sfx}.mp4`);
    console.log(`Saved public/og/${key}${sfx}.png and .mp4`);
  }
}
// Favicons from public/favicon.svg
const svg = url('favicon.svg');
// Tab icons keep the corners around the circle transparent. iOS rounds the home
// screen icon itself and turns transparency black, so that one sits on the page colour.
const icon = async (size, background = 'transparent') => {
  await tab.setViewportSize({ width: size, height: size });
  await show(`<html><body style="margin:0;background:${background}"><img src="${svg}" style="display:block;width:${size}px;height:${size}px"></body></html>`);
  return tab.screenshot({ type: 'png', omitBackground: background === 'transparent' });
};
await writeFile(resolve(pub, 'apple-touch-icon.png'), await icon(180, '#e9e9e6'));
console.log('Saved public/apple-touch-icon.png');

// A .ico file can hold PNG images directly: a 6 byte header, a 16 byte entry each.
const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) pngs.push(await icon(s));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
await writeFile(resolve(pub, 'favicon.ico'), Buffer.concat([header, ...pngs]));
console.log('Saved public/favicon.ico');

await browser.close();
await rm(work, { recursive: true, force: true });
