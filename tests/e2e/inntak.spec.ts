// Inntak (fase 5, pakke 1): veiviseren «Hvilken søkerkategori?» med de nasjonale reglene, Vestland-innholdet som
// egne bokser når Vestland er valgt, merknaden om lokale regler og lenkene begge veier til særskilt språkopplæring.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

const VEIVISER = './#/inntak/sokerkategori';

test.describe('inntak', () => {
  test('fra oversikten gjennom rett og inntaksmåte til søknadsfristen', async ({ page }) => {
    await page.goto('./#/inntak');
    // Uten valgt fylke står bare de nasjonale reglene, med merknad.
    await expect(page.getByText('Viser de nasjonale reglene. Fylket kan ha lokale regler om inntak.')).toBeVisible();
    await page.getByRole('link', { name: /Hvilken søkerkategori\?/ }).click();
    const steg = page.locator('.veiviser-stegtittel');
    await expect(steg).toHaveText('Fullført grunnskole?');

    await page.getByRole('link', { name: 'Ja, vitnemål fra norsk grunnskole' }).click();
    await page.getByRole('link', { name: 'Ja', exact: true }).click();
    await page.getByRole('link', { name: 'Nei', exact: true }).click();
    await page.getByRole('link', { name: 'Før skoleåret søkeren fyller 19' }).click();
    await expect(steg).toHaveText('Ungdomsrett');
    await page.getByRole('link', { name: /Neste\s*Hvilket trinn\?/ }).click();
    await page.getByRole('link', { name: 'Vg1', exact: true }).click();
    await page.getByRole('link', { name: 'Nei', exact: true }).click();
    await page.getByRole('link', { name: 'Nei', exact: true }).click();
    await expect(steg).toHaveText('Konkurrerer på poeng');
    await page.getByRole('link', { name: /Neste\s*Hvor søknaden sendes/ }).click();
    await page.getByRole('link', { name: /Neste\s*Søknadsfrist/ }).click();
    await page.getByRole('link', { name: 'Nei, frist 1. mars' }).click();
    await expect(page).toHaveURL(/steg=sk-mars&svar=norsk\.ja\.nei\.under19\.vg1\.nei\.nei\.nei$/);
    await expect(page.locator('.veiviser-stegnr')).toHaveText(/^Her ender veien · Søknad/);
    await expect(page.locator('.veiviser-steg')).toContainText('statsforvalteren');
    // Uten valgt fylke er det ingen Vestland-bokser.
    await expect(page.locator('.veiviser-tillegg')).toHaveCount(0);
  });

  test('med Vestland valgt står de lokale reglene i en egen boks i steget', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/inntak');
    await expect(page.getByText('Viser også de lokale reglene om inntak i Vestland.')).toBeVisible();
    await page.goto(`${VEIVISER}?steg=sk-poeng&svar=norsk.ja.nei.under19.vg1.nei.nei`);
    await expect(page.locator('.veiviser-stegtittel')).toHaveText('Konkurrerer på poeng');
    const boks = page.locator('.veiviser-tillegg');
    await expect(boks).toHaveCount(1);
    await expect(boks).toContainText('I Vestland');
    await expect(boks.getByRole('heading', { name: 'Inntaksområde, skoler og tilleggspoeng' })).toBeVisible();
    await expect(boks.getByRole('link', { name: /§ 2-1/ })).toHaveAttribute('href', /#\/lov\/vestland-inntak\/2-1/);
    // Kildene til Vestland-boksen er med i kildene til steget.
    await expect(page.getByText(/Kilder \(6\)/)).toBeVisible();
    // Vestland-innholdet er ikke et eget steg i kartet.
    await expect(page.locator('.prosesskart-punkt', { hasText: 'Inntaksområde' })).toHaveCount(0);
  });

  test('lenkene begge veier mellom inntak og særskilt språkopplæring', async ({ page }) => {
    await page.goto(`${VEIVISER}?steg=sk-utland&svar=utland`);
    await page.locator('.veiviser-steg').getByRole('link', { name: 'særskilt språkopplæring og kort botid' }).click();
    await expect(page.locator('.veiviser-stegtittel')).toHaveText('Kort botid?');
    await page.getByRole('button', { name: 'Mer om dette steget' }).click();
    await page.getByRole('link', { name: 'Hvilken søkerkategori?' }).click();
    await expect(page.locator('.veiviser-stegtittel')).toHaveText('Grunnopplæring i utlandet');
  });
});
