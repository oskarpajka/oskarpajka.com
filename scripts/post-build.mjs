// Runs after `astro build`. Astro writes the Polish 404 as pl/404/index.html;
// Cloudflare looks for pl/404.html (the nearest 404.html to the missing page).
import { rename, rm, access } from 'node:fs/promises';

const from = 'dist/pl/404/index.html';
try {
  await access(from);
  await rename(from, 'dist/pl/404.html');
  await rm('dist/pl/404', { recursive: true, force: true });
  console.log('post-build: moved pl/404/index.html to pl/404.html');
} catch {
  console.log('post-build: no Polish 404 to move');
}
