// Fag og læreplaner (fase 2): søk og filter, fagside med kompetansemål og vurdering, målform og favoritter.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('fag og læreplaner', () => {
  test('søk og filter følger adressen, og fører til fagsiden', async ({ page }) => {
    await page.goto('./#/fag');
    await page.getByLabel('Søk etter fag eller fagkode').fill('helsefremmende arbeid');
    await expect(page).toHaveURL(/#\/fag\?q=helsefremmende\+arbeid/);
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.getByLabel('Utdanningsprogram').selectOption('HS');
    await page.getByLabel('Trinn').selectOption('Vg2');
    await expect(page).toHaveURL(/program=HS/);
    // Faget har samme navn i to programområder på Vg2. Fagkoden skiller dem.
    await expect(page.getByRole('status')).toHaveText('2 fag');
    await page.getByRole('link', { name: /HEA2005/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Helsefremmende arbeid');

    // Tilbake gir samme søk og filter.
    await page.goBack();
    await expect(page.getByLabel('Søk etter fag eller fagkode')).toHaveValue('helsefremmende arbeid');
    await expect(page.getByRole('button', { name: 'Filter (2)' })).toBeVisible();
    await page.getByRole('button', { name: 'Nullstill filter' }).click();
    await expect(page).not.toHaveURL(/program=/);
  });

  test('fagsiden viser årstimer, vurdering og kompetansemål, merket med målformen læreplanen er fastsatt i', async ({ page }) => {
    await page.goto('./#/fag/HEA2005');
    await expect(page.getByText('197 timer à 60 minutter')).toBeVisible();
    await expect(page.getByText('Felles programfag', { exact: true })).toBeVisible();
    await expect(page.getByText('Fastsatt på bokmål. Teksten fra læreplanen er gjengitt uoversatt.')).toBeVisible();
    await expect(page.locator('.kompetansemaal li').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Læreplanen på udir.no \(KV366\)/ })).toHaveAttribute('href', 'https://www.udir.no/lk20/hea02-04/kompetansemaal-og-vurdering/kv366');
    const underveis = page.getByRole('button', { name: /Underveisvurdering/ });
    await expect(underveis).toHaveAttribute('aria-expanded', 'false');
    await underveis.click();
    await expect(page.locator('.forklaring-innhold p').first()).toBeVisible();
  });

  test('læreplaner fastsatt på nynorsk vises på nynorsk også når appen er på bokmål', async ({ page }) => {
    await page.goto('./#/fag/AKT2004');
    await expect(page.getByText('Fastsatt på nynorsk.', { exact: false })).toBeVisible();
    await expect(page.locator('main [lang="nn"]').first()).toBeVisible();
  });

  test('appen på nynorsk viser egne tekster på nynorsk og læreplanen uoversatt', async ({ page }) => {
    await settLagret(page, { malform: 'nn' });
    await page.goto('./#/fag/HEA2005');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Helsefremjande arbeid');
    await expect(page.getByText('Fastsett på bokmål. Teksten frå læreplanen er gjengitt utan omsetjing.')).toBeVisible();
    await expect(page.locator('main [lang="nb"]').first()).toBeVisible();
  });

  test('fag kan legges til som favoritt', async ({ page }) => {
    await page.goto('./#/fag/HEA2005');
    await page.getByRole('button', { name: 'Legg til i favoritter: Helsefremmende arbeid' }).click();
    await page.goto('./#/favoritter');
    await expect(page.locator('.favorittliste').getByRole('link', { name: 'Helsefremmende arbeid (HEA2005)' })).toBeVisible();
  });

  test('ukjent fagkode gir en melding', async ({ page }) => {
    await page.goto('./#/fag/FINNES0');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fant ikke faget.');
  });

  test('det samlede søket finner fag på navn og kode', async ({ page }) => {
    await page.goto('./#/sok?q=HEA2005');
    await expect(page.getByRole('link', { name: /Helsefremmende arbeid/ }).first()).toBeVisible();
  });
});
