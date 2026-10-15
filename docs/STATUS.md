# Status

Last updated: 15 October 2026

## Where the project is

Built, not yet live. Every page works in English and Polish, desktop and phone, and is committed locally (not pushed). Left: put the films on R2, deploy, and Oskar's review of the Polish copy and the privacy policy. Steps in docs/DEPLOY.md.

## Done

- [x] Brand guidelines: colour, type, layout, marks (marker tags), motion, page rules
- [x] Home page: name, FRAMES and CODE hero with drips into the grid, intro row, three work blocks, About, contact footer with the OSKAR tag
- [x] Hoplite project page: player, spec, Breakdown stills that jump the player, How it was made with the real app and the rebuild
- [x] BridgeMind project page: square player, spec, three Breakdown stills taken from the master (0:00:07:00, 0:00:13:00, 0:00:25:00), How it was made
- [x] Privacy page (text in src/content/privacy/en.md and pl.md)
- [x] 404 page with the LOST tag
- [x] Header after scrolling, full-screen player, large image view
- [x] Link previews (1200 x 630) for home, Hoplite and BridgeMind
- [x] Favicon
- [x] Phone versions of every page, matched to the desktop design
- [x] Stack chosen (see STACK.md)
- [x] Polish version designed (boards ending in PL), language cell in the header, translations in docs/TRANSLATIONS.md

## Next

- [x] Social links added to the footer (GitHub, LinkedIn, X, Instagram)
- [x] framecatch copy checked against the code (region capture, Desktop save; recording not built yet). Launch with the logo; recording later
- [x] Privacy policy written by the agent (English)
- [x] Privacy policy rewritten from the final stack, English and Polish, in src/content/privacy/ and on the Privacy page
- [ ] Oskar reads both policies (and decides the two-year email rule)
- [x] Make the CV with docs/CV-PROMPT.md (update guide: docs/CV.md)
- [x] Web versions of both films encoded (npm run media, into media/web/)
- [ ] Upload the films to R2 and connect media.oskarpajka.com (DEPLOY.md, step 1)
- [x] Site built in Astro from the canvas, both languages, link previews, favicon, sitemap
- [x] Polish copy made more natural (docs/TRANSLATIONS.md is now generated from src/i18n)
- [ ] Oskar reviews the Polish copy
- [x] Local git repository with the first commit (not pushed)
- [x] Email: oskar@oskarpajka.com set up on iCloud+
- [x] Email: DMARC added and tested (SPF, DKIM, DMARC pass), policy p=quarantine
- [ ] Deploy to Cloudflare Workers on oskarpajka.com
- [ ] Turn on Cloudflare Web Analytics
- [ ] Test on a real iPhone and on Windows Chrome, Edge and Firefox
- [ ] Later: dark mode, performance pass

## Log

- 2026-10-10: Brand guidelines started in Claude Design. Home page drafted with a fluted-glass gradient hero.
- 2026-10-11: Footer OSKAR tag, player, About comparison, phone layouts, 404, link previews, favicon. Stack chosen: Astro, Cloudflare Workers, R2, Web Analytics.
- 2026-10-12: Gradient hero retired for the marker system: hero tags with drips into the grid, small marks, LOST 404.
- 2026-10-13: Work list replaced by three work blocks (Hoplite, BridgeMind, framecatch). FRAMES and CODE as the hero pair. Timecode chip as the shared element. Previews made smaller. Footer tag fixed so marks can never stay hidden. Arrow on the comparison removed. BridgeMind project page, Privacy page and BridgeMind link preview added. Phone ledes reduced. Project docs created.
- 2026-10-13: Footer links filled in. framecatch frame shows the logo. iCloud+ chosen for email, setup guide written. CV prompt written.
- 2026-10-13: Email set up as oskar@oskarpajka.com on iCloud+. Site, docs and prompts switched from hello@ to oskar@.
- 2026-10-13: CV built from data: src/data/cv.json, page /cv/, `npm run cv` saves public/cv/Oskar-Pajka-CV.pdf (one A4 page, fails if it overflows). Minimal Astro project set up for it, with Archivo in public/fonts/. Guide in docs/CV.md.
- 2026-10-13: Polish version designed for every page (desktop and phone), language cell PL/EN added to both headers, phone headers tightened. Translation table in docs/TRANSLATIONS.md. Privacy policy text written (English).
- 2026-10-15: Status review. DMARC confirmed done (p=quarantine). Local folder is not yet a git repo; GitHub repo still empty. English privacy policy text exists but is not saved in the repo yet.
- 2026-10-15: Site built in Astro from the canvas (all pages, EN and PL, desktop and phone, pinned header, loops, player, Breakdown jumps, comparison, image view, copy email, marks). Films and stills encoded from the masters. Privacy policy written in English and Polish. Polish copy reworked. Link previews per language, favicon.ico and apple touch icon, sitemap, robots, security and cache headers, wrangler.jsonc. Deploy guide in DEPLOY.md. framecatch copy corrected to what the app does today. Committed locally, not pushed.
