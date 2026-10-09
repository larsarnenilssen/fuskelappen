import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env.CI;
// E2E_PORT gir en egen port lokalt, så flere kjøringer samtidig ikke bruker samme server (avgjørelse 097).
const port = Number(process.env.E2E_PORT ?? 4173);
// I CI bygges appen én gang i en egen jobb, og delene (shards) får bygget som artefakt (avgjørelse 055).
const ferdigBygd = !!process.env.E2E_FERDIG_BYGD;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: ci,
  // Ett nytt forsøk i CI, så en ustabil test ikke gjør hele kjøringen rød. Playwright merker testen som «flaky» i
  // rapporten, så den kan rettes (avgjørelse 097). Lokalt ingen nye forsøk.
  retries: ci ? 1 : 0,
  // Hver del i CI kjører på en maskin med fire kjerner (avgjørelse 055).
  workers: ci ? 3 : undefined,
  reporter: ci ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}/jukselappen/`,
    // Service worker blokkeres i de fleste testene, slik at nettverket kan styres. PWA-testen slår den på.
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    locale: 'nb-NO',
  },
  webServer: {
    command: `${ferdigBygd ? '' : 'npm run build:e2e && '}npx vite preview --mode e2e --outDir dist-e2e --port ${port} --strictPort`,
    url: `http://localhost:${port}/jukselappen/`,
    reuseExistingServer: !ci,
    timeout: 180_000,
  },
  projects: [
    { name: 'chromium-mobil', use: { ...devices['Pixel 7'] } },
    { name: 'webkit-mobil', use: { ...devices['iPhone 13'] } },
    // Tester merket @mobil (overflyt i 320–430 px og axe) gjelder bare mobil og listes ikke på skrivebord.
    { name: 'chromium-skrivebord', use: { ...devices['Desktop Chrome'] }, grepInvert: /@mobil/ },
    { name: 'webkit-skrivebord', use: { ...devices['Desktop Safari'] }, grepInvert: /@mobil/ },
  ],
});
