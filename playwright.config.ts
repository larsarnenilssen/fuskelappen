import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env.CI;
const port = 4173;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: ci,
  retries: 0,
  workers: ci ? 2 : undefined,
  reporter: ci ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}/fuskelappen/`,
    // Service worker blokkeres i de fleste testene, slik at nettverket kan styres. PWA-testen slår den på.
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    locale: 'nb-NO',
  },
  webServer: {
    command: `npm run build:e2e && npx vite preview --mode e2e --outDir dist-e2e --port ${port} --strictPort`,
    url: `http://localhost:${port}/fuskelappen/`,
    reuseExistingServer: !ci,
    timeout: 180_000,
  },
  projects: [
    { name: 'chromium-mobil', use: { ...devices['Pixel 7'] } },
    { name: 'webkit-mobil', use: { ...devices['iPhone 13'] } },
    { name: 'chromium-skrivebord', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit-skrivebord', use: { ...devices['Desktop Safari'] } },
  ],
});
