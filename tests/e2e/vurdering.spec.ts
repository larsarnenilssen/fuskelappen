// Vurdering (fase 6, pakke 1, avgjørelse 054): veiviseren med varsel rett etter faren, kortene med regelverk og
// kilder i lukkede rader nederst, faget fra adressen og oppslaget over karakterkodene.
import { expect, test } from '@playwright/test';

test.describe('vurdering', () => {
  test('fra oversikten gjennom fravær og varsel til karakter uten varsel', async ({ page }) => {
    await page.goto('./#/vurdering');
    await page.getByRole('link', { name: /Grunnlag for vurdering/ }).click();
    await page.getByRole('link', { name: 'En elev', exact: true }).click();
    await page.getByRole('link', { name: 'Den vanlige læreplanen i faget' }).click();
    await page.getByRole('link', { name: 'Nei, eleven skal ha karakter' }).click();
    await page.getByRole('link', { name: 'Mer enn 15 prosent' }).click();
    await expect(page).toHaveURL(/steg=vu-varsel-fravaer&svar=elev\.vanlig\.nei\.over$/);
    await expect(page.locator('.veiviser-stegtittel').last()).toHaveText('Varsel om fravær');
    await page.getByRole('link', { name: 'Nei', exact: true }).click();
    await expect(page.locator('.veiviser-stegtittel').last()).toHaveText('Karakter uten varsel');
    // Stien tilbake står øverst i veiviseren.
    await expect(page.getByRole('navigation', { name: 'Plassering' }).getByRole('link', { name: 'Vurdering' })).toBeVisible();
  });

  test('regelverket og kildene står i lukkede rader nederst i kortet', async ({ page }) => {
    await page.goto('./#/vurdering/orden-og-oppforsel');
    const kort = page.locator('.innholdskort').first();
    await kort.locator('.innholdskort-knapp').click();
    const kilder = kort.locator('.kortfot details').last();
    await expect(kilder).not.toHaveAttribute('open', /.*/);
    await kilder.locator('summary').click();
    await expect(kilder.locator('.kildeliste a').first()).toBeVisible();
  });

  test('faget i adressen viser vurderingsteksten i læreplanen', async ({ page }) => {
    await page.goto('./#/vurdering/underveis-og-sluttvurdering?fag=ENG1007');
    await expect(page.locator('.vu-fag-navn')).toContainText('ENG1007');
    await page.getByRole('button', { name: 'Velg et annet fag' }).click();
    await expect(page).not.toHaveURL(/fag=/);
  });

  test('karakterkodene kan søkes fram, og søket står i adressen', async ({ page }) => {
    await page.goto('./#/begreper/karakterer-og-vurderingsuttrykk?q=IV');
    await expect(page.getByRole('status')).toHaveText('1 kode');
    await expect(page.locator('#kode-IV')).toBeVisible();
  });
});
