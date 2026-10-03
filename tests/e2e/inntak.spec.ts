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
    await expect(steg).toHaveText('Grunnskolen');

    await page.getByRole('link', { name: 'Ja, vitnemål fra norsk grunnskole' }).click();
    await page.getByRole('link', { name: 'Ja', exact: true }).click();
    await page.getByRole('link', { name: 'Nei', exact: true }).click();
    await page.getByRole('link', { name: 'Før skoleåret søkeren fyller 19' }).click();
    await expect(steg).toHaveText('Ungdomsrett');
    await page.getByRole('link', { name: 'Vg1', exact: true }).click();
    await expect(steg).toHaveText('Inntaksmåte');
    await page.getByRole('link', { name: 'Ingen av delene: konkurrerer på poeng' }).click();
    // Poeng, hvor søknaden sendes, og søknad, svar og klage står på samme side, der veien ender.
    await expect(page).toHaveURL(/steg=sk-poeng&svar=norsk\.ja\.nei\.under19\.vg1\.poeng$/);
    await expect(steg).toHaveText(['Konkurrerer på poeng', 'Hvor søknaden sendes', 'Søknad, svar og klage']);
    await expect(page.locator('.veiviser-stegnr').last()).toHaveText(/^Her ender veien · Søknad/);
    await expect(page.locator('.veiviser-steg')).toContainText('statsforvalteren');
    // «Veien hit» viser de siste valgene, og resten bak en knapp.
    await page.getByRole('button', { name: /Vis hele veien/ }).click();
    await expect(page.locator('.veiviser-vei-punkt')).toHaveCount(6);
    await expect(page.getByRole('link', { name: 'Tilbake til «Inntaksmåte»' })).toBeVisible();
    // Uten valgt fylke er det ingen Vestland-bokser.
    await expect(page.locator('.veiviser-tillegg')).toHaveCount(0);
  });

  test('med Vestland valgt står de lokale reglene i en egen boks i steget', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/inntak');
    await expect(page.getByText('Viser også de lokale reglene om inntak i Vestland.')).toBeVisible();
    await page.goto(`${VEIVISER}?steg=sk-poeng&svar=norsk.ja.nei.under19.vg1.poeng`);
    await expect(page.locator('.veiviser-stegtittel').first()).toHaveText('Konkurrerer på poeng');
    const bokser = page.locator('.veiviser-tillegg');
    await expect(bokser).toHaveCount(3);
    const boks = bokser.first();
    await expect(boks).toContainText('I Vestland');
    // Boksen er lukket til brukeren åpner den.
    const lenke = boks.getByRole('link', { name: /§ 2-1/ });
    await expect(lenke).toBeHidden();
    await boks.getByText('Inntaksområde, skoler og tilleggspoeng').click();
    await expect(lenke).toHaveAttribute('href', /#\/lov\/vestland-inntak\/2-1/);
    // Kildene til Vestland-boksen er med i kildene til steget.
    await expect(page.getByText(/Kilder \(7\)/)).toBeVisible();
    // Vestland-innholdet er ikke et eget steg i kartet.
    await expect(page.locator('.prosesskart-punkt', { hasText: 'Inntaksområde' })).toHaveCount(0);
  });

  test('lenkene begge veier mellom inntak og særskilt språkopplæring', async ({ page }) => {
    await page.goto(`${VEIVISER}?steg=sk-utland&svar=utland`);
    await page.locator('.veiviser-steg').getByRole('link', { name: 'særskilt språkopplæring og kort botid' }).click();
    await expect(page.locator('.veiviser-stegtittel').last()).toHaveText('Elever med kort botid');
    await page.locator('.veiviser-del').last().getByRole('button', { name: 'Mer om dette steget' }).click();
    await page.getByRole('link', { name: 'Hvilken søkerkategori?' }).click();
    await expect(page.locator('.veiviser-stegtittel').first()).toHaveText('Grunnopplæring i utlandet');
  });
});
