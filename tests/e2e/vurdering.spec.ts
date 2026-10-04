// Vurdering (fase 6, pakke 1, avgjørelse 054): veiviseren med varsel rett etter faren, kortene med regelverk og
// kilder i lukkede rader nederst, faget fra adressen og oppslaget over karakterkodene. Pakke 2: fraværsgrensen, med
// lenker fra fagarket og til veiviseren. Pakke 3: eksamen, klage på karakter, prøvene og tidslinjen.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

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

  test('fraværsgrensen: faget fra adressen, økter på 45 minutter og sjekk av fraværet', async ({ page }) => {
    await page.goto('./#/vurdering/fravaer?fag=ENG1007');
    await expect(page.locator('.fr-fag-navn')).toContainText('ENG1007');
    const resultat = page.locator('.kalkulator-resultat .resultatkort');
    await expect(resultat.locator('.resultatkort-verdi')).toHaveText('14 timer');
    // FR2: 18 økter innenfor, 19 over (eier 04.10.2026).
    await page.getByRole('radio', { name: '45 min' }).check();
    await expect(resultat.locator('.resultatkort-verdi')).toHaveText('18 økter');
    await expect(resultat.locator('.resultatkort-sammendrag')).toHaveText('Innenfor med 18 økter. Over med 19 økter.');
    // «Sjekk fraværet» er lukket til brukeren åpner det.
    const sjekk = page.getByRole('button', { name: /^Sjekk fraværet/ });
    await expect(sjekk).toHaveAttribute('aria-expanded', 'false');
    await sjekk.click();
    await page.getByLabel('Udokumentert fravær').fill('30');
    await expect(page.locator('.fr-utfall-tittel')).toHaveText('Over 15 prosent');
    await expect(page.locator('.fr-utfall')).toContainText('(FAM51)');
    await page.getByLabel('Udokumentert fravær').fill('17');
    // Helsefraværet står i én boks, og deles bare når brukeren krysser av (eier 04.10.2026).
    await page.getByLabel('Helsefravær', { exact: true }).fill('3');
    await expect(page.getByLabel('Av dette: etter at grensen ble nådd')).toHaveCount(0);
    await page.getByRole('checkbox', { name: /^Noe av helsefraværet/ }).check();
    await page.getByLabel('Av dette: etter at grensen ble nådd').fill('3');
    await expect(page.locator('.fr-utfall-tittel')).toHaveText('Innenfor grensen');
    await expect(page.locator('.fr-sjekk-svar .merknad')).toContainText('1 av øktene');
    // Grunnene for dokumentert fravær kan åpnes under feltet.
    await page.getByRole('button', { name: 'Grunnene som gjelder' }).click();
    await expect(page.getByText(/b\. Velferd:/).first()).toBeVisible();
  });

  test('fagarket lenker til kalkulatoren med faget valgt, og kalkulatoren til steget om fravær', async ({ page }) => {
    await page.goto('./#/fag/ENG1007');
    await page.getByRole('button', { name: /^Vurderingsordning$/ }).click();
    await expect(page.locator('.fag-ifaget')).toContainText('Sentralt gitt');
    await page.getByRole('link', { name: 'Fraværskalkulatoren for faget' }).click();
    await expect(page).toHaveURL(/#\/vurdering\/fravaer\?fag=ENG1007$/);
    await expect(page.locator('main h1')).toHaveText('Fraværsgrensen');
    await page.getByRole('link', { name: /veiviseren «Grunnlag for vurdering»/ }).click();
    await expect(page.locator('.veiviser-stegtittel').last()).toHaveText('Fravær i faget');
    await page.getByRole('link', { name: 'kalkulatoren for fraværsgrensen' }).click();
    await expect(page.locator('main h1')).toHaveText('Fraværsgrensen');
  });

  test('eksamen: rutenettet, stien med datoer, og et kort som åpnes fra adressen', async ({ page }) => {
    await page.goto('./#/vurdering/eksamen?del=ek-tilrettelegging');
    await expect(page.locator('.tabell-rutenett th[scope="row"]')).toHaveCount(4);
    await expect(page.locator('.vu-sti-tall > li')).toHaveCount(6);
    // Datoene i stien kommer fra eksamensdatoene (data/eksamen/datoer.json), eller fra innholdet.
    await expect(page.locator('.vu-sti-naar').first()).toBeVisible();
    await expect(page.locator('#ek-tilrettelegging .innholdskort-knapp')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.samleboks .tabell-kort-rad')).toHaveCount(3);
  });

  test('Vestland-boksen på eksamen vises bare når Vestland er valgt', async ({ page }) => {
    await page.goto('./#/vurdering/eksamen');
    await expect(page.locator('#ek-vl-bortvisning')).toHaveCount(0);
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/vurdering/eksamen');
    await page.reload();
    await expect(page.locator('#ek-vl-bortvisning')).toBeVisible();
  });

  test('klage på karakter: halvårsvurdering gir ingen klagerett, og standpunkt går til statsforvalteren', async ({ page }) => {
    await page.goto('./#/vurdering/klage-pa-karakter');
    await page.getByRole('link', { name: 'Halvårsvurdering eller annen underveisvurdering' }).click();
    await expect(page.locator('.veiviser-stegtittel').last()).toHaveText('Ingen klagerett');
    await page.goto('./#/vurdering/klage-pa-karakter');
    await page.getByRole('link', { name: 'Standpunktkarakteren i et fag' }).click();
    await page.getByRole('link', { name: 'Nei, klagen sendes til statsforvalteren' }).click();
    await expect(page.locator('.veiviser-stegtittel').last()).toHaveText('Statsforvalteren avgjør');
    await expect(page.locator('[data-veiviserfarge="baer"]').first()).toBeVisible();
  });

  test('prøvene: blå bokser, stien og lenken til klage på prøven', async ({ page }) => {
    await page.goto('./#/vurdering/fag-og-svenneproven');
    await expect(page.locator('.tabell-bokser .tabell-kort-rad')).toHaveCount(3);
    await expect(page.locator('.vu-sti-tall > li')).toHaveCount(5);
    await page.getByRole('link', { name: /Klage på karakter/ }).first().click();
    await expect(page).toHaveURL(/steg=kl-prove&svar=prove$/);
  });

  test('tidslinjen: filteret står i adressen, og fylkets datoer vises når fylket er valgt', async ({ page }) => {
    await page.goto('./#/vurdering/eksamen-og-klage');
    await page.getByRole('link', { name: 'Privatister', exact: true }).click();
    await expect(page).toHaveURL(/vis=privatister$/);
    await expect(page.locator('.frist-kort .merke-fylke')).toHaveCount(0);
    await settLagret(page, { fylke: '32' });
    await page.reload();
    await expect(page.locator('.frist-kort .merke-fylke').first()).toBeVisible();
  });

  test('fagarket lenker til eksamen', async ({ page }) => {
    await page.goto('./#/fag/ENG1007');
    await page.getByText('Vurderingsordning', { exact: true }).first().click();
    await page.getByRole('link', { name: 'Eksamen: trekk, oppmelding og klage' }).click();
    await expect(page).toHaveURL(/#\/vurdering\/eksamen$/);
  });
});
