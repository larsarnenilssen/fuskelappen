// Favorittene og forsiden (avgjørelse 056): favorittene står øverst på forsiden og sorteres der de står, gruppene kan
// lukkes og sorteres, og forsiden kan vise bare favorittene under kategoriene sine.
import { expect, test } from '@playwright/test';
import { ruter, settLagret, venterPaaSide } from './hjelp.ts';

const TO = ['testmodul:funksjon', 'begreper:testbegrep-skolemiljo'];

test.describe('favoritter og forsiden', () => {
  test('kan legges til, vises på forsiden med ikon og stjernemerke, og fjernes', async ({ page }) => {
    await page.goto('./#/testmodul');
    const stjerne = page.getByRole('button', { name: /Legg til i favoritter/ });
    await expect(stjerne).toHaveAttribute('aria-pressed', 'false');
    await stjerne.click();
    await expect(stjerne).toHaveAttribute('aria-pressed', 'true');

    await page.goto('./');
    const lenke = page.locator('.favorittliste').getByRole('link', { name: 'Testfunksjon' });
    await expect(lenke).toBeVisible();
    await expect(lenke.locator('.favorittmerke')).toHaveCount(1);
    await page.goto('./#/testmodul');
    await page.getByRole('button', { name: /Legg til i favoritter/ }).click();
    await page.goto('./');
    await expect(page.getByText('Du har ingen favoritter ennå.', { exact: false })).toBeVisible();
  });

  test('rekkefølgen endres med blyanten i overskriften, og står der favorittene står', async ({ page }) => {
    await settLagret(page, { favoritter: TO });
    await page.goto('./');
    const titler = page.locator('[data-gruppe="favoritter"] .listelenke-tittel');
    await expect(titler).toHaveText(['Testfunksjon', 'Skolemiljø (testbegrep)']);
    const blyant = page.getByRole('button', { name: 'Endre rekkefølgen i Favoritter' });
    await blyant.click();
    await expect(page.getByRole('button', { name: 'Flytt «Testfunksjon» opp' })).toBeDisabled();
    await page.getByRole('button', { name: 'Flytt «Testfunksjon» ned' }).click();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    await expect(titler).toHaveText(['Skolemiljø (testbegrep)', 'Testfunksjon']);
    await page.reload();
    await expect(titler).toHaveText(['Skolemiljø (testbegrep)', 'Testfunksjon']);
  });

  test('en gruppe lukkes med overskriften og viser hva som er inni, og det huskes', async ({ page }) => {
    await page.goto('./');
    const knapp = page.locator('[data-gruppe="skolemiljo"] .gruppeknapp');
    await expect(knapp).toHaveAttribute('aria-expanded', 'true');
    await knapp.click();
    await expect(knapp).toHaveAttribute('aria-expanded', 'false');
    await expect(knapp.locator('.gruppe-sammendrag')).toHaveText('Testmodul for skolemiljø');
    await expect(page.locator('#forside-gruppe-skolemiljo')).toBeHidden();
    await page.reload();
    await expect(knapp).toHaveAttribute('aria-expanded', 'false');
  });

  test('«Bare favoritter» viser favorittene under kategoriene, uten favorittgruppen og uten stjernemerke', async ({ page }) => {
    await settLagret(page, { favoritter: TO });
    await page.goto('./');
    await page.getByRole('radio', { name: /Favoritter|Bare favoritter/ }).check();
    await expect(page.locator('[data-gruppe="favoritter"]')).toHaveCount(0);
    await expect(page.locator('[data-gruppe="skolemiljo"]').getByRole('link', { name: 'Testfunksjon' })).toBeVisible();
    await expect(page.locator('[data-gruppe="felles"]').getByRole('link', { name: 'Skolemiljø (testbegrep)' })).toBeVisible();
    await expect(page.locator('.favorittmerke')).toHaveCount(0);
  });

  test('«Tilpass» flytter gruppene, og standard rekkefølge setter dem tilbake', async ({ page }) => {
    await page.goto('./');
    const grupper = page.locator('.forsidegruppe');
    await expect(grupper.first()).toHaveAttribute('data-gruppe', 'favoritter');
    await page.getByRole('button', { name: 'Tilpass' }).click();
    await page.getByRole('button', { name: 'Flytt «Favoritter» ned' }).click();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    await expect(grupper.first()).not.toHaveAttribute('data-gruppe', 'favoritter');
    await expect(grupper.nth(1)).toHaveAttribute('data-gruppe', 'favoritter');
    await page.getByRole('button', { name: 'Tilpass' }).click();
    await page.getByRole('button', { name: /Standard rekkefølge/ }).click();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    await expect(grupper.first()).toHaveAttribute('data-gruppe', 'favoritter');
  });

  test('søkeknappen kommer i toppfeltet når søket er rullet bort, og fører tilbake til søkefeltet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 500 });
    await page.goto('./');
    const knapp = page.locator('.topplinje').getByRole('button', { name: 'Søk' });
    await expect(knapp).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(knapp).toBeVisible();
    await knapp.click();
    await expect(page.locator('.forside-topp').getByRole('searchbox')).toBeFocused();
  });

  test('en skole i skoleregisteret får en diskré stjerne, og favoritten åpner skolen med ikonet til skoleregisteret (avgjørelse 058)', async ({ page }) => {
    await page.goto('./#/opplaeringslop/skoler?fylke=46');
    // Skoler uten skolenummer har ingen stjerne.
    const kort = page.locator('.skolekort', { has: page.locator('.favorittknapp-liten') }).first();
    const navn = (await kort.locator('.listelenke-tittel').textContent()) ?? '';
    const stjerne = kort.locator('.favorittknapp-liten');
    await expect(stjerne).toHaveAttribute('aria-pressed', 'false');
    await stjerne.click();
    await expect(stjerne).toHaveAttribute('aria-pressed', 'true');
    // Stjernen åpner ikke kortet.
    await expect(kort.locator('.skolekort-knapp')).toHaveAttribute('aria-expanded', 'false');
    await page.goto('./');
    const lenke = page.locator('.favorittliste').getByRole('link', { name: navn });
    await expect(lenke).toBeVisible();
    await expect(lenke.locator('.favorittikon > .ikon').first()).toHaveAttribute('data-ikon', 'skole');
    await lenke.click();
    await expect(page.locator('.skolekort')).toHaveCount(1);
    await expect(page.locator('.skolekort-knapp .listelenke-tittel')).toHaveText(navn);
  });

  test('en paragraf og et opplæringskontor kan favorittmerkes med den diskré stjernen (avgjørelse 058)', async ({ page }) => {
    await page.goto('./#/lov/opplaeringslova/11-1');
    await page.locator('[data-rubrikk="lov-11-1"] .favorittknapp-liten').click();
    await page.goto('./#/opplaeringslop/opplaeringskontor?fylke=46');
    const kontor = page.locator('.kontorliste .kontor').first();
    const navn = (await kontor.locator('.listelenke-tittel').textContent()) ?? '';
    await kontor.locator('.favorittknapp-liten').click();
    await page.goto('./');
    await expect(page.locator('.favorittliste').getByRole('link', { name: /^§ 11-1/ })).toBeVisible();
    await page.locator('.favorittliste').getByRole('link', { name: navn }).click();
    await expect(page.locator('.kontorliste .kontor')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Fjern' })).toBeVisible();
  });
});

// Alle sidene i appen har stjernen ved overskriften (avgjørelse 058), bortsett fra appens egne sider, sidene som
// ikke finnes, og utgåtte fagkoder. En ny side i rutelisten blir sjekket her også.
const UTEN_STJERNE = /^#\/(sok|innstillinger|om|kategori|utvikling|finnes-ikke)|^#\/$|^#\/fag\/(FINNES0|LBR3004)/;
test.describe('alle sider kan stjernemerkes', () => {
  for (const rute of ruter.filter((r) => !UTEN_STJERNE.test(r))) {
    test(rute, async ({ page }) => {
      await page.goto(`./${rute}`);
      await venterPaaSide(page);
      await expect(page.locator('main .tittelrad').first().locator('.favorittknapp:not(.favorittknapp-liten)')).toHaveCount(1);
    });
  }
});
