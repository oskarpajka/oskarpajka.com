# Prompt for the CV

Give the prompt below to a coding agent that can work in this repository (for example Claude Code opened in this folder). It builds a CV that lives as data in the repo, so adding a project later means editing one file and running one command.

Decisions already made (do not reopen them in the prompt):

- No graffiti or marker tags on the CV. It is a professional document: recruiters skim it in seconds, applicant tracking systems read it as plain text, and it gets printed in black and white. The link to the brand is the typeface and the lowercase name, nothing more.
- No orange. On paper it reads as decoration, and the guidelines say orange is only for the one thing you can act on, which a PDF does not have.
- No photo, no date of birth, no home address, no marital status.

````
Build a one-page CV for Oskar Pajka inside this Astro repository (oskarpajka.com). Read docs/README.md, docs/STACK.md and docs/DECISIONS.md first.

GOAL
The CV must be easy to update. All content lives in one data file. A single command regenerates the PDF. Oskar should never touch layout code to add a project.

WHAT TO BUILD
1. `src/data/cv.json` holding all content (structure below). Validate it with a small schema (zod is fine) so a typo fails loudly.
2. `src/pages/cv.astro`: renders the data as an A4 print page. Not linked from the site navigation; it exists only to print. Add `<meta name="robots" content="noindex">`.
3. `scripts/build-cv.mjs` plus an npm script `npm run cv`: builds the site, opens /cv/ in Playwright Chromium, and saves `public/cv/Oskar-Pajka-CV.pdf` with `page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })`. Set the PDF title to "Oskar Pajka, CV" and the author to "Oskar Pajka".
4. `docs/CV.md`: a short guide: how to add a project, how to regenerate, how to switch the Polish clause on or off.

DATA STRUCTURE (cv.json)
- name, role line, location, email, website, linkedin, github
- profile: 2 to 3 sentences
- work: list of { title, type, year, tools, oneLine, link }, newest first; Oskar picks which ones appear with a `show` flag
- experience: list of { role, organisation, from, to, oneLine } (may be empty)
- education: list of { school, programme, from, to } (may be empty)
- skills: { motion: [...], code: [...] }
- languages: list of { language, level }
- gdprClause: { show: boolean, text } (see below)
- updated: date shown nowhere, used for the PDF file metadata

KNOWN CONTENT (use it, do not invent anything else)
- Name: Oskar Pajka. Location: Kielce, Poland (CET), works remotely.
- Email: oskar@oskarpajka.com. Website: oskarpajka.com. LinkedIn: linkedin.com/in/oskarpajka. GitHub: github.com/oskarpajka.
- Role line: "Motion designer and developer".
- Work:
  - Hoplite, concept film, independent, 2026, After Effects. A 32 second launch film for Hoplite; rebuilt the interface and animated every shot, sound included. Link: oskarpajka.com/work/hoplite
  - BridgeMind, concept film, independent, 2026, After Effects. A 30 second square film for BridgeMind's BridgeSpace and BridgeVoice. Link: oskarpajka.com/work/bridgemind
  - framecatch, screenshot and recording tool for Windows, in progress, built with Patryk (github.com/Explosivera). Electron, React, TypeScript. Link: github.com/Common-Branch/framecatch
- Skills, motion and design: After Effects, Illustrator, Photoshop, Figma. Code: TypeScript, JavaScript, React, HTML, CSS, Python, Swift, MySQL.
- Languages: Polish (native), English (ask Oskar for the level to state).
Before writing the data file, ask Oskar in ONE message for everything missing: profile wording he likes, experience (internships, freelance, paid work), education (whether to include it and how), English level, which projects to show, anything else he wants on it. Never make up employers, dates, grades or results.

LAYOUT RULES
- A4 portrait, one page. Use `@page { size: A4; margin: 18mm 18mm 16mm; }`. Nothing closer than 15 mm to the edge.
- Typeface: the site's self-hosted Archivo. Name in the wide cut (font-stretch 125%), lowercase "oskar pajka", weight 700, about 26 pt. Headings and labels in the wide cut, 9 to 10 pt, weight 600. Body text in the normal width (font-stretch 100%) at 10 pt, line height 1.35, so it stays readable and fits.
- Colour: black (#111110) on white only. Secondary text in #55554F. No orange, no tags, no marks, no icons, no photo.
- Structure: the header (name, role line, then one line of contact links), then sections as rows: a narrow label column (about 38 mm) with the section name, and the content beside it. Thin 0.5 pt rules between sections, echoing the site's lines. Section order: Profile, Selected work, Experience (only if not empty), Skills, Education (only if not empty), Languages.
- Every item is real text in reading order (label, then content), so applicant tracking systems parse it. No text in images, no layout tables, no multi-column text flow.
- Links are clickable in the PDF and printed in full (oskarpajka.com/work/hoplite), because people print CVs.
- Dates as "Oct 2026" or "2026", the same style everywhere. Timecodes are not used on the CV.
- If content overflows one page, the build script must fail with a clear message instead of making a second page.
- Never use em dashes or en dashes. Write ranges as "2025 to 2026".

POLISH CLAUSE
Polish employers often still expect a data processing clause at the bottom of a CV. Add it as small 7 pt text at the foot of the page, shown only when `gdprClause.show` is true. Default text (Polish applications): "Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO)." Default `show: false` for the English CV.

DONE MEANS
- `npm run cv` produces public/cv/Oskar-Pajka-CV.pdf, one A4 page, text selectable, links clickable, fonts embedded.
- Adding a fourth project to cv.json and running `npm run cv` works with no other change (test this, then remove the test entry).
- docs/STATUS.md gets a dated log line.
````
