// Shared helpers: language strings, routes and media addresses.
import en from '../i18n/en.json';
import pl from '../i18n/pl.json';

export type Lang = 'en' | 'pl';
export type Strings = typeof en;
export type PageKey = 'home' | 'hoplite' | 'bridgemind' | 'privacy' | 'notFound';

export const SITE = 'https://oskarpajka.com';
export const EMAIL = 'oskar@oskarpajka.com';

// Films live in Cloudflare R2 (media.oskarpajka.com). Set PUBLIC_MEDIA_BASE in
// .env to test against another address, for example a local folder server.
export const MEDIA = (import.meta.env.PUBLIC_MEDIA_BASE || 'https://media.oskarpajka.com').replace(/\/$/, '');
export const media = (file: string) => `${MEDIA}/${file}`;

// Polish typesetting: a one-letter word (i, w, z, a, o, u) never ends a line,
// so it is tied to the next word with a no-break space.
const tie = (value: unknown): unknown => {
  if (typeof value === 'string') return value.replace(/(^|[\s(])([aiouwzAIOUWZ]) /g, '$1$2 ');
  if (Array.isArray(value)) return value.map(tie);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, tie(v)]));
  return value;
};
const plTied = tie(pl) as Strings;

export const strings = (lang: Lang): Strings => (lang === 'pl' ? plTied : en);

const routes: Record<PageKey, string> = {
  home: '/',
  hoplite: '/work/hoplite/',
  bridgemind: '/work/bridgemind/',
  privacy: '/privacy/',
  notFound: '/404.html',
};

/** Path of a page in a language, e.g. path('hoplite', 'pl') is /pl/work/hoplite/. */
export const path = (page: PageKey, lang: Lang) => {
  const p = routes[page];
  if (lang === 'en') return p;
  return p === '/' ? '/pl/' : `/pl${p}`;
};

/** Fills {name} style holes. */
export const fill = (text: string, values: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? '');

/** After Effects timecode (h:mm:ss:ff) of a frame at 24 fps. */
export const timecode = (frame: number) => {
  const two = (n: number) => String(n).padStart(2, '0');
  const s = Math.floor(frame / 24);
  return `${Math.floor(s / 3600)}:${two(Math.floor(s / 60) % 60)}:${two(s % 60)}:${two(frame % 24)}`;
};
