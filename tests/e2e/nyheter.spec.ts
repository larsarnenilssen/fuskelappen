// Nyhetene (fase 7b, avgjørelse 084): nyhetssiden med filteret i adressen, de siste 30 dagene og «Vis eldre», sakene
// som åpnes med ingress, og visningen «Nyheter» i panelet på forsiden. Nyhetene hentes hver dag, så testene bruker
// faste saker med datoer regnet fra dagen testen kjøres.
import { expect, test, type Page } from '@playwright/test';
import { settLagret } from './hjelp.ts';

const VESTLAND = '46';

/** Datoen for så mange dager siden, YYYY-MM-DD i lokal tid, som appen bruker. */
function dagerSiden(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const to = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${to(d.getMonth() + 1)}-${to(d.getDate())}`;
}

const sak = (kilde: string, tittel: string, dager: number, ekstra: Record<string, string> = {}) => ({
  kilde,
  tittel,
  dato: dagerSiden(dager),
  url: `https://example.org/${kilde}/${dager}`,
  ...ekstra,
});

const NYHETER = {
  skjema: 1,
  hentet: new Date().toISOString(),
  kilder: {
    udir: { status: 'ok' },
    lovdata: { status: 'ok' },
    utdanningsnytt: { status: 'feilet', feilSiden: dagerSiden(3), melding: 'Svarte 503' },
    skolelederforbundet: { status: 'ok' },
    'statsforvalteren-vestland': { status: 'ok' },
    'statsforvalteren-agder': { status: 'ok' },
  },
  saker: [
    sak('udir', 'Testsak fra Udir om eksamen', 0, { ingress: 'Ingressen til testsaken fra Udir.' }),
    sak('statsforvalteren-vestland', 'Testsak fra Statsforvalteren i Vestland', 0),
    sak('statsforvalteren-agder', 'Testsak fra Statsforvalteren i Agder', 1),
    sak('utdanningsnytt', 'Testsak fra Utdanningsnytt', 1, { ingress: 'Ingressen til testsaken fra Utdanningsnytt.' }),
    sak('lovdata', 'Vedtatt endring i testloven', 3, { tittelNn: 'Vedteken endring i testlova' }),
    sak('skolelederforbundet', 'Eldre testsak fra Skolelederforbundet', 40),
  ],
};

async function medNyheter(page: Page, data: unknown | null = NYHETER) {
  await page.route('**/data/nyheter/nyheter.json', (r) => (data === null ? r.fulfill({ status: 404, body: '' }) : r.fulfill({ json: data })));
}

test.describe('nyhetssiden', () => {
  test('de siste 30 dagene per dag, «Vis eldre», og en sak som viser ingressen før den åpnes hos kilden', async ({ page }) => {
    await medNyheter(page);
    await settLagret(page, { fylke: VESTLAND });
    await page.goto('./#/nyheter');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nyheter');
    const saker = page.locator('.nyh-dag .nyh-sak');
    // Statsforvalteren i Agder er ikke med når Vestland er valgt, og saken fra 40 dager siden står under «Vis eldre».
    await expect(saker).toHaveCount(4);
    await expect(page.locator('.nyh-dag h2').first()).toHaveText('I dag');
    await expect(page.locator('.nyh-sak', { hasText: 'Agder' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Vis eldre saker (1)' }).click();
    await expect(saker).toHaveCount(5);
    await expect(page.locator('.nyh-dag').last()).toContainText('Eldre testsak fra Skolelederforbundet');
    // Første trykk viser ingressen, og saken blir en lenke til kilden.
    const udir = page.locator('.nyh-sak', { hasText: 'Testsak fra Udir om eksamen' });
    await expect(udir).toHaveAttribute('aria-expanded', 'false');
    await udir.click();
    const lenke = page.locator('a.nyh-sak', { hasText: 'Testsak fra Udir om eksamen' });
    await expect(lenke.locator('.nyh-ingress')).toHaveText('Ingressen til testsaken fra Udir.');
    await expect(lenke).toHaveAttribute('href', 'https://example.org/udir/0');
    await expect(lenke).toHaveAttribute('target', '_blank');
    await page.getByRole('button', { name: 'Skjul ingressen til «Testsak fra Udir om eksamen»' }).click();
    await expect(page.locator('button.nyh-sak', { hasText: 'Testsak fra Udir om eksamen' })).toBeVisible();
  });

  test('filteret på hvem, fylke og kilde står i adressen, og kildene har status', async ({ page }) => {
    await medNyheter(page);
    await settLagret(page, { fylke: VESTLAND });
    await page.goto('./#/nyheter');
    const saker = page.locator('.nyh-dag .nyh-sak');
    await expect(saker).toHaveCount(4);
    await page.getByLabel('Hvem').selectOption('fagpresse');
    await expect(page).toHaveURL(/hvem=fagpresse/);
    await expect(saker).toHaveCount(1);
    await expect(saker.first()).toContainText('Testsak fra Utdanningsnytt');
    await page.getByLabel('Hvem').selectOption('');
    // Alle fylkene: Statsforvalteren i Agder kommer med, med fullt navn.
    await page.getByLabel('Fylke').selectOption('alle');
    await expect(page).toHaveURL(/fylke=alle/);
    await expect(page.locator('.nyh-sak', { hasText: 'Testsak fra Statsforvalteren i Agder' })).toContainText('Statsforvalteren i Agder');
    await page.getByLabel('Kilde').selectOption('udir');
    await expect(page).toHaveURL(/kilde=udir/);
    await expect(saker).toHaveCount(1);
    // Filteret i adressen gjelder når siden lastes på nytt.
    await page.reload();
    await expect(page.getByLabel('Fylke')).toHaveValue('alle');
    await expect(page.getByLabel('Kilde')).toHaveValue('udir');
    await expect(saker).toHaveCount(1);
    // Kilden som feilet, har en merknad i kildelisten.
    const kildene = page.locator('.nyh-kildeliste');
    if (!(await kildene.isVisible())) await page.getByRole('button', { name: /^Kildene/ }).click();
    await expect(kildene.locator('li', { hasText: 'Utdanningsnytt' })).toContainText('Kunne ikke hentes siden');
  });

  test('nynorsk: sakene appen lager selv, står på nynorsk', async ({ page }) => {
    await medNyheter(page);
    await settLagret(page, { malform: 'nn', fylke: VESTLAND });
    await page.goto('./#/nyheter');
    await expect(page.locator('.nyh-sak', { hasText: 'Vedteken endring i testlova' })).toBeVisible();
    // Kildetitlene står slik kilden skrev dem.
    await expect(page.locator('.nyh-sak', { hasText: 'Testsak fra Udir om eksamen' })).toBeVisible();
  });

  test('melding når nyhetene ikke kan lastes', async ({ page }) => {
    await medNyheter(page, null);
    await page.goto('./#/nyheter');
    await expect(page.getByRole('alert')).toHaveText('Klarte ikke å laste nyhetene.');
  });
});

test.describe('nyhetene på forsiden', () => {
  test('en sak åpnes alene med ingress og lenke til kilden, og filteret huskes', async ({ page }) => {
    await medNyheter(page);
    await settLagret(page, { fylke: VESTLAND, forside: { rekkefolge: [], lukket: [], apnet: ['panel'], bareFavoritter: false, visning: 'nyheter' } });
    await page.goto('./');
    const panel = page.locator('[data-gruppe="panel"]').first();
    await expect(panel.getByRole('button', { name: 'Nyheter', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const saker = panel.locator('.nyh-forside-knapp:visible');
    await expect(saker.first()).toContainText('Testsak fra Udir om eksamen');
    // Bare fylket i innstillingene: ikke Statsforvalteren i Agder.
    await expect(panel.locator('.nyh-forside-knapp')).not.toContainText(['Testsak fra Statsforvalteren i Agder']);
    await saker.first().click();
    await expect(panel.locator('.nyh-forside-tittel')).toHaveText('Testsak fra Udir om eksamen');
    await expect(panel.locator('.nyh-ingress')).toContainText('Ingressen til testsaken fra Udir.');
    await expect(panel.getByRole('link', { name: /Les saken hos Udir/ })).toHaveAttribute('href', 'https://example.org/udir/0');
    await panel.getByRole('button', { name: 'Tilbake til nyhetene' }).click();
    await expect(saker.first()).toBeVisible();
    // Filteret: bare fagpressen, og valget står etter at siden er lastet på nytt.
    await panel.getByLabel('Filtrer nyhetene på hvem eller kilde').selectOption('type:fagpresse');
    await expect(panel.locator('.nyh-forside-knapp')).toHaveCount(1);
    await expect(panel.locator('.nyh-filterknapp-tekst')).toContainText('Fagpresse');
    await page.reload();
    await expect(panel.locator('.nyh-forside-knapp')).toHaveCount(1);
    await expect(panel.locator('.nyh-forside-knapp')).toContainText('Testsak fra Utdanningsnytt');
    await panel.getByRole('link', { name: 'Alle nyhetene' }).click();
    await expect(page).toHaveURL(/#\/nyheter$/);
  });
});
