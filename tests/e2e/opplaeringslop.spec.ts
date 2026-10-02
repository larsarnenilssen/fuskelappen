// Opplæringsløp (pakke 5, avgjørelse 035): program → tilbud → fag og timer, med lenker begge veier og til Vilbli.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('opplæringsløp', () => {
  test('fra forsiden til programmet, tilbudet og fagarket', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('link', { name: /Opplæringsløp/ }).first().click();
    await expect(page.locator('main h1')).toHaveText('Opplæringsløp');
    await page.getByRole('link', { name: /Helse- og oppvekstfag/ }).click();
    await expect(page.locator('main h1')).toHaveText('Helse- og oppvekstfag');
    // Løpet går fra vg1 videre til vg2 og lærefag.
    await expect(page.locator('.lop > li > .tilbudslenke').first()).toContainText('Vg1 Helse- og oppvekstfag');
    await page.locator('.lop-videre .tilbudslenke', { hasText: 'Vg2 Helsearbeiderfag' }).click();
    await expect(page.locator('main h1')).toHaveText('Helsearbeiderfag');
    await expect(page).toHaveURL(/#\/opplaeringslop\/HS\/HSHEA2$/);
    // Felles programfag tas alle, med timene for hvert fag.
    const programfag = page.locator('.tilbud-del[data-kategori="felles_programfag"]');
    await expect(programfag).toContainText('477');
    await expect(programfag).toContainText('HEA2005 Helsefremmende arbeid (197)');
    await expect(programfag).not.toContainText('Velg én');
    await expect(page.locator('.tilbud-sum')).toContainText('982');
    // Lenken til fagarket, og tilbake til tilbudet fra fagarket.
    await programfag.getByRole('link', { name: /HEA2005/ }).click();
    await expect(page.locator('main h1')).toHaveText('Helsefremmende arbeid');
    await page.getByRole('button', { name: /^Programområder/ }).click();
    await page.getByRole('link', { name: /Helsearbeiderfag \(HSHEA2/ }).click();
    await expect(page.locator('main h1')).toHaveText('Helsearbeiderfag');
  });

  test('Vilbli-lenken bruker fylket fra innstillingene, og påbygging står under programmet brukeren kom fra', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/opplaeringslop/HS/HSHEA2');
    await expect(page.getByRole('link', { name: /Skoler og lærebedrifter i Vestland/ })).toHaveAttribute('href', 'https://www.vilbli.no/nb/nb/vestland/helse-og-oppvekstfag/program/v.hs/v.hshea2----/p5');
    await page.locator('.tilbud-lop', { hasText: 'Påbygging' }).getByRole('link').click();
    await expect(page).toHaveURL(/PBPBY3\?via=HSHEA2/);
    await expect(page.locator('main h1')).toHaveText(/påbygging/i);
    await expect(page.getByRole('link', { name: /Skoler og lærebedrifter i Vestland/ })).toHaveAttribute('href', /\/helse-og-oppvekstfag\/program\/v\.hs\/v\.pbpby3----\/p5$/);
  });

  test('lange lister med kryssløp er lukket, og fellesfag med mange valg står i en liste som kan åpnes', async ({ page }) => {
    await page.goto('./#/opplaeringslop/ST/STUSP1');
    const kryss = page.getByRole('button', { name: /^Kryssløp til \(\d+\)/ });
    await expect(kryss).toHaveAttribute('aria-expanded', 'false');
    await kryss.click();
    await expect(page.locator('.tilbud-lop', { hasText: 'Kryssløp til' }).getByRole('link', { name: /Vg2 Helsearbeiderfag/ })).toBeVisible();
    const sprak = page.getByRole('button', { name: /Velg én av \d+/ }).first();
    await expect(sprak).toHaveAttribute('aria-expanded', 'false');
    await sprak.click();
    await expect(page.locator('.tilbud-fagliste').filter({ hasText: 'Fransk' }).first()).toBeVisible();
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
