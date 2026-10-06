import { expect, test } from '@playwright/test';

test.describe('modulregister og søk', () => {
  test('testmodulen dukker opp på forsiden i sin kategori', async ({ page }) => {
    await page.goto('./');
    const kategori = page.locator('[data-kategori="skolemiljo"]');
    await expect(kategori.getByRole('heading', { name: 'Skolemiljø' })).toBeVisible();
    await kategori.getByRole('link', { name: /Testmodul for skolemiljø/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Testmodul for skolemiljø' })).toBeVisible();
  });

  test('innganger merket «flere» står i en boks som er lukket til brukeren åpner den', async ({ page }) => {
    await page.goto('./');
    const kategori = page.locator('[data-kategori="skolemiljo"]');
    const knapp = kategori.getByRole('button', { name: /Flere testfunksjoner/ });
    await expect(knapp).toHaveAttribute('aria-expanded', 'false');
    await expect(kategori.getByRole('link', { name: 'Testkalkulator' })).toBeHidden();
    await knapp.click();
    await expect(kategori.getByRole('link', { name: 'Testkalkulator' })).toBeVisible();
  });

  test('teksten i søkefeltet på forsiden har annen farge enn feltet (0.21.1)', async ({ page }) => {
    await page.goto('./');
    const felt = page.getByRole('searchbox');
    await felt.fill('arbeidstid');
    const { farge, bakgrunn } = await felt.evaluate((e) => ({ farge: getComputedStyle(e).color, bakgrunn: getComputedStyle(e).backgroundColor }));
    expect(farge).not.toBe(bakgrunn);
  });

  test('testmodulen finnes i søket', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('searchbox').fill('testmodul');
    await expect(page.getByRole('link', { name: /Testmodul for skolemiljø/ })).toBeVisible();
  });

  test('«skule» finner innhold skrevet med «skole», og omvendt', async ({ page }) => {
    await page.goto('./#/sok');
    const felt = page.getByRole('searchbox');
    await felt.fill('skulebibliotek');
    // Regelverk har også paragrafer om skolebibliotek, så det er flere treff (0.22.0).
    await expect(page.getByRole('link', { name: /Skolebibliotek/ }).first()).toBeVisible();
    await felt.fill('skoleskyss');
    await expect(page.getByRole('link', { name: /Skuleskyss/ })).toBeVisible();
  });

  test('søketeksten ligger i adressen på søkesiden', async ({ page }) => {
    await page.goto('./#/sok?q=skule');
    await expect(page.getByRole('searchbox')).toHaveValue('skule');
    await expect(page.getByRole('link', { name: /Skuleskyss/ })).toBeVisible();
    await page.getByRole('searchbox').fill('innstillinger');
    await expect(page).toHaveURL(/q=innstillinger/);
    await expect(page.getByRole('link', { name: /Innstillinger/ }).first()).toBeVisible();
  });

  test('søket følger adressen når den endres mens søkesiden er åpen', async ({ page }) => {
    await page.goto('./#/sok?q=skule');
    const felt = page.getByRole('searchbox');
    await expect(page.getByRole('link', { name: /Skuleskyss/ })).toBeVisible();
    // Ny adresse med et annet søk, f.eks. fra adressefeltet eller en lenke.
    await page.evaluate(() => (location.hash = '#/sok?q=innstillinger'));
    await expect(felt).toHaveValue('innstillinger');
    await expect(page.getByRole('link', { name: /Innstillinger/ }).first()).toBeVisible();
    // Også etter at brukeren har skrevet selv: tilbake til det første søket.
    await felt.fill('skolebibliotek');
    // Regelverk har også paragrafer om skolebibliotek, så det er flere treff (0.22.0).
    await expect(page.getByRole('link', { name: /Skolebibliotek/ }).first()).toBeVisible();
    await page.goBack();
    await expect(felt).toHaveValue('skule');
    await expect(page.getByRole('link', { name: /Skuleskyss/ })).toBeVisible();
  });

  test('treffene sier hva de er i appen, og krysset tømmer søket (eier 04.10.2026)', async ({ page }) => {
    await page.goto('./');
    const felt = page.getByRole('searchbox');
    await felt.fill('fraværsgrensen');
    await expect(page.getByRole('link', { name: /^Fraværsgrensen Kalkulator$/ })).toBeVisible();
    await felt.fill('grunnlag for vurdering');
    await expect(page.getByRole('link', { name: /^Grunnlag for vurdering Veiviser$/ })).toBeVisible();
    await page.getByRole('button', { name: 'Tøm søket' }).click();
    await expect(felt).toHaveValue('');
    await expect(felt).toBeFocused();
    await expect(page.locator('.sokeresultater')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Tøm søket' })).toHaveCount(0);
  });

  test('«kalender» gir kalenderen først og så hvert tema, uten doble treff (eier 06.10.2026)', async ({ page }) => {
    await page.goto('./#/sok?q=kalender');
    const treff = page.locator('.sokeboks a');
    await expect(treff.first()).toContainText('Kalender');
    await expect(treff.first()).toContainText('Del av appen');
    await expect(treff.nth(1)).toContainText('Kalender – inntak');
    await expect(page.locator('.sokeboks a', { hasText: /^Kalender(Del av appen)?$/ })).toHaveCount(1);
  });

  test('ingen treff gir melding', async ({ page }) => {
    await page.goto('./#/sok');
    await page.getByRole('searchbox').fill('xqzwvy');
    await expect(page.getByText('Ingen treff på «xqzwvy».')).toBeVisible();
  });

  test('treffene kan filtreres på gruppe, og filteret står når søket endres (avgjørelse 058)', async ({ page }) => {
    await page.goto('./');
    const felt = page.getByRole('searchbox');
    await felt.fill('skule');
    const filtre = page.getByRole('group', { name: 'Vis treff fra' });
    await expect(filtre.getByRole('button', { name: /^Alle \d+$/ })).toHaveAttribute('aria-pressed', 'true');
    const tilbud = filtre.getByRole('button', { name: /^Tilbud og skoler \d+$/ });
    await tilbud.click();
    await expect(tilbud).toHaveAttribute('aria-pressed', 'true');
    const typer = page.locator('.sokeresultater .listelenke-under');
    for (const type of await typer.allTextContents()) expect(['Skole', 'Tilbud']).toContain(type);
    await felt.fill('skulen');
    await expect(tilbud).toHaveAttribute('aria-pressed', 'true');
    const regelverk = filtre.getByRole('button', { name: /^Regelverk \d+$/ });
    await regelverk.click();
    await expect(regelverk).toHaveAttribute('aria-pressed', 'true');
    for (const type of await typer.allTextContents()) expect(type).toBe('Regelverk');
  });
});

test.describe('begrepsbanken', () => {
  test('begrepene kan filtreres på tema, og temaet står i adressen (eier 05.10.2026)', async ({ page }) => {
    await page.goto('./#/begreper');
    // Temaene står lukket til de åpnes, og overskriften viser temaet som er valgt.
    const boks = page.locator('details.begrepsfilter');
    await expect(boks).not.toHaveAttribute('open', '');
    await boks.locator('summary').click();
    const filter = page.getByRole('group', { name: 'Vis begreper om' });
    await expect(filter.getByRole('button', { name: /^Alle/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('link', { name: 'Årsramme', exact: true })).toBeVisible();
    await filter.getByRole('button', { name: /^Vurdering og eksamen/ }).click();
    await expect(page).toHaveURL(/#\/begreper\?tema=vurdering$/);
    await expect(boks.locator('summary')).toHaveText('Tema: Vurdering og eksamen');
    await expect(page.getByRole('link', { name: 'Standpunktkarakter', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Årsramme', exact: true })).toHaveCount(0);
    // Tekstfilteret virker sammen med temaet, og tallene følger teksten.
    await page.getByLabel('Filtrer begreper').fill('eksamen');
    await expect(page).toHaveURL(/tema=vurdering&q=eksamen$/);
    await expect(page.getByRole('link', { name: 'Standpunktkarakter', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Sentralt gitt eksamen', exact: true })).toBeVisible();
    // Adressen gir samme utvalg når siden åpnes på nytt.
    await page.reload();
    await expect(boks.locator('summary')).toHaveText('Tema: Vurdering og eksamen');
    await boks.locator('summary').click();
    await expect(filter.getByRole('button', { name: /^Vurdering og eksamen/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('Filtrer begreper')).toHaveValue('eksamen');
  });
});

