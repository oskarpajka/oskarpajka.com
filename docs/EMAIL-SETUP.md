# Email setup: oskar@oskarpajka.com on iCloud+

Goal: send and receive as oskar@oskarpajka.com in Mail on iPhone, iPad and iCloud.com. Cost: nothing extra, it is part of iCloud+.

Status: set up with oskar@oskarpajka.com (13 October 2026). DMARC added and tested, policy changed to p=quarantine.

## Before you start

- iCloud+ is active, two-factor authentication is on, and you have a primary @icloud.com address.
- In the Cloudflare dashboard, open oskarpajka.com, then Email, then Email Routing. If it is enabled, disable it. Email Routing and iCloud both need the domain's MX records, and Email Routing locks them.
- Check Cloudflare DNS for any existing MX, SPF (`v=spf1`) or `_dmarc` records and note them. A domain may have only one SPF record.

## Steps

1. On a computer, go to icloud.com/icloudplus, sign in, and choose **Custom Email Domain**.
2. Choose **Add a domain you own**, then **Only You**, type `oskarpajka.com`, and continue.
3. When it asks for existing addresses, choose **No email addresses**.
4. Under **Update your domain's records**, choose **View**. Apple lists the exact records. Keep this tab open.
5. In a second tab, open Cloudflare, oskarpajka.com, **DNS**, **Records**, and add every record Apple shows, copying names and values exactly. Usually this is:
   - two **MX** records (`mx01.mail.icloud.com` and `mx02.mail.icloud.com`, priority 10),
   - a **TXT** record `apple-domain=...` for verification,
   - a **TXT** record for SPF (`v=spf1 include:icloud.com ~all`),
   - a **CNAME** for DKIM (`sig1._domainkey`).
   For the CNAME, set **Proxy status** to **DNS only** (grey cloud). If Cloudflare offers to proxy anything mail-related, say no.
6. Back in iCloud, choose **Finish setup**. If it says the records are not found yet, wait a few minutes and try again. It can take up to a day.
7. Create the address: in Custom Email Domain, open oskarpajka.com, **Add email address**, type `oskar`.
8. Set oskar@oskarpajka.com as the default "From" address if you want every new mail to come from it: on iPhone, Settings, your name, iCloud, iCloud Mail, iCloud Mail Settings, then **From**.
9. Add a DMARC record in Cloudflare: type **TXT**, name `_dmarc`, value `v=DMARC1; p=none; rua=mailto:oskar@oskarpajka.com`. After a month without problems, change `p=none` to `p=quarantine`.

## Test

- Send a mail from Gmail (or another non-Apple account) to oskar@oskarpajka.com. It should arrive in iCloud Mail.
- Reply from iPhone. In Gmail, open the message, three dots, **Show original**, and check that SPF, DKIM and DMARC all say PASS.

## When done

- Tick the email items in STATUS.md and CONTENT-NEEDED.md.
- The privacy policy prompt already names iCloud+ as the provider.
