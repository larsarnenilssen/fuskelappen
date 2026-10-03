// Inntak (fase 5, pakke 1): veiviseren «Rett, inntak og søknad» med de nasjonale reglene, Vestland-innholdet som
// egne bokser når Vestland er valgt, merknaden om lokale regler og lenkene begge veier til særskilt språkopplæring.
import { expect, test } from '@playwright/test';
import { aapneSteg, erMobil, settLagret } from './hjelp.ts';

const VEIVISER = './#/inntak/rett-inntak-soknad';

test.describe('inntak', () => {
  test('fra oversikten gjennom rett og inntaksmåte til søknadsfristen', async ({ page }, info) => {
    await page.goto('./#/inntak');
    // Uten valgt fylke står bare de nasjonale reglene, med merknad.
    await expect(page.getByText('Viser de nasjonale reglene. Fylket kan ha lokale regler om inntak.')).toBeVisible();
    await page.getByRole('link', { name: /Rett, inntak og søknad/ }).click();
    const steg = page.locator('.veiviser-stegtittel');
    await expect(steg).toHaveText(['Grunnskolen']);

    await page.getByRole('link', { name: 'Ja, vitnemål fra norsk grunnskole' }).click();
    await page.getByRole('link', { name: 'Ja', exact: true }).click();
    await page.getByRole('link', { name: 'Nei', exact: true }).click();
    await page.getByRole('link', { name: 'Før skoleåret søkeren fyller 19' }).click();
    await expect(steg).toHaveText(['Ungdomsrett']);
    await page.getByRole('link', { name: 'Vg1', exact: true }).click();
    await expect(steg).toHaveText(['Inntaksmåte']);
    // Svarene står under overskriftene «Fortrinnsrett» og «Uten fortrinnsrett».
    await expect(page.locator('.veiviser-svargruppe-tittel')).toHaveText(['Fortrinnsrett', 'Uten fortrinnsrett']);
    await page.getByRole('group', { name: 'Uten fortrinnsrett' }).getByRole('link', { name: 'Konkurrerer på poeng' }).click();
    // Poeng, hvor søknaden sendes, og søknad, svar og klage står på samme side, der veien ender.
    await expect(page).toHaveURL(/steg=sk-poeng&svar=norsk\.ja\.nei\.under19\.vg1\.poeng$/);
    await expect(steg).toHaveText(['Konkurrerer på poeng', 'Hvor søknaden sendes', 'Søknad, svar og klage']);
    await expect(page.locator('.veiviser-stegnr').last()).toHaveText(/^Her ender veien · Søknad/);
    // Hvert steg står i sin egen ramme på siden.
    await expect(page.locator('.veiviser-side > .veiviser-steg')).toHaveCount(3);
    await expect(page.locator('.veiviser-steg').last()).toContainText('statsforvalteren');
    // På mobil viser «Veien hit» de siste valgene, og resten bak en knapp. På stor skjerm står veien i prosessen.
    if (erMobil(info)) {
      await page.getByRole('button', { name: /Vis hele veien/ }).click();
      await expect(page.locator('.veiviser-vei-punkt')).toHaveCount(6);
    }
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
    await aapneSteg(page.locator('.veiviser-steg').first());
    const boks = bokser.first();
    await expect(boks).toContainText('I Vestland');
    // Boksen er lukket til brukeren åpner den.
    const lenke = boks.getByRole('link', { name: /§ 2-1/ });
    await expect(lenke).toBeHidden();
    await boks.getByText('Inntaksområde, skoler og tilleggspoeng').click();
    await expect(lenke).toHaveAttribute('href', /#\/lov\/vestland-inntak\/2-1/);
    // Kildene til Vestland-boksen er med i kildene til steget.
    await expect(page.locator('.veiviser-steg').first().getByText(/Kilder \(7\)/)).toBeVisible();
    // Vestland-innholdet er ikke et eget steg i kartet.
    await expect(page.locator('.prosesskart-punkt', { hasText: 'Inntaksområde' })).toHaveCount(0);
  });

  test('lenkene begge veier mellom inntak og særskilt språkopplæring', async ({ page }) => {
    await page.goto(`${VEIVISER}?steg=sk-utland&svar=utland`);
    await aapneSteg(page.locator('.veiviser-steg').first());
    await page.locator('.veiviser-steg').getByRole('link', { name: 'særskilt språkopplæring og kort botid' }).click();
    await expect(page.locator('.veiviser-stegtittel').last()).toHaveText('Elever med kort botid');
    await page.locator('.veiviser-steg').last().getByRole('button', { name: 'Mer om dette steget' }).click();
    await page.getByRole('link', { name: 'Rett, inntak og søknad' }).click();
    await expect(page.locator('.veiviser-stegtittel').first()).toHaveText('Grunnopplæring i utlandet');
  });
});

// Fase 5, pakke 2: tidslinjen med fristene gjennom året (avgjørelse 046).
test.describe('frister ved inntak', () => {
  test('fra oversikten til tidslinjen, med filter og en frist som åpnes', async ({ page }) => {
    await page.goto('./#/inntak');
    const kort = page.locator('.frist-inngang', { hasText: 'Neste frist' });
    await expect(kort).toBeVisible();
    await kort.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Søknad og frister gjennom året');
    // Stripen har alle tolv månedene, fra oktober.
    await expect(page.locator('.frist-stripe > li')).toHaveCount(12);
    await expect(page.locator('.frist-stripe-navn').first()).toHaveText(/okt/i);
    // Uten valgt fylke er det ingen Vestland-frister.
    await expect(page.locator('.frist-kort-lokal')).toHaveCount(0);
    // Et trykk på mars går til måneden.
    await page.locator('.frist-stripe-celle', { hasText: /mar/i }).click();
    await expect(page.locator('#frister-3')).toBeFocused();
    // Fristen er lukket til den åpnes.
    const mars = page.locator('.frist-kort', { hasText: 'Søknadsfrist' }).filter({ hasText: '1. mars' });
    await expect(mars.locator('.frist-kort-innhold')).toBeHidden();
    await mars.locator('.frist-kort-topp').click();
    await expect(mars.locator('.frist-kort-innhold')).toContainText('første virkedag');
    // Regelverket og kildene er lukket til de åpnes, som i veiviserne.
    await expect(mars.getByRole('link', { name: /§ 4-9/ })).toBeHidden();
    await mars.getByText(/I regelverket \(2\)/).click();
    await expect(mars.getByRole('link', { name: /§ 4-9/ })).toBeVisible();
    // Filteret for voksne viser bare frister for voksne og frister som gjelder alle.
    await page.getByRole('link', { name: 'Voksne', exact: true }).click();
    await expect(page).toHaveURL(/vis=voksne$/);
    await expect(page.locator('.frist-kort-tittel')).toHaveText(['Voksne søker når som helst', 'Klage på vedtaket om inntak']);
  });

  test('med Vestland valgt kommer fylkets frister med', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/inntak/frister?vis=voksne');
    await expect(page.locator('.frist-kort-tittel')).toHaveText([
      'Voksne søker når som helst',
      'Voksne bør søke for oppstart om våren',
      'Voksne bør søke for oppstart om høsten',
      'Klage på vedtaket om inntak',
    ]);
    await expect(page.locator('.frist-kort-lokal')).toHaveCount(2);
    await expect(page.locator('.frist-tegn')).toContainText('Vestland');
  });
});

// Fase 5, pakke 3: poengberegningen (avgjørelse 047). Karakterene er fra fasittest F1.
test.describe('poengberegning ved inntak', () => {
  test('Vg1: fagene fra grunnskolen gir poengsummen med utregningen', async ({ page }) => {
    await page.goto('./#/inntak');
    await page.locator('.frist-inngang', { hasText: 'Poengberegning' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Poengberegning');
    await expect(page.locator('.poeng-tomt')).toBeVisible();
    const karakterer = [5, 4, 4, 3, 4, 5, 5, 4, 5, 5, 4, 5];
    const fag = page.locator('.skjemadel').first().locator('select.poeng-velger');
    await expect(fag).toHaveCount(13);
    for (const [i, k] of karakterer.entries()) await fag.nth(i).selectOption(String(k));
    const eksamen = page.locator('.skjemadel').nth(1).locator('select.poeng-velger');
    await eksamen.nth(0).selectOption('4');
    await eksamen.nth(1).selectOption('5');
    await expect(page.locator('.resultatkort-verdi')).toHaveText('44,3');
    await page.getByRole('button', { name: 'Vis utregning' }).click();
    await expect(page.locator('.utregning')).toContainText('14, sum 62');
    await expect(page.locator('.utregning')).toContainText('4,43');
    // Uten valgt fylke er det ingen tilleggspoeng.
    await expect(page.locator('.skjemadel[data-del="lonn"]')).toHaveCount(0);
    // Fritak i mer enn halvparten av fagene: individuell behandling i stedet for poeng.
    for (let i = 0; i < 7; i++) await fag.nth(i).selectOption('fritak');
    await expect(page.locator('.kalkulator-resultat .merknad')).toContainText('§ 4-20');
  });

  test('Vg3: den beste av to karakterer teller, og Vestland gir tilleggspoeng til Vg1', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/inntak/poeng?trinn=vg3');
    const rader = page.locator('.poeng-rad');
    await rader.nth(0).locator('select.poeng-velger').selectOption('4');
    await rader.nth(1).locator('select.poeng-velger').selectOption('3');
    await expect(page.locator('.resultatkort-verdi')).toHaveText('35,0');
    await rader.nth(1).locator('.poeng-annen-knapp').click();
    await rader.nth(1).locator('.poeng-annen select').selectOption('5');
    await expect(page.locator('.resultatkort-verdi')).toHaveText('45,0');
    // Til Vg1 i Vestland kan søkeren få tilleggspoeng.
    await page.getByRole('link', { name: 'Vg1', exact: true }).click();
    await page.locator('.skjemadel').first().locator('select.poeng-velger').first().selectOption('4');
    await page.locator('.skjemadel[data-del="lonn"] select').selectOption('tilleggspoeng_idrett_2');
    await expect(page.locator('.resultatkort-verdi')).toHaveText('46,0');
  });

  test('Vg3: et løp fyller inn fagene med standpunkt og halvår, og blankt ark tømmer radene', async ({ page }) => {
    await page.goto('./#/inntak/poeng?trinn=vg3');
    await expect(page.locator('#poeng-lop1')).toBeEnabled();
    await page.locator('#poeng-lop1').selectOption('HS');
    await page.locator('#poeng-lop2').selectOption('Helsearbeiderfag');
    const navn = page.locator('.poeng-rad-navn');
    await expect(navn.first()).toHaveText('Matematikk');
    await expect(navn).toContainText(['Kroppsøving', 'Helsefremmende arbeid', 'Yrkesliv i helsearbeiderfag']);
    // Kroppsøving på Vg1 yrkesfag fortsetter på Vg2 og har halvår.
    const kroppsoving = page.locator('.poeng-rad', { has: page.locator('.poeng-rad-navn', { hasText: 'Kroppsøving' }) }).first();
    await expect(kroppsoving.locator('select.poeng-type')).toHaveValue('halvar');
    await page.locator('#poeng-lop1').selectOption('');
    await expect(navn).toHaveCount(0);
  });
});
