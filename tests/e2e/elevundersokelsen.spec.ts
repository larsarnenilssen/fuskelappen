// Elevundersøkelsen (fase 7, avgjørelse 077), egen modul under Skolemiljø fra 0.43.0 (avgjørelse 087): «Kort om»
// skolen, søk i seriene og det beste tallet i tabellen, modulen på forsiden og den gamle adressen.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

const SLATTHAUG = { id: '974557320', navn: 'Slåtthaug videregående skole' };

test.describe('Elevundersøkelsen', () => {
  test('«Kort om» skolen, søk i seriene og det beste tallet i tabellen', async ({ page }) => {
    await settLagret(page, { fylke: '46', skole: SLATTHAUG });
    await page.goto('./#/elevundersokelsen');
    await expect(page.getByRole('heading', { name: /Kort om Slåtthaug/ })).toBeVisible();
    const serie2 = page.getByRole('combobox', { name: /Serie 2/ });
    await serie2.click();
    await serie2.fill('voss gym');
    await expect(page.getByRole('option')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(serie2).toHaveValue('Voss gymnas');
    await expect(page).toHaveURL(/s=S974557320(%2C|,)S\d+/);
    await page.getByRole('radio', { name: 'Tabell' }).check({ force: true });
    await expect(page.locator('.eu-tabell')).toBeVisible();
    await expect(page.locator('.eu-tabell .eu-beste').first()).toBeVisible();
  });

  test('står som egen modul under Skolemiljø på forsiden, og ikke i Aktivitetsplikt og skoleregler', async ({ page }) => {
    await page.goto('./');
    const gruppe = page.locator('[data-kategori="skolemiljo"]');
    await expect(gruppe.getByRole('link', { name: /Elevundersøkelsen/ })).toHaveAttribute('href', '#/elevundersokelsen');
    await expect(gruppe.getByRole('link', { name: /Aktivitetsplikt og skoleregler/ })).toBeVisible();
    await page.goto('./#/skolemiljo');
    await expect(page.locator('main h1')).toHaveText('Aktivitetsplikt og skoleregler');
    await expect(page.locator('main a[href="#/elevundersokelsen"]')).toHaveCount(0);
  });

  test('den gamle adressen sender videre med valgene', async ({ page }) => {
    await page.goto('./#/skolemiljo/elevundersokelsen?s=L,L|o&trinn=2');
    await expect(page).toHaveURL(/#\/elevundersokelsen\?s=L(%2C|,)L(%7C|\|)o&trinn=2/);
    await expect(page.locator('main h1')).toHaveText('Elevundersøkelsen');
  });
});
