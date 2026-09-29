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
    await fag2.getByRole('radio', { name: 'Økter per uke' }).check();
    await fag2.getByLabel('Antall økter per uke').fill('10');
    await expect(fag2.locator('.fagkort-resultat')).toContainText('44,39 %');
    await expect(resultat(page)).toContainText('68,63');
  });

  test('blandet gruppe bruker laveste årsramme', async ({ page }) => {
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await velgFag(page, 'fremmedspråk stud vg1', 'Fremmedspråk');
    await page.getByRole('button', { name: /Blandet gruppe/ }).click();
    await page.getByLabel('Også i timen').fill('fremmedspråk stud vg2');
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
    await expect(resultat(page)).toContainText(/7\s772,44/);
    await expect(page.locator('.oversikt')).toContainText('346,98');
  });

  test('periodebeskjeftigelse med tidslinje', async ({ page }) => {
    await aapne(page, '/arbeidstid/periode');
    await page.getByLabel('Undervisningsdager i perioden').fill('40');
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
