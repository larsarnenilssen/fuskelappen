// Opplæringsløp (pakke 5, avgjørelse 035): program → tilbud → fag og timer, med lenker begge veier og til Vilbli.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('opplæringsløp', () => {
  test('fra forsiden til programmet, tilbudet og fagarket', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('link', { name: /Opplæringsløp/ }).first().click();
    await expect(page.locator('main h1')).toHaveText('Opplæringsløp');
    // Gruppene er lukket fra start (eier 02.10.2026).
    const yrkesfag = page.getByRole('button', { name: /^Yrkesfaglige utdanningsprogram/ });
    await expect(yrkesfag).toHaveAttribute('aria-expanded', 'false');
    await yrkesfag.click();
    await page.getByRole('link', { name: /Helse- og oppvekstfag/ }).click();
    await expect(page.locator('main h1')).toHaveText('Helse- og oppvekstfag');
    // Løpet går fra vg1 videre til vg2 og lærefag. Grenene er lukket til brukeren åpner dem (eier 02.10.2026).
    // Knappen til neste trinn er bunnen av kortet: «Vis 7 tilbud på vg2».
    await expect(page.locator('.lop > li > .lop-kort > .tilbudslenke').first()).toContainText('Vg1 Helse- og oppvekstfag');
    const vg2 = page.locator('.lop > li > .lop-kort > .lop-knapp').first();
    await expect(vg2).toHaveText(/^Vis \d+ tilbud på vg2/);
    await expect(vg2).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.lop-videre .tilbudslenke', { hasText: 'Vg2 Helsearbeiderfag' })).toBeHidden();
    await vg2.click();
    await expect(vg2).toHaveText(/^Skjul tilbudene på vg2/);
    await page.locator('.lop-videre .tilbudslenke', { hasText: 'Vg2 Helsearbeiderfag' }).click();
    await expect(page.locator('main h1')).toHaveText('Helsearbeiderfag');
    await expect(page).toHaveURL(/#\/opplaeringslop\/HS\/HSHEA2$/);
    // Timene totalt, og felles programfag i egen rubrikk med timene for hvert fag og eksamen nederst.
    await expect(page.locator('.tilbud-totalt')).toContainText('982');
    const programfag = page.locator('[data-rubrikk$="-felles_programfag"]');
    await expect(programfag.getByRole('button')).toHaveAccessibleName(/Felles programfag 477 timer/);
    await expect(programfag.locator('.fagrad', { hasText: 'Helsefremmende arbeid' })).toContainText('197');
    await expect(programfag).not.toContainText('Velg');
    // Tverrfaglig eksamen står som dempet rad nederst, med koden.
    await expect(programfag.locator('.fagrad[data-dempet]').last()).toContainText('Tverrfaglig eksamen');
    // Rubrikken kan legges sammen.
    await programfag.getByRole('button').click();
    await expect(programfag.locator('.fagrad').first()).toBeHidden();
    await programfag.getByRole('button').click();
    // Lenken til fagarket ligger i fagnavnet, og fagarket lenker tilbake til tilbudet.
    await programfag.getByRole('link', { name: 'Helsefremmende arbeid' }).click();
    await expect(page.locator('main h1')).toHaveText('Helsefremmende arbeid');
    // Fagarket viser hvordan faget inngår i hvert tilbud, med timene (eier 02.10.2026).
    await page.getByRole('button', { name: /^Inngår i tilbud/ }).click();
    await expect(page.locator('.inngar-liste li', { hasText: 'HSHEA2' })).toContainText('Felles programfag · 197 timer');
    await page.getByRole('link', { name: /Helsearbeiderfag \(HSHEA2/ }).click();
    await expect(page.locator('main h1')).toHaveText('Helsearbeiderfag');
    // Stien tilbake til programmet og oversikten.
    await page.getByRole('navigation', { name: 'Plassering' }).getByRole('link', { name: 'Helse- og oppvekstfag' }).click();
    await expect(page.locator('main h1')).toHaveText('Helse- og oppvekstfag');
  });

  test('fagene i et tilbud kan regnes ut i Arbeidsplan', async ({ page }) => {
    await page.goto('./#/opplaeringslop/HS/HSHEA2');
    await page.getByRole('link', { name: 'Regn ut i Arbeidsplan' }).click();
    await expect(page.locator('main h1')).toHaveText('Arbeidsplan');
    await expect(page.locator('.fagkort', { hasText: 'Helsefremmende arbeid' }).getByLabel('Antall årstimer')).toHaveValue('197');
    await expect(page.locator('.fagkort', { hasText: 'Kroppsøving' })).toHaveCount(1);
  });

  test('Vilbli-lenken bruker fylket fra innstillingene, og påbygging står under programmet brukeren kom fra', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/opplaeringslop/HS/HSHEA2');
    await expect(page.getByRole('link', { name: /Skoler og lærebedrifter i Vestland/ })).toHaveAttribute('href', 'https://www.vilbli.no/nb/nb/vestland/helse-og-oppvekstfag/program/v.hs/v.hshea2----/p5');
    await page.locator('[data-rubrikk$="-pabygging"]').getByRole('link').click();
    await expect(page).toHaveURL(/PBPBY3\?via=HSHEA2/);
    await expect(page.locator('main h1')).toHaveText(/påbygging/i);
    // Tilpassede ordninger: fagene som ikke er med, som kommer til og som har andre timer (eier 02.10.2026).
    await page.getByRole('button', { name: /^Tilpassede ordninger/ }).click();
    const samisk = page.locator('.tilpasning', { hasText: 'Elever med samisk' });
    await expect(samisk.locator('dt')).toHaveText(['Fag som ikke er med', 'Fag som kommer til', 'Andre timer']);
    await expect(samisk).toContainText('Historie: 140 → 113 timer');
    await expect(page.getByRole('link', { name: /Skoler og lærebedrifter i Vestland/ })).toHaveAttribute('href', /\/helse-og-oppvekstfag\/program\/v\.hs\/v\.pbpby3----\/p5$/);
  });

  test('lange lister er lukket, og mange fag å velge blant kan søkes i og står i grupper', async ({ page }) => {
    await page.goto('./#/opplaeringslop/ST/STUSP1');
    const kryss = page.getByRole('button', { name: /^Kryssløp til \d+/ });
    await expect(kryss).toHaveAttribute('aria-expanded', 'false');
    await kryss.click();
    await expect(page.locator('[data-rubrikk$="-kryss"]').getByRole('link', { name: /Vg2 Helsearbeiderfag/ })).toBeVisible();
    const sprak = page.getByRole('button', { name: /^Fremmedspråk · velg én av \d+/ }).first();
    await expect(sprak).toHaveAttribute('aria-expanded', 'false');
    await sprak.click();
    await expect(page.locator('.tilbud-fagliste').filter({ hasText: 'Fransk' }).first()).toBeVisible();

    await page.goto('./#/opplaeringslop/ST/STSSA2');
    const valg = page.locator('[data-rubrikk$="-valgfritt"]');
    await valg.getByRole('button', { name: /^Velg 1 fag · blant \d+ fag/ }).click();
    // Fagene står i grupper etter læreplan, som er lukket til brukeren åpner dem eller søker.
    // Programfag til valg står først i grupper etter programområde i Grep, så etter læreplan.
    const realfag = valg.getByRole('button', { name: /^Realfag \d+ fag/ });
    await expect(realfag).toHaveAttribute('aria-expanded', 'false');
    await realfag.click();
    const gruppe = valg.getByRole('button', { name: /^Matematikk for realfag/ });
    await expect(gruppe).toHaveAttribute('aria-expanded', 'false');
    await valg.getByRole('searchbox').fill('matematikk r1');
    // R1 hører til både realfag og språk, samfunnsfag og økonomi i Grep, og står i begge gruppene.
    await expect(valg.getByRole('link', { name: /Matematikk R1/ })).toHaveCount(2);
    await expect(valg.getByRole('link', { name: /Matematikk R1/ }).first()).toBeVisible();
    await expect(valg.getByRole('link', { name: /Matematikk S1/ })).toHaveCount(0);
  });

  test('oversikten har søk etter tilbud', async ({ page }) => {
    await page.goto('./#/opplaeringslop');
    await page.getByRole('searchbox', { name: /Søk/ }).fill('helsearb');
    await expect(page.locator('main').getByRole('status')).toContainText(/\d+ tilbud/);
    await page.getByRole('link', { name: /Vg2 Helsearbeiderfag/ }).click();
    await expect(page.locator('main h1')).toHaveText('Helsearbeiderfag');
  });

  test('avvik mellom rundskrivet og Grep står som merknad (eier 02.10.2026)', async ({ page }) => {
    await page.goto('./#/opplaeringslop/EL/ELROM3');
    await expect(page.locator('[data-rubrikk$="-felles_programfag"] .tilbud-avvik')).toContainText('Rundskrivet har 925 timer. Fagene i Grep har til sammen 700.');
  });

  test('linjenavnene fra rundskrivet står på nynorsk (eier 02.10.2026)', async ({ page }) => {
    // Målformen settes før siden lastes. En ny adresse med bare annen # laster ikke siden på nytt.
    await settLagret(page, { malform: 'nn' });
    await page.goto('./#/opplaeringslop/ST/STSSA2');
    await expect(page.locator('[data-rubrikk$="-fellesfag"] .fagrad', { hasText: 'Framandspråk' })).toHaveCount(1);
  });

  test('søket finner tilbud', async ({ page }) => {
    await page.goto('./#/sok?q=helsearbeiderfag');
    await expect(page.getByRole('link', { name: /Helsearbeiderfag/ }).first()).toBeVisible();
  });

  test('ukjent tilbud gir en melding', async ({ page }) => {
    await page.goto('./#/opplaeringslop/HS/FINNES');
    await expect(page.locator('main h1')).toHaveText('Fant ikke tilbudet.');
  });
});
