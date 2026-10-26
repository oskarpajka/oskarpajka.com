# Decisions

Newest first. Each line says what was decided and why.

## Design

- 2026-10-26: Link previews have a still and a short MP4 per page and language (public/og/, og:video). Apps that play og:video show the tags writing on (home) or the film playing; all others show the still, which is a frame of the same video. Videos live in public/, not R2: they are small (under 600 KB) and ship with the site.
- 2026-10-26: Favicon is a light circle with a black ring and "OP" in Geist Bold (outlines in public/favicon.svg). Replaces the brush O on the orange square. Readable at 16 px in light and dark tab bars.
- 2026-10-15: Hover effects only on devices with a real pointer, so a tap on a phone does not leave a cell stuck in its hover colour.
- 2026-10-15: The pinned header appears on every page once the page's own header (on home, the whole landing section) has scrolled under it.
- 2026-10-15: On phones the Next project still takes the full width, instead of a 240px still beside a black strip.
- 2026-10-15: The player starts at 0:00:00:00 with the canvas frame as its poster. BridgeMind has no sound track, so its player has no Mute button.
- 2026-10-15: From now on the code is the source of truth for copy. The canvas Polish boards still hold the older Polish text; they are a layout reference only.

- 2026-10-13: Polish version at /pl/. Header gets a fourth nav cell for the language (PL or EN). The nav now takes 4 of 12 columns; its dividers still sit on the grid and the hero drips still land on them. On phones the home nav is four equal cells and the drips sit on the quarter lines. No automatic language redirect.

- 2026-10-13: Until a framecatch recording exists, its selection frame shows the framecatch logo on a light surface, not a placeholder.
- 2026-10-13: The CV has no graffiti, no orange, no photo. Typeface and lowercase name are the only brand link. It is built from a data file so it is easy to update (docs/CV-PROMPT.md).

- 2026-10-13: No hover effects on the work blocks. Only links and films react. Reason: the underline mark on hover felt like decoration.
- 2026-10-13: The comparison arrow is removed on every screen size. Reason: Oskar removed it on desktop and asked for it gone on mobile.
- 2026-10-13: Work blocks: Hoplite largest (film across 8 of 12 columns), BridgeMind square on the left (5 of 12, text 7 of 12), framecatch mirrored (text 7 of 12, recording 5 of 12). No empty grid columns. Reason: previews were too big, and empty columns looked like they were waiting for graffiti.
- 2026-10-13: The film length lives in one timecode chip, top right of every film, position over length. Reason: one repeated detail ties three different layouts into one system.
- 2026-10-13: framecatch gets a dashed selection rectangle with orange corner handles and a size label. It is the only UI-style drawing on the site, allowed because it shows what the product does. Its link is "GitHub" and it credits Patryk (github.com/Explosivera).
- 2026-10-13: Hero is the pair FRAMES and CODE, the two halves of "Motion design and software". The random tag per visit is dropped. RENDER and MOTION stay as spare tags. No tag may cover the name.
- 2026-10-13: Marks are visible by default and only replay their wipe when they come into view. Reason: a missed "in view" signal hid the footer tag.
- 2026-10-12: The gradient hero and shader are retired. The marker is the only art style: orange, never carries information, at most one per screen except the footer tag.
- 2026-10-12: 404 page uses the LOST tag and has no contact footer.
- 2026-10-11: The favicon is Oskar's icon on the orange square (replaced 2026-10-26).
- 2026-10-10: No logo. The typed name "oskar pajka" is the mark. No portraits needed.

## Content

- 2026-10-15: framecatch copy says what the app does today (region and full-screen capture to the Desktop); "Built with" shows just "Patryk".
- 2026-10-15: Polish copy: one-letter words are tied to the next word with a no-break space, as in Polish typesetting.

- 2026-10-13: No quote from BridgeMind's founder on the site. He reacted positively on a Discord call, but the exact words are not remembered, and a paraphrase in quotation marks would not be honest.
- 2026-10-13: BridgeMind copy says six agents: a lead agent coordinating five more.

- 2026-10-13: BridgeMind is labelled "Not commissioned by or affiliated with BridgeMind" and the copy says the interface is shown as it was in August 2026, because BridgeMind One replaced that UI.
- 2026-10-11: Third-party screenshots are labelled with the product and month, for example "Hoplite, October 2026".
- 2026-10-10: The student status is left out. About is aimed equally at freelance film work and internships or jobs.

## Tech

- 2026-10-16: Privacy policy review applied. Keeping emails longer now rests on the law (6(1)(c)) or legal claims (6(1)(f)), not "a contract"; the invoice example is gone. The short version says "no tracking cookies", because Cloudflare may set cf_clearance. Cookies have their own heading. English kept near 1,100 words, Polish mirrors it.
- 2026-10-16: Cloudflare enables Web Analytics automatically on Free plans (EU excluded). It must stay Disabled; checked after every deploy (DEPLOY.md, section 3).
- 2026-10-16: No Cloudflare Web Analytics script. Under Polish law (PKE art. 399, read with EDPB Guidelines 2/2023) a script that makes the browser send data needs consent, and the zone's server-side analytics already show visits per page and country. Network Error Logging switched off in the zone for the same reason.
- 2026-10-15: Copy lives in src/i18n/en.json and pl.json; docs/TRANSLATIONS.md is generated from them. The privacy policy is Markdown in src/content/privacy/.
- 2026-10-15: Fonts are subset to Latin and Polish letters (about 36 KB each). The canvas's Archivo Expanded is the main face; Archivo at normal width only for the privacy text.
- 2026-10-15: If the copy button cannot reach the clipboard, it opens the mail app instead.
- 2026-10-15: Workers logs are off (wrangler.jsonc), matching the privacy policy.

- 2026-10-13: Fonts are self-hosted (Archivo, Martian Mono, both SIL Open Font License), not loaded from Google Fonts. Reason: no third-party request on page load, which keeps the privacy policy simple.
- 2026-10-13: Email address is oskar@oskarpajka.com (not hello@), on iCloud+ Custom Email Domain. Used on the site, in the footer copy button, the privacy policy and the CV.
- 2026-10-11: Astro (static output), Cloudflare Workers static assets, films on Cloudflare R2, Cloudflare Web Analytics. Master renders stay local and out of git.
