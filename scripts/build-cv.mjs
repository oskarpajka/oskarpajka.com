// npm run cv: builds the site, prints /cv/ with Chromium and saves public/cv/Oskar-Pajka-CV.pdf.
// Fails instead of writing a second page.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build, preview } from 'astro';
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { parseCv } from '../src/data/cv.schema.mjs';

const root = new URL('../', import.meta.url);
const outFile = new URL('public/cv/Oskar-Pajka-CV.pdf', root);

function fail(message) {
  console.error(`\nCV not built: ${message}\n`);
  process.exit(1);
}

// Validate first so a typo shows a short message, not an Astro stack trace.
let cv;
try {
  cv = parseCv(JSON.parse(await readFile(new URL('src/data/cv.json', root), 'utf8')));
} catch (error) {
  fail(error.message);
}

await build({ root: fileURLToPath(root), logLevel: 'warn' });
const server = await preview({ root: fileURLToPath(root), logLevel: 'warn', server: { port: 4329 } });
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  await page.emulateMedia({ media: 'print' });
  await page.goto('http://localhost:4329/cv/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const fontsOk = await page.evaluate(() => document.fonts.check("10pt 'Source Sans 3'"));
  if (!fontsOk) fail('Source Sans 3 did not load. Check public/fonts/cv/.');

  const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
  const doc = await PDFDocument.load(pdf);

  if (doc.getPageCount() > 1) {
    // Measure how far past the printable height the content goes, at print width.
    await page.setViewportSize({ width: Math.round((174 / 25.4) * 96), height: 1200 });
    const over = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.height = 'var(--content-height)';
      document.body.append(probe);
      const limit = probe.getBoundingClientRect().height;
      probe.remove();
      const used = document.querySelector('.page').scrollHeight;
      return ((used - limit) * 25.4) / 96;
    });
    fail(
      `the content runs onto ${doc.getPageCount()} pages` +
        (over > 0 ? `, about ${over.toFixed(1)} mm too long` : '') +
        '.\nShorten a bullet point or the summary, or set "show": false on a project, then run npm run cv again.',
    );
  }

  const updated = new Date(`${cv.updated}T12:00:00Z`);
  doc.setTitle(`${cv.name}, CV`);
  doc.setAuthor(cv.name);
  doc.setSubject(`${cv.name}, ${cv.role}`);
  doc.setCreator('oskarpajka.com, npm run cv');
  doc.setProducer('Chromium and pdf-lib');
  doc.setCreationDate(updated);
  doc.setModificationDate(updated);

  await mkdir(new URL('./', outFile), { recursive: true });
  await writeFile(outFile, await doc.save());
  console.log(`Saved ${fileURLToPath(outFile)} (1 page, A4).`);
} finally {
  await browser.close();
  await server.stop();
}
