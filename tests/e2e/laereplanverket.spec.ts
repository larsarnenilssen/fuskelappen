// Læreplanverket (pakke 6, avgjørelse 037): overordnet del med innholdsregister, søk og bokser, ferdigheter og
// temaer, og lenkene fra fagarket.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('læreplanverket', () => {
  test('fra forsiden til innholdsregisteret og en del i overordnet del', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('link', { name: /^Læreplanverket/ }).click();
    await expect(page.locator('main h1')).toHaveText('Læreplanverket');
    // Innholdsregisteret lenker til hver del. Delen åpnes, og boksene rundt den.
    await page.locator('.innholdsregister').getByRole('link', { name: '2.5.1 Folkehelse og livsmestring' }).click();
    await expect(page).toHaveURL(/#\/laereplanverket\/overordnet-del\/2\.5\.1$/);
    await expect(page.locator('main h1')).toHaveText('Overordnet del');
    await expect(page.getByRole('button', { name: '2 Prinsipper for læring, utvikling og danning' })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: '2.5.1 Folkehelse og livsmestring' })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText(/Folkehelse og livsmestring som tverrfaglig tema i skolen/)).toBeVisible();
    // De andre delene er lukket.
    await expect(page.getByRole('button', { name: '1 Opplæringens verdigrunnlag' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('søket i overordnet del viser delene med et utdrag', async ({ page }) => {
    await page.goto('./#/laereplanverket/overordnet-del');
    await page.getByRole('searchbox', { name: 'Søk i overordnet del' }).fill('tilpasset opplæring');
    await expect(page.locator('main').getByRole('status')).toContainText(/\d+ deler passer søket/);
    await page.getByRole('link', { name: /3\.2 Undervisning og tilpasset opplæring/ }).click();
    await expect(page).toHaveURL(/overordnet-del\/3\.2$/);
    await expect(page.getByRole('button', { name: '3.2 Undervisning og tilpasset opplæring' })).toHaveAttribute('aria-expanded', 'true');
  });

  test('fagarket viser ferdigheter og temaer i faget og lenker til overordnet del', async ({ page }) => {
    await page.goto('./#/fag/HEA2005');
    await page.getByRole('button', { name: /^Grunnleggende ferdigheter og tverrfaglige temaer/ }).click();
    const seksjon = page.locator('[data-seksjon="laereplanverket"]');
    await seksjon.getByRole('button', { name: 'Folkehelse og livsmestring' }).click();
    await seksjon.getByRole('link', { name: 'Folkehelse og livsmestring i overordnet del' }).click();
    await expect(page).toHaveURL(/overordnet-del\/TT1$/);
    await expect(page.getByRole('button', { name: '2.5.1 Folkehelse og livsmestring' })).toHaveAttribute('aria-expanded', 'true');
  });

  test('teksten står på nynorsk når nynorsk er valt', async ({ page }) => {
    await settLagret(page, { malform: 'nn' });
    await page.goto('./#/laereplanverket/overordnet-del/1.1');
    await expect(page.locator('main h1')).toHaveText('Overordna del');
    await expect(page.getByText(/Formålsparagrafen byggjer på at menneskeverdet er ukrenkjeleg/)).toBeVisible();
  });

  test('ukjent del gir en melding', async ({ page }) => {
    await page.goto('./#/laereplanverket/overordnet-del/9.9');
    await expect(page.getByRole('alert')).toHaveText('Fant ikke delen i overordnet del.');
  });

  test('søket på forsiden finner delene i overordnet del', async ({ page }) => {
    await page.goto('./#/sok?q=menneskeverdet');
    await expect(page.getByRole('link', { name: /Menneskeverdet/ }).first()).toBeVisible();
  });
});
