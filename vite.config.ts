import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { app } from './src/config/app.ts';
import { dataPlugin, fagrollerPlugin, fagsokPlugin, jukselappfagPlugin, jukselappEuPlugin, begrepsordPlugin, skolerPlugin, tilbudPlugin, innholdPlugin, lesToken, testoppsettPlugin, htmlPlugin } from './scripts/vite/plugins.ts';

const rot = fileURLToPath(new URL('.', import.meta.url));
const pakke = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };
// Testversjonen (avgjørelse 045) bygges med TESTVERSJON=1 og publiseres under test/ ved siden av appen.
const test = process.env.TESTVERSJON === '1';
const navn = test ? app.testnavn : app.navn;

/**
 * Stien appen ligger under. Publiseringen gir stien fra innstillingene for GitHub Pages i `PAGES_BASE` (avgjørelse
 * 065): tom med eget domene (jukselappen.no), `/jukselappen` på github.io. Slik følger bygget domenet som er satt i
 * GitHub, og appen virker både før og etter at domenet tas i bruk. Ellers i GitHub Actions brukes navnet på repoet
 * (avgjørelse 058). Lokalt og i ende-til-ende-testene brukes `app.base`.
 */
function rotsti(mode: string): string {
  const pages = process.env.PAGES_BASE;
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const rot = mode === 'e2e' ? app.base : pages !== undefined ? `${pages.replace(/\/+$/, '')}/` : repo ? `/${repo}/` : app.base;
  return test ? `${rot}test/` : rot;
}

export default defineConfig(({ mode }) => {
  const base = rotsti(mode);
  return {
    base,
    define: {
      __APP_VERSJON__: JSON.stringify(pakke.version),
      __TESTVERSJON__: JSON.stringify(test),
    },
    oxc: {
      jsx: { runtime: 'automatic', importSource: 'preact' },
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      // Fagindeksen fra Grep er én stor JS-bit (om lag 1,1 MB, 60 kB komprimert) som lastes først når den trengs.
      chunkSizeWarningLimit: 1500,
    },
    server: { port: 5173 },
    preview: { port: 4173 },
    plugins: [
      innholdPlugin(rot),
      htmlPlugin(rot, navn, test ? app.testnavn : app.kortnavn),
      testoppsettPlugin(mode),
      dataPlugin(rot, mode),
      fagrollerPlugin(rot),
      tilbudPlugin(rot),
      skolerPlugin(rot),
      fagsokPlugin(rot),
      jukselappfagPlugin(rot),
      jukselappEuPlugin(rot),
      begrepsordPlugin(rot),
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['ikoner/favicon.svg', 'ikoner/logo.svg', 'ikoner/apple-touch-icon.png'],
        manifest: {
          id: base,
          name: navn,
          short_name: test ? app.testnavn : app.kortnavn,
          description: app.beskrivelse.nb,
          lang: 'nb',
          start_url: './',
          scope: './',
          display: 'standalone',
          orientation: 'any',
          theme_color: lesToken(rot, 'meta-temafarge-lys'),
          background_color: lesToken(rot, 'meta-bakgrunn-lys'),
          icons: [
            { src: 'ikoner/ikon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'ikoner/ikon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'ikoner/ikon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}', 'sok/*.json'],
          globIgnores: ['data/**'],
          navigateFallback: null,
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.endsWith('/data/status/kildestatus.json'),
              handler: 'NetworkFirst',
              options: { cacheName: 'kildestatus', networkTimeoutSeconds: 4 },
            },
            {
              // Nyhetene: ferske når det er nett, ellers forrige liste (fase 7b).
              urlPattern: ({ url }) => url.pathname.endsWith('/data/nyheter/nyheter.json'),
              handler: 'NetworkFirst',
              options: { cacheName: 'nyheter', networkTimeoutSeconds: 4 },
            },
            {
              urlPattern: ({ url }) => url.pathname.includes('/data/') && url.pathname.endsWith('.json'),
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'data', expiration: { maxEntries: 200 } },
            },
          ],
        },
      }),
    ],
  };
});
