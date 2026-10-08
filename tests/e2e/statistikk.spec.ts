// Videregående i tall (eier 07.10.2026, avgjørelse 080, 090 og 091): oversikten med fylket i adressen og tabellen som
// sorteres, temasidene med tallene fra Udir og SSB, tallene på forsiden og boksene på sidene der tallene er nyttige. Tallene hentes hver uke, så testene sjekker oppsettet og
// rekkefølgen, ikke bestemte tall.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

const SLATTHAUG = { id: '974557320', navn: 'Slåtthaug videregående skole' };
/** «25 090» → 25090, «84,0 %» → 84. */
const tall = (tekst: string) => Number(tekst.replace(/[^\d,]/g, '').replace(',', '.'));

test.describe('Videregående i tall', () => {
  test('siden: fylket i adressen, nøkkeltallene og fylkene som kan sorteres på hver kolonne', async ({ page }, info) => {
    test.skip(info.project.name.includes('mobil'), 'På mobil viser tabellen én kolonne (testen under).');
    await page.goto('./#/statistikk?fylke=46');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Videregående i tall');
    await expect(page.getByLabel('Vis tall for')).toHaveValue('46');
    await expect(page.locator('.st-fliser > li')).toHaveCount(4);
    const tabell = page.locator('.st-fylketabell');
    const rader = tabell.locator('tbody tr');
    await expect(rader).toHaveCount(16);
    // Landet står alltid nederst.
    await expect(rader.last().locator('th')).toHaveText('Hele landet');
    // Søkere: høyest først, så lavest først.
    await tabell.getByRole('button', { name: 'Søkere' }).click();
    await expect(tabell.locator('th[aria-sort="descending"]')).toContainText('Søkere');
    const synkende = (await rader.locator('td:nth-of-type(1)').allTextContents()).slice(0, 15).map(tall);
    expect(synkende).toEqual([...synkende].sort((a, b) => b - a));
    await tabell.getByRole('button', { name: 'Søkere' }).click();
    await expect(tabell.locator('th[aria-sort="ascending"]')).toContainText('Søkere');
    const stigende = (await rader.locator('td:nth-of-type(1)').allTextContents()).slice(0, 15).map(tall);
    expect(stigende).toEqual([...stigende].sort((a, b) => a - b));
    // Fylket: alfabetisk.
    await tabell.getByRole('button', { name: 'Fylke' }).click();
    const navn = (await rader.locator('th').allTextContents()).slice(0, 15);
    expect(navn).toEqual([...navn].sort((a, b) => a.localeCompare(b, 'nb')));
    // Hele landet i adressen uten fylke.
    await page.getByLabel('Vis tall for').selectOption('');
    await expect(page).toHaveURL(/#\/statistikk$/);
    await expect(page.getByRole('heading', { name: 'Hele landet i tall' })).toBeVisible();
  });

  test('@mobil tabellen står åpen og viser kolonnen brukeren velger', async ({ page }, info) => {
    test.skip(!info.project.name.includes('mobil'), 'Én kolonne bare på mobil.');
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/statistikk');
    await page.getByLabel('Vis og sorter etter').selectOption('laereplass');
    const tabell = page.locator('.st-fylketabell');
    await expect(tabell.locator('thead th:visible')).toHaveCount(2);
    await expect(tabell.locator('th[aria-sort="descending"]')).toContainText('Læreplass');
  });

  test('temakortene på oversikten går til temasidene med fylket, og fanene bytter tema', async ({ page }) => {
    await page.goto('./#/statistikk?fylke=46');
    const kort = page.locator('.st-tema');
    await expect(kort).toHaveCount(3);
    // To tall på hvert kort.
    for (let i = 0; i < 3; i++) await expect(kort.nth(i).locator('.st-tema-tall > span')).toHaveCount(2);
    await kort.filter({ hasText: 'Skolen' }).click();
    await expect(page).toHaveURL(/#\/statistikk\/skolen\?fylke=46$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Skolen');
    // Stien går til oversikten, og fanene har bare temaene.
    await expect(page.locator('.brodsmuler a')).toHaveText('Videregående i tall');
    const faner = page.getByRole('navigation', { name: 'Temaene i Videregående i tall' }).getByRole('link');
    await expect(faner).toHaveText(['Ungdom', 'Skolen', 'Fullføring']);
    await expect(faner.nth(1)).toHaveAttribute('aria-current', 'page');
    await faner.nth(2).click();
    await expect(page).toHaveURL(/#\/statistikk\/fullforing\?fylke=46$/);
    await expect(page.getByLabel('Vis tall for')).toHaveValue('46');
  });

  test('temasiden: «Kort fortalt» med tre tall og kilden, SSB i kildeboksen og fylket i adressen', async ({ page }) => {
    await page.goto('./#/statistikk/ungdom?fylke=46');
    const kort = page.locator('.st-kort li');
    await expect(kort).toHaveCount(3);
    await expect(kort.locator('.st-kort-tall')).toHaveCount(3);
    await expect(kort.nth(0).locator('.st-kilde-merke')).toHaveText('SSB');
    await expect(kort.nth(1).locator('.st-kilde-merke')).toHaveText('Udir');
    await expect(page.locator('.kildeboks')).toContainText('Kilder (2)');
    await page.getByLabel('Vis tall for').selectOption('18');
    await expect(page).toHaveURL(/#\/statistikk\/ungdom\?fylke=18$/);
    await expect(kort.nth(0)).toContainText('Nordland');
  });

  test('deltakelsen: fylkene fra start, og etter bakgrunn som et valg', async ({ page }, info) => {
    test.skip(info.project.name.includes('mobil'), 'Samme figur på mobil, der delen er lukket fra start.');
    await page.goto('./#/statistikk/ungdom?fylke=46');
    const figur = page.locator('.st-figur').filter({ hasText: '16–18-åringer i videregående' });
    const valg = figur.locator('.st-valg button');
    await expect(valg.nth(0)).toHaveAttribute('aria-pressed', 'true');
    await expect(figur.locator('.fg-punktrad')).toHaveCount(15);
    await valg.nth(1).click();
    await expect(valg.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(figur.locator('.fg-punktrad')).toHaveCount(0);
    await expect(figur).toContainText('Med innvandringsbakgrunn');
    await expect(figur).toContainText('norskfødte med innvandrerforeldre');
  });

  test('@mobil temasiden: den første delen er åpen, de andre lukket med en linje om hva de har', async ({ page }, info) => {
    test.skip(!info.project.name.includes('mobil'), 'Delene er lukket fra start bare på mobil.');
    await page.goto('./#/statistikk/skolen?fylke=46');
    await expect(page.getByRole('button', { name: /^Lærerne/ })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: /^Penger per elev/ })).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.seksjon-innhold').first()).toContainText('per elev');
  });
});

test.describe('Videregående i tall på forsiden', () => {
  test('skrivebord: «I tall» i panelet i sidekolonnen, ikke under «Oppslag», og panelet uten bryter med én visning', async ({ page }, info) => {
    test.skip(info.project.name.includes('mobil'), 'Sidekolonnen finnes bare på skrivebord.');
    await settLagret(page, { fylke: '46', skole: SLATTHAUG });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('./');
    const panel = page.locator('.forside-sidekolonne [data-gruppe="panel"]');
    // Kalenderen er første visning. Valgene står i overskriften, og valget av «I tall» huskes.
    await expect(panel.locator('.kal-panel')).toBeVisible();
    await panel.getByRole('button', { name: 'I tall', exact: true }).click();
    await expect(panel.getByRole('button', { name: 'I tall', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(panel.locator('.st-forside-sted')).toHaveText('Tall for Vestland');
    await expect(panel.locator('.st-fliser-kompakt > li')).toHaveCount(4);
    await expect(panel.locator('.st-stripe-prikk')).toHaveCount(15);
    await expect(panel).toContainText(SLATTHAUG.navn);
    await expect(page.locator('[data-kategori="felles"]')).not.toContainText('Videregående i tall');
    await page.reload();
    await expect(panel.locator('.st-forside')).toBeVisible();
    await panel.getByRole('link', { name: 'Alle tallene i Videregående i tall' }).click();
    await expect(page).toHaveURL(/#\/statistikk\?fylke=46$/);
    // Med bare kalenderen igjen står den som en vanlig gruppe, uten bryter.
    await page.goto('./');
    await page.getByRole('button', { name: 'Tilpass' }).click();
    await page.getByLabel('Videregående i tall', { exact: true }).uncheck();
    await page.getByLabel('Nyheter', { exact: true }).uncheck();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    await expect(page.locator('.panel-fane')).toHaveCount(0);
    await expect(page.locator('.forside-sidekolonne [data-gruppe="neste"]')).toBeVisible();
  });

  test('skrivebord: uten valgt fylke viser «I tall» hele landet og en lenke for å velge fylke, ikke stripen', async ({ page }, info) => {
    test.skip(info.project.name.includes('mobil'), 'Sidekolonnen finnes bare på skrivebord.');
    await settLagret(page, { forside: { rekkefolge: [], lukket: [], bareFavoritter: false, visning: 'itall' } });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('./');
    const panel = page.locator('.forside-sidekolonne [data-gruppe="panel"]');
    await expect(panel.locator('.st-forside-sted')).toHaveText('Tall for hele landet');
    await expect(panel.locator('.st-stripe-figur')).toHaveCount(0);
    await panel.getByRole('link', { name: /Velg fylke for å se hvor fylket ditt ligger/ }).click();
    await expect(page).toHaveURL(/#\/innstillinger$/);
  });

  test('«Bare favoritter»: kalenderen og Videregående i tall som favoritter står som hver sin gruppe', async ({ page }) => {
    await settLagret(page, { fylke: '46', favoritter: ['kalender:oversikt', 'statistikk:oversikt'] });
    await page.goto('./');
    await page.getByRole('radio', { name: /Favoritter|Bare favoritter/ }).check();
    await expect(page.locator('[data-gruppe="panel"]')).toHaveCount(0);
    await expect(page.locator('[data-gruppe="neste"]')).toHaveCount(1);
    await expect(page.locator('[data-gruppe="itall"]')).toHaveCount(1);
  });

  test('«Bare favoritter»: bare visningene som er favoritter, står der', async ({ page }) => {
    await settLagret(page, { fylke: '46', favoritter: ['statistikk:oversikt', 'inntak:oversikt'] });
    await page.goto('./');
    await page.getByRole('radio', { name: /Favoritter|Bare favoritter/ }).check();
    await expect(page.locator('[data-gruppe="itall"]')).toHaveCount(1);
    await expect(page.locator('[data-gruppe="neste"]')).toHaveCount(0);
    await expect(page.locator('[data-gruppe="nyheter"]')).toHaveCount(0);
  });

  test('@mobil «I tall» øverst: lukket med søkerne og læreplassen, og åpnes med et trykk', async ({ page }, info) => {
    test.skip(!info.project.name.includes('mobil'), 'Panelet er lukket fra start bare på mobil.');
    await settLagret(page, { fylke: '46' });
    await page.goto('./');
    const panel = page.locator('[data-gruppe="panel"]');
    // Valgene står i overskriften når panelet er åpent.
    await panel.locator('.gruppeknapp').click();
    await panel.getByRole('button', { name: 'I tall', exact: true }).click();
    await expect(panel.locator('.st-fliser-kompakt > li')).toHaveCount(4);
    // Lukket viser overskriften tallene, uten valgene. Når panelet er åpent, lukkes det med pilen, fordi valgene dekker
    // resten av overskriften.
    await panel.locator('.gruppeknapp > .ikon').click();
    await expect(panel.locator('.gruppe-sammendrag')).toContainText(/søkere · .* fikk læreplass/);
    await expect(panel.locator('.panel-fane')).toHaveCount(0);
  });
});

test.describe('tallene der de hører hjemme', () => {
  test('fylkessiden, inntak, poengberegningen, lærlinger, fraværsgrensen, eksamen, OT, arbeidsplanen og skolekortet', async ({ page }, info) => {
    test.skip(info.project.name.includes('mobil'), 'Samme innhold på mobil. Overflyten testes for alle rutene.');
    await settLagret(page, { fylke: '46', skole: SLATTHAUG });
    await page.goto('./#/fylker/46');
    await expect(page.locator('.st-fylket')).toContainText('Vestland i tall');
    await expect(page.locator('.st-fylket .st-boks-merke')).toHaveText('Videregående i tall');
    await expect(page.locator('.st-fylket .st-fliser > li')).toHaveCount(4);
    // Hver boks har merkelappen og en tittel, og lenker til Videregående i tall (avgjørelse 091).
    for (const [rute, tittel, lenke] of [
      ['#/inntak', 'Søkere og ungdomskull i Vestland', '#/statistikk/ungdom?fylke=46'],
      ['#/inntak/poeng', 'Grunnskolepoeng i Vestland', '#/statistikk/ungdom?fylke=46'],
      ['#/opplaeringslop/laerlinger-og-kandidater', 'Læreplass i Vestland', '#/statistikk?fylke=46'],
      ['#/vurdering/fravaer', 'Fravær i Vestland', '#/statistikk?fylke=46'],
      ['#/eksamen/regler', 'Eksamen i Vestland', '#/statistikk?fylke=46'],
      ['#/begreper/oppfolgingstjenesten', 'Unge utenfor arbeid og utdanning i Vestland', '#/statistikk/fullforing?fylke=46'],
      ['#/arbeidstid/arbeidsplan', 'Lærerne i videregående i Vestland', '#/statistikk/skolen?fylke=46'],
    ] as const) {
      await page.goto(`./${rute}`);
      const boks = page.locator('.st-boks');
      await expect(boks.locator('.st-boks-merke'), rute).toHaveText('Videregående i tall');
      await expect(boks.locator('.st-boks-tittel'), rute).toHaveText(tittel);
      await expect(boks.locator('.st-boks-lenke a'), rute).toHaveAttribute('href', lenke);
    }
    // Fraværet på skolen brukeren har valgt.
    await page.goto('./#/vurdering/fravaer');
    await expect(page.locator('.st-boks')).toContainText(SLATTHAUG.navn);
    // Skolekortet: tallene og knappen til nettsiden i samme ramme.
    await page.goto('./#/opplaeringslop/skoler?fylke=alle&skole=46011');
    const skolen = page.locator('.st-skolen');
    await expect(skolen).toContainText('Skolen i tall');
    await expect(skolen.getByRole('link', { name: /Nettsiden/ })).toBeVisible();
    await expect(page.locator('.skolekort-snarveier')).toHaveCount(0);
  });
});
