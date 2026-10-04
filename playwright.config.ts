import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env.CI;
const port = 4173;
// I CI bygges appen én gang i en egen jobb, og delene (shards) får bygget som artefakt (avgjørelse 055).
const ferdigBygd = !!process.env.E2E_FERDIG_BYGD;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: ci,
  retries: 0,
  // Hver del i CI kjører på en maskin med fire kjerner (avgjørelse 055).
  workers: ci ? 3 : undefined,
  reporter: ci ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}/fuskelappen/`,
    // Service worker blokkeres i de fleste testene, slik at nettverket kan styres. PWA-testen slår den på.
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    locale: 'nb-NO',
  },
  webServer: {
    command: `${ferdigBygd ? '' : 'npm run build:e2e && '}npx vite preview --mode e2e --outDir dist-e2e --port ${port} --strictPort`,
    url: `http://localhost:${port}/fuskelappen/`,
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
