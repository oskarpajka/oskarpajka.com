# Prompt for the privacy policy

Done: the policy now lives in `src/content/privacy/en.md` and `pl.md` (15 October 2026), written against the final stack. This prompt is kept only for reference.

Copy everything inside the fence below into an AI agent that can browse the web (so it can check Cloudflare's current documentation). The email provider is already filled in (Apple iCloud+). Leave [DATE OF PUBLISHING] for the agent to keep as a placeholder. Read the result yourself before publishing it: an AI-written policy is a starting point, not legal advice.

````
You are writing the privacy policy for oskarpajka.com, the personal portfolio website of Oskar Pajka, a motion designer and developer based in Kielce, Poland. The site is in English. Write it so a normal visitor understands it in one read, while still meeting the GDPR (EU 2016/679) and Polish law.

Before writing, check Cloudflare's current official documentation and privacy policy for the facts about Workers, R2 and Web Analytics listed below. If anything below turns out to be wrong or out of date, follow the documentation and tell me what you changed in a separate note at the end. Do not invent any processing, provider, cookie or data category that is not listed here.

FACTS ABOUT THE SITE

Controller
- Oskar Pajka, Kielce, Poland. Contact: oskar@oskarpajka.com. No postal address published on the site.
- Private individual, not a company. No data protection officer.

What the site is
- A static portfolio: pages with text, images and videos of his work. No user accounts, no login, no contact form, no comments, no newsletter, no shop, no ads.
- No cookies of any kind, and nothing stored on the visitor's device (no localStorage or sessionStorage).
- The only interactive features run entirely in the visitor's browser: a video player, an image comparison slider, a large image view, and a button that copies the email address to the clipboard. None of these send data anywhere.

Hosting and delivery
- Hosted on Cloudflare Workers (static assets). Cloudflare, Inc. acts as a processor. When a page is requested, Cloudflare necessarily processes the visitor's IP address, the requested URL, browser user agent, referrer and time, to deliver the page and protect the site from attacks.
- Videos and images are served from Cloudflare R2 on media.oskarpajka.com. Same processor, same kind of request data.
- Fonts are self-hosted on the same domain. No requests go to Google or other font services.
- No embeds from YouTube, Vimeo, social networks or other third parties.
- Check and state accurately: Cloudflare's data processing terms, where data may be processed, and the legal mechanism for transfers outside the EEA (for example the EU-US Data Privacy Framework and/or Standard Contractual Clauses).

Visit statistics
- Cloudflare Web Analytics, using its JavaScript beacon. Check and describe accurately: that it does not use cookies or local storage, does not fingerprint, does not track across sites, what it collects, and how long Cloudflare keeps it. Say plainly that Oskar only sees aggregate numbers (for example page views, referrers, countries, devices), never individual visitors.
- Legal basis: legitimate interest (Art. 6(1)(f) GDPR) in understanding which work people look at. Check whether Polish law (Prawo komunikacji elektronicznej, in force since November 2024) requires consent for this beacon given that it stores nothing on the device, and state the conclusion in the separate note, not in the policy.

Email
- People can write to oskar@oskarpajka.com. The mailbox is hosted by Apple (iCloud+ Custom Email Domain, iCloud Mail). Check Apple's privacy policy for iCloud Mail and describe Apple's role correctly. Oskar receives the sender's address, name if given, the message and anything attached, and uses them only to reply and to continue the conversation.
- Legal basis: steps at the sender's request before a contract, or legitimate interest in answering messages (Art. 6(1)(b) and (f)).
- Retention: messages are kept as long as needed for the conversation and any resulting work, then deleted. Propose a clear, simple period.

Server and security logs
- Legal basis: legitimate interest in running a secure, working website (Art. 6(1)(f)). State Cloudflare's actual retention if documented; otherwise say they are kept only as long as Cloudflare needs for delivery and security.

Links to other sites
- The site links to GitHub, LinkedIn, X and Instagram and to the products shown in the work (Hoplite, BridgeMind). Clicking a link leaves the site; those services have their own policies. No data is sent to them before the visitor clicks.

Rights
- List the GDPR rights in plain words (access, correction, deletion, restriction, objection, portability where it applies), how to use them (email oskar@oskarpajka.com), and the right to complain to the Polish supervisory authority, Prezes Urzędu Ochrony Danych Osobowych (UODO), ul. Stawki 2, 00-193 Warszawa, uodo.gov.pl. Check that address.
- No automated decision-making or profiling.
- The site is not aimed at children.

Changes
- The policy shows a "Last updated" date. Changes are made on this page.

STRUCTURE (must match the page design exactly)

Return Markdown with these parts, in this order:

1. "Last updated: [DATE OF PUBLISHING]" on its own line.
2. "The short version": exactly three short lines, each under 70 characters, for example "No cookies, no tracking across sites." These sit in a side column.
3. The policy body with exactly these H2 headings, in this order:
   - Who is responsible
   - What this site collects
   - Visit statistics
   - Hosting and video
   - Email
   - Links to other sites
   - Your rights
   - Changes to this policy
   Use short paragraphs. Use a list only where it truly helps (the list of rights). No tables.
4. After a line with three dashes, a separate "Notes for Oskar" section (this is not published): anything you changed from the facts above, anything you could not verify, the Polish law conclusion about the analytics beacon, and anything he must decide.

STYLE

- Plain, friendly English. Short sentences. Write as Oskar in the first person ("I", "my site"), not "we".
- Between 600 and 900 words for the policy itself.
- Never use em dashes or en dashes. Use commas, full stops or colons instead.
- No legal filler like "including but not limited to". No bold paragraphs. No emoji.
- Sentence case headings, exactly as listed above.
````

## After you get the result

1. Read "Notes for Oskar" and fix anything it raises.
2. Put the three short lines in the side column and the body into `src/pages/privacy.astro` (or a Markdown file it imports).
3. Set the "Last updated" date to the day it goes live.
4. Add a line to docs/DECISIONS.md with the date and the email provider used.
