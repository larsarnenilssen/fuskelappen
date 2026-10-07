// Videregående i tall (eier 07.10.2026, avgjørelse 080): siden med fylket i adressen og tabellen som sorteres, tallene
// på forsiden og boksene på sidene der tallene hører hjemme. Tallene hentes hver uke, så testene sjekker oppsettet og
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

  test('@mobil delene er lukket unntatt gjennomføring og fravær, og tabellen viser kolonnen brukeren velger', async ({ page }, info) => {
    test.skip(!info.project.name.includes('mobil'), 'Delene er lukket fra start bare på mobil.');
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/statistikk');
    await expect(page.getByRole('button', { name: /^Søkere per utdanningsprogram/ })).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('button', { name: /^Gjennomføring og fravær/ })).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('button', { name: /^Fylkene side om side/ }).click();
    await page.getByLabel('Vis og sorter etter').selectOption('laereplass');
    const tabell = page.locator('.st-fylketabell');
    await expect(tabell.locator('thead th:visible')).toHaveCount(2);
    await expect(tabell.locator('th[aria-sort="descending"]')).toContainText('Læreplass');
  });
});

test.describe('Videregående i tall på forsiden', () => {
  test('skrivebord: tallene for fylket i sidekolonnen, ikke under «Oppslag», og de kan slås av', async ({ page }, info) => {
    test.skip(info.project.name.includes('mobil'), 'Sidekolonnen finnes bare på skrivebord.');
    await settLagret(page, { fylke: '46', skole: SLATTHAUG });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('./');
    const gruppe = page.locator('.forside-sidekolonne [data-gruppe="itall"]');
    await expect(gruppe.getByRole('heading')).toContainText('Vestland i tall');
    // Søkere, læreplass, elever, skolen og lenken til siden.
    await expect(gruppe.locator('.st-forside > li')).toHaveCount(5);
    await expect(gruppe).toContainText(SLATTHAUG.navn);
    await expect(page.locator('[data-kategori="felles"]')).not.toContainText('Videregående i tall');
    await gruppe.getByRole('link', { name: 'Videregående i tall' }).click();
    await expect(page).toHaveURL(/#\/statistikk\?fylke=46$/);
    await page.goto('./');
    await page.getByRole('button', { name: 'Tilpass' }).click();
    await page.getByLabel('Vis «Videregående i tall» på forsiden').uncheck();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    await expect(page.locator('[data-gruppe="itall"]')).toHaveCount(0);
  });

  test('@mobil lukket med søkerne og læreplassen, og åpnes med et trykk', async ({ page }, info) => {
    test.skip(!info.project.name.includes('mobil'), 'Gruppen er lukket fra start bare på mobil.');
    await settLagret(page, { fylke: '46' });
    await page.goto('./');
    const gruppe = page.locator('[data-gruppe="itall"]');
    await expect(gruppe.locator('.gruppe-sammendrag')).toContainText(/søkere · .* fikk læreplass/);
    await gruppe.locator('.gruppeknapp').click();
    await expect(gruppe.locator('.st-forside > li')).toHaveCount(4);
  });
});

test.describe('tallene der de hører hjemme', () => {
  test('fylkessiden, inntak, lærlinger, fraværsgrensen, eksamen og skolekortet', async ({ page }, info) => {
    test.skip(info.project.name.includes('mobil'), 'Samme innhold på mobil. Overflyten testes for alle rutene.');
    await settLagret(page, { fylke: '46', skole: SLATTHAUG });
    await page.goto('./#/fylker/46');
    await expect(page.locator('.st-fylket')).toContainText('Vestland i tall');
    await expect(page.locator('.st-fylket .st-fliser > li')).toHaveCount(4);
    for (const [rute, tittel] of [
      ['#/inntak', 'Søkere i Vestland'],
      ['#/opplaeringslop/laerlinger-og-kandidater', 'Læreplass i Vestland'],
      ['#/vurdering/fravaer', 'Fravær i Vestland'],
      ['#/eksamen/regler', 'Eksamen i Vestland'],
    ] as const) {
      await page.goto(`./${rute}`);
      await expect(page.locator('.st-boks'), rute).toContainText(tittel);
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
