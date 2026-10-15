# CV

The CV is one A4 page, built from data. All content is in `src/data/cv.json`. You never need to touch the layout to change what it says.

| File | What it is |
| --- | --- |
| `src/data/cv.json` | Everything on the CV. The only file you normally edit. |
| `src/data/cv.schema.mjs` | The rules for cv.json. A typo or a missing field stops the build with a message. |
| `src/pages/cv.astro` | The layout, at `/cv/`. Not linked from the site, `noindex`. |
| `scripts/build-cv.mjs` | `npm run cv`: builds the site, prints `/cv/` and saves the PDF. |
| `public/cv/Oskar-Pajka-CV.pdf` | The result, served at `oskarpajka.com/cv/Oskar-Pajka-CV.pdf`. |

## Regenerate the PDF

```
npm run cv
```

It saves `public/cv/Oskar-Pajka-CV.pdf` and prints `Saved ... (1 page, A4)`. If the content no longer fits on one page, it stops, says roughly how many millimetres too long it is, and leaves the old PDF in place. Shorten a line, or hide a project (below), and run it again.

The first time on a new computer: `npm install`, then `npx playwright install chromium`.

Run `npm run cv` before you deploy, so the site ships the new PDF.

## Add a project

Copy an entry in `work` and put it at the top (newest first):

```json
{
  "show": true,
  "title": "Project name",
  "type": "Concept film, independent",
  "year": "2026",
  "tools": ["After Effects"],
  "oneLine": "One or two sentences on what it is and what you did.",
  "link": "oskarpajka.com/work/project-name"
}
```

- `link` is written without `https://`. It is printed exactly like that and is clickable in the PDF.
- `year` is `"2026"` or `"2025 to 2026"`.
- To keep a project in the file but off the CV, set `"show": false`.

Experience, education and awards work the same way: add an entry to the list. A section with an empty list is not shown. Dates are `"2026"` or `"Oct 2026"`, and an end date can be `"present"` or `"2029 (expected)"`.

## Polish clause (RODO)

For a Polish application, set `"show": true` in `gdprClause` and run `npm run cv`. The clause appears in small print at the foot of the page. Set it back to `false` for English applications.

Tip: save a copy of the Polish PDF under another name (for example `Oskar-Pajka-CV-PL.pdf`) before switching back, since the build overwrites the file.

## Rules the build checks

- No em dashes or en dashes anywhere in cv.json. Write ranges as "2025 to 2026".
- No unknown keys, no empty fields, valid email, valid `updated` date (`YYYY-MM-DD`). `updated` is not printed; it becomes the PDF's date.
- One page only.

## Fonts

The CV uses static cuts of Archivo in `public/fonts/cv/`, so the PDF embeds real fonts. They only need remaking if a weight or width in `cv.astro` changes: `pip install fonttools brotli`, then `python scripts/make-cv-fonts.py`.
