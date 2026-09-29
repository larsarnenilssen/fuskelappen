import { expect, test } from '@playwright/test';
import { venterPaaSide } from './hjelp.ts';

test.describe('navigasjon', () => {
  test('forsiden har søk, favoritter og moduler', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('searchbox')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Favoritter' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Hovedmeny' })).toBeVisible();
    await expect(page).toHaveTitle('Protokollen');
  });

  test('bunnmenyen og nettleserens tilbake virker', async ({ page }) => {
    await page.goto('./');
    const meny = page.getByRole('navigation', { name: 'Hovedmeny' });
    await meny.getByRole('link', { name: 'Innstillinger' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillinger' })).toBeVisible();
    await expect(meny.getByRole('link', { name: 'Innstillinger' })).toHaveAttribute('aria-current', 'page');
    await expect(page).toHaveTitle('Innstillinger – Protokollen');
    await meny.getByRole('link', { name: 'Favoritter' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Favoritter' })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillinger' })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test('tilbakeknappen i topplinjen går tilbake', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('link', { name: 'Om appen' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Om appen' })).toBeVisible();
    await page.getByRole('button', { name: 'Tilbake' }).click();
    await expect(page).toHaveURL(/\/protokollen\/(#\/)?$/);
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test('tilbakeknappen går til forsiden når siden ble åpnet direkte', async ({ page }) => {
    await page.goto('./#/om');
    await venterPaaSide(page);
    await page.getByRole('button', { name: 'Tilbake' }).click();
    await expect(page).toHaveURL(/#\/$/);
  });

  test('fokus flyttes til overskriften ved navigasjon', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('navigation', { name: 'Hovedmeny' }).getByRole('link', { name: 'Søk' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Søk' })).toBeFocused();
  });

  test('ukjent side gir tydelig melding', async ({ page }) => {
    await page.goto('./#/finnes-ikke');
    await expect(page.getByRole('heading', { level: 1, name: 'Fant ikke siden' })).toBeVisible();
    await page.getByRole('link', { name: 'Til forsiden' }).click();
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test('gjenoppretter scrollposisjon ved tilbake', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 400 });
    await page.goto('./#/om');
    await venterPaaSide(page);
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(100);
    await page.getByRole('link', { name: 'Se alle kilder og kildestatus' }).click();
    await venterPaaSide(page);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.goBack();
    await venterPaaSide(page);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(250);
  });

  test('pinch-zoom er ikke slått av', async ({ page }) => {
    await page.goto('./');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).not.toMatch(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/);
  });
});
