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
    await expect(page.getByLabel('Undervisning i prosent av full stilling')).toHaveValue('100');
    await page.getByLabel('Årsramme (vedlegg 1)').selectOption({ value: '525' });
    await expect(resultat(page)).toContainText('100');
    const tabell = page.locator('.fordeling-tabell');
    await expect(tabell.getByRole('row', { name: /Undervisning/ })).toContainText('525');
    await expect(tabell.getByRole('row', { name: /Annen planfestet tid/ })).toContainText('625');
    await expect(tabell.getByRole('row', { name: /Selvdisponert tid/ })).toContainText('537,5');
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
    await expect(oversikt).toContainText('10,5 årsrammetimer');
    await expect(oversikt).toContainText('28 timer');
    await expect(oversikt).toContainText(/Feriepenger i tillegg\s*1\s748,8 kr/);
    await expect(resultat(page)).toContainText(/14\s573,33/);
    await page.getByRole('switch', { name: '15 eller færre elever i klassen' }).check();
    await expect(oversikt).toContainText('11,55 årsrammetimer');
    await expect(resultat(page)).toContainText(/14\s573,33/);
    await page.getByRole('button', { name: 'Forklaring: Hvorfor endrer ikke faget beløpet?' }).click();
    await expect(page.getByText(/1 % over hel stilling gir alltid 14 timer kalkulert tid/)).toBeVisible();
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
