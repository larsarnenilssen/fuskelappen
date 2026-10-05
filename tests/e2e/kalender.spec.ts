// Kalenderen (fase 6, pakke 5, avgjørelse 066): fristene fra alle modulene, filteret i adressen, de gamle adressene
// som sender videre, og gruppen «Neste datoer» på forsiden. Datoene avhenger av dagen testen kjøres, så testene sjekker
// oppsettet og ikke bestemte datoer.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('kalenderen', () => {
  test('fra Inntak til kalenderen filtrert på inntak, med et kort som åpnes', async ({ page }) => {
    await page.goto('./#/inntak');
    await page.locator('.frist-inngang', { hasText: 'Neste frist' }).click();
    await expect(page).toHaveURL(/#\/kalender\?tema=inntak$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kalender');
    await expect(page.locator('.kal-filter summary')).toContainText('Inntak');
    await expect(page.locator('.frist-stripe > li')).toHaveCount(12);
    // Uten valgt fylke er det ingen datoer for fylket.
    await expect(page.locator('.kal-kort-lokal')).toHaveCount(0);
    // Søknadsfristen 1. mars er lukket til den åpnes, og lenker til veiviseren.
    const mars = page.locator('.kal-kort', { hasText: 'Søknadsfrist' }).filter({ hasNotText: 'noen grupper' }).first();
    await expect(mars.locator('.kal-innhold')).toBeHidden();
    await mars.locator('.kal-topp').click();
    await expect(mars.locator('.kal-innhold')).toContainText('første virkedag');
    await expect(mars.locator('.kal-lenker a').first()).toBeVisible();
  });

  test('filteret står i adressen, og datoer uten fast dag vises bare med tema', async ({ page }) => {
    await page.goto('./#/kalender?visning=skolear');
    await expect(page.locator('.kal-uten-dag')).toHaveCount(0);
    await page.locator('.kal-filter summary').click();
    await page.locator('.kal-filter').getByRole('button', { name: 'Inntak', exact: true }).click();
    await expect(page).toHaveURL(/tema=inntak/);
    await expect(page.locator('.kal-uten-dag').first()).toBeVisible();
    await page.locator('.kal-filter').getByRole('button', { name: 'Voksne', exact: true }).click();
    await expect(page).toHaveURL(/vis=voksne/);
    await expect(page.locator('.kal-hele')).toContainText('Voksne søker når som helst');
  });

  test('de gamle adressene sender videre til kalenderen, ferdig filtrert', async ({ page }) => {
    await page.goto('./#/vurdering/eksamen-og-klage?vis=privatister');
    await expect(page).toHaveURL(/#\/kalender\?tema=eksamen&vis=privatister$/);
    await page.goto('./#/inntak/frister?vis=ungdom');
    await expect(page).toHaveURL(/#\/kalender\?tema=inntak&vis=elever$/);
  });

  test('med Vestland valgt kommer fylkets frister med', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/kalender?visning=skolear&tema=inntak&vis=voksne');
    await expect(page.locator('.kal-kort-lokal').first()).toBeVisible();
    await expect(page.locator('.kal-kort-lokal .merke-fylke').first()).toHaveText('Vestland');
    // Lenken til fylkessiden åpner «Hos fylkeskommunen», som ellers er lukket (eier 05.10.2026).
    const kort = page.locator('.kal-kort-lokal').first();
    await kort.locator('.kal-topp').click();
    await kort.locator('.kal-lenker a[href^="#/fylker/46"]').click();
    await expect(page.locator('[data-rubrikk=fylke-lenker] .kortknapp')).toHaveAttribute('aria-expanded', 'true');
  });

  test('neste skoleår kan velges', async ({ page }) => {
    await page.goto('./#/kalender');
    await page.getByText('Skoleåret', { exact: true }).click();
    await expect(page).toHaveURL(/visning=skolear/);
    await page.locator('.kal-skolear button').nth(1).click();
    await expect(page).toHaveURL(/aar=\d{4}/);
    await expect(page.locator('.kal-maned')).toHaveCount(12);
  });
});

test.describe('«Neste datoer» på forsiden', () => {
  test('@mobil lukket med neste dato, åpnes, og kan slås av under «Tilpass»', async ({ page }, info) => {
    test.skip(!info.project.name.includes('mobil'), 'Gruppen er lukket fra start bare på mobil.');
    await page.goto('./');
    const gruppe = page.locator('[data-gruppe="neste"]');
    await expect(gruppe.locator('.gruppe-sammendrag')).toContainText(':');
    await gruppe.locator('.gruppeknapp').click();
    await expect(gruppe.locator('.kal-neste > li')).toHaveCount(4);
    await gruppe.getByRole('link', { name: 'Hele kalenderen' }).click();
    await expect(page).toHaveURL(/#\/kalender$/);
    await page.goto('./');
    await page.getByRole('button', { name: 'Tilpass' }).click();
    await page.getByLabel('Vis «Neste datoer» på forsiden').uncheck();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    await expect(page.locator('[data-gruppe="neste"]')).toHaveCount(0);
  });
});
