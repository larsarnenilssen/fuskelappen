import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const versjon = (JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string }).version;

test('«Om» viser versjon, brukserklæring, personvern og kreditering', async ({ page }) => {
  await page.goto('./#/om');
  await expect(page.getByTestId('versjon')).toHaveText(`Versjon ${versjon}`);
  await expect(page.getByRole('heading', { name: 'Brukserklæring' })).toBeVisible();
  const erklaering = page.getByTestId('brukserklaering');
  await expect(erklaering).toContainText('Jukselappen er utviklet privat.');
  await expect(erklaering).toContainText('Appen gir ingen garantier.');
  await expect(erklaering).toContainText('KI-assistent');
  await expect(erklaering).toContainText('god tro, som et redskap og et hjelpemiddel');
  await expect(erklaering).toContainText('tas imot med takk');
  await expect(erklaering.getByRole('link', { name: 'Meld fra på GitHub' })).toHaveAttribute('href', /\/issues\/new$/);
  await expect(page.getByRole('heading', { name: 'Tilbakemelding' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Personvern' })).toBeVisible();
  await expect(page.getByText('Norsk lisens for offentlige data (NLOD) 2.0', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Se alle kilder og kildestatus' })).toBeVisible();
});

test('«Om» har teknisk informasjon som er skjult til den åpnes', async ({ page }) => {
  await page.goto('./#/om');
  const knapp = page.getByRole('button', { name: /Teknisk informasjon/ });
  await expect(knapp).toHaveAttribute('aria-expanded', 'false');
  await knapp.click();
  await expect(page.locator('.teknisk-liste')).toContainText('Visningsområde');
  await expect(page.locator('.teknisk-liste')).toContainText('Sikre kanter');
});

test('forsiden sier at appen er utviklet privat og kan ha feil, og lenker til «Om»', async ({ page }) => {
  await page.goto('./#/');
  await expect(page.getByTestId('forbehold')).toHaveText('Jukselappen er utviklet privat, og opplysningene i appen kan være uriktige.');
  await page.locator('.bunntekst').getByRole('link', { name: 'Om appen' }).click();
  await expect(page.getByRole('heading', { name: 'Brukserklæring' })).toBeVisible();
});

test('tilbakemeldingen åpner e-post med versjonen og siden brukeren kom fra, og adressen kan vises (eier 05.10.2026)', async ({ page }) => {
  await page.goto('./#/fylker/46');
  await expect(page.locator('main h1')).toHaveText('Vestland fylkeskommune');
  await page.goto('./#/om');
  const boks = page.getByTestId('tilbakemelding');
  const lenke = boks.getByRole('link', { name: 'Skriv e-post' });
  const href = (await lenke.getAttribute('href')) ?? '';
  expect(href.startsWith('mailto:jukselappen.app@gmail.com?')).toBe(true);
  const url = new URL(href);
  expect(url.searchParams.get('subject')).toBe(`Tilbakemelding på Jukselappen ${versjon}`);
  expect(url.searchParams.get('body')).toContain(`Versjon: ${versjon}`);
  expect(url.searchParams.get('body')).toContain('#/fylker/46');
  await expect(boks.getByText('jukselappen.app@gmail.com')).toHaveCount(0);
  await boks.getByRole('button', { name: 'Vis adressen' }).click();
  await expect(boks.getByText('jukselappen.app@gmail.com')).toBeVisible();
  await expect(boks.getByRole('button', { name: 'Kopier' })).toBeVisible();
});

test('tilbakemeldingen står også under Innstillinger', async ({ page }) => {
  await page.goto('./#/innstillinger');
  await expect(page.getByTestId('tilbakemelding').getByRole('link', { name: 'Skriv e-post' })).toHaveAttribute('href', /^mailto:jukselappen\.app@gmail\.com\?subject=/);
});
