# Stack

Everything runs on Cloudflare, where the domain is registered. The site is fully static: no server code, no database, no accounts, no forms, no cookies.

## Overview

| Part | Choice | Why |
| --- | --- | --- |
| Framework | Astro, static output | Ships plain HTML and CSS, adds JavaScript only where a page needs it (player, comparison, copy email, reveals). Fast to load, good for search engines. |
| Hosting | Cloudflare Workers with static assets | Cloudflare's current recommended way to host a static site. Free tier is enough. No adapter needed for a static Astro site. |
| Films and loops | Cloudflare R2 bucket on a custom domain, `media.oskarpajka.com` | Video files are too large for the repo and the Workers asset limit. R2 has no fee for traffic out. |
| Visit statistics | Cloudflare Web Analytics | No cookies, no cross-site tracking, so no cookie banner. |
| Fonts | Self-hosted woff2 files (Archivo Expanded and Archivo) | No request to Google on page load. SIL Open Font License (public/fonts/Archivo-OFL.txt). |
| Email | iCloud+ Custom Email Domain | Send and receive as oskar@oskarpajka.com in Apple Mail and on the web. |
| Code | GitHub, `oskarpajka/oskarpajka.com` | Already created. |

## Email for oskar@oskarpajka.com

The goal is to receive and reply as oskar@oskarpajka.com.

- **Cloudflare Email Routing** is free but only forwards incoming mail. Cloudflare's new Email Sending (public beta since April 2026) is for sending from code on the paid Workers plan, not a mailbox you reply from.
- **iCloud+ Custom Email Domain** (recommended if Oskar already pays for iCloud+): adds oskar@oskarpajka.com to iCloud Mail on iPhone, iPad and iCloud.com, sending and receiving. Setup: iCloud Settings, Custom Email Domain, "use a domain you own", then add the MX, SPF, DKIM and verification TXT records Apple shows into Cloudflare DNS.
- **If no iCloud+:** Zoho Mail's free plan, or Cloudflare Email Routing to Gmail plus a sending service for "Send mail as". Both work; both are more fiddly.
- Use only one of them. iCloud and Email Routing both need the domain's MX records.
- Add a DMARC record (`_dmarc`, start with `p=none`) after the provider's records are in.

Decided: iCloud+. Step by step in EMAIL-SETUP.md.

## Routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/work/hoplite/` | Hoplite project page |
| `/work/bridgemind/` | BridgeMind project page |
| `/privacy/` | Privacy policy |
| `/pl/`, `/pl/work/hoplite/`, `/pl/work/bridgemind/`, `/pl/privacy/` | Polish versions |
| `/404.html` | Page not found (Workers serves it with `not_found_handling = "404-page"`) |
| `/cv/Oskar-Pajka-CV.pdf` | CV |

framecatch has no page. Its block links to https://github.com/Common-Branch/framecatch.

## Media

Masters live in `media/masters/` and never go into git (already in `.gitignore`).

| File | Source master | Notes |
| --- | --- | --- |
| `hoplite-1080.mp4` | `OskarPajka-Hoplite.sh-Master-3840x2160@24.mp4` | Player film, with sound. H.264, 1920 x 1080, 24 fps, AAC, `+faststart`. |
| `hoplite-loop-720.mp4` | same | Home loop. No audio track, 1280 x 720. |
| `bridgemind-1080.mp4` | `OskarPajka-BridgeMind.ai-Master-2160x2160@24.mp4` | Player film, 1080 x 1080. |
| `bridgemind-loop-720.mp4` | same | Home loop, 720 x 720, no audio. |
| `*-poster.jpg`, `*-shot-h-mm-ss-ff.jpg` | frames from the masters | Posters and Breakdown stills, named by AE timecode. |

Example encodes (run from the project folder):

```
ffmpeg -i media/masters/OskarPajka-Hoplite.sh-Master-3840x2160@24.mp4 -vf scale=1920:-2 -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart hoplite-1080.mp4
ffmpeg -i media/masters/OskarPajka-Hoplite.sh-Master-3840x2160@24.mp4 -vf scale=1280:-2 -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -an -movflags +faststart hoplite-loop-720.mp4
```

Upload to the R2 bucket, then serve at `https://media.oskarpajka.com/<file>`. Performance tuning (AV1, smaller loops) is for later.

## Project layout

```
oskarpajka.com/
  astro.config.mjs      site address, static output, en and pl
  wrangler.jsonc        Workers static assets, custom domain, logs off
  .env.example          optional local settings (film address, analytics token)
  public/
    fonts/site/         Archivo Expanded and Archivo, subset (Latin and Polish)
    fonts/cv/           the CV's fonts
    marks/              FRAMES, CODE, OSKAR (wide and tall), LOST, circle, check (SVG)
    images/             posters, Breakdown stills, the real Hoplite app and the rebuild, framecatch logo
    og/                 link previews, English and Polish (npm run og)
    cv/                 Oskar-Pajka-CV.pdf (npm run cv)
    favicon.svg, favicon.ico, apple-touch-icon.png, robots.txt, _headers
  src/
    i18n/en.json, pl.json   all copy
    content/privacy/        the privacy policy, en.md and pl.md
    data/films.ts           film files, sizes, Breakdown frames
    lib/site.ts             routes, media address, timecode
    layouts/Base.astro      head tags, fonts, pinned header, page script
    components/             HomePage, ProjectPage, PrivacyPage, NotFoundPage, CompactHeader,
                            PinnedHeader, Hero, Player, Footer, SmallFooter
    pages/                  thin files that pick a page and a language (pl/ for Polish)
    scripts/site.ts         everything interactive
    styles/global.css       tokens and every style
  scripts/                  encode-media.sh, build-og.mjs, build-cv.mjs, translations.mjs, post-build.mjs
  media/masters/            local only, ignored by git
  media/web/                web encodes for R2, ignored by git
  docs/
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local site at http://localhost:4321 |
| `npm run build` | Builds `dist/` |
| `npm run deploy` | Builds and deploys to Cloudflare (docs/DEPLOY.md) |
| `npm run media` | Encodes the web films and the stills from `media/masters/` |
| `npm run og` | Link previews and favicons |
| `npm run cv` | The CV PDF |
| `npm run translations` | Regenerates docs/TRANSLATIONS.md |

## Deploy

Full steps, including R2 and the dashboard settings: docs/DEPLOY.md. In short:

1. `npm run build` (output in `dist/`).
2. `wrangler.jsonc` at the root:

```jsonc
{
  "name": "oskarpajka-com",
  "compatibility_date": "2026-10-13",
  "assets": { "directory": "./dist", "not_found_handling": "404-page" }
}
```

3. `npx wrangler@latest deploy`, then attach the custom domains `oskarpajka.com` and `www.oskarpajka.com` (redirect www to the bare domain) in the Workers dashboard.
4. Later: connect the GitHub repo in Cloudflare so every push to `main` deploys.

## Languages (decided)

- English is the main site at `/`. Polish lives at `/pl/` (`/pl/work/hoplite/`, `/pl/work/bridgemind/`, `/pl/privacy/`), using Astro's built-in i18n routing (`i18n: { locales: ['en', 'pl'], defaultLocale: 'en', routing: { prefixDefaultLocale: false } }`).
- All copy lives in one file per language (`src/i18n/en.json`, `src/i18n/pl.json`), filled from docs/TRANSLATIONS.md. Pages are written once and read their strings from there.
- No automatic redirect by browser language or location: Google advises against it, it breaks shared links, and on a static site it needs extra code. Instead the header has a language cell ("PL" on English pages, "EN" on Polish ones) that links to the same page in the other language, and every page carries `hreflang` alternate links so search engines show Polish searchers the Polish pages.
- The language choice is not remembered (no cookie, no storage), which keeps the privacy policy unchanged.
- The CV stays English; for Polish applications switch on the RODO clause (docs/CV.md).
- The privacy policy needs a Polish version at `/pl/privacy/`.

## Not used, on purpose

No cookies or localStorage for tracking, no Google Fonts, no YouTube or Vimeo embeds, no contact form, no CMS, no newsletter, no ads, no third-party scripts except the Cloudflare Web Analytics beacon.
