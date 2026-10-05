// Fylkene (fase 6, pakke 4, avgjørelse 061): fylkessiden under «Oppslag», boksen «Hos fylkeskommunen» i veiviserne,
// de lokale forskriftene for fylket og skolen, og skolens regler på skolekortet.
import { expect, test } from '@playwright/test';
import { aapneAlleSteg, erMobil, settLagret } from './hjelp.ts';

const SKOLE = { id: '974557584', navn: 'Fyllingsdalen videregående skole' };
const POENGSTEG = './#/inntak/rett-inntak-soknad?steg=sk-poeng&svar=norsk.ja.nei.under19.vg1.poeng';

test.describe('fylker', () => {
  test('fra forsiden til fylket brukeren har valgt, og til listen med det fylket øverst', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./');
    // Med valgt fylke går inngangen under «Oppslag» rett til fylket.
    await page.getByRole('link', { name: /^Vestland fylkeskommune/ }).click();
    await expect(page).toHaveURL(/#\/fylker\/46$/);
    await expect(page.locator('main h1')).toHaveText('Vestland fylkeskommune');
    await page.locator('nav').getByRole('link', { name: 'Fylkene' }).click();
    await expect(page.locator('main h1')).toHaveText('Fylkene');
    await expect(page.locator('main .liste .listelenke-tittel').first()).toHaveText('Vestland fylkeskommune');
    await page.getByRole('link', { name: 'Rogaland fylkeskommune' }).click();
    await expect(page).toHaveURL(/#\/fylker\/11$/);
  });

  test('uten valgt fylke går inngangen på forsiden til listen over fylkene', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('link', { name: /^Fylkene/ }).click();
    await expect(page.locator('main h1')).toHaveText('Fylkene');
  });

  test('fylkessiden lenker til fylkets sider og viser fylkets og skolenes forskrifter', async ({ page }) => {
    await settLagret(page, { fylke: '46', skole: SKOLE });
    await page.goto('./#/fylker/46');
    await expect(page.locator('main h1')).toHaveText('Vestland fylkeskommune');
    // Lenkene til fylkets egne sider åpnes i en ny fane.
    const hos = page.locator('[data-rubrikk="fylke-lenker"]');
    await expect(hos.getByRole('link', { name: /Søknad og inntak/ })).toHaveAttribute('target', '_blank');
    await expect(hos.getByRole('link', { name: /Søknad og inntak/ })).toHaveAttribute('href', /^https:\/\//);
    // Fylkets forskrifter og skolen din står åpent, de andre skolenes regler i en lukket gruppe.
    const lokale = page.locator('[data-rubrikk="fylke-lokale"]');
    await expect(lokale.getByRole('link', { name: /^Skoleregler i Vestland/ })).toBeVisible();
    await expect(lokale.getByRole('link', { name: /Fyllingsdalen videregående skole.*Skolen din/ })).toBeVisible();
    const gruppe = lokale.locator('details.fylke-skolegruppe');
    await expect(gruppe).not.toHaveAttribute('open', '');
    await gruppe.locator('summary').click();
    await expect(gruppe.getByRole('link', { name: /Arna vidaregåande skule/ })).toBeVisible();
    await lokale.getByRole('link', { name: /^Skoleregler i Vestland/ }).click();
    await expect(page.locator('main h1')).toHaveText('Skoleregler i Vestland');
  });

  test('et ukjent fylke gir en melding', async ({ page }) => {
    await page.goto('./#/fylker/99');
    await expect(page.getByText('Fant ikke fylket.', { exact: false })).toBeVisible();
  });

  test('boksen «Hos fylkeskommunen» lenker til temaet hos fylket som er valgt', async ({ page }, info) => {
    await settLagret(page, { fylke: '46' });
    await page.goto(POENGSTEG);
    await aapneAlleSteg(page);
    const boks = page.locator('details.hos-fylket').first();
    // Lukket på mobil, åpen på stor skjerm (eier 05.10.2026).
    if (erMobil(info)) {
      await expect(boks).not.toHaveAttribute('open', '');
      await boks.locator('summary').click();
    } else {
      await expect(boks).toHaveAttribute('open', '');
    }
    await expect(boks.locator('summary')).toContainText('Vestland fylkeskommune');
    await expect(boks.getByRole('link', { name: /Søknad og inntak/ })).toHaveAttribute('href', /vestlandfylke\.no/);
    await boks.getByRole('link', { name: 'Alt om Vestland' }).click();
    await expect(page).toHaveURL(/#\/fylker\/46$/);
  });

  test('uten valgt fylke velges fylket i boksen, uten at innstillingen endres', async ({ page }, info) => {
    await page.goto(POENGSTEG);
    await aapneAlleSteg(page);
    const boks = page.locator('details.hos-fylket').first();
    if (erMobil(info)) await boks.locator('summary').click();
    await expect(boks.locator('summary')).toContainText('Hos fylkeskommunen');
    await boks.getByLabel('Vis siden hos').selectOption('11');
    await expect(boks.getByRole('link', { name: /Søknad og inntak|Videregående opplæring/ })).toHaveAttribute('href', /^https:\/\//);
    await page.goto('./#/fylker');
    await expect(page.locator('main .liste .listelenke-tittel').first()).toHaveText('Agder fylkeskommune');
  });

  test('skolekortet lenker til skolens regler', async ({ page }) => {
    await settLagret(page, { fylke: '46', skole: SKOLE });
    await page.goto('./#/opplaeringslop/skoler?fylke=46&q=Fyllingsdalen');
    const kort = page.locator('.skolekort').first();
    await expect(kort.locator('.skolekort-knapp')).toHaveAttribute('aria-expanded', 'true');
    await kort.getByRole('link', { name: 'Skolens regler' }).click();
    await expect(page).toHaveURL(/#\/lov\/fyllingsdalen-videregaende-skole-skoleregler$/);
    await expect(page.getByText('Gjelder bare skolen.', { exact: false })).toBeVisible();
  });
});
