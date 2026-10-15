// sitemap.xml with both languages of every page.
import { SITE, path, type PageKey } from '../lib/site';

const pages: PageKey[] = ['home', 'hoplite', 'bridgemind', 'privacy'];

export function GET() {
  const url = (p: PageKey, l: 'en' | 'pl') => new URL(path(p, l), SITE).href;
  const entries = pages.flatMap((p) =>
    (['en', 'pl'] as const).map(
      (l) => `  <url>
    <loc>${url(p, l)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${url(p, 'en')}"/>
    <xhtml:link rel="alternate" hreflang="pl" href="${url(p, 'pl')}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url(p, 'en')}"/>
  </url>`,
    ),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
