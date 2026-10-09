import { expect, test } from '@playwright/test';

test.describe('målform og tema', () => {
  test('målform kan byttes og huskes', async ({ page }) => {
    await page.goto('./#/innstillinger');
    await page.getByRole('radio', { name: 'Nynorsk' }).check();
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillingar' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'nn');
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillingar' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Hovudmeny' }).getByRole('button', { name: 'Innstillingar' })).toBeVisible();
    await page.getByRole('radio', { name: 'Bokmål' }).check();
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillinger' })).toBeVisible();
  });

  test('bare tekstene for valgt målform lastes ved oppstart, den andre ved bytte', async ({ page }) => {
    const tekstbiter: string[] = [];
    page.on('request', (r) => {
      const treff = /\/assets\/(nb|nn)-[\w-]+\.js$/.exec(r.url());
      if (treff?.[1]) tekstbiter.push(treff[1]);
    });
    await page.goto('./#/innstillinger');
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillinger' })).toBeVisible();
    expect(tekstbiter).toEqual(['nb']);
    await page.getByRole('radio', { name: 'Nynorsk' }).check();
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillingar' })).toBeVisible();
    expect(tekstbiter).toEqual(['nb', 'nn']);
    tekstbiter.length = 0;
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillingar' })).toBeVisible();
    expect(tekstbiter).toEqual(['nn']);
  });

  test('tema kan byttes og huskes', async ({ page }) => {
    await page.goto('./#/innstillinger');
    const html = page.locator('html');
    await page.getByRole('radio', { name: 'Mørkt' }).check();
    await expect(html).toHaveAttribute('data-tema', 'mork');
    const bakgrunnMork = await page.evaluate(() => getComputedStyle(document.querySelector('.skall') as Element).backgroundColor);
    await page.reload();
    await expect(html).toHaveAttribute('data-tema', 'mork');
    await page.getByRole('radio', { name: 'Lyst' }).check();
    await expect(html).toHaveAttribute('data-tema', 'lys');
    const bakgrunnLys = await page.evaluate(() => getComputedStyle(document.querySelector('.skall') as Element).backgroundColor);
    expect(bakgrunnLys).not.toBe(bakgrunnMork);
    await page.getByRole('radio', { name: 'Følg systemet' }).check();
    await expect(html).not.toHaveAttribute('data-tema', /.+/);
  });

  test('temafargen i nettleserlinjen følger valgt tema', async ({ page }) => {
    await page.goto('./#/innstillinger');
    await page.getByRole('radio', { name: 'Mørkt' }).check();
    const farger = await page.locator('meta[name="theme-color"]').evaluateAll((m) => m.map((e) => e.getAttribute('content')));
    expect(new Set(farger).size).toBe(1);
  });

  test('følger systemets mørke tema', async ({ browser, baseURL }) => {
    const kontekst = await browser.newContext({ colorScheme: 'dark', baseURL });
    const side = await kontekst.newPage();
    await side.goto('./');
    await side.locator('.skall').waitFor();
    const bakgrunn = await side.evaluate(() => getComputedStyle(document.querySelector('.skall') as Element).backgroundColor);
    const lys = await side.evaluate(() => {
      document.documentElement.dataset.tema = 'lys';
      return getComputedStyle(document.querySelector('.skall') as Element).backgroundColor;
    });
    expect(bakgrunn).not.toBe(lys);
    await kontekst.close();
  });
});
