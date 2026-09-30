import { expect, type Locator, type Page, test } from '@playwright/test';
import { settLagret, venterPaaSide } from './hjelp.ts';

async function aapne(page: Page, rute: string) {
  await page.goto(`./#${rute}`);
  await venterPaaSide(page);
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
  test('hurtigkalkulatorene står på forsiden', async ({ page }) => {
    await aapne(page, '/');
    const hurtig = page.locator('section[aria-labelledby="forside-hurtig"]');
    await expect(hurtig.getByRole('link', { name: 'Beskjeftigelse' })).toBeVisible();
    await hurtig.getByRole('link', { name: 'Vikartimer' }).click();
    await expect(page.locator('main h1')).toHaveText('Vikartimer');
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
    await expect(kort.getByText('Ikke kontrollert')).toBeVisible();
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

  test('periodebeskjeftigelse med tidslinje', async ({ page }) => {
    await aapne(page, '/arbeidstid/periode');
    await page.getByLabel('Dager i perioden').fill('40');
    await expect(page.getByRole('img', { name: /40 av 190 undervisningsdager/ })).toBeVisible();
    await velgFag(page, 'biologi 2', 'Biologi · Studiespesialisering Vg3');
    await page.getByLabel('Antall timer i perioden').fill('30');
    await expect(resultat(page)).toContainText('28,73');
  });

  test('overtid over 100 %', async ({ page }) => {
    await aapne(page, '/arbeidstid/overtid');
    await page.getByLabel('Samlet beskjeftigelse i prosent').fill('110');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await expect(resultat(page)).toContainText(/72\s866,67/);
  });

  test('periode med økter per uke regner ut ukene fra dagene, og ukene kan endres', async ({ page }) => {
    await aapne(page, '/arbeidstid/periode');
    await page.getByLabel('Dager i perioden').fill('40');
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
    await page.getByLabel('Funksjon 1: Prosent').fill('10');
    await page.getByLabel('Møtetid per uke (timer)').fill('3');
    await expect(page.locator('.merknad-advarsel')).toHaveCount(0);
    const tabell = page.locator('.fordeling-tabell');
    await expect(tabell.getByRole('row', { name: /Undervisning/ })).toContainText('0');
    await expect(tabell.getByRole('row', { name: /Møtetid/ })).toContainText('114');
    await expect(tabell.getByRole('row', { name: /Funksjoner og andre oppgaver/ })).toContainText('54,8');
    await expect(tabell.getByRole('row', { name: /Årsverk i alt/ })).toContainText('168,8');
  });

  test('arbeidsåret utvides når planfestet tid går over 37,5 timer per uke', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await page.getByLabel('Funksjon 1: Prosent').fill('100');
    const tabell = page.locator('.fordeling-tabell');
    await expect(tabell.getByRole('columnheader', { name: /Per uke/ })).toBeVisible();
    await expect(tabell.getByRole('row', { name: /Funksjoner og andre oppgaver/ })).toContainText('37,5');
    await expect(page.getByText(/utvides arbeidsåret med 29(,0)? dager/)).toBeVisible();
    await expect(page.getByText(/delt på 45(,0)? uker/)).toBeVisible();

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
    await aapne(page, '/arbeidstid/periode');
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

  test('arbeidsplanen er hovedkalkulatoren i modulen', async ({ page }) => {
    await aapne(page, '/arbeidstid');
    const kort = page.locator('a.hovedkort');
    await expect(kort).toContainText('Arbeidsplan');
    await kort.click();
    await expect(page.locator('main h1')).toHaveText('Arbeidsplan');
  });

  test('arbeidsplanen viser fordelingen for stillingen før noe er fylt ut', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    const tabell = page.locator('.fordeling-tabell');
    await expect(tabell.getByRole('row', { name: /Annen planfestet tid/ })).toContainText(/1\s150,0/);
    await expect(tabell.getByRole('row', { name: /Selvdisponert tid/ })).toContainText('537,5');
    await expect(tabell.getByRole('row', { name: /Undervisning/ })).toContainText('0,0');
    await expect(page.getByText(/Delen av stillingen som ikke er fylt med fag og funksjoner \(100 %\)/)).toBeVisible();
    await page.getByRole('textbox', { name: 'Stillingsprosent' }).fill('50');
    await expect(tabell.getByRole('row', { name: /Annen planfestet tid/ })).toContainText('575,0');
  });

  test('arbeidsplanen har fordelingsdiagram og kan regne ut årslønn', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('420');
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
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/480\s000/);
    await expect(lonn).toContainText(/Feriepenger i tillegg\s*57\s600/);
    await expect(page.getByText(/Diagrammet viser undervisningen og funksjonene som er lagt inn \(100 %\)/)).toBeVisible();

    // Tillegg per funksjon: beløpet fra SFS 2213 punkt 9.1 fylles inn og kan overskrives.
    await page.getByPlaceholder('F.eks. kontaktlærer').fill('Rådgiver');
    await page.getByRole('switch', { name: 'Funksjon 1: Tillegg i lønnen' }).check();
    const tillegg1 = page.getByLabel('Tillegg per år, funksjon 1');
    await expect(tillegg1).toHaveValue(/12\s?000/);
    await expect(page.getByText(/minst 12\s000 kr i året for rådgiver eller sosiallærer/)).toBeVisible();
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/492\s000/);
    await page.getByRole('button', { name: 'Legg til funksjon' }).click();
    await page.getByPlaceholder('F.eks. kontaktlærer').last().fill('Kontaktlærer');
    // Funksjon 2 har ikke tillegg før bryteren slås på.
    await expect(page.getByLabel('Tillegg per år, funksjon 2')).toHaveCount(0);
    await page.getByRole('switch', { name: 'Funksjon 2: Tillegg i lønnen' }).check();
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/504\s000/);
    await expect(lonn).toContainText(/Tillegg: Kontaktlærer\s*12\s000/);
    await tillegg1.fill('15000');
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/507\s000/);
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
    await expect(page.getByLabel('Funksjon 1: Prosent')).toBeHidden();
    await expect(funksjoner).toContainText('1 lagt inn, 0 %');

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
    await page.getByPlaceholder('F.eks. kontaktlærer').fill('Rådgiver');
    await page.getByRole('switch', { name: 'Funksjon 1: Tillegg i lønnen' }).check();
    await expect(lonn).toContainText(/Tillegg: Rådgiver\s*12\s000/);
    await expect(lonn.locator('.resultatkort-verdi')).toContainText(/612\s000/);
    await expect(tabell.getByRole('row', { name: /Funksjoner og andre oppgaver/ })).toContainText('0,0');
    await expect(tabell.getByRole('row', { name: /Annen planfestet tid/ })).toContainText(/1\s150,0/);
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
    await expect(tabell.getByRole('row', { name: /^Planfestet tid/ })).toContainText(/1\s150,0/);
    // Fem arbeidsdager ekstra ferie: arbeidsåret er 191 dager eller 38,2 uker.
    await expect(page.getByText('Per uke er timene delt på 38,2 uker i arbeidsåret.')).toBeVisible();
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

  test('arbeidsplan med flere fag og funksjon gir teknisk undertid (fasit 014)', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await expect(page.getByRole('textbox', { name: 'Stillingsprosent' })).toHaveValue('100');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('140');
    for (const nr of [2, 3]) {
      await page.getByRole('button', { name: 'Legg til fag' }).click();
      const fag = page.locator(`[data-gruppe="${nr}"]`);
      await velgFag(fag, 'norsk stud vg1', 'Norsk · Studiespesialisering Vg1');
      await fag.getByLabel('Antall årstimer').fill('113');
    }
    await page.getByPlaceholder('F.eks. kontaktlærer').fill('Kontaktlærer');
    await page.getByLabel('Funksjon 1: Prosent').fill('25');
    await expect(resultat(page)).toContainText('97,23');
    const differanse = page.locator('.arbeidsplan-differanse');
    await expect(differanse).toHaveAttribute('data-differanse', 'undertid');
    await expect(differanse).toContainText('Teknisk undertid');
    await expect(differanse).toContainText('2,77 % = 14,54 årsrammetimer');
    await page.getByLabel('Årsrammetimer i').selectOption({ index: 1 });
    await expect(differanse).toContainText('13,73 årsrammetimer');
    await page.getByRole('button', { name: 'Timer i hvert fag' }).click();
    await expect(page.locator('.hjelp-tekst .oversikt')).toContainText('14,54 årsrammetimer');
    await expect(page.getByRole('img', { name: /Kontaktlærer 25 %.*stillingen på 100 %/ })).toBeVisible();
  });

  test('teknisk overtid over 100 % lenker til overtid med prosenten utfylt', async ({ page }) => {
    await aapne(page, '/arbeidstid/arbeidsplan');
    await velgFag(page, 'norsk stud vg1', 'Norsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('452');
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

  test('årstimene fylles inn også i periode og arbeidsplan', async ({ page }) => {
    for (const [rute, etikett] of [
      ['/arbeidstid/periode', 'Antall timer i perioden'],
      ['/arbeidstid/arbeidsplan', 'Antall årstimer'],
    ] as const) {
      await aapne(page, rute);
      await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
      await expect(page.getByLabel(etikett), rute).toHaveValue('140');
    }
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
    await expect(page.getByRole('img', { name: /gjennomsnittlig uke: 29,3 timer planfestet tid/ })).toBeVisible();
    await expect(page.getByText(/Enkeltuker kan ha opptil 37,5 timer planfestet tid, og enkeltdager opptil 9 timer/)).toBeVisible();

    await aapne(page, '/arbeidstid/vikar');
    await page.getByRole('radio', { name: 'Timevikar' }).check();
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall vikarøkter').fill('10');
    await expect(page.getByRole('img', { name: /Stolpe for beløpet: Lønn 6\s939,68 kr, Feriepenger i tillegg 832,76 kr/ })).toBeVisible();

    await aapne(page, '/arbeidstid/periode');
    await page.getByLabel('Dager i perioden').fill('40');
    await velgFag(page, 'biologi 2', 'Biologi · Studiespesialisering Vg3');
    await page.getByLabel('Antall timer i perioden').fill('30');
    // 28,73 % i perioden × 40 ÷ 190 = 6,05 %, det samme som 30 ÷ 496 × 100 for hele året.
    await expect(page.locator('.oversikt')).toContainText('Tilsvarer for hele skoleåret');
    await expect(page.locator('.oversikt')).toContainText('6,05 %');
  });

  test('kalkulatorene finnes på nynorsk', async ({ page }) => {
    await settLagret(page, { malform: 'nn' });
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await expect(page.locator('main h1')).toHaveText('Sysselsetjing');
  });

  test('begrepene er søkbare', async ({ page }) => {
    await aapne(page, '/sok?q=årsramme');
    await expect(page.getByRole('link', { name: /Årsramme/ }).first()).toBeVisible();
  });
});
