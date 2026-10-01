// Fagmerknader (FAM) og vitnemålsmerknader (VMM) fra VIGO Kodeverksbase i begrepsbanken: oppslag med søk, og
// treff i det samlede søket (avgjørelse 026).
import { expect, test } from '@playwright/test';

test.describe('kodelister i begrepsbanken', () => {
  test('oppslaget viser FAM-kodene, og søket i oppslaget filtrerer og står i adressen', async ({ page }) => {
    await page.goto('./#/begreper/fagmerknader');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fagmerknader (FAM-koder)');
    const liste = page.locator('.kodeliste').first();
    await expect(liste.locator('#kode-FAM01')).toContainText('Fritatt fra opplæring');
    await page.getByLabel('Søk på kode eller tekst').fill('vurdering med karakter');
    await expect(liste.locator('#kode-FAM02')).toBeVisible();
    await expect(liste.locator('#kode-FAM01')).toHaveCount(0);
    await expect(page).toHaveURL(/fagmerknader\?q=vurdering/);
  });

  test('det samlede søket finner en FAM-kode og åpner oppslaget med koden', async ({ page }) => {
    await page.goto('./#/sok?q=FAM02');
    await page.getByRole('link', { name: /FAM02 Fritatt fra vurdering med karakter/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fagmerknader (FAM-koder)');
    await expect(page.getByLabel('Søk på kode eller tekst')).toHaveValue('FAM02');
    await expect(page.locator('.kodeliste').first().locator('li')).toHaveCount(1);
  });

  test('vitnemålsmerknadene har eget oppslag, og nynorsk viser VIGOs nynorske tekst', async ({ page }) => {
    await page.goto('./#/begreper/vitnemalsmerknader?q=VMM01');
    await expect(page.locator('#kode-VMM01')).toContainText('Fulgt opplæringen fra');
    await page.goto('./#/innstillinger');
    await page.getByRole('radio', { name: 'Nynorsk' }).check();
    await page.goto('./#/begreper/vitnemalsmerknader?q=VMM01');
    await expect(page.locator('#kode-VMM01')).toContainText('Følgt opplæringa frå');
  });
});
