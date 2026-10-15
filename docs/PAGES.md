# Pages

Every page is drawn on the canvas at 1440 (desktop) and 390 (phone). Board names are in brackets. Each page also has a Polish board with the same name plus PL (MainPL, HomePhonePL, HoplitePL and so on), at the same route under `/pl/`.

Header on every page: the nav ends with a language cell, "PL" on English pages and "EN" on Polish ones, linking to the same page in the other language.

## Home `/` (Main, HomePhone)

1. Header: "Motion design and software", Work, About, Contact. After scrolling it turns into the compact header with the name (HeaderPinned, HeaderPinnedPhone).
2. The name "oskar pajka" across the full width.
3. Hero band: FRAMES and CODE. FRAMES's drip becomes the 7/12 column line, CODE's drip the 9/12 line. Under 1.5 seconds, plays once.
4. Intro row: "I make launch films and product animation for software, and I build software myself." Based in Kielce, Poland. Open to freelance work and internships. Button "Watch the Hoplite film".
5. Selected work, three blocks:
   - Hoplite: film 8 of 12 columns, facts line "Concept film, independent / After Effects / 2026", short paragraph, comparison "Hoplite, October 2026" vs "My rebuild", View project.
   - BridgeMind: square film 5 of 12, rows Type, Tool, Cuts, Year, paragraph, View project. Text column sticky on desktop.
   - framecatch: rows Type, Stack, Built with (Patryk, linked), Status, paragraph, GitHub link; the logo in the selection rectangle (1280 x 800) until a recording exists.
   - Films loop muted while half on screen. Timecode chip top right counts while playing.
6. About: statement, independent concept pieces line, facts row (Motion and design, Code, Languages, Location).
7. Footer: Contact, email (hover circle, click copies, check and "Copied"), GitHub, LinkedIn, X, Instagram, CV (PDF), copyright, Privacy, Back to top, OSKAR tag.

## Hoplite `/work/hoplite/` (Hoplite, HoplitePhone)

Title, independence line, player (16:9) with Play, scrubber, timecode, Mute, Full screen; lede and spec (Length 0:00:32:16, 3840 x 2160, 24 fps, effects only, After Effects, 2026); Breakdown stills at 0:00:04:14, 0:00:12:06, 0:00:28:00 that jump the player; How it was made with the real app (October 2026) and the rebuild at 0:00:23:14, both open in the large image view (ImageView); Next project BridgeMind; footer. Full-screen player: PlayerFullScreen.

## BridgeMind `/work/bridgemind/` (BridgeMind, BridgeMindPhone)

Title, independence line, square player (7 of 12) beside the lede and spec (Length 0:00:30:00, 2160 x 2160, 24 fps, Cuts 1:1 and 9:16, After Effects, 2026); Breakdown stills at 0:00:07:00 (The voice), 0:00:13:00 (The request), 0:00:25:00 (The line); How it was made; Next project Hoplite; footer. Poster frame 0:00:25:12.

## Privacy `/privacy/` (Privacy, PrivacyPhone)

Title, side column (Last updated, Applies to, Contact, The short version in three lines), body sections: Who is responsible, What this site collects, Visit statistics, Hosting and video, Email, Links to other sites, Your rights, Changes to this policy. Long text uses Archivo at normal width. Text comes from PRIVACY-POLICY-PROMPT.md.

## 404 (NotFound)

Compact header, LOST tag, "This page does not exist.", Back to home, copyright and Privacy. No contact footer.

## Link previews (PreviewHome, PreviewHoplite, PreviewBridgeMind)

1200 x 630 PNGs exported from the boards, used as `og:image` and `twitter:image`.

## Favicon (Favicon)

The icon on the orange square. Export SVG, a 32 px ICO and a 180 px Apple touch icon.
