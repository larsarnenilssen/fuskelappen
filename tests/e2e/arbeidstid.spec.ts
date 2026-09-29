import { expect, type Page, test } from '@playwright/test';
import { settLagret, venterPaaSide } from './hjelp.ts';

const ENGELSK = 'Engelsk – Stud.spes Vg1 (*)';

async function aapne(page: Page, rute: string) {
  await page.goto(`./#${rute}`);
  await venterPaaSide(page);
}

function resultat(page: Page) {
  return page.locator('.resultatkort-verdi').first();
}

test.describe('arbeidstid', () => {
  test('hurtigkalkulatorene står på forsiden', async ({ page }) => {
    await aapne(page, '/');
    const hurtig = page.locator('section[aria-labelledby="forside-hurtig"]');
    await expect(hurtig.getByRole('link', { name: 'Beskjeftigelse' })).toBeVisible();
    await hurtig.getByRole('link', { name: 'Vikartimer' }).click();
    await expect(page.locator('main h1')).toHaveText('Vikartimer');
  });

  test('beskjeftigelse med stjernefag, blandet gruppe og utregning', async ({ page }) => {
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await expect(page.getByText('Fyll inn feltene over')).toBeVisible();
    await page.getByLabel('Fag, program og trinn (vedlegg 1)').selectOption({ label: ENGELSK });
    await page.getByLabel('Faktisk antall elever i klassen').fill('30');
    await page.getByLabel('Årstimer (60-minutters timer)').fill('140');
    await expect(resultat(page)).toContainText('26,67');

    await page.getByLabel('Faktisk antall elever i klassen').fill('14');
    await expect(resultat(page)).toContainText('24,24');

    const kort = page.locator('.resultatkort');
    await expect(kort.getByText('Ikke kontrollert')).toBeVisible();
    await expect(kort.locator('.utregning')).toBeHidden();
    await kort.getByRole('button', { name: 'Vis utregning' }).click();
    await expect(kort.getByText('Formel: årstimer ÷ justert årsramme × 100')).toBeVisible();
    await expect(kort.getByText(/140 ÷ 577,5 × 100 =/)).toBeVisible();
  });

  test('blandet gruppe bruker laveste årsramme', async ({ page }) => {
    await aapne(page, '/arbeidstid/beskjeftigelse');
    await page.getByLabel('Fag, program og trinn (vedlegg 1)').selectOption({ label: 'Fremmedspråk – Stud.spes Vg1' });
    await page.getByRole('button', { name: 'Legg til program eller nivå i samme time' }).click();
    await page.getByLabel('Årsramme 2').selectOption({ label: 'Fremmedspråk – Stud.spes Vg2' });
    await page.getByLabel('Årstimer (60-minutters timer)').fill('113');
    await expect(resultat(page)).toContainText('22,78');
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
    await page.getByLabel('Timevikar').check();
    await page.getByLabel('Fag, program og trinn (vedlegg 1)').selectOption({ label: ENGELSK });
    await page.getByLabel('Faktisk antall elever i klassen').fill('30');
    await page.getByLabel('Antall vikarøkter').fill('10');
    await expect(resultat(page)).toContainText(/7\s772,44/);
    await expect(page.locator('.oversikt')).toContainText('346,98');
  });

  test('periodebeskjeftigelse', async ({ page }) => {
    await aapne(page, '/arbeidstid/periode');
    await page.getByLabel('Undervisningsdager i perioden').fill('40');
    await page.getByLabel('Fag, program og trinn (vedlegg 1)').selectOption({ label: 'Bio – Stud.spes Vg3' });
    await page.getByLabel('Timer i perioden (60-minutters timer)').fill('30');
    await expect(resultat(page)).toContainText('28,73');
  });

  test('overtid over 100 %', async ({ page }) => {
    await aapne(page, '/arbeidstid/overtid');
    await page.getByLabel('Samlet beskjeftigelse i prosent').fill('110');
    await page.getByLabel('Faget overtiden gjelder (vedlegg 1)').selectOption({ label: ENGELSK });
    await page.getByLabel('Faktisk antall elever i klassen').fill('30');
    await expect(resultat(page)).toContainText(/72\s866,67/);
  });

  test('fordelingen vises som diagram og tabell', async ({ page }) => {
    await aapne(page, '/arbeidstid/fordeling');
    await page.getByLabel('Fag, program og trinn (vedlegg 1)').selectOption({ label: ENGELSK });
    await page.getByLabel('Faktisk antall elever i klassen').fill('30');
    await page.getByLabel('Årstimer (60-minutters timer)').fill('420');
    await page.getByLabel('Reduksjon i prosent').fill('20');
    await page.getByLabel('Møtetid per uke (timer)').fill('2');
    await expect(page.getByRole('img', { name: /Stolpediagram over årsverket på 1\s687,5 timer/ })).toBeVisible();
    await expect(page.locator('.fordeling-tabell')).toContainText('Annen planfestet tid');
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
