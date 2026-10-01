// Fagvalg med fagkode i kalkulatorene (fase 2): valgt fag fyller inn årstimetall og årsramme fra koblingen,
// flertydige koblinger spør om program og trinn, og overstyring merkes.
import { expect, type Page, test } from '@playwright/test';
import { venterPaaSide } from './hjelp.ts';

async function aapneBeskjeftigelse(page: Page) {
  await page.goto('./#/arbeidstid/beskjeftigelse');
  await venterPaaSide(page);
}

async function velgFagkode(page: Page, kode: string) {
  await page.getByLabel('Fag', { exact: true }).fill(kode);
  await expect(page.getByText('Fag med fagkode fra Udir')).toBeVisible();
  await page.locator('.fagtreff button', { hasText: kode }).last().click();
}

const resultat = (page: Page) => page.locator('.resultatkort-verdi').first();

test.describe('fagvalg med fagkode', () => {
  test('fyller inn årstimer og årsramme fra koblingen, og viser hvordan årsrammen ble funnet', async ({ page }) => {
    await aapneBeskjeftigelse(page);
    await page.getByLabel('Fag', { exact: true }).fill('HEA2005');
    await expect(page.locator('.fagtreff button', { hasText: 'HEA2005 Helsefremmende arbeid' }).last()).toContainText('årsramme 607,5/810');
    await velgFagkode(page, 'HEA2005');
    await expect(page.locator('.fagvalg')).toContainText('Felles programfag · Helse- og oppvekstfag Vg2');
    await expect(page.locator('.fagvalg')).toContainText('HEA2005 Helsefremmende arbeid');
    await expect(page.locator('.fagvalg-metode')).toHaveAttribute('data-metode', 'regel');
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('197');
    await expect(page.getByText('Årstimetall for elevene fra Udir (HEA2005)')).toBeVisible();
    await expect(resultat(page)).toContainText('32,43');
  });

  test('overstyrte årstimer og årsramme merkes, og kan settes tilbake', async ({ page }) => {
    await aapneBeskjeftigelse(page);
    await velgFagkode(page, 'HEA2005');
    await page.getByLabel('Antall årstimer').fill('150');
    await expect(page.getByText('Overstyrt: Udir har 197 årstimer for HEA2005.')).toBeVisible();
    await page.getByRole('button', { name: 'Bruk 197' }).click();
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('197');

    await page.getByRole('button', { name: 'Velg årsramme selv' }).click();
    await page.getByLabel('Fag', { exact: true }).fill('BAT');
    await page.locator('.fagtreff button', { hasText: 'Felles programfag · Bygg- og anleggsteknikk Vg1' }).first().click();
    await expect(page.locator('.fagvalg-metode')).toHaveAttribute('data-metode', 'manuell');
    await expect(page.getByText('Overstyrt: du har valgt årsrammen selv. Koblingen gir rad 23.')).toBeVisible();
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('197');
    await expect(resultat(page)).toContainText('30,69');
    await page.getByRole('button', { name: 'Bruk koblingen' }).click();
    await expect(page.locator('.fagvalg-metode')).toHaveAttribute('data-metode', 'regel');
    await expect(resultat(page)).toContainText('32,43');
  });

  test('spør om program og trinn når koblingen gir ulik årsramme', async ({ page }) => {
    await aapneBeskjeftigelse(page);
    await page.getByLabel('Fag', { exact: true }).fill('SAM3045');
    await expect(page.locator('.fagtreff button', { hasText: 'SAM3045' }).last()).toContainText('årsrammen avhenger av program eller trinn');
    await velgFagkode(page, 'SAM3045');
    const valg = page.getByRole('group', { name: /Velg utdanningsprogram og trinn for SAM3045/ });
    await expect(valg.getByRole('button')).toHaveCount(2);
    await valg.getByRole('button', { name: /Studiespesialisering Vg3/ }).click();
    await expect(page.locator('.fagvalg')).toContainText('Studiespesialisering Vg3');
    await expect(page.locator('.fagvalg-metode')).toHaveAttribute('data-metode', 'eksplisitt');
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('140');
    await expect(resultat(page)).toContainText('28,23');
  });

  test('fag som ikke er koblet, får årstimer, og årsrammen velges selv', async ({ page }) => {
    await aapneBeskjeftigelse(page);
    await velgFagkode(page, 'REA3065');
    await expect(page.getByText('REA3065 er ikke koblet til en årsramme i vedlegg 1.')).toBeVisible();
    await page.getByRole('button', { name: 'Skriv inn årsramme selv' }).click();
    await page.getByLabel('Årsramme (60 min)').fill('525');
    await expect(page.getByText('Valgt selv: faget er ikke koblet til en årsramme.')).toBeVisible();
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('140');
    await expect(resultat(page)).toContainText('26,67');
  });
});
