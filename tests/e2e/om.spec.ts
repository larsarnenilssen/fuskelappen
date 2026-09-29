import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const versjon = (JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string }).version;

test('«Om» viser versjon, ansvarsfraskrivelse, personvern og kreditering', async ({ page }) => {
  await page.goto('./#/om');
  await expect(page.getByTestId('versjon')).toHaveText(`Versjon ${versjon}`);
  await expect(page.getByRole('heading', { name: 'Kildene gjelder foran appen' })).toBeVisible();
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
