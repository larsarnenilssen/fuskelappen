// Regelverk (fase 3, avgjørelse 039): lover og forskrifter fra Lovdata, lokale forskrifter for valgt fylke og avtaler
// med egne ord, med søk, rubrikker, bokser og en adresse per paragraf og bestemmelse.
import { expect, test } from '@playwright/test';
import { aapneDel, erMobil, settLagret } from './hjelp.ts';

test.describe('regelverk', () => {
  test('fra forsiden til oversikten med dokumentene i grupper', async ({ page }, info) => {
    await page.goto('./');
    await page.getByRole('link', { name: /^Regelverk/ }).click();
    await expect(page.locator('main h1')).toHaveText('Regelverk');
    const grupper = [/^Lover \d+$/, /^Forskrifter \d+$/, /^Lokale forskrifter$/, /^Avtaler \d+$/];
    if (erMobil(info)) {
      // På mobil er gruppene lukket fra start, så oversikten viser gruppene (eier 09.10.2026).
      for (const navn of grupper) await expect(page.getByRole('button', { name: navn })).toHaveAttribute('aria-expanded', 'false');
      await expect(page.getByRole('link', { name: /Opplæringslova/ })).toBeHidden();
      await page.getByRole('button', { name: /^Lover \d+$/ }).click();
      await page.getByRole('button', { name: /^Lokale forskrifter$/ }).click();
      // Det brukeren åpner, huskes for siden: tilbake fra et dokument er gruppen åpen igjen.
      await page.getByRole('link', { name: /Opplæringslova/ }).click();
      await expect(page.locator('main h1')).toHaveText(/Opplæringslova/);
      await page.goBack();
      await expect(page.getByRole('button', { name: /^Lover \d+$/ })).toHaveAttribute('aria-expanded', 'true');
    } else {
      // På skrivebord står gruppene åpne med overskrift, så dokumentene synes med en gang (avgjørelse 100).
      for (const navn of grupper) await expect(page.getByRole('heading', { level: 2, name: navn })).toBeVisible();
      await expect(page.locator('main').getByRole('button', { name: /^Lover \d+$/ })).toHaveCount(0);
    }
    await expect(page.getByRole('link', { name: /Opplæringslova/ })).toBeVisible();
    // Uten valgt fylke står det hvordan lokale forskrifter vises.
    await expect(page.getByText('Velg fylke for å se lokale forskrifter')).toBeVisible();
  });

  test('en adresse til en paragraf åpner kapitlet og paragrafen, og henvisninger går til appen', async ({ page }) => {
    await page.goto('./#/lov/opplaeringsforskrifta/15-3');
    const knapp = page.getByRole('button', { name: /^§ 15-3 / });
    await expect(knapp).toHaveAttribute('aria-expanded', 'true');
    await expect(knapp).toBeInViewport();
    await page.locator('[data-rubrikk="lov-15-3"]').getByRole('link', { name: '§ 9-3' }).click();
    await expect(page).toHaveURL(/#\/lov\/opplaeringsforskrifta\/9-3$/);
    await expect(page.getByRole('button', { name: /^§ 9-3 / })).toHaveAttribute('aria-expanded', 'true');
  });

  test('søket finner paragrafen med nummeret, og nynorsk tekst med bokmål', async ({ page }) => {
    await page.goto('./#/lov');
    const felt = page.getByRole('searchbox', { name: 'Søk i regelverket' });
    await felt.fill('§ 11-1');
    await expect(page.locator('.lv-treff .listelenke-tittel').first()).toHaveText(/§ 11-1/);
    await felt.fill('individuelt tilrettelagt');
    await expect(page.locator('.lv-treff').getByRole('link', { name: /§ 11-6 Individuelt tilrettelagd opplæring/ })).toBeVisible();
  });

  test('ryddige titler i eldre lover', async ({ page }) => {
    await page.goto('./#/lov/forvaltningsloven/17');
    await expect(page.getByRole('button', { name: /§ 17 Forvaltningsorganets utrednings- og informasjonsplikt$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Kapittel II Om ugildhet/ })).toBeVisible();
  });

  test('lokale forskrifter vises når fylket er valgt, og skolens regler når skolen er valgt', async ({ page }) => {
    await settLagret(page, { fylke: '46', skole: { id: '974557584', navn: 'Fyllingsdalen videregående skole' } });
    await page.goto('./#/lov');
    // Gruppene står åpne på skrivebord (avgjørelse 100) og er lukket på mobil (eier 09.10.2026).
    await expect(page.getByRole('heading', { level: 2, name: /^Lokale forskrifter i Vestland \d+$/ })).toBeVisible();
    await aapneDel(page, /^Lokale forskrifter i Vestland \d+$/);
    await expect(page.getByRole('link', { name: /Fyllingsdalen videregående skole.*Skolen din/ })).toBeVisible();
    // Navnet på de lokale forskriftene følger brukerens målform, og datoen forskriften tok til å gjelde står under.
    const regler = page.getByRole('link', { name: /^Skoleregler i Vestland/ });
    await expect(regler).toContainText('I kraft');
    await regler.click();
    await expect(page.locator('main h1')).toHaveText('Skoleregler i Vestland');
    await expect(page.getByText('Gjelder bare Vestland.', { exact: false })).toBeVisible();
  });

  test('avtalene er skrevet med egne ord, med lenke til punktet i avtalen', async ({ page }) => {
    await page.goto('./#/lov/hovedtariffavtalen/hta-ansettelse');
    await expect(page.locator('main h1')).toHaveText('Hovedtariffavtalen');
    await expect(page.getByText('Bestemmelsene er skrevet med egne ord')).toBeVisible();
    const boks = page.locator('[data-rubrikk="lov-hta-ansettelse"]');
    await expect(boks.getByRole('button', { name: '§ 2 Ansettelse', exact: true })).toHaveAttribute('aria-expanded', 'true');
    // Kildene står som en lukket rad under teksten (avgjørelse 071).
    await boks.locator('.veiviser-kilder:not(.veiviser-regelverk) summary').first().click();
    await expect(boks.getByRole('link', { name: /Kap\. 1 § 2/ })).toHaveAttribute('href', /#page=8$/);
    await boks.getByRole('link', { name: 'arbeidsmiljøloven § 14-3' }).click();
    await expect(page.getByRole('button', { name: /^§ 14-3 / })).toHaveAttribute('aria-expanded', 'true');
  });

  test('kilder til en paragraf hos Lovdata får også en lenke til paragrafen i appen', async ({ page }) => {
    await page.goto('./#/begreper/aktivitetsplikt');
    // Kildene står som en lukket rad nederst i kortet (Kortfot, fase 8b).
    await page.locator('.begrep-kort .veiviser-kilder:not(.veiviser-regelverk) summary').click();
    await page.locator('.kildeliste').getByRole('link', { name: 'Les i appen' }).first().click();
    await expect(page).toHaveURL(/#\/lov\/opplaeringslova\/12-4$/);
  });

  test('ukjent dokument og ukjent paragraf gir melding', async ({ page }) => {
    await page.goto('./#/lov/finnes-ikke');
    await expect(page.getByRole('alert')).toContainText('Fant ikke dokumentet.');
    await page.goto('./#/lov/opplaeringslova/99-9');
    await expect(page.getByRole('alert')).toContainText('Fant ikke § 99-9');
  });
});
