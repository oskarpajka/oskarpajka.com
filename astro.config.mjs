// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://oskarpajka.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    // /work/hoplite/index.html, served as /work/hoplite/
    format: 'directory',
  },
  i18n: {
    locales: ['en', 'pl'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
});
