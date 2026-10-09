// Aktivitetsplikt og skoleregler (modulen skolemiljo, fase 7, avgjørelse 076, 079 og 086): oversikten, siden om
// kapittel 12 med delene lukket fra start, veiviseren for aktivitetsplikten etter rolle, og skolereglene for fylket og
// for privatskoler. Elevundersøkelsen står i elevundersokelsen.spec.ts.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('Aktivitetsplikt og skoleregler', () => {
  test('oversikten har retten og pliktene øverst, så skolereglene, og veiviseren til høyre (eier 08.10.2026)', async ({ page }) => {
    await page.goto('./#/skolemiljo');
    // Hver del har én inngang og står derfor uten overskrift, i samme rekkefølge (avgjørelse 100).
    await expect(page.locator('main h2')).toHaveCount(0);
    const innganger = page.locator('main .lop-del a[href]');
    await expect(innganger.nth(0)).toContainText('Et trygt og godt skolemiljø');
    await expect(innganger.nth(1)).toContainText('Skoleregler');
    await expect(page.locator('main .veiviser-inngang').first()).toBeVisible();
    await page.locator('main').getByRole('link', { name: /^Et trygt og godt skolemiljø/ }).click();
    await expect(page.locator('main h1')).toHaveText('Et trygt og godt skolemiljø');
  });

  test('kapittel 12: de fem delene er lukket fra start, åpnes med et trykk og fra adressen', async ({ page }) => {
    await page.goto('./#/skolemiljo/trygt-og-godt-skolemiljo');
    const deler = page.locator('.k12-del-knapp');
    await expect(deler).toHaveCount(5);
    for (const knapp of await deler.all()) await expect(knapp).toHaveAttribute('aria-expanded', 'false');
    await deler.nth(1).click();
    await expect(deler.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.k12-rekke').first().locator('li')).toHaveCount(5);
    await page.goto('./#/skolemiljo/trygt-og-godt-skolemiljo?del=k12-statsforvalteren');
    await page.reload();
    await expect(page.locator('#k12-statsforvalteren .innholdskort-knapp')).toHaveAttribute('aria-expanded', 'true');
  });

  test('aktivitetsplikten: den som arbeider på skolen, melder fra, og rektor går videre til tiltak', async ({ page }) => {
    await page.goto('./#/skolemiljo/aktivitetsplikten');
    await page.getByRole('link', { name: 'Jeg arbeider på skolen og har sett, hørt eller fått vite noe' }).click();
    await page.getByRole('link', { name: /^Jeg mistenker eller vet/ }).click();
    await expect(page.locator('.veiviser-stegtittel').last()).toHaveText('Melde fra til rektor');
    await page.goto('./#/skolemiljo/aktivitetsplikten');
    await page.getByRole('link', { name: /^Jeg er rektor/ }).click();
    // Stegene uten spørsmål står etter hverandre, fra undersøkelsen til evalueringen.
    await expect(page.locator('.veiviser-stegtittel')).toContainText(['Undersøke saken', 'Tiltak og tiltaksplan', 'Dokumentere', 'Følge opp og evaluere']);
  });

  test('skolereglene: fylkets paragrafer med valgt fylke', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/skolemiljo/skoleregler');
    await expect(page.locator('.sr-boks').first()).toBeVisible();
  });

  test('skolereglene: med «Privatskole» står merknaden i stedet for fylkets skoleregler', async ({ page }) => {
    await settLagret(page, { fylke: '46', privatskole: true });
    await page.goto('./#/skolemiljo/skoleregler');
    await expect(page.locator('main h1')).toHaveText('Skoleregler');
    await expect(page.locator('.sr-boks')).toHaveCount(0);
    await expect(page.locator('main p.privatskolemerknad')).toBeVisible();
  });
});
