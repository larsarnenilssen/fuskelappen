// Eksamen og klage (avgjørelse 078): oversikten med de fire kortene, eksamen, klage på karakter og prøvene (fase 6,
// pakke 3), og de gamle adressene i Vurdering, som sender videre.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('eksamen og klage', () => {
  test('oversikten har eksamen, prøvene, klage og kalenderen', async ({ page }) => {
    await page.goto('./#/eksamen');
    await expect(page.locator('main h1')).toHaveText('Eksamen og klage');
    await page.locator('main').getByRole('link', { name: /^Eksamen Trekk/ }).click();
    await expect(page).toHaveURL(/#\/eksamen\/regler$/);
    await page.goBack();
    await page.locator('main').getByRole('link', { name: /Klage på karakter/ }).click();
    await expect(page).toHaveURL(/#\/eksamen\/klage-pa-karakter$/);
    await page.goBack();
    await page.locator('main').getByRole('link', { name: /Kalender for eksamen/ }).click();
    await expect(page).toHaveURL(/#\/kalender\?tema=eksamen/);
  });

  test('de gamle adressene i Vurdering sender videre, med valgene i adressen', async ({ page }) => {
    await page.goto('./#/vurdering/klage-pa-karakter?steg=kl-statsforvalteren&svar=standpunkt.nei');
    await expect(page).toHaveURL(/#\/eksamen\/klage-pa-karakter\?steg=kl-statsforvalteren&svar=standpunkt\.nei$/);
    await page.goto('./#/vurdering/eksamen');
    await expect(page).toHaveURL(/#\/eksamen\/regler$/);
  });

  test('eksamen: rutenettet, stien med datoer, og et kort som åpnes fra adressen', async ({ page }) => {
    await page.goto('./#/eksamen/regler?del=ek-tilrettelegging');
    await expect(page.locator('.tabell-rutenett th[scope="row"]')).toHaveCount(4);
    await expect(page.locator('.vu-sti-tall > li')).toHaveCount(6);
    // Datoene i stien kommer fra eksamensdatoene (data/eksamen/datoer.json), eller fra innholdet.
    await expect(page.locator('.vu-sti-naar').first()).toBeVisible();
    await expect(page.locator('#ek-tilrettelegging .innholdskort-knapp')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.samleboks .tabell-kort-rad')).toHaveCount(3);
  });

  test('Vestland-boksen på eksamen vises bare når Vestland er valgt', async ({ page }) => {
    await page.goto('./#/eksamen/regler');
    // Siden må være tegnet før vi ser at boksen mangler.
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('.innholdskort').first()).toBeVisible();
    await expect(page.locator('#ek-vl-bortvisning')).toHaveCount(0);
    // Vestland settes før siden lastes, i en ny fane, som i de andre testene. Før ble den samme siden lastet to ganger
    // rett etter hverandre, og i WebKit ble Vestland av og til ikke lest (sak #138, avgjørelse 097).
    const ny = await page.context().newPage();
    await settLagret(ny, { fylke: '46' });
    await ny.goto('./#/eksamen/regler');
    await expect(ny.locator('#ek-vl-bortvisning')).toBeVisible();
  });

  test('klage på karakter: halvårsvurdering gir ingen klagerett, og standpunkt går til statsforvalteren', async ({ page }) => {
    await page.goto('./#/eksamen/klage-pa-karakter');
    await page.getByRole('link', { name: 'Halvårsvurdering eller annen underveisvurdering' }).click();
    await expect(page.locator('.veiviser-stegtittel').last()).toHaveText('Ingen klagerett');
    await page.goto('./#/eksamen/klage-pa-karakter');
    await page.getByRole('link', { name: 'Standpunktkarakteren i et fag' }).click();
    await page.getByRole('link', { name: 'Nei, klagen sendes til statsforvalteren' }).click();
    await expect(page.locator('.veiviser-stegtittel').last()).toHaveText('Statsforvalteren avgjør');
    await expect(page.locator('[data-veiviserfarge="baer"]').first()).toBeVisible();
  });

  test('prøvene: blå bokser, stien og lenken til klage på prøven', async ({ page }) => {
    await page.goto('./#/eksamen/fag-og-svenneproven');
    await expect(page.locator('.tabell-bokser .tabell-kort-rad')).toHaveCount(3);
    await expect(page.locator('.vu-sti-tall > li')).toHaveCount(5);
    await page.getByRole('link', { name: /Klage på karakter/ }).first().click();
    await expect(page).toHaveURL(/steg=kl-prove&svar=prove$/);
  });

  test('fagarket lenker til eksamen', async ({ page }) => {
    await page.goto('./#/fag/ENG1007');
    await page.getByText('Vurderingsordning', { exact: true }).first().click();
    await page.getByRole('link', { name: 'Eksamen og klage', exact: true }).click();
    await expect(page).toHaveURL(/#\/eksamen\/regler$/);
  });
});
