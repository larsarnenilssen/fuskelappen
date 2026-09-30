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
    await aapne(page, '/arbeidstid/planfestet');
    await page.getByLabel('Reduksjon i prosent').fill('20');
    await expect(resultat(page)).toContainText(/1\s257,5/);
    await page.getByRole('button', { name: /Slik regnes det ut/ }).click();
    await page.locator('.kildeliste a').first().evaluate((a) => a.removeAttribute('target'));
    await page.goto('./#/begreper');
    await venterPaaSide(page);
    await page.goBack();
    await venterPaaSide(page);
    await expect(page.getByLabel('Reduksjon i prosent')).toHaveValue('20');
    await expect(resultat(page)).toContainText(/1\s257,5/);
  });

  test('metoden er skjult til den åpnes', async ({ page }) => {
    await aapne(page, '/arbeidstid/planfestet');
    const knapp = page.getByRole('button', { name: /Slik regnes det ut/ });
    await expect(knapp).toHaveAttribute('aria-expanded', 'false');
    await knapp.click();
    await expect(page.getByText(/planfestet tid = 1150 \+ 537,5/)).toBeVisible();
  });

  test('planfestet tid utvider arbeidsåret over 37,5 timer i uka', async ({ page }) => {
    await aapne(page, '/arbeidstid/planfestet');
    await page.getByLabel('Reduksjon i prosent').fill('80');
    await expect(resultat(page)).toContainText(/1\s580/);
    await expect(page.locator('.oversikt')).toContainText('14,67 dager');
    await expect(page.getByRole('img', { name: /110 timer over grensen/ })).toBeVisible();
  });

  test('lokale testverdier slår gjennom og merkes med nivå', async ({ page }) => {
    await settLagret(page, { fylke: '46', skole: { id: '999999999', navn: 'Testskolen' } });
    await aapne(page, '/arbeidstid/planfestet');
    await page.getByLabel('Reduksjon i prosent').fill('0');
    await expect(resultat(page)).toContainText(/1\s050/);
    const kort = page.locator('.resultatkort');
    await expect(kort.getByText('Lokal verdi (skole)').first()).toBeVisible();
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

  test('fordelingen vises som diagram og tabell med timer per uke', async ({ page }) => {
    await aapne(page, '/arbeidstid/fordeling');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('420');
    await page.getByLabel('Reduksjon i prosent').fill('20');
    await page.getByLabel('Møtetid per uke (timer)').fill('2');
    await expect(page.getByRole('img', { name: /Stolpediagram over årsverket på 1\s687,5 timer/ })).toBeVisible();
    await expect(page.locator('.fordeling-tabell')).toContainText('Annen planfestet tid');
    await expect(page.locator('.fordeling-tabell')).toContainText('Per uke');
    await page.getByRole('button', { name: /Annen planfestet tid/ }).click();
    await expect(page.getByText('Annet elevrettet arbeid er ikke definert i avtalen', { exact: false })).toBeVisible();
  });

  test('fordelingen kan regnes ut fra stillingsprosent', async ({ page }) => {
    await aapne(page, '/arbeidstid/fordeling');
    await page.getByRole('radio', { name: 'Stillingsprosent' }).check();
    await expect(page.getByRole('textbox', { name: 'Stillingsprosent' })).toHaveValue('100');
    await page.getByLabel('Årsramme (vedlegg 1)').selectOption({ value: '525' });
    await expect(resultat(page)).toContainText('100');
    const tabell = page.locator('.fordeling-tabell');
    await expect(tabell.getByRole('row', { name: /Undervisning/ })).toContainText('525');
    await expect(tabell.getByRole('row', { name: /Annen planfestet tid/ })).toContainText('625');
    await expect(tabell.getByRole('row', { name: /Selvdisponert tid/ })).toContainText('537,5');
  });

  test('fordelingen virker for en stilling med bare funksjon', async ({ page }) => {
    await aapne(page, '/arbeidstid/fordeling');
    await page.getByRole('radio', { name: 'Stillingsprosent' }).check();
    await page.getByRole('textbox', { name: 'Stillingsprosent' }).fill('10');
    await page.getByLabel('Reduksjon i prosent').fill('10');
    await page.getByLabel('Møtetid per uke (timer)').fill('3');
    await expect(page.locator('.merknad-advarsel')).toHaveCount(0);
    const tabell = page.locator('.fordeling-tabell');
    await expect(tabell.getByRole('row', { name: /Undervisning/ })).toContainText('0');
    await expect(tabell.getByRole('row', { name: /Møtetid/ })).toContainText('114');
    await expect(tabell.getByRole('row', { name: /Funksjoner og andre oppgaver/ })).toContainText('54,8');
    await expect(tabell.getByRole('row', { name: /Årsverk i alt/ })).toContainText('168,8');
  });

  test('arbeidsåret utvides når planfestet tid går over 37,5 timer per uke', async ({ page }) => {
    await aapne(page, '/arbeidstid/fordeling');
    await page.getByRole('radio', { name: 'Stillingsprosent' }).check();
    await page.getByLabel('Reduksjon i prosent').fill('100');
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
    await aapne(page, '/arbeidstid/fordeling');
    await page.getByRole('radio', { name: 'Stillingsprosent' }).check();
    await page.getByLabel('Årsramme (vedlegg 1)').selectOption({ value: '525' });
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
    await aapne(page, '/arbeidstid/stillingsplan');
    const tabell = page.locator('.fordeling-tabell');
    await expect(tabell.getByRole('row', { name: /Annen planfestet tid/ })).toContainText(/1\s150,0/);
    await expect(tabell.getByRole('row', { name: /Selvdisponert tid/ })).toContainText('537,5');
    await expect(tabell.getByRole('row', { name: /Undervisning/ })).toContainText('0,0');
    await expect(page.getByText(/Delen av stillingen som ikke er fylt med fag og funksjoner \(100 %\)/)).toBeVisible();
    await page.getByRole('textbox', { name: 'Stillingsprosent' }).fill('50');
    await expect(tabell.getByRole('row', { name: /Annen planfestet tid/ })).toContainText('575,0');
  });

  test('arbeidsplanen har fordelingsdiagram og kan regne ut årslønn', async ({ page }) => {
    await aapne(page, '/arbeidstid/stillingsplan');
    await velgFag(page, 'engelsk stud vg1', 'Engelsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('420');
    await page.getByLabel('Funksjon 1: Prosent').fill('20');
    await expect(page.locator('.stillingsplan-differanse')).toHaveAttribute('data-differanse', 'balanse');
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

    await page.getByRole('switch', { name: 'Regn ut årslønn' }).check();
    await page.getByRole('radio', { name: 'Egen årslønn' }).check();
    await page.getByLabel('Årslønn i kroner').fill('600000');
    await page.getByRole('textbox', { name: 'Stillingsprosent' }).fill('80');
    await expect(page.locator('.resultatkort', { hasText: 'Årslønn i stillingen' })).toContainText(/480\s000/);
    await expect(page.getByText(/Diagrammet viser undervisningen og funksjonene som er lagt inn \(100 %\)/)).toBeVisible();
  });

  test('stillingsplan med flere fag og funksjon gir teknisk undertid (fasit 014)', async ({ page }) => {
    await aapne(page, '/arbeidstid/stillingsplan');
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
    const differanse = page.locator('.stillingsplan-differanse');
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
    await aapne(page, '/arbeidstid/stillingsplan');
    await velgFag(page, 'norsk stud vg1', 'Norsk · Studiespesialisering Vg1');
    await page.getByLabel('Antall årstimer').fill('452');
    await page.getByLabel('Funksjon 1: Prosent').fill('12');
    const differanse = page.locator('.stillingsplan-differanse');
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

  test('årstimene fylles inn også i periode, fordeling og stillingsplan', async ({ page }) => {
    for (const [rute, etikett] of [
      ['/arbeidstid/periode', 'Antall timer i perioden'],
      ['/arbeidstid/fordeling', 'Antall årstimer'],
      ['/arbeidstid/stillingsplan', 'Antall årstimer'],
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
    await aapne(page, '/arbeidstid/planfestet');
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
