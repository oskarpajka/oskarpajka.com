// npm run cv: builds the site, prints /cv/ (English) and /pl/cv/ (Polish) with Chromium and
// saves them to public/cv/. Fails instead of writing a second page.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build, preview } from 'astro';
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { parseCv } from '../src/data/cv.schema.mjs';

const root = new URL('../', import.meta.url);
const versions = [
  { data: 'src/data/cv.json', page: '/cv/', out: 'public/cv/Oskar-Pajka-CV.pdf', lang: 'en' },
  { data: 'src/data/cv.pl.json', page: '/pl/cv/', out: 'public/cv/Oskar-Pajka-CV-PL.pdf', lang: 'pl' },
];

function fail(message) {
  console.error(`\nCV not built: ${message}\n`);
  process.exit(1);
}

// Validate first so a typo shows a short message, not an Astro stack trace.
for (const version of versions) {
  try {
    version.cv = parseCv(JSON.parse(await readFile(new URL(version.data, root), 'utf8')));
  } catch (error) {
    fail(`${version.data}: ${error.message}`);
  }
}

await build({ root: fileURLToPath(root), logLevel: 'warn' });
const server = await preview({ root: fileURLToPath(root), logLevel: 'warn', server: { port: 4329 } });
const browser = await chromium.launch();

try {
  for (const { cv, page: pagePath, out, lang } of versions) {
    const outFile = new URL(out, root);
    const page = await browser.newPage();
    await page.emulateMedia({ media: 'print' });
    await page.goto(`http://localhost:4329${pagePath}`, { waitUntil: 'networkidle' });
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
        `the ${lang} CV runs onto ${doc.getPageCount()} pages` +
          (over > 0 ? `, about ${over.toFixed(1)} mm too long` : '') +
          `.\nShorten a bullet point or the summary in ${lang === 'pl' ? 'cv.pl.json' : 'cv.json'}, or set "show": false on a project, then run npm run cv again.`,
      );
    }

    const updated = new Date(`${cv.updated}T12:00:00Z`);
    doc.setTitle(`${cv.name}, CV`);
    doc.setAuthor(cv.name);
    doc.setSubject(`${cv.name}, ${cv.headline}`);
    doc.setLanguage(lang);
    doc.setCreator('oskarpajka.com, npm run cv');
    doc.setProducer('Chromium and pdf-lib');
    doc.setCreationDate(updated);
    doc.setModificationDate(updated);

    await mkdir(new URL('./', outFile), { recursive: true });
    await writeFile(outFile, await doc.save());
    console.log(`Saved ${fileURLToPath(outFile)} (1 page, A4).`);
    await page.close();
  }
} finally {
  await browser.close();
  await server.stop();
}
