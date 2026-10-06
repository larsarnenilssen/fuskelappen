// Skolemiljø (fase 7, avgjørelse 076, 077 og 079): oversikten, siden om kapittel 12 med delene lukket fra start,
// veiviseren for aktivitetsplikten etter rolle, skolereglene for fylket og for privatskoler, og Elevundersøkelsen med
// søk i seriene, «Kort om» og det beste tallet i tabellen.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

const SLATTHAUG = { id: '974557320', navn: 'Slåtthaug videregående skole' };

test.describe('skolemiljø', () => {
  test('oversikten har retten og resultatene øverst, så veiviseren og skolereglene', async ({ page }) => {
    await page.goto('./#/skolemiljo');
    const overskrifter = page.locator('main h2');
    await expect(overskrifter).toHaveText(['Retten og resultatene', 'Veivisere', 'Oppslag']);
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

  test('Elevundersøkelsen: «Kort om» skolen, søk i seriene og det beste tallet i tabellen', async ({ page }) => {
    await settLagret(page, { fylke: '46', skole: SLATTHAUG });
    await page.goto('./#/skolemiljo/elevundersokelsen');
    await expect(page.getByRole('heading', { name: /Kort om Slåtthaug/ })).toBeVisible();
    const serie2 = page.getByRole('combobox', { name: /Serie 2/ });
    await serie2.click();
    await serie2.fill('voss gym');
    await expect(page.getByRole('option')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(serie2).toHaveValue('Voss gymnas');
    await expect(page).toHaveURL(/s=S974557320(%2C|,)S\d+/);
    await page.getByRole('radio', { name: 'Tabell' }).check({ force: true });
    await expect(page.locator('.eu-tabell')).toBeVisible();
    await expect(page.locator('.eu-tabell .eu-beste').first()).toBeVisible();
  });
});
