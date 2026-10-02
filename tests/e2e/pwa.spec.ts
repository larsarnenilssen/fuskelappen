import { expect, test } from '@playwright/test';

test.describe('PWA', () => {
  test('manifestet har navn, ikoner og standalone-visning', async ({ page, request }) => {
    await page.goto('./');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBeTruthy();
    const svar = await request.get(new URL(href ?? '', page.url()).toString());
    const manifest = (await svar.json()) as {
      name: string;
      short_name: string;
      display: string;
      theme_color: string;
      icons: { src: string; purpose?: string }[];
    };
    expect(manifest.name).toBe('Fuskelappen');
    expect(manifest.short_name).toBe('Fuskelappen');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
    for (const ikon of manifest.icons) {
      const bilde = await request.get(new URL(ikon.src, new URL(href ?? '', page.url())).toString());
      expect(bilde.status(), ikon.src).toBe(200);
    }
    const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
    expect((await request.get(new URL(apple ?? '', page.url()).toString())).status()).toBe(200);
  });

  test.describe('offline', () => {
    test.use({ serviceWorkers: 'allow' });

    test('appen åpnes uten nett etter første besøk', async ({ page, context }, info) => {
      test.skip(!info.project.name.startsWith('chromium'), 'Service worker i Playwright er bare pålitelig i Chromium. iOS testes manuelt.');
      await page.goto('./');
      await page.evaluate(async () => {
        const reg = await navigator.serviceWorker.ready;
        return reg.active?.state;
      });
      // Besøk en side så koden for den er lastet (sist besøkte innhold).
      await page.goto('./#/om');
      await expect(page.getByRole('heading', { level: 1, name: 'Om appen' })).toBeVisible();
      await context.setOffline(true);
      await page.reload();
      await expect(page.getByRole('heading', { level: 1, name: 'Om appen' })).toBeVisible();
      await page.getByRole('navigation', { name: 'Hovedmeny' }).getByRole('link', { name: 'Innstillinger' }).click();
      await expect(page.getByRole('heading', { level: 1, name: 'Innstillinger' })).toBeVisible();
      await context.setOffline(false);
    });
  });
});
