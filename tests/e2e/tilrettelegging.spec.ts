// Veiviseren (fase 4, avgjørelse 041): steg for steg med tilstanden i adressen, tilbake med historikken, fokus på
// det nye steget, kildene i en lukket boks, lenker til Regelverk og prosessen i egen kolonne på stor skjerm.
import { expect, test } from '@playwright/test';
import { erMobil } from './hjelp.ts';

const VEIVISER = './#/tilrettelegging/individuell-tilrettelegging';

test.describe('veiviser', () => {
  test('fra oversikten gjennom stegene til et resultat, og tilbake med historikken', async ({ page }) => {
    await page.goto('./#/tilrettelegging');
    await page.getByRole('link', { name: /Fra tilpasset opplæring til individuell tilrettelegging/ }).click();
    const steg = page.locator('.veiviser-stegtittel');
    await expect(steg).toHaveText('Tilpasset opplæring for alle');

    await page.getByRole('link', { name: /Neste\s*Følge med og melde fra/ }).click();
    await expect(page).toHaveURL(/steg=ti-folge-med$/);
    await expect(steg).toHaveText('Følge med og melde fra');
    // Fokus flyttes til overskriften i det nye steget, så skjermlesere leser det.
    await expect(steg).toBeFocused();

    await page.getByRole('link', { name: 'Ja, det er tvil' }).click();
    await expect(page).toHaveURL(/steg=ti-tiltak&svar=tvil$/);
    await expect(steg).toHaveText('Egnede tiltak i den ordinære opplæringen');

    await page.getByRole('link', { name: /Neste\s*Er tiltakene nok\?/ }).click();
    await page.getByRole('link', { name: /^Nei, eller eleven eller foreldrene/ }).click();
    await expect(page).toHaveURL(/steg=ti-vurder-individuell&svar=tvil\.nei$/);
    await expect(page.locator('.veiviser-stegnr')).toHaveText(/^Resultat · Utredning/);
    await expect(page.getByRole('button', { name: 'Kopier oppsummeringen' })).toBeVisible();

    // Tilbake i nettleseren går ett steg tilbake.
    await page.goBack();
    await expect(steg).toHaveText('Er tiltakene nok?');
    await page.goBack();
    await expect(steg).toHaveText('Egnede tiltak i den ordinære opplæringen');
  });

  test('en delt adresse åpner samme steg med veien hit, og et tidligere steg kan velges', async ({ page }, info) => {
    await page.goto(`${VEIVISER}?steg=ti-nok&svar=tvil`);
    await expect(page.locator('.veiviser-stegtittel')).toHaveText('Er tiltakene nok?');
    await expect(page.locator('.veiviser-stegnr')).toHaveText(/^Steg 4/);
    // Veien hit står som linje på mobil og i prosessen til venstre på stor skjerm.
    const vei = erMobil(info) ? page.locator('.veiviser-vei') : page.locator('.veiviser-prosess');
    await expect(vei.getByText('Ja, det er tvil')).toBeVisible();
    await vei.getByRole('link', { name: 'Følge med og melde fra' }).click();
    await expect(page).toHaveURL(/steg=ti-folge-med$/);
    await expect(page.locator('.veiviser-stegtittel')).toHaveText('Følge med og melde fra');
  });

  test('en adresse som ikke stemmer, gir det siste steget den fører fram til, med en merknad', async ({ page }) => {
    await page.goto(`${VEIVISER}?steg=ti-nok&svar=ukjent`);
    await expect(page.locator('.veiviser-stegtittel')).toHaveText('Følge med og melde fra');
    await expect(page.getByText('Lenken passet ikke helt med veiviseren')).toBeVisible();
  });

  test('svarene kan velges med tastaturet', async ({ page }) => {
    await page.goto(`${VEIVISER}?steg=ti-folge-med`);
    const svar = page.getByRole('link', { name: 'Nei, utbyttet er godt nok' });
    await svar.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.veiviser-stegtittel')).toHaveText('Fortsett den tilpassede opplæringen');
    await expect(page.locator('.veiviser-stegtittel')).toBeFocused();
  });

  test('kildene er lukket til de åpnes, og paragrafene lenker til Regelverk', async ({ page }) => {
    await page.goto(VEIVISER);
    const kilder = page.locator('details.veiviser-kilder');
    await expect(kilder.getByRole('link', { name: /punkt 1\.1/ })).toBeHidden();
    await kilder.getByText('Kilder (2)').click();
    await expect(kilder.getByRole('link', { name: /punkt 1\.1/ })).toBeVisible();
    await page.getByRole('link', { name: /§ 11-1 Tilpassa opplæring/ }).click();
    await expect(page).toHaveURL(/#\/lov\/opplaeringslova\/11-1$/);
  });

  test('fasene: på mobil som stolpe over steget, på stor skjerm som prosess i egen kolonne', async ({ page }, info) => {
    await page.goto(`${VEIVISER}?steg=ti-vurder-individuell&svar=tvil.nei`);
    if (erMobil(info)) {
      await expect(page.locator('.veiviser-faser')).toBeVisible();
      await expect(page.locator('.veiviser-prosess')).toBeHidden();
      await expect(page.locator('.veiviser-fase[aria-current="step"]')).toHaveText(/Utredning/);
    } else {
      test.skip((page.viewportSize()?.width ?? 0) < 1024, 'Prosessen står i egen kolonne fra 64rem');
      await expect(page.locator('.veiviser-prosess')).toBeVisible();
      await expect(page.locator('.veiviser-faser')).toBeHidden();
      await expect(page.locator('.veiviser-prosess [aria-current="step"]')).toHaveText('Eleven kan trenge individuell tilrettelegging');
    }
  });
});
