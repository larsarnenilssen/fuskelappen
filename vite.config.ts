import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { app } from './src/config/app.ts';
import { dataPlugin, fagrollerPlugin, fagsokPlugin, begrepsordPlugin, skolerPlugin, tilbudPlugin, innholdPlugin, lesToken, testoppsettPlugin, htmlPlugin } from './scripts/vite/plugins.ts';

const rot = fileURLToPath(new URL('.', import.meta.url));
const pakke = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };
// Testversjonen (avgjørelse 045) bygges med FUSKELAPPEN_TEST=1 og publiseres under test/ ved siden av appen.
const test = process.env.FUSKELAPPEN_TEST === '1';
const base = test ? `${app.base}test/` : app.base;
const navn = test ? app.testnavn : app.navn;

export default defineConfig(({ mode }) => ({
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
            urlPattern: ({ url }) => url.pathname.includes('/data/') && url.pathname.endsWith('.json'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'data', expiration: { maxEntries: 200 } },
          },
        ],
      },
    }),
  ],
}));
