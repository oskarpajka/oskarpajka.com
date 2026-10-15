// Makes the link previews (public/og/*.png, 1200 x 630) and the favicons
// (public/favicon.ico, public/apple-touch-icon.png) from the canvas boards
// PreviewHome, PreviewHoplite, PreviewBridgeMind and Favicon.
// Run with: npm run og   (first time: npx playwright install chromium)
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';

const pub = resolve('public');
const url = (p) => pathToFileURL(resolve(pub, p)).href;
const en = JSON.parse(await readFile('src/i18n/en.json', 'utf8'));
const pl = JSON.parse(await readFile('src/i18n/pl.json', 'utf8'));

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Archivo Expanded";src:url("${url('fonts/site/archivo-expanded.woff2')}") format("woff2");font-weight:100 900}
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;overflow:hidden;background:#111110;color:#111110;font-family:"Archivo Expanded",sans-serif;-webkit-font-smoothing:antialiased}
.f{width:1200px;height:630px;display:flex;flex-direction:column;gap:1px;background:#111110}
.bar{flex:0 0 72px;display:flex;gap:1px}
.bar div{display:flex;align-items:center;padding:0 32px;background:#e9e9e6;font-size:24px;font-weight:600;line-height:1}
.bar div:first-child{flex:1 1 auto}
.name{font-weight:700 !important;letter-spacing:-0.03em}
.big{flex:0 0 auto;display:flex;gap:1px}
.big .t{flex:1 1 auto;background:#e9e9e6;padding:22px 32px 26px}
.big .t div{margin:0 0 0 -0.04em;font-weight:700;font-size:120px;line-height:0.9;letter-spacing:-0.04em;white-space:nowrap}
.big .tc{flex:0 0 auto;display:flex;align-items:flex-end;padding:0 32px 26px;background:#e9e9e6;font-size:24px;font-weight:500;line-height:1;font-variant-numeric:tabular-nums}
.media{flex:1 1 auto;min-height:0;display:flex;gap:1px;background:#111110}
.media img{display:block;flex:1 1 0;min-width:0;height:100%;object-fit:cover}
</style></head><body>${body}</body></html>`;

const home = (t) =>
  page(`<div class="f">
  <div class="bar"><div>${t.nav.tagline}</div><div>oskarpajka.com</div></div>
  <div style="background:#e9e9e6;padding:24px 32px 30px;overflow:hidden"><div style="margin:0 0 0 -0.04em;font-weight:700;font-size:176px;line-height:0.9;letter-spacing:-0.04em;white-space:nowrap">oskar pajka</div></div>
  <div style="position:relative;flex:1 1 auto;background:#e9e9e6">
    <img src="${url('marks/frames.svg')}" style="position:absolute;left:236px;top:-6px;height:214px">
    <img src="${url('marks/code.svg')}" style="position:absolute;left:708px;top:34px;height:188px">
  </div></div>`);

const film = (t, name, length, images) =>
  page(`<div class="f">
  <div class="bar"><div class="name">oskar pajka</div><div>${t.project.kind}</div></div>
  <div class="big"><div class="t"><div>${name}</div></div><div class="tc">${length}</div></div>
  <div class="media">${images.map((i) => `<img src="${url(i)}">`).join('')}</div></div>`);

const cards = [];
for (const [lang, t] of [['en', en], ['pl', pl]]) {
  const sfx = lang === 'pl' ? '-pl' : '';
  cards.push([`home${sfx}`, home(t)]);
  cards.push([`hoplite${sfx}`, film(t, 'Hoplite', '0:00:32:16', ['images/hoplite-poster.jpg'])]);
  cards.push([
    `bridgemind${sfx}`,
    film(t, 'BridgeMind', '0:00:30:00', [
      'images/bridgemind-shot-0-00-07-00.jpg',
      'images/bridgemind-shot-0-00-13-00.jpg',
      'images/bridgemind-shot-0-00-25-00.jpg',
    ]),
  ]);
}

const tmp = join(tmpdir(), 'oskarpajka-og.html');
const show = async (tab, html) => {
  await writeFile(tmp, html);
  await tab.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
};

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await mkdir(resolve(pub, 'og'), { recursive: true });
for (const [name, html] of cards) {
  await show(tab, html);
  await tab.screenshot({ path: resolve(pub, 'og', `${name}.png`) });
  console.log(`Saved public/og/${name}.png`);
}

// Favicons from public/favicon.svg
const svg = url('favicon.svg');
const icon = async (size) => {
  await tab.setViewportSize({ width: size, height: size });
  await show(tab, `<html><body style="margin:0"><img src="${svg}" style="display:block;width:${size}px;height:${size}px"></body></html>`);
  return tab.screenshot({ type: 'png' });
};
await writeFile(resolve(pub, 'apple-touch-icon.png'), await icon(180));
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
