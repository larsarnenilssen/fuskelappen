// Fag og læreplaner (fase 2): søk og filter, fagside med kompetansemål og vurdering, målform og favoritter.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('fag og læreplaner', () => {
  test('søk og filter følger adressen, og fører til fagsiden', async ({ page }) => {
    await page.goto('./#/fag');
    await page.getByLabel('Søk etter fag eller fagkode').fill('helsefremmende arbeid');
    await expect(page).toHaveURL(/#\/fag\?q=helsefremmende\+arbeid/);
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.getByLabel('Utdanningsprogram').selectOption('HS');
    await page.getByLabel('Trinn').selectOption('Vg2');
    await expect(page).toHaveURL(/program=HS/);
    // Faget har samme navn i to programområder på Vg2. Fagkoden skiller dem.
    await expect(page.getByRole('status')).toHaveText('2 fag');
    // Fag med samme navn viser tilbudet etter fagkoden.
    await expect(page.getByRole('link', { name: /HEA2005/ })).toContainText('HEA2005 · Helsearbeiderfag');
    await page.getByRole('link', { name: /HEA2005/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Helsefremmende arbeid');

    // Tilbake gir samme søk og filter.
    await page.goBack();
    await expect(page.getByLabel('Søk etter fag eller fagkode')).toHaveValue('helsefremmende arbeid');
    await expect(page.getByRole('button', { name: 'Filter (2)' })).toBeVisible();
    await page.getByRole('button', { name: 'Nullstill filter' }).click();
    await expect(page).not.toHaveURL(/program=/);
  });

  test('filteret viser de vanlige fagene gruppert, og varianter når de slås på (avgjørelse 031)', async ({ page }) => {
    await page.goto('./#/fag?program=HS');
    const grupper = page.locator('.faggruppe-2 > .faggruppe-tittel');
    // Yrkesfaglig fordypning står først på et yrkesfaglig program.
    await expect(grupper.first()).toContainText('Yrkesfaglig fordypning');
    await expect(page.getByRole('button', { name: /^Felles programfag \(\d+\)/ })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText(/Kvensk/)).toHaveCount(0);
    // «Vis også» er lukket til brukeren åpner den.
    const visOgsaa = page.getByRole('button', { name: /Vis også/ });
    await expect(visOgsaa).toHaveAttribute('aria-expanded', 'false');
    await expect(visOgsaa).toContainText(/\d+ skjulte fag passer søket/);
    await visOgsaa.click();
    const varianter = page.getByRole('checkbox', { name: /Varianter for særskilte grupper/ });
    await expect(varianter).not.toBeChecked();
    await varianter.check();
    await expect(page).toHaveURL(/vis=variant/);
    await expect(page.getByText(/Kvensk/).first()).toBeVisible();
    // Uten de vanlige fagene står bare variantene igjen.
    await page.getByRole('checkbox', { name: /Vanlige fag/ }).uncheck();
    await expect(page).toHaveURL(/vanlige=nei/);
    await expect(page.getByRole('button', { name: /^Yrkesfaglig fordypning/ })).toHaveCount(0);
    await expect(page.getByText(/Kvensk/).first()).toBeVisible();

    // Et søk på en hel fagkode viser faget, også når det er skjult.
    await page.goto('./#/fag?q=KEF1001');
    await expect(page.getByRole('link', { name: /KEF1001/ })).toBeVisible();
  });

  test('fagsiden viser årstimer, vurdering og kompetansemål, merket med målformen læreplanen er fastsatt i', async ({ page }) => {
    await page.goto('./#/fag/HEA2005');
    await expect(page.getByText('197 timer à 60 minutter')).toBeVisible();
    await expect(page.getByText('Felles programfag', { exact: true })).toBeVisible();
    await expect(page.getByText('Fastsatt på bokmål. Teksten fra læreplanen er gjengitt uoversatt.')).toBeVisible();
    await expect(page.locator('.kompetansemaal li').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Læreplanen på udir.no \(KV366\)/ })).toHaveAttribute('href', 'https://www.udir.no/lk20/hea02-04/kompetansemaal-og-vurdering/kv366');
    const underveis = page.getByRole('button', { name: /Underveisvurdering/ });
    await expect(underveis).toHaveAttribute('aria-expanded', 'false');
    await underveis.click();
    await expect(page.locator('.forklaring-innhold p').first()).toBeVisible();
  });

  test('fagarket viser årsramme, og «Regn ut i Arbeidsplan» åpner en ny arbeidsplan med faget (eier 01.10.2026)', async ({ page }) => {
    await page.goto('./#/fag/HEA2005');
    const ramme = page.locator('.egenskaper > div', { hasText: 'Årsramme' });
    await expect(ramme).toContainText('607,5');
    await expect(ramme).toContainText('appens tolkning av vedlegg 1');
    // Delene kan lukkes: kompetansemål og vurdering er åpne, programområdene lukket.
    await expect(page.getByRole('button', { name: /^Kompetansemål og læreplan/ })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: 'Vurderingsordning', exact: true })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: /^Programområder/ })).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('link', { name: 'Om begrepet felles programfag' })).toHaveAttribute('href', '#/begreper/felles-programfag');
    await ramme.getByRole('link', { name: 'Regn ut i Arbeidsplan' }).click();
    await expect(page.locator('main h1')).toHaveText('Arbeidsplan');
    await expect(page.locator('[data-gruppe="1"] .fagvalg')).toContainText('HEA2005');
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('197');
  });

  test('fagarket for yrkesfaglig fordypning forklarer faget og samler programmene', async ({ page }) => {
    await page.goto('./#/fag/YFF4106');
    await expect(page.getByText('Alle yrkesfaglige utdanningsprogram')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Om yrkesfaglig fordypning' })).toBeVisible();
    await expect(page.locator('.merknad')).toContainText('lokale læreplaner');
  });

  test('læreplaner fastsatt på nynorsk vises på nynorsk også når appen er på bokmål', async ({ page }) => {
    await page.goto('./#/fag/AKT2004');
    await expect(page.getByText('Fastsatt på nynorsk.', { exact: false })).toBeVisible();
    await expect(page.locator('main [lang="nn"]').first()).toBeVisible();
  });

  test('appen på nynorsk viser egne tekster på nynorsk og læreplanen uoversatt', async ({ page }) => {
    await settLagret(page, { malform: 'nn' });
    await page.goto('./#/fag/HEA2005');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Helsefremjande arbeid');
    await expect(page.getByText('Fastsett på bokmål. Teksten frå læreplanen er gjengitt utan omsetjing.')).toBeVisible();
    await expect(page.locator('main [lang="nb"]').first()).toBeVisible();
  });

  test('fag kan legges til som favoritt', async ({ page }) => {
    await page.goto('./#/fag/HEA2005');
    await page.getByRole('button', { name: 'Legg til i favoritter: Helsefremmende arbeid' }).click();
    await page.goto('./#/favoritter');
    await expect(page.locator('.favorittliste').getByRole('link', { name: 'Helsefremmende arbeid (HEA2005)' })).toBeVisible();
  });

  test('ukjent fagkode gir en melding', async ({ page }) => {
    await page.goto('./#/fag/FINNES0');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fant ikke faget.');
  });

  test('fagsiden viser fag som brukes sammen og utgåtte koder faget erstatter (VIGO)', async ({ page }) => {
    await page.goto('./#/fag/LBR3018');
    const sammen = page.locator('.egenskaper div', { hasText: 'Brukes sammen med' });
    await expect(sammen.getByRole('link', { name: /LBR3020 Tverrfaglig eksamen landbruk/ })).toBeVisible();
    await page.goto('./#/fag/LBR3012');
    await expect(page.locator('.egenskaper div', { hasText: 'Erstatter' })).toContainText('LBR3004 Traktor og maskiner');
  });

  test('en utgått fagkode viser koden som erstatter den, på fagsiden og i søket', async ({ page }) => {
    await page.goto('./#/fag/LBR3004');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fagkoden LBR3004 er utgått.');
    await page.getByRole('link', { name: /LBR3012/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Maskiner og teknologi i landbruk');
    await page.goto('./#/fag?q=lbr3004');
    await expect(page.locator('[data-erstatning="LBR3004"]').getByRole('link', { name: /LBR3012/ })).toBeVisible();
  });

  test('det samlede søket finner fag på navn og kode', async ({ page }) => {
    await page.goto('./#/sok?q=HEA2005');
    await expect(page.getByRole('link', { name: /Helsefremmende arbeid/ }).first()).toBeVisible();
  });
});
