import { expect, test } from '@playwright/test';

test.describe('modulregister og søk', () => {
  test('testmodulen dukker opp på forsiden i sin kategori', async ({ page }) => {
    await page.goto('./');
    const kategori = page.locator('[data-kategori="skolemiljo"]');
    await expect(kategori.getByRole('heading', { name: 'Skolemiljø' })).toBeVisible();
    await kategori.getByRole('link', { name: /Testmodul for skolemiljø/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Testmodul for skolemiljø' })).toBeVisible();
  });

  test('innganger merket «flere» står i en boks som er lukket til brukeren åpner den', async ({ page }) => {
    await page.goto('./');
    const kategori = page.locator('[data-kategori="skolemiljo"]');
    const knapp = kategori.getByRole('button', { name: /Flere testfunksjoner/ });
    await expect(knapp).toHaveAttribute('aria-expanded', 'false');
    await expect(kategori.getByRole('link', { name: 'Testkalkulator' })).toBeHidden();
    await knapp.click();
    await expect(kategori.getByRole('link', { name: 'Testkalkulator' })).toBeVisible();
  });

  test('teksten i søkefeltet på forsiden har annen farge enn feltet (0.21.1)', async ({ page }) => {
    await page.goto('./');
    const felt = page.getByRole('searchbox');
    await felt.fill('arbeidstid');
    const { farge, bakgrunn } = await felt.evaluate((e) => ({ farge: getComputedStyle(e).color, bakgrunn: getComputedStyle(e).backgroundColor }));
    expect(farge).not.toBe(bakgrunn);
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
    // Regelverk har også paragrafer om skolebibliotek, så det er flere treff (0.22.0).
    await expect(page.getByRole('link', { name: /Skolebibliotek/ }).first()).toBeVisible();
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

  test('søket følger adressen når den endres mens søkesiden er åpen', async ({ page }) => {
    await page.goto('./#/sok?q=skule');
    const felt = page.getByRole('searchbox');
    await expect(page.getByRole('link', { name: /Skuleskyss/ })).toBeVisible();
    // Ny adresse med et annet søk, f.eks. fra adressefeltet eller en lenke.
    await page.evaluate(() => (location.hash = '#/sok?q=innstillinger'));
    await expect(felt).toHaveValue('innstillinger');
    await expect(page.getByRole('link', { name: /Innstillinger/ }).first()).toBeVisible();
    // Også etter at brukeren har skrevet selv: tilbake til det første søket.
    await felt.fill('skolebibliotek');
    // Regelverk har også paragrafer om skolebibliotek, så det er flere treff (0.22.0).
    await expect(page.getByRole('link', { name: /Skolebibliotek/ }).first()).toBeVisible();
    await page.goBack();
    await expect(felt).toHaveValue('skule');
    await expect(page.getByRole('link', { name: /Skuleskyss/ })).toBeVisible();
  });

  test('ingen treff gir melding', async ({ page }) => {
    await page.goto('./#/sok');
    await page.getByRole('searchbox').fill('xqzwvy');
    await expect(page.getByText('Ingen treff på «xqzwvy».')).toBeVisible();
  });
});
