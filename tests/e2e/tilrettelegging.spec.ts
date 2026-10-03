// Veiviseren (fase 4, avgjørelse 041): steg for steg med tilstanden i adressen, tilbake med historikken, fokus på
// det nye steget, kildene i en lukket boks, lenker til Regelverk, kartet over hele prosessen og prosessen i egen
// kolonne på stor skjerm.
import { expect, test } from '@playwright/test';
import { erMobil } from './hjelp.ts';

const VEIVISER = './#/tilrettelegging/fra-tilpasset-opplaering';

test.describe('veiviser', () => {
  test('fra oversikten gjennom stegene til et resultat, og tilbake med historikken', async ({ page }) => {
    await page.goto('./#/tilrettelegging');
    await page.getByRole('link', { name: /Fra tilpasset opplæring til individuell tilrettelegging/ }).click();
    const steg = page.locator('.veiviser-stegtittel');
    await expect(steg).toHaveText('Velg hvor du starter');

    await page.getByRole('link', { name: 'I den ordinære opplæringen' }).click();
    await expect(page).toHaveURL(/steg=ti-tilpasset&svar=ordinar$/);
    await expect(steg).toHaveText('Tilpasset opplæring for alle');
    // Fokus flyttes til overskriften i det nye steget, så skjermlesere leser det.
    await expect(steg).toBeFocused();

    await page.getByRole('link', { name: /Neste\s*Følge med og melde fra/ }).click();
    await page.getByRole('link', { name: 'Ja, det er tvil' }).click();
    await expect(page).toHaveURL(/steg=ti-tiltak&svar=ordinar\.tvil$/);
    await expect(steg).toHaveText('Egnede tiltak i den ordinære opplæringen');

    await page.getByRole('link', { name: /Neste\s*Er tiltakene nok\?/ }).click();
    await page.getByRole('link', { name: /^Nei, eller eleven eller foreldrene/ }).click();
    await page.getByRole('link', { name: 'Bare personlig assistanse eller fysisk tilrettelegging' }).click();
    await page.getByRole('link', { name: /Neste\s*Vedtak om individuell tilrettelegging/ }).click();
    await page.getByRole('link', { name: 'Avslag' }).click();
    await expect(page.locator('.veiviser-stegnr')).toHaveText(/^Resultat · Vedtak/);
    await expect(page.getByRole('button', { name: 'Kopier oppsummeringen' })).toBeVisible();

    // Tilbake i nettleseren går ett steg tilbake.
    await page.goBack();
    await expect(steg).toHaveText('Vedtak om individuell tilrettelegging');
    await page.goBack();
    await expect(steg).toHaveText('Opplyse saken om assistanse eller fysisk tilrettelegging');
  });

  test('en delt adresse åpner samme steg med veien hit, og et tidligere steg kan velges', async ({ page }, info) => {
    await page.goto(`${VEIVISER}?steg=ti-nok&svar=ordinar.tvil`);
    await expect(page.locator('.veiviser-stegtittel')).toHaveText('Er tiltakene nok?');
    await expect(page.locator('.veiviser-stegnr')).toHaveText(/^Steg 5/);
    // Veien hit står som linje på mobil og i prosessen til venstre på stor skjerm.
    const vei = erMobil(info) ? page.locator('.veiviser-vei') : page.locator('.veiviser-prosess');
    await expect(vei.getByText('Ja, det er tvil')).toBeVisible();
    await vei.getByRole('link', { name: 'Følge med og melde fra' }).click();
    await expect(page).toHaveURL(/steg=ti-folge-med&svar=ordinar$/);
    await expect(page.locator('.veiviser-stegtittel')).toHaveText('Følge med og melde fra');
  });

  test('en adresse som ikke stemmer, gir det siste steget den fører fram til, med en merknad', async ({ page }) => {
    await page.goto(`${VEIVISER}?steg=ti-nok&svar=ordinar.ukjent`);
    await expect(page.locator('.veiviser-stegtittel')).toHaveText('Følge med og melde fra');
    await expect(page.getByText('Lenken passet ikke helt med veiviseren')).toBeVisible();
  });

  test('svarene kan velges med tastaturet', async ({ page }) => {
    await page.goto(`${VEIVISER}?steg=ti-folge-med&svar=ordinar`);
    const svar = page.getByRole('link', { name: 'Nei, utbyttet er godt nok' });
    await svar.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.veiviser-stegtittel')).toHaveText('Fortsett den tilpassede opplæringen');
    await expect(page.locator('.veiviser-stegtittel')).toBeFocused();
  });

  test('kildene er lukket til de åpnes, og paragrafene lenker til Regelverk', async ({ page }) => {
    await page.goto(`${VEIVISER}?steg=ti-tilpasset&svar=ordinar`);
    const kilder = page.locator('details.veiviser-kilder');
    await expect(kilder.getByRole('link', { name: /punkt 1\.1/ })).toBeHidden();
    await kilder.getByText('Kilder (2)').click();
    await expect(kilder.getByRole('link', { name: /punkt 1\.1/ })).toBeVisible();
    await page.getByRole('link', { name: /§ 11-1 Tilpassa opplæring/ }).click();
    await expect(page).toHaveURL(/#\/lov\/opplaeringslova\/11-1$/);
  });

  test('kartet over hele prosessen viser fristene og går rett til et steg', async ({ page }) => {
    // På starten er kartet åpent.
    await page.goto(VEIVISER);
    await expect(page.getByRole('button', { name: /Hele prosessen/ })).toHaveAttribute('aria-expanded', 'true');
    const kart = page.locator('.prosesskart');
    await expect(kart.locator('.prosesskart-fasenavn')).toHaveText([/Tilpasset opplæring/, /Utredning/, /Vedtak/, /Oppfølging/]);
    await expect(kart.locator('.prosesskart-punkt', { hasText: 'Klage på vedtaket' }).locator('.prosesskart-frist')).toHaveText(/3 uker/);
    await kart.getByRole('link', { name: 'Individuell opplæringsplan (IOP)' }).click();
    await expect(page.locator('.veiviser-stegtittel')).toHaveText('Individuell opplæringsplan (IOP)');
  });

  test('fasene: på mobil som stolpe over steget, på stor skjerm som prosess i egen kolonne', async ({ page }, info) => {
    await page.goto(`${VEIVISER}?steg=ti-vedtak&svar=foresporsel.faglig`);
    if (erMobil(info)) {
      await expect(page.locator('.veiviser-faser')).toBeVisible();
      await expect(page.locator('.veiviser-prosess')).toBeHidden();
      await expect(page.locator('.veiviser-fase[aria-current="step"]')).toHaveText(/Vedtak/);
    } else {
      test.skip((page.viewportSize()?.width ?? 0) < 1024, 'Prosessen står i egen kolonne fra 64rem');
      await expect(page.locator('.veiviser-prosess')).toBeVisible();
      await expect(page.locator('.veiviser-faser')).toBeHidden();
      await expect(page.locator('.veiviser-prosess [aria-current="step"]')).toHaveText('Vedtak om individuell tilrettelegging');
    }
  });
});
