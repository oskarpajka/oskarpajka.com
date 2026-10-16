# To do before and after launch

Single list of what is left. Read this first, then STATUS.md for history. Last updated: 16 October 2026. Tick items here when done and keep STATUS.md's log in step.

Nothing is pushed yet. Oskar wants one PR only when everything below under "Before launch" is finished. Do not push or open a PR before he says so.

## Before launch

- [ ] Oskar reads both privacy policies (src/content/privacy/en.md, pl.md) and the Polish copy (docs/TRANSLATIONS.md, generated: edit src/i18n/pl.json then `npm run translations`).
- [x] Privacy: Oskar is a student and does not invoice, so "private person" stays. If that changes (JDG or paid work), add business name, address and NIP and revisit the policy.
- [ ] Privacy: set `updated` and `updatedLabel` in src/content/privacy/en.md and pl.md to the real go-live day (currently 16 Oct 2026).
- [ ] Cloudflare at deploy: turn off Email Address Obfuscation and Rocket Loader, keep Bot Fight Mode and Network Error Logging off, add no extra logging, turn Always Use HTTPS on, and check the live page has no Zaraz script (docs/DEPLOY.md).
- [ ] Right after the first deploy: check that Cloudflare did not switch on Web Analytics by itself (Free plans get it automatically). If it is on, set it to Disable. Steps in docs/DEPLOY.md, section 3.
- [ ] Upload the films to R2 and connect media.oskarpajka.com (docs/DEPLOY.md, step 1). Run `npm run media` first if the files in media/web/ are stale.
- [ ] Deploy to Cloudflare Workers on oskarpajka.com (docs/DEPLOY.md).
- [ ] Test on a real iPhone and on Windows Chrome, Edge and Firefox, in English and Polish, at 16:9 and ultrawide widths.
- [ ] Commit the 16 Oct changes (full-width header and footer rules, Polish copy, privacy wording). Leave out the font deletions in public/fonts/ unless Oskar says they are intended.
- [ ] Push and open the PR only when Oskar says everything is final. Add: "Privacy text is not legal advice."

## Decisions made on 16 October

- Header and footer: the grid stays in the page column. Only the lines are full width: the line under every header, the pinned header's line, and the line above the footer. The OSKAR tag stays in the column.
- Privacy, revised later on 16 October: no Web Analytics script at all (it would need consent under PKE art. 399); visit numbers come from the zone's server-side analytics. Network Error Logging switched off. Policy corrected: the Cloudflare dashboard can show sampled requests with IP addresses for up to 31 days, not only totals.
- Earlier privacy review applied: request-data and Apple transfer wording, UODO named without a street address, objection paragraph, Polish no-break spaces added to pl.md. Full review: privacy-review/privacy-policy-review.md in the Claude project files.
- Email retention: no fixed deletion date. Mailbox reviewed about once a year, deleted sooner on request.
- Rights requests: by email, from the address used. Visit stats and server data are not linked to a person (Art. 11 GDPR), so the policy says they cannot be looked up.
- Showing "The short version" above the policy is fine (layered notice, Art. 12 GDPR). It must always match the full text.
- Oskar made the Hoplite sound himself (confirmed).

## Every deploy, and once a month after launch

- Remind Oskar to check that Cloudflare Web Analytics is still **disabled** for oskarpajka.com and that the live HTML has no `cloudflareinsights` script (docs/DEPLOY.md, section 3). Cloudflare turns it on by default for Free plans. If it is already disabled, nothing to do.

## Later, not for launch

- [ ] framecatch screen recording for the home page (1280 x 800, 10 to 20 seconds, muted loop). Until then the frame shows the logo.
- [ ] Optional 9:16 BridgeMind cut as a second video.
- [ ] Dark mode.
- [ ] Performance pass.
- [ ] Update the framecatch paragraph when recording or the corner preview ships.
