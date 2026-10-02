import { expect, type Locator, type Page, test } from '@playwright/test';
import { settLagret, venterPaaSide } from './hjelp.ts';

async function aapne(page: Page, rute: string) {
  await page.goto(`./#${rute}`);
  await venterPaaSide(page);
}

/** Åpner Arbeidsplan for en periode med det gitte antallet dager. */
async function aapnePeriode(page: Page, dager: string) {
  await aapne(page, '/arbeidstid/arbeidsplan');
  await page.getByRole('radio', { name: 'En periode' }).check();
  await page.getByLabel('Dager i perioden').fill(dager);
}

function resultat(page: Page) {
  return page.locator('.resultatkort-verdi').first();
}

/** Søker etter et fag og velger treffet som begynner med navnet. */
async function velgFag(omraade: Locator | Page, sok: string, treff: string) {
  await omraade.getByLabel('Fag', { exact: true }).last().fill(sok);
  await omraade.locator('.fagtreff button', { hasText: treff }).first().click();
}

test.describe('arbeidstid', () => {
  test('Arbeidsplan står som egen boks på forsiden, og de andre kalkulatorene i en boks som kan åpnes', async ({ page }) => {
    await aapne(page, '/');
    const arbeidstid = page.locator('[data-kategori="arbeidstid"]');
    await expect(arbeidstid.getByRole('link', { name: /Arbeidsplan/ })).toBeVisible();
    await expect(arbeidstid.getByRole('link', { name: /Vikartimer/ })).toBeHidden();
    await arbeidstid.getByRole('button', { name: /Flere kalkulatorer/ }).click();
    await expect(arbeidstid.getByRole('link', { name: /Beskjeftigelse/ })).toBeVisible();
    await arbeidstid.getByRole('link', { name: /Vikartimer/ }).click();
    await expect(page.locator('main h1')).toHaveText('Vikartimer');
    // Tilbake til forsiden: boksen er fortsatt åpen.
    await page.goBack();
    await expect(arbeidstid.getByRole('link', { name: /Vikartimer/ })).toBeVisible();
  });

  test('byttet mellom søk og årsramme skrevet inn selv står på samme sted i fagkortet', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    const kort = page.locator('[data-gruppe="1"]');
    const manuell = kort.getByRole('button', { name: 'Skriv inn årsramme selv' });
    // Målt fra toppen av kortet, så det ikke spiller inn om siden ruller når feltet får fokus.
    const fraKort = async (l: Locator) => ((await l.boundingBox())?.y ?? 0) - ((await kort.boundingBox())?.y ?? 0);
    const for_ = await fraKort(manuell);
    await manuell.click();
    const tilbake = kort.getByRole('button', { name: 'Søk i vedlegg 1' });
    // Knappen står på linjen med etiketten, til høyre, som «Skriv inn årsramme selv».
    await expect(kort.locator('.etikettrad', { has: page.getByRole('button', { name: 'Søk i vedlegg 1' }) })).toContainText('Årsramme (60 min)');
    expect(Math.abs((await fraKort(tilbake)) - for_)).toBeLessThan(8);
    await tilbake.click();
    await expect(kort.getByRole('button', { name: 'Skriv inn årsramme selv' })).toBeVisible();
  });

  test('den gamle adressen til arbeidstid sender til forsiden', async ({ page }) => {
    await aapne(page, '/arbeidstid');
    await expect(page).toHaveURL(/#\/$/);
    await expect(page.locator('[data-kategori="arbeidstid"]')).toBeVisible();
  });

  test('fagsøket finner fag, kallenavn og fagkoder', async ({ page }) => {
    await aapne(page, '/arbeidstid/beskjeftigelse');
    const sok = page.getByLabel('Fag', { exact: true });
    await sok.fill('R1');
    await expect(page.locator('.fagtreff button').first()).toContainText('Matematikk · Studiespesialisering Vg2');
    await sok.fill('HEA');
    await expect(page.locator('.fagtreff button').first()).toContainText('Helse- og oppvekstfag Vg2');
    await expect(page.locator('.fagtreff button').first()).toContainText('HEA Helsearbeiderfag');
    await sok.fill('finnesikke');
    await expect(page.getByText('Ingen fag passer')).toBeVisible();
  });

  test('beskjeftigelse med små klasser, flere fag og kompakt utregning', async ({ page }) => {
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await expect(page.getByText('Velg fag og fyll inn timer')).toBeVisible();
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('140');
    await expect(resultat(page)).toContainText('26,67');
    await expect(page.locator('.resultatkort-sammendrag')).toContainText('140 ÷ 525 × 100 = 26,67 %');

    await page.getByRole('switch', { name: '15 eller færre elever i klassen' }).check();
    await expect(resultat(page)).toContainText('24,24');

    const kort = page.locator('.resultatkort');
    await expect(kort.getByText('Ikke kontrollert')).toHaveCount(0);
    await expect(kort.locator('.utregning')).toBeHidden();
    await kort.getByRole('button', { name: 'Vis utregning' }).click();
    await expect(kort.getByText('årstimer ÷ justert årsramme × 100')).toBeVisible();
    await expect(kort.locator('.utregning').getByText(/140 ÷ 577,5 × 100 =/)).toBeVisible();
    await expect(kort.locator('.utregning-kilder')).toContainText('SFS 2213');

    await page.getByRole('button', { name: 'Legg til fag' }).click();
    const fag2 = page.locator('[data-gruppe="2"]');
    await velgFag(fag2, 'BAT', 'Felles programfag · Bygg- og anleggsteknikk Vg1');
    await fag2.getByRole('radio', { name: 'Økter/uke' }).check();
    await fag2.getByLabel('Antall økter per uke').fill('10');
    await expect(fag2.locator('.fagkort-resultat')).toContainText('44,39 %');
    await expect(resultat(page)).toContainText('68,63');
  });

  test('blandet gruppe bruker laveste årsramme', async ({ page }) => {
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await velgFag(page, 'fremmedspråk stud vg1', 'Fremmedspråk');
    await page.getByRole('button', { name: /Blandet gruppe/ }).click();
    await page.getByLabel('Også i timen', { exact: true }).fill('fremmedspråk stud vg2');
    await page.locator('.fagtreff button', { hasText: 'Studiespesialisering Vg2' }).first().click();
    await page.getByLabel('Antall årstimer').fill('113');
    await expect(resultat(page)).toContainText('22,78');
  });

  test('det utfylte huskes når brukeren går tilbake', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByLabel('Funksjon 1: Prosent').fill('20');
    const planfestet = page.locator('.fordeling-tabell').getByRole('row', { name: /^Planfestet tid/ });
    await expect(planfestet).toContainText(/1\s257,5/);
    await page.getByRole('button', { name: /Slik regnes det ut/ }).click();
    await page.goto('./#/begreper');
    await venterPaaSide(page);
    await page.goBack();
    await venterPaaSide(page);
    await expect(page.getByLabel('Funksjon 1: Prosent')).toHaveValue('20');
    await expect(planfestet).toContainText(/1\s257,5/);
  });

  test('metoden er skjult til den åpnes', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    const knapp = page.getByRole('button', { name: /Slik regnes det ut/ });
    await expect(knapp).toHaveAttribute('aria-expanded', 'false');
    await knapp.click();
    await expect(page.getByText(/Arbeidsplanen sammenligner det læreren skal gjøre/)).toBeVisible();
  });

  test('planfestet tid utvider arbeidsåret over 37,5 timer i uka', async ({ page }) => {
    // 80 % funksjon i hel stilling: 1150 × 0,2 + 1687,5 × 0,8 = 1580 timer planfestet tid, som punkt 5.3.
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByLabel('Funksjon 1: Prosent').fill('80');
    await expect(page.locator('.fordeling-tabell').getByRole('row', { name: /^Planfestet tid/ })).toContainText(/1\s580,0/);
    await expect(page.getByText(/utvides arbeidsåret med 14,7 dager/)).toBeVisible();
  });

  test('lokale testverdier slår gjennom og merkes med nivå', async ({ page }) => {
    await settLagret(page, { fylke: '46', skole: { id: '999999999', navn: 'Testskolen' } });
    await aapne(page, '/arbeidstid/arbeidsplan');
    const kort = page.locator('.fordeling-visning');
    await expect(kort.getByRole('row', { name: /^Planfestet tid/ })).toContainText(/1\s050,0/);
    await expect(kort.getByText('Lokal verdi (skole)')).toBeVisible();
  });

  test('timevikar med garantilønn og feriepenger', async ({ page }) => {
    await aapne(page, '/arbeidstid/vikar');
    await page.getByRole('radio', { name: 'Timevikar' }).check();
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall vikarøkter').fill('10');
    await expect(resultat(page)).toContainText(/6\s939,68/);
    await expect(page.locator('.resultatkort-tittel')).toHaveText('Lønn som utbetales');
    await expect(page.locator('.oversikt')).toContainText('346,98');
    await expect(page.locator('.oversikt')).toContainText('832,76');
    await expect(page.locator('.oversikt')).toContainText('7,5 timer');
    await expect(page.locator('.resultatkort-sammendrag')).toHaveCount(0);
  });

  test('periodebeskjeftigelse i arbeidsplanen med tidslinje', async ({ page }) => {
    await aapnePeriode(page, '40');
    await expect(page.getByRole('img', { name: /40 av 190 undervisningsdager/ })).toBeVisible();
    await velgFag(page, 'biologi 2', 'Biologi · Studiespesialisering Vg3');
    await page.getByLabel('Antall timer i perioden').fill('30');
    await expect(resultat(page)).toContainText('28,73');
    await expect(page.locator('.resultatkort').first()).toContainText('Beskjeftigelse i perioden');
  });

  test('en periode med funksjon, årsbasis, fordeling og lønn for perioden', async ({ page }) => {
    // Halve skoleåret: 262,5 timer engelsk er 100 % i perioden, og kontaktlærer 10 % er 10 % i perioden.
    await aapnePeriode(page, '95');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await expect(page.getByLabel('Antall timer i perioden')).toHaveValue('');
    await page.getByLabel('Antall timer i perioden').fill('262,5');
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByLabel('Funksjon 1: Prosent').fill('10');
    const kort = page.locator('.resultatkort').first();
    await expect(resultat(page)).toContainText('110');
    await expect(kort).toContainText(/Tilsvarer for hele skoleåret\s*55 %/);
    await expect(page.locator('.arbeidsplan-differanse')).toContainText(/Teknisk overtid\s*10 % = 26,25 timer i perioden/);
    // Overtidskalkulatoren regner for et helt år, så lenken vises ikke for en periode.
    await expect(page.getByRole('link', { name: /Regn ut overtidsbetaling/ })).toHaveCount(0);
    // På årsbasis: 100 % i halve året er 50 % for hele året. Timene er de samme.
    await kort.getByRole('radio', { name: 'På årsbasis' }).check();
    await expect(kort).toContainText('Samlet beskjeftigelse på årsbasis');
    await expect(resultat(page)).toContainText('55');
    await expect(kort).toContainText(/I perioden\s*110 %/);
    await expect(page.locator('.arbeidsplan-differanse')).toContainText(/5 % = 26,25 timer i perioden/);
    // Fordelingen gjelder perioden.
    await expect(page.getByRole('button', { name: /Fordeling av arbeidstiden i perioden/ })).toBeVisible();
    await expect(page.locator('.fordeling-tabell').getByRole('row', { name: /Undervisning/ })).toContainText('262,5');
    // Lønn i perioden regnes fra datoene, som i lønnssystemet. Uten datoer vises en merknad.
    await page.getByRole('switch', { name: 'Regn ut lønn' }).check();
    await page.getByRole('radio', { name: 'Egen årslønn' }).check();
    await page.getByLabel('Årslønn i kroner').fill('600000');
    await expect(page.getByText(/Fyll inn første og siste dag i perioden/)).toBeVisible();
    await page.getByLabel('Første dag i perioden').fill('2026-08-01');
    await page.getByLabel('Siste dag i perioden').fill('2026-12-31');
    // Fem hele måneder: 600 000 × 5 ÷ 12 = 250 000. Overtid for 26,25 timer i perioden (70 timer kalkulert tid × 1,5).
    const lonn = page.locator('.resultatkort', { hasText: 'Lønn i perioden' });
    await expect(lonn).toContainText(/Lønn i 100 % stilling i perioden\s*250\s000/);
    await expect(lonn).toContainText(/Overtidsbetaling\s*33\s333,33/);
    await expect(lonn).toContainText(/5 hele måneder og 0 arbeidsdager i brutte måneder/);
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/283\s333,33/);
    // En brutt måned: fra fredag 15. januar gir 11 arbeidsdager ÷ 21,67 i januar.
    await page.getByLabel('Første dag i perioden').fill('2027-01-15');
    await page.getByLabel('Siste dag i perioden').fill('2027-06-30');
    await expect(lonn).toContainText(/5 hele måneder og 11 arbeidsdager i brutte måneder/);
    // Baklengs periode gir feilmelding.
    await page.getByLabel('Siste dag i perioden').fill('2027-01-01');
    await expect(page.getByText('Siste dag kan ikke være før første dag.')).toBeVisible();
  });

  test('overtid over 100 %', async ({ page }) => {
    await aapne(page, '/arbeidstid/overtid');
    await page.getByLabel('Samlet beskjeftigelse i prosent').fill('110');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await expect(resultat(page)).toContainText(/72\s866,67/);
  });

  test('periode med økter per uke regner ut ukene fra dagene, og ukene kan endres', async ({ page }) => {
    await aapnePeriode(page, '40');
    await velgFag(page, 'biologi 2', 'Biologi · Studiespesialisering Vg3');
    await page.getByRole('radio', { name: 'Økter/uke' }).check();
    await page.getByLabel('Antall økter per uke').fill('3');
    await page.getByRole('radio', { name: '60', exact: true }).check();
    const uker = page.getByLabel('Uker i perioden');
    await expect(uker).toHaveAttribute('placeholder', '8');
    await expect(page.getByText(/Tomt felt gir 8 uker: 40 dager ÷ 5 skoledager per uke/)).toBeVisible();
    // 3 × 60 ÷ 60 × 8 = 24 timer i perioden, det samme som 24 timer skrevet inn.
    await expect(page.locator('.merknad-advarsel', { hasText: 'Uker i perioden er regnet ut fra dagene' })).toBeVisible();
    const medUker = await resultat(page).textContent();
    await uker.fill('7');
    await expect(resultat(page)).not.toHaveText(medUker ?? '');
    await expect(page.locator('.merknad-advarsel', { hasText: 'Uker i perioden er regnet ut fra dagene' })).toHaveCount(0);
  });

  test('fordelingen vises som diagram og tabell med timer per uke', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('420');
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByLabel('Funksjon 1: Prosent').fill('20');
    await page.getByLabel('Møtetid per uke (timer)').fill('2');
    await expect(page.getByRole('img', { name: /Stolpediagram over årsverket på 1\s687,5 timer/ })).toBeVisible();
    await expect(page.locator('.fordeling-tabell')).toContainText('Annen planfestet tid');
    await expect(page.locator('.fordeling-tabell')).toContainText('Per uke');
    await page.getByRole('button', { name: /Annen planfestet tid/ }).click();
    await expect(page.getByText('Annet elevrettet arbeid er ikke definert i avtalen', { exact: false })).toBeVisible();
  });

  test('fordelingen virker for en stilling med bare funksjon', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.getByRole('textbox', { name: 'Stillingsprosent' }).fill('10');
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByLabel('Funksjon 1: Prosent').fill('10');
    await page.getByLabel('Møtetid per uke (timer)').fill('3');
    await expect(page.locator('.merknad-advarsel')).toHaveCount(0);
    const tabell = page.locator('.fordeling-tabell');
    await expect(tabell.getByRole('row', { name: /Undervisning/ })).toContainText('0');
    await expect(tabell.getByRole('row', { name: /Møtetid/ })).toContainText('114');
    // Planleggingsdagene (45 timer når ikke annet er skrevet inn) tas fra funksjonstiden: 54,75 − 45 = 9,75.
    await expect(tabell.getByRole('row', { name: /Planlegging/ })).toContainText('45,0');
    await expect(tabell.getByRole('row', { name: /Funksjoner og andre oppgaver/ })).toContainText('9,8');
    await expect(tabell.getByRole('row', { name: /Årsverk i alt/ })).toContainText('168,8');
  });

  test('arbeidsåret utvides når planfestet tid går over 37,5 timer per uke', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByLabel('Funksjon 1: Prosent').fill('100');
    const tabell = page.locator('.fordeling-tabell');
    await expect(tabell.getByRole('columnheader', { name: /Per uke/ })).toBeVisible();
    await expect(tabell.getByRole('row', { name: /Funksjoner og andre oppgaver/ })).toContainText('37,5');
    await expect(page.getByText(/utvides arbeidsåret med 29(,0)? dager/)).toBeVisible();
    // Skoleukene med utvidelsen: 38 + 29 ÷ 5 = 43,8 uker. Planleggingsdagene er holdt utenfor.
    await expect(page.getByText(/delt på 43,8 uker/)).toBeVisible();

    // Forklaringen av delene står under diagrammet og tabellen.
    const tabellBoks = await tabell.boundingBox();
    const brukBoks = await page.getByRole('heading', { name: 'Hva tiden brukes til' }).boundingBox();
    expect(brukBoks?.y ?? 0).toBeGreaterThan(tabellBoks?.y ?? Infinity);
  });

  test('diagrammet kan vises stort', async ({ page }, info) => {
    test.skip(!info.project.name.startsWith('chromium'), 'Fullskjerm testes i Chromium. Safari på iPhone har ikke fullskjerm for andre elementer enn video.');
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.getByRole('button', { name: 'Vis stort' }).click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.className ?? '')).toContain('fordeling-visning');
    await page.getByRole('button', { name: 'Lukk stor visning' }).click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
  });

  test('kalkulatoren kan åpnes i nytt vindu med det utfylte', async ({ page }, info) => {
    const knapp = page.getByRole('button', { name: 'Åpne Beskjeftigelse i nytt vindu' });
    await aapne(page, '/arbeidstid/beskjeftigelse');
    if (!info.project.name.endsWith('skrivebord')) {
      await expect(knapp).toBeHidden();
      return;
    }
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('140');
    const [vindu] = await Promise.all([page.waitForEvent('popup'), knapp.click()]);
    await expect(vindu.locator('main h1')).toHaveText('Beskjeftigelse');
    await expect(vindu.getByLabel('Antall årstimer')).toHaveValue('140');
    await expect(vindu.locator('.resultatkort-verdi').first()).toContainText('26,67');
    // Vinduene er uavhengige: en endring i det nye vinduet endrer ikke det første.
    await vindu.getByLabel('Antall årstimer').fill('70');
    await expect(vindu.locator('.resultatkort-verdi').first()).toContainText('13,33');
    await expect(resultat(page)).toContainText('26,67');
  });

  test('fagsøket finner fagnavn fra Grep', async ({ page }) => {
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await page.getByLabel('Fag', { exact: true }).fill('HEA2005');
    await expect(page.locator('.fagtreff button').first()).toContainText('Helse- og oppvekstfag Vg2');
    await expect(page.locator('.fagtreff button').first()).toContainText('Helsefremmende arbeid');
  });

  test('felt side om side står på linje i 320–430 px', async ({ page }, info) => {
    test.skip(!/mobil/.test(info.project.name), 'Mobilbredder testes i mobilprosjektene');
    await aapnePeriode(page, '40');
    for (const bredde of [320, 360, 390, 430]) {
      await page.setViewportSize({ width: bredde, height: 740 });
      const felt = page.locator('.feltrad').first().locator('input');
      await expect(felt).toHaveCount(2);
      const [a, b] = await Promise.all([felt.nth(0).boundingBox(), felt.nth(1).boundingBox()]);
      if (a && b && Math.abs(a.x - b.x) > 1) expect(Math.abs(a.y - b.y), `${bredde}px`).toBeLessThanOrEqual(1);
    }
    await expect(page.getByLabel('Dager i skoleåret')).toHaveAttribute('placeholder', '190');
  });

  test('ingressen ligger bak spørsmålstegnet ved tittelen', async ({ page }) => {
    await aapne(page, '/arbeidstid/beskjeftigelse');
    const knapp = page.getByRole('button', { name: 'Forklaring: Beskjeftigelse' });
    await expect(knapp).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByText('Undervisningsprosent for ett eller flere fag.')).toBeHidden();
    await knapp.click();
    await expect(page.getByText('Undervisningsprosent for ett eller flere fag.')).toBeVisible();
  });

  test('resultatlinjen viser svaret når kortet er utenfor skjermen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 600 });
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('140');
    await page.getByRole('button', { name: 'Legg til fag' }).click();
    await page.getByRole('button', { name: 'Legg til fag' }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    const linje = page.locator('.resultatlinje button');
    await expect(linje).toBeVisible();
    await expect(linje).toContainText('26,67');
    await linje.click();
    await expect(page.locator('.resultatkort')).toBeInViewport();
    await expect(linje).toBeHidden();
  });

  test('utregningen kan kopieres som tekst', async ({ page, context }, info) => {
    if (info.project.name.startsWith('chromium')) await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('140');
    await page.locator('.resultatkort').getByRole('button', { name: 'Kopier' }).click();
    // Utklippstavlen kan være stengt i testnettleseren. Da vises teksten i et felt som kan kopieres selv.
    const kopiert = page.locator('.resultatkort-kopistatus', { hasText: 'Kopiert' });
    const felt = page.getByLabel('Kopi av utregningen');
    await expect(kopiert.or(felt)).toBeVisible();
    if (await felt.isVisible()) await expect(felt).toHaveValue(/Beskjeftigelse: 26,67 %/);
    else if (info.project.name.startsWith('chromium')) expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('140 ÷ 525 × 100 = 26,67 %');
  });

  test('overtid viser undervisningstimer, kalkulert tid og hvorfor faget ikke endrer beløpet', async ({ page }) => {
    await aapne(page, '/arbeidstid/overtid');
    await page.getByLabel('Samlet beskjeftigelse i prosent').fill('102');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    const oversikt = page.locator('.oversikt');
    await expect(oversikt).toContainText('10,5 timer');
    await expect(oversikt).toContainText('28 timer');
    await expect(oversikt).toContainText(/Feriepenger i tillegg\s*1\s748,80 kr/);
    await expect(resultat(page)).toContainText(/14\s573,33/);
    await expect(page.locator('.resultatkort-sammendrag')).toHaveCount(0);
    await page.getByRole('switch', { name: '15 eller færre elever i klassen' }).check();
    await expect(oversikt).toContainText('11,55 timer');
    await expect(resultat(page)).toContainText(/14\s573,33/);
    await page.getByRole('button', { name: 'Forklaring: Hvorfor endrer ikke faget beløpet?' }).click();
    await expect(page.getByText(/1 % over hel stilling gir alltid 14 timer kalkulert tid/)).toBeVisible();
  });

  test('arbeidsplanen viser fordelingen for stillingen før noe er fylt ut', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    const tabell = page.locator('.fordeling-tabell');
    // Planleggingsdagene (6 × 7,5 = 45 timer) står for seg, og resten er annen planfestet tid.
    await expect(tabell.getByRole('row', { name: /Annen planfestet tid/ })).toContainText(/1\s105,0/);
    await expect(tabell.getByRole('row', { name: /Planlegging/ })).toContainText('45,0');
    await expect(tabell.getByRole('row', { name: /^Planfestet tid/ })).toContainText(/1\s150,0\s*29,1/);
    await expect(tabell.getByRole('row', { name: /Selvdisponert tid/ })).toContainText('537,5');
    // Timene på planleggingsdagene kan endres for den enkelte.
    await page.getByLabel('Timer på planleggingsdager').fill('30');
    await expect(tabell.getByRole('row', { name: /Planlegging/ })).toContainText('30,0');
    await expect(tabell.getByRole('row', { name: /Annen planfestet tid/ })).toContainText(/1\s120,0/);
    await page.getByLabel('Timer på planleggingsdager').fill('');
    await expect(tabell.getByRole('row', { name: /Undervisning/ })).toContainText('0,0');
    await expect(page.getByText(/Delen av stillingen som ikke er fylt med fag og funksjoner \(100 %\)/)).toBeVisible();
    await page.getByRole('textbox', { name: 'Stillingsprosent' }).fill('50');
    // 50 % stilling: halvparten av planfestet tid (575), med de samme 45 timene på planleggingsdager når ikke annet er skrevet inn.
    await expect(tabell.getByRole('row', { name: /Annen planfestet tid/ })).toContainText('530,0');
  });

  test('arbeidsplanen har fordelingsdiagram og kan regne ut årslønn', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('420');
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByLabel('Funksjon 1: Prosent').fill('20');
    await expect(page.locator('.arbeidsplan-differanse')).toHaveAttribute('data-differanse', 'balanse');
    await expect(page.getByRole('img', { name: /Stolpediagram over årsverket på 1\s687,5 timer/ })).toBeVisible();
    const tabell = page.locator('.fordeling-tabell');
    await expect(tabell.getByRole('row', { name: /Undervisning/ })).toContainText('420');
    await page.getByLabel('Møtetid per uke (timer)').fill('2');
    await expect(tabell.getByRole('row', { name: /Møtetid/ })).toContainText('76');

    // Kontaktlærer uten utvidet planfestet tid: planfestet tid blir 1150 timer som for hel undervisning.
    const planfestet = tabell.getByRole('row', { name: /^Planfestet tid/ });
    await expect(planfestet).toContainText(/1\s257,5/);
    await page.getByRole('switch', { name: 'Funksjon 1: Utvider planfestet tid' }).uncheck();
    await expect(planfestet).toContainText(/1\s150/);
    await expect(page.getByText(/Funksjoner som ikke utvider planfestet tid \(20 %\)/)).toBeVisible();

    await page.getByRole('switch', { name: 'Regn ut lønn' }).check();
    await page.getByRole('radio', { name: 'Egen årslønn' }).check();
    await page.getByLabel('Årslønn i kroner').fill('600000');
    await page.getByRole('textbox', { name: 'Stillingsprosent' }).fill('80');
    const lonn = page.locator('.resultatkort', { hasText: 'Lønn i året' });
    // 100 % beskjeftigelse i 80 % stilling: 20 % variabel lønn (105 årsrammetimer = 280 timer kalkulert tid).
    await expect(page.locator('.arbeidsplan-differanse')).toHaveAttribute('data-differanse', 'variabel');
    await expect(page.locator('.arbeidsplan-differanse')).toContainText(/Variabel lønn\s*20 % = 105 årsrammetimer/);
    await expect(lonn).toContainText(/Årslønn i 80 % stilling\s*480\s000/);
    await expect(lonn).toContainText(/Variabel lønn \(280 timer kalkulert tid\)\s*88\s888,89/);
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/568\s888,89/);
    await expect(lonn).toContainText(/Feriepenger i tillegg\s*68\s266,67/);
    await expect(page.getByText(/Diagrammet viser undervisningen og funksjonene som er lagt inn \(100 %\)/)).toBeVisible();

    // Tillegg per funksjon: beløpet fra SFS 2213 punkt 9.1 fylles inn og kan overskrives.
    await page.getByPlaceholder('F.eks. kontaktlærer').fill('Rådgiver');
    await page.getByRole('switch', { name: 'Funksjon 1: Tillegg i lønnen' }).check();
    const tillegg1 = page.getByLabel('Tillegg per år, funksjon 1');
    await expect(tillegg1).toHaveValue(/12\s?000/);
    await expect(page.getByText(/minst 12\s000 kr i året for rådgiver eller sosiallærer/)).toBeVisible();
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/580\s888,89/);
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByPlaceholder('F.eks. kontaktlærer').last().fill('Kontaktlærer');
    // Funksjon 2 har ikke tillegg før bryteren slås på.
    await expect(page.getByLabel('Tillegg per år, funksjon 2')).toHaveCount(0);
    await page.getByRole('switch', { name: 'Funksjon 2: Tillegg i lønnen' }).check();
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/592\s888,89/);
    await expect(lonn).toContainText(/Tillegg: Kontaktlærer\s*12\s000/);
    await tillegg1.fill('15000');
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/595\s888,89/);
    await expect(page.getByText('Skrevet inn selv.', { exact: false })).toBeVisible();
  });

  test('kortene kan legges sammen og åpnes med overskriften, og det huskes', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('420');

    // Fagkortet: feltene skjules, og overskriften viser faget.
    const fag = page.getByRole('button', { name: /^Fag 1/ });
    await expect(fag).toHaveAttribute('aria-expanded', 'true');
    await fag.click();
    await expect(fag).toHaveAttribute('aria-expanded', 'false');
    await expect(fag).toContainText('Engelsk · Studiespesialisering Vg1');
    await expect(page.getByLabel('Antall årstimer')).toBeHidden();

    // Resultatkortet viser fortsatt svaret når det er lagt sammen.
    const kort = page.locator('.resultatkort', { hasText: 'Samlet beskjeftigelse' });
    await kort.getByRole('button', { name: 'Samlet beskjeftigelse', exact: true }).click();
    await expect(kort.locator('.resultatkort-verdi')).toContainText('80');
    await expect(kort.getByRole('button', { name: 'Vis utregning' })).toBeHidden();

    // Diagramkortet viser planfestet og selvdisponert tid i overskriften.
    const diagram = page.getByRole('button', { name: /^Fordeling av årsverket/ });
    await diagram.click();
    await expect(diagram).toContainText(/planfestet 1\s150 t, selvdisponert 537,5 t/);
    await expect(page.locator('.fordeling-tabell')).toBeHidden();

    // Funksjoner og møter og lønn.
    const funksjoner = page.getByRole('button', { name: /^Funksjoner(?! og)/ });
    await funksjoner.click();
    await expect(page.getByRole('button', { name: 'Legg til funksjon' })).toBeHidden();
    await expect(funksjoner).toContainText('Ingen lagt inn');

    // Det som er lagt sammen, huskes når brukeren går til en annen side og tilbake.
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await page.goBack();
    await expect(page.locator('main h1')).toHaveText('Arbeidsplan');
    await expect(page.getByRole('button', { name: /^Fag 1/ })).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.fordeling-tabell')).toBeHidden();
    await page.getByRole('button', { name: /^Fag 1/ }).click();
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('420');
  });

  test('funksjoner kan ha bare tillegg, bare tid eller begge deler', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.getByRole('switch', { name: 'Regn ut lønn' }).check();
    await page.getByRole('radio', { name: 'Egen årslønn' }).check();
    await page.getByLabel('Årslønn i kroner').fill('600000');
    const lonn = page.locator('.resultatkort', { hasText: 'Lønn i året' });
    const tabell = page.locator('.fordeling-tabell');

    // Funksjon 1: bare tillegg (0 %). Tillegget kommer i lønnen, men tiden endres ikke.
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByPlaceholder('F.eks. kontaktlærer').fill('Rådgiver');
    await page.getByRole('switch', { name: 'Funksjon 1: Tillegg i lønnen' }).check();
    await expect(lonn).toContainText(/Tillegg: Rådgiver\s*12\s000/);
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/612\s000/);
    await expect(tabell.getByRole('row', { name: /Funksjoner og andre oppgaver/ })).toContainText('0,0');
    await expect(tabell.getByRole('row', { name: /Annen planfestet tid/ })).toContainText(/1\s105,0/);
    // Også når prosentfeltet står tomt.
    await page.getByLabel('Funksjon 1: Prosent').fill('');
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/612\s000/);

    // Funksjon 2: bare tid (10 %), uten tillegg.
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByPlaceholder('F.eks. kontaktlærer').last().fill('Teamleder');
    await page.getByLabel('Funksjon 2: Prosent').fill('10');
    await expect(tabell.getByRole('row', { name: /Funksjoner og andre oppgaver/ })).toContainText('168,8');
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/612\s000/);

    // Funksjon 3: både tid (5 %) og tillegg.
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByPlaceholder('F.eks. kontaktlærer').last().fill('Kontaktlærer');
    await page.getByLabel('Funksjon 3: Prosent').fill('5');
    await page.getByRole('switch', { name: 'Funksjon 3: Tillegg i lønnen' }).check();
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/624\s000/);
    await expect(tabell.getByRole('row', { name: /Funksjoner og andre oppgaver/ })).toContainText('253,1');
  });

  test('funksjoner kan oppgis i årsrammetimer, med forslag for kontaktlærer', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByPlaceholder('F.eks. kontaktlærer').fill('Kontaktlærer');
    await expect(page.getByText(/Kontaktlærer: minst 28,5 årsrammetimer \(SFS 2213 punkt 7\.3 b\)/)).toBeVisible();
    await page.getByRole('button', { name: 'Bruk 28,5 timer' }).click();
    await expect(page.getByLabel('Funksjon 1: Årsrammetimer')).toHaveValue('28,5');
    await expect(page.getByText(/Årsrammetimer ÷ 607,5 = 4,69 % av full stilling/)).toBeVisible();
    await expect(page.locator('.resultatkort', { hasText: 'Samlet beskjeftigelse' }).locator('.resultatkort-verdi')).toContainText('4,69');
    // Tilbake til prosent: prosentfeltet står som før.
    await page.getByRole('radio', { name: '%', exact: true }).check();
    await expect(page.getByLabel('Funksjon 1: Prosent')).toHaveValue('0');
  });

  test('redusert undervisning for 60 år regnes som en del av stillingen, med årsverk 1650 og kortere arbeidsår', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('459,375');
    await page.getByLabel('Livsfasetiltak (SFS 2213 punkt 6)').selectOption('fra60');
    await expect(page.getByLabel('Reduksjon')).toHaveAttribute('placeholder', '12,5');
    await expect(page.locator('.arbeidsplan-differanse')).toHaveAttribute('data-differanse', 'balanse');
    const tabell = page.locator('.fordeling-tabell');
    await expect(tabell.getByRole('row', { name: /Årsverk i alt/ })).toContainText(/1\s650,0/);
    // Planfestet tid er samme andel av årsverket som for andre: 1150 × 1650 ÷ 1687,5.
    await expect(tabell.getByRole('row', { name: /^Planfestet tid/ })).toContainText(/1\s124,4/);
    // Fem arbeidsdager ekstra ferie gir et arbeidsår på 191 dager. Timene per uke er fordelt på de 38 skoleukene.
    await expect(page.getByText(/Per uke er timene delt på 38 skoleuker/)).toBeVisible();
    await page.getByRole('button', { name: 'Forklaring: Redusert undervisning' }).click();
    await expect(page.locator('.hjelp-tekst').getByText(/Forskjellen er 5 arbeidsdager ekstra ferie/)).toBeVisible();
    await page.getByRole('button', { name: 'Forklaring: Redusert undervisning' }).click();
    // Høyere feriepengesats følger av 60 år.
    await page.getByRole('switch', { name: 'Regn ut lønn' }).check();
    await expect(page.getByText('Høyere feriepengesats, fordi læreren er 60 år eller eldre')).toBeVisible();
    // 57 år: forklaringen sier at regelen er brukt uten at avtalen sier det uttrykkelig.
    await page.getByLabel('Livsfasetiltak (SFS 2213 punkt 6)').selectOption('fra57');
    await page.getByRole('button', { name: 'Forklaring: Redusert undervisning' }).click();
    await expect(page.locator('.hjelp-tekst').getByText(/Appen bruker den samme regelen for 57-åringer/)).toBeVisible();
  });

  test('beskjeftigelse kan fortsette i arbeidsplan med fagene', async ({ page }) => {
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('140');
    await page.getByRole('link', { name: 'Fortsett i Arbeidsplan med disse fagene' }).click();
    await expect(page.locator('main h1')).toHaveText('Arbeidsplan');
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('140');
    await expect(page.locator('.resultatkort', { hasText: 'Samlet beskjeftigelse' }).locator('.resultatkort-verdi')).toContainText('26,67');
  });

  test('kalkulatorene kan skrives ut, og beløp vises med tusenskille', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.evaluate(() => {
      (window as unknown as { skrevetUt: boolean }).skrevetUt = false;
      window.print = () => {
        (window as unknown as { skrevetUt: boolean }).skrevetUt = true;
      };
    });
    await page.getByRole('button', { name: 'Skriv ut Arbeidsplan eller lagre som PDF' }).click();
    expect(await page.evaluate(() => (window as unknown as { skrevetUt: boolean }).skrevetUt)).toBe(true);

    await page.getByRole('switch', { name: 'Regn ut lønn' }).check();
    await page.getByRole('radio', { name: 'Egen årslønn' }).check();
    const felt = page.getByLabel('Årslønn i kroner');
    await felt.fill('600000');
    await felt.blur();
    await expect(felt).toHaveValue(/^600\s000$/);
    // Et formatert tall kan skrives over som vanlig.
    await felt.fill('650000');
    await felt.blur();
    await expect(felt).toHaveValue(/^650\s000$/);
    await expect(page.locator('.resultatkort', { hasText: 'Lønn i året' }).locator('.resultatkort-verdi')).toContainText(/650\s000/);
  });

  test('arbeidsplanen regner ut overtidsbetaling i lønnen over 100 %', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('420');
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByLabel('Funksjon 1: Prosent').fill('30');
    await page.getByRole('switch', { name: 'Regn ut lønn' }).check();
    await page.getByRole('radio', { name: 'Egen årslønn' }).check();
    await page.getByLabel('Årslønn i kroner').fill('700000');
    const lonn = page.locator('.resultatkort', { hasText: 'Lønn i året' });
    // 10 % overtid i engelsk med 700 000 kr i årslønn: 140 timer kalkulert tid × 370,37 kr × 1,5 = 77 777,78 kr,
    // som i overtidskalkulatoren.
    await expect(lonn).toContainText(/Overtidsbetaling\s*77\s777,78/);
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/777\s777,78/);
    await expect(lonn).toContainText(/Feriepenger i tillegg\s*93\s333,33/);
  });

  test('to endringer før appen har tegnet på nytt, blir begge med', async ({ page }) => {
    // Velg fag og skriv årstimer i samme JavaScript-oppgave, før appen rekker å tegne på nytt. Begge endringene
    // skal bli med (tidligere overskrev den siste den første, så faget forsvant).
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.getByLabel('Fag', { exact: true }).fill('norsk stud vg1');
    const treff = page.locator('.fagtreff button', { hasText: 'Norsk · Studiespesialisering Vg1' }).first();
    await expect(treff).toBeVisible();
    await page.evaluate(() => {
      const knapp = [...document.querySelectorAll<HTMLButtonElement>('.fagtreff button')].find((b) => b.textContent?.includes('Norsk · Studiespesialisering Vg1'));
      const felt = document.querySelector<HTMLInputElement>('[data-gruppe="1"] input[inputmode="decimal"]');
      knapp?.click();
      if (felt) {
        felt.value = '140';
        felt.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    // 140 ÷ 496 = 28,23 %
    await expect(resultat(page)).toContainText('28,23');
  });

  test('arbeidsplan med flere fag og funksjon gir teknisk undertid (fasit 014)', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await expect(page.getByRole('textbox', { name: 'Stillingsprosent' })).toHaveValue('100');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('140');
    for (const nr of [2, 3]) {
      await page.getByRole('button', { name: 'Legg til fag' }).click();
      const fag = page.locator(`[data-gruppe="${nr}"]`);
      await velgFag(fag, 'norsk stud vg1', 'Norsk · Studiespesialisering Vg1');
      // Hvert steg sjekkes for seg, så en feil viser hvilket steg som ikke ble med.
      await expect(fag.locator('.fagvalg-navn')).toContainText('Norsk');
      await fag.getByLabel('Antall årstimer').fill('113');
      await expect(fag.getByLabel('Antall årstimer')).toHaveValue('113');
      // Vent til gruppen er regnet ut (113 ÷ 496 = 22,78 %) før neste legges til, så ingen gruppe blir borte underveis.
      try {
        await expect(fag.locator('.fagkort-resultat')).toContainText('22,78');
      } catch (feil) {
        // Testen har sviktet av og til i WebKit uten at årsaken er funnet. Skjemaet skrives ut for feilsøking.
        const kort = await page.locator('.fagkort').allInnerTexts();
        throw new Error(`Gruppe ${nr} ble ikke regnet ut. Fagkortene: ${JSON.stringify(kort)}`, { cause: feil });
      }
    }
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByPlaceholder('F.eks. kontaktlærer').fill('Kontaktlærer');
    await page.getByLabel('Funksjon 1: Prosent').fill('25');
    await expect(resultat(page)).toContainText('97,23');
    const differanse = page.locator('.arbeidsplan-differanse');
    await expect(differanse).toHaveAttribute('data-differanse', 'undertid');
    await expect(differanse).toContainText('Teknisk undertid');
    await expect(differanse).toContainText('2,77 % = 14,54 årsrammetimer');
    // Norsk er lagt til to ganger, men står bare én gang i valget og listen.
    await expect(page.getByLabel('Årsrammetimer i').locator('option')).toHaveCount(2);
    await page.getByLabel('Årsrammetimer i').selectOption({ index: 1 });
    await expect(differanse).toContainText('13,73 årsrammetimer');
    await page.getByRole('button', { name: 'Timer i hvert fag' }).click();
    await expect(page.locator('.hjelp-tekst .oversikt')).toContainText('14,54 årsrammetimer');
    await expect(page.locator('.hjelp-tekst .oversikt-rad')).toHaveCount(2);
    await expect(page.getByRole('img', { name: /Kontaktlærer 25 %.*stillingen på 100 %/ })).toBeVisible();
  });

  test('fjern-knappen står på rammen over navnet, som på fagkortet, og tillegget på linjen med vippen', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.getByRole('switch', { name: 'Regn ut lønn' }).check();
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByRole('switch', { name: 'Funksjon 1: Tillegg i lønnen' }).check();
    const midt = async (l: Locator) => {
      const b = await l.boundingBox();
      return b ? b.y + b.height / 2 : NaN;
    };
    // Funksjonen er et kort som fagene (eier 02.10.2026): fjern-knappen står på rammen, over navnet.
    const navn = await page.getByLabel('Funksjon 1: Navn').boundingBox();
    const fjern = await midt(page.getByRole('button', { name: 'Fjern funksjon 1' }));
    expect(fjern).toBeLessThan(navn?.y ?? 0);
    const vippe = await midt(page.locator('.funksjon-tillegg .vippe'));
    const belop = page.getByLabel('Tillegg per år, funksjon 1');
    expect(Math.abs(vippe - (await midt(belop)))).toBeLessThan(12);
    // Beløpet får plass i feltet.
    await expect(belop).toHaveValue(/12\s?000/);
    expect(await belop.evaluate((e: HTMLInputElement) => e.scrollWidth <= e.clientWidth)).toBe(true);
  });

  test('teksten ved vippen for tillegg deles ikke inne i et ord, heller ikke med stor skrift', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.getByRole('switch', { name: 'Regn ut lønn' }).check();
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByRole('switch', { name: 'Funksjon 1: Tillegg i lønnen' }).check();
    for (const skrift of ['100%', '150%', '200%']) {
      await page.addStyleTag({ content: `html { font-size: ${skrift} !important; }` });
      // Hvert ord i etiketten skal stå på én linje (et delt ord gir to rektangler).
      const delteOrd = await page.locator('.funksjon-tillegg .vippe label').evaluate((label) => {
        const tekst = [...label.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim()) as Text;
        const delte: string[] = [];
        const innhold = tekst.textContent ?? '';
        for (const m of innhold.matchAll(/\S+/g)) {
          const r = document.createRange();
          r.setStart(tekst, m.index ?? 0);
          r.setEnd(tekst, (m.index ?? 0) + m[0].length);
          if (r.getClientRects().length > 1) delte.push(m[0]);
        }
        return delte;
      });
      expect(delteOrd, skrift).toEqual([]);
      // Raden med vippe og beløp går ikke utenfor kortet.
      const [rad, kort] = await Promise.all([page.locator('.funksjon-tillegg').boundingBox(), page.locator('.funksjonsliste').boundingBox()]);
      expect(rad && kort && rad.x + rad.width <= kort.x + kort.width + 1, skrift).toBe(true);
    }
  });

  test('beskjeftigelse over en stilling under 100 % gir variabel lønn, og over 100 % også overtid', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.getByRole('textbox', { name: 'Stillingsprosent' }).fill('80');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('577,5');
    // 110 % i 80 % stilling: 20 % variabel lønn opp til hel stilling og 10 % teknisk overtid.
    const ruter = page.locator('.arbeidsplan-differanse');
    await expect(ruter).toHaveCount(2);
    await expect(ruter.first()).toHaveAttribute('data-differanse', 'variabel');
    await expect(ruter.first()).toContainText(/Variabel lønn\s*20 % = 105 årsrammetimer/);
    await expect(ruter.last()).toHaveAttribute('data-differanse', 'overtid');
    await expect(ruter.last()).toContainText(/Teknisk overtid\s*10 % = 52,5 årsrammetimer/);

    await page.getByRole('switch', { name: 'Regn ut lønn' }).check();
    await page.getByRole('radio', { name: 'Egen årslønn' }).check();
    await page.getByLabel('Årslønn i kroner').fill('600000');
    const lonn = page.locator('.resultatkort', { hasText: 'Lønn i året' });
    // Variabel lønn med vanlig timelønn, overtid med 50 % tillegg, hver på sin linje.
    await expect(lonn).toContainText(/Variabel lønn \(280 timer kalkulert tid\)\s*88\s888,89/);
    await expect(lonn).toContainText(/Overtidsbetaling\s*66\s666,67/);
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/635\s555,56/);
  });

  test('teknisk overtid over 100 % lenker til overtid med prosenten utfylt', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await velgFag(page, 'norsk stud vg1', 'Norsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('452');
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByLabel('Funksjon 1: Prosent').fill('12');
    const differanse = page.locator('.arbeidsplan-differanse');
    await expect(differanse).toHaveAttribute('data-differanse', 'overtid');
    await expect(differanse).toContainText('3,13 % = 15,52 årsrammetimer');
    await page.getByRole('link', { name: /Regn ut overtidsbetaling for 103,13 %/ }).click();
    await expect(page.locator('main h1')).toHaveText('Overtid over 100 %');
    await expect(page.getByLabel('Samlet beskjeftigelse i prosent')).toHaveValue('103,13');
  });

  test('årstimene fylles inn fra faget og kan endres', async ({ page }) => {
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await velgFag(page, 'kroppsøving stud vg1', 'Kroppsøving · Studiespesialisering Vg1');
    const timer = page.getByLabel('Antall årstimer');
    await expect(timer).toHaveValue('56');
    await expect(resultat(page)).toContainText('8,82');
    await expect(page.getByText(/Årstimetall for elevene fra Udir \(KRO1017\)/)).toBeVisible();

    // Nytt fag gir nytt årstimetall så lenge brukeren ikke har skrevet inn timene selv.
    await page.getByRole('button', { name: /Endre: Kroppsøving/ }).click();
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await expect(timer).toHaveValue('140');
    await expect(resultat(page)).toContainText('26,67');

    await timer.fill('120');
    await expect(page.getByText(/Årstimetall for elevene fra Udir/)).toBeHidden();
    await page.getByRole('button', { name: /Endre: Engelsk/ }).click();
    await velgFag(page, 'kroppsøving stud vg1', 'Kroppsøving · Studiespesialisering Vg1');
    await expect(timer).toHaveValue('120');
  });

  test('årstimer for et programfag fylles inn når fagkoden er søkt fram', async ({ page }) => {
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await velgFag(page, 'HEA2005', 'Helse- og oppvekstfag Vg2');
    await expect(page.locator('.fagvalg-kode')).toContainText('HEA2005 Helsefremmende arbeid');
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('197');
    await expect(page.getByText(/Årstimetall for elevene fra Udir \(HEA2005\)/)).toBeVisible();
  });

  test('årstimene fylles inn i arbeidsplanen for hele året, men ikke for en periode', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('140');
    // Årstimene gjelder et helt år. De tømmes når arbeidsplanen gjøres om til en periode.
    await page.getByRole('radio', { name: 'En periode' }).check();
    await expect(page.getByLabel('Antall timer i perioden')).toHaveValue('');
  });

  test('varianter lagres, sammenlignes og hentes fram igjen', async ({ page }) => {
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    const timer = page.getByLabel('Antall årstimer');
    await expect(timer).toHaveValue('140');
    await page.getByRole('button', { name: 'Lagre variant' }).click();
    const liste = page.locator('.variantliste');
    await expect(liste.locator('li')).toHaveCount(1);
    await expect(liste).toContainText('26,67 %');
    // Navnefeltet åpnes når varianten er lagret.
    const navn = page.getByRole('textbox', { name: 'Navn på variant 1' });
    await expect(navn).toBeFocused();
    await navn.fill('Før endring');
    await navn.press('Enter');
    await expect(liste).toContainText('Før endring');
    await timer.fill('105');
    await expect(resultat(page)).toContainText('20');
    await expect(liste).toContainText('nå −6,67 %');
    await page.getByRole('button', { name: 'Hent Før endring' }).click();
    await expect(timer).toHaveValue('140');
    await expect(resultat(page)).toContainText('26,67');
    // Navnet kan endres, og et tomt navn gir «Variant 1» igjen.
    await page.getByRole('button', { name: 'Gi nytt navn: Før endring' }).click();
    await page.getByRole('textbox', { name: 'Navn på variant 1' }).fill('');
    await page.getByRole('textbox', { name: 'Navn på variant 1' }).press('Enter');
    await expect(liste).toContainText('Variant 1');
    await page.getByRole('button', { name: 'Gi nytt navn: Variant 1' }).click();
    await page.getByRole('textbox', { name: 'Navn på variant 1' }).fill('Uten kontaktlærer');
    await page.getByRole('textbox', { name: 'Navn på variant 1' }).press('Enter');
    // Variantene og navnene ligger i lagringen på enheten og er der etter ny innlasting.
    await page.reload();
    await venterPaaSide(page);
    await expect(page.locator('.variantliste li')).toHaveCount(1);
    await expect(page.locator('.variantliste')).toContainText('Uten kontaktlærer');
    await page.getByRole('button', { name: 'Slett Uten kontaktlærer' }).click();
    await expect(page.locator('.variantliste li')).toHaveCount(0);
  });

  test('på bred skjerm står resultatet ved siden av skjemaet', async ({ page }, info) => {
    test.skip(!/skrivebord/.test(info.project.name), 'Bred skjerm testes i skrivebordsprosjektene');
    await page.setViewportSize({ width: 1280, height: 900 });
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    const skjema = await page.locator('.kalkulator-skjema').boundingBox();
    const kort = await page.locator('.resultatkort').boundingBox();
    expect(skjema && kort && kort.x > skjema.x + skjema.width - 1).toBe(true);
  });

  test('figurer for uke, beløp og hele skoleåret', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await expect(page.getByRole('img', { name: /gjennomsnittlig uke: 29,1 timer planfestet tid/ })).toBeVisible();
    await expect(page.getByText(/Enkeltuker kan ha opptil 37,5 timer planfestet tid, og enkeltdager opptil 9 timer/)).toBeVisible();

    await aapne(page, '/arbeidstid/vikar');
    await page.getByRole('radio', { name: 'Timevikar' }).check();
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall vikarøkter').fill('10');
    await expect(page.getByRole('img', { name: /Stolpe for beløpet: Lønn 6\s939,68 kr, Feriepenger i tillegg 832,76 kr/ })).toBeVisible();

    await aapnePeriode(page, '40');
    await velgFag(page, 'biologi 2', 'Biologi · Studiespesialisering Vg3');
    await page.getByLabel('Antall timer i perioden').fill('30');
    // 28,73 % i perioden × 40 ÷ 190 = 6,05 %, det samme som 30 ÷ 496 × 100 for hele året.
    const oversikt = page.locator('.resultatkort').first().locator('.oversikt');
    await expect(oversikt).toContainText('Tilsvarer for hele skoleåret');
    await expect(oversikt).toContainText('6,05 %');
  });

  test('kalkulatorene finnes på nynorsk', async ({ page }) => {
    await settLagret(page, { malform: 'nn' });
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await expect(page.locator('main h1')).toHaveText('Sysselsetjing');
  });

  test('begrepene er søkbare', async ({ page }) => {
    await aapne(page, '/sok?q=årsramme');
    await expect(page.getByRole('link', { name: /Årsramme/ }).first()).toBeVisible();
    const sok = page.getByRole('searchbox', { name: 'Søk etter tema, begrep eller fag' });
    await sok.fill('merarbeid');
    await expect(page.getByRole('link', { name: /Variabel lønn/ }).first()).toBeVisible();
    await sok.fill('planleggingsdag');
    await expect(page.getByRole('link', { name: /Planleggingsdager/ }).first()).toBeVisible();
  });
});
