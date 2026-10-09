import { expect, test } from '@playwright/test';
import { ruter, settLagret, venterPaaSide } from './hjelp.ts';

test.describe('navigasjon', () => {
  test('forsiden har søk, favoritter og moduler', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('searchbox')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Favoritter' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Hovedmeny' })).toBeVisible();
    await expect(page).toHaveTitle('Jukselappen');
  });

  test('toppfeltet har søk og innstillinger, appnavnet fører hjem, og nettleserens tilbake virker (avgjørelse 056)', async ({ page }) => {
    await page.goto('./');
    const meny = page.getByRole('navigation', { name: 'Hovedmeny' });
    // Søket står på forsiden, så toppfeltet har ikke søkeknappen der.
    await expect(meny.getByRole('button', { name: 'Søk' })).toHaveCount(0);
    await meny.getByRole('link', { name: 'Innstillinger' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillinger' })).toBeVisible();
    await expect(meny.getByRole('button', { name: 'Innstillinger' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveTitle('Innstillinger – Jukselappen');
    // Søket åpnes over siden (eier 05.10.2026). Tilbake lukker det og viser siden igjen.
    await meny.getByRole('button', { name: 'Søk' }).click();
    await expect(page.getByRole('searchbox')).toBeFocused();
    // Siden står bak søket, men kan ikke brukes mens søket er åpent.
    await expect(page.locator('main')).toHaveAttribute('inert', '');
    await expect(page).toHaveURL(/#\/innstillinger$/);
    await page.goBack();
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillinger' })).toBeVisible();
    await expect(page.getByRole('searchbox')).toHaveCount(0);
    await page.locator('.topplinje .appnavn').click();
    await expect(page).toHaveURL(/#\/$/);
    await expect(page.locator('.bunnmeny')).toHaveCount(0);
  });

  test('en feil i en side gir en melding i stedet for en blank side, og toppfeltet virker (avgjørelse 097)', async ({ page }) => {
    // Testmodulen kaster en feil med ?feil=1 (tests/fixtures/moduler/testmodul).
    await page.goto('./#/testmodul?feil=1');
    await expect(page.getByRole('heading', { level: 1, name: 'Noe gikk galt' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Last siden på nytt' })).toBeVisible();
    // Toppfeltet står utenfor feilgrensen.
    const meny = page.getByRole('navigation', { name: 'Hovedmeny' });
    await expect(meny.getByRole('link', { name: 'Innstillinger' })).toBeVisible();
    // Feilen nullstilles når adressen endres: samme side uten feilen vises.
    await page.evaluate(() => (window.location.hash = '#/testmodul'));
    await expect(page.getByRole('heading', { level: 1, name: 'Testmodul for skolemiljø' })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('heading', { level: 1, name: 'Noe gikk galt' })).toBeVisible();
    await page.getByRole('link', { name: 'Til forsiden' }).click();
    await expect(page).toHaveURL(/#\/$/);
    await expect(page.getByRole('searchbox')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Noe gikk galt' })).toHaveCount(0);
  });

  test('gamle lenker til favorittsiden går til forsiden (avgjørelse 056)', async ({ page }) => {
    await page.goto('./#/favoritter');
    await expect(page).toHaveURL(/#\/$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Favoritter' })).toBeVisible();
  });

  test('tilbakeknappen i topplinjen går tilbake', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('link', { name: 'Om appen' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Om appen' })).toBeVisible();
    await page.getByRole('button', { name: 'Tilbake' }).click();
    await expect(page).toHaveURL(/\/jukselappen\/(#\/)?$/);
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test('tilbakeknappen går til forsiden når siden ble åpnet direkte', async ({ page }) => {
    await page.goto('./#/om');
    await venterPaaSide(page);
    await page.getByRole('button', { name: 'Tilbake' }).click();
    await expect(page).toHaveURL(/#\/$/);
  });

  test('ukjent side gir tydelig melding', async ({ page }) => {
    await page.goto('./#/finnes-ikke');
    await expect(page.getByRole('heading', { level: 1, name: 'Fant ikke siden' })).toBeVisible();
    await page.getByRole('link', { name: 'Til forsiden' }).click();
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test('gjenoppretter scrollposisjon ved tilbake', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 400 });
    await page.goto('./#/om');
    await venterPaaSide(page);
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(100);
    await page.getByRole('link', { name: 'Se alle kilder og kildestatus' }).click();
    await venterPaaSide(page);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.goBack();
    await venterPaaSide(page);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(250);
  });

  test('pinch-zoom er ikke slått av', async ({ page }) => {
    await page.goto('./');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).not.toMatch(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/);
  });

  test('topplinjen viser appnavnet uten logo (eier 02.10.2026)', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('.topplinje .appnavn')).toHaveText('Jukselappen');
    await expect(page.locator('.topplinje img')).toHaveCount(0);
  });

  test('overskriften får fokus uten synlig ramme ved navigasjon', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('navigation', { name: 'Hovedmeny' }).getByRole('link', { name: 'Innstillinger' }).click();
    const h1 = page.getByRole('heading', { level: 1, name: 'Innstillinger' });
    await expect(h1).toBeFocused();
    expect(await h1.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('none');
  });

  for (const tema of ['lys', 'mork'] as const) {
    test(`lerretet har toppfarge bak statuslinjen og sidefarge nederst (${tema})`, async ({ page }) => {
      await settLagret(page, { tema });
      await page.goto('./');
      // Vent til appen har tegnet skallet og topplinjen. Ellers kan fargene leses før elementene finnes.
      await expect(page.locator('.skall')).toBeVisible();
      await expect(page.locator('.topplinje')).toBeVisible();
      const farger = await page.evaluate(() => {
        const stil = (el: Element) => getComputedStyle(el);
        return {
          htmlFarge: stil(document.documentElement).backgroundColor,
          htmlBilde: stil(document.documentElement).backgroundImage,
          bodyFarge: stil(document.body).backgroundColor,
          side: stil(document.querySelector('.skall') as Element).backgroundColor,
          topp: stil(document.querySelector('.topplinje') as Element).backgroundColor,
        };
      });
      // iOS tar fargen bak statuslinjen fra bakgrunnsfargen til html og body.
      expect(farger.htmlFarge).toBe(farger.topp);
      expect(farger.bodyFarge).toBe(farger.topp);
      // Nederst har lerretet sidefargen, siden bunnmenyen er tatt bort (avgjørelse 056).
      expect(farger.htmlBilde).toContain(farger.side);
      expect(farger.side).not.toBe(farger.topp);
    });
  }
});

// Alle sider har stien øverst, unntatt forsiden og sidene rett under den: oversiktene i modulene, kategoriene, søket,
// innstillingene og Om appen (eier 05.10.2026). Overordnet del åpnes på oversikten i Læreplanverket, og testsidene og
// siden som ikke finnes, står utenfor. Nye sider kommer med av seg selv, fordi hver rute har en adresse i hjelp.ts.
const UTEN_STI = /^#\/[^/?]*(\?.*)?$|^#\/(kategori|utvikling|laereplanverket\/overordnet-del)\//;
test.describe('alle sider under en modul har sti øverst', () => {
  for (const rute of ruter.filter((r) => !UTEN_STI.test(r))) {
    test(rute, async ({ page }) => {
      await page.goto(`./${rute}`);
      await venterPaaSide(page);
      await expect(page.locator('main nav.brodsmuler').first()).toBeVisible();
    });
  }
});

test.describe('innstillingsknappen i toppfeltet (eier 09.10.2026)', () => {
  test('i Innstillinger er den gul og fører tilbake til siden brukeren kom fra', async ({ page }) => {
    await page.goto('./#/fylker/46');
    await expect(page.locator('main h1')).toHaveText('Vestland fylkeskommune');
    const meny = page.getByRole('navigation', { name: 'Hovedmeny' });
    await meny.getByRole('link', { name: 'Innstillinger' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillinger' })).toBeVisible();
    await meny.getByRole('button', { name: 'Innstillinger' }).click();
    await expect(page.locator('main h1')).toHaveText('Vestland fylkeskommune');
    await expect(meny.getByRole('link', { name: 'Innstillinger' })).toBeVisible();
  });

  test('kom brukeren rett til Innstillinger, fører den til forsiden', async ({ page }) => {
    await page.goto('./#/innstillinger');
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillinger' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Hovedmeny' }).getByRole('button', { name: 'Innstillinger' }).click();
    await expect(page.getByTestId('forbehold')).toBeVisible();
  });
});

test.describe('søket fra toppfeltet (eier 05.10.2026)', () => {
  test('åpnes over siden, og Esc viser siden der brukeren var, uten egen knapp for å lukke (eier 09.10.2026)', async ({ page }) => {
    await page.goto('./#/fylker/46');
    await expect(page.locator('main h1')).toHaveText('Vestland fylkeskommune');
    // Rull først når siden er lastet, så posisjonen ikke flyttes av innhold som kommer etterpå.
    await venterPaaSide(page);
    await page.evaluate(() => window.scrollTo(0, 400));
    const y = await page.evaluate(() => window.scrollY);
    // Et vanlig trykk i Playwright ruller først knappen inn i bildet. En person som trykker, ruller ikke siden.
    await page.locator('.topplinje').getByRole('button', { name: 'Søk' }).dispatchEvent('click');
    await expect(page.getByRole('searchbox')).toBeFocused();
    await expect(page.getByRole('dialog', { name: 'Søk' }).getByRole('button', { name: /Lukk/ })).toHaveCount(0);
    // Esc lyttes etter når søket er åpnet, ikke i samme øyeblikk som trykket.
    await page.keyboard.press('Escape');
    await expect(page.getByRole('searchbox')).toHaveCount(0);
    await expect(page.locator('main h1')).toHaveText('Vestland fylkeskommune');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  });

  test('siden står synlig bak søket, og et trykk utenfor lukker det der brukeren var', async ({ page }) => {
    await page.goto('./#/fylker/46');
    await venterPaaSide(page);
    await page.evaluate(() => window.scrollTo(0, 300));
    const y = await page.evaluate(() => window.scrollY);
    await page.locator('.topplinje').getByRole('button', { name: 'Søk' }).dispatchEvent('click');
    await expect(page.getByRole('searchbox')).toBeFocused();
    await expect(page.locator('main h1')).toBeVisible();
    // Siden bak kan ikke nås med tastatur mens søket er åpent.
    await expect(page.locator('main')).toHaveAttribute('inert', '');
    const vindu = page.viewportSize();
    await page.mouse.click((vindu?.width ?? 400) / 2, (vindu?.height ?? 800) - 10);
    await expect(page.getByRole('searchbox')).toHaveCount(0);
    await expect(page.locator('main')).not.toHaveAttribute('inert', '');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  });

  test('tilbake fra et treff viser søket igjen, og tilbake en gang til viser siden', async ({ page }) => {
    await page.goto('./#/om');
    await page.locator('.topplinje').getByRole('button', { name: 'Søk' }).click();
    await page.getByRole('searchbox').fill('årsramme');
    await page.locator('.sokeresultater a').first().click();
    await expect(page).not.toHaveURL(/#\/om$/);
    await page.goBack();
    await expect(page.getByRole('searchbox')).toHaveValue('årsramme');
    await page.goBack();
    await expect(page.getByRole('searchbox')).toHaveCount(0);
    await expect(page.locator('main h1')).toHaveText('Om appen');
  });

  test('med valgt fylke viser søket bare skolene i fylket, til knappen med fylket slås av', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/om');
    await page.locator('.topplinje').getByRole('button', { name: 'Søk' }).click();
    await page.getByRole('searchbox').fill('videregående skole');
    const fylke = page.locator('.sokefilter-fylke');
    await expect(fylke).toHaveText('Vestland');
    await expect(fylke).toHaveAttribute('aria-pressed', 'true');
    const status = page.locator('.toppsok .sokestatus');
    const iFylket = Number((await status.textContent())?.match(/\d+/)?.[0]);
    await fylke.click();
    await expect(fylke).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(async () => Number((await status.textContent())?.match(/\d+/)?.[0])).toBeGreaterThan(iFylket);
  });
});

