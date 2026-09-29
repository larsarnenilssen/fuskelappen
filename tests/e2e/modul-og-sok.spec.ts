import { expect, test } from '@playwright/test';

test.describe('modulregister og søk', () => {
  test('testmodulen dukker opp på forsiden i sin kategori', async ({ page }) => {
    await page.goto('./');
    const kategori = page.locator('[data-kategori="skolemiljo"]');
    await expect(kategori.getByRole('heading', { name: 'Skolemiljø' })).toBeVisible();
    await kategori.getByRole('link', { name: /Testmodul for skolemiljø/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Testmodul for skolemiljø' })).toBeVisible();
  });

  test('hurtigkalkulatorer fra modulene vises på forsiden', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('link', { name: 'Testkalkulator' })).toBeVisible();
  });

  test('testmodulen finnes i søket', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('searchbox').fill('testmodul');
    await expect(page.getByRole('link', { name: /Testmodul for skolemiljø/ })).toBeVisible();
  });

  test('«skule» finner innhold skrevet med «skole», og omvendt', async ({ page }) => {
    await page.goto('./#/sok');
    const felt = page.getByRole('searchbox');
    await felt.fill('skulebibliotek');
    await expect(page.getByRole('link', { name: /Skolebibliotek/ })).toBeVisible();
    await felt.fill('skoleskyss');
    await expect(page.getByRole('link', { name: /Skuleskyss/ })).toBeVisible();
  });

  test('søketeksten ligger i adressen på søkesiden', async ({ page }) => {
    await page.goto('./#/sok?q=skule');
    await expect(page.getByRole('searchbox')).toHaveValue('skule');
    await expect(page.getByRole('link', { name: /Skuleskyss/ })).toBeVisible();
    await page.getByRole('searchbox').fill('innstillinger');
    await expect(page).toHaveURL(/q=innstillinger/);
    await expect(page.getByRole('link', { name: /Innstillinger/ }).first()).toBeVisible();
  });

  test('ingen treff gir melding', async ({ page }) => {
    await page.goto('./#/sok');
    await page.getByRole('searchbox').fill('xqzwvy');
    await expect(page.getByText('Ingen treff på «xqzwvy».')).toBeVisible();
  });
});
