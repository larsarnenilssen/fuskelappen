// Læreplanverket (pakke 6, avgjørelse 037): overordnet del i rubrikker med søk og bokser, ferdigheter og
// temaer, og lenkene fra fagarket.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('læreplanverket', () => {
  test('fra forsiden til overordnet del i rubrikker, og en adresse som åpner en del', async ({ page }) => {
    await page.goto('./');
    // Overskriften på forsiden er «Læreplanverket», med Overordnet del og Fag og læreplaner i den rekkefølgen.
    // Opplæringstilbud står under «Inntak og opplæringstilbud», etter Inntak (eier 04.10.2026).
    const kategori = page.locator('[data-kategori="fag"]');
    await expect(kategori.locator('h3')).toHaveText('Læreplanverket');
    await expect(kategori.locator('a.listelenke .listelenke-tittel')).toHaveText(['Overordnet del', 'Fag og læreplaner']);
    const inntak = page.locator('[data-kategori="inntak"]');
    await expect(inntak.locator('h3')).toHaveText('Inntak og opplæringstilbud');
    await expect(inntak.locator('a.listelenke .listelenke-tittel')).toHaveText(['Inntak', 'Opplæringstilbud']);
    await page.getByRole('link', { name: /^Overordnet del/ }).click();
    await expect(page.locator('main h1')).toHaveText('Overordnet del');
    // Hele overordnet del står i rubrikker som er lukket, med søket øverst og ferdighetene og temaene til slutt.
    await expect(page.getByRole('searchbox', { name: 'Søk i overordnet del' })).toBeVisible();
    for (const navn of ['1 Opplæringens verdigrunnlag', '2 Prinsipper for læring, utvikling og danning', '3 Prinsipper for skolens praksis', 'Grunnleggende ferdigheter 5', 'Tverrfaglige temaer 3']) {
      await expect(page.getByRole('button', { name: navn, exact: true })).toHaveAttribute('aria-expanded', 'false');
    }
    await page.getByRole('button', { name: '2 Prinsipper for læring, utvikling og danning' }).click();
    await page.getByRole('button', { name: '2.5 Tverrfaglige temaer' }).click();
    await page.getByRole('button', { name: '2.5.1 Folkehelse og livsmestring' }).click();
    await expect(page.getByText(/Folkehelse og livsmestring som tverrfaglig tema i skolen/)).toBeVisible();
    // En adresse til en del åpner delen og boksene rundt den, og overskriften står synlig under toppfeltet.
    await page.goto('./#/laereplanverket/overordnet-del/3.2');
    const knapp = page.getByRole('button', { name: '3.2 Undervisning og tilpasset opplæring' });
    await expect(knapp).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: '1 Opplæringens verdigrunnlag' })).toHaveAttribute('aria-expanded', 'false');
    await expect(knapp).toBeInViewport();
    const topp = await page.locator('.topplinje, header').first().evaluate((e) => e.getBoundingClientRect().bottom);
    expect((await knapp.boundingBox())?.y ?? 0).toBeGreaterThanOrEqual(topp);
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
    await expect(seksjon.getByRole('link', { name: 'Om begrepet grunnleggende ferdigheter' })).toHaveAttribute('href', '#/begreper/grunnleggende-ferdigheter');
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

  test('søket finner overskriftene i overordnet del, stikkordene og de nye begrepene', async ({ page }) => {
    await page.goto('./#/sok?q=menneskeverdet');
    await expect(page.getByRole('link', { name: /Menneskeverdet/ }).first()).toBeVisible();
    // Kapittelnummer og stikkord.
    await page.goto('./#/sok?q=2.5.3');
    await expect(page.getByRole('link', { name: /Bærekraftig utvikling/ }).first()).toBeVisible();
    await page.goto('./#/sok?q=LK20');
    await expect(page.getByRole('link', { name: /^Læreplanverket/ }).first()).toBeVisible();
    // Begrepene i oppslagsverket.
    await page.goto('./#/sok?q=formålsparagrafen');
    await expect(page.getByRole('link', { name: /Formålsparagrafen/ }).first()).toHaveAttribute('href', '#/begreper/formalsparagrafen');
    await page.goto('./#/begreper/grunnleggende-ferdigheter');
    await expect(page.locator('main h1')).toHaveText('Grunnleggende ferdigheter');
  });

  test('søket på nynorsk finner overskriftene', async ({ page }) => {
    await settLagret(page, { malform: 'nn' });
    await page.goto('./#/sok?q=grunnleggjande ferdigheiter');
    await expect(page.getByRole('link', { name: /Grunnleggjande ferdigheiter/ }).first()).toBeVisible();
  });
});
