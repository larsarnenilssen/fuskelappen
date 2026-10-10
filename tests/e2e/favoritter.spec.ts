// Favorittene og forsiden (avgjørelse 056): favorittene står øverst på forsiden og sorteres der de står, gruppene kan
// lukkes og sorteres, og forsiden kan vise bare favorittene under kategoriene sine.
import { expect, test } from '@playwright/test';
import { erMobil, ruter, settLagret, venterPaaSide } from './hjelp.ts';

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
    await expect(knapp.locator('.gruppe-sammendrag')).toHaveText('Aktivitetsplikt og skoleregler, Elevundersøkelsen, Testmodul for skolemiljø');
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
    // Uten kalenderen som favoritt står ikke kalenderen i favorittvisningen.
    await expect(page.locator('[data-gruppe="neste"]')).toHaveCount(0);
  });

  test('skrivebord: lukkede grupper rykker opp ved siden av en åpen, og en ny rad har overskriftene på linje (avgjørelse 108)', async ({ page }, info) => {
    test.skip(erMobil(info), 'Spaltene er bare på skrivebord.');
    await settLagret(page, { forside: { rekkefolge: [], lukket: ['fag', 'elev'], bareFavoritter: false } });
    await page.goto('./');
    await venterPaaSide(page);
    const boks = async (id: string) => {
      const b = await page.locator(`.forsidegrupper > [data-gruppe="${id}"]`).boundingBox();
      if (!b) throw new Error(`Fant ikke ${id}`);
      return b;
    };
    // Inntak (åpen) står ved siden av Læreplanverket (lukket), og Elever og opplæring (lukket) rykker opp under.
    await expect(page.locator('.forsidegrupper.spalteoppsett')).toHaveCount(1);
    const inntak = await boks('inntak');
    const fag = await boks('fag');
    const elev = await boks('elev');
    const skolemiljo = await boks('skolemiljo');
    const arbeidstid = await boks('arbeidstid');
    expect(Math.round(fag.y)).toBe(Math.round(inntak.y));
    expect(Math.round(elev.x)).toBe(Math.round(fag.x));
    expect(Math.round(elev.y)).toBe(Math.round(fag.y + fag.height));
    // Neste rad begynner under den høyeste i raden, med overskriftene på linje.
    expect(Math.round(skolemiljo.y)).toBe(Math.round(arbeidstid.y));
    expect(skolemiljo.y).toBeGreaterThanOrEqual(inntak.y + inntak.height - 1);
  });

  test('alle favorittene er like høye, også kalkulatorene og oppslagene, med alt innhold og med bare favoritter (eier 10.10.2026)', async ({ page }) => {
    const favoritter = ['arbeidstid:arbeidsplan', 'arbeidstid:beskjeftigelse', 'vurdering:fravaer', 'begreper:arsramme', ...TO];
    await settLagret(page, { favoritter });
    await page.goto('./');
    await venterPaaSide(page);
    const hoyder = async () => {
      const rader = page.locator('.favorittliste > li > .listelenke');
      await expect(rader).toHaveCount(favoritter.length);
      return new Set(await rader.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height))));
    };
    expect([...(await hoyder())]).toHaveLength(1);
    await page.getByRole('radio', { name: /Favoritter|Bare favoritter/ }).check();
    await expect(page.locator('[data-gruppe="arbeidstid"]').getByRole('link', { name: 'Arbeidsplan' })).toBeVisible();
    expect([...(await hoyder())]).toHaveLength(1);
  });

  test('«Tilpass» flytter gruppene, og standard rekkefølge setter dem tilbake', async ({ page }) => {
    // Én kolonne, som på mobil. På skrivebord står favorittene i sidekolonnen (testen under).
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('./');
    // Aktuelt med kalenderen, nyhetene og tallene står først (avgjørelse 081 og 102), og favorittene som nummer to.
    const grupper = page.locator('.forsidegruppe');
    await expect(grupper.nth(0)).toHaveAttribute('data-gruppe', 'panel');
    await expect(grupper.nth(1)).toHaveAttribute('data-gruppe', 'favoritter');
    await page.getByRole('button', { name: 'Tilpass' }).click();
    await page.getByRole('button', { name: 'Flytt «Favoritter» ned' }).click();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    await expect(grupper.nth(1)).not.toHaveAttribute('data-gruppe', 'favoritter');
    await expect(grupper.nth(2)).toHaveAttribute('data-gruppe', 'favoritter');
    await page.getByRole('button', { name: 'Tilpass' }).click();
    await page.getByRole('button', { name: /Standard rekkefølge/ }).click();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    await expect(grupper.nth(1)).toHaveAttribute('data-gruppe', 'favoritter');
  });

  test('skrivebord: Aktuelt og favorittene i sidekolonnen, som står fast, uten bryter (eier 05.10.2026, avgjørelse 102)', async ({ page }) => {
    await settLagret(page, { favoritter: TO });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./');
    const kolonne = page.locator('.forside-sidekolonne');
    await expect(kolonne.locator('[data-gruppe="favoritter"]')).toBeVisible();
    await expect(kolonne.locator('[data-gruppe="panel"]')).toBeVisible();
    await expect(page.locator('.forside-oppsett > .forsidegrupper [data-gruppe="favoritter"]')).toHaveCount(0);
    // Kolonnen står fast under toppfeltet når siden rulles.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const fast = await kolonne.evaluate((e) => Math.round(parseFloat(getComputedStyle(e).top)));
    // Høyden på kolonnen regnes ut på nytt i neste bilde etter rullingen (Sidekolonne i Forside.tsx), så kolonnen
    // står fast først da. I WebKit kan den stå et par piksler høyere før det.
    await expect.poll(() => kolonne.evaluate((e) => Math.round(e.getBoundingClientRect().top))).toBe(fast);
    // Bryteren som slo av kolonnen, er tatt bort (avgjørelse 102).
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.getByRole('switch', { name: 'Sidekolonne' })).toHaveCount(0);
    // I «Tilpass» har kolonnen en egen del.
    await page.getByRole('button', { name: 'Tilpass' }).click();
    await expect(page.getByRole('heading', { name: 'Sidekolonnen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Flytt «Favoritter» opp' })).toBeVisible();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    // Smalt vindu: alt i én kolonne.
    await page.setViewportSize({ width: 600, height: 800 });
    await expect(page.locator('.forside-sidekolonne')).toHaveCount(0);
    await expect(page.locator('.forsidegruppe').first()).toHaveAttribute('data-gruppe', 'panel');
  });

  test('«Bare favoritter»: kalenderen som favoritt står øverst som gruppen «Kalender», ikke som kort (eier 05.10.2026)', async ({ page }) => {
    await settLagret(page, { favoritter: ['kalender:oversikt', ...TO] });
    await page.goto('./');
    await page.getByRole('radio', { name: /Favoritter|Bare favoritter/ }).check();
    const kalender = page.locator('.forsidegruppe').first();
    await expect(kalender).toHaveAttribute('data-gruppe', 'neste');
    // Samme navn som fanen i Aktuelt (eier 10.10.2026).
    await expect(kalender.locator('.gruppe-tittel')).toHaveText('Kalender');
    await expect(page.locator('.forsidegruppe:not([data-gruppe="neste"])').getByRole('link', { name: 'Kalender', exact: true })).toHaveCount(0);
  });

  test('«Bare favoritter»: krysset på kalenderen, nyhetene og tallene fjerner favoritten, etter kortet som spør (eier 10.10.2026)', async ({ page }) => {
    await settLagret(page, { favoritter: ['kalender:oversikt', 'nyheter:oversikt', 'statistikk:oversikt', ...TO], forside: { rekkefolge: [], lukket: [], bareFavoritter: true } });
    await page.goto('./');
    await expect(page.locator('[data-gruppe="nyheter"]')).toHaveCount(1);
    await expect(page.locator('[data-gruppe="itall"]')).toHaveCount(1);
    const kalender = page.locator('[data-gruppe="neste"]');
    await kalender.getByRole('button', { name: 'Fjern Kalender fra favorittene' }).click();
    await expect(kalender.getByText('Du får den tilbake med stjernen øverst på siden.')).toBeVisible();
    await kalender.getByRole('button', { name: 'Fjern fra favorittene', exact: true }).click();
    await expect(kalender).toHaveCount(0);
    // De andre står, og kalenderen er ikke lenger favoritt med alt innhold heller.
    await expect(page.locator('[data-gruppe="nyheter"]')).toHaveCount(1);
    await page.getByRole('radio', { name: /^Alt/ }).check();
    await expect(page.locator('[data-gruppe="favoritter"]').getByRole('link', { name: 'Kalender', exact: true })).toHaveCount(0);
    await expect(page.locator('[data-gruppe="favoritter"]').getByRole('link', { name: 'Videregående i tall' })).toHaveCount(1);
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
// ikke finnes, og utgåtte fagkoder. Favoritten skal også finnes på forsiden, så en side med stjerne uten oppføring i
// modulens `favorittbare` blir fanget opp. Har siden diskré stjerner (skoler, paragrafer), sjekkes den første som
// vises, på samme måte. En enhetstest sjekker at hver rute i modulene har en adresse i listen (register.test.ts).
const UTEN_STJERNE = /^#\/(sok|innstillinger|om|kategori|utvikling|finnes-ikke)|^#\/$|^#\/fag\/(FINNES0|LBR3004)/;
test.describe('alle sider kan stjernemerkes, og favorittene finnes på forsiden', () => {
  for (const rute of ruter.filter((r) => !UTEN_STJERNE.test(r))) {
    test(rute, async ({ page }) => {
      await page.goto(`./${rute}`);
      await venterPaaSide(page);
      const stjerne = page.locator('main .tittelrad').first().locator('.favorittknapp:not(.favorittknapp-liten)');
      await expect(stjerne).toHaveCount(1);
      await stjerne.click();
      await expect(stjerne).toHaveAttribute('aria-pressed', 'true');
      const diskre = page.locator('main .favorittknapp-liten').filter({ visible: true }).first();
      const antall = (await diskre.count()) > 0 ? 2 : 1;
      if (antall === 2) {
        await diskre.click();
        await expect(diskre).toHaveAttribute('aria-pressed', 'true');
      }
      await page.goto('./');
      await expect(page.locator('.favorittliste .favoritt')).toHaveCount(antall);
      await expect(page.locator('.favorittliste a.listelenke')).toHaveCount(antall);
      await expect(page.locator('.favorittliste .utilgjengelig')).toHaveCount(0);
    });
  }
});
