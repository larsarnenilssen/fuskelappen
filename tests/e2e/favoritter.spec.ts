import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('favoritter', () => {
  test('kan legges til, vises på forsiden og fjernes', async ({ page }) => {
    await page.goto('./#/testmodul');
    const stjerne = page.getByRole('button', { name: /Legg til i favoritter/ });
    await expect(stjerne).toHaveAttribute('aria-pressed', 'false');
    await stjerne.click();
    await expect(stjerne).toHaveAttribute('aria-pressed', 'true');

    await page.goto('./');
    await expect(page.locator('.favorittliste').getByRole('link', { name: 'Testfunksjon' })).toBeVisible();

    await page.goto('./#/favoritter');
    await page.getByRole('button', { name: 'Fjern «Testfunksjon» fra favoritter' }).click();
    await expect(page.getByText('Du har ingen favoritter ennå.', { exact: false })).toBeVisible();
  });

  test('rekkefølgen kan endres med knapper', async ({ page }) => {
    await settLagret(page, { favoritter: ['testmodul:funksjon', 'begreper:testbegrep-skolemiljo'] });
    await page.goto('./#/favoritter');
    const titler = page.locator('.favorittliste .listelenke-tittel');
    await expect(titler).toHaveText(['Testfunksjon', 'Skolemiljø (testbegrep)']);
    await expect(page.getByRole('button', { name: 'Flytt «Testfunksjon» opp' })).toBeDisabled();
    await page.getByRole('button', { name: 'Flytt «Testfunksjon» ned' }).click();
    await expect(titler).toHaveText(['Skolemiljø (testbegrep)', 'Testfunksjon']);
    await page.reload();
    await expect(titler).toHaveText(['Skolemiljø (testbegrep)', 'Testfunksjon']);
  });
});
