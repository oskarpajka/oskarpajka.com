# Deploy

How the site goes live on Cloudflare. Steps 1 to 3 happen once; after that a deploy is one command.

Run every command from the project folder. The first time on this computer: `npm install`, then `npx playwright install chromium` (only needed for `npm run cv` and `npm run og`).

## 1. Films on R2 (media.oskarpajka.com)

The web versions of the films are in `media/web/` (made by `npm run media` from the masters, never committed):

| File | Used for |
| --- | --- |
| `hoplite-1080.mp4` | Hoplite player, with sound |
| `hoplite-loop-720.mp4` | Home page loop, no sound |
| `bridgemind-1080.mp4` | BridgeMind player |
| `bridgemind-loop-720.mp4` | Home page loop |

1. Sign in once: `npx wrangler login` (opens the browser).
2. Make the bucket: `npx wrangler r2 bucket create oskarpajka-media`
3. Upload the four files, one command each:

```
npx wrangler r2 object put oskarpajka-media/hoplite-1080.mp4 --file media/web/hoplite-1080.mp4 --content-type video/mp4 --cache-control "public, max-age=31536000" --remote
npx wrangler r2 object put oskarpajka-media/hoplite-loop-720.mp4 --file media/web/hoplite-loop-720.mp4 --content-type video/mp4 --cache-control "public, max-age=31536000" --remote
npx wrangler r2 object put oskarpajka-media/bridgemind-1080.mp4 --file media/web/bridgemind-1080.mp4 --content-type video/mp4 --cache-control "public, max-age=31536000" --remote
npx wrangler r2 object put oskarpajka-media/bridgemind-loop-720.mp4 --file media/web/bridgemind-loop-720.mp4 --content-type video/mp4 --cache-control "public, max-age=31536000" --remote
```

4. In the Cloudflare dashboard: R2, `oskarpajka-media`, Settings, Custom Domains, Connect Domain, `media.oskarpajka.com`. Leave the `r2.dev` address off.
5. Check: `https://media.oskarpajka.com/hoplite-loop-720.mp4` plays in the browser.

If a film changes later, upload it under a new name (for example `hoplite-1080-v2.mp4`) and change the name in `src/data/films.ts`, because browsers and Cloudflare keep the old file for a year.

## 2. The site on Workers (oskarpajka.com)

1. `npm run deploy` builds the site and uploads `dist/` with the settings in `wrangler.jsonc`. The first deploy also connects `oskarpajka.com` to the Worker.
2. www: in the dashboard, DNS, add a record `AAAA`, name `www`, content `100::`, Proxied. Then Rules, Redirect Rules, create from the template "Redirect from WWW to root". Check that `https://www.oskarpajka.com/work/hoplite/` lands on `https://oskarpajka.com/work/hoplite/`.

## 3. Settings to check once

- **Web Analytics: must be off, and Cloudflare can turn it on by itself.** On Free plans Cloudflare enables Web Analytics (RUM) automatically, with EU visitors excluded ([docs](https://developers.cloudflare.com/speed/observatory/rum-beacon/)). Its script would make the privacy policy false ("runs no tracking or analytics script") and would need consent under Polish law (PKE art. 399). Visits per page and per country are already in the zone's Analytics tab, counted on Cloudflare's side with no script. Check after the first deploy and after every deploy:
  1. Dashboard, Web Analytics (account level). If `oskarpajka.com` is listed, open Manage site and choose **Disable**. "Enable, excluding EU" is not good enough.
  2. Run `curl -s https://oskarpajka.com/ | grep -c cloudflareinsights`. It must print `0`. Repeat for `https://oskarpajka.com/pl/`.
  Checked through the API on 16 Oct 2026, before the site was deployed: no Web Analytics site existed for the account.
- **Zaraz: no script on the page.** The zone has Cloudflare's default Zaraz setup (no tools added, automatic injection on). It should add nothing, but check after every deploy: `curl -s https://oskarpajka.com/ | grep -ci zaraz` must print `0`. If it does not, dashboard, oskarpajka.com, Zaraz, and turn Zaraz off.
- **Always Use HTTPS: on** (SSL/TLS, Edge Certificates). Sends `http://` visitors to `https://`. Cloudflare's security cookie needs HTTPS to work properly.
- **Network Error Logging: off** (turned off 16 Oct 2026 in the zone settings). Keep it off; the privacy policy does not describe it.
- **Email Address Obfuscation: off** (type its name into the dashboard search; it sits under the zone's security settings). When it is on, Cloudflare rewrites the email address in the page and adds its own script, which breaks the copy button and the privacy policy's promise.
- **Rocket Loader: off** (also findable by name in the dashboard search). It rewrites scripts.
- **Workers logs stay off.** `wrangler.jsonc` sets `observability` to false; the privacy policy says you only see totals.

## Every deploy after that

```
npm run cv       # only if the CV changed
npm run og       # only if a link preview or the favicon changed
npm run deploy
```

Later, the GitHub repository can be connected in Workers, Settings, Builds, so every push to `main` deploys. Build command `npm run build`, deploy command `npx wrangler deploy`.

## Testing locally

- `npm run dev` and open http://localhost:4321. Films load from media.oskarpajka.com, so they only play once step 1 is done.
- To test with the local files instead: `npx http-server media/web -p 4400 --cors` in a second terminal, and `PUBLIC_MEDIA_BASE=http://localhost:4400` in `.env`.
