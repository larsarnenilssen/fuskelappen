import { expect, test, type Page } from '@playwright/test';
import { settLagret } from './hjelp.ts';

function status(kjort: Date, ...statuser: ('ok' | 'endret' | 'feilet')[]) {
  return {
    skjema: 1,
    kjort: kjort.toISOString(),
    kilder: Object.fromEntries(
      statuser.map((s, i) => [
        i === 0 ? 'ks-sfs2213' : 'udir-nsr',
        { status: s, sjekket: kjort.toISOString(), fingeravtrykk: null, endret_siden: null, melding: null },
      ]),
    ),
  };
}

async function medStatus(page: Page, data: unknown | null) {
  await page.route('**/data/status/kildestatus.json', (r) =>
    data === null ? r.fulfill({ status: 404, body: '' }) : r.fulfill({ json: data }),
  );
}

const dagerSiden = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

test.describe('kildestatus', () => {
  test('viser ok når siste kjøring er fersk og alt er i orden', async ({ page }) => {
    await medStatus(page, status(dagerSiden(2), 'ok', 'ok'));
    // Kildestatusen står under Innstillinger (avgjørelse 056).
    await page.goto('./#/innstillinger');
    await expect(page.locator('.indikator')).toHaveAttribute('data-status', 'ok');
  });

  test('viser utdatert når statusfilen er eldre enn 14 dager', async ({ page }) => {
    await medStatus(page, status(dagerSiden(15), 'ok', 'ok'));
    await page.goto('./#/innstillinger');
    const indikator = page.locator('.indikator');
    await expect(indikator).toHaveAttribute('data-status', 'utdatert');
    await expect(indikator).toHaveAccessibleName('Kildestatus: utdatert');
    await indikator.click();
    await expect(page.getByTestId('samlet-kildestatus')).toHaveAttribute('data-status', 'utdatert');
    await expect(page.getByText('Det er mer enn 14 dager siden kildene ble sjekket.', { exact: false })).toBeVisible();
  });

  test('viser endret og feilet', async ({ page }) => {
    await medStatus(page, status(dagerSiden(1), 'endret', 'ok'));
    await page.goto('./#/innstillinger');
    await expect(page.locator('.indikator')).toHaveAttribute('data-status', 'endret');
    await page.unroute('**/data/status/kildestatus.json');
  });

  test('viser ukjent når statusfilen mangler', async ({ page }) => {
    await medStatus(page, null);
    await page.goto('./#/om/kilder');
    await expect(page.getByTestId('samlet-kildestatus')).toHaveAttribute('data-status', 'ukjent');
    await expect(page.getByText('Kildestatus er ikke tilgjengelig akkurat nå.')).toBeVisible();
  });

  test('kildesiden lister kildene fra kilderegisteret', async ({ page }) => {
    await medStatus(page, status(dagerSiden(1), 'ok', 'ok'));
    await page.goto('./#/om/kilder');
    await expect(page.locator('[data-kilde="ks-sfs2213"]')).toContainText('alt i orden');
    await expect(page.locator('[data-kilde="opplaeringslova"]')).toContainText('sjekkes ikke ennå');
  });

  test('varselet kan skjules til neste sjekk og vises igjen', async ({ page }) => {
    await medStatus(page, status(dagerSiden(1), 'feilet', 'ok'));
    const indikator = page.locator('.indikator');
    await page.goto('./#/innstillinger');
    await expect(indikator).toHaveAttribute('data-status', 'feilet');
    await indikator.click();
    await page.getByRole('button', { name: 'Skjul varselet til neste sjekk' }).click();
    await expect(page.getByText('Varselet er skjult på denne enheten til neste kildesjekk.')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Vis varselet igjen' })).toBeVisible();
    await page.goto('./#/innstillinger');
    await expect(indikator).toHaveAttribute('data-status', 'skjult');
    await page.goto('./#/om/kilder');
    await page.getByRole('button', { name: 'Vis varselet igjen' }).click();
    await page.goto('./#/innstillinger');
    await expect(indikator).toHaveAttribute('data-status', 'feilet');
  });

  test('et skjult varsel vises igjen etter ny kjøring', async ({ page }) => {
    const gammel = status(dagerSiden(8), 'feilet', 'ok');
    await settLagret(page, { skjultKildevarsel: `${gammel.kjort}|feilet` });
    await medStatus(page, status(dagerSiden(1), 'feilet', 'ok'));
    await page.goto('./#/innstillinger');
    await expect(page.locator('.indikator')).toHaveAttribute('data-status', 'feilet');
  });

  test('viser neste planlagte sjekk og lenke for eier', async ({ page }) => {
    await medStatus(page, status(dagerSiden(1), 'ok', 'ok'));
    await page.goto('./#/om/kilder');
    await expect(page.getByTestId('neste-kildesjekk')).toContainText(/Neste planlagte sjekk: mandag .* kl\. 0[56]:17\./);
    await expect(page.getByRole('link', { name: 'Kjør kildesjekken på GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/larsarnenilssen/jukselappen/actions/workflows/kilder.yml',
    );
  });
});
