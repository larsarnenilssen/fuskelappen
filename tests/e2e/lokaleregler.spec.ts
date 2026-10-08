// Lokale regler (fase 9, avgjørelse 093): brukeren legger inn en regel for skolen sin, den gjelder med en gang og er
// merket som brukerens egen, og godkjente regler vises for alle som har valgt skolen, med lenken til å endre eller
// melde inn. Bygget med --mode e2e bruker de godkjente reglene i tests/fixtures/lokale/regler.yaml.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

const SLATTHAUG = { id: '974557320', navn: 'Slåtthaug videregående skole' };
const skolen = { fylke: '46', skole: SLATTHAUG };

test.describe('lokale regler', () => {
  test('uten valgt fylke ber skjemaet om fylke først', async ({ page }) => {
    await page.goto('./#/innstillinger/lokal-regel');
    await expect(page.getByText('Velg fylke, og gjerne skole, for å legge inn lokale regler.')).toBeVisible();
  });

  test('en egen verdi gjelder med en gang i kalkulatoren, merket som din egen', async ({ page }) => {
    await settLagret(page, skolen);
    await page.goto('./#/innstillinger/lokal-regel');
    await expect(page.getByRole('heading', { level: 1, name: 'Ny lokal regel' })).toBeVisible();
    // Arbeidstid og planfestet tid er valgt fra start.
    await expect(page.getByRole('radio', { name: 'Arbeidstid', exact: true })).toBeChecked();
    await page.getByLabel('Planfestet arbeidstid per år', { exact: true }).fill('1050');
    await page.getByRole('button', { name: 'Lagre', exact: true }).click();
    await expect(page.getByText('Regelen er lagret og gjelder for deg.')).toBeVisible();

    await page.goto('./#/innstillinger');
    const del = page.getByTestId('lokale-regler');
    await expect(del.getByRole('link', { name: /Planfestet arbeidstid per år.*1 050 timer i stedet for 1 150 timer/ })).toBeVisible();

    await page.goto('./#/arbeidstid/arbeidsplan');
    await expect(page.locator('.fordeling-topp .merke-egen')).toContainText('din egen verdi');
    await expect(page.getByText('Din egen verdi for Slåtthaug videregående skole, ikke kontrollert.')).toBeVisible();
    await expect(page.locator('.fordeling-etikett, .fordeling-del-navn').first()).toBeVisible();
  });

  test('redusert undervisning for kontaktlærer kan oppgis i prosent', async ({ page }) => {
    await settLagret(page, skolen);
    await page.goto('./#/innstillinger/lokal-regel');
    await page.getByRole('radio', { name: /Kontaktlærer: redusert undervisning/ }).check();
    await expect(page.getByRole('radio', { name: 'Prosent' })).toBeChecked();
    await expect(page.getByText(/Nasjonalt: minst 28,5 årsrammetimer, altså 4,69/)).toBeVisible();
    await page.getByLabel('Kontaktlærer: redusert undervisning', { exact: true }).fill('6');
    await expect(page.getByText('= 36,45 årsrammetimer')).toBeVisible();
    await page.getByRole('radio', { name: 'Årsrammetimer' }).check();
    await expect(page.getByLabel('Kontaktlærer: redusert undervisning', { exact: true })).toHaveValue('36,45');
  });

  test('en egen regel på en side står med merket «Din egen», og e-posten har regelen i fast form', async ({ page }) => {
    await settLagret(page, skolen);
    await page.goto('./#/innstillinger/lokal-regel?tema=skoleregler');
    await expect(page.getByRole('radio', { name: 'Skoleregler', exact: true })).toBeChecked();
    await page.getByLabel('Tittel').fill('Mobilen i hylla i timene');
    await page.getByLabel('Regelen med egne ord').fill('Elevene legger mobilen i hylla når timen begynner.');
    await page.getByText('Slik ser e-posten ut').click();
    const epost = page.locator('.lokalregel-epost pre');
    await expect(epost).toContainText('tema: skoleregler');
    await expect(epost).toContainText('skole: "974557320" # Slåtthaug videregående skole');
    await expect(epost).toContainText('tittel: "Mobilen i hylla i timene"');
    await page.getByRole('button', { name: 'Lagre', exact: true }).click();

    await page.goto('./#/skolemiljo/skoleregler');
    const del = page.getByTestId('lokale-regler-side');
    await expect(del.getByRole('heading', { name: 'Lokale regler for Slåtthaug videregående skole' })).toBeVisible();
    await expect(del.locator('.egenregel')).toContainText('Mobilen i hylla i timene');
    await expect(del.locator('.egenregel .merke-egen')).toContainText('Din egen · ikke kontrollert');
  });

  test('«Lagre og meld inn» åpner e-posten og sier at den kan ligge bak nettleseren', async ({ page }) => {
    await settLagret(page, skolen);
    // E-postlenken fanges før nettleseren åpner e-postprogrammet.
    await page.addInitScript(() => {
      document.addEventListener(
        'click',
        (e) => {
          const a = (e.target as Element | null)?.closest?.('a[href^="mailto:"]');
          if (!a) return;
          e.preventDefault();
          (window as unknown as { epost: string }).epost = (a as HTMLAnchorElement).href;
        },
        true,
      );
    });
    await page.goto('./#/innstillinger/lokal-regel?tema=eksamen');
    await page.getByLabel('Tittel').fill('Oppmøte');
    await page.getByLabel('Regelen med egne ord').fill('Elevene møter i kantina.');
    await page.getByRole('button', { name: 'Lagre og meld inn' }).click();
    const boks = page.locator('.lokalregel-sendt');
    await expect(boks).toBeVisible();
    await expect(boks).toBeFocused();
    await expect(boks.getByRole('link', { name: 'Åpne e-posten på nytt' })).toHaveAttribute('href', /^mailto:/);
    const epost = decodeURIComponent(await page.evaluate(() => (window as unknown as { epost: string }).epost));
    expect(epost).toContain('Lokal regel til Jukselappen: Oppmøte');
    expect(epost).toContain('tema: eksamen');
  });

  test('godkjente regler vises for alle som har valgt skolen, med lenken til å endre eller melde inn', async ({ page }) => {
    await settLagret(page, skolen);
    await page.goto('./#/eksamen/regler');
    const del = page.getByTestId('lokale-regler-side');
    await expect(del.locator('.godkjentregel')).toContainText('Oppmøte til skriftlig eksamen');
    await expect(del.locator('.godkjentregel')).toContainText('Kontrollert 3. oktober 2026');
    // En regel uten kontroll publiseres ikke.
    await expect(del).not.toContainText('Ikke kontrollert');
    await expect(del.getByRole('link', { name: 'Endre for deg eller meld inn' })).toHaveAttribute('href', '#/innstillinger/lokal-regel?fra=LR-9HWD');

    // Den godkjente verdien brukes i Arbeidsplan, merket med skolen.
    await page.goto('./#/arbeidstid/arbeidsplan');
    await expect(page.locator('.fordeling-topp [data-niva="skole"]')).toBeVisible();
    await page.locator('.fordeling-visning').getByRole('link', { name: 'Endre for deg eller meld inn' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Endre lokal regel' })).toBeVisible();
    await expect(page.getByText(/Du endrer regelen som er godkjent for Slåtthaug videregående skole/)).toBeVisible();
    await expect(page.getByLabel('Planfestet arbeidstid per år', { exact: true })).toHaveValue('1100');
  });

  test('godkjente regler for en skole vises ikke for andre skoler', async ({ page }) => {
    await settLagret(page, { fylke: '46', skole: { id: '999999999', navn: 'En annen skole' } });
    await page.goto('./#/eksamen/regler');
    await expect(page.getByTestId('lokale-regler-side')).not.toContainText('Oppmøte til skriftlig eksamen');
  });
});
